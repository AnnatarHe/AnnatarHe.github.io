---
layout: post
title: JavaScript 装逼指南
tags: js javascript
---

## Sumary

本文秉承着

> 你看不懂是你sb，我写的代码就要牛逼

的理念来介绍一些js的装逼技巧。

下面的技巧，后三个，请谨慎用于团队项目中(主要考虑到可读性的问题)，不然，leader 干你没商量。

## Boolean

这个技巧用的很多，也非常的简单

{% highlight js %}
!!'fuck'
{% endhighlight %}

通过两个取反，可以强制转换为Boolean类型。较为常用。

## Number

这个也特别简单，String转化为Number

{% highlight js %}
+'45'
+new Date
{% endhighlight %}

会自动转化为number类型的。较为常用。

## IIFE

这个其实非常有实用价值，不算是装逼。只是其他语言里没有这么玩的，给不太了解js的同学看那可牛逼大了。

{% highlight js %}
(function(arg) {
    // do something
})(arg)
{% endhighlight %}

实用价值在于可以防止全局污染。不过现在随着ES2015的普及已经没什么必要用这个了，我相信五年之后，这种写法就会逐渐没落。

自己干五年，在实习生面前装逼用也是蛮不错的嘛~

## Closure

闭包嘛，js 特别好玩的一个地方。上面的立即执行函数就是对闭包的一种运用。

不了解的回去翻翻书，知乎上也有很多讨论，可以去看看。

闭包用起来对初学者来说简直就是大牛的标志(其实并不是)。

{% highlight js %}
var counter = function() {
    var count = 0
    return function() {
        return count++
    }
}
{% endhighlight %}

上面用到了闭包，看起来还挺装逼的吧。不过好像没什么实用价值。

那么这样呢？

{% highlight js %}
var isType = function(type) {
    return function(obj) {
        return toString.call(obj) == '[Object ' + type + ']';
    }
}
{% endhighlight %}

通过高阶函数很轻松的实现判定类别。(别忘了有判定Array的Array.isArray())

当然，很明显，这只是基础，并不能更装逼一点。来看下一节

## Event

事件响应前端肯定都写烂了，一般来说如何写一个计数器呢？

{% highlight js %}
var times = 0
var fuck = document.querySelector('.fuck')
fuck.addEventListener('click', function() {
    times++
    console.log(times)
}, false)
{% endhighlight %}

好像是没什么问题哦，但是！变量`times`为什么放在外面，就用了一次放在外面，命名冲突了怎么办，或者万一在外面修改了怎么办。

这个时候这样一个事件监听代码就比较牛逼了

{% highlight js %}
fuck.addEventListener('click', (function() {
    var times = 0
    return function() {
        times++
        console.log(times)
    }
})(), false)
{% endhighlight %}

怎么样，是不是立刻感觉不一样了。瞬间逼格高了起来！

通过创建一个闭包，把`times`封装到里面，然后返回函数。这个用法不太常见。

## parseInt

> 高能预警
> 
> 从这里开始，下面的代码谨慎写到公司代码里！


`parseInt`这个函数太普通了，怎么能装逼。答案是`~~`

现在摁下`F12`，在console里复制粘贴这样的代码：

{% highlight js %}
~~3.14159
// => 3
~~5.678
// => 5
{% endhighlight %}

这个技巧十分装逼，原理是`~`是一个叫做**按位非**的操作，会返回数值的反码。是二进制操作。

## Hex

十六进制操作。其实就是一个`Array.prototype.toString(16)`的用法

看到这个词脑袋里冒出的肯定是CSS的颜色。

做到随机的话可以这样

{% highlight js %}
(~~(Math.random()*(1<<24))).toString(16)
{% endhighlight %}

底下的原文链接非常建议去读一下，后三个技巧都是在那里学到的。

## <<

左移操作。这个操作特别叼。一般得玩 *C* 玩得多的，这个操作会懂一些。一般半路出家的前端码农可能不太了解(说的是我 &#9785;)。

这个也是二进制操作。将数值二进制左移

解释上面的`1<<24`的操作。

其实是1左移24位。`000000000000000000000001`左移*24位*，变成了`1000000000000000000000000`

不信？

试着在console粘贴下面的代码

{% highlight js %}
parseInt('1000000000000000000000000', 2) === (1 << 24)
{% endhighlight %}

其实还有一种更容易理解的方法来解释

{% highlight js %}
Math.pow(2,24) === (1 << 24)
{% endhighlight %}

因为是二进制操作，所以速度是很快的。

## BTW

{% highlight js %}
[].forEach.call($$("*"),function(a){
    a.style.outline="1px solid #"+(~~(Math.random()*(1<<24))).toString(16)
})
{% endhighlight %}

翻译成正常语言就是这样的

{% highlight js %}
Array.prototype.forEach.call(document.querySelectorAll('*'), dom => dom.style.outline = `1px solid #${parseInt(Math.random() * Math.pow(2,24)).toString(16)}`)
{% endhighlight %}

## Others

其他的，像是一些**await**, **Decorators**什么的。用上**TypeScript**基本就懂的东西我就不介绍了。

祝愿大家越玩越牛逼

## References

* [从一行代码里面学点JavaScript](https://www.sdk.cn/news/3025)
* [深入浅出Node.js](https://www.amazon.cn/%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BANode-js-%E6%9C%B4%E7%81%B5/dp/B00GOM5IL4/ref=sr_1_1?s=books&ie=UTF8&qid=1461059069&sr=1-1&keywords=%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA+node.js)
* [JavaScript高级程序设计](https://www.amazon.cn/JavaScript%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1-%E6%B3%BD%E5%8D%A1%E6%96%AF/dp/B007OQQVMY/ref=sr_1_1?s=books&ie=UTF8&qid=1461058289&sr=1-1&keywords=javascript+%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1)
* [JavaScript设计模式与开发实践](https://www.amazon.cn/JavaScript%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B5-%E6%9B%BE%E6%8E%A2/dp/B00XJ2AU3S/ref=sr_1_1?s=books&ie=UTF8&qid=1461059025&sr=1-1&keywords=javascript+%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F%E4%B8%8E%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B5)