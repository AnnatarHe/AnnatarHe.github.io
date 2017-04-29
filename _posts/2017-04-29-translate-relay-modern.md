---
layout: post
title: 译 - Relay Modern 更简单，更快速，更具拓展性
tags: js react graphql
---

> 原文： [Relay Modern: Simpler, faster, more extensible](https://code.facebook.com/posts/1362748677097871/relay-modern-simpler-faster-more-extensible/)

Relay Modern: 更简单，更快速，更具拓展性

今天，我们发布了[Relay Modern](https://github.com/facebook/relay). 一个 Relay 的从头设计的新版本，使其更加简单使用，更具拓展性，最重要的是，在移动设备上提升了性能。这篇文章中，我们将会提供一个简要的 Relay 概览，然后看一看 Relay Modern 有什么新东西。

## 重新介绍 Relay

[Relay](https://code.facebook.com/posts/622382554568759/relay-declarative-data-for-react-applications/) 是我们用来构建数据驱动型应用的 JavaScript 框架。它结合了React去构建可组合的用户界面，GraphQL去构建可组合的数据获取。 虽然不使用任何框架就可以一起使用这些技术，但我们发现这种方式并不能总是拓展到我们需要的程度。例如，我们的应用变得庞大了之后，管理网络请求，错误处理，数据一致性，以及其他边边角角都会变得非常棘手。正常的方法也能打破这种代码封装，它就要求开发人员对底层代码进行一些修改，甚至是一些小改变也需要这样对底层代码做修改。

我们 Relay 的目标就是让开发人员能够更快更多地专注到创建它们的应用上，更少地考虑重新实现那些复杂的，容易出错的细节。为了达成这些目标，Relay要介绍两个概念：组合数据和视图定义，声明式的数据获取。

### 数据和视图的托管

当使用 React 构建界面时，我们介绍了通过一系列内嵌的组件构建整个应用。News Feed 是 stories 的集合；每个 story 都有头部，内容和列表组件；每个评论都有作者和内容；等。这些小块视图通过单个 React 组件表示，允许开发人员在整个应用内部解决数据。这种方法也可以重用，相同的 story 组件或许会详情页的被 News Feed 重用。

更简单一些的话，GraphQL fragments 是声明数据依赖的可组合的单位，News Feed 的 GraphQL 语句可以被拆分成为 stories 的头部，内容，评论和其他组合在一起的片段

在我们创建 Relay 的时候，我们意识到这些概念可以被抽象并定义为强大的形式化单位：托管视图逻辑和每个组件的数据依赖的容器。这里是一个 Relay Modern 容器的例子，它渲染用户的名字和照片而且相应地声明了数据依赖：

{% highlight js %}
const UserProfile = Relay.createFragmentContainer(
  // View: A React component (functional or class)
  props => {
    const user = props.data;
    return (
      <View>
        <Text>{user.name}</Text>
        <Image src={{uri: user.photo.uri}} />
      </View>
    );
  },
  // Data: A GraphQL fragment
  // The shape of the fragment matches what is expected in props.
  graphql`
    fragment UserProfile on User {
      name
      photo { uri }
    }
  `
);
    
// Use as a normal React component:
<UserProfile data={...} />
{% endhighlight %}

Relay 容器(containers) 无缝集成了 React 和 GraphQL： 正常的 React 组件按照开发者所期望的那样组合在一起，而 GraphQL 片段(fragments)通过标准的 GraphQL 语法组合在一起。 自从介绍了 Relay 的数据和视图托管以后， 我们在 Facebook 的每个使用 GraphQL 的地方都申请使用这种方式，我们也建议 GraphQL 社区将这种托管作为最佳实践

### 声明式的数据获取

和 React 的让开发人员去表达什么应该被渲染而不是应该被如何渲染是一个套路。Relay 使开发人员去指定需要什么数据，而不是如何加载，如何缓存，如何更新。将开发人员从如何直接处理网络中解放出来， Relay 帮助减少应用的复杂度并阻止了潜藏在源码中的 bug 和附带的性能问题。

这种方式的另一个好处是，框架的改进有益于多个应用，而不需要每个应用的更新。总的来看，我们发现声明式的数据获取是 Relay 的一大主要特点。

## 介绍 Relay Modern

这两个概念将继续是 Relay 作为开发者的产品所呼吁的重要部分。事实上，当我们一开始设计 Relay 是为了帮助我们为桌面，平板和其他高端设备创建应用的，今天我们用 Relay 来创建更加宽广的多样的应用，从富媒体网络工具到用 Ract Native 做的移动应用。然而，我们在更宽广的设备中使用 Relay —— 尤其是在性能略差的移动硬件上。我们意识到原有的设计中有一些限制。实践中，API 的表现力和灵活性使得在一些设备上打到我们想要的性能水平变得很困难。

与此同时，我们在小心翼翼地倾听来自互联网和社区中的开发者的反馈。他们指出 API 太魔幻了。有时候使得学习和预测结果变得困难。我们意识到简单的方式可能会更易于理解，而且也会有更好的性能。因此我们开始重新设计 Relay 去适应这些新的约束，在我们已存在的原生 GraphQL 移动应用中寻找灵感。

结果就是 Relay Modern。 一个结合着旧版 Relay，我们的原生移动应用客户端，GraphQL 社区中汲取的的经验和最佳实践的面向未来的 GraphQL 框架。 Relay Modern 保留着 Relay 中的精华部分 —— 数据托管和视图定义，声明式数据获取 —— 同时也有着简化的 API，新加特性，性能提升和框架尺寸的减少。为了实现这些，我们拥抱了两个概念：静态语句和提前优化

### 静态语句(Static queries)

Facebook 的原生 iOS 和 Android 应用从 2012 年就用上了 GraphQL。 随着 Relay 在凄惨的移动网速和低性能设备上寻求性能的提升，我们向这些工程团队寻求启示，尤其是他们如何利用静态分析和提前编译。

这些原生应用组发现使用 GraphQL 伴随着构建语句的额外开销，连接一大堆字符串，随后通过低速连接上传这些语句。这些 GraphQL 语句有时甚至成长为成千上万行。同时，每个移动设备跑着相同的应用发送大量相同的语句。

组里意识到是否可以用静态分析的语句替代 GraphQL —— 就这样，他们不再因为运行时的判断而改变 —— 随后他们可以在开发阶段被一次性生成并且存储到 Facebook 的服务器中，通过一个小的身份识别在移动应用中替换。通过这样的方式，应用发送识别码带着一些 GraphQL 变量，Facebook 服务器就知道了哪个语句应该去运行。没有更多开销，降低网络负重，而且应用变得更快了。

Relay Modern 使用了相同的策略。 Relay 编译器从应用中提取出托管的 GraphQL 片段，构建必要的语句，预先把它们存储到服务器中，人工输入到 Relay 运行时中，使用这些语句去获取并在运行时执行这些结果。

### 提前优化(ahead-of-time optimization)

Relay 编译器使用静态语句结构的知识去优化这些输出，帮助提升应用的性能。优化这些语句存储到服务端意味着服务端可能要去执行它，并尽快返回结果。相似的，人工优化过的可以让运行时执行这些语句更快地得到结果。

这样的优化例子有拍平(flatten), 它减少重复的字段来帮助避免运行时的多余数据被处理，常亮内联，其中的静态判断分支出的语句或许会在编译阶段被干掉。

组合。这些压缩帮助降低数据获取的时间花费和下载语句结果的时间还有花费的执行时间。

## 新特性

除了带来的性能提升， Relay Modern 也提升了已有的特性并且新加了几个。

### 更简单的突变(mutation)

在使语句静态化查询之前，我们知道我们想要在简化 Relay 中突变(mutation)的工作。我们从社区中听到提升就是使用一个共同的请求去简化突变的API。

如果你理解了在封装之下发生了什么，你就会明白经典版的 Relay 在突变发生的时候做了多么叼的事情。Relay 的突变 API 使得开发者去指定一个“富语句” —— 所有在响应中可能会改变的东西都去请求一个“变化”。当突变被执行完成之后，经典的 Relay 将富语句和真正被执行的语句做交集，以确定最小的数据获取集。这种方式在有些情况下是很方便的，然而它也会变得不可预料和使人困惑。哪些突变应该被生成在有时候是不一样的，另一个困难是需要动态的运行时查询，限制了静态语句优化的能力。

而 Relay Modern 提供了明确的突变API：开发者明确指定哪些字段在突变发生后需要去获取，并且在突变发生之后准确地说明缓存应该被如何更新。它同时提升性能并使得系统更加可预测。这个API也使任意逻辑控制突变，使它有可能控制更多的情况(例如在客户端对一个列表中的元素进行排序)，这在经典 API 中并不支持。

### 垃圾回收

在移动设备中做一个良好的应用意味着不只是要关注 CPU 的使用，还要注意内存的消耗。因此，Relay Modern 从设计之初就支持垃圾回收 —— 就是移除缓存 —— GraphQL 数据中不再被任何视图引用的部分将会被在缓存中移除。这对于长期运行的应用尤其地有用，否则可能会导致缓存无限制地增长。

垃圾回收在核心运行时中就被启用了并且非常小心地集成到了开放 API 中，因此开发者无需明确管理缓存内存的使用。

## 拓展性和可重用

Relay Modern 的功能远比结合 React 和 GraphQL 要多。随着这次的发布，曾经一个的包现在成了三个：编译器，运行时和 React/Relay 集成层。 编译器(Relay compiler, npm: `relay-compiler`)是语法分析和优化 GraphQL 的通用工具集，并且它也是生成代码的工具。运行时(Relay runtime, npm: `relay-runtime`)是一个视图无关的通用工具集，用来编写，发送和缓存 GraphQL 数据。最终，React Relay(npm: `react-relay`)把 Relay 集成到 React，提供上面所展示的容器 API。

这样的模块化可以使 Relay 在未来结合其他视图库使用或者作为一个单独的库来使用。Relay 编译器同样被设计为可以基于 GraphQL 类型系统做拓展，添加更多的能力，或者不仅仅是用来做 app 开发。我们很激动地期待 GraphQL 社区会帮助我们做这些 Relay 套件的新模块。

## 创新之处

我们很开心我们做了这一切。然而由于我们对 Relay 的工作方式做了一些重大的改变，所以提供一个已有 Relay 应用的迭代方式是非常重要的，已有应用转为 Relay Modern 并继续产生价值。我们从 React 的创新哲学中学到的是，以不间断的迭代方式对软件进行重大改变是可能的。

为了践行这种形式，我们在 Relay 的最新版本中提供了兼容 API。 这就使得你可以在已经存在的经典版 Relay 应用中使用新的 Relay Modern 的 API。当使用兼容 API 的时候，你不会享受到静态已知查询(statically known queries) 或者更小的内核产生的收益，但将会从更简单和更具可预见性的 API 中受益。一旦你应用中的所有组件都转化为了 Relay Modern 的 API，那么 Relay Modern 的运行时环境就可以被集成进来，同时提供性能优化和低开销。

作为例子，我们在 Facebook 的应用中将 **市场** 的 Tab 从 Relay 增量转为了 Relay Modern，这一切是团队在迭代新功能的同时完成的。当转化完成之后，我们启用了 Relay Modern 的运行时环境，安卓上的应用交互时间(TTI)平均提升了 900ms. 将来我们会进一步继续将 Relay Modern 带给我们的旧应用，我们也期望可以分享一部分我们做的工具使这个过程更简单一些。

## 路在何方

我们很高兴在 Github, npm 社区分享了新的 Relay Modern 的 API，运行时，编译器，并希望得到你们的反馈。我们也很高兴分享了在复杂客户端中如何使用 GraphQL 的哲学。我们也期望看到 GraphQL 社区的更多工具也会使用它.

## PS

译者深感压力山大，中间很多句子没办法表达出原文的精妙语义。 Relay 确实是很厉害，适合大型项目。如果对它感兴趣推荐阅读原文。