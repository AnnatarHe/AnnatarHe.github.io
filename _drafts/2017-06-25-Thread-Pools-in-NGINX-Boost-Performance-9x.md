---
layout: post
title: nginx 中的线程池使得性能提升 9 倍
tags: nginx be back end server
---

众所周知，Nginx 使用 [异步, 事件驱动来接收连接](http://nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/)。这就意味着对于每个请求不会新建一个专用的进程或者线程（就像传统服务端架构一样），它是在一个工作进程中接收多个连接和请求。为了达成这个目标，Nginx 用在一个非阻塞模式下的 sockets 来实现，并使用例如 [epoll](http://man7.org/linux/man-pages/man7/epoll.7.html) 和 [kqueue](https://www.freebsd.org/cgi/man.cgi?query=kqueue) 这样高效的方法。

因为满载的工作进程数量是很少的(通常只有一个 CPU 内核)而且固定的，更少的内存占用，CPU 轮训也不会浪费在任务切换上。这种连接方式的优秀之处已众所周知地被 Nginx 自身所证实。它非常成功地接受了百万量级的并发请求。

![traditional-server-vs-nginx-worker](https://cdn.wp.nginx.com/wp-content/uploads/2015/06/Traditional-Server-and-NGINX-Worker.png)

**每个进程都消耗额外的内存，并且每个切换都消耗 CPU 切换和缓存清理**

但是异步，事件驱动连接依旧有一个问题。或者，我喜欢称它为“敌人”。这个敌人的名字叫：阻塞。不幸的是许多第三方模块使用阻塞调用，而且用户（有时候也有模块的开发者自己）并没有意识到有什么不妥之处。阻塞操作可以毁了 Nginx 的性能，必须要避免这样的代价。

甚至在当前的 Nginx 官方代码中在每种情况中避免阻塞调用也是不可能的，为了解决这个问题，新的线程池装置已经在 [Nginx 的1.7.11](http://hg.nginx.org/nginx/rev/466bd63b63d1) 和 [Nginx Plus Release 7](https://www.nginx.com/blog/nginx-plus-r7-released/#thread-pools) 中实现。它是什么，如何使用，我们一会儿再介绍，现在我们来直面我们的敌人。

**编者：如果需要了解一下 Nginx Plus R7，请看我们博客中的[Announcing Nginx Plus R7](https://www.nginx.com/blog/nginx-plus-r7-released/)**

**需要了解 Nginx Plus R7 里的新特性，请看这些相关文章**

* [HTTP/2 Now Fully Supported in NGINX Plus](https://www.nginx.com/blog/http2-r7/)
* [Socket Sharding in NGINX](https://www.nginx.com/blog/socket-sharding-nginx-release-1-9-1/)
* [The New NGINX Plus Dashboard in Release 7](https://www.nginx.com/blog/dashboard-r7/)
* [TCP Load Balancing in NGINX Plus R7](https://www.nginx.com/blog/tcp-load-balancing-r7/)

## 这个问题

首先，为了更好地理解问题所在，我们需要用简单的话解释一下 Nginx 如何工作的。

通常来说，Nginx 是一个事件处理器，一个从内核中接受所有连接时发生的事件信息，然后给出对应的操作到操作系统中，告诉它应该做什么。事实上，Nginx 在操作系统进行常规的读写字节的时候，通过调度操作系统把所有难做的工作都做了。因此，Nginx 及时，快速的返回响应是非常重要的。

![Nginx-event-loop](https://cdn.wp.nginx.com/wp-content/uploads/2015/06/NGINX-Event-Loop2-e1434744201287.png)

**工作进程从内核中监听并执行事件**

这些事件可以是超时，提示说可以从 sockets 里面读数据或写数据，或者是一个错误被触发了。Nginx 接收一堆事件然后一个个执行，做出必要的操作。这样所有的过程都在一个线程中通过一个简单的循环队列完成。Nginx 从一个队列中推出一个事件
然后响应它，例如读写 socket 数据。在大多数情况下，这一过程非常的快(或许只是需要很少的 CPU 轮询从内存中拷贝一些数据)而且 Nginx 继续执行队列中的所有事件非常的快。

![the-events-queue-processing-cycle](https://cdn.wp.nginx.com/wp-content/uploads/2015/06/Events-Queue-Processing-Cycle.png)

**所有的过程都在一个线程中的一个简单循环中完成**

但是如果某个耗时而且重量级的操作被触发了会发生什么呢？整个事件循环系统会有一个很扯淡的等待时间，直到这个操作完成。

所以，我们说的“一个阻塞操作”的意思是任何一个会占用大量时间，使接收事件的循环暂停的操作。操作可以因为很多原因被阻塞。例如，Nginx 或许会因为长时间的 CPU 密集型操作而忙碌，或者是不得不等待一个资源访问(如硬盘访问，或者一个互斥的或函数库从数据库里用同步操作的方式获取返回这种)。关键是当做这些操作的时候，子进程无法做其他任何事情，也不能接收其他的事件响应，即使是有很多的系统资源是空闲的，而且一些队列里的事件可以利用这些空闲资源的时候。

想象一下，一个店里的销售人员面对着一个长长的队列，队列里的第一个人跟你要不在店里，而是在仓库里的东西🙃。这个销售人员得跑去仓库提货。现在整个队列一定是因为这次提货等了好几个小时，而且队列里的每个人都很不开心。你能想象一下队列里的人会做出什么反应么？在这等待的这几个小时里面，队列中等待的人在增加，每个人都等着很可能就在店里面的想要的东西（而不是仓库里的）

![Everyone in the queue has to wait for the first person's order](https://cdn.wp.nginx.com/wp-content/uploads/2015/06/Faraway-Warehouse1.png)

**队列中的每个人都在等在第一个人的订单完成**

Nginx 里面所发生的事情跟这个情况是很相似的。当读取一个并不在内存中缓存，而是在硬盘中的文件的时候。硬盘是很慢的（尤其是正在转的那个），而其他的在队列中的请求可能并不需要访问硬盘，结果他们不得不等待。结果是延迟在增加，但是系统资源并没有满负荷。

![Just one blocking operation can delay all following operations for a significant time](https://cdn.wp.nginx.com/wp-content/uploads/2015/06/Blocking-Operation-e1434743587684.png)

**Just one blocking operation can delay all following operations for a significant time**

一些操作系统提供了一个异步接口去读取和发送文件，Nginx 使用了这个接口（详情查看[aio](http://nginx.org/en/docs/http/ngx_http_core_module.html#aio)指令。这里有个很好的例子就是 FreeBSD，不幸的是，我们不能保证所有的 Linux 都是一样的。尽管 Linux 提供了一种读取文件的异步接口，然而仍然有一些重要的缺点。其中一个就是文件和缓冲区访问的对齐问题，而 Nginx 就能很好地处理。第二个问题就很严重了。异步接口需要 *O_DIRECT* 标志被设置在文件描述中。这就意味着任意访问这个文件都会通过内存缓存，并增加硬盘的负载。在大多数情况下这并不能提升性能。

为了着重解决这些问题，在 Nginx 1.7.11 和 Nginx Plus Release 7 中加入了线程池。

现在让我们深入介绍一些线程池是什么，它是如何工作的。

## 线程池

现在我们重新扮演那个可怜的要从很远的仓库提货的售货员。但是现在他变聪明了(或者是因为被一群愤怒的客户揍了一顿之后变聪明了？)并且招聘了一个快递服务。现在有人要远在仓库的产品的时候，他不需要自己跑去仓库提货了，他只需要扔个订单给快递服务，快递会处理这个订单，而售货员则继续服务其他客户。只有那些需要需要远在仓库的产品的客户需要等待递送，其他人则可以立即得到服务。

![Passing an order to the delivery service unblocks the queue](https://cdn.wp.nginx.com/wp-content/uploads/2015/06/Your-Order-Next1.png)

**Passing an order to the delivery service unblocks the queue**

在这个方面，Nginx 的线程池就是做物流服务的，它由一个任务队列和很多处理队列的线程组成。当一个 worker 要做一个耗时很长的操作的时候，它不需要自己去处理这个操作，而是把这个任务发到线程队列中，当有空闲的线程的时候它会被拿出来去处理。

![The worker process offloads blocking operations to the thread pool](https://cdn-1.wp.nginx.com/wp-content/uploads/2016/07/thread-pools-worker-process-event-cycle.png)

**The worker process offloads blocking operations to the thread pool**

















