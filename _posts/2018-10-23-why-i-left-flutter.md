---
layout: post
title: 为什么我放弃了 Flutter
tags: native flutter android ios client
---

## flutter 是个很好的实践方案

读者可能已经知道 [flutter](https://flutter.io/) 了，它是一个跨平台渲染框架。与之对应的还有很多 react-native 类似的方案。但是在内部实现上，Flutter 和其他地方案上还是有很大的差别的。

它最大的亮点在于它爹是 Google。 有充足的资源和能力，进而导致整个设计方案非常的底层和激进。所以它地实现并非是做 view 映射，而是直接调 gpu 渲染。 所以一般情况下来说，性能是所有跨平台方案中最好的。

其实从十几年前就有各种方案在探索跨平台，大多是做 webview 包 web, native view 映射的方案。 不过 flutter 的激进很可能来说是最靠谱而且充满了希望的方案。

从市场的角度上来看 google 在大力强推 flutter，我也是在 google developers day 2018 shanghai 听了 flutter 的讲演之后毅然决然决定尝试一波。体验一下新的方案。

同时最近做的项目 [clippingkk](https://kindle.annatarhe.com) 也确实是需要一个客户端所以回来就用 flutter 起了一个项目。

## flutter 体验

* Hot reload

flutter 强吹的 hot reload 其实对我来说没有很强烈的感觉，毕竟我长期做 web 开发。 可能 native client 的朋友会对这个功能比较感兴趣，毕竟一次很小的改动就意味着要重新编译执行。 但是在我开发 windows uwp 的时候，xaml 的代码更新也是实时的，而且也仅仅是 view 的更新，和 flutter 的 StatelessWidget 更新是异曲同工。

所以虽然 hot reload 可能是一个很大的 feature，但是对我这样经常用的人来说并没有很大的吸引力。事情本该如此。

### package manager

flutter 自带有 pub 做依赖管理。 和隔壁 golang 相比，dart pub 好用得不像是 Google 家做的产品。 pub 甚至为国内用户以半官方的形式提供了镜像！

由于我是长期使用 npm，所以我深刻意识到 node 社区的代码质量差出了天际。 不过由于 dart 是静态语言，而且玩 dart 的很少有初学者，所以在我看来代码质量上至少比 npm 强太多了。

而且只要安装上了某个依赖， vscode 是可以直接导需要的包，做得和 IDE 一摸一样，非常的贴心了。

### IDE support

除了上面说的直接导入需要的包，还可以在依赖改变的时候直接运行 **flutter packages get**，自动拉新的包。

而且 refactor 功能做得特别好，有 **StatelessWidget** 和 **StatefulWidget** 的互转，甚至还有直接包一层新的 view 在当前选中的 view 上这种贴心简单的功能。

很多时候我都是手写一个 StatelessWidget 然后用 vscode 提供的 refactor 转成 StatefulWidget，过程非常的友好舒爽。 dartlang 也确实是一门相当不错的语言。

### Marketing

Google 的营销做得还是比较到位的。从今年开始各种大大小小的 Google 开发者场合上，flutter 都有自己的身影。话题上也是偏重于它的优势 —— single code base, hot reload, performance 这三个话题。而且 Google 是一家国际公司，所以影响范围还是比较广的。 更是由于国内开发者对于 Google 有一种比较特殊的感情，所以听 flutter 团队的表述来看，似乎中国开发者是最活跃热情的。

其实仔细想了想，技术营销上比 Google 强的可能只有 mongoDB 了。

### Performance

性能一直是 Flutter 团队强吹的一点。当然他们也确实有实力这么吹。

Flutter 的底层实现不是靠所谓的多线程(微信小程序)，也不是靠 View 映射(react native)，而是直接编译成 arm code，调用 GPU 直接渲染。 这么激进的方案可能也只有 Google 能做得出，他们有至少一个专门做 GPU 编码的团队。 [Skia](https://github.com/google/skia) 是 flutter 的渲染底层，chrome，Android 等几乎所有的 Google 家的 GUI 产品中到 GPU 的步骤都是 Skia 在处理。 这些背书也证明了 Skia 是一个相当靠谱的渲染引擎。

而且从演讲的内容来看， Flutter 团队中应该是有很多是从 Skia 团队转过来的。 那么这帮人凑一起，性能差点儿会很丢人的吧。 在很多 benchmark 中也确实显示说 Flutter 性能不错。

### 学习成本

和很多人的认知不太一样的是： 我认为 Flutter 可能是所有跨平台框架中，学习成本最低的那个。

初学可能看到 dartlang 头皮发麻，毕竟要学新语言，但是其实仔细想想看，Dartlang 和 java 算是比较相似的，而且和绝大多数 OOP 语言类似。 大多类型，接口，静态，声明的概念对于有编程经验的工程师，看看文档花不了几天就学会了。

flutter 的一大优势在于： 写 flutter 可以完全不用理解 native 那套东西(目前至少是 UI 层面)。 如果读者有尝试写过 react native 就会理解我说的是什么意思： 如果一个完全没有接触过 native 开发的有经验的 web 开发者上手 react-native 是要难于 flutter 的。

举一个例子：长列表渲染。 react native 的 api 比较繁琐，需要 dataSource, delegate 等概念，因为它是做映射所以需要开发者知道 UITableView ，并且理解其设计思想。 但是没有学过 iOS 开发碰到 react native 的 ListView 会很懵逼。 但是在 flutter 里则全都是 `ListView.build`，丝毫没有 native 开发的概念所在，除了学习 API 定义不需要再去理解 native 的实现。

## 放弃

既然 Flutter 这么好，这么强大，为什么我写了一段时间之后还是放弃了？

* Flutter 确实是太早期了

虽然周边设施还算是比较完善，文档也还算可用，而且这个项目也启动两三年了。但是在写代码的时候能感觉到 Flutter 还是处于一个要啥啥没有的阶段。真的是除了 View 渲染，啥都没有。

这么久了，官方和社区都没能讨论出一套合适的数据管理方案。我在写 clippingkk-mobile 的时候，曾经花了一个星期去探索包括 MVP, Redux 等在内的各种的数据管理方案，最后还是选择了裸写。

之后的一个需求是 canvas 画图保存到用户相册。各种库都没有实现，然后无奈写了桥接到 native 的代码。不得不说桥接代码非常好写，比 react native 舒服太多了。 但是这件事让我认识到 view 层似乎并不是应用复杂度的瓶颈所在。

早期的另一个表现在于不好搜索。还是 canvas 画图的问题。 搁在 web 上我一个小时就能写完，放在 native 找找代码也不会超过两个小时。 但是在 flutter 上我到现在都没解决，因为一个很关键的，我不知道怎么下载图片。 最后想实在没有现成的接口就 http get 算了。然后转念一想，为啥不用 native 直接写了算了。

* native 成本比较低

换用 native 以后，我再也不纠结数据管理方案了，也不用管 http client 实现，也不用在乎怎么去桥接代码。 直接在两个小时内写完了用 flutter 六个小时的工作量。 这我还是用 Android 要写写 xml，如果是 iOS 就是单纯地画 Storyboard，然后把 action 指到代码就结束了，应该会更快。

而且 native 的语言 kotlin, swift 丝毫不比 dart 差, 甚至 swift 的类型更加严格。对于应用安全性来说是个好事。

* Google 不一定能撑 Flutter 多久

可能很多人都忘记了 Google 是一家靠后端起家的公司。 由于最近几年的技术分享除了 tensorflow 几乎都没有后端的核心技术介绍了，导致大众渐渐淡忘了这件事。

我要说的就是提醒各位， **Google 是一家非常非常硬核的后端为核心的商业公司**。

Google 的 bigtable, gfs, spanner 每个都直接影响了互联网发展的几年甚至到十几年。但是 GUI 产品鲜有这种量级的影响。一个比较靠边的可能是 Android，但是 Android 是一个 os，也不算是单纯的 gui 项目。

所以在 Google developers day 上我问了 flutter 和 Android 的关系，

> 既然 Flutter 真的是 Google 强推的，为何不直接砍掉 Android 的 UI 层，直接用 Flutter 呢？ 

可惜的是他们并没有正面回答我。

* 性能真不一定很好

说到性能上。 事实上能保证的可能也只有 Android 上的性能。 苹果家的渲染逐渐在往 metal 上迁移。 怎么说呢，毕竟是苹果自己家的东西，而且又不用做很多的版本兼容，性能怎么想都会比别人实现的方案要好。

最后的引用部分也有一篇文章说了 flutter 和原生 iOS 的性能对比，感兴趣的可以去看看。

## 总结

我放弃 flutter 的主要原因在于它还处在一个相当相当早期的阶段，除了 view 层什么都没有。第二大原因是 native 开发的成本相当的低，而且相对来说我更能理解 native 的思想，毕竟它更加成熟。

至于性能可能是我最不看重的地方了。

当然，Flutter 是个非常好的实践，它直接从底层上变革希望能够统一多平台。如果 Google 给予足够的支持，而且足够长的时间， flutter 会发展得更好，最后真的能统一多平台也说不定。

真心希望 Flutter 能更好更快地发展，这样优秀的工程作品值得被认真对待。

不过商业产品的话，在我看来还是不太适合。或者简单的视图层做桥接也可以接受。

## BTW

微信小程序这个垃圾是怎么有脸面出现在世上的？ 写小程序底层的工程师是丢失了工程师的尊严信仰和能力还是爱上了被 PM 骑在脸上吆五喝六的姿势抑或是每天舔老板的屁眼真的那么开心？

## Reference

* [深入 Flutter 的高性能图形渲染](https://speakerdeck.com/liyuqian/deep-dive-into-flutter-graphics-performance)

* [The Magic of Flutter](https://docs.google.com/presentation/d/1B3p0kP6NV_XMOimRV09Ms75ymIjU5gr6GGIX74Om_DE/edit#slide=id.p)

* [How fast is Flutter? I built a stopwatch app to find out](https://medium.freecodecamp.org/how-fast-is-flutter-i-built-a-stopwatch-app-to-find-out-9956fa0e40bd)

* [clippingkk-mobile](https://github.com/clippingkk/clippingkk-mobile)

* [What Happened When I Peeked Into My Node_Modules Directory](https://medium.com/s/silicon-satire/i-peeked-into-my-node-modules-directory-and-you-wont-believe-what-happened-next-b89f63d21558)

* [跨平台開發的一些姿勢](https://medium.com/@kingapol/%E8%B7%A8%E5%B9%B3%E5%8F%B0%E9%96%8B%E7%99%BC%E7%9A%84%E4%B8%80%E4%BA%9B%E5%A7%BF%E5%8B%A2-e2a59b7849ce)