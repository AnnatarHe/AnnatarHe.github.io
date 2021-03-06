---
layout: post
title: Laravel 学习笔记
tags: laravel php framework
---

## Hello

最近看了[Laracasts](http://laracasts)的`Laravel5`教程视频，感慨很多啊。凭着我半吊子英语都觉得`Laravel`绝对有向`Rails`看齐的能力。   

今天开始做一些小的笔记。

## 安装

我并没有写安装的介绍。上面的中文文档对**安装**这一块写的特别的详细，而且是纯中文。

## Database

创建数据库：

### <span style="color:red">Notice：</span>

> 这里有个小坑，好吧，不能算是坑。

> 创建数据库**必须**，**必须**，**必须**用复数形式！！！

我们不能通过*migrate*创建数据库，而是要手动创建,好在我还知道那么些`SQL`语法，这也难不倒:)

{% highlight sql %}
CREATE DATABASE `demo` DEFAULT CHARSET utf8;
{% endhighlight %}

Anyway, here we go.

首先要运行：
{% highlight console %}
$ php artisan make:migration create_articles_table --create="articles"
{% endhighlight %}
添加数据库的表
{% highlight console %}
$ php artisan make:migration add_excerpt_to_articles_table --create="articles"
{% endhighlight %}

如果想要干掉某行（字段），那么需要添加一个`composer`包才能运行：
{% highlight console %}
composer require doctrine/dbal
{% endhighlight %}

数据库里面需要一些测试数据怎么办呢？
5.1版本带来了很有用的新方法：
`database/factories/ModelFactory.php`写入：
{% highlight php %}
<?php 
$factory->define(App\User::class,function ($faker){
	return [
		'name'           => $faker->name,
		'email'          => $faker->email,
		'password'       => str_random(10),
		'remember_token' => str_random(10)
	];
});
//文章可以这样用
$factory->define(App\Post::class,function ($faker){
	return [
		'title' => $faker->sentence,
		'body'  => $faker->paragraph
	];
});
?>
{% endhighlight %}
在`database/seeds/DatabsesSeeder.php`写入：
{% highlight php %}
<?php
use App\User;
public function run (){
	Model::unguard();
	User::truncate();
	factory(User::class, 50)->create()
	Model::reguard();
}
?>
{% endhighlight %}
现在运行：
{% highlight console %}
$ php artisan db:seed
{% endhighlight %}
好了，去数据库查看数据吧！

> 当然还有简便的方法，这样的假数据我们只会在测试的时候使用，所以没必要非得在文件里面写入，那么这个简单的方法比较合适   
>> $ php artisan tinker   
>> factory('App\User')->create();

然后创建`Model`
{% highlight console %}
$ php artisan make:model Article
{% endhighlight %}

现在需要传入数据到数据库中，那么怎么做呢？直接传入数组数据是不行的，因为比较危险，但是我们比较了解，可以这么用，那么就可以在这里
`App/Article.php`
{% highlight php %}
<?php
class Article extends Model{
    protected $fillable = [
        'title',
        'body',
        'published_at'
    ];
}
?>
{% endhighlight %}

## View

使一个页面局部总是接受数据

这个翻译不知道合不合适，原话是*When You Want a View Partial to Always Recive Data*   
好吧，不纠结翻译了。如果是你你怎么做？
之前我在用`ThinkPHP`的时候技术太差呗，就是一个页面一个页面的写，写重复的内容 

> 发出申请   
> 接收数据   
> 渲染页面   
> repeat \* n      

这里完全没有黑`ThinkPHP`的意思，当初我用它还是很幸福的，把我从手写的困境中拯救了出来.

不扯了，接着说。这样的重复自己是不是非常的无聊，低效率，而且维护比较麻烦.

噔噔噔噔～`Laravel`出来拯救你啦~

这里做个例子吧：
在导航条里面写一个最后的一篇文章，每个页面都需要。所以建立一个文件`nav.blade.php`,放在`partials`里面。因为是一个视图文件，所以要放在`Views`目录下。
里面写上：
{% highlight html %}
<ul>
	<li>{!! link_to_action('ArticlesController@show',$latest->title,[$latest->id]) !!}</li>
</ul>
{% endhighlight %}
那么，`@include`我就不写了。

然后去`App`目录下的`Providers`里面的`AppServiceProvider.php`找到boot函数：
{% highlight php %}
<?php
public function boot(){
	view()->composer('partials.nav',function($view){
			$view->with('latest',Article::latest()->first());
		});
}
?>
{% endhighlight %}
这样，所有的有这个视图的文件进行渲染的时候都会经过这一步。而这一步里获取到了数据并填充到文件里，是不是很优雅，很舒适？

其实`5.1`版本加入一种`inject`的方法可以更优雅的解决这个问题，先占个坑，想好了再写。

## Workflow
首先定义路由：
`App/Http/Routes.php`下，写入：
{% highlight php %}
<?php
Route::resource('/article','ArticlesController');
?>
{% endhighlight %}
那么，创建控制器：
{% highlight console %}
$ php artisan make:controller ArticlesController
{% endhighlight %}
之后是去`Controller`里面写点儿东西：


