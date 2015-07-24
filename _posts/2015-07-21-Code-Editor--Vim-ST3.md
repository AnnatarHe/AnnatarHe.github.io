---
layout: post
title: Code Editor--Vim and SublimeText3
---
## Meet up
每个人心目中都有自己喜欢的编辑器，有人喜欢`Emacs`，有人喜欢`Atom`，我个人比较喜欢用`Vim`和`Sublime Text 3`，还有一个`PhpStorm`也会用一用呗

## Emacs,Vim,Others
有人说世界上只有三种编辑器，`Emacs`,`Vim`和`其他编辑器`。到处争论到底哪个才是第一也没什么意思，自己喜欢不就好了。

### Emacs
关于`Emacs`了解不多，也没怎么用过，不过一句话就可以解释这个家伙有多**牛逼**

> Emacs是伪装成编辑器的操作系统
> 
> --- 404 找不到出处

我确实是听说过有人拿`Emacs`煮咖啡。。。

### Vim
`Vim`是干嘛的呢,就是老老实实写代码的，不能煮咖啡，也不能当操作系统用。
但是，效率是一流的。要不然怎么能有这么大的名号。

我进`Vim`大坑是因为用了*Ubuntu*，一开始用的时候你知道么，这么反人类的`hjkl`移动简直让我恨透了，这这种东西能被那么多程序猿推崇？

后来有时候写代码就会想念，哎，这要按上下左右键好烦啊。然后再拿起`Vim`就亲切多了。

### Sublime Text 3
这货是我到目前为止用的事件最长的编辑器了。用起来非常简单，而且好看。像长得像我这么帅的自然要用帅帅的编辑器啦（自恋一下，别打我 TUT）
怎么说呢，颜值高，速度快，插件好。基本没什么缺点。

## Vim Way
我用`Vim`时间不长，也就半年左右的样子。从最初看到`vim`那简陋的如同石器时代的界面，到现在几乎打造成了`IDE`。

关于`Vim`配置没什么好说的，在我的**github**仓库里就有。注意一定要是`Linux` branch。

[VimConfigure](https://github.com/AnnatarHe/vimConfigure/tree/Linux)

那么这一节说什么呢，说说一些插件和快捷键吧。

之前看过国外大神配Vim的一篇文章，有一句讲的非常好

> 不懂的配置不要加
> 
> （忘记地址了）

我也是一样的意见，早先我把`.vimrc`配的满满的，各种乱七八糟的插件，设置。满屏幕什么鬼都有。

后来幡然醒悟，我这么小清新的人怎么能配的跟杀马特贵族样呢？

后来全都删了，重新自己查资料，写配置。

只是用了几个插件，不多，也没有配*YouCompleteMe*这种重量级插件，也就是

* *PowerLine*
* *Solarized*
* *NERDTree*
* *NERDCommenter*

这些东西，界面界面清爽，打字舒服。就这些。

{% highlight Vim %}
linespace=8
set guioptions-=l
set guioptions-=L
set guioptions-=r
set guioptions-=R
set guioptions-=m
set guioptions-=T
{% endhighlight %}
就放这些简单的吧，其他可以去看我仓库里的。

快捷键：
我说一些常用的吧

`Esc`这个键是最常用的，各个模式的切换都是靠这个。

`yy`复制整行，没什么可说的吧。

`p`粘贴

`dd`删除整行

`;p`自己设置的leader键，粘贴出来自剪切板的内容

`:e path/file` 打开或创建文件

`:last`回到上一个buffer

`:wq`保存并退出

`:BundleInstall` vundle的安装插件命令

暂时就这些吧，想到了再说

## Sublime Text 3

这个可得好好说说，因为我用的还不算短，应该是能说上话的。

必备插件有几个：

* *Package Control*
* *Emmet*
* *DocBlockr*
* *AdvancedNewFile*

我自己还装了：

* *Laravel Blade Highlighter*
* *Git*
* *Markdown Preview*

每一个都有大用处

`Emmet`是用来写html的，写前端的都知道。

`DocBlockr`注释*Ctrl-/*来注释或者取消注释。`NERDCommenter`的作用就是这个

`AdvancedNewFile`通过*Ctrl-Alt-N*召唤出新建文件的选项框，要多爽有多爽。

`Laravel Blade Highlighter` laravel的blade模板引擎的高亮。自己写写**php**用的

`Git` 你既然现在能看到这篇文章就证明你知道**Git**是个什么鬼了。

`Markdown Perview`一个*Markdown*的预览插件，很棒哦

快捷键有几个是超高操作：

`CVS`大法，复制剪切粘贴

`Ctrl-Shift-up/down`up是向上的箭头，down是向下的箭头。用来行转移

`Ctrl-l`整行选择

`Ctrl-p`go to anything，这个真牛逼，超高使用率

`Ctrl-Shift-p`召唤控制面板，可以为所欲为

snippets也写了一些，主要就是*jekyll*的高亮，头信息什么的。

具体的配置参数
{% highlight json %}
{
	"color_scheme": "Packages/Color Scheme - Default/Monokai.tmTheme",
	"font_face": "Monaco",
	"font_size": 14,
	"ignored_packages":
	[
		"Vintage"
	],
	"line_padding_top": 7,
	"tab_size": 2,
	"word_wrap": true
}
{% endhighlight %}

还有一些*snippets*
{% highlight xml %}
<snippet>
	<content><![CDATA[
---
layout: post
title: ${1}
---
${2}
]]></content>
	<tabTrigger>layout</tabTrigger>
	<scope>text.html.markdown</scope>
</snippet>
{% endhighlight %}
还有*highlight*的*snippet*因为和*jekyll*语法有些冲突，所以就不放了。^_^
## Conclusion

`Vim`在`Unix`世界是当之无愧的霸主。你永远不能逃脱`Vim`给你带来的巨大便利。

`Sublime Text 3`是`Windows`世界的领头羊，无与伦比的超快启动速度，漂亮的界面，众多的插件。有生以来感觉到在`Windows`里面写代码好像也不错。但是这货跨平台啊！！！好吧，又黑了`Windows`一把。

等我儿子能拿笔了，我肯定先教他这个：
{% highlight javascript %}
console.log('Hello World')
{% endhighlight %}
或者:
{% highlight c %}
#include <stdio.h>
int main(){
    printf("Hello world\n");
    return 0;
  }
{% endhighlight %}
而且使用`Vim`写:)

## By the way

刚刚黑了`Windows`的一瞬间想起来`Windows 10`好像马上就要出了。

不得不说，`Windows`是一款非常优秀的操作系统，可怕的兼容性，及其简单的操作，超大规模的使用率，众多的软件支持...etc.这都在证明`Windows`的优秀。

不过，对于写代码的同学貌似是不怎么好的，糟糕的命令行，莫名其妙的众多语言开发的问题都在把程序猿推向`Mac`和`Linux`。

好了，心情大好！
