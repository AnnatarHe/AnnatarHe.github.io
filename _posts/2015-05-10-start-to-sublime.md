---
layout: post
title: 开启 sublime
tags: tools sublime
---

# Install
此篇针对新手(like me T_T)：   
首先登录`sublime text`的官网进行下载：
[Sublime Text 3](http://www.sublimetext.com/3)

选择合适的版本。比如：`Windows 64 bit`

实在不清楚的那就下`32bit`的吧，应该没什么错。

下载完成就是安装了。无脑下一步即可。

> Windows用户请跳过这里：   
> Ubuntu在这里也是双击安装，不同的是会跳转到软件中心，需要手动再点一下右边的`安装`。然后输入用户密码。   
> 那么，Windows用户现在就可以打开了。只是Sublime貌似没有自动桌面图标，所以需要自己去找。

默认是在
{% highlight console %}
C:/Program Files/sublime text3/sublime_text.exe
{% endhighlight %}

> Windows用户请跳过这里：   
> Ubuntu用户按下`windows`键输入`subl`就可以回车了。Terminal中输入
{% highlight console %}
> $ subl
{% endhighlight %}
> 就可以运行了。

#Setup

> Windows用户直接往后看，这一步专门为`Ubuntu`用户做的：

> Ubuntu中是没办法在Sublime里打中文的。所以咱得想想办法。

> 在`home`文件夹里新建一个文件(`/home/username`)，就叫做`sublime_imfix.c`吧！

以下内容：
{% highlight c %}
#include <gtk/gtkimcontext.h>
void gtk_im_context_set_client_window (GtkIMContext *context,
         GdkWindow    *window)
{
 GtkIMContextClass *klass;
 g_return_if_fail (GTK_IS_IM_CONTEXT (context));
 klass = GTK_IM_CONTEXT_GET_CLASS (context);
 if (klass->set_client_window)
   klass->set_client_window (context, window);
 g_object_set_data(G_OBJECT(context),"window",window);
 if(!GDK_IS_WINDOW (window))
   return;
 int width = gdk_window_get_width(window);
 int height = gdk_window_get_height(window);
 if(width != 0 && height !=0)
   gtk_im_context_focus_in(context);
}
{% endhighlight %}

一段*C语言*程序，别管原理了。就是干！

在`Terminal`里输入这些内容：
{% highlight console %}
$ cd ~
$ gcc -shared -o libsublime-imfix.so sublime_imfix.c  `pkg-config --libs --cflags gtk+-2.0` -fPIC
{% endhighlight %}

然后拷贝一下呗~
{% highlight console %}
$ sudo mv libsublime-imfix.so /opt/sublime_text/
{% endhighlight %}

嗯，大体上包是安装好了，但是桌面的还是要改的：
{% highlight console %}
$ sudo gedit /usr/bin/subl
{% endhighlight %}
将
{% highlight bash %}
#!/bin/shexec /opt/sublime_text/sublime_text "$@"
{% endhighlight %}
修改为
{% highlight bash %}
#!/bin/shLD_PRELOAD=/opt/sublime_text/libsublime-imfix.so exec /opt/sublime_text/sublime_text "$@"
{% endhighlight %}
这个时候可以在终端启动的`sublime`中输入中文了，那么得改一下图标了：

为了使用鼠标右键打开文件时能够使用中文输入，还需要修改文件`sublime_text.desktop`的内容。
{% highlight console %}
$ sudo gedit /usr/share/applications/sublime_text.desktop
{% endhighlight %}

将**[Desktop Entry]**中的字符串
{% highlight bash %}
Exec=/opt/sublime_text/sublime_text %F
{% endhighlight %}
修改为
{% highlight bash %}
Exec=bash -c "LD_PRELOAD=/opt/sublime_text/libsublime-imfix.so exec /opt/sublime_text/sublime_text %F"
{% endhighlight %}
将**[Desktop Action Window]**中的字符串
{% highlight bash %}
Exec=/opt/sublime_text/sublime_text -n
{% endhighlight %}
修改为
{% highlight bash %}
Exec=bash -c "LD_PRELOAD=/opt/sublime_text/libsublime-imfix.so exec /opt/sublime_text/sublime_text -n"
{% endhighlight %}
将**[Desktop Action Document]**中的字符串
{% highlight bash %}
Exec=/opt/sublime_text/sublime_text --command new_file
{% endhighlight %}
修改为
{% highlight bash %}
Exec=bash -c "LD_PRELOAD=/opt/sublime_text/libsublime-imfix.so exec /opt/sublime_text/sublime_text --command new_file"
{% endhighlight %}
> *注意*：   
> 修改时请注意双引号`""`,否则会导致不能打开带有空格文件名的文件。   
> 此处仅修改了`/usr/share/applications/sublime-text.desktop`，但可以正常使用了。

> 以上内容来自百度经验：
> [Ubuntu下Sublime Text 3解决无法输入中文的方法](http://jingyan.baidu.com/article/f3ad7d0ff8731609c3345b3b.html)
> 经过我亲身经历，`Ubuntu14.04`&`Ubuntu15.04`都是没有任何问题的。

#Package Control
好了，Windows用户可以回来了。   
打开Sublime Text 3，按顺序打开：   
{% highlight console %}
> View->Show Console
{% endhighlight %}
这时候下面会出现一个小框框

复制粘贴以下内容：
{% highlight python %}
import urllib.request,os,hashlib; h = 'eb2297e1a458f27d836c04bb0cbaf282' + 'd0e7a3098092775ccb37ca9d6b2e4b7d'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)
{% endhighlight %}
别管原理，用就是了。   
这个时候得等上几十秒左右吧。差不多这个Package Control就安装好了。   
More:[PackageControl](http://packagecontrol.io)   
成了，下一篇文章再讲具体的Package设置好了。