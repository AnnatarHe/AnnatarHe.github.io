---
layout: post
title: MongoDB 笔记
tags: MongoDB database
---

## The Hard Way

做个`全栈`真是不容易啊，前后端都要懂，还得能写数据库的东西，连运维也给一起兼了。

## JavaScript

现在`JavaScript`真是完成了屌丝逆袭的全过程。

原来这货长这样：

{% highlight html %}
<div onclick="function()">foo</div>
{% endhighlight %}

现在这货长这样：

{% highlight javascript %}
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
{% endhighlight %}

听说下个版本要从`0.12.7`直接跳到`4.0`

随着`js`雄起的还有`json`

这货长这样：

{% highlight json %}
{
	"key":"value"
}
{% endhighlight %}

这是一种数据传输的*新*形式，好吧，其实他也老大不小了。

随着这种数据形式的自然就有数据库。

号称是`NoSQL`(Not Only SQL)

不扯了，开始说用法吧。

## Symbols

这里是一些符号的转义

|--------|------|
|大于    | $gt  |
|--------|------|
|大于等于| $gte |
|--------|------|
|小于    | $lt  |
|--------|------|
|小于等于| $lte |
|--------|------|
|不等    | $ne  |
|--------|------|
|包含于  | $in  |
|--------|------|
|不包含于| $nin |
|--------|------|

## Insert

{% highlight js %}
db.collection.insert(
	{
		name:'Annatar',
		age:20
	}
)
{% endhighlight %}

![crud-insert-stages](/images/mongodbNotes/crud-insert-stages.png)

这里的执行环境是`JavaScript`哦，所以呢，可以使用`For`循环，那么，做点儿什么吧！

{% highlight js %}
for (i = 0; i < 100; i++)
	db.collection.insert({x:1})
{% endhighlight %}

## Select

{% highlight js %}
// 相当于 SELECT * FROM `collection`
db.collection.find()
{% endhighlight %}

`find()`中，可以添加条件

这一条意思是：

从`users`里面找数据，`age`大于18的，找`name`和`address`这两个字段，找五条

{% highlight js %}
db.users.find(
	{
		age:{
			$gt: 18
		}
	},
	{
		name: 1,
		address: 1
	}
)
.limit(5)
{% endhighlight %}

![crud-query-stages](/images/mongodbNotes/crud-query-stages.png)

## update

### 完全更新：

把`x`等于1的都更新成999，如果不存在就创建(insert)
{% highlight js %}
db.collection.update(
	{
		x:1
	},
	{
		x:999
	},
	true
)
{% endhighlight %}

### 部分更新：

把`x`等于1的字段，只更新`y`到222，其他不变

{% highlight js %}
db.collection.update(
	{
		x:1
	},
	{
		$set: {
			y:222
		}
	}
)
{% endhighlight %}

### 多表更新：

{% highlight js %}
db.collection.update(
	{
		c:1
	},
	{
		$set:{
			c:2
		}
	},
	false,
	true
)
{% endhighlight %}

## Remove

删除掉`status`为`D`的字段

{% highlight js %}
db.users.remove(
	{
		status: "D"
	}
)
{% endhighlight %}

![crud-annotated-mongodb-remove](/images/mongodbNotes/crud-annotated-mongodb-remove.png)

## Drop

删除掉`collection`吧，看他不顺眼了。

{% highlight js %}
db.collection.drop()
{% endhighlight %}

## limit...

在`collection`寻找数据，先跳过20条数据，然后只取两条数据，这两条数据要按照`x`正序排列

其实英文稍微好一些，这都能看懂

{% highlight js %}
db.collection.find()
										.skip(20)
										.limit(2)
										.sort({ x:1 })
{% endhighlight %}

### <span style="color:red">Notice</span>

`skip`语句会消耗较多的性能，能不用就别用

## Index

索引可以加快搜索速度，在几百万条数据的时候就更突出性能优势了

### 查看索引

{% highlight js %}
db.collection.getIndex()
{% endhighlight %}

### 创建索引

按照`x`正向排序

{% highlight js %}
db.collection.ensureIndex({
	x:1
})
{% endhighlight %}

## Reference

* [Manual](https://docs.mongodb.org/manual)

* [MongoDB入门篇](http://www.imooc.com/learn/295)

* [HubWiz.com](http://www.hubwiz.com/course/54bdfcb188dba012b4b95c9c/)