---
layout: post
title: [翻译]Meteor React 制作 Todos - 10 - 方法的安全性
tags: js Meteor React
---

## 方法的安全性

在这个步骤之前，这款应用的任何用户都可以修改数据库的任何部分，在一个非常有意思的小项目或者演示项目中可能已经不错了，但是任何一个真实的应用都需要对这些数据进行权限控制。
在Meteor上，最好的方法就是通过声明*方法*。以此来直接取代客户端的代码。这些方法叫做`insert`, `update`, 还有`remove`，这将会替换执行的方法。它将会确认用户是否有权限完成这么一整套操作。那么随后在客户端中做出的任何对客户端的改变都会发给数据库

### 移除 `insecure`

每一个新创建的Meteor项目都被默认的添加了`insecure`包。这个包允许我们从客户端中编辑数据库。在做产品原型的时候这个包非常的有用，但是现在我们得关掉这个备胎。要移除这个包，我们得去应用目录下执行

{% highlight console %}
meteor remove insecure
{% endhighlight %}

如果在移除这个包之后你试着去使用这款应用，你将会看到输入框或者是按钮都不能用了，这是因为所有的客户端数据库的权限被取消了，现在我们需要在我们的应用中通过使用一些方法来重写一些部分

### 定义一些方法

首先我们需要定义一些方法，我们需要一个方法，这个方法为我们定义了每个数据库想在客户端执行的所有操作。这些方法应该用代码定义，可以同时在客户端和服务端执行 -- 我们会晚点儿在标题为“乐观的界面”的章节中继续讨论

{% highlight js %}
// simple-todos-react.jsx文件

    React.render(<App />, document.getElementById("render-target"));
  });
}

// 添加开始
Meteor.methods({
  addTask(text) {
    // 在插入之前确保用户已经登陆
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
 
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
 
  removeTask(taskId) {
    Tasks.remove(taskId);
  },
 
  setChecked(taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});
// 添加结束
{% endhighlight %}

现在我们定义了我们的一些方法。我们需要去更新一些地方。我会要用刚刚定义好的方法去操作数据库，而不是默认的。

{% highlight js %}
// App.jsx文件中

    // 通过React的ref属性来找到文本的字段
    var text = React.findDOMNode(this.refs.textInput).value.trim();
		
		// 添加开始
    Meteor.call("addTask", text);
		// 添加结束

    // Clear form
    React.findDOMNode(this.refs.textInput).value = "";
{% endhighlight %}

{% highlight js %}
// Tasks.jsx文件中
 
  toggleChecked() {
    // 设置确认值为当前属性的相反值
    // 添加下一行
    Meteor.call("setChecked", this.props.task._id, ! this.props.task.checked);
  },
 
  deleteThisTask() {

  	// 添加下面一行
    Meteor.call("removeTask", this.props.task._id);
  },
 
  render() {
{% endhighlight %}

现在，我们的输入和按钮又能用了，我们从这些工作中收获了什么呢？

1. 当我们向数据库插入数据的时候，现在我们已经可以安全的验证用户是否登录，`createdAt`字段是不是正确，`owner`和`username`字段是不是正确。一个用户不能模仿任何人了。
2. 当用户想让任务成为隐私性质的时候。我们可以在后面的步骤中给`setChecked`和`deleteTask`添加额外的验证逻辑
3. 我们的客户端代码和数据库逻辑更加的分离了。取代了许多在事件监听被触发的时候的杂事。现在我们有了可以在任何地方被调用的一些方法。

### 乐观的UI

那么我们为什么要在服务端和客户端定义我们自己的方法呢。我们做这些是为了开启一个我们称之为“乐观的UI”的特性。

当我们在客户端嗲用`Meteor.call`方法的时候，在这个时间点将会发生两件事情。

1. 客户端向服务器端发送一个在安全环境下的请求。就像是AJAX那样的运行的请求。
2. 一个方法模拟器直接会在客户端运行。它试图通过已有的信息来预测服务端返回的结果