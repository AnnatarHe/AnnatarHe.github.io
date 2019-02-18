---
layout: post
title: Dart VM 简介
tags: code dart flutter
---

> Warning: 本文档还在更新, 有任何问题，建议，bug 请联系 **Vyacheslav Egorov** ( [email](https://mrale.ph/dartvm/me@mrale.ph) 或 [@mraleph](http://twitter.com/mraleph) )，最后更新日期： 2019 年 1 月 06 日

> 目的： 这篇文档是给 Dart VM 组的新人，潜在的外部代码贡献者，或者仅仅是对 VM 感兴趣的朋友参考的。它先从宏观上介绍 Dart VM, 然后详细地解释 VM 中的不同组件。

> 注： VM(Vitrual Machine) 执行 Dart 代码的虚拟机

Dart VM 是一个可以原生执行 Dart 代码的组件集合。主要包括以下几个部分：

* 运行时系统 (Runtime System)
    * 对象模型 (Object Model)
    * 垃圾回收 (Garbage Collection)
    * 快照 (Snapshots)
* 核心库原生方法 (Core libraries native methods)
* 通过 *服务协议* 沟通的开发体验组件(Development Experience components accessible via *service protocol*)
    * 调试 (Debugging)
    * 性能分析 (Profiling)
    * 热重载 (Hot-reload)
* JIT 和 AOT 编译流水线 (Just-in-Time (JIT) and Ahead-of-Time (AOT) compilation pipelines)
* 解释器 (Interpreter)
* ARM 模拟器 (ARM simulators)

"Dart VM" 这个名字有些历史。从某种意义上来说, Dart VM 是一个虚拟机, 它提供一个高级语言的运行环境, 然而这并不意味着在执行 Dart 代码时 Dart 总是被解释或者 JIT 编译过的。例如，Dart 代码可以在 Dart VM AOT 过程中直接被编译成机器码，然后被放到简化版的 Dart VM 中执行，这被称为 *编译前运行时*, 这也就不包含任何编译器组件， 这也使得它有能力异步加载 Dart 源码。

## Dart VM 是如何运行你的代码？

Dart VM 有多种执行你的代码的方式，例如：

* 通过 JIT 从源码或内核二进制中执行
* 通过快照：
    * AOT 快照
    * AppJIT 快照

然而，这些方式之间主要的区别在于虚拟机是在什么时候，如何把 Dart 源码编译成可执行代码的。使运行时环境保持不变

![isolates](https://mrale.ph/dartvm/images/isolates.png)

虚拟机中的任何 Dart 代码都是运行在一些 *独立分区(isolate)* 中，它可以被很好地解释为有着自己的内存(*heap*) 通常还带着自己的控制线程(mutator thread) 的独立 Dart 宇宙。它可以并行地执行许多块独立分区的 Dart 代码，只是不能直接分享任何状态，仅可以通过 *端口(prots)*(不要和网络端口搞混了) 进行消息传递来沟通。

系统线程和独立分区之间的关系有些模糊而且高度依赖于虚拟机是如何被集成进应用中的。只有以下几点可以保证。

* 一条一同线程在同一时刻只能进入一块分区。如果想要进入其他分区，需要先从当前分区退出。
* 独立分区在同一时刻只能和一条 *mutator* 线程产生联系。 Mutator 线程是一个执行 Dart 代码和使用虚拟机开放的 C 接口的线程。

然而同样的一条操作系统线程可以先进入一个分区，执行 Dart 代码，离开当前分区再进入另一个分区。通过不同的操作系统线程进入分区，执行 Dart 代码来替代掉。而不是同时。 // TODO

在分区中的一条 mutator 线程可以连接到多个辅助线程上，例如：

* 后台 JIT 编译器线程
* GC 清理线程
* 并发的 GC 标记线程

虚拟机内部使用线程池([ThreadPool](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/thread_pool.h#L14))去管理系统线程, 代码被 [ThreadPool::Task](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/thread_pool.h#L17) 这样的概念所结构化，而不是一条系统线程。例如：并不是从一条线程中 spawn 出一条去执行后台清理工作， 而是在 GC VM 发布一条 [SweeperTask](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/heap/sweeper.cc#L100) 任务到全局 VM 线程池，然后线程池选一个空闲线程，或者是 spawn 一条新的线程。 相似的是对独立消息处理的事件循环的默认实现并没有真的 spawn 一条新的事件循环，而是发一条 [MessageHandlerTask](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/message_handler.cc#L19) 到线程池，无论新消息什么时候到达 // TODO

> 源码导读： Class [Isolate](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/isolate.h#L151) 代表一个单独做用户，Class [Heap](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/heap/heap.h#L28) —— 作用域的堆. Class [Thread](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/thread.h#L204) 解释了线程挂载到独立作用域中它们的状态联系。需要注意的是 **Thread** 这个名字有时候可能会有些困惑，由于所有的系统线程都是作为 mutator 挂载到同一个作用域中的，它会重复使用同一个线程实例。 可以查看 [Dart_RunLoop](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/dart_api_impl.cc#L1586) 和 [MessageHandler](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/message_handler.h#L17) 了解独立作用于消息传递的默认实现

## 1. 源码 JIT 运行

这个部分会试着解释当你试着从命令行执行 Dart 代码发生的全过程：

{% highlight dart %}
// hello.dart
main() => print('Hello, World!');
{% endhighlight %}

{% highlight bash %}
$ dart hello.dart
Hello, World!
{% endhighlight %}

从 Dart 2 开始，VM 就不在具有直接从文字源码中直接执行的能力，而是 VM 期望被给到一份 *内核二进制(Kernel binaries)* (也被称为 *dill files*)， 它包含了序列化后的 [Kernel ASTs](https://github.com/dart-lang/sdk/blob/master/pkg/kernel/README.md)。这个把 Dart 源码翻译成 Kernel AST 的任务是由 [common front-end(CFE)](https://github.com/dart-lang/sdk/tree/master/pkg/front_end) 处理，它由 Dart 编写，在不同的 Dart 工具链中共享 (例如： VM, dart2js, Dart Dev Compiler)。

![dart cfe process](https://mrale.ph/dartvm/images/dart-to-kernel.png)

为了保障直接从源码通过独立 **Dart** 命令执行的便捷性。Dart 也执行了一个辅助独立服务，叫做 *kernel service*，他控制了把 Dart 源码编译到内核代码，然后 VM 就直接执行内核二进制。

![kernel-service](https://mrale.ph/dartvm/images/kernel-service.png)

然而，这个步骤并不是唯一从 CFE 到 VM 执行 Dart 代码的方式。例如，Flutter 完全分离了 *编译(compilation)* 到 *内核(kernel)* 以及 *从内核执行(execution from Kernel)* 的步骤，放到了不同的设备中：开发机器负责编译，目标移动设备则负责执行，通过 *flutter* 工具发送接收内核二进制文件。

![flutter kernel to device](https://mrale.ph/dartvm/images/flutter-cfe.png)

需要注意的是，flutter 工具并没有自己处理从 Dart 代码编译的过程，而是开辟了一条固定线程 *frontend_server*, 它是 CFEE 的简单包装，附带了简单的 Flutter 特殊的 Kernel-to-Kernel 转换。 *frontend_server* 编译 Dart 源码到内核文件，flutter 工具随后把它转发给设备。常驻的 *frontend_server* 进城是为了可以执行开发者们要求的 *hot reload* 功能：这种情况下， *frontend_server* 可以从前一个编译中重用 CFE 状态，然后只编译那些变化的部分。

一旦内核二进制被加载到 VM 中, 它就会被解析，创建出多个对象代表着不同的程序实例。然而它是懒执行的：首先只有关于库和类的基本信息被加载。每个从内核二进制中整理出来的实体都有一个指回二进制的指针，这样可以在后面需要的时候再加载。

> 在VM 内部申请的特殊对象结构中，我们使用了 Raw... 这样的前缀。以下的是 VM 控制的命名变化：VM 内部的对象结构是通过 C++ 类定义的，名字从 **Raw** 开头，头文件在 *raw_object.h* 中。例如 **RawClass** 是一个 VM 对象，代表着 Dart 的类，**RawField** 是一个 VM 对象，表达了 Dart 类中的 Dart 字段(field)，等等... 我们会在 section covering runtime system 和对象模型中把它返回出来

![kernel-loaded-1](https://mrale.ph/dartvm/images/kernel-loaded-1.png)

类的全部信息只在运行时(runtime)需要的时候被反序列化出来(例如：遍历类成员，创建新实例)。在这个部分，类成员从内核二进制中被读取出来。然而，完整的方法体在这个阶段没有被反序列化出来，只有它们的签名。

![kernel-loaded-2](https://mrale.ph/dartvm/images/kernel-loaded-2.png)

在这个时刻，从运行时加载的内核二进制带有足够的信息解析并执行方法。例如，它可以从库文件中解析并执行 main 方法。

> 源码导读：[package:kernel/ast.dart](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/kernel/lib/ast.dart) 定义了解释 Kernel AST 的类。 [package:front_end](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/front_end) 控制着从 Dart 源码编译到 Kernel AST 的过程。[kernel::KernelLoader::LoadEntireProgram](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/kernel_loader.cc#L211)是解析 Kernel AST 到对应的 VM 对象的入口. [pkg/vm/bin/kernel_service.dart](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/vm/bin/kernel_service.dart)实现了独立内核服务(Kernel Service isolate), [runtime/vm/kernel_isolate.cc](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/kernel_isolate.cc) 的实现黏合了 VM 的剩余部分的 Dart 代码。[package:vm](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/vm)包含了大多数基于内核的 VM 所需要的功能，例如 Kernel-to-Kernel 的多种转换器。此外，由于历史包袱，还有一些 VM 特殊转换器仍然存在于 [package:kernel](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/kernel) 中，一个好的复杂转换器的例子是 [package:kernel/transformations/continuation.dart](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/kernel/lib/transformations/continuation.dart) 它解析了语法糖： async, async* 和 sync*

> 试一试：如果你对内核格式和 VM 的特殊用法感兴趣，可以使用 [pkg/vm/bin/gen_kernel.dart](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/vm/bin/gen_kernel.dart) 从 Dart 源码中产出一个内核二进制(Kernel binary)，这个结果二进制可以被 [pkg/vm/bin/dump_kernel.dart](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/vm/bin/dump_kernel.dart) 解码
> 
> {% highlight bash %}
> # 使用 CFE 把 hello.dart 编译成 hello.dill 内核二进制
> $ dart pkg/vm/bin/gen_kernel.dart                        \
>       --platform out/ReleaseX64/vm_platform_strong.dill \
>       -o hello.dill                                     \
>       hello.dart
>
> # 导出文本形式的内核 AST
> $ dart pkg/vm/bin/dump_kernel.dart hello.dill hello.kernel.txt
> {% endhighlight %}
>
> 当你尝试使用 *gen_kernel.dart* 你会注意到它包含了一些称为 *platform* 的东西，一个内核二进制包含了所有核心库(dart:core, dart:async 等)的 AST。如果你有配置过并安装的 Dart SDK，你就可以只用 *out* 文件夹里对应的平台文件，例如, *out/ReleaseX64/vm_platform_strong.dill*，或者你也可以用 [pkg/front_end/tool/\_fasta/compile_platform.dart](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/front_end/tool/_fasta/compile_platform.dart) 去产出平台文件。
>
> {% highlight bash %}
> $ dart pkg/front_end/tool/\_fasta/compile_platform.dart \
>       dart:core                                       \
>       sdk/lib/libraries.json                          \
>       vm_outline.dill vm_platform.dill vm_outline.dill
> {% endhighlight %}

最开始，所有的方法没有真正的执行体代码，而只是占位符：它们指向一个 *LazyCompileStub*，它只是简单地让运行时系统去为当前函数创建可执行代码，最后调用新生成的代码。

![LazyCompileStub](https://mrale.ph/dartvm/images/raw-function-lazy-compile.png)

如果方法是第一次被编译的，他是通过 *非优化编译器(unoptimizing compiler)* 完成的。

![unoptimizing compiler](https://mrale.ph/dartvm/images/unoptimized-compilation.png)

非优化编译器产出机器码需要两个步骤：

1. 为函数体序列化出 AST, 产出一份 *控制流程图 (control flow graph)*(**CFG**). CFG 用 *中间语言指令(intermediate language)*(**IL**) 填充掉基本块(block)。在这个阶段的 IL 指令像是基于虚拟机的栈指令：从栈中拿出运算单元，执行操作，然后把结果推到相同的栈里。

> 实际中并不是所有的函数都有真实的 Dart/Kernel AST 函数体，例如，定义在 C++ 中的原生方法或者是被 Dart VM 生成的人造辅助方法 —— 在这种情况下，IL只是造个空的，而不是从内核 AST 中生成。

2. 产出的 CFG 直接被编译成机器码，使用一对多的低级 IL 指令：每一条 IL 指令拓展成多个机器语言指令。

这个阶段没有优化操作。非优化编译器的主要任务只是尽快生成可执行代码。

这也意味着非优化编译器并不会去试图静态化解析任何未被内核二进制解析的部分。




