---
layout: post
title: 为 Jekyll 站点添加搜索功能
tags: github js
---

随着文章越写越多，页数也随之增加，可是想找到一篇文章的难度有了很大的提升。

本篇介绍我自己做的搜索功能，通过js实现。

你也可以打开dev tools查看本页面的js代码。source map已开。

## 搜索框

首先添加搜索框，我的实现是在navbar添加一个搜索链接，点击会滑出搜索页面，设计功力有限，页面特别丑 T_T

那么余下的是事件的绑定，略去不说，有兴趣的看一下[我的事件绑定](https://github.com/AnnatarHe/AnnatarHe.github.io/blob/master/src%2Fjs%2Fsearch.js#L49)

## 原理

原理很简单，通过在页面上添加js代码，jekyll吐出所有文章数据，形成一个数据源，然后通过input事件触发搜索，遍历对象。然后渲染即可。

## 数据源

我是写在了`footer.html`中。每个页面都会引用此模块，所以搜索功能在所有页面中都可以调用。

[点击这里查看](https://github.com/AnnatarHe/AnnatarHe.github.io/blob/master/_includes%2Ffooter.html#L21)

## 搜索渲染

核心代码是`search.js`，打开dev tools看看。

{% highlight js %}
function handleSearcher() {
    new Promise((resolve, reject) => {
        let searchVal = searchText.value.toLowerCase().trim()
        let res = posts.filter((item) => {
            return (item.title.toLowerCase().indexOf(searchVal) > 0) || (item.url.toLowerCase().indexOf(searchVal) > 0)
        })
        resolve(res)
    })
    .then(res => {
        // contact the dom string
        let domStr = ''
        for (let post of res ) {
            domStr += `
            <li>
                <a href="${post.url}">
                    <span class="title">${post.title}</span>
                    <span class="url">${post.url}</span>
                </a>
            </li>
            `
        }
        return domStr
    })
    .then(domStr => {
        // render it!
        resultDom.innerHTML = domStr
    })
}
{% endhighlight %}

其实很简单，通过Promise分成了三块。

### 搜索

{% highlight js %}
let searchVal = searchText.value.toLowerCase().trim()
let res = posts.filter((item) => {
    return (item.title.toLowerCase().indexOf(searchVal) > 0) || (item.url.toLowerCase().indexOf(searchVal) > 0)
})
resolve(res)
{% endhighlight %}

首先对输入数据处理一下，小写，去空格。

然后用filter遍历，只要存在输入关键字就进行下一步。

### 构造DOM

因为上一步的结果传过来的是数组，所以这里遍历，同时构造DOM树。

没有用createElement的原因在于性能。重复创建100个DOM树所消耗的资源比字符串操作可要大多了。

### 渲染

上一步传过来了构造好的DOM string，这一步就是渲染。我非常粗暴的在父DOM里直接`resultDom.innerHTML = domStr`。

原因依旧在于性能。直接放进去会自动一次性解析DOM树，要比一次次appendChild快多了。

## 问题

你也看到了，问题在于我用了太多的ES2015特性而没有编译什么的。兼容性满打满算也就支持到`chrome 48`左右。

input事件触发的可能太频繁导致一些性能问题。

不过，我的博客而已，不用现代浏览器的我也不欢迎。