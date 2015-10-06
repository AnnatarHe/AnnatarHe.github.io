---
layout: post
title: [翻译]Meteor React 制作 Todos - 4 - 表单与事件
Tags: js Meteor React
---

## 通过表单(form)添加任务

在这个步骤，我们将为用户在列表上添加输入框。

首先，在App.jsx文件中`App`组件上添加表单吧。

{% highlight html %}
<div className="container">
  <header>
    <h1>Todo List</h1>
		<!-- 添加开始 -->
    <form className="new-task" onSubmit={this.handleSubmit} >
      <input
        type="text"
        ref="textInput"
        placeholder="Type to add new tasks" />
    </form>
    <!-- 添加结束 -->
  </header>

  <ul>
{% endhighlight %}

> 提示：你也可以在你的JSX代码中添加注释，用`{/*...*/}`包裹注释内容

你能看到`form`元素上有一个`onSubmit`属性，它调用了在组件中一个叫做`handleSubmit`的方法。
在React中，这是一种监听浏览器事件的方式，就像是在form表单上有提交(submit)事件一样。
`input`元素有一个`ref`属性，这个属性将会让我们可以更加简单的使用这个元素，过一会儿就知道了

现在来在`App.jsx`文件中的`App`组建上添加`handleSubmit`方法吧。
{% highlight js %}
    });
  },

	// 添加开始 
  handleSubmit(event) {
    event.preventDefault();
 
    // 通过React的ref属性找到输入框的值
    var text = React.findDOMNode(this.refs.textInput).value.trim();
 
    Tasks.insert({
      text: text,
      createdAt: new Date() // 当前时间
    });
 
    // 复原表单
    React.findDOMNode(this.refs.textInput).value = "";
  },
  // 添加结束
 
  render() {
    return (
      <div className="container">
{% endhighlight %}

现在你的应用有了新的输入框。现在添加任务只需要在输入框内写一点东西，然后按下`Enter`键就可以了。如果你再开一个新的浏览器窗口并再一次打开这个应用，你将看到任务列表自动的在两个客户端上进行同步

### 在React上监听事件

正如你所看到的那样，在React中，你直接通过在组件中调用函数方法来掌控DOM事件，在事件方法的内部你可以从组件中调用元素，而只需要赋予它们一个`ref`属性，然后用`React.findDOMNode`来找到该元素。
希望了解更多不同的React所支持的事件，并了解其内部原理，请阅读[React docs](https://facebook.github.io/react/docs/events.html)

### 向集合中插入数据

在事件响应函数中，我们通过调用`Tasks.insert()`方法，添加了任务(数据)到tasks集合中。
因为我们并不需要在集合中定义字段(schema)，所以我们可以赋值任何属性到我们的task对象中，比如*创建时间*(createdAt)

允许任何在客户端的数据直接传入数据库并不是很安全，现在就别管这么多了，你知道就好。在第十章我们将学习如何使我们的应用有更多的限制和更好的安全性 -- 通过定义如何使数据插入到数据库中

## 对任务进行排序

现在，我们的代码在列表的底部，展示了所有新的任务。这对一个任务列表来说并不是非常好。因为我们正常情况下是想看到最新的数据在最顶上。

我们可以通过对结果的`createdAt`字段进行排序来解决这个问题。它将会自动的在我们的新代码上做调整。

我们所要做的就是在`find`方法中添加排序选项。它位于`App`组件的`getMeteorData`方法中。

{% highlight js %}
  getMeteorData() {
    return {
      tasks: Tasks.find({}, {sort: {createdAt: -1}}).fetch()
    }
  },
{% endhighlight %}

现在返回到浏览器确认它是不是正常运行了。任何你所添加的新的任务将会出现在列表的顶部，不再是底部了。

在下一步，我们将给待办事宜的列表添加一个非常重要的功能：已完成功能和删除功能