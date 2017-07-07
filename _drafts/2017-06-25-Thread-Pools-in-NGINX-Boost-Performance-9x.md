---
layout: post
title: nginx 中的线程池使得性能提升 9 倍
tags: nginx be back end server
---

众所周知，Nginx 使用 [异步, 事件驱动来接收连接](http://nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/)。这就意味着对于每个请求不会新建一个专用的进程或者线程（就像传统服务端架构一样），它是在一个工作进程中接收多个连接和请求。为了达成这个目标，Nginx 用在一个非阻塞模式下的 sockets 来实现，并使用例如 [epoll](http://man7.org/linux/man-pages/man7/epoll.7.html) 和 [kqueue](https://www.freebsd.org/cgi/man.cgi?query=kqueue) 这样高效的方法。

因为满载的工作进程数量是很少的(通常只有一个 CPU 内核)而且固定的，更少的内存占用，CPU 轮训也不会浪费在任务切换上。这种连接方式的优秀之处已众所周知地被 Nginx 自身所证实。它非常成功地接受了百万量级的并发请求。

![traditional-server-vs-nginx-worker]()

**每个进程都消耗额外的内存，并且每个切换都消耗 CPU 切换和缓存清理**

但是异步，事件驱动连接依旧有一个问题。或者，我喜欢称它为“敌人”。这个敌人的名字叫：阻塞。不幸的是许多第三方模块使用阻塞调用，而且用户（有时候也有模块的开发者自己）并没有意识到有什么不妥之处。阻塞操作可以毁了 Nginx 的性能，必须要避免这样的代价。

甚至在当前的 Nginx 官方代码中在每种情况中避免阻塞调用也是不可能的，为了解决这个问题，新的线程池装置已经在 [Nginx 的1.7.11]() 和 [Nginx Plus Release 7]() 中实现。它是什么，如何使用，我们一会儿再介绍，现在我们来直面我们的敌人。

**编者：如果需要了解一下 Nginx Plus R7，请看我们博客中的[Announcing Nginx Plus R7]()**

**需要了解 Nginx Plus R7 里的新特性，请看这些相关文章**

* [HTTP/2 Now Fully Supported in NGINX Plus]()
* [Socket Sharding in NGINX]()
* [The New NGINX Plus Dashboard in Release 7]()
* [TCP Load Balancing in NGINX Plus R7]()

## 这个问题

首先，为了更好地理解问题所在，我们需要用简单的话解释一下 Nginx 如何工作的。

通常来说，Nginx 是一个事件处理器，一个从内核中接受所有连接时发生的事件信息，然后给出对应的操作到操作系统中，告诉它应该做什么。事实上，Nginx 在操作系统进行常规的读写字节的时候，通过调度操作系统把所有难做的工作都做了。因此，Nginx 及时，快速的返回响应是非常重要的。

![Nginx-event-loop]()

**工作进程从内核中监听并执行事件**

这些事件可以是超时，提示说可以从 sockets 里面读数据或写数据，或者是一个错误被触发了。Nginx 接收一堆事件然后一个个执行，做出必要的操作。这样所有的过程都在一个线程中通过一个简单的循环队列完成。Nginx 从一个队列中推出一个事件
然后响应它，例如读写 socket 数据。在大多数情况下，这一过程非常的快(或许只是需要很少的 CPU 轮询从内存中拷贝一些数据)而且 Nginx 继续执行队列中的所有事件非常的快。

![the-events-queue-processing-cycle]()

**所有的过程都在一个线程中的一个简单循环中完成**

但是如果某个耗时而且重量级的操作被触发了会发生什么呢？整个事件循环系统会有一个很扯淡的等待时间，直到这个操作完成。

所以，我们说的“一个阻塞操作”的意思是任何一个会占用大量时间，使接收事件的循环暂停的操作。操作可以因为很多原因被阻塞。例如，Nginx 或许会因为长时间的 CPU 密集型操作而忙碌，或者是不得不等待一个资源访问-



















