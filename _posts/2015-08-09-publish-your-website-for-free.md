---
layout: post
title: 免费发布网站的几种方法
Tags: website pages SAE
---

## Sumary

本篇文章简要介绍几种`免费`发布网站的方式，旨在测试只用

## For

这篇文章仅适用于刚刚学习`Web`开发的同学。会写基础的`HTML/CSS`即可。

如果你是老手，玩转`JavaScript`三十年，怒写`Java`五千行，那我想这篇文章不太适合你。

## Ways

这里我简要介绍三种方法，其实确切的说也可以是两种。

* Github pages
* Gitcafe
* SAE

## Github pages

首先要会用`Github`。

之后，你可以在这里找到官方的介绍[Github pages](https://pages.github.com/)

这里比较推荐的是使用[Jekyll](http://jekyllrb.com/)，当然，你对`Node.js`比较喜欢也可以用[Hexo](https://hexo.io/)

我个人的站点用的是`Jekyll`，我觉得可能更方便一些。

### Static Pages

你可以直接写静态的页面，如果你是纯新手的话。

当然，会玩`Github`的应该都不是完全的小白了吧。这个时候可以参考一下**Jekyll**的文档

其实语法非常的简单，只要会基本的`HTML/CSS`就差不多了。

推荐先看文档。

### Dynamic Pages

这里有一个[Happypeter](https://github.com/happypeter)老师的视频教程[使用 Jekyll 快速搭建优秀的网站](http://haoduoshipin.com/v/113)。

讲的浅显易懂。

基本看完了以后就可以自己做出博客来。

那么还有一些高级一点儿的功能需要看看文档才能知道的一些东西。比如`分页`，`分类`什么的。

其实你也可以参考我的博客，就是你现在看到的这个博客。源码：[AnnatarHe.github.io](https://github.com/AnnatarHe/AnnatarHe.github.io)

### Markdown

这里有一点非常的重要，就是`Markdown`的语法问题。

这一点`Jekyll`非常有意思，用的引擎是`Kramdown`，和正常的`Markdown`语法略有不同，具体有什么不同，你需要自己去官网看。整个文档量比较少。如果这些东西都看不下去，那我感觉可能程序员的路子不太适合你了。

[kramdown Syntax](http://kramdown.gettalong.org/syntax.html)

好吧，我承认是因为我现在写的和解析的代码会有冲突，如果介绍这些语法，一会儿只能接`Github`的报错邮件了。

## Gitcafe

我知道你肯定不会满意`Github pages`的速度，毕竟在国外，速度是没办法跟国内比。

这个时候`Gitcafe`就来救场了

[Gitcafe](https://gitcafe.com/)是一个和`Github`很像的国内代码托管网站。


这个网站我没有使用过，不过看起来蛮不错的。

这里同样有一个视频教程[gitcafe 上托管网页的另一种形式](http://haoduoshipin.com/v/159)

## SAE

SAE 全称是`Sina Application Engine`

它是用`PaaS`(Platform as a service)提供服务。有流量才会有费用。

对于创业来说，我觉得挺不错的。毕竟前期流量不会太大。

如果流量低根本不担心花钱，比如我的这个测试站点。。。。到现在没花一毛钱。我好想哭

因为我是写PHP的，所以你可以看到我的测试站点[hele](http://hele.sinaapp.com/)，当然，我什么都没写：
{% highlight php %}
<?php 
echo phpinfo();
 ?>
{% endhighlight %}

就酱。

## Conclusion

`Github pages`更适合前端程序员一些，就是主要写*Html/Css*的同学

而`SAE`更适合后端程序员，比如写一些`Java`,`PHP`的同学。也可以是创业的同学。

`Github pages`更加的简单方便一些，写写`Markdown`再运行三板斧一切就搞定了：
{% highlight bash %}
$ git add .
$ git commit -m "lorm"
$ git push
{% endhighlight %}

而`SAE`就是适合那些特别能折腾的同学，又要写这个，又要写那个的。

## Experience

我当年是买的新网的虚拟主机，50块一年，然后开始建站，边学边写，当初也是蛮苦的，版本迭代非常的快，差不多一两个月就重写一次。

后来感觉水平差不多了就懒得这么折腾了。干脆就切换到了`Github pages`上面了，现在写起来真的是非常的轻松。

只要做一些HTML/CSS，甚至连`JavaScript`不想写的时候都可以不写。简直舒爽。

好了，全是个人意见，这一篇只是简要介绍一下而已啦。