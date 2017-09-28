---
layout: post
title: Athena 刚刚发布了第一版
tags: Athena full-stack code
---

## 概览

首先， **Athena** project 是一个图片展示网站，最开始收到安卓版本的*福利满满*启发，无奈后来我整个迁移到了苹果家，而 iOS, Mac 上并没有这么优秀的应用。

所以我大概在 2017 年年初就开始用 Go 写了爬虫，做了非常简单的服务端和 webapp

直到七月份之前，commit 记录其实是比较少的，而之后，和我熟悉的朋友可能了解到发生了一些变故，所以写这个项目的时间宽松了起来。再加上正在学原生应用，所以就完全重构了起来。

什么？你还不知道这个项目是干嘛的？

从你登录进去就可以看到满满的妹子，而且质量非常高。（当然，前提是你能登录得进去）

## 背景

这个项目基本上就是在各种玩。所以你可能在里面看到很多新潮的 Browser API。

代码经过了一些重构，而且基本上也是等待着下次重构的状态。我看过了一些老代码，写得不是很好，但是又不能动，已经变成了魔鬼。而我立志是不能写出这种东西出来。

这个项目就是在瞎玩，所以用上了 GraphQL 架构，感受了一下这种新的开发方式。下面的内容会有一些涉及，所以如果你准备在项目里用 GraphQL，可以先看一下。

关于 Android, iOS，都是在学习，没有什么新的好玩的东西。 iOS 我基本上能用 Storyboard 的就没有手写。。。可能会被一大波 iOS 程序员鄙视了。

那么接下来介绍一些这个项目中的各个部分吧。

## 爬虫

