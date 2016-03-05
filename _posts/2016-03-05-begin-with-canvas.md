---
layout: post
title: 重学 Canvas
tags: life
---

## Why

我一直觉得自己DOM和服务端的js学的还行。然后就天真的以为自己的js很好了。哈哈，天真啊。

一直没有太在意Canvas，现在倒成了自己的一块痛点。

在[百度前端技术学院](http://ife.baidu.com)看了之前的问题，终于发现自己图形处理上还有很多的东西要做。

静下心来重学下Canvas了

## Line

基于状态绘制图形， 所以下面的代码写出来是看不到效果的
{% highlight js %}
let canvas = document.querySelector('#canvas')
canvas.width = 800
canvas.height = 800
let context = canvas.getContext('2d')

context.moveTo(100, 100) // 移动到 100, 100的位置，左上角为坐标
context.lineTo(x, y) // 线条画到x, y

context.beginPath()
context.ClosePath() // 可以解决线条回到起点的空隙

// 线段的头，圆角和方角
context.lineCap = 'butt' // 可以取值： round, square

// 线条接口处
context.lineJoin = 'miter' // miter 尖角, bevel 衔接, round, 圆角
{% endhighlight %}

## Styles

执行
{% highlight js %}
context.lineWidth = 15 // 线条宽度
context.strokeStyle = 'rgba(255, 255, 255, .5)'// 线条颜色
context.fillStyle = 'teal' // 填充颜色

context.fill() // 填充图形
context.stroke() // 画出边框, 或线条
{% endhighlight %}

## Rect

会直接画出来

{% highlight js %}
context.rect(x, y, width, height) // 绘制矩形
context.fillRect(x, y, width, height) // 填充矩形
context.strokeRect(x, y, width, height) // 画有边框矩形
{% endhighlight %}

## Drwa a Star

一定要看课程[画一个五角星](http://www.imooc.com/video/3488)

{% highlight js %}
/**
 * @param cxt canvas 绘图上下文环境
 * @param r 内圈半径
 * @param R 外圈半径
 * @param x 坐标x
 * @param y 坐标y
 * @param rotation 星星旋转的角度
 */
function drawStar( cxt, r, R, x, y, rotation) {
    context.beginPath()
    for (let i = 0; i < 5; i++) {
        // 大圆的点
        context.lineTo(Math.cos( (18 + i * 72 - rotation)/180 * Math.PI ) * R+ x,
            -Math.sin( (18 + i * 72 - rotation) / 180 * Math.PI) * R + y)
        // 小圆的点
        context.lineTo( Math.cos( (54 + i * 72 - rotation) / 180 * Math.PI ) * r + x,
            -Math.sin( (54 + i * 72 - rotation) / 180 * Math.PI) * r + y)
    }
    context.closePath()
    context.stroke()
}
// context.lineWidth = 10
{% endhighlight %}



## References

* [Canvas绘图详解](http://www.imooc.com/learn/185)
