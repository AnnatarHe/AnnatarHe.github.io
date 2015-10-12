---
layout: post
title: 翻译 Meteor React 制作 Todos - 03 - 集合
tags: js Meteor React
---

## 数据存储

集合(Collection)是Meteor存储持久化数据的方式。Meteor 中的集合比较特殊的是，它可以从服务端，包括客户端接收数据。这使得编写视图逻辑变得更加简单 -- 不用去写太多的服务端的代码。它也可以自动的自我更新，因此一个视图组件受到一个集合的支持，他可以自动的展示最新的数据。

创建一个新的集合和在你的JavaScript中调用`MyCollection = new Mongo.Collection('my-collection');`一样容易。

在服务端，这些设置调用一个叫`my-collection`的MongoDB的集合；在客户端它创建了一个和服务端集合的缓存链接。

我们将会在第十二步学到更多，但是现在，我们还是写我们所制定的代码，将整个数据库持久化到客户端。

添加一行代码 去定义我们的第一个集合

在`simple-todos-react.jsx`中的第一行加入这么一段
{% highlight js %}
// 写在第一行
// 定义一个集合来支撑我们的任务列表
Tasks = new Mongo.Collection("tasks");
{% endhighlight %}

### 使用来自（数据库）集合的数据替换React组件中的数据

使用来自Meteor中的数据来替换React组件中的数据，需要在React组件中包含`ReactMeteorData`的mixin，在你的组件中带着这样的一个Minin你就可以定义一个叫做`getMeteorData`的方法，这个方法定义了如何跟踪数据的改变。这个你从`getMeteorData`中返回的对象可以传递到`render`中的`this.data`。现在来试试。

在App.jsx中修改一些部分
{% highlight js %}
// App component - represents the whole app
App = React.createClass({
 
 	// 修改内容起始
  // 这个mixin使得getMeteorData方法可以使用
  mixins: [ReactMeteorData],
 
  // 从Tasks集合中获取数据并添加到this.data中
  getMeteorData() {
    return {
      tasks: Tasks.find({}).fetch()
    }
  },
  // 修改内容结束
 
  renderTasks() {
    // 从this.data中获取数据
    return this.data.tasks.map((task) => {
      return <Task key={task._id} task={task} />;
    });
  },
{% endhighlight %}

当你改变了这些代码的时候，你可能会注意到（浏览器上）那些在todo list上的人物会消失。这是因为我们的数据库到现在是空的 -- 我们得写入一点任务（数据）

### 通过命令行添加数据

在集合中的子项被叫做*文档*(documents), 蓝使用服务端的数据库命令行插入一些文档到我们的集合中吧！在一个新的终端窗口上，进入应用程序的目录并输入这样的命令：

{% highlight console %}
meteor mongo
{% endhighlight %}

这就进入了你的应用程序的本地开发数据库，在提示框中输入这样的命令：
{% highlight js %}
db.tasks.insert({ text: "Hello world!", createdAt: new Date() });
{% endhighlight %}

现在在你的浏览器中，你将会看到你的应用程序立刻更新了界面并展示了新的任务（数据）。你应该能够明白我们并没有写入任何的连接到服务器端数据库的前端代码 -- 他就是这么自动的进行了！

再向数据库命令行中插入几条不同的数据。在下一步，你将看到如何在你的应用街面上添加功能，这样就不需要再在数据库命令行中添加任务了。