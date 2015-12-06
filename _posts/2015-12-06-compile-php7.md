---
layout: post
title: 编译PHP7
tags: php
---

## PHP7

`PHP7`都出了，自然我是要安装的，上次写的那个编译开发环境并没有针对性的说PHP，就这次说清楚吧。

## Download

{% highlight console %}
$ wget http://cn2.php.net/get/php-7.0.0.tar.gz/from/this/mirror
$ mv mirror php7.tar.gz
{% endhighlight %}

{% highlight console %}
$ tar -zxvf php7.tar.gz
$ cd php7
{% endhighlight %}

## libxml

{% highlight console %}
$ sudo apt-get install libxml2-dev
{% endhighlight %}

## OpenSSL

{% highlight console %}
$ sudo apt-get install libcurl4-openssl-dev
{% endhighlight %}

## mcrypt

{% highlight console %}
$ sudo apt-get install curl libmcrypt-dev
{% endhighlight %}

## GD

configure: error: png.h not found.

{% highlight console %}
$ sudo apt-get install libpng12-dev
{% endhighlight %}

## configure

{% highlight console %}
$ ./configure --enable-debug --with-mysql --with-gd --with-curl --prefix=/opt/php7 --enable-fpm --enable-cgi --with-openssl --enable-mbstring --with-mcrypt --with-pdo-mysql --with-mysql-sock=/var/run/mysqld/mysqld.sock
$ make -j 4
$ sudo make install
{% endhighlight %}

## PATH

{% highlight console %}
$ cd ~
$ vim .zshrc # 或者其他的.bashrc什么的
{% endhighlight %}

加入以下内容在最后一行:

{% highlight bash %}
$PATH=$PATH:/opt/php7/bin;
{% endhighlight %}

## php-fpm

这个步骤比较长，得有点儿耐心

首先找个`php.ini`文件，然后放到`/opt/php7/lib`里面，然后

给两个文件改名

{% highlight console %}
$ suo cp /opt/php7/etc/php-fpm.conf.default /opt/php7/etc/php-fpm.conf
$ suo cp /opt/php7/etc/php-fpm.d/www.conf.default /opt/php7/etc/php-fpm.d/www.conf
{% endhighlight %}

然后调整里面的东西

先给个pid取消注释

{% highlight console %}
$ sudo vim /opt/php7/etc/php7-fpm.conf
{% endhighlight %}

{% highlight console %}
[...]
pid = run/php-fpm.pid
[...]
{% endhighlight %}

改一下用户组和用户

{% highlight console %}
$ sudo vim /opt/php7/etc/php7-fpm.d/www.conf
{% endhighlight %}


{% highlight console %}
user = YourUsername
group = YourGroup
{% endhighlight %}


然后创建文件：

{% highlight console %}
$ sudo vim /etc/init.d/php7-fpm
{% endhighlight %}

写入以下内容，注意一些文件名

{% highlight bash %}
#! /bin/sh
### BEGIN INIT INFO
# Provides:          php7-fpm
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts php7-fpm
# Description:       starts the PHP FastCGI Process Manager daemon
### END INIT INFO
php_fpm_BIN=/opt/php7/sbin/php-fpm
php_fpm_CONF=/opt/php7/etc/php-fpm.conf
php_fpm_PID=/opt/php7/var/run/php-fpm.pid
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

赋权：

{% highlight console %}
$ sudo chmod 755 /etc/init.d/php7-fpm
$ sudo vim /lib/systemd/system/php7-fpm.service
{% endhighlight %}

然后写入下面的内容：

{% highlight console %}
[Unit]
Description=The PHP 7 FastCGI Process Manager
After=network.target

[Service]
Type=simple
PIDFile=/opt/php7/var/run/php-fpm.pid
ExecStart=/opt/php7/sbin/php-fpm --nodaemonize --fpm-config /opt/php7/etc/php-fpm.conf
ExecReload=/bin/kill -USR2 $MAINPID

[Install]
WantedBy=multi-user.target
{% endhighlight %}

## Swoole

按照他们的[指导做就行了](https://github.com/swoole/swoole-src)

{% highlight console %}
$ git clone https://github.com/swoole/swoole-src.git
$ cd swoole-src
$ phpize
$ ./configure
$ make && sudo make install
{% endhighlight %}

在php.ini里面写上扩展就行了

{% highlight console %}
$ sudo vim /opt/php7/lib/php.ini
{% endhighlight %}

随便找个地方，不过我还是建议放到extension那边，大概900行左右

{% highlight console %}
extension=swoole.so
{% endhighlight %}

## References

* [How to install PHP 5.3 and 5.2 together on Ubuntu 12.04](http://zgadzaj.com/how-to-install-php-53-and-52-together-on-ubuntu-1204)
* [How to install PHP 7 as PHP-FPM & FastCGI for ISPConfig 3 on Debian 8 (Jessie)](https://www.howtoforge.com/tutorial/how-to-install-php-7-on-debian/)
* [swoole Readme](https://github.com/swoole/swoole-src)
