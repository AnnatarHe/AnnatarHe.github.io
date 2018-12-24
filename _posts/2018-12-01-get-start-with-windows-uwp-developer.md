---
layout: post
title: 开始学习 Windows UWP 开发
tags: code windows
---

> 预警： 这篇文章质量很低，谨慎查阅

## 背景

之前买了 kindle，然后我日常会看些书，用过一些笔记高亮整理的软件，所有我所接触到的软件都不够好。 而且当时粗略了解了微软的 [fluent design](https://www.microsoft.com/design/fluent/), 觉得很棒，就开始准备学 Windows 开发。

很多时候学东西我比较崇尚的是 learning by doing 的方式。 在今年五六月份的时候，项目随着第一行 C# 就开始了。

这里是我个人一点点学习的总结，希望对于后来希望学习 Windows UWP 的同学有所帮助。

## XAML

UWP 的开发方式和 web, android 在这方面比较相似。都是用类 xml 的形式组织界面。

主要的 layout 是 Grid, StackPanel, RelativePanel 这三种，基本 UI 上已经足够了，分别对应类似于 web 开发中的 ，grid 布局，flexbox, relative/absolute。这三种规则。

表现模块上主要是 TextBlock, Image。

其实这些元素无论是在 android， ios 还是 web 上都是一样的。

xaml 不同的一点是它带来了`绑定`，类似于 Angular, vue 中的绑定，不过它是微软亲自支持的。 

uwp 中的每个 xaml 都和一个 `.cs` 文件是绑定关系。在 xaml 中可以访问到 .cs 中的 public 属性，也可以调用其中的 event handler， `.cs` 中也可以访问对应的 xaml 结构，进行取值等操作。

```html
<TextBlock
    Text="{x:Bind authViewModel.PageH1Title, Mode=OneWay}"
    FontSize="32"
    Margin="0, 0, 0, 30"
    FontWeight="Light"
/>
```

```csharp
public sealed partial class AuthContainer : Page {
    private AuthViewModel authViewModel { get; set; }
}
```

xaml 还有一个非常亮眼的操作在于对国际化的支持。

微软可能是世界上最早也是最大在软件上应对国际化支持的公司了。微软文档中的 [对应用进行可本地化处理](https://docs.microsoft.com/zh-cn/windows/uwp/design/globalizing/prepare-your-app-for-localization) 一节讲的非常好。很多时候国际化并不只是把语言翻译过去，还包括文字颜色，样式，甚至是地缘政治。

所以 uwp 中做国际化非常的舒服。所有 xaml 都有一个 `Uid` 的属性，对 Uid 赋一个值，然后在对应的 `strings/en-US/Resources.resw` 中对这个元素做描述就可以在不同的语言中显示不同的效果。如：

```json
{
    "avatarTextbox.PlaceholderText": "头像的 url",
    "avatarTextbox.Color": "blue"
}
```

可以设置 placeholder + color，只要是支持的属性都可以设置。

## C Shape

由于我个人对 [王垠](http://www.yinwang.org/) 有些崇拜，在他的文章中总是字里行间夸赞 C# 可能是最好的语言，所以对这个语言还是非常欢迎的。在接触到这个语言之后，我开始喜欢上它了。

其实我非常不赞同和稀泥的那种话：

> 每个语言都有好坏，不能说哪种语言是最好的语言。

这种话没有丝毫营养，只是因为不会得罪人，大家都这么说，导致都以为是正确的。

如果说语言没有好坏，为何我们不用 ada 去工作呢？为什么所有人都厌恶 php 呢？为何没人再用 perl 写工具了？

很多时候这种看起来政治不正确的话实际上是正确的。而 C#，可能真的是世界上最好的语言(至少确定比 js 优秀)

在我看来 C# 好就好在它是一门非常正经的 OOP 语言。万物皆对象，对象封装也非常明确，报错也准确。虽然看起来很老派，却也支持 async/await, dynamic type 这种看起来现代的操作。

在 C# 中自带 Linq，可以写出这种操作你敢信：

```csharp
var query = from str in stringArray
            group str by str[0] into stringGroup  
            orderby stringGroup.Key  
            select stringGroup;
```

## 组件化

Windows UWP 也有组件化方案。 在 UWP 中叫做 `User Control`，使用上需要首先定义一个组件，继承自 UserControl，具体是通过 VS 自带的创建工具生成的。然后通过 `DependencyProperty` 注册参数。

使用的 xaml 需要在 Page 中声明 `xmlns:comps="using:AppNamespace.Components"` 然后就可以引用了。

具体方案请参考最后 reference 中的文章，或者 [profile user control](https://github.com/clippingkk/kindle-viewer/blob/master/kindle-viewer/Components/ProfileInfo.xaml.cs) 的示例代码

## Fluent Design

Fluent Design 的设计不得不说非常漂亮，如果真的能在 Windows 上全面铺开，估计没人会愿意用 mac。

在 mac 上实现 fluent design 非常简单：自带！

```html
<Grid Background="{ThemeResource SystemControlAcrylicElementBrush}">
```

还有一种动画。在 ios 上叫 Hero 的转场方式，在 UWP 中叫做 [Connected animation](https://docs.microsoft.com/en-us/windows/uwp/design/motion/connected-animation) 只是简单地定义开始和终止就可以自动实现衔接动画，最近的 flutter 对这种动画的支持也非常好。 [定义同样的 tag 就可以了](https://flutter.io/docs/development/ui/animations/hero-animations)

## 包管理

UWP 开发包管理只有 NuGet， VS 中还提供了视图界面，相当的方便。 自带锁版本，升级。安装之后直接调用。

配合 VS 强大的智能提示，不用手写 `using` 自动导包。

## 命令行

作为 Unix 系程序员，我对于 Windows 的吐槽一直都是没有一个好看又好用的命令行，这次接触到 Windows 开发以后我开始渐渐理解了 Windows 的哲学 —— `不需要命令行`

作为一个 Windows 开发者，所要做的不是了解各种命令行，不是怎么配置 webpack，也不用关心 package.json 写了什么，更不用知道怎么 build，怎么 publish。只要点一个 运行按钮，一个 发布按钮。就可以了。

所以写 Ruby 的朋友真不一定有写 C# 的心态好，下班早基本上是不可能的了。

BTW： 最近 Windows 平台出了[一款 Terminal 应用](https://github.com/Eugeny/terminus) 颜值非常高，需要的朋友可以考虑一下

## 开发者关系

了解过 iOS 开发费用的朋友们可能耳闻过苹果的保护费，高达 99 刀每年。而微软就和蔼多了，一百出头的人民币可以买到 50 年开发者账户！买不了吃亏买不了上当。

不过总感觉微软开发者后台很慢，界面也不灵活，而且有些提示还有 bug，就应该把我招过去给他们重构一波嘛(😂)

微软的文档可以说顶起了互联网世界半边天。听闻一些年纪比较大的程序员，他们当年没有 stackoverflow, 也没有 google，就是一个 msdn 走天下，下载下来看着学。

从前文的 i18n 模块可见微软对于文档的认真程度。

其实还有[Microsoft Virtual Academy](https://mva.microsoft.com/)，听闻内容也很好，我接触不多，感兴趣的朋友可以了解一下。

## 危机

写 UWP 确实非常的爽快，然而我也能够感觉到一种危机感： C# 写得太爽了，不用关心内部实现，不用考虑文档格式，不用关心底层优化。 甚至调用数据库都是被 C# 包了一层，看到 ForEach 类似的方法我都不敢调用，生怕一下遍历数据把内存爆破。 我还算是接触过一些数据库相关的知识的，如果是没有接触过的朋友估计就真的以为是个集合随便调用了。

在代码质量上更是担心：用 VS 写代码 (也可能是由于不太会配置)，看不到空格和 tab 则会非常影响代码质量，包括空行调整，缩进规则，unused import 等。 只要用了 IDE，这些问题都会莫名其妙变得很次要。 即使我们都知道应该怎么做，但是就是会优先级降得非常低。

我平时用 Vim 写代码，对于空格，缩进等影响代码优雅的问题非常敏感。 但是偶尔转用了 VS Code 之后，这个敏感度就绛下来了。用了 VS 之后则更低，甚至两段代码间空个三五行也变得可以接受了。

说到这里可能要将一些不太好的话了。我接触过不少 .Net 开发转职的程序员，基本都是工作三五年经验的，大部分的技术水平都不尽如人意，对于很多知识都不够了解，代码优雅要求较低。

自从接触了 Windows 开发我觉得有些能理解了： 在舒适区呆了太久。

微软系列产品对得起 “舒适区” 这三个字。相对而言， Web 简直是惨绝人寰。

最近我写的产品叫 [clippingkk](https://github.com/clippingkk/kindle-viewer), 微软商店已经上架了。有兴趣的朋友可以了解一下。

### Reference

* [UWP 开发入门教程合集](https://www.bilibili.com/video/av7997007)

* [@TotoroQ](https://juejin.im/user/5b347fede51d4558d9235b8d/posts)

* [Acrylic material](https://docs.microsoft.com/en-us/windows/uwp/design/style/acrylic)

* [UWP: Creating User Control](https://social.technet.microsoft.com/wiki/contents/articles/32795.uwp-creating-user-control.aspx)
