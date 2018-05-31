---
layout: 'post'
title: shadowsocks 配置记录
tags: gfw life shadowsocks socks
---

## 背景

之前一直是用别人家的服务，用起来感觉不错。速度比我的快。但是考虑到会被封，且以后也有可能会被封。还有 [digitalocean](https://m.do.co/c/c52ee265425c)送的钱没用完。

所以准备自己搭一套环境。

准备条件是有一台境外服务器，一台国内服务器。

## 架构

![shadow-socks-use-arch]({{ site.cdn }}/shadowsocks-use-1.jpg-copyrightDB)

我想了一段时间才想通整个流程是怎么走的。

国内服务器上安装客户端软件，然后连接到境外服务器做流量转发。然后根据配置文件自己做一个 pac 文件上传到 cdn 上。真正的客户端，如手机电脑获取 pac 文件进行代理。

既然整个流程清楚了，那就开始吧。

## 服务端

我是用的 [digitalocean](https://m.do.co/c/c52ee265425c) 的五美刀服务器，架设在美帝西海岸吧。其实用日本的服务器是最合适的，无奈我买不到。美帝的速度会稍微慢一点，不过还能承受。

创建好服务器之后登陆服务器，安装一些必备软件。其实必备软件只有 docker。

然后安装 docker 版本的 shadowsocks-server ，我一开始没想那么多，是安装在本机的，而且是 python 版本的。后来查到竟然有 c 写的版本，那可以试一下。

推荐用 docker 装的，但是如果不用的话命令大概是这样的：

{% highlight bash %}
apt-get install python-pip
pip install shadowsocks

sudo ssserver --config ~/ssconfig.json -d start
{% endhighlight %}

至于配置文件如下所示：
{% highlight json %}
{
    "server":"your.server.ip",
    "server_port":8388,
    "local_address": "127.0.0.1",
    "local_port":1080,
    "password":"your.password",
    "timeout":300,
    "method":"aes-256-cfb",
    "fast_open": false
}
{% endhighlight %}

## 客户端

客户端是在国内的服务器上，我是用的 docker 装的。

{% highlight bash %}
docker run -d -p 1080:1080 zhenkyle/docker-sslocal -b 0.0.0.0 -s $SHADOWSOCKS_SERVER_IP -p 8388 -l 1080 -k $SSPASSWORD
{% endhighlight %}

之后自然是顺利启动

## HTTP Proxy

由于 iPhone 不支持 socks5 协议，所以还是需要转发到 http 流量上。需要借助一个叫做 [polipo](https://github.com/jech/polipo)的工具

{% highlight bash %}
sudo apt install polipo
{% endhighlight %}

之后修改 `/etc/polipo/config` 的配置文件：

{% highlight yaml %}
proxyAddress = "0.0.0.0"
socksParentProxy = "127.0.0.1:1080"
socksProxyType = socks5
chunkHighMark = 50331648
objectHighMark = 16384
serverMaxSlots = 64
serverSlots = 16
serverSlots1 = 32
{% endhighlight %}

然后启动即可：

{% highlight bash %}
/etc/init.d/polipo restart
{% endhighlight %}

## PAC 文件

到这里就简单了。只需要配置规则，做转发就可以了。可以在这里下载我的配置文件，将对应的 ip 修改成自己国内服务器的 ip 即可。

搜索`127.0.0.1`全局替换即可。

[点我下载](/dist/ss.pac)

然后传到自己的 cdn 即可。我是用七牛存的，还可以。之后获取到外链地址，复制下来。

## Mac 配置

设置 -> 网络 -> 高级 -> 代理 -> PAC 代理(第二个)

复制粘贴之前的 pac 外链地址。保存即可。

## iPhone 配置

设置 -> WLAN -> 当前 WIFI 打开 -> 自动

复制粘贴即可。

## 命令行配置

命令行需要设置环境变量。重新加载后才能用。

{% highlight bash %}
set -x http_proxy http://server.com:12345
set -x https_proxy $http_proxy
{% endhighlight %}

我这是 fish shell 的语法，其他的 shell 需要改写一下。

## 其他

之后可以尽情的享受互联网啦。

因为流量非常低，防火墙不会注意到我们的~
