---
layout: post
title: Laravel study notes
---

今天看了[Laracasts](http://laracasts)的`Laravel`教程视频，感慨很多啊。凭着我半吊子英语都觉得`Laravel`绝对有向`Rails`看齐的能力。   
今天开始做一些小的笔记。顺便也把英文文档的笔记写在这里。供有兴趣的同学参考吧。话说我为毛要把文档也翻译了？因为他们并没有翻译完整，我自个人来呗。[Laravel中文文档](http://golaravel.com)

#Assets
刚好看到Assets，先稍微写一下：
`Laravel`使用[gulp](http://gulpjs.com)来对整理前端依赖的。首先要先把gulp依赖下载下来。
{% highlight console %}
$ npm install
{% endhighlight %}
然后在`glupfile.js`中写这样的东西：
{% highlight javascript %}
elixir(function(mix){
	mix.sass('app.scss').coffee;
	mix.styles([
		'vendor/normalize.css',
		'app.css'
	],'public/output/final.css','public/css');
	mix.scripts([
		'vendor/jquery.js',
		'app.js'
	],'public/output/final.js','public/js');
})
{% endhighlight %}
好了，那么都是什么意思呢？`mix`是mixin的意思哦，第二行首先是把[Sass](http://sass-lang.com)编译成`css`，[CoffeeScript](http://coffee-script.org)编译成`Javascript`，是吧^_^   
然后是混合选定的css文件，怎么选呢？**min.style**的三个参数分别是**被混合的文件名**，**混合后的生成地址**，**被混合文件的所在目录**   
那么同理，`mix.scripts`也是混合喽~   
> Ok,here we go!
这是**jeffery way**老师很开心的一句话~   

那么，如何运行这个命令？好办：
{% highlight console %}
$ glup
{% endhighlight %}
这样就可以了。   
**生产环境**怎么办呢？
{% highlight console %}
$ glup --production
{% endhighlight %}

哈哈，是不是写起来很舒服。我已经要爱上`Laravel`了
