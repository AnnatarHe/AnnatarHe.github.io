---
layout: post
title: Tinker 小技巧
---

首先祝自己生日快乐啦 ^_^

## What's the tinker ?

`Tinker`是laravel带的一个命令行的php交互工具。

有时候一个很简单的测试可能需要在代码里改东西，然而可能只会写一行代码。

这种工具学名叫做[REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)，
Ruby有irb，node也有console，python有，而php没有。

之前的调试是异常痛苦的，一个中型项目，只需要测的是ORM，然而还得在controller里写好多东西，还得加上var_dump

然而有了tinker，一切都变得好用了。

Tinker只是在laravel中的名字，其实人家真名叫做[psysh](https://github.com/bobthecow/psysh/)。

非常的好用。

安装这种东西我就不说了，他们的readme写的很好。

## Basic

很简单的，先写上几行简单的：

{% highlight console %}
$foo = 'bar';
echo $foo
{% endhighlight %}

很简单的，就像是在chrome的console里面写代码一样。

## ORM