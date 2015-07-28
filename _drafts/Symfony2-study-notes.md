---
layout: post
title: Symfony2 study note-1
---


## Install
首先是安装

安装方法去官网自己倒腾。有中文有英文，需要哪个倒腾哪个。   
我只是说个注意事项罢了。
最好不要使用国内的composer源，就是王赛大神做的那个.   
是挺不错的，只是容易出现502的错误。国外的慢了就慢一点儿吧，其实还好。

## Module
然后一定要开启mcrpty的拓展。
Ubuntu下应该是用命令：
{% highlight console %}
$ sudo php5enmod mcrypt
{% endhighlight %}
我被这个问题困扰了小半天。好吧，其实是我根本没看报错信息T_T

对了，还有intl的拓展，我记得是`laravel`的安装需要这个吧。好像`symfony`不需要来着。
1
{% highlight console %}
$ sudo apt-get install php5-intl
{% endhighlight %}
嗯，到这里基本的安装就没什么问题了。

好吧，其实启用的时候还是有点儿问题的。
我目前使用

{% highlight console %}
$ php app/console server:run
{% endhighlight %}
命令来启用的，默认开启

{% highlight console %}
http://localhost:8000
{% endhighlight %}
自己去浏览器倒腾就好了。