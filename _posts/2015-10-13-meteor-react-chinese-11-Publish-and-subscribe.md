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

在服务端调用`Meteor.publish`注册一个名为`tasks`的发布器。当`Meteor.subscribe`在客户端被调用时(传入发布器名称)，客户端将会从发布器订阅所有的数据。这些数据是在数据库中所有在这方面的任务。为了真实的感受发布订阅模式的力量，让我们来实现这样的特性吧，他允许用户将任务定义为私有状态，这样其他的用户就不能再看到这些东西了

### 添加一个按钮使任务私有化

来给任务添加一个“私有”属性和一个给用户将任务私有化的按钮。
这个按钮应该只是给任务的所有者来显示。我们想要一个标签来表示当前的状态：公有或私有

首先，我们要添加一个新的方法，这个方法可以被我们调用并将任务设置为私有状态

{% highlight js %}
	// simple-todos-react.jsx文件

  setChecked(taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },

	// 添加开始
  setPrivate(taskId, setToPrivate) {
    const task = Tasks.findOne(taskId);
 
    // 确保只有任务所有者可以将任务设置为私有状态
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.update(taskId, { $set: { private: setToPrivate } });
    // 添加结束

  }
});
{% endhighlight %}

现在我们需要传一个新的属性给`Task`，使其决定我们是否想要展示这个私有按钮。
这个按钮应该只有在当前登录的用户是任务的所有者时才会被展示

{% highlight js %}
// App.jsx文件

renderTasks() {
  // 从this.data.tasks中获取任务列表
  return this.data.tasks.map((task) => {
  
  	// 添加开始
    const currentUserId = this.data.currentUser && this.data.currentUser._id;
    const showPrivateButton = task.owner === currentUserId;

    return <Task
      key={task._id}
      task={task}
      showPrivateButton={showPrivateButton} />;
      // 添加结束

  });
},
{% endhighlight %}

{% highlight js %}
// Task.jsx文件
// Task组件，表示单个的任务
Task = React.createClass({
  propTypes: {

  	// 添加开始
    task: React.PropTypes.object.isRequired,
    showPrivateButton: React.PropTypes.bool.isRequired
    // 添加结束

  },
 
  toggleChecked() {
{% endhighlight %}

添加一个按钮，使其新的属性去决定它是否应该被显示

{% highlight js %}
// Task.jsx文件

  checked={this.props.task.checked}
  onClick={this.toggleChecked} />

// 添加开始
{ this.props.showPrivateButton ? (
  <button className="toggle-private" onClick={this.togglePrivate}>
    { this.props.task.private ? "Private" : "Public" }
  </button>
) : ''}
// 添加结束

<span className="text">
  <strong>{this.props.task.username}</strong>: {this.props.task.text}
</span>
{% endhighlight %}

我们要为这个按钮定义事件监听

{% highlight js %}
// Task.jsx 文件

  Meteor.call("removeTask", this.props.task._id);
},

// 添加开始
togglePrivate() {
  Meteor.call("setPrivate", this.props.task._id, ! this.props.task.private);
},
// 添加结束

render() {
{% endhighlight %}

最后一件事，来给`Task`组件的`li`元素更新class, 来反映私有状态

{% highlight js %}
render() {
  // Give tasks a different className when they are checked off,
  // so that we can style them nicely in CSS

  // 添加开始
  // Add "checked" and/or "private" to the className when needed
  const taskClassName = (this.props.task.checked ? "checked" : "") + " " +
    (this.props.task.private ? "private" : "");
	// 添加结束

  return (
    <li className={taskClassName}>
{% endhighlight %}

### 基于私有状态有选择地推送数据

现在我们有了设置任务私有的方式，那么我们就要修改我们的发布函数使其只发送已登陆用户的任务

{% highlight js %}
// simple-todos-react.jsx 文件

}
 
if (Meteor.isServer) {
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {

  	// 添加开始
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
    // 添加结束
    
  });
}
{% endhighlight %}