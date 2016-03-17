---
layout: post
title: 通过HTTPS 访问 github pages
---

> 你永远不知道用户看到的是哪个狗日的运行商贴的广告

我之前写过几篇关于https的文章。除了这个博客都走的https。

博客一直是我的一块心病，万一哪天一大牛来看我博客结果被操蛋的ISP给赶跑了我找谁哭？

今天偶然间找到了一篇文章，才发现原来github pages自带https的！

## 访问https

如你所见，博客是构建在github pages上的。jekyll做的。主题借鉴了[happypeter](https://github.com/happypeter)，做了一些修改。

好了，来看看如何启用https。

只需要在地址栏输入*https*就可以了！

## 搜索引擎

当然，https跑起来了要告诉搜索引擎的。只需要在head里加入这样的一句。

{% highlight html %}
<link rel="canonical" href="{ { site.url } }{ { page.url } }" />
{% endhighlight %}

注意两个花括号之间没有空格。

这里要注意得在`_config.yml`里修改**site.url**的值，[就像这样](https://github.com/AnnatarHe/AnnatarHe.github.io/blob/master/_config.yml#L3)

## 强制https

很抱歉，因为是静态站点，服务端不归我们管，只能通过js的方式来达到效果。

{% highlight js %}
'use strict'
(function() {
    window.addEventListener('DOMContentLoaded', function() {
        if ( window.location.protocol.indexOf('s') < 0) {
            window.location.protocol = 'https'
        }
    })
})()
{% endhighlight %}

你可以打开devTools来看，我开了sourcemaps的，会看到我就是这么做的。

## 自定义域名

自定义域名需要用[CloudFlare](https://www.cloudflare.com/)，我懒的做翻译了，需要的可以看这篇博客[为Github Pages博客添加SSL支持](https://blog.ishell.me/a/github-pages-with-ssl.html)

或者[原文](https://konklone.com/post/github-pages-now-sorta-supports-https-so-use-it)

BTW，最近尝试了[let's encrypt](https://letsencrypt.org/)很棒而且简单，主要是逼格满满！
