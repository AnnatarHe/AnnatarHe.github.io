---
layout: post
title: 更好的使用 Vim
tags: editor code
---

## 改键

我之前一直以为改键的操作做没有必要，但是在尝试了一个月以后我已经没办法重新使用别人的键盘了 ———— 太慢了。

改建的意义在于将 Ctrl 映射到 Caps Lock 上。原因在于小拇指很容易按到这个大写锁定而很难按到原来 ctrl 的位置。

改键对于 Emacs 用户更为重要。

操作方法：Ubuntu 参考[这篇文章](http://www.cnblogs.com/lzhskywalker/archive/2012/07/20/2600854.html), windows是改注册表，自行google吧。

## Tmux

我一直把 Ubuntu 作为工作写代码的操作系统，终端对于我来说有仅次于文本编辑器使用频率。

Tmux 不需要有很牛逼的技巧，我每次只是分割窗口而已，没有什么高端操作。

`C-b` 加上 `%` 就可以切分窗口，想要切换的时候就 `C-b` 加上 `→` 就是转到右边的窗口，同理，左边也是一样。

安装很简单 `sudo apt install tmux` 即可。

## Plugins

有插件的 Vim 和没有插件的 Vim 是两款编辑器。

我推荐的做法是安装 [vundle.vim](https://github.com/VundleVim/Vundle.vim)作为 vim 的包管理器，安装方法文档里面有。我只是介绍这么个东西而已。亲手实践才能印象深刻。

之后推荐一个网站[vimawesome.com](http://vimawesome.com/)这里有 vim 的插件集合，可以看到大部分插件的信息。

然后给一个我自己的插件列表：

{% highlight vim %}
Plugin 'VundleVim/Vundle.vim'
Plugin 'bling/vim-airline'
Plugin 'kien/ctrlp.vim'
Plugin 'scrooloose/nerdcommenter'
Plugin 'scrooloose/nerdtree'
Plugin 'Raimondi/delimitMate'
Plugin 'lepture/vim-css'
Plugin 'wavded/vim-stylus'
Plugin 'fatih/vim-go'
Plugin 'SirVer/ultisnips'
Plugin 'gosukiwi/vim-atom-dark'
Plugin 'pangloss/vim-javascript'
Plugin 'mattn/emmet-vim'
{% endhighlight %}

主题颜色是 `atom-dark` 我曾试用过 material theme， 但是我觉得太丑了，完全没有在 sublime 上的美感，所以还是换了。

ctrlp 是快速搜索文件用的，说实话真的超级有必要。它给我养了个坏习惯：再也受不了 webstorm 的搜索功能了。

nerdcommenter 是用来快速注释和反注释的，很明显没有 sublime 智能，但是一直没有找到比较好的替代品。

nerdtree 是文件树列表。真神器。自从我读了一遍 help 以后才发现它上天入地无所不能

airline 纯粹是装饰用的。对我来说没什么实质作用。但是我一天九个小时都对着这货不好看一点儿怎么受得了。

delimitMate 自动补全`"`这些东西。

下面的`css`, `stylus`, `go`, `javascript`都是语言加强的

ultisnips 是快速代码片段，像是每个文件都有的头注释，框架的东西都可以放在里面。大量写代码的时候是神器。

## 快捷键

vim 本身的快捷键快得有些不讲道理。以至于难以记忆。

一开始看 vim 的快捷键会觉得是在看谭浩强的书。到处都是莫名其妙的简写。然而所有的键位都是有明确意义的。下次再看到某些简写的时候试着按照下面的列表理解一下：

----------------------
|   |                |
----------------------
| d | delete(删除)   |
----------------------
| y | yank(粘贴)     |
----------------------
| c | change(改变)   |
----------------------
| v | view(视图)     |
----------------------
| o | open(打开)     |
----------------------
| r | replace(更换)  |
----------------------
| w | word(单词)     |
----------------------
| u | undo(撤销)     |
----------------------

其他还有很多，总之在使用的时候多想想为什么这个操作会对应这个键。

当然，有几个键完全是不讲道理，为了效率而做的，比如`hjkl`这四个。

还有神奇的`.`操作，可以重复上一个操作。非常非常有用的技巧。不过我不准备说太多，我认为这些东西更多的在自己的实践和领悟。

vim 有个神奇的`<Leader>` 键，我将其映射在了`;`上，因为离右手小拇指比较近，容易按，而且和正常的键并没有很多功能上的冲突。

下面是个人对于插件的键位设置：

我将 nerdtree 的 toggle 映射在了`;t`上，没有什么原因，纯粹是手感好。

`;cc` 是注释， `;cu`是取消注释。这个键位是跟 jeffway 学来的，一直觉得不是很好按，但是习惯了也还好。

其他的倒没什么特别了

## 常用操作

我虽没有几十年的 vim 使用经验，然而还是有一些自己认为比较常用的操作的。

我平常不太喜欢用buffer，更多的是用tab来做，因为tab更容易观察得到。

所以下面的一些快捷键比较常用了：

`gt`： tab切换

`Ctrl-w-h`, 当前窗口切换，我认为这个组合键的的意思是 w 代表 window, Ctrl 只是前缀。后面的hjkl就是上下左右了。

## 深入插件

对于插件，我有些要说的。

插件的配置在我看来还是挺复杂的。

比如 ctrlp 你需要把 node_modules 这些没用的东西 ignore 掉，

对于 airline 你需要下载 [powerline-fonts](https://github.com/powerline/fonts) 来让它显示三角形。

在`nerdtree`中可以按`r`刷新当前节点，按`m`有更多选项，在`m`中可以新建文件删除文件什么的操作。

在 [ultisnips](https://github.com/SirVer/ultisnips) 中还要自己写自己的snippets

我觉得深入插件才能更好的应用它们，才会更加理解这些插件的强大。要知道写这些插件的各个都是大牛，他们可不能忍受自己做出来傻逼产品！

## 资源

最后提供一些资源：

* [我的 vimrc 配置文件](https://github.com/AnnatarHe/vimConfigure/blob/Linux/.vimrc)

* [Vim实用技巧](https://www.amazon.cn/Vim%E5%AE%9E%E7%94%A8%E6%8A%80%E5%B7%A7-%E5%B0%BC%E5%B0%94/dp/B00JONY3W0/ref=sr_1_1?ie=UTF8&qid=1468939119&sr=8-1&keywords=vim%E5%AE%9E%E7%94%A8%E6%8A%80%E5%B7%A7) vimcasts作者写的

* [Vim Mastery](https://laracasts.com/series/vim-mastery) 视频教程