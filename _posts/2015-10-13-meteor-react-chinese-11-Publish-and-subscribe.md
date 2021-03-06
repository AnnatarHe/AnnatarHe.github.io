---
layout: post
title: 翻译 Meteor React 制作 Todos - 11 - 发布订阅
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
  // 当它们被关闭时给一个不同的className,
  // 这样我们就可以通过CSS来设置好看的样式了

  // 添加开始
  // 当我们需要的时候可以给“确认框”添加”私有“样式
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
  // 只发布公有的或者是属于当前用户的任务
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

要测试这个功能是否能用，我们可以使用浏览器的“隐私浏览”模式作为一个不同的用户登录。把两个窗口拍两边，然后标记一个私有任务，看看另一个用户是否能够看到。现在把它再设置成公有状态，它就又会出现了！

### 额外的方法安全

为了完成我们私有任务的特性，我们需要给`deleteTask`和`setChecked`方法一些核实的特性，用来确保只有任务的拥有者可以删除和完成一个私有任务

{% highlight js %}
// simple-todos-react.jsx
removeTask(taskId) {

	// 添加开始
  const task = Tasks.findOne(taskId);
  if (task.private && task.owner !== Meteor.userId()) {
    // 如果任务是私有状态，确保只有拥有者可以删除
    throw new Meteor.Error("not-authorized");
  }
	// 添加结束

  Tasks.remove(taskId);

},

setChecked(taskId, setChecked) {

	// 添加开始
  const task = Tasks.findOne(taskId);
  if (task.private && task.owner !== Meteor.userId()) {
    // 如果任务是私有的，确保只有任务拥有者可以完成此项任务
    throw new Meteor.Error("not-authorized");
  }
  // 添加结束

  Tasks.update(taskId, { $set: { checked: setChecked} });
},
{% endhighlight %}

> 注意：这个代码允许任何人删除任意公有任务。你应该当尽力做一些小的改变：只有任务拥有者可以删除他们的任务

我们已经完成了私有任务的特性了！当攻击者试着去看或者修改某个私有任务时，我们的应用也是安全的了！