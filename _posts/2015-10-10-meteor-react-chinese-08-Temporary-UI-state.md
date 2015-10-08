---
layout: post
title: [翻译]Meteor React 制作 Todos - 5 - 模板UI的状态
Tags: js Meteor React
---

## 在组件状态中存储临时数据

在这个步骤，我们会在为应用的客户端添加数据过滤特性，这样用户就可以通过点击’确认选框‘来查看当前进行的任务。我们会去学习如何仅在客户端使用React组件状态来存储临时模板

首先，我们需要在我们的`App`组件中，添加’确认选框‘

{% highlight html %}
<!-- 在App.jsx 文件中 -->
<header>
  <h1>Todo List</h1>

	<!-- 开始添加内容 -->
  <label className="hide-completed">
    <input
      type="checkbox"
      readOnly={true}
      checked={this.state.hideCompleted}
      onClick={this.toggleHideCompleted} />
    Hide Completed Tasks
  </label>
	<!-- 结束添加内容 -->

  <form className="new-task" onSubmit={this.handleSubmit} >
    <input
      type="text"
{% endhighlight %}

你可以看到要在`this.state.hideCompleted`上的读取属性。React组件有一个名叫`state`（状态）的特殊变量(field)。你可以在`state`中存储运算后的组件数据，我们需要在组件中去定义一个叫做`getInitialState`的方法来初始化这个变量

{% highlight js %}
// 在App.jsx文件中
// 这个mixin将会使得getMeteorData方法正常执行
mixins: [ReactMeteorData],

// 添加开始
getInitialState() {
  return {
    hideCompleted: false
  }
},
// 添加结束

// 从Tasks集合中读取数据并传送到this.data.tasks中
getMeteorData() {
  return {
{% endhighlight %}

你可以在事件监听中通过从一个叫做`this.setState`的方法来更新`this.state`。`this.setState`将会异步地更新状态属性，然后让组件重新渲染。

{% highlight js %}
// 在App.jsx文件中

  React.findDOMNode(this.refs.textInput).value = "";
},

// 添加开始
toggleHideCompleted() {
  this.setState({
    hideCompleted: ! this.state.hideCompleted
  });
},
// 添加结束

render() {
  return (
    <div className="container">
{% endhighlight %}

现在我们得更新`getMeteorData`方法。使其可以在`this.state.hideCompleted`为`true`时，过滤我们已完成的任务。

{% highlight js %}
// 在App.jsx文件中 

// 从Tasks集合中读取数据并传给this.data.tasks
getMeteorData() {

	// 修改开始
  let query = {};

  if (this.state.hideCompleted) {
    // If hide completed is checked, filter tasks
    query = {checked: {$ne: true}};
  }

  return {
    tasks: Tasks.find(query, {sort: {createdAt: -1}}).fetch()
  };
	// 修改结束

},

renderTasks() {
{% endhighlight %}

现在，如果你确认了任务已完成，任务列表中将会只显示那些没有被完成的任务。

### 再来个特性：显示未完成任务的数量

我们已经编写了语句来过滤已完成的任务，我们也可以使用相同的语句去展示没有被确认完成的任务的数量。要完成这个特性，我们要从`getMeteorData`的方法中获取总数，然后再`render`方法中添加一行。因为我们已经有数据在客户端的MiniMongo里了，所以添加额外的**总数**并不会向服务器再次申请数据。

{% highlight js %}
// 在App.jsx文件的getMeteorData的return改成这样
return {
      tasks: Tasks.find(query, {sort: {createdAt: -1}}).fetch(),
      incompleteCount: Tasks.find({checked: {$ne: true}}).count()
    };
{% endhighlight %}

{% highlight js %}
在App.jsx的render方法的return 附近，添加这么一句
return (
  <div className="container">
    <header>

    	// 修改开始
      <h1>Todo List ({this.data.incompleteCount})</h1>
			// 修改结束

      <label className="hide-completed">
        <input
{% endhighlight %}