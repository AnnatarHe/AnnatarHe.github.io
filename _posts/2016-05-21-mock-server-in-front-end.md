---
layout: post
title: 前端的 mock server
tags: js fe mock
---

在一个中大型项目中，你不可能一边写着前端一边写后端。全栈太难 :)

像rails那样的开发模式已经很不适合当前的环境了。所有的项目都嚷嚷着**前后端分离**，那就只能这么干

我之前在做大学狗们的时候，在mock数据这一块曾经特别难受

虽说整个前后端我都能掌控，但是因为整个前端是一个repo，后端又是一个，我在开发的时候又不能开着两个编辑器(有一段时间这么干过)，而且十分不想在自己电脑上安装那么多东西。

一开始的解决方案很扯淡：

## 后端Mock方案

不想在自己电脑上安装那就连远端服务器吧。反正学生优惠的Server超级便宜，而且再开个二级域名没有任何损失。

说干就干。

在远端开发服务器上先把后端拉下来，搞数据库。是laravel做的，所以mock数据也还是挺轻松的。整个一套弄下来了。

然后给Nginx加上跨域的header。

好了，到这里服务端就完成了。

虽然很不舒服，但还是能忍受对吧。然而扯淡的在前端

前端要发请求，所以每个请求的url都是`http://dev.foo.com/`，而生产环境服务器又是`http://www.bar.com/`。

我想出了一个"聪明"的法子：在所有请求前面加上一个prefix，在dev环境就设置成`http://dev.foo.com/`, 生产环境就改过来。这样所有请求的prefix就是个变量，在release之前替换一下就可以了！

天才！

就像是这样

{% highlight js linenos %}
// release前修改
const prefix = 'http://dev.foo.com/'

// 其他文件中
fetch(`${prefix}/api/users`).then(res => res.json()).then(data => todo(data))
{% endhighlight %}

然后我改字符串的时候就哭了&#9785; 如果你愿意读一下[源码](https://github.com/AnnatarHe/daxuedogs-web-client)，你会体会到我当时崩溃的心情，这里还残留着这个方案的痕迹

不过说真的，虽然这套方案问题相当大，然而它确实是有用的，支撑了我好几个月。

难以忍受这套方案的同时我也在寻找好的解决方案。

## 前端Mock方案

因为我是在校生嘛，没办法了解到大公司的开发方式。在这个痛点发生以后就一直关注这方面的内容。

我一直想在webpack-dev-server这边做个中间层，把这个server做成完整后端那种的，包含路由什么的，直接返回json。

因为一直考虑其他的事情，一直拖着没做，另外也觉得webpack这套东西好像也有点儿复杂，不太愿意碰。

其实还有个问题，我相信mock这一块大公司肯定碰到的比我早，为什么我没有搜索到这样的包？是他们不愿意这么做还是有更好的解决方案？

最近总算是找到了个还算靠谱的一套方案，流程是这样的：

首先开一个mock server，只有路由功能，返回假数据。

在webpack-dev-server中加上proxy，把对server的请求都转发给proxy，因为是后端做的，所以不存在跨域的东西，可以很逼真的模拟。

这套方案就很棒，完全不用修改请求url。

![mock server](/images/mock_server/mock_server.png)

说干就干：

{% highlight console %}
$ npm install --save faker
$ npm install -g json-server
{% endhighlight %}

在项目目录下创建`mock`目录，然后做路由和数据

{% highlight js %}
// mock/db.js
'use strict'
const faker = require('faker')

module.exports = function() {
    let data = {
        'activity': [
            {
                id: 0,
                title: faker.lorem.words(),
                img: faker.image.image()
            }
        ]
    }
    return data
}
{% endhighlight %}

路由文件，主要把对`/api/*`的请求转到`/*`，主要是简单一些

{% highlight json %}
{
    "/api/": "/"
}
{% endhighlight %}

然后把这个mock server 起一下吧

{% highlight console %}
$ json-server mock/db.js --routes mock/routes.json --port 9999
{% endhighlight %}

剩下的是webpack那边的配置了。核心是这些：

{% highlight js %}
const config = require('./webpack.config')
config.devServer = {
    hot: true,
    inline: true,
    proxy: {
        '/api/*': {
            target: 'http://127.0.0.1:9999',
            secure: false
        }
    }
}
module.exports = config
{% endhighlight %}

好了，配置也可以了。

{% highlight console %}
$ webpack-dev-server --process --colors --hot --inline --devtool eval --config webpack.dev.config.js
{% endhighlight %}

所有的事情都做完了，只剩下测试了

找个入口文件测试一下：

{% highlight js %}
fetch('/api/activity').then(res => res.json()).then(data => console.log(data))
{% endhighlight %}

ok。把我折腾了这么几个月的前后端总算是彻底分开了

## 问题

这套流程的最大问题在于json-server这么个东西，因为是纯粹的**RESTful**的server。同样是上面的配置为例：

{% highlight console %}
GET /api/activity
POST /api/activity {title: 'foo', image: '/foo.jpg'}
PUT /api/activity/1 {title: 'bar', image: '/bar.jpg'}
DELETE /api/activity/1
{% endhighlight %}

对RESTful有了解就明白了，分别对应的是**获取**, **创建**, **更新**, **删除**操作

当然还有更多的json-server的设置，比如查询，关系什么的，底下我会给链接。

这些东西可以说设计是很不错的。然而也是问题。

老系统完全不能用。或者设计不够好的系统根本不能用。

可能后端就任性！，就不遵守REST API，那么这个前端mock只能靠`routes.json`来调整，然而更多的情况是没办法调整的。

所以啊，这个mock server方案对后端要求很严格

## References

* [你是如何构建 Web 前端 Mock Server 的？](https://www.zhihu.com/question/35436669)
* [JSON Server](https://github.com/typicode/json-server)
* [faker.js](https://github.com/Marak/faker.js)
* [Egghead.io free video tutorial - Creating demo APIs with json-server](https://egghead.io/lessons/nodejs-creating-demo-apis-with-json-server)