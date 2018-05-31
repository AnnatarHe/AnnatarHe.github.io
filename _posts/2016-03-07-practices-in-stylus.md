---
layout: post
title: Stylus 实践
---

挺长时间没写过干货了。这两天写点儿技术类的东西好了～

## 实践

秉着谦虚的态度，没有加上"最佳"两个字。然而我觉得在中小型项目中，这些实践还是很棒的

## 目录结构

目录结构非常重要。

分解的细一点，对后期的维护和理解很有帮助

比如这样

{% highlight console %}
|--src
    |--styles
        |--index.styl
        |--normalize.styl
        |--variable.styl
        |--global.styl
        |--form.styl
        |--button.styl
        |--table.styl
        |--animate.styl
        |--modal.styl
        |--alert.styl
        |--helper.styl
        |--others.styl
        |--components
            |--header.styl
            |--footer.styl
            |--others.styl
{% endhighlight %}

这样，这个项目的样式文件按照功能分开了。只需要在引入一个`index.styl`编译出来就可以了。

`index.styl`文件不做任何事情，只是引入所有的文件。

`normalize.styl`初始化样式，在`index.styl`中第一个引入。

`variable.styl`变量，全局要使用的变量被写在这里。比如字体样式，颜色，图片大小

`global.styl`全局样式，一般都是`body`元素的样式。比如`font-size`会影响到`rem`的大小嘛，写在这里。然后是`a`标签的样式什么的。一般第二个引入。

`form.styl`表单样式，其他的省略了。

`animate.styl` 动画样式，一般用Vue会有转场动画，把动画样式写在这里面好控制一些。

`modal.styl` 其实这个模块不应该写在这里，但是考虑到做出来代码量其实不少，而且要给各种不同的变种。所以还是写在这里。

`alert.styl` 理由同上

`helper.styl` 一些辅助函数，用以给其他模块`@import`的。

`others.styl` 其他，可以做一些媒体查询(media query)什么的

`components/` 这是文件夹，如果是vue就不用做这么个文件夹，可以直接写文件里。React还有css in js这样的东西。这个文件是为了给其他不使用框架的情景使用的。

上面借鉴了Bootstrap的目录划分

## index.styl

上面说了，这个文件主要是引入其他的文件。而引入顺序是非常重要的。

{% highlight stylus %}
@require './normalize'
@require './global'
// 引入其他全局文件

// 然后引入 components/ 下的样式
{% endhighlight %}

我想都明白

## helper.styl

这里主要写一些辅助的函数，类什么的。比如总结出的**clear fixed**什么的。还有媒体查询。我一般写flex的helper函数

{% highlight stylus %}
@import './variable'

flex-design()
    display flex
    flex 1
flex-center()
    justify-content center
    align-items center
{% endhighlight %}

只要需要的时候引入一下就可以用了。特别好用。常用函数都可以总结一下放在这里

## Flex

Flex其实兼容性还是可以的。Android 4.4就全都支持了(逃...)。PC端兼容性到**IE 10**呢!

而且flex布局其实非常的爽。想想一般情况下如何居中对齐。大概是用`line-heigh`吧。然而又和父元素高度耦合了。

再想想如何适应屏幕折行。就像我这个博客站点的导航条，你可以试试小屏幕和大屏幕的感觉，就是用了flex布局的wrap属性。

扔掉旧浏览器，开开心心的迎接新规范吧～

## 编码规范

无论如何先安利[Vue](http://vuejs.org)。我一直觉得这样写着比jsx要开心很多

![vue]({{ site.cdn }}/vue.png-copyrightDB)

好了，说说我自己的stylus编码规范

### No;

没有分号。分号有很多很多缺点，少打一个分号，一辈子下来能省出来一两年也说不定。而且，分号特别的丑！特别的丑！

看看Vue源码，根本不存在分号。读起来赏心悦目

最后，听说不写分号的jj长5cm(严肃脸)

### 尽量不写:

理由同上！不写分号。当然，不得不写的时候还是要写一下的

### 至多四层嵌套

浏览器对CSS文件的解析是从右至左的。一般情况下四层以内影响不大。然而大于四层就会产生性能问题。所以建议至多四层嵌套。

### BEM

命名尽量使用BEM规范。**Block**, **Element**, **Modifier**，类名像是这样的`alert--warning`

带来的好处是易于维护，易于理解，易于协作

{% highlight stylus %}
@import './variable'

.alert
    width 100%
    border-radius .5rem
    &--warning
        background-color $alert-warn-bg-color
        color $alert-warn-font-color
    &--info
        background-color $alert-info-bg-color
        color $alert-info-font-color
{% endhighlight %}

是不是很清晰。

这里有一些资料，需要的可以看看

* [BEM 101](https://css-tricks.com/bem-101/)
* [BEM思想之彻底弄清BEM语法](http://www.w3cplus.com/css/mindbemding-getting-your-head-round-bem-syntax.html)
好了，就这样了。有了什么好东西再写出来啦。
