---
layout: post
title: [翻译]Meteor React 制作 Todos - 5 - 在移动端运行
Tags: js Meteor React
---

## 在安卓和苹果上运行你的应用

> 目前Windows平台的Meteor并不支持移动应用的构建，如果你正在使用Windows平台的Meteor，你得跳过这一步了。

现在来看，我们编写我们的应用，测试我们的应用都是在浏览器上，其实Meteor早就设计了跨平台的能力 -- 你的**待办事宜**网站也可在安卓或者苹果上运行，而只需要几个简单的命令

Meteor使得导入构建移动应用的所需工具变得很简单，只是下载所有的应用程序可能得花点儿时间，Android大概有300MB，IOS得要安装那个2GB的`Xcode`，如果你并不想安装这些工具，你也可以跳过接下来的几步。

### 运行一个IOS模拟器(仅限Mac)

如果你有一台Mac, 你可以在IOS模拟器里运行你的应用。

到应用目录输入下面一行代码：
{% highlight console %}
meteor install-sdk ios
{% endhighlight %}

这条命令会通过设定几个必须的设置来从你的项目中构建一个IOS应用
当上一条命令结束，我们输入

{% highlight console %}
meteor add-platform ios
meteor run ios
{% endhighlight %}

你将会看到一个IOS模拟器会从你正在运行的调出来~

### 在安卓模拟器上运行

打开命令行，在你的应用目录中输入：
{% highlight console %}
meteor install-sdk android
{% endhighlight %}
这将会在你的应用中，帮你安装所有需要构建一个安卓应用所需的工具。当所有的安装完成，你需要输入
{% highlight console %}
meteor add-platform android
{% endhighlight %}
在同意了许可条款后输入
{% highlight console %}
meteor run android
{% endhighlight %}

在一些初始化工作后，你将看到一个安卓模拟器调出来，在原生安卓中运行着你的应用程序。这个模拟器可能会有点慢，所以你要是很想看到真实的效果，你得拿出真实的设备让它跑。

### 在安卓设备上运行安卓应用

首先，