## Assets
刚好看到Assets，先稍微写一下：
`Laravel`使用[gulp](http://gulpjs.com)来对整理前端依赖的。首先要先把gulp依赖下载下来。
{% highlight console %}
$ npm install
## 国内的网络环境你懂的，当然也可以用
$ cnpm install
{% endhighlight %}

默认自动带有`bootstrap-sass`

在`resources/assets/sass/app.scss`里面解除注释
{% highlight sass %}
@import "node_modules/bootstrap-sass/assets/stylesheets/bootstrap";
{% endhighlight %}

然后在`glupfile.js`中写这样的东西：
{% highlight javascript %}
var elixir = require('laravel-elixir');
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

> Ok,there we go!   

那么，如何运行这个命令？好办：
{% highlight bash %}
$ glup
{% endhighlight %}
这样就可以了。

**生产环境**怎么办呢？
{% highlight bash %}
$ glup --production
{% endhighlight %}
需要版本更迭的时候，因为浏览器会缓存，所以有时候并不能正确的**推送**给用户，那么这个时候就需要给这些以相应的版本号，幸好，`glup`都帮我们干了，我们只要写这么一句：
{% highlight javascript %}
mix.version('public/css/final.css');
{% endhighlight %}
那么，如何在使用？

只需要在`layout`文件里把link改成：
{% highlight html %}
<link rel="stylesheet" href="{ { elixir('css/final.css') } }">
{% endhighlight %}
它就会自动转换成带有版本号的样子

## Session

可以用`Redis`来替代。可以参考我的另一篇[Redis笔记]({% post_url 2015-07-25-Redis-notes %})

设置：
{% highlight php %}
<?php 
\Session::flash('key','value');
//或者：
\Session::put('key','value');

//前面使用use Session;了也可以这样
session()->flash('key','value');
?>
{% endhighlight %}
## 使用(视图模板)
{% highlight php %}
<?php 
@if (Session::has('key'))
	{ { Session::get('key') } }
@endif
?>
{% endhighlight %}
加入了`Flash`的package之后更是可以这样使用：
{% highlight php %}
<?php 
flash('Hello World');
flash()->success('success infomation');
flash()->overlay('infomation', 'title');
//使用overlay需要在模板加入：
//<script>$('#flash-overlay-modal').modal()</script>
?>
{% endhighlight %}
当然啦，得在模板里加入：
{% highlight php %}
<?php
@include ('flash::message')
?>
{% endhighlight %}
## Form
首先要安装下面的`Form`的package。然后来创作表单吧！
{% highlight php %}
<?php 
{!! Form::open()  !!}
	<div class="form-group">
		{!! Form::label('title','Title') !!}
		{!! Form::text('title',null,['class'=>'form-control','placeholder'=>'The Title']) !!}
	</div>
	<div class="form-group">
		{!! Form::label('title','Title') !!}
		{!! Form::input('date','published_at',date('Y-m-d'),['class'=>'form-control']) !!}
	</div>
	<div class="form-group">
		{!! Form::label('title','Title') !!}
		{!! Form::select('tags[]',['1'=>'personal'],null,['class'=>'form-control','multiple']) !!}
	</div>
	<div class="form-group">
		{!! Form::submit('save it', ['class'=>'btn btn-default form-control']) !!}
	</div>
{!! Form::close() !!}
?>
{% endhighlight %}
`tags`那一段的`null`表示的是被选中的情况，如果是1，就表示`value`为1的被选中。

如果有时候忘记了参数是什么，随时看源码，写的非常的清楚！

## Upload

{% highlight php %}
<?php 
public function addPhoto(Request $request) {
	$file = $request->file('file');
	$name = time() . $file->getClientOriginalName();
	$file->move('projectName/phtots', $name);
	return 'Done';
}
 ?>
{% endhighlight %}
哈哈~这就上传完成啦~

## Cache

无奈嘛，总想让自己的网站快一点儿。

我是因为使用的美帝的`VPS`。所以我感觉速度可能出在加载图片文件上。

第一步，我申请了一个[七牛云存储](http://qiniu.com),然后把比较大的视频和图片文件放在了七牛的空间里，免费用户有`10G`的空间呢，对我来说还是挺够用个。

第二步，开启`Redis`缓存，将所有的`Cache`转用到`Redis`，这样可以尽量避免一些`session`的负面影响。

## Packages

需要引入的包要用`composer`的方式引入，例如：
{% highlight console %}
$ composer require illuminate/html
{% endhighlight %}

* **illuminate/html**   
在`config/app.php`下注册：
{% highlight php %}
<?php 
//'providers'=>里面加入
'Illuminate\Html\HtmlServiceProvider'
//'Alias'加入：
'Form' => 'Illuminate\Html\FormFacade',
'Html' => 'Illuminate\Html\HtmlFacade'
?>
{% endhighlight %}

* **laracasts/flash**   
{% highlight php %}
<?php 
//'providers'=>里面加入
'Laracasts\Flash\FlashServiceProvider'
//'Alias'加入：
'Flash' =>'Laracasts\Flash\Falsh'
?>
{% endhighlight %}

* **predis/predis**

这个不需要再boot里面再加入了。

所要修改的只有`config/database.php`

把`cache`换成`redis`就可以啦~

## Production

生产环境还是得做一些操作的，比如关掉调试模式
,以下这些就是需要注意的地方。
{% highlight bash %}
$ composer install --optimize-autoloader
$ composer dump-autoload --optimize

$ gulp --production
$ php artisan clear-compiled
$ php artisan optimize
{% endhighlight %}

## Resources
* [laravel官方文档](http://laravel.com/docs/5.1)  <span style="color:red">英文</span>  **最权威**
* [Laravel5学习笔记](https://www.gitbook.com/book/kejyuntw/laravel-5-learning-notes/details)  <span style="color:red">繁体中文</span>
* [Laracasts](https://laracasts.com/series/laravel-5-fundamentals)  <span style="color:red">英文视频</span>
* [Laravel5入门系列](http://lvwenhan.com/laravel/432.html)  <span style="color:red">简体中文</span>
* [Laravel中文文档](http://www.golaravel.com/laravel/docs/5.1/)  <span style="color:red">少量简体中文</span>
* [Laravel中文文档](http://laragirl.com/docs/5.1)  <span style="color:red">简体中文</span>大部分翻译完成
