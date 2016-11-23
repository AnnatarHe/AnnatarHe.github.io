---
layout: post
title: 关于 MacBook Pro 的入门
---

## 下单

实际上之前很早就期待MacBook Pro，一直是准备买的，只是因为一直得到风声，十月份会有新品，所以一直是在等待。

终于在十月末发布了新品，虽然各种感觉诚意不足，可是仍旧是比之前的MacBooK Pro要好一些的。而且因为对macOS的迷信，就上了贼船。

关于钱，是真的贵。我一个普通的15英寸MBP达到了2万的售价。好不容易求着我爹才给买的。

![MBP profile](/images/mbp_2016/screenfetch.png)

幸好学生优惠还能用，所以售价为19948.

11月2号下单，在16号到货。打开满是新苹果的味道。

## 设置

开始就是各种配置。一般都能看得懂，所以没什么可说的吧。

配置好了我首先下载Xcode，然后是[homebrew](http://brew.sh/)，随后安装各种工具。

包括：[微信](http://weixin.qq.com/cgi-bin/readtemplate?t=mac&platform=wx&lang=zh_CN), [QQ](http://im.qq.com/macqq/), [iTerm2](https://iterm2.com/), [chrome](https://www.google.com/chrome/browser/desktop/index.html), [sublime text](https://www.sublimetext.com/3), [vscode](https://code.visualstudio.com/), [网易云音乐](http://music.163.com/#/download), [Web Storm](https://www.jetbrains.com/webstorm/), [迅雷](http://dl.xunlei.com/?from=index), [Docker](https://www.docker.com/products/docker#/mac)

期间又用homebrew安装了macvim和go。还有proxychains-ng

话说，这一套安装下来还是有点儿疲惫的。

然后因为要写论文什么的，试了一下Pages，简直炸裂。不兼容特性一大堆，页面设置页做不好。然后又去装了Office。

这里，政治正确的说法应该是买正版软件的。但是，我确实想说，这些正版软件实在是太贵了。几乎都是几百，轻则人民币，重则直接美刀！

我很想支持他们的工作，可是这些价格贵的实在是太离谱了。我这么一个穷学生怎么可能买得起。

## 转换头

2016版MBP的一大特点就是只有四个Type-C的接口。这就导致几乎所有的外设都得通过转接口实现联通。

所以我买了一个媒体转接口(就是一个Type-C接口转出一个USB-A，一个HDMI还有一个Type-C)，还有一个Type-A转三个USB-A再带一根网线的那种。总共两个，花了将近两百吧。

只是最近用的时候发现，非官方转接口似乎有问题的。

我把显示器的HDMI接出去有时候是没有信号的。一定要先把所有线都拔了，然后只插一个HDMI连接，显示器上有图像了再连USB-A的接口才行。

很诡异对吧。

所以我退货了，买了苹果官方的线。

## 新手须知

作为一个长期使用Ubuntu的用户来说，命令行根本没有什么问题，想怎么用就怎么用。

可是这个图形界面就很尴尬了。不会用。。。

首先是Finder，我是想把东西放在`$HOME`下的，可是找半天都找不到，问了老司机才知道原来要把目录拖进Finder的收藏夹才行。

然后是输入法的切换，默认是大小写锁定键，而不是搜狗输入法中习惯的shift。已经好几天了，我到现在还习惯用shift。

还有外接显示器的时候要把`节能`设置中的`自动切换图形卡模式`关掉。

sublime的配置文件地址在`~/Library/Application Support/Sublime Text 3/Packages/User/`

sublime配置到命令行需要自己做个软连接：

{% highlight bash %}
$ ln -s /Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl /usr/local/bin/subl
{% endhighlight %}

而VSCode要配置到命令行可以直接在VSCode里面打开控制面板，敲`shell command`就能看到安装选项了。

## Touch bar

这个功能其实还好吧。反应还是非常灵敏的。比如我现在在这里打字，touch bar上就会提示出备选项。在用Pages的时候也会有各种提示。

虽然目前除了苹果家的产品，其他的都没加入touch bar支持，但是未来肯定是有的。

Touch ID集成了。不过只有App Store能用到，其他地方没有调用。

总体来说潜力很大。

但是老子的ESC怎么就没了！！！

作为一个Vim用户没有ESC怎么活！！！

好，我忍了，外接键盘好吧？但是说好的Touch bar怎么用？

不外接键盘又怎么用ESC！！！

我相信你隔着这块屏幕都能感觉到我的心情！

杀父之仇不过如此啊！何必呢！

苹果的码农都不用Vim么！我不信啊！

说好的针对专业用户呢！

相比之下，看着屏幕再转移视线到下边的touch bar上的上下文开销就显得微不足道了。

好气啊！

## 键盘

配的是第二代蝶式键盘。听网络风评，第一代键盘用起来可能跟吃屎没什么区别。

这个键盘其实我用了两天感觉还好吧。

键程短是真的，可是也是有反馈的哎。

打起字来也会啪啪响，有点儿小青轴的感觉。

其实还好。

不过这几个 command, option, control 的键位我有点儿反应不过来，毕竟用了那么长时间的Windows键盘。习惯就好了吧。

下面那么大一块的触控板有点儿吸引眼球。学了一点儿多指操作，感觉还挺好的。

## Terminal 代理

作为一个码农，自然是要会某些技能的。

我有时候也写一点儿Go，而Go的一些包在google code上。今天在下载第三方包的时候碰到了很大的问题，我明明是有代理的，但是却一直提示我链接失败。

后来找到了答案。原来是因为Terminal并不会用在网络设置中的代理，因为终端只是运行命令的，而没有网络链接。

解决方法也是有的。

要在自己的`.zshrc`中设置两个环境变量：

{% highlight bash %}
export http_proxy=http://your.agent.site:port
export https_proxy=$http_proxy
# 终端中
$ source .zshrc
{% endhighlight %}

好了，可以正常得用梯子了。

## 感受

总体还挺不错的。

屏幕很棒，操作很爽，颜值很高。

问题嘛，Office用着很不适应，导致我论文格式都不好改。

![mbp](/images/mbp_2016/mbp.jpeg)
