---
layout: post
title: 使用下一代的JS
---

## JS

写了有半年多*js* 了, 一开始会耍耍`jQuery`, 现在倒是不太喜欢了。

原因有这些：

1 写 `jQuery` 并不能提升 *js* 水平

2 太重，我之前给女朋友写webapp，在`chrome`环境里运行挺好的，换到她的手机上效果极差

3 Dom 操作性能差

现在感觉还是jQuery好，因为一些原因：

* 并不是所有js代码都在移动端运行
* jQuery写起来更短，更优雅
* 小项目并不在乎性能
* jQuery即使要被时代淘汰，但目前仍旧是用的最多库

这篇文章简要写一下最近用原声 `js` 写出来小东西的心得吧

## Compatibility

我个人一直非常摒弃 `IE` 系列，性能差到爆，写法奇怪，但是偏偏市场占有率有那么高!

我个人做兼容性最多做到`IE10`，坚决不往底下做兼容。

第一，写法操蛋。
{% highlight css %}
// 正常浏览器
.foo {
	opacity: .5;
}
// 非正常浏览器
.foo {
  filter: alpha(opacity=50);
}
{% endhighlight %}
IE的非主流语法我是不想写。

第二，请勿进入。兼容性问题可以屏蔽一部分非理智用户。

我一直认为IE和人的品位是有很大关联的。如此老旧的浏览器还有人用，那么只能证明这个人是什么都不懂。而什么都不懂的人通常素质是有问题的。

正巧，这种人我不欢迎。

第三，促进时代进步。有一种情况我特别的痛心疾首。当墙外的程序员在研究下一代技术的时候，我们却还在倒腾兼容性！

何愁不没落！

我一直很喜欢新的东西，我相信一群程序员没日没夜熬着熊猫眼做出的新产品必定有其优秀之处！

当新式浏览器的市场越大，那么兼容性就会成为需要考虑的事情了，而不是必须的事情。

## The new API

我知道肯定有很多人在用着
{% highlight js %}
var foo = document.getElementById('bar');
{% endhighlight %}
我也知道并不是不会新API的写法，也是考虑兼容性的问题。

但是我不考虑，所以我一直用新的API
{% highlight js %}
const foo = document.querySelector('[data-id=baz]');
{% endhighlight %}

熟悉 `jQuery` 的同学应该很熟悉这样的语法：
{% highlight js %}
$('.foo').on('click', function(){});
{% endhighlight %}
在`IE9`以上的有了这种写法：
{% highlight js %}
const foo = document.querySelector('div');
foo.addEventListener('click', function(e) {
	console.log(e);
});

// 顺带写一个ES6语法的版本
foo.addEventListener('click', (e) => {
	console.log(e);
});
{% endhighlight %}
既然提供了新的接口，那么必定是有提升的，好吧，其实不新了。

## ES6

一定要说一下`ES6` 版本的，就是我上面写的那种。

一开始对于 `ES6` 是拒绝的，因为到了我不熟悉的东西了。

后来写起来就停不下来了。再也不想回到 `ES5` 了

原来的`class` 要用原型链，继承也是，而且写法也比较复杂：
{% highlight js %}
// ES5
function Foo () {
	// 这里是构造函数
}
Foo.prototype.methods = function () {
	// 这里是其余的方法
}

// ES6
class Foo {
	constructor() {
		// 构造函数
	}

	methods() {
		// 其余方法
	}
}
}
{% endhighlight %}
很明显看得出，`ES6`的语法更像其他的OOP语言了，比如`PHP`就是这么写的
{% highlight php %}
<?php 
class Foo {
	public function __construct() {
		// 构造函数
	}
	public function methods() {
		// 其他函数
	}
}
 ?>
{% endhighlight %}
是不是很像，这样就为其他语言转入`js` 提供了更加友好的转入方式，以及更低的学习成本。

当然，我喜欢`ES6` 是因为写法上的优雅，简洁，有力以及 `拥抱改变` 

`ES6`的匿名函数表达式使用了箭头(`=>`)

例如：
{% highlight js %}
const sum = (arg1, arg2) => arg1 + arg2;
{% endhighlight %}
这样的写法使得匿名函数更具有表现力，看起来更加的优雅，舒适。

当然，还有另一个功能，原来写`Ajax`请求的时候需要调用当前对象的其他方法处理`result`，这个时候`this`指针指向的是`Ajax`的处理。就像这样：
{% highlight js %}
// 这里的函数定义就不写了
Foo.prototype.ajax = function() {
	$.get('http://google.com', function(res) {
		// 这里的this指向的其实不是当前对象
		this.otherMethods();
		//由于上面的原因，所以需要调用bind来绑定当前对象
	}.bind(this));
}
{% endhighlight %}
这样的写法让我来说就是。。。非常的不好看，牵扯了太多的坑。

然后`ES6`的写法是这样的：
{% highlight js %}
class Foo {
	ajax() {
		$.get('http://google.com', (res) => {
			// 这里的this对象指的是当前对象，而不是ajax对象
			this.otherMethods();
		})
	}
}
{% endhighlight %}

是不是更加的简单优雅？


## ChangeLog
2015-09-04 开始写
2015-09-05 添加`bind(this)`部分
