---
layout: post
title:  现代 Vim 插件
tags: vim unix mac tools editor code
---

[Vim](https://vim.sourceforge.io/) 出现已经二十多年了。作为一个一直处在鄙视链顶端的编辑器，你可能很难想象它为什么这么难用，即便是历尽千辛万苦学会了 `hjkl` 这些快捷键。至于网上的文章大多还停留在 vim 7 时代，vim 8 的发布加入了以“异步”为首的众多好用新功能，而玩法自然也需要做相应的调整。
无论是靠着高三的记忆力强行记住了快捷键的初学者，还是玩了好几年 vim 但很少重量使用的进阶玩家，还是因为受到其他编辑器的诱惑而叛变 vim 的用户，都可以尝试着加上这些插件。试着开始全新的 vim 生活。

## 包管理器

Vim 的包管理最近终于有了官方标准，之前基本上是社区自由发挥。而目前来看还是社区的实现更加简单易用。目前用得多的应该是 Vundle 了，不过它有一个问题：慢。假如你有30个插件，那么它是第一个安装完再安装第二个。一个韩国人写的 [vim-plug](https://github.com/junegunn/vim-plug) 就解决了这个问题：并行处理，shadow clone，而且启动的时候可以按需加载插件，最主要的的是很容易用，只要执行一个命令就可以了，不像 vundle 那么复杂。

## 搜索

Ctrl-P 在其他编辑器里已经是默认的全局搜索键了，vim 也有 [ctrlp](https://github.com/ctrlpvim/ctrlp.vim) 插件，它可以搜索文件路径上的文件名，还有最近文件等各种快捷打开。看起来似乎挺好的，直到 [fzf.vim](https://github.com/junegunn/fzf.vim) 的出现。[fzf](https://github.com/junegunn/fzf) 的搜索速度更快，而且异步，不会在初始化搜索的时候卡死界面响应。
安装好 fzf，然后加载 fzf.vim 插件，将ctrl-p 键位映射成 :Files<CR>，就可以体验到高速搜索，中间根本不用等界面响应，等关键词输入，结果就出来了。配合 [ag](https://github.com/ggreer/the_silver_searcher) 可以屏蔽掉 .gitignore 内的文件。
搜索除了文件快速打开，还有全局行内搜索，之前 vimgrep 一直是一个比较常用的命令，然而体验不太好，需要指定搜索内容和搜索范围，还要输一些命令，而且略慢。那么 ag 一定是目前最好的选择。不管其他因素，进到项目主页，一看是 c 写的基本上就已经稳了。实际上它也确实是目前为止最快的行内搜索。使用的话，需要先安装命令行 ag，然后安装 [ack.vim](https://github.com/mileszs/ack.vim) ，注意不要用 ag.vim 它已经不被支持了。
不过有个问题，fzf 也内置了对 ack 的支持，只是比 ack.vim 不如，所以需要重新映射一个 ack.vim 使用的键位，我个人用了 `<Leader>f` 意为 find。

## 状态条

Powerline, airline 都挺好，不过它们都有着各自的问题，和 [lightline](https://github.com/itchyny/lightline.vim) 相比不够优秀。lightline 的特点就是它够小，可配置。想要什么现实，不想要什么显示，都可以在配置文件里自行调整。配合 powerline-fonts 效果更佳，好看又有用的状态条会让编码生活更开心。

## 代码检查

在 vim8 之前，代码检查很痛苦，一般是自行手动处理。现在 vim8 支持了异步操作，与之相配的 [ale](https://github.com/w0rp/ale) 终于终结了这种痛苦。在写代码之中就可以自行异步检查语法错误，随时提供错误信息。

## 目录

自带的 Explore 也许是够用了，不过 [nerdtree](https://github.com/scrooloose/nerdtree) 更好用，而且可以更多地配合其他插件，比如 [nerdtree-git-plugin](https://github.com/Xuyuanp/nerdtree-git-plugin) 这样的东西可以更加清楚地了解到本次修改都改了哪些文件，哪些纳入到了版本控制中。

## 其他

还有诸如 [vim-polyglot](https://github.com/sheerun/vim-polyglot) 这样必备的语法高亮插件， [ultisnips](https://github.com/sirver/ultisnips) 这样的的 snippets 管理，[surround.vim](https://github.com/tpope/vim-surround) 来简化修改成对标签的操作插件， [multiple-cursors](https://github.com/terryma/vim-multiple-cursors) 这样的类似于 sublime text 的多行选取，atom-dark 这样好看的黑色主题

## Summary

Vim 确实是非常好用的一款编辑器。其强大之处就和我曾在一本书上看到的那样：“Vim 是唯一一款能够跟上思维速度的编辑器”。看起来奇怪的快捷键排布如果形成肌肉训练，它只会是那一款忘记其他任何事情专注于优美代码的编辑器。对程序员来说，专注就是优秀。对 vimer 来说，vim 就是专注。

具体可以参考我个人的 [.vimrc](https://github.com/AnnatarHe/vim-config) 配置文件

## References

* [VIM AFTER 15 YEARS](https://statico.github.io/vim3.html)

* [vim awesome](https://vimawesome.com/)

* [vim 8 内置包管理](https://aisk.me/vim-8-native-plugin-manager/)

* [Vim: So long Pathogen, hello native package loading](https://shapeshed.com/vim-packages/)
