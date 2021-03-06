---
layout: post
title: 翻译 Meteor React 制作 Todos - 02 - 组件
tags: js Meteor React
---

## 在React组件中定义视图

在开始编写React视图库之前，要先添加`react`包，这个包囊括了你在`Meteor`应用中开始运行`React`所需要所有东西。这个React库自己可以自动将`jsx`文件编译，并且通过`ReactMeteorData`的mixin加载数据。我们将会在接下来的步骤中看到如何使用所有的这些东西。

打开一个新的终端，在你运行`Meteor`程序相同的文件夹下运行这样一条命令：
{% highlight console %}
meteor add react
{% endhighlight %}

#### 替换启动代码

为了启动，我们来替换掉默认的启动应用的代码，接下来我们会讨论这是什么意思

首先，替换掉最开始的名为`simple-todos-react.html`的HTML文件内容。
{% highlight html %}
<head>
  <title>Todo List</title>
</head>
 
<body>
  <div id="render-target"></div>
</body>
{% endhighlight %}

然后, 删除`simple-todos-react.js`并建立三个新的文件

新建 `simple-todos-react.jsx`文件写入这些内容
{% highlight js %}
if (Meteor.isClient) {
  // 下面的代码最会在客户端运行
 
  Meteor.startup(function () {
    // 在页面加载完成之后，使用 Meteor.startup 来渲染 React 组件
    React.render(<App />, document.getElementById("render-target"));
  });
}
{% endhighlight %}
新建`App.jsx`文件，并写入以下内容：
{% highlight js %}
// 不要在App前面添加 var
App = React.createClass({
  getTasks() {
    return [
      { _id: 1, text: "This is task 1" },
      { _id: 2, text: "This is task 2" },
      { _id: 3, text: "This is task 3" }
    ];
  },
 
  renderTasks() {
    return this.getTasks().map((task) => {
      return <Task key={task._id} task={task} />;
    });
  },
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>
        </header>
 
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
});
{% endhighlight %}

新建`Task.jsx`文件，并写入
{% highlight js %}
// Task 组件 - 表示单个的待做事宜
Task = React.createClass({
  propTypes: {
    // 这个组件从React的prop中接受task并显示
    // 我们使用propTypes来表示这个属性是必须的
    task: React.PropTypes.object.isRequired
  },
  render() {
    return (
      <li>{this.props.task.text}</li>
    );
  }
});
{% endhighlight %}

我们刚刚在应用中添加的三个事情分别是以下的意思：

1. 一个 **App** React组件
2. 一个 **Task** React组件
3. 一些包裹在 `if (Meteor.isClient) { ... }` 中的代码, 这些代码定义了在浏览器中会被执行，还有`Meteor.startup`, 这个让程序知道页面在被加载完成之后如何去调用代码。

在教程之后，我们会在添加和修改代码的时候参考这些组件

#### 看看结果

在我们的浏览器中，应用将会看起来像这个样子：

> Todo List

> * This is task1

> * This is task2

> * This is task3

如果你的应用看起来并不是这样，请确认你的代码和例子上的一致

#### HTML文件中定义静态内容

`Meteor`将你的应用中的HTML文件切分并识别三个最高等级的标签：**<head>**, **<body>**,还有**\<template\>**

每个在 \<head\>标签中的标签被添加到已被发送的HTML文件的`head`部分，\<body\>标签中的所有标签同样是被添加到已被发送的HTML的`body`部分，就像正常的html文件一样

每一个在\<template\>中的标签将会被编译成`Meteor`模板文件, 那些可以被包含在HTML中，包含\{\{>templateName\}\}或者是在`js`中引用的`Template.templateName`。在本教程中，我们并不会使用这些Meteor特性，因为我们将会用React定义所有的这些视图组件。

#### 用React定义视图组件

