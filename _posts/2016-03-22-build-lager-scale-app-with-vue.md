---
layout: post
title: 使用Vue构建中(大)型应用
tags: js vue
---

想做SPA就快上车！

## init

首先要起一个项目，推荐用vue-cli安装

{% highlight console %}
$ npm install -g vue-cli
$ vue init webpack demo
$ cd demo
$ npm install
{% endhighlight %}

`demo`是这个示例项目的名字

现在看到目录结构如下

![dirctory](http://cdn.iamhele.com/github.io/images/build_lager_scale_app_with_vue/dirctory.png)

下面来稍微介绍下

`build`目录是一些webpack的文件，配置参数什么的，一般不用动

`src`源码文件夹，基本上文件都应该放在这里。

`static`生成好的文件会放在这个目录下。

`test`测试文件夹，测试都写在这里

`.babelrc` babel编译参数，vue开发需要babel编译

`.editorconfig` 看名字是编辑器配置文件，不晓得是哪款编辑器，没有使用过。

`.eslintrc.js` eslint配置文件，用以规范团队开发编码规范，大中型项目很有用

`.gitignore` 用来过滤一些版本控制的文件，比如node_modules文件夹

`index.html` 主页

`package.json` 项目文件，记载着一些命令和依赖还有简要的项目描述信息

`README.md` 介绍自己这个项目的，想怎么写怎么写。不会写就参照github上star多的项目，看人家怎么写的

下面我针对自己的需要修改一些配置。你可以根据自己的需要进行修改。

首先去写.eslintrc.js。在rules中加入`"indent": [1, 4, { "SwitchCase": 1 }]`

因为我更喜欢4个空格表一个缩进，报警程度调整成1是因为build文件夹里有很多行是2个空格，草草的。

然后在index.html中的`<app></app>`改成`<div id="root"></div>`

这个文件没有写入任何加载css和js的link，而依旧可以正常运行的秘诀在于webpack会在编译的时候重新调整这个文件，注入依赖，所以不用太担心。

好了，差不多了。进行下一步

## 添加依赖

我个人习惯写stylus，所以要加上预处理器，如果喜欢sass可以自行添加。

vue-router做前端路由管理，一个中大型项目必须要做路由管理！

vuex做数据管理，类似于flux的存在，没有vuex，中大型应用中的状态会把开发者搞死，绝对。

{% highlight console %}
$ npm install --save vue-router vuex
$ npm install --save-dev stylus-loader babel-runtime
{% endhighlight %}

好了，到这里，依赖也加好了。剩下的就是写代码了？

不急，我先说下两个vue插件的介绍

## vue-router 简明API

vue-router用起来非常的简单

入口文件(`src/main.js`)：

{% highlight js %}
'use strict'
import Vue from 'vue' // 引入vue
import Router from 'vue-router' // 引入vue-router

import App from './App' // 引入根组件
import routerMap from './router' // 引入路由表

Vue.use(Router) // 声明使用vue-router
const router = new Router() // 创建路由
routerMap(router) // 路由表引入

router.start(App, '#root') // 开启应用

{% endhighlight %}

看到缺了一个`./router.js`文件，来，创建。

{% highlight js %}
// src/router.js
'use strict'

export default function (router) {
    router.map({
        '/': {
            name: 'index',
            component: require('./components/contents/hello.vue')
        },
        '/hi': {
            name: 'hi',
            // 按需加载
            component: function (resolve) {
                require(['./components/contents/hi.vue'], resolve)
            }
        }
    })
}

{% endhighlight %}

好了，路由创建成功了，顺便还搞了个按需加载。

那么在模板文件中如何使用？

很简单的，就像这样就可以了。

{% highlight html %}
<!-- src/components/contents/hello.vue -->
<a class="link" v-link="{name: 'hi'}">跳转到hi</a>
{% endhighlight %}

还有，告诉应用哪里需要路由转换
{% highlight html %}
<!-- src/App.vue -->
<div class="container">
    <router-view></router-view>
</div>
{% endhighlight %}

## vuex 简明API

这里简要介绍一下状态管理的vuex

在src下创建一个文件夹叫做`vuex`。里面定义三个文件。

`mutation-types.js` 定义类型的

`actions.js` 操作，可以分解成多个文件

`store.js` 入口文件，在根组件调用，然后所有子组件可以共享数据。

`modules/headers.js` 只是例子用的，一个headers的操作，需要定义数据的状态和mutation。`action.js`只是分发操作。

这一块还是看源码比较容易懂。

{% highlight js %}
// src/vuex/mutation-types.js
export const SET_HEADER_TITLE = 'SET_HEADER_TITLE'
{% endhighlight %}

{% highlight js %}
// src/vuex/store.js
import Vue from 'vue'
import Vuex from 'vuex'
import headers from './modules/headers'
import createLogger from 'vuex/logger'
Vue.use(Vuex)

Vue.config.debug = true

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        headers
    },
    strict: debug,
    moddlewares: debug ? [createLogger()] : []
})
{% endhighlight %}

{% highlight js %}
// src/vuex/actions.js
import {
    SET_HEADER_TITLE
} from './mutation-types'

export const setTitle = makeAction(SET_HEADER_TITLE)

function makeAction (type) {
    return ({ dispatch }, ...args) => dispatch(type, ...args)
}
{% endhighlight %}

{% highlight js %}
// src/vuex/modules/headers.js
import {
    SET_HEADER_TITLE
} from '../mutation-types'

const state = {
    title: 'default'
}

const mutations = {
    [SET_HEADER_TITLE](state, newTitle) {
        state.title = newTitle
    }
}

export default {
    state,
    mutations
}
{% endhighlight %}

我再说两个，一个挂载store，一个获取数据，触发操作。

### 挂载store

{% highlight js %}
// src/App.vue
import store from './vuex/store'
import HeaderComponent from './components/header'
import FooterComponent from './components/footer'
export default {
    store,
    components: {
        HeaderComponent,
        FooterComponent
    }
}
{% endhighlight %}

## 获取数据及操作

{% highlight js %}
// src/components/header.vue
// 从vuex拿数据，然后渲染到页面上
// 如果需要修改可以调用setTitle
import { setTitle } from '../vuex/actions'
export default {
    vuex: {
        getters: {
            title: state => state.headers.title
        },
        actions: {
            setTitle
        }
    }
}
{% endhighlight %}

## fetch

单页应用少不了服务端交互，别老用ajax了，换[fetch](https://github.com/matthew-andrews/isomorphic-fetch)吧，少年！

{% highlight console %}
$ npm install --save isomorphic-fetch es6-promise
{% endhighlight %}

{% highlight js %}
// src/vuex/actions.js
require('es6-promise').polyfill()
require('isomorphic-fetch')
{% endhighlight %}

我在示例代码中并没有写。

fetch用起来根本不会回忆ajax时代的。

## stylus

在之前的文章中安利过很多次stylus了，各种方便，这里一笔带过，喜欢的同学自然会去找[文档](http://stylus-lang.com/)

## test

测试是非常重要的一环。要想以后不出乱子，一定要尽早写好测试。

示例代码中有少量测试，推荐看一下

## Code

我还是决定不在文章里写代码了。

## 多端

vue创作的应用不仅可以跑在浏览器里，还可以通过[electron](http://electron.atom.io/)以客户端的形式跑起来！

是不是吊吊的。

至于移动端，听闻阿里内部有在开发*Weex*，类vue的api。等待开源吧。

## 未来

未来js的前途肯定是不错的！加油～