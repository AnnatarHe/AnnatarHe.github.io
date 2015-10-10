---
layout: post
title: [翻译]Meteor React 制作 Todos - 11 - 发布订阅
tags: js Meteor React
---

## 通过发布订阅模式过滤数据

现在我们已经把应用中比较敏感的代码放到了一些方法里面，我们还需要学习Meteor安全故事的另一半内容了。
到现在为止，我们一直是假设整个整个数据库到客户端上，这意味着我们调用`Tasks.find()`方法我们将会得到集合中所有的数据。如果我们应用程序的用户想要保存私密敏感信息的话，这样做并不好。我们需要一种可以控制数据的方法，使Meteor发送所需数据到客户端数据库

就想上一步骤的`insecure`一样，所有新的Meteor应用都在开始时带着`autopublish`包的。这个包可以自动的同步所有数据库的数据到客户端上，先来移除这个包，然后看看会发生什么
{% highlight console %}
meteor remove autopublish
{% endhighlight %}

当应用程序刷新，任务列表将会变成空的。没有`autopublish`包，我们就必须明确的指定服务端发送什么到客户端。这个在Meteor的函数是通过`Meteor.publish`和`Meteor.subscribe`来做这些的。

现在来添加他们把
{% highlight js %}
    passwordSignupFields: "USERNAME_ONLY"
  });
	
	// 添加这一行
  Meteor.subscribe("tasks");
 
  Meteor.startup(function () {
    // 在页面准备好之后使用Meteor.startup来渲染组件
    React.render(<App />, document.getElementById("render-target"));
  });
}

// 添加开始
if (Meteor.isServer) {
  Meteor.publish("tasks", function () {
    return Tasks.find();
  });
}
// 添加结束
 
Meteor.methods({
  addTask(text) {
{% endhighlight %}

一旦你添加了这些代码，所有的任务将会再次出现

在服务端调用`Meteor.publish`注册一个名为`tasks`的发布器。当`Meteor.subscribe`