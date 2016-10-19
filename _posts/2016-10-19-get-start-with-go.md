---
layout: post
title: Go 语言入门(与js类比)
tags: go js be
---

## 前言

回学校的这么长时间竟然没有写过超过300行的代码。这日子实在是太颓废了。

SICP 暂时看不下去，那么多题静不下心。

可是最近是真的无聊就说新学一门语言吧，刚好公司在用 Go，而且大家都说 Go 语言不错，我就准备学了一下。

## 变量

现在的新语言似乎都不大愿意写冗长的变量声明了。

{% highlight go %}
// 显示声明一个变量的类型
var foo int = 1
// 自动推导
foo := 1
{% endhighlight %}

大部分情况下`foo := 1`的这种短语法就挺好用的

不过我个人对于这个语法还是不喜欢，因为。。。`:`和`=`在键盘上离得好远啊！

js 因为是弱类型的，不需要声明类型。好像会舒服一些。
{% highlight js %}
let a = 1
{% endhighlight %}

## 循环

循环贼灵活，全程都是`for`来做的。

{% highlight go %}
for {
    // do some stuff
}

for variable < 1 {
    variable++
}

for i := 0; i < 1 ; i++ {
    // do some stuff
}
{% endhighlight %}

上面的分别是死循环，条件判定，完整循环。语法就这个样子，对应的js类似于下面的：

{% highlight js %}
while(1) {
    // 第一个 for
}

while (variable < 1) {
    // 第二个 for
}

for (let i = 0; i < 1; i++) {
    // 第三个 for
}
{% endhighlight %}

现在就好理解很多了。

还有遍历map, slice什么的：

{% highlight go %}
for key, value := range someMap {
    // do some stuff
}
{% endhighlight %}

对应的 js 是这个样子

{% highlight js %}
for (let key in someMap) {
    let value = someMap[key]
    // do some stuff
}
{% endhighlight %}

## 结构体

结构体和 C 语言很像

{% highlight go %}
type Foo struct {
    x int
    y int
}
{% endhighlight %}

结构体可以挂在方法。

{% highlight go %}
func (foo *Foo) Print() {
    fmt.Println("foo")
}
{% endhighlight %}

常写js的你肯定想到了什么对吧，这和原型链好像啊！

{% highlight js %}
let Foo = function() {}
Foo.prototype.Print = function() {
    console.log('foo')
}
{% endhighlight %}

简直不要太亲切！

## map

键值对这样的数据在Go中怎么实现是我初学的时候想问的。

{% highlight go %}
foo := map[string]bool{
    "hello": true,
    "world": false
}
{% endhighlight %}

类似于js中的：

{% highlight js %}
let foo = {
    "hello": true,
    "world": false
}
{% endhighlight %}

是不是特别的亲切~

## slice

可变数组，在 Go 中叫“切片”

反正有用就是了。

{% highlight go %}
foo := []string{"hello", "world"}
{% endhighlight %}

类似于 js 中的

{% highlight js %}
let foo = ['hello', 'world']
{% endhighlight %}

## defer

这个关键词可以自动延迟执行。

比如打开一个文件，可以立即写一个 defer 以防后面忘记

{% highlight go %}
file, err := os.Open('file.txt')
defer file.Close()
{% endhighlight %}

js里似乎没有这么牛逼的功能。有点儿叼的。

## function

定义函数很多种方法。

虽说 Go 语言并不是一门函数式语言，但是却也实现了很多函数式语法：

比如：

{% highlight go %}
someFunc := func() func() int{
    // do some stuff
    return func() {
        // return a function
        return 1
    }
}
{% endhighlight %}

相似的是

{% highlight js %}
let someFunc = () => () => 1
{% endhighlight %}

只是 Go 语言是强类型的，所以要在函数声明的时候加上参数列表

对了，首字母大写的表示是暴露出的接口，小字母的是非暴露的。就是**public** 和 **private** 的区别。

那么，自执行函数呢，Go 也有！

{% highlight go %}
foo := func() int{
    return 1
}()
{% endhighlight %}

对应的 js 是这样的：

{% highlight js %}
let foo = (function() {
    return 1
})()
{% endhighlight %}

Go 还有叼叼的多返回值，到这里我就特别想Node也有。

{% highlight go %}
func Hello() (result string, status int) {
    return "hello world", 0
}

res, status := Hello()
{% endhighlight %}

相信我，你会爱上它的


还有 Go 的独有的，牛逼的 `go` 关键字：

{% highlight go %}
names := []string{"Keyle", "Tom", "AnnatarHe"}

for _, v := range names {
    go func() {
        fmt.Printf("Hello, %s", v)
    }
}
{% endhighlight %}

`go`会放到另一个Goroutine中执行，就算不明白什么意思，但是我也觉得一名合格的前端也应该立刻觉得哪里不对。

哈哈，是的。和一些著名的js面试题一样，因为进行的很快，所以最后只会输出“AnnatarHe”，我猜你看到这里应该会改了哦~

{% highlight js %}
go func(name) {
    fmt.Printf("Hello, %s", name)
}(v)
{% endhighlight %}

附上烂大街的js面试题：

{% highlight js %}
for (var index = 0; index < 5; index++) {
    setTimeout(function() {
        console.log(index)
    }, 500)
}
{% endhighlight %}

## End

好了，后面的 Goroutine 和 channel 我还没有完全看懂，毕竟只学了不到一周。

只是觉得和js很像，所以记一下自己所学。

一定要注意，文中的表述并不是完全准确地，如果对 Go 语言感兴趣请去看专业的书籍和官方文档哦。

## References

* [图灵原创:Go并发编程实战](https://www.amazon.cn/%E5%9B%BE%E7%81%B5%E5%8E%9F%E5%88%9B-Go%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B%E5%AE%9E%E6%88%98-%E9%83%9D%E6%9E%97/dp/B00PLLCM9A/ref=sr_1_1?ie=UTF8&qid=1476882931&sr=8-1&keywords=go%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B%E5%AE%9E%E6%88%98)

## Thanks

* [iOTA](https://theiota.cn/)

