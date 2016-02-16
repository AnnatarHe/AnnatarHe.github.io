---
layout: post
title: 编译我的开发环境
tags: snippets tools
---

## Long long ago

很久以前，我总是会被开发环境卡死。

当前学校教`C++`，老师用`VC++6.0`，然而当时dell的Windows8不知道出了什么问题，并不能安装。

后来找了好久，终于发现了`Visual Studio`，费劲千辛万苦安装上，代码又不能运行。

后来才知道`Vc++6.0`太老了，而且和标准有些不一样。

后来想学php，被apache的配置搞得一头雾水，什么都不知道。

当年还想学Java，后来看到了环境配置的章节，跟鬼样，后来放弃了。

## Now

现在倒是没什么问题了。可是也想记录下，免得哪天忘了，找不到方法了。

## Prepare

准备活动还是要做的

### 添加新用户

{% highlight console %}
# useradd -aG sudo USERNAME
{% endhighlight %}

### 更新

{% highlight console %}
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install gcc g++ vim autoconf curl build-essential libssl-dev libreadline-dev libyaml-dev libxml2-dev libxslt1-dev libcurl4-openssl-dev ...
{% endhighlight %}

### oh-my-zsh

我之前写过一篇关于oh-my-zsh的文章，我只能说这个东西超棒，我是离不开了
{% highlight console %}
$ sudo apt-get install zsh
$ chsh -s $(which zsh)
$ sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
{% endhighlight %}

好了，这个时候注销，重新登陆账户就好了

### vim

这里主要是配置文件

{% highlight console %}
$ cd
$ git clone https://github.com/gmarik/vundle.git ~/.vim/bundle/vundle
$ wget https://raw.githubusercontent.com/AnnatarHe/vimConfigure/Linux/.vimrc
$ vim
{% endhighlight %}

然后是安装vim插件`:BundleInstall`

### ssh

配置ssh
{% highlight console %}
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 狂按三次enter就好了
cat .ssh/id_rsa.pub
{% endhighlight %}
然后贴到github的配置文件中
{% highlight console %}
$ ssh -T git@github.com
{% endhighlight %}

## Git

配置git哎：

{% highlight console %}
$ git config --global core.editor vim
$ git config --global user.email 'hele@iamhele.com'
$ git config --global user.name 'AnnatarHe'
{% endhighlight %}

## Nginx

我对于Nginx的要求不高，甚至没有也没关系。但是还是要装的是吧？

{% highlight console %}
$ sudo apt-get install nginx
{% endhighlight %}

当然，你如果要求比较高，也想参考一下我的编译的话，可以[点击这里]({% post_url 2015-12-10-speed-up-my-website-and-safety-in-server %})

## MySQL

我是用apt-get安装的，但是最近出了5.7版本，性能好像是好到爆，还有原生json支持。过几天编译安装一遍好了
{% highlight console %}
$ sudo apt-get install mysql-server mysql-client
# 之后输入数据库root用户的密码，并重复之
{% endhighlight %}

## php

因为`Laravel`对版本要求比较高，而且`PHPUnit`对版本要求也是非常的高。

而我自己也很喜欢用新特性，因为会更加方便嘛。

原来都是用apt-get安装的，现在发现版本确实太低了。只能自己编译了

首先去[php官网](http://php.net/get/php-5.6.15.tar.gz/from/a/mirror)下载到最新的稳定版(php7等稳定版再用)

{% highlight console %}
$ cd /path/to/php.tar.gz
$ tar -zxvf php.tar.gz
{% endhighlight %}

这一步很重要，非常的重要

{% highlight console %}
$ ./configure --enable-debug --with-mysql --with-gd --with-curl --prefix=/opt/php5 --enable-fpm --enable-cgi --with-openssl --enable-mbstring --with-mcrypt --with-pdo-mysql --with-mysql-sock=/var/run/mysqld/mysqld.sock
$ make -j 4
$ sudo make install
{% endhighlight %}
配置跟了很多的参数，意思分别是：

* 开启调试
* mysql支持
* gd库支持
* curl支持
* 安装目录在/opt/php5
* 开启fpm支持
* 开启命令行支持
* 开启openssl支持
* 开启mbstring支持
* 开启mcrypt支持
* 开启pdo-mysql支持
* mysql通信资源的位置是/var/run/mysqld/mysqld.sock

然后是，四核编译，安装。

之后还得写php-fpm的脚本，还有php.ini的加入。
{% highlight bash %}
#! /bin/sh
### BEGIN INIT INFO
# Provides:          php5-fpm
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts php5-fpm
# Description:       starts the PHP FastCGI Process Manager daemon
### END INIT INFO
php_fpm_BIN=/opt/php5/sbin/php-fpm
php_fpm_CONF=/opt/php5/etc/php-fpm.conf
php_fpm_PID=/opt/php5/var/run/php-fpm.pid
php_opts="--fpm-config $php_fpm_CONF"
wait_for_pid () {
        try=0
        while test $try -lt 35 ; do
                case "$1" in
                        'created')
                        if [ -f "$2" ] ; then
                                try=''
                                break
                        fi
                        ;;
                        'removed')
                        if [ ! -f "$2" ] ; then
                                try=''
                                break
                        fi
                        ;;
                esac
                echo -n .
                try=`expr $try + 1`
                sleep 1
        done
}
case "$1" in
        start)
                echo -n "Starting php-fpm "
                $php_fpm_BIN $php_opts
                if [ "$?" != 0 ] ; then
                        echo " failed"
                        exit 1
                fi
                wait_for_pid created $php_fpm_PID
                if [ -n "$try" ] ; then
                        echo " failed"
                        exit 1
                else
                        echo " done"
                fi
        ;;
        stop)
                echo -n "Gracefully shutting down php-fpm "
                if [ ! -r $php_fpm_PID ] ; then
                        echo "warning, no pid file found - php-fpm is not running ?"
                        exit 1
                fi
                kill -QUIT `cat $php_fpm_PID`
                wait_for_pid removed $php_fpm_PID
                if [ -n "$try" ] ; then
                        echo " failed. Use force-exit"
                        exit 1
                else
                        echo " done"
                       echo " done"
                fi
        ;;
        force-quit)
                echo -n "Terminating php-fpm "
                if [ ! -r $php_fpm_PID ] ; then
                        echo "warning, no pid file found - php-fpm is not running ?"
                        exit 1
                fi
                kill -TERM `cat $php_fpm_PID`
                wait_for_pid removed $php_fpm_PID
                if [ -n "$try" ] ; then
                        echo " failed"
                        exit 1
                else
                        echo " done"
                fi
        ;;
        restart)
                $0 stop
                $0 start
        ;;
        reload)
                echo -n "Reload service php-fpm "
                if [ ! -r $php_fpm_PID ] ; then
                        echo "warning, no pid file found - php-fpm is not running ?"
                        exit 1
                fi
                kill -USR2 `cat $php_fpm_PID`
                echo " done"
        ;;
        *)
                echo "Usage: $0 {start|stop|force-quit|restart|reload}"
                exit 1
        ;;
