---
layout: post
title: oh-my-zsh
tags: tools zsh terminal
---

## Get start

有很多大神说过，牛逼的都是秀代码，二逼的秀工具。

然而我真的忍不住来分享工具

## Install

我早先是没有发现有这么一个神器的。曾经玩`Vim`也是比较痛苦的。

然而我最近找到了！！！

可以先去官网上看一下 [zsh](http://ohmyz.sh)

安装这个部分我没什么说的

先安装`zsh`,在安装`oh my zsh`

命令在这里，拿去用吧！
{% highlight console %}
$ sudo apt-get install zsh
$ sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
$ chsh -s /bin/zsh
{% endhighlight %}

到这里必须重启或者是重新登录一下。用以加载刚刚安装的`zsh`作为默认的`shell`

## Terminal

这个时候应该已经使用`zsh`了，如果没有请联系我，我给你看看。

其实这个时候应该放截图的，但是放截图之前得先把`Terminal`给配置好了！

其实很简单的：

在`Terminal`的上面依次选择：

File -> New profile --创建新的`profile`

Edit -> Profiles -> 选中刚创建的profile -> Edit -> 字号修改成13

其实字号这个东西跟屏幕的关系非常的大。我自己外置了一个24吋的屏幕，这个字号看起来是非常舒服的

然后是修改透明度，在`Background`里面，我设置的是80%

好啦～看图！

![zsh-meetup](/images/zsh/zsh-meetup.png)

恩，看起来挺好的。

那么下一步就是调整`Vim`了。

## Vim

刚打开，我的天，怎么能有这么丑的东西。

撸起袖子改改吧。

。。。

然后我改了半天也始终是弄不好。

因为我只想在`Terminal`里面使用`Vim`

我的主力编辑器依旧是`Sublime Text`和`PHPStorm`

因为`Terminal`比较简单，只支持`256色`

好在我找到了解决方案：

首先在`.zshrc`里面加上这样的配置语句：

{% highlight bash %}
if [ -e /usr/share/terminfo/x/xterm-256color ]; then
    export TERM='xterm-256color'
  else
    export TERM='xterm-color'
fi
{% endhighlight %}
这里使得Terminal确认是256色

然后在`.vimrc`里面在行首加上：

{% highlight bash %}
set t_Co=256
{% endhighlight %}

好啦，现在再看看`Vim`,是不是好多了，色彩也都对了。

顺便附录自己的[Vim配置](https://github.com/AnnatarHe/vimConfigure)

## References

* [256 colors in vim](http://vim.wikia.com/wiki/256_colors_in_vim)
