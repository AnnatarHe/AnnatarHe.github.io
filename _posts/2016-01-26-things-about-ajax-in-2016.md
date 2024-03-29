---
layout: post
title: 2016 Ajax 二三事
tags: 前端 front-end ajax vue fetch js
---

## Sumary

今天我要说的其实和之前的ajax不太一样。包括以下内容：

* FormData
* Fetch
* CROS

如果你认为你都知道就不用看了。

## CROS

最近在写一个项目，完全的前后端分离，所有数据都是来自于Ajax，连权限控制也是前端完成了。

既然需要如此之多的数据，我也就起了一个远端的开发服务器。

没有用自己的电脑mock数据的原因有很多。第一是性能，我的电脑当初买的时候买到了低电压版本的，所以，性能上过不去，所以开个虚拟机压力还是有的。然后是杂乱，我不希望自己的电脑上变得杂乱，安装各种MySQL, MongoDB, Redis什么的。所以也就没在本机搞。最后是兼容性，有很多软件对Windows平台支持不够给力，所以只得开个远端服务器了。

至于jsonp，因为到时候前端是放在生产服务器上的，那个时候又没有跨域问题，懒得改了。

背景介绍完了，就剩跨域了。

一开始是各种google希望找到怎么在Nginx配置可以跨域，后来发现github API貌似是个好例子

![ajax]({{ site.cdn }}/github_api_header.png)

看看，是不是能学到很多。

`Access-Control-*`那三行就是允许跨域的header，最后一句是`HSTS`的header。

所以，Nginx配置变成了这样：

{% highlight console %}
server {
      listen 80;
      server_name dev.domain.com;
      root /path/to/public;
      index index.php index.html index.htm;
      add_header "Access-Control-Allow-Origin" "*";
      add_header 'Access-Control-Allow-Credentials' 'true';
      add_header "Access-Control-Allow-Headers" "X-Requested-With, Content-Type";
      add_header "Access-Control-Allow-Methods" "GET,POST,PUT,DELETE,OPTIONS";
      location / {
            try_files $uri $uri/ /index.php?$query_string;
      }
      location ~ \.php$ {
          fastcgi_pass   127.0.0.1:9000;
          fastcgi_index  index.php;
          fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
          include        fastcgi_params;
      }
    }
{% endhighlight %}

`add_header`那四行使得跨域成功了。

我不说其他跨域方案的原因在于网上满地都是，自行google吧。

## POST

上面的代码是最终版的，其实一开始并没有这么完整。

一开始没有`"Access-Control-Allow-Headers" "X-Requested-With, Content-Type"`中Content-Type这一段的，这就导致了一个问题。

你用ajax框架发不了post请求。

因为根据跨域的原则来说，浏览器会先发`OPTIONS`, 确认之后才会发`POST`。

我在碰到问题的时候一度以为是`vue-resource`的代码问题。不过我也确实觉得`vue-resource`的测试写的也太少了。

如果你在dev tools里找xhr请求，你会惊异的发现，同一个请求发了两遍。一个是`OPTIONS`，第二个是`POST`。

[MDN: HTTP access control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)

## Fetch

Fetch是新的API，用来发送请求的。当新版xhr用就好了，不过有着比xhr更方便的接口什么的

{% highlight js %}
fetch('/path/to/resouce')
    .then( res => res.json())
    .then( data => console.log(data))
    .catch( err => console.log(err))
{% endhighlight %}

至于怎么用xhr实现网上有太多的教程了。

问题来了，post怎么发？

{% highlight js %}
let fd = new FormData();
fd.append('foo', document.querySelector('#foo').value)
fd.append('file', document.querySelector('#fileElement').files[0])

fetch('/path/to/post', {
    method: 'post',
    body: fd
}).then( res => res.json())
.then( res => console.log(res))
.catch(err => console.log(err))
{% endhighlight %}

至于FormData下一段再说，反正fetch的body数据都得是FormData的，我测试过的。

对了，fetch兼容性支持很不给力，chrome到42才支持，其他的就别指望太多了。

[fetch polyfill](https://github.com/github/fetch)

## FormData

FormData是个很棒的东西。尤其是解决了file upload这种鬼东西的上传什么的。

上面的例子里有file的上传，我想说的是，我强烈推荐用Form，实在是好用。

关于兼容性，到IE10了，可以了。我也压根不会管其他的浏览器，是吧～
