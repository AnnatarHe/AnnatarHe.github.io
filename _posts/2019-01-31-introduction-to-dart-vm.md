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

# Dart VM 是如何运行你的代码？

Dart VM 有多种执行你的代码的方式，例如：

* 通过 JIT 从源码或内核二进制中执行
* 通过快照：
    * AOT 快照
    * AppJIT 快照

然而，这些方式之间主要的区别在于虚拟机是在什么时候，如何把 Dart 源码编译成可执行代码的。使运行时环境保持不变

![isolates](https://mrale.ph/dartvm/images/isolates.png)

虚拟机中的任何 Dart 代码都是运行在一些 *独立分区(isolate)* 中，它可以被很好地解释为有着自己的堆(*heap*) 通常还带着自己的控制线程(mutator thread) 的独立 Dart 宇宙。它可以并行地执行许多块独立分区的 Dart 代码，只是不能直接分享任何状态，仅可以通过 *端口(prots)*(不要和网络端口搞混了) 进行消息传递来沟通。

系统线程和独立分区之间的关系有些模糊而且高度依赖于虚拟机是如何被集成进应用中的。只有以下几点可以保证。

* 一条一同线程在同一时刻只能进入一块分区。如果想要进入其他分区，需要先从当前分区退出。
* 独立分区在同一时刻只能和一条 *mutator* 线程产生联系。 Mutator 线程是一个执行 Dart 代码和使用虚拟机开放的 C 接口的线程。

然而同样的一条操作系统线程可以先进入一个分区，执行 Dart 代码，离开当前分区再进入另一个分区。另外不同的操作系统线程可以进入分区，在其中执行 Dart 代码, 而不是同步的。

在分区中的一条 mutator 线程可以连接到多个辅助线程上，例如：

* 后台 JIT 编译器线程
* GC 清理线程
* 并发的 GC 标记线程

虚拟机内部使用线程池([ThreadPool](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/thread_pool.h#L14))去管理系统线程, 代码被 [ThreadPool::Task](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/thread_pool.h#L17) 这样的概念所结构化，而不是一条系统线程。例如：并不是从一条线程中 spawn 出一条去执行后台清理工作， 而是在 GC VM 发布一条 [SweeperTask](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/heap/sweeper.cc#L100) 任务到全局 VM 线程池，然后线程池选一个空闲线程，或者是 spawn 一条新的线程。 相似的是对独立消息处理的事件循环的默认实现并没有真的 spawn 一条新的事件循环，而是发一条 [MessageHandlerTask](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/message_handler.cc#L19) 到线程池，无论新消息什么时候到达

> 源码导读： Class [Isolate](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/isolate.h#L151) 代表一个单独做用户，Class [Heap](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/heap/heap.h#L28) —— 作用域的堆. Class [Thread](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/thread.h#L204) 解释了线程挂载到独立作用域中它们的状态联系。需要注意的是 **Thread** 这个名字有时候可能会有些困惑，由于所有的系统线程都是作为 mutator 挂载到同一个作用域中的，它会重复使用同一个线程实例。 可以查看 [Dart_RunLoop](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/dart_api_impl.cc#L1586) 和 [MessageHandler](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/message_handler.h#L17) 了解独立作用于消息传递的默认实现

## 源码 JIT 运行

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

这也意味着非优化编译器并不会去试图静态化解析任何未被内核二进制解析的部分。所以如果调用是完全异步的，那么它会被编译(MethodInvocation 或者 PropertyGet AST 节点)。VM 在当前阶段并没有使用任何基于派发(dispatch)的 virtual table 或者 interface table 形式而是用 [inline caching](https://en.wikipedia.org/wiki/Inline_caching) 实现异步调用。

inline caching 背后的核心思想是缓存方法的结果在一个特殊调用缓存的区域。inline caching 机制被用于 VM 常量。

> 最初的 inline caching 实现只是在原生代码的方法中加段代码 —— 所以被命名为 **inline** caching. inline caching 的思想可以追溯到 Smalltalk - 80, 详情查看： [Efficient implementation of the Smalltalk-80 system](https://dl.acm.org/citation.cfm?id=800542)

* 一个特殊调用缓存(RawICData 对象)会映射 class 到一个方法上, 如果接收者匹配到了一个 class 它就会被调用。这个缓存保存了一些辅助信息，例如调用次数，它会追踪给出的 class 在缓存站中有多常用。

* 一个实现了方法调用快速通道的公用检索桩。这个桩会搜索给出的缓存，去查看其中是否匹配保存了一个接受 class 的入口。如果入口被找到了，那么这个桩就会增加调用次数，然后尾调用缓存方法。否则，这个桩会触发一个实现了方法内容的逻辑的运行时系统辅助。如果方法成功调用，那么缓存会被更新，那么随后的调用就不需要再进入运行时了

下面的图片展示了和 `animal.toFace()` 关联的内联缓存的结构和状态的调用。它被作为 `Dog` 实例调用两次，一次作为 `Cat`.

![inline caching](https://mrale.ph/dartvm/images/inline-cache-1.png)

无优化编译器自身会充分执行任何可能存在的 Dart 代码。然后代码产出地相当慢，这就是为什么 VM 还实现了一个 *adaptive optimizing* 编译流程. 适应优化背后的思想是使用运行中程序的执行信息去决定优化方向。

作为为优化代码会运行并收集以下信息：

* 关联每个异步调用的调用站，收集关于监视接收者的类型的信息
* 方法的执行次数和方法内部追踪热区代码的基础块

当一个执行次数和方法做关联就找到了准确的入口，这个方法会被提交到 **后台优化编译器(background optimizing compiler)**去优化。

优化编译器一开始用和未优化编译器同样的方式：遍历内部 AST 构建未优化方法的 IL 然后优化。然而不会直接低到把 IL 转成机器码，优化编译器去翻译未编译 IL 到 static single assignment(SSA) 形式的优化 IL. 基于 IL 的 SSA 随后的主题是到基于收集类型反馈的专业预测并通过一系列经典流程与 Dart 特殊优化：例如，内联(inline)，范围分析(range analysis)，类型预测(type propagation)，代表挑选(representation selection)，保存加载和加载加载的方向(store-to-load and load-to-load forwaring)，全局数字量(global value numbering)，调用下沉(allocation sinking) 等。在 IL 优化的最后是低到机器码. 使用线性检测注册调用器(allocator)和简单的一对多低级 IL 指令。

一旦编译完成了后台编译器会去请求变更线程进入到安全点接入方法的优化代码，下一步就是方法被调用 —— 它会使用优化代码。

> 有些方法包含了非常长的循环，所以在方法运行中在优化和未优化代码间切换执行是有意义的，这个过程叫做 *on stack replacement(OSR)*，它之所以有这个名字是由于方法的一个版本的栈会显示地用同样方法的不同版本替换

![](https://mrale.ph/dartvm/images/optimizing-compilation.png)

> 源码阅读：编译器源码在 [runtime/vm/compiler](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler)，编译流程的入口是 [CompileParsedFunctionHelper::Compile](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler/jit/compiler.cc#L701), IL 被定义在 [runtime/vm/compiler/backend/il.h](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler/backend/il.h). 内核到 IL 的翻译开始于 [kernel::StreamingFlowGraphBuilder::BuildGraph](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler/frontend/kernel_binary_flowgraph.cc#L1929)，这个方法同样也掌握着 IL 的构造方法去产出不同的生成函数. [StubCode::GenerateNArgsCheckInlineCacheStub](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/stub_code_x64.cc#L1795) 为内联桩生成机器码，同时 [InlineCacheMissHandler](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/runtime_entry.cc#L1073) 处理 IC 丢失的情况. [runtime/vm/compiler/compiler_pass.cc](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler/compiler_pass.cc) 定义了优化编译器流程和顺序. [JitCallSpecializer](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler/jit/jit_call_specializer.h#L12) 处理大多数基于类型反馈的预测

> 试一试：VM 也有很多参数可以用来控制 JIT 让它输出 IL 并生成被 JIT 编译出的函数的机器码.
> --print-flow-graph[-optimized] 打印所有的 (或者只有优化的) 编译产物
> --disassemble[-optimized] 拆解所有的 (或只有优化的) 编译完成的函数
> --print-flow-graph-filter=xyz,abc,... 限制前一个参数的输出，只包含一个或者逗号分隔的字符串的名字
> --compiler-passes=... 通过编译器步骤控制流程：强制 IL 在某个阶段 之前/之后 打印. 禁用某个步骤. 传入 *help* 获取更多信息
> --no-background-compilation 禁用后台编译, 并在主线程编译所有的热点函数. 实验中会很有用，不然在一些短的程序中，可能主线程会在后台编译热点函数之前就退出了。
> 例如：

{% highlight bash %}
# 运行 test.dart 并输出优化后的 IL 和机器码，其中只包含 "myFunction".
# 禁用后台编译预测
$ dart --print-flow-graph-optimized         \
       --disassemble-optimized              \
       --print-flow-graph-filter=myFunction \
       --no-background-compilation          \
       test.dart
{% endhighlight %}

在基于应用的执行数据中做出专业预测的代码被优化编译器高亮是非常重要的。例如，一个只包含单个实例 C 的异步调用站作为接收者讲会被转为直接调用产出，这个产出是接受街有没有预期类 C 的合法认证的产出。然而，这些判定可能会违反后面的程序执行：

{% highlight dart %}
void printAnimal(obj) {
  print('Animal {');
  print('  ${obj.toString()}');
  print('}');
}

// 用 Cat 实例调用 printAnimal(...) 非常多次
// printAnimal(...) 的结果会被预测器优化，那么 obj 会总是 Cat
for (var i = 0; i < 50000; i++)
  printAnimal(Cat());

// 现在用 Dog 调用 printAnimal(...) —— 优化后的版本不能处理这种情况，因为预测后的编译代码的 obj 总是 Cat. 它会导致负优化.
printAnimal(Dog());
{% endhighlight %}

无论优化代码做了什么预测，它都不能从静态不可变信息中产出，它需要和违反这些预测做斗争，并可能会从这种违反情况发生时从中恢复.

这个恢复的过程广为人知地叫做 *负优化 deoptimization*： 当优化的版本碰到了一种不能处理的情况，它简单地把执行权转移到相匹配的未被优化函数入口，然后继续执行。一个函数的未优化版本并不做任何预测，这样就可以处理所有可能的输入情况。

> 进入未优化函数的时机是至关重要的，因为代码有副作用(上面的函数中，未优化情况发生在我们已经执行了第一个 `print` 之后). 匹配到负优化指令到负优化代码的点在 VM 中通过使用 *deopt ids* 来实现

VM 通常会在负优化之后丢弃掉函数的优化版本，然后使用更新后的类型反馈重新优化它.

VM 保障编译器的专业预测用以下两种方式：

* 内联检查(例如 CheckSmi, CheckClass 的 IL 指令) 它们会验证编译器定下的预测是否 `使用` 了预测。例如：当把异步调用转为同步调用，编译器会在直接调用前添加一些检查。发生这种检查的负优化被称为 `eager deoptimzation`, 因为它发生在检查被触发之前。

* 指导运行时的全局检查会在优化代码的依赖发生变化的时候进行负优化， 例如，优化编译器会监视 C 这个类从未被集成，那么它会在类型衍生的时候使用这个信息。然而之后的异步代码加载或者类的冻结衍生出了 C 的子类 —— 它破坏了之前的判定。在这个时刻，运行时需要去找到并且销毁所有的基于 C 没有子类此项预测所作出的优化代码。运行时也很可能会在执行栈找到一些新的不合适的优化代码。在这些边界情况下会被标记为需要负优化，并会在执行需要返回的时候执行负优化。这种系列的负优化被称为 `lazy deoptimization`: 因为它会被延迟到控制权回到优化代码之后。

> 源码导读：负优化机制部署在 [runtime/vm/deopt_instructions.cc](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/deopt_instructions.cc). 它本质上是一个针对负优化指示的小型解释器，它介绍了如何重新构建所需的从优化代码到负优化代码的所有状态。负优化指示被 [CompilerDeoptInfo::CreateDeoptInfo](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler/backend/flow_graph_compiler_x64.cc#L68) 生成。它会在编译期的优化代码中每个可能负优化的地方被生成。

> 试一试：参数 --trace-deoptimization 可以让 VM 打印出每个负优化出现的位置及原因的信息. --trace-deoptimization-verbose 在负优化发生的时候在每个负优化指示的地方让 VM 打印出一条线

## 从快照中运行

VM 可以序列化 isolate 的堆或驻留在堆中更加精确的对象图到一个二进制的 *快照(snapshot)* 中。快照随后可以被用来在启动 VM 独立域的时候重新创建相同的状态。

![snapshot](https://mrale.ph/dartvm/images/snapshot.png)

快照的格式是为快速启动而实现的很底层的，优化后的格式 —— 它实际上是一个要创建的对象的列表，以及如果将它们连在一起的说明。快照背后的冤死思想是：VM 可以只是带着从快照中快速解压出所需的所有数据结构启动一个独立域，而不是解析 Dart 源码，逐步创建内部数据结构。

最初的快照并不包含机器码，然而这个能力随后在 AOT 编译器被开发出之后被加入进来了。开发 AOT 编译器和代码快照的动机是为了使 VM 在不同平台上运行, 因为平台级限制不能运行 JIT。

代码快照和普通快照几乎是一样的，只是有一点点不同：它们包含一个代码部分，与快照的其余部分不同，它不需要反序列化。这段代码按照允许它在映射到内存之后直接变成堆的一部分来放置。

![](https://mrale.ph/dartvm/images/snapshot-with-code.png)

> 源码导读：[runtime/vm/clustered_snapshot.cc](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/clustered_snapshot.cc)处理快照的序列化和反序列化。*Dart_CreateXyzSnapshot[AsAssembly]* API 家族负责写出堆快照 (例如： [Dart_CreateAppJITSnapshotAsBlobs](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/dart_api_impl.cc#L6238) 和 [Dart_CreateAppAOTSnapshotAsAssembly](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/dart_api_impl.cc#L5986))。另一方面 [Dart_CreateIsolate](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/dart_api_impl.cc#L1166) 可以从快照中拿取数据启动独立域(isolate)

## 从 AppJIT 中启动

AppJIT 快照 是用来缓解大型 Dart 项目的 JIT 启动时间的问题，像是 *dartanalyzer* 或者 *dart2js*. 当这些工具在小型项目中使用时，它的真正执行时间和 VM 编译 JIT 的时间是一样长的。

AppJIT 快照可以处理这些问题：应用可以在 VM 中使用假的训练数据，后续生成的代码和 VM 内部数据结构被序列化到 AppJIT 快照中。这个快照可以分发出去，而不用分发应用代码(内核二进制也行)。从快照中启动的 VM 仍然可以 JIT —— 可以和使用真实数据的执行配置对比，是否匹配训练数据中的配置。

![](https://mrale.ph/dartvm/images/snapshot-with-code.png)

> 试一试：如果你传入参数 *--snapshot-kind=app-jit --snapshot=path-to-snapshot* 那么在执行应用之后 dart 二进制文件将会生成 AppJIT 快照。下面是个 dart2js 生成并使用 AppJIT 快照的例子

{% highlight bash %}
# JIT 模式从源码中运行
$ dart pkg/compiler/lib/src/dart2js.dart -o hello.js hello.dartCompiled 7,359,592 characters Dart to 10,620 characters JavaScript in 2.07 seconds
Dart file (hello.dart) compiled to JavaScript: hello.js

# 训练运行去生成 app-jit 快照
$ dart --snapshot-kind=app-jit --snapshot=dart2js.snapshot \
       pkg/compiler/lib/src/dart2js.dart -o hello.js hello.dart
Compiled 7,359,592 characters Dart to 10,620 characters JavaScript in 2.05 seconds
Dart file (hello.dart) compiled to JavaScript: hello.js

# 从 app jit 快照中启动
$ dart dart2js.snapshot -o hello.js hello.dart
Compiled 7,359,592 characters Dart to 10,620 characters JavaScript in 0.73 seconds
Dart file (hello.dart) compiled to JavaScript: hello.js
{% endhighlight %}

## 从 AppAOT 快照中启动

AOT 快照最初的设计是因为平台上实现 JIT 编译是不可能的，但是它可以用在那些情况中 —— 快速启动并且能够忍受潜在的性能惩罚锁带来的性能一致性。

> 通常关于 JIT 和 AOT 的性能比较上有大量的困惑。JIT 可以访问到精确的本地类型信息和运行中程序的执行信息， 但是它必须要付出预热的代价. AOT 可以在全局上推导和证明出各种属性(它需要付出编译期作为代价)，只是没有程序真正运行时的各种信息 —— 另一方面来说， AOT 编译出的代码几乎无需预热即可达到最好的性能。目前， Dart VM JIT 有最佳的峰值性能，而 Dart VM AOT 有最好的启动性能。

不能 JIT 意味着：

1. AOT 快照 **必须** 包含在程序执行中会被调用的每个方法的可执行代码；
2. 可执行代码 **绝不能** 依赖于执行期间任何可能会违反推理假设的代码；

为了满足这些需求，AOT 编译进程进行全局静态检查(type flow analysis or TFA) 去确定应用入口集合中的哪个部分是可到达的，哪些类被实例化了，类型如何在程序中流转。所有的这些检查都是保守型的：这意味着它们在正确性上存在错误，这与 JIT 形成鲜明对比，JIT 会造成性能方面的失误，因为他总会把负优化未经优化的代码以实现正确的行为。

所有潜在的可被检测道德函数随后被编译成没有任何预测优化的原生代码。不过，类型流转信息仍旧被用来专业校正代码(例如，虚拟调用)

一旦所有的函数都被编译到堆快照就可以被使用了。

结果快照可以随后被 *预编译运行时(precompiled runtime)* 使用，Dart VM 其中一个种类不包含 JIT 和异步代码加载功能。

![](https://mrale.ph/dartvm/images/aot.png)

> 源码导读： [package:vm/transformations/type_flow/transformer.dart](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/vm/lib/transformations/type_flow/transformer.dart) 是基于 TFA 结果的类型流转检测和变形。 [Precompiler::DoCompileAll](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/compiler/aot/precompiler.cc#L190) 是 VM 中 AOT 编译循环的入口。

> 试一试：AOT 编译流程尚未被包括在 Dart SDK 中，依赖于它的项目(比如 Flutter)需要自行构建 SDK 自带提供之外的东西。 [pkg/vm/tool/precompiler2](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/pkg/vm/tool/precompiler2) 脚本是个很好的参考 —— 流程是如何构建的，哪些二进制产物是构建所必需的。

{% highlight bash %}
# Need to build normal dart executable and runtime for running AOT code.
$ tool/build.py -m release -a x64 runtime dart_precompiled_runtime

# Now compile an application using AOT compiler
$ pkg/vm/tool/precompiler2 hello.dart hello.aot

# Execute AOT snapshot using runtime for AOT code
$ out/ReleaseX64/dart_precompiled_runtime hello.aot
Hello, World!
{% endhighlight %}

> 注意，如果你想要深入查看生成的 AOT 代码，可以给 *precompiler2* 脚本传入 *--print-flow-graph-optimized* 和 *--disassemble-optimized*

### 可被切换的调用

即使有全局和本地分析的 AOT 预编译代码仍然可能包含一些未被静态虚拟化的调用栈。为了弥补这部分问题，AOT 编译后的代码和运行时需要使用一个内联缓存技术的拓展。 这个拓展的版本被称为 *可切换调用(switchable calls)*

JIT 部分已经解释了每个内联缓存都带有两个部分的一个 call site: 一个缓存对象(由 [RawICData](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/raw_object.h#L1853) 实例表示)和要调用的一块原生代码(例如： [InlineCacheStub](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/stub_code_x64.cc#L1795))。在 JIT 模式下，运行时只会更新缓存自身。然而 AOT 运行时会根据内敛缓存的状态选择是否同时替换所依赖的缓存和原生代码。

![](https://mrale.ph/dartvm/images/aot-ic-unlinked.png)

起初，所有的异步调用都开始于 *unlinked* 状态，当这样的调用栈首次被触发，那么 [UnlinkedCallStub](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/stub_code_x64.cc#L3068) 就被触发了, 它简单地调用运行时的方法 [DRT_UnlinkedCall](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/runtime_entry.cc#L1361) 去链接到调用栈。

如果 [DRT_UnlinkedCall](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/runtime_entry.cc#L1361) 尝试把调用栈转换为 *monomorphic* 状态是可行的。这个调用栈转为一个直接调用, 它会通过一个特殊的入口进入方法，这个入口会验证接收者是一个正确的类型。

![](https://mrale.ph/dartvm/images/aot-ic-monomorphic.png)

上面的例子中，我们假设当 `obj.method()` 初次被执行的时候，obj 是 C 的实例，obj.method 被解释为 C.method。

下次我们执行同样的调用站的时候，它会直接触发 C.method，跳过所有的方法查找的过程。 然而它也会通过一个特殊的入口进入的 C.method 中，他会验证 obj 仍然是 C 的实例。 如果不是，那么 [DRT_MonomorphicMiss](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/runtime_entry.cc#L1429) 条件会被触发，然后将会试着去选择到下一个调用站的状态。

C.method 可能仍然是一个合法的调用目标，比如 obj 是继承了 C 的 D 类的实例，而且没有重写方法 C.method。 这种情况下，我们检查调用站能否转化为 *single target* 状态，它被实现于 [SingleTargetCallStub](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/stub_code_x64.cc#L3094) (也可以看 [RawSingleTargetCache](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/raw_object.h#L1834))

![](https://mrale.ph/dartvm/images/aot-ic-singletarget.png)

这个桩是基于 AOT 编译了大部分类，并通过深度优先继承结构遍历赋予了数字 id 的情况。 如果 C 是一个有着 D0 ... Dn 多个子类的父类，而且这些子类都没有重写 C 类的 C.method, `:cid <= classId(obj) <= max(D0.:cid, ..., Dn.:cid)` 意味着 obj.method 可以被解析为 C.method。 这个情况下，不再是与单个类进行比较(*monomorphic* 状态)， 我们可以使用类 id 的范围(class id range) 去检测(*single target* 状态)它是否能够在 C 的所有子类中正常运行。

否则调用站会转化为在内联缓存中使用线性搜索，类似于 JIT 模式下使用的一种。(参考 [ICCallThroughCodeStub](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/stub_code_x64.cc#L3028) [RawICData](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/raw_object.h#L1853) 和 [DRT_MegamorphicCacheMissHandler](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/runtime_entry.cc#L1526))

![](https://mrale.ph/dartvm/images/aot-ic-linear.png)

最终，如果线性检查数量的增长超过阈值，那么调用站会切换到使用一种字典类似的数据结构。(参考 [MegamorphicCallStub](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/stub_code_x64.cc#L2913), [RawMegamorphicCache](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/raw_object.h#L1891) and [DRT_MegamorphicCacheMissHandler](https://github.com/dart-lang/sdk/blob/cb6127570889bed147cbe6292cb2c0ba35271d58/runtime/vm/runtime_entry.cc#L1526))

![](https://mrale.ph/dartvm/images/aot-ic-dictionary.png)

# 运行时系统

> 这部分下次会写

# 对象模型


> 原文：[Introduction to Dart VM](https://mrale.ph/dartvm/)