项目地址： [AnnatarHe-Athena/crawler](https://github.com/AnnatarHe-Athena/crawler)

一开始项目是用 Go 写的，正好和 server 那边相照应，可以用同样的 model 层，少写些代码。

后来逼着自己学了一点儿 Python，发现 Scrapy 简直是神器。从来没有见过思想这么棒的爬虫，果断拿过来重构了一遍，代码清晰了很多。

爬虫分为三个主要爬虫，分别用来爬取不同的网站。一个数据清理的 pipeline，接入了人脸识别，因为从微博和知乎扒出来的数据不一定全都是我们期望的数据，也有可能存在一些美食，风景之类的，所以对于这两个源站的数据，过了一遍一脸识别，通不过的只能被丢弃。最后有一个存入数据库的过程。


其中我比较担心有 IP 封禁的问题，所以还写了一个超级简单的 dom 解析，拿到可用ip。不过没有发 http 的部分，我写了一半的时候才想起来应该用 python 来实现，而且当时 IP 这个事情其实并没有那么严重，所以现在还是待在源码里，暂时还没有改进，这是未来一个需要改进的地方。

爬虫中存数据库的部分，如果你认真看会发现我并没有用 `executeMany` 这样的接口，我其实一开始也认为批量更新是一种很好的维护性能的方式，然而看了文档发现可能并没有我期望的那么美好。

[executeMany](http://initd.org/psycopg/docs/cursor.html#cursor.executemany)

> Warning: In its current implementation this method is not faster than executing execute() in a loop. For better performance you can use the functions described in Fast execution helpers.

爬虫模块目前来说已经基本搞定了, 短期内应该不会做大的改变了。

// TODO: 一个IP池生成，三个爬虫，一个过滤器，一个数据库，图片展示

## Server

[AnnatarHe-Athena/server](https://github.com/AnnatarHe-Athena/server)

Server 模块最开始也是用 Go 写的，带上了 revel 框架。 最开始是很单纯的 RESTful API，接口也只有一个。就是展示数据。后来想了想需要加入用户模块，这样可以收藏，点赞了，是不是很棒棒，而且也要允许用户上传自己收集的图片。

正好那个时候接触到了 GraphQL, 所以顺手就拿来做这个项目了。修改的时候其实还是蛮辛苦的，查了一些资料，读了一些文章，又抄了 sample，才算是理解了 GraphQL 的用法和思想。

其实 GraphQL 想解决的一个重要的点就是分散的请求。当项目大了以后，如果是传统的 RESTful 结构，往往需要请求几十个接口，这样发了几十个 HTTP 一方面用户会觉得比较慢，另一方面服务器压力也大。而换成 GraphQL 之后，可以在首页直接发一个 GraphQL 请求，里面塞进几十个需要的 service。 服务器一次性收到, GraphQL 验证信息，转发给对应的 resolver 去处理。最后统一回复给 GraphQL Service，然后塞进一个大的 Response 返回给客户端。

我不太了解后端微服务，我认为这样可以更好的减少耦合。

思想很好，做法也还不错。不过，它并不成熟。

是的，我认为这套方案还有不成熟的地方。第一点就是 `middleware` 层(revel 中叫做 Interceptor) 相对于传统 RESTful 来说变得很不明确。传统 RESTful， 比如 Koa, 可以非常方便清晰地针对每个请求加入各自适用的中间件，然而，事实上 GraphQL 只能在自己的 Resolver 内部来做这件事。目前来说我并没有发现有什么好的方案可以解决这个问题。

```js
app.get('/auth', validParams, ipCheck, (req, res) => {
    return { token: 123 }
})
```

第二点，工具链不成熟。或许这一个缺点应该放到客户端去说明。

其他的话, Golang 写服务端，既然用上了 GraphQL 就没有必要再用什么 MVC 框架了。 View 层基本上被大前端包揽了，Controller 被 GraphQL 承担了一部分。 所以如果你新启动项目可以试着不用框架，自己手撸。我是因为写得有点儿多了，耦合挺重的，而且目前还挺好用，就没有干掉。

其实我是准备后端上微服务架构的时候拿 Java 干掉这一层的，哈哈。

## Webapp

[AnnatarHe-Athena/webapp](https://github.com/AnnatarHe-Athena/webapp)

我的职位毕竟叫前端，所以这一块的代码我是挺自信的。用了对我来说最稳的 React 方案。带上了 Redux-saga, react-router@v3, styled-components.

前端这一块和 GraphQL 结合的框架用的是 [Apollo](http://dev.apollodata.com/) 的方案，觉得它比 Relay-Modern 更加简单易懂，而且社区支持度更好。

页面主要分为 *auth*, *profile*, *photos* 这三块，至于其他两个客户端也基本上是这样。

通过 auth 之后，服务端返回的 token 和后端 API 沟通。

你可能会问为什么我选择 react-router@v3，而不是版本 4。 其实我有尝试过的，不过感觉它并不是我想要的东西，我希望我的路由可以整整齐齐地排列在某个地方，而不是东一块，西一个的。 还有一些其他各种各样的原因吧。

对了，关于新启动项目，可能会有很多人很厌烦配置各种各样重复的 webpack 配置，所以我做了一个简单的配置脚本和项目骨架。如果需要欢迎直接拿来用哦：

[AnnatarHe/webpack-template](https://github.com/AnnatarHe/webpack-template)

## Android

花了半个月入门了一下 Java 和 Android。 之前一直感觉 Java 是民工语言。 现在真的仔细往里看发现这门语言是用来建摩天大楼的，技术稍微差一些也很难写出太烂的代码，而其他语言用得稍微不好一点儿就只能盖个小平房，而且到处都是 undefined (说的就是你 JS)。

其实里面没什么好说的，基本上我的安卓水平是那种脚尖刚踩到门槛的感觉。 所以也没有什么出彩的地方。

至于项目进度，是所有子项目中最慢的。基本的图片展示还没做好。 不过脑袋里已经知道代码怎么写了，所以不愁，只要有时间就能加上。

写 Android 有时候会认为是 Web 的进化版，可拖拽组件，组件封装地极好，原生样式定义。还有原生支持的 i18n, 各种分辨率图片存放。 

然而有时候又觉得没有 Web 好，没有一种统一的路由管理，我是指所有的 activity 在一个路由文件中能够根据一个 map 去自动调用。各个 activity 之间的关系就会显得更加明显。

Android 真的很好学，和 Web 感觉没多大差别，可能难的地方也都属于 Java 了。

## iOS

iOS 学得比 Android 早很多，然而我始终不得要领，一直学不会，也不明白其中的思想。 直到最近看了 [Start Developing iOS Apps (Swift)
](https://developer.apple.com/library/content/referencelibrary/GettingStarted/DevelopiOSAppsSwift/) 才算是真正入门了。

其中的图片展示部分已经做完了。正在开发用户模块和登陆模块。

iOS 的 Storyboard 是我见过最强的图形化代码编辑板了。不仅能展示视图，还可以定义路有关系，而且和原生代码的结合也很方便。可以省掉非常大的代码量，使开发只关注业务逻辑的实现。

Swift 我感觉也挺好的，就是 API 变动太大了，用 Java 写多好。

## Schema

由于 GraphQL 需要各种 query 来发请求，还需要定义各种的 fragments, 而且三个客户的需要的基本是相同的。所以单独抽出一个包用来放这些资源文件。

## Artworks

## 项目管理

