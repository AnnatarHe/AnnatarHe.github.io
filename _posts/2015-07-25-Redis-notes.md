---
layout: post
title: Redis notes
---

## Install

### Ubuntu
`Ubuntu`安装是最简单的。
{% highlight bash %}
$ sudo apt-get install redis-serve
{% endhighlight %}

`Ubuntu`安装之后最好进行一步操作：**干掉自启动**

我自己什么都玩,*MySQL*,*MongoDB*,*Nginx*,还有其他杂七杂八的，现在再加上一个`redis`

我电脑配置比较渣，这些东西全都开机启动我是有些吃不消的。因此，有必要**干掉自启动**
{% highlight bash %}
cd /etc/rc2.d/
ls
{% endhighlight %}
把你想干掉的`S`改成`K`,你看到就知道怎么做了:)

### Others

不过`Ubuntu`的apt工具虽然简单，但是版本号可能会低一些。所以也可以用主流的安装方法：
{% highlight bash %}
$ wget http://download.redis.io/releases/redis-3.0.3.tar.gz
$ tar xzf redis-3.0.3.tar.gz
$ cd redis-3.0.3
$ make
{% endhighlight %}

### Notice

要在`config`文件中
{% highlight bash %}
daemonize no # 改成yes
{% endhighlight %}

## String
{% highlight bash %}
SET foo bar
# 设置 foo 及其值
GET foo
# 获取 foo 的值
SETEX foo 60 bar
# 设置 foo 的值为 bar 并存在60秒
APPEND foo baz
# 在 foo 的值后面追加 baz 返回 barbaz
MSET foo bar baz qux
# 多值添加 key-value
MGET foo baz
# 多值获取
STRLEN foo
# 值长度获取
INCR foo
DECR foo
# 自增自减
{% endhighlight %}

## Hash

这种数据结构对于学PHP的我来说有点儿曲折。并不是我们所说的
{% highlight php %}
<?php 
	$bar = ['foo'=>'baz'];
	// 而是这个样子的（如果非要用PHP来表示的话）
	$field1 = ['key' => 'value1'];
	$field2 = ['key' => 'value2'];
 ?>
{% endhighlight %}
由此，我个人的理解是以`key`为索引，对应自己的`field`和`value`,
那么，`PHP`的写法或许要改写成这样：
{% highlight php %}
<?php 
	$key = [
		'field1' => 'value1',
		'field2' => 'value2'
	];
 ?>
{% endhighlight %}
{% highlight bash %}
HSET foo bar baz
# HSET key field value
# 在bar域中给foo赋值baz
HMSET site iamhele iamhele.com imhele imhele.com
# HMSET key field value [field value]
HGET site iamhele
# HGET key field
HMGET site iamhele imhele
# HMGET key field [field]

HGETALL key
# 这个比较牛逼了,获取所有key下的field和value.
HEXISTS site iamhele
# HEXISTS key field 验证有木有
HKEYS key
# 获取此key下的field
HLEN key
# 获取此key下的field的数量
HDEL key field [field]
# 干掉key下的field...
{% endhighlight %}

## List

那么用`PHP`来模仿一下这家伙的数据结构吧.
{% highlight php %}
<?php 
	$key = ['value1','value2'];
	//自带角标index
 ?>
{% endhighlight %}
过几天画个图表示一下: yield


这货好像是堆栈结构的。。。FILO(先进后出)

{% highlight bash %}
LPUSH key value [value]
# LeftPush 插入到链表头部
RPUSH key value [value]
# RightPush 插入到链表尾部
LSET key index value
# LSET可以将列表 key 下标为index的元素的值设置为 value
LPOP key
# 把最左边（头）的混蛋(key)的值拿出来，然后干掉。
LINDEX key index
# 通过key和index获取值 >0 从左边数，<0 从右边数
LINSERT key BEFORE|AFTER pivot value
# pivot 轴心中心的意思.看来不用讲了.这个代笔是个值.
LREM key count value
# (list remove)干掉key里面的value.干掉几个呢? count决定
# count == 0 诛九族
# count >  0 从前面开始, 干掉 count 个就收手了.
# count <  0 从后面开始, 干掉 count 个就收手.话说是不是口味太重了,从后面开始...
LLEN key
# 好吧,这货到底有几个值?(list length)

LTRIM key start stop
# 选妃子啦,start到stop之间的留下,其他的拖出去斩了(trim n.修剪,削齐)
{% endhighlight %}

## Set