---
layout: post
title: 编写React项目时的编码风格推荐
tags: js react
---

## 异步处理

redux 异步处理的中间件现在很多，有 thunk, promise, saga, observable, rx 等，真的是太多了。

如果你非常非常清楚用哪个库，那随便用就是了。否则，我个人认为目前来说 [redux-thunk](https://github.com/gaearon/redux-thunk) 已经足够好了. 

## 纯组件化

除了路由顶层组件，我个人认为其他组件都应该是纯组件，就是那种没有生命周期的组件。这种组件优点在于性能很好，而且热替换也很正常。

路由页面组件不可避免地要产生一些数据交互操作。比如发起请求，接受 redux 数据之类的。那么干脆就把这些一起做了。

像是这样：

{% highlight jsx %}
class Page extends React.PureComponent {
    render() {
        return (
            <section>
                <AComponent val={this.props.valFromRedux} />
                <BComponent onChange={this.props.sendSomeAction} />
            </section>
        )
    }
}

const AComponent = ({ val }) => (<p>{val}</p>)
const BComponent = ({ onChange }) => (<button onClick={onChange}>some action</button>)
{% endhighlight %}

## 减少 bind

绑定事件的时候有时候会碰到找不到this的情况，这是因为作用域不一样了。而老式代码建议用bind，但是实际上bind第一是创建了新的函数，一定程度上影响性能，另一方面也是容易出错。只要少写了一个，this就找不到了。代码也会因此多一些样本代码。

老版本是这样的：
{% highlight jsx %}
class CComponent extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = { val: '' }
        this.handleInput = this.handleInput.bind(this)
    }

    handleInput(e) {
        this.setState({ val: e.target.value })
    }    
    render() {
        return (
            <input onChange={this.handleInput} value={this.state.val} />
        )
    }
}
{% endhighlight %}

如果在render里面用bind就很要命了，每次render都会创建新函数。

其实可以用es6的箭头函数来减少bind代码。箭头函数会自动绑定父作用域，所以省的显示表明this作用域了。

{% highlight jsx %}
class CComponent extends React.PureComponent {
    handle = e => {
        this.setState({ val: e.target.value })
    }
}
{% endhighlight %}

## Type checker

我个人强烈建议对每个组件都写好type checker，多人协作的时候会很容易看懂，而不用找内部代码了。一些编辑器也可以做自动补全。

这个工作就是前人栽树后人乘凉。

## 定义数据结构去遍历

有时候工作中有一些数据结构需要自己定义，而不是服务端传过来的。

比如我最近做的一个时间轴的项目。一个时间对应一堆数据，而这些也大部分是无后端的。所以我自定义一个数据结构，然后遍历出来渲染，而不是在组件中把html写死。

{% highlight jsx %}
const data = {
    "2017-04-22": { isFull: true, backgroundColor: '#fff', hasEvent: true }
}
render() {
    return Object.keys(data).map(key => {
        const item = data[key]
        return <AItemShouldToRender key={key} date={key} {...item} />
    })
}
{% endhighlight %}

再如我最近重构的一个通知模块，通知类型已经拓展到了二十几种类型。

你想在组件内部写满几十种类型的switch么？

这里我想到了用大概是叫策略模式的设计模式

形成了这样的一种数据结构：

{% highlight jsx %}
const EVENTS = {
    "1": {
        getTitle: (data) => data.title
    },
    "2": {
        getContent: () => "你倒是给个star啊！"
    },
    "3": {
        getTime: () => timely(data.time)
    },
    "200": {
        getContent: () => (<a href="https://AnnatarHe.github.io">AnnatarHe</a>)
    }
}
{% endhighlight %}

那么在调用的时候就不用写一大堆 **switch case** 了

{% highlight jsx %}
render() {
    const { data } = this.props
    const _getContentFunc = EVENTS[data.type].getContent
    return (
        <div>
            <span> content: </span>
            {_getContentFunc && _getContentFunc(data)}
        </div>
    )
}
{% endhighlight %}

## 减少数据结构和组件的耦合

服务端很容易返回出一个比较深的数据结构。

{% highlight json %}
{
    "data": {
        "msg": { "msgContent": [{ "content": "lorem"}]}
    }
}
{% endhighlight %}