在React中，视图组件是被使用`React.createClass`定义的。你的组件可以有任何你想要的方法。除了几个像是`render`这样的特殊方法。组件可以接收来自于父组件通过`props`属性传过来的数据。在这个教程中，我们将看一看更多的一些React特性。你也可以通过[Facebook's React  tutorial](https://facebook.github.io/react/docs/tutorial.html)来学习

#### 从JSX的render方法中得到标记语言(markup)

在React组件中最重要的方法就是`render`, 这个被React调用从应该被显示的HTML中返回内容(description)，HTML内容被叫做`JSX`的`javascript`的扩展语言所编写。这是一种像是在javascript中写HTML的样子。你早就看出了一些明显的不同了吧：在`JSX`中，你使用`className`属性代替`class`，关于JSX一个重要的事情就是它(JSX)并不是一种像是`Spacebars`或是`Angular`的模板语言 -- 它被直接编译成常规的JavaScript文件。了解更多请看[React docs](https://facebook.github.io/react/docs/jsx-in-depth.html)

#### JSX文件可以使用ES2015的新特性

如果你现在还没有尝试过下一代JavaScript特性，一些代码片段可能看起来有点怪异。这是因为`.jsx`文件会随着`react`包被编译，同时包含一些通用的ES2015特性，即下一代JavaScript。这些特性包含了以下的：

1. 箭头函数:
{% highlight js %}
(arg) => {return result;}
{% endhighlight %}
2. 方法名简化：
{% highlight js %}
render() {...}
{% endhighlight %}
3. 使用`const`和`let`替换`var`

你可以阅读[ecmascript README](https://github.com/meteor/meteor/blob/master/packages/ecmascript/README.md)来了解Meteor所支持的特性。想要更多关于 ECMAScript 2015 的知识可以看看下面的几个文章：

* [Luke Hoban's "ES6 features"](git.io/es6features)
* [Kyle Simpson's "You don't know JS: ES6 and beyond"](https://github.com/getify/You-Dont-Know-JS/tree/master/es6%20%26%20beyond)
* [Nikolas C. Zakas "Understanding ECMAScript 6"](https://github.com/nzakas/understanding-6)
* [阮一峰ES6入门](http://es6.ruanyifeng.com/#docs/intro)

#### 添加样式

在我们做更多的未来打算之前，先来添加一些CSS来让我们的页面好看一点儿吧。

因为本教程专注于HTML和JavaScript，所以你可以拷贝下面的代码到`simple-todos.css`文件中。这是你直到本教程结束都会用到的所有CSS代码。这个应用没有这些CSS也能运行，但是你添加了这些CSS会更好看一点。

{% highlight css %}
/* CSS 声明在这里 */
body {
  font-family: sans-serif;
  background-color: #315481;
  background-image: linear-gradient(to bottom, #315481, #918e82 100%);
  background-attachment: fixed;

  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  padding: 0;
  margin: 0;

  font-size: 14px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100%;
  background: white;
}

header {
  background: #d2edf4;
  background-image: linear-gradient(to bottom, #d0edf5, #e1e5f0 100%);
  padding: 20px 15px 15px 15px;
  position: relative;
}

#login-buttons {
  display: block;
}

h1 {
  font-size: 1.5em;
  margin: 0;
  margin-bottom: 10px;
  display: inline-block;
  margin-right: 1em;
}

form {
  margin-top: 10px;
  margin-bottom: -10px;
  position: relative;
}

.new-task input {
  box-sizing: border-box;
  padding: 10px 0;
  background: transparent;
  border: none;
  width: 100%;
  padding-right: 80px;
  font-size: 1em;
}

.new-task input:focus{
  outline: 0;
}

ul {
  margin: 0;
  padding: 0;
  background: white;
}

.delete {
  float: right;
  font-weight: bold;
  background: none;
  font-size: 1em;
  border: none;
  position: relative;
}

li {
  position: relative;
  list-style: none;
  padding: 15px;
  border-bottom: #eee solid 1px;
}

li .text {
  margin-left: 10px;
}

li.checked {
  color: #888;
}

li.checked .text {
  text-decoration: line-through;
}

li.private {
  background: #eee;
  border-color: #ddd;
}

header .hide-completed {
  float: right;
}

.toggle-private {
  margin-left: 5px;
}

@media (max-width: 600px) {
  li {
    padding: 12px 15px;
  }

  .search {
    width: 150px;
    clear: both;
  }

  .new-task input {
    padding-bottom: 5px;
  }
}
{% endhighlight %}

现在，你已经添加了这些CSS，这款应用应该看起来会更好一点了。切换到你的浏览器看看新的样式并确认其有没有加载成功吧~

#### 添加Sass(可选)

> 我知道你肯定想耍Sass。嘿嘿，来添加上sass吧

> meteor add fourseven:scss

> 只要把simple-todos-react.css改名成simple-todos-react.scss就好了
