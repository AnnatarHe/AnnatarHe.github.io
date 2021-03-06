---
layout: post
title: SPA 杂谈
tags: js front-end
---

## SPA

近期做了一个自己觉得还算不错的项目，全面SPA。

其实这不是我的第一个SPA项目，我的第一个项目是用React做的[简历](https://www.iamhele.com)页面，用了一些很炫的东西，当然了，依旧是没打算向下兼容。

第一个项目问题很多。最主要也是懒吧。这张简历页面都懒的拿出来。感觉没什么卵用。

而且这个页面就是炫技用的。耍了React，但是整套页面几乎没有DOM重绘的地方。高性能无用武之地哦。

虽然项目很简单，但是最近在拉github API数据的时候还是出现了很多问题。

基于此，还有做的另一个较为正式的项目中一些问题。我来谈谈`单向数据流`吧。

## 几年前不存在这个问题

正如标题所言，几年前是不存在这个问题的。因为大多数问题在后端。

前端的作用仅仅是几个轮播图，几个tab切换。而且几乎完全的服务端渲染，ajax用得最多的也就轻量级的表单提交了。

一般的项目，js几千行也就差不多了。

还有`jQuery`这样的东西。从根本上就杜绝了工程化的产生。想用`jQuery`做前端大项目？做梦好了。

然而近几年这个问题越来越得到重视。

SPA的发展真的非常的快。

SPA带来了非常棒的用户体验，前端响应速度可以非常的快，loading页面也真正的得到应用。用户可以一边等待应用响应，一边看看网站上其他的信息。以及其他种种。

然而应用难度随着SPA的强化也从后端转移到了前端

![complex](http://ww2.sinaimg.cn/bmiddle/537f5932jw1f0db6wt57ej20tz0p7goq.jpg)

都带来了哪些问题，以下是我的个人看法：

* 页面跳转
* 模块化
* 性能问题
* 前端组件化
* 数据流

我来说说自己的见解吧

## 页面跳转

这个还是比较好解决的。低版本浏览器用Hash跟在URL后面

{% highlight js %}
window.addEventListener('hashchange', e => {
    // 正则判断，或者就直接字符串
    // 分发各个函数
}, false)
{% endhighlight %}

新版本HTML5浏览器还有很棒的history API
{% highlight js %}
window.addEventListener('popstate', e => {
    // do something
}, false)

let state = {
    page_id: 1
}
history.pushState(state, 'hello world', '/new-url')
{% endhighlight %}

这个问题只要调用这些API就可以了，没什么太大的问题。然而，问题确是开始于这里。

## 模块化

模块化这种事情一直是js的心腹大患。从我入行之前的[require.js](http://requirejs.org/), [sea.js](http://seajs.org/docs/)

还有各种的`AMD`规范，`CMD`规范什么的。

一直是百家争鸣的状态，搞得一点儿也不统一。

好在ES2015规范出来，终于有了一个最终的规范。

{% highlight js %}
import React from 'react'

class Index extends React.Component { render() {} }
export default Index
{% endhighlight %}

然而，然而，然而。我觉得实现这个标准挺难的。

因为Node的模块系统的文档赫然写着`Stability: 3 - Locked`

当然，写法什么的这个事情可以再改，其实现在模块系统的写法也是蛮好看的。浅显易懂。虽然我个人认为有点儿丑吧。。。

模块化解决了吗？并没有。

上面只是一些写法，没有包(package)玩个毛啊，导入有什么用。

这个时候勤劳聪慧而又闲着没事的人就各种写lib给大家用。

社区的重要性由此体现。

模块化到这里解决了吗？依旧没有。

事实上是这样写出来的代码。到今天为止(2016-02-23)，没有一款浏览器完全认识。

聪明的前端人又倒腾出了[browserify](http://browserify.org/)这样的东西，简直棒棒的。还有我目前最喜欢的[webpack](https://webpack.github.io/)

还有[babel](http://babeljs.io)，不多说了，我猜读者自己能独立看文档了

到这里，差不多就解决了。

顺便说一句，我个人不太喜欢TypeScript，虽然换来了类型安全和IDE更好的支持还有大型应用解决方案，然而却舍弃了灵动和轻巧的特性。

## 性能

只写200行代码其实没什么问题，写成渣，V8也能优化成超跑。然而二十万行代码呢，处处是事件监听，再监听个像什么`resize`这种事件，碰上IE8这种[坑队友](https://undefinedblog.com/recent-ie-quirks/)。网页基本就崩了。

代码质量是一部分问题了。然而更多的问题还是代码量的增长。

试想多年前的应用，一张页面才几百行的js。性能问题是有，但是也不怎么大吧。

运行性能这种问题其实现在也还好多了，新版浏览器都有性能提升。尤其是[Charka](https://github.com/Microsoft/ChakraCore)好像蛮不错的。

出了运行性能，目前更大的问题应该是加载性能。

现在的代码。好听点儿叫五行。然而动辄100+Kb一个文件。我写的那个网站，源码6k行，压缩合并什么的优化做完之后，一个`vendor`仍旧有`120k`，`index.bundle`有`100k`。好在gzip压缩之后只剩40+20kb左右了。

然而呢，大如Facebook那个量级，几十万行js不过分吧。

如何加载，每个文件都会发起一个http请求，而每个请求消耗资源又很多。Facebook传说有几万套针对不同地区不同人群的不同资源map。如何控制？

他们的解决方案是[big pipe](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919/)，不过没有太多的研究。

目前来说最好的解决方案应该是http2了。然而http2最棒的特性`server push`并没有被nginx实现。所以啊。。。加载性能可不像上面几个问题那样容易解决了。

## 组件化

组件化可以说是SPA比较核心的内容了。多页面组织方式的时候并不需要组件化。因为压根没这种需求。

随着发展，各个页面应该如何展现，应该如何存储，应该如何加载，应该如何构建等等问题都随着出现了。

有些人认为`jsx`是很棒的解决方案，有人认为`Polymer`是很棒的实现。

而在我看来。`.vue`是挺好的方式。主要是对开发友好。jsx写起来略操蛋，反正我个人写着是比较别扭。不过不得不称赞jsx确实是一个挺棒的东西。

不过组件化一定会继续发展，拭目以待。

## 数据流

好了，到了最重要的部分了。

数据流绝对绝对是大型项目中最可怕的东西。

依旧以Facebook的项目为例(他们自己说的)。一个用户，点开未读消息列表，然后跳转到另一个页面，理论上这个消息列表应该已经被阅读过了。然而实际上可能会由于其他的什么原因，又更改了状态。导致这货又出现了。结果一遍又一遍的出现。对于我这样的强迫症来说，这样的体验简直要砸电脑。

一定要注意，是大型项目，大型项目。一般小型项目只有几个触发点，项目跟进者想想也能想起来。不然翻翻文档也就差不多了。

然而大型项目何止几个触发器。热门模块几十上百个触发器都可能。

问题来了。我到底如何管理如此混乱而且庞杂的数据系统。

举一个非常容易理解的场景：移动端都会有导航条。用户点击菜单按钮会触发导航条显示。然后再点击一次就会隐藏。或者点击其他地方也会隐藏。

简单的。如何控制这个显示隐藏状态？

{% highlight js %}
let current_state = true // true: show.   false:hide
const nav = document.querySelector('#nav')
nav.addEventListener('click', e => {
    if( current_state ) {
        // 当前是显示的状态
        nav.style.visibility = 'hidden'
        current_state = false
    }else {
        nav.style.visibility = 'visible'
        current_state = true
    }
}, false)
// 其他事件同上
{% endhighlight %}

看起来没什么问题？试着重复几十次，再看看这个状态还算清楚？到底是哪个事件修改的状态？

再来个问题。

整个页面组件化了之后，每个组件的数据如何控制。一般来说导航栏会是一个组件，导航按钮会是一个组件。两个组件间的数据传输问题也不容易吧。

单向数据流非常棒的解决了这些东西。

一个操作对应修改一个状态。状态修改之后触发操作进行另一个已注册的函数。

## RxJS

现在有个更新的解决方案。[RxJS](https://github.com/Reactive-Extensions/RxJS)。有兴趣的看一下吧。我是真没精力倒腾这个了。

关于资料，推荐的英文资料是[这个](http://xgrommx.github.io/rx-book/index.html), 中文资料[在这里](https://segmentfault.com/a/1190000004293922)

:)