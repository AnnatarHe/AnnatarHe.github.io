---
layout: post
title: editorconfig 的介绍
tags: code js editor config
---

## 太多的不同

总所周知，世界上有着太多太多的编辑器。每个编辑器又各不相同，它们具体表现在各式各样的配置文件上，vim 用 vimscript 写配置文件。emacs 用 commonLisp 写配置。sublime text 和 vs code 都是用 json 配置，然而两个配置文件又不能通用。

操作系统大体看来虽然只有三种，但是里面的细节仍旧有很多的不一样。Unix 系列用 `/` 作为路径分割，而 Windows 用 `\` 作为分隔； Linux 用 **LF** 作为结尾符，Mac 则用 **CR**， 然后竟然还有 Windows 用的 **CR/LF**

那么字符集呢？光中文就有 gbk, gb2312 之类的，还有各种各样的其他字符集，算起来有一百多种。

还有 BOM。可能有很多人不知道是什么。然而它丝毫不影响我们写出 bug。我之前听朋友说，他们公司有个非常关键的服务用 python 写的。有一天出了 bug。然而程序员彻夜排查怎么都找不出原因，最后发现有个文件多了一个 BOM 头出错了。没错，它是不可见的。

那么再上层一些。虽然我不理解这个世界怎么会有程序员受得了 Tab 缩进，然而它确实真实存在，有相当多的项目用 Tab 缩进，然后又有很多人用 Space 缩进。这还没完，用 Space 缩进的又分为 2 个 Space 和 4 个 Space 缩进的派别，然后还有很多玩极限的奇葩用 8 个 Space 做缩进。

到这里还没完。你的项目可能有不同的文件类型。比如 makefile 做编译，python 干些小脚本，json 文件写个配置，代码掺杂一些 ruby 和 java（得是什么神经病才会把这两个语言放到一块去）。然后你的代码就很棒棒了。一会儿是 tab 缩进，一会儿又是 4 个空格缩进。然后变成两个空格。。。

## 需要相同的配置

任何一个略微有一点点想法的程序员都受不了混乱的代码风格。我之前见到过老代码，可能好几年了，一个不到两百行的文件里存在着三个不同风格的缩进，我看了两秒钟立刻关掉了，怕晚上做噩梦。我也是不知道当年这代码是怎么过 review 的。

现在好在有 eslint 这样类似的工具帮我们在事后做些提示的工作。可是大部分情况下它只检查缩进。更多的东西检测不到。

那么针对一个项目修改全局配置文件么？

对我来说我宁愿辞职。 我写的全球无敌最实用，最好看，最牛逼，最快速的 [vimrc](https://github.com/AnnatarHe/vim-config) 岂能因为一个项目就改掉？我这几年辛辛苦苦写下的配置就因为一个项目付诸东流？

同样，你肯定也不愿意把自己辛辛苦苦写出的配置改掉，更不愿意亲手把 Space 风格改成 Tab 风格。我知道这种感觉很像在奶茶店吃屎。

而且比如换行字符这种东西在有些配置项中很难找。很多人都不知道在哪里。

## 你的项目需要一个英雄

没错，你真的超级超级需要这么一个英雄：**.editorconfig**。

大概是银河系最简单的配置:

{% highlight yml %}
# EditorConfig is awesome: http://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true

# Matches multiple files with brace expansion notation
# Set default charset
[*.{js,py}]
charset = utf-8

# 4 space indentation
[*.py]
indent_style = space
indent_size = 4

# Tab indentation (no size specified)
[Makefile]
indent_style = tab

# Indentation override for all JS under lib directory
[lib/**.js]
indent_style = space
indent_size = 2

# Matches the exact files either package.json or .travis.yml
[{package.json,.travis.yml}]
indent_style = space
indent_size = 2
{% endhighlight %}

然后下载一些插件。jetBrains 家 IDE 全线支持。其他编辑器基本上需要安装一下插件。之后你就丝毫不用担心什么字符集不同，什么 BOM 头，什么乱七八糟的换行符。还有恶心的缩进。

而且！一行编辑器配置都不用修改！

而且！其他人只要安装一下插件就可以用里面规定的配置写代码！

妈妈再也不用担心被 review 代码的时候被打屁股了！

老板再也不用担心下面熊孩子胡乱写代码了！

讲真的，这真是个好东西。现在往项目里加个配置文件，一点儿都不晚。

## Refencens

* [editorconfig](http://editorconfig.org/)

* [CR, LF, CR/LF 回车 换行](http://www.cslog.cn/Content/cr-lf-crlf-new-line-enter/)

* [字符编码](https://zh.wikipedia.org/wiki/%E5%AD%97%E7%AC%A6%E7%BC%96%E7%A0%81)

* [BOM](https://baike.baidu.com/item/BOM/2790401)
