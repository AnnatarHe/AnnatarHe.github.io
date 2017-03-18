---
layout: 'post'
title: 近期工作踩坑和学习总结
tags: js web 坑 http
---

## Array.prototype.sort

这个地方是实现不同而导致的问题，而且我认为这属于一个比较重大的坑。

表现上是：javascriptCore 和 webkit 两者的结果返回是不一致的。

{% highlight js %}
// 在chrome中：
[1, 10, 100].sort(x => 10 - x)
// <- [10, 100, 1]

// 在safari中：
[1, 10, 100].sort(x => 10 - x)
// <- [100, 1, 10]
{% endhighlight %}

规避这个坑有两种解决方案：

1. 自己手动写一个排序

2. 将对比中间值插入到需要对比的`Array<Object>`中。对比参数中拿到两个值，这样相比较。

{% highlight js %}
[{a: 1}, {a: 10}, {a: 100}].map(i => {
    i._tmp = 10
    return i
}).sort((p, c) => p._tmp - c.a)
.map(i => {
    delete i._tmp
    return i
})
{% endhighlight %}

## table in iOS

ios里面的tbody有个属性，如果不检查会导致在iOS上显示出多余的空白部分。

iOS中的样式是这样的：

{% highlight css %}
-webkit-border-horizontal-spacing: 2px;
-webkit-border-vertical-spacing: 2px;
{% endhighlight %}

解决方案是重置这两个属性

## td 中使用 flexbox上下居中

同样是在iOS中才会出现的问题。很操蛋。解决方式还好了，可以用其他的上下居中方案。网上一搜一大堆。

## fetch

这个坑只有用fetch才会有，其实说坑也不合适，算是文档没有细读吧。

表现形式：fetch发送的请求，服务端set-cookie，然而客户端并不会保存cookie。然而转成XMLHttpRequest就不会有问题。

解决方案：需要刷一下fetch关于`credentials`字段的解释。

fetch里这个`credentials`字段有三个参数，分别是：忽略，同源策略，全部。所以基本上只要设置成同源策略就可以了。

而XMLHttpRequest默认就是同源策略，所以不会产生问题。

## css文字截取

文字截取最简单的方式是用这样CSS属性。js难度很大。

这个方案的问题在于兼容性，以为是一个私有属性，其实实际看来还好。

{% highlight css %}
-webkit-line-clamp: 3; // 这个表示行数
overflow: hidden;
flex-direction: column;
-webkit-box-orient: vertical;
display: -webkit-box;
{% endhighlight %}

## Thanks

谢谢 @可诚 的指导，让我学会了很多。感谢。

## 最后

我是应届生，需要一份上海的工作。能写前端能写中间层。如果对我有兴趣欢迎发邮件给我：**iamhele1994@gmail.com**

(又要找工作了，好烦)