有时候客户端为了图快，直接把`data`一股脑丢进组件里了。写成这样的形式：

{% highlight jsx %}
render() { return <Msgs msgs={data} />}
{% endhighlight %}

这就使得`Msgs`内部和`data`的数据结构强耦合，导致内部必须要有相应的key才能执行，这样，这个组件基本就没办法重用。

而在我看来可以多传一些props来控制组件，而子组件内部根据各种不同的状态进行一些渲染，组件内部不关心如何获取数据，只是渲染。

{% highlight jsx %}
render() { return <Msgs msgs={data.msg.msgContent} />}
{% endhighlight %}

## 设计好 store 树

store设计是门学问的。设计优良的store结构，可以尽量减少不同组件的相同请求，相同的数据结构。

现实中很多store设计得并不是很好，会导致两个页面需要相同的数据，请求相同的api，结果竟然放在两个store里面，写了两个action去处理。这样重复劳动并不好。

这个例子好像是沟通的锅？ 然而实际上是设计的。

这一段改了好多，但是找不到合适的例子，请读者自行脑补吧。

我认为设计store这个东西，要想好业务逻辑，想好了才能动手去做。

## 把常量放到 npm register 中

相信我，你一定会写很多很多的常量，非常非常多。

有一些是 action type. 有一些是 event type. 有一些是和服务端约定好的枚举类型常量。

放在私有仓库里面的原因有三个。其一：如果中间层是node，可以很方便的复用。其二：不至于让拼接地址拼到怀疑人生。其三，给一个常量包写文档应该还能接受一些。

## 分离出纯函数，传到 register 中

这里是基础库的部分了。不过这里的基础库并不是意味着完全业务无关的基础库，而是那种有点儿关系的，当然，完全业务无关的是最好的。

上面所说的常量包就是一个极好的例子。

## 没必要上TS

客户端的js相对来说没有服务端对于安全的要求那么高。但是迭代却需要很快。所以我的意见是前端没必要上TS，至少是视图这一块没必要上。顺带的，前端视图这一块的测试也没必要，难道测试这个div的背景色是不是绿色么？

中间层涉及到类型安全什么的是需要ts来保护一下。

## 适当地使用高阶函数

有时候高阶函数可以非常轻松地做到代码复用。我个人在之前的一个项目中用高阶函数做到了很好地复用，如果不在乎ES标准，可以试试[Decorators](https://babeljs.io/docs/plugins/transform-decorators/), 会使得代码更加简洁。

## 善用()

有很多人觉得`()`没必要，我们程序员都能读懂优先级。然而事实上我觉得一些括号可以避免阅读上的误会，也对代码的美观程度有些提升。

{% highlight jsx %}
// Bad
const A = () => <Profile
        name="foo"
        gender="female"
        isLogged
    />
        <p>hello</p>
    </Profile>

// Good

const A = () => (
    <Profile
        name="foo"
    >
    </Profile
)
{% endhighlight %}

## 减少jsx里的遍历和调用操作

jsx 丑的一大原因就是在jsx里面写了太多的遍历，判断之类的东西。我个人认为在jsx里面最多用个简单的三目判断，其他的写函数调用最合适。

比如这样写就不好看：

{% highlight jsx %}
// bad
render() {
    return (
        <div>{this.props.condition ? (
            <div>
                <a href="#">
                    <ul>
                        <li></li>
                    </ul>
                </a>
            </div>
        ) : (
            <div>
                <a href="#">
                    <ul>
                        <li></li>
                    </ul>
                </a>
            </div>
        )}</div>
    )
}
{% endhighlight %}

那么如果把中间的判断提取出来，就会变得比较可读。

{% highlight jsx %}
const A = () => (<div>section A </div>)
const B = () => (<div>section B </div>)

class Parent extends React.PureComponent {
    _render() {
        if (this.props.loading) {
            return <Loading />
        }
        return this.props.condition ? <A /> : <B />
    }
    render() {
        return (<div>{this._render()}</div>)
    }
}
{% endhighlight %}

## 最后

其实这里主要说一些代码风格的建议。觉得合适可以试一下。

哪里可以有提升也可以在下面评论说一下。谢谢~