esac
{% endhighlight %}

等切换到Ubuntu系统在来补上

还有composer包的支持：
{% highlight console %}
$ curl -sS https://getcomposer.org/installer | php
$ sudo mv composer.phar /usr/local/bin/composer
$ composer # 测试用的，看看能不能用
{% endhighlight %}

改成国内的镜像：
{% highlight console %}
$ composer config -g repositories.packagist composer http://packagist.phpcomposer.com
$ composer global require "phpunit/phpunit=5.0.*" # 安装phpunit
{% endhighlight %}


## Node

我同样还得写个node呗。所以还是得要node支持。

总所周知，node的更新频率非常的快。时刻跟随最新版本是很难做到的，因为要不停地编译安装。

所以我用了[nvm](https://github.com/creationix/nvm)来对node进行版本控制

{% highlight console %}
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
$ cd
$ vim .zshrc # 也可能是.bashrc
{% endhighlight %}

添加一行：
{% highlight bash %}
souce ~/.nvm/nvm.sh
{% endhighlight %}

然后退出来
{% highlight console %}
$ cd
$ source .zshrc # 或者.bashrc
$ nvm install 4.2.1
$ nvm alias default 4.2.1
{% endhighlight %}

然后我还是要带上淘宝的npm镜像的
{% highlight console %}
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
$ cnpm install -g gulp react-native # 我个人需要的包
{% endhighlight %}

## Ruby

是的，你没看错，我还得用ruby。

不过我一般不写ruby，我主要是用`jekyll`，因为你现在看到的这个网站就是jekyll支撑起来的。

ruby版本更新没有node那么疯狂，但也是很快的，而且Rails是从不向下兼容的。还是得做控制

我被[happypeter](https://github.com/happypeter)安利了[rbenv](https://github.com/sstephenson/rbenv)，一直在用，挺好的

{% highlight console %}
$ git clone https://github.com/sstephenson/rbenv.git ~/.rbenv
$ echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
$ echo 'eval "$(rbenv init -)"' >> ~/.zshrc
$ git clone git://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
$ echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.zshrc
$ exec $SHELL
{% endhighlight %}

下面开始ruby环节：

{% highlight console %}
$ rbenv install 2.2.3
$ rbenv global 2.2.3
{% endhighlight %}

国内镜像以及其他的东西：
{% highlight console %}
$ gem sources --add https://ruby.taobao.org/ --remove https://rubygems.org/
$ gem install bundler jekyll
{% endhighlight %}

## Java

话说一个不写java的人为毛要安装java环境？

因为。。。jetbrains家的东西都是java写的啊！！！

不装java怎么用`phpstorm`，`webstorm`这些东西？

{% highlight console %}
$ cd /opt
$ sudo wget http://download.oracle.com/otn-pub/java/jdk/8u65-b17/jdk-8u65-linux-x64.tar.gz
$ sudo tar -zxvf jdk-8u65-linux-x64.tar.gz
$ cd /your/java/path
{% endhighlight %}

然后回桌面。
{% highlight console %}
$ vim .zshrc
{% endhighlight %}

把下面的代码贴进去，注意改路径啊。
{% highlight console %}
JAVA_HOME=/opt/java/jdk1.8.0_60
PATH=$JAVA_HOME/bin:$PATH
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
{% endhighlight %}


## Then

然后就是一些安装sublime,chrome什么的了
