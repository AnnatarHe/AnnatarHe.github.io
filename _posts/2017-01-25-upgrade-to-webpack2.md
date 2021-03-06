---
layout: 'post'
title: 升级到 webpack2
tags: fe webpack2 webpack
---

近期在公司把 PC-WWW 项目从之前比较复杂的脚本改成了webpack，随后因为看到webpack2发布了正式版本又升级到了 webpack2。效果非常好。

## 为什么使用 webpack

webpack 是一款非常非常强大的前端资源处理工具，可以把所有前端需要的资源统一处理。比如js文件，css文件，甚至图片，字体文件，html文件。通过一个个独特的 loader 来对文件进行一些处理。

比如可以通过 babel-loader 对使用ES2015+的js代码进行编译处理，改成浏览器可以理解的es5甚至是es3的语法。通过css-loader对css文件进行一些处理，比如hash掉class名，通过stylus-loader将stylus语法的文件转成css语法，通过file-loader对图片进行处理，等等等等。

还有更强大的功能么？当然是有的。

可以通过配置publicPath将静态资源文件直接改成cdn路径。通过html插件将资源文件直接写入html。仅仅通过一个`-p`参数实现生产环境的配置。通过`react-hot-loader`实现热重载。通过postcss-loader对css文件进行添加前缀，变量支持等处理。

webpack 使得前端开发变得更加工程化，更加合理，更加舒适，更具有灵活性。

## 为什么升级 webpack2

既然 webpack1 已经很好用了，为什么还要费大力气升级 webpack2，而且坑也比较多。

主要是因为两个原因：

* 服务端渲染

如果哪位读者做过服务端渲染就会知道，路由的异步加载需要用到 require.ensure，但是这在服务端没有，所以需要 polyfill，很麻烦。而升级到 webpack2 的话就不需要处理这些，用自带的 `import` 即可。

* 性能

webpack2 用了 Treeshaking。可以分析引用文件，进而不加载不需要的文件，有效减少文件的大小，减少一定的加载时间，提升用户体验。

就最后的结果来看，服务端渲染正常，而前端js代码文件明显减少，效果很好。

## 结构

整个结构分为这么几个部分：

一个基础配置模块，用以把通用的配置抽离出来。

一个开发配置项，一个服务端配置项，还有一些特殊的配置脚本

因为yarn拥有更快的安装速度，比较推荐yarn，如果不熟悉，可以看一下[这篇文章](https://annatarhe.github.io/2016/10/12/translate-chinese-yarn-a-new-package-manager-for-javascript.html)了解一下

{% highlight sh %}
$ yarn add webpack webpack-dev-server\
    react-hot-loader@next extract-text-webpack-plugin@2.0.0-beta.5\
    babel-loader babel-preset-es2015 babel-preset-react\
    babel-preset-stage-0 style-loader css-loader\
    autopprefixer postcss-loader postcss-modules-values
{% endhighlight %}

## dev

由于使用了react-hot-loader，需要在entry加上一些配置

react-hot-loader 是用来热加载组件的，简单来说修改组件以后可以自动在局部刷新，而不用整个页面刷新。可以减少等待时间，使得整个过程没有之前整页刷新那样痛苦。

{% highlight js %}
entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './your/entry.js'
],
{% endhighlight %}

至于output的配置也是比较正常的，有一点需要注意的是尽量使用 `path.resolve` 来解析路径。
output 的作用是告诉 webpack 应该将文件输出在哪里，以什么样的名字输出

{% highlight js %}
output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
    chunkFilename: '[name]-[id].chunk.js'
},
{% endhighlight %}

module 是主要的文件处理规则，需要处理的文件在这里定义规则：.css文件需要用css-loader来处理这样的规则。所以 module 的地方配置项变了很多，需要一些调整：

这个module因为dev和server两个部分都要用，所以把它写成了一个func放在base中。至于做成函数而不是配置项是因为css需要在服务端渲染的时候需要切换成另一套配置。

{% highlight js %}
function getModules(cssLocals = false) {
  return {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: [
          path.resolve(__dirname, '..', 'node_modules')
        ]
      },
      {
        test: /\.css$/,
        exclude: [
          path.resolve(__dirname, '..', 'node_modules'),
          path.resolve(__dirname, '..', 'common', 'assets')
        ],
        loader: getCssLoader(cssLocals)
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, '..', 'node_modules'),
          path.resolve(__dirname, '..', 'common', 'assets')
        ],
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader'
        })
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 500,
            name: '[name]-[hash].[ext]'
          }
        }]
      }
    ]
  }
}
{% endhighlight %}

getCssLoader 的作用是根据不同的参数，返回不同的css配置文件：在服务端渲染阶段，只用生成名字即可，无须将内容输出，而在浏览器中不仅需要生成对应的名字，而且也需要将文件输出，使得样式可见。

{% highlight js %}
function getCssLoader(locals = false) {
  const originCssLoaders = [{
    loader: `css-loader${locals ? '/locals' : ''}`,
    options: {
      modules: true,
      minimize: true,
      camelCase: true,
      importLoaders: 1,
      localIdentName: '[name]_[local]-[hash:base64:4]',
      sourceMap: true
    }
  }, {
    loader: 'postcss-loader'
  }]

  return locals ? originCssLoaders : ExtractTextPlugin.extract({
    fallbackLoader: 'style-loader',
    loader: [
      'css-loader?modules=true&camelCase=true&importLoaders=1' +
      '&localIdentName=[name]_[local]-[hash:base64:4]&sourceMap=true' +
      (process.env.NODE_ENV === 'production' ? '&minimize=true' : ''),
      'postcss-loader'
    ]
  })
}
{% endhighlight %}

因为上面定义了 getModules， 所以现在只要调用就可以得到相应的module配置了，这样webpack就知道如何处理对应的文件：

{% highlight js %}
module: getModules(false)
{% endhighlight %}

plugins 是一些插件的配置, 而新版取消了几个配置，这些插件目前感觉是比较合适的：

其作用分别是热更新插件，配置项插件，相同文件打包插件，环境变量定义插件，HTML处理插件，css样式提取插件

{% highlight js %}
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name].[contenthash:8].js',
      minChunks: Infinity
    }),
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production' ? 'true' : 'false',
      NODE_ENV: process.env.NODE_ENV,
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development_local')
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: 'body',
      template: path.resolve(__dirname, '..', 'your', 'view.html')
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css',
      allChunks: true
    })
  ],
{% endhighlight %}

还有resolve配置，也就是少写点儿后缀名：

{% highlight js %}
resolve: {
    extensions: ['.js', '.jsx']
}
{% endhighlight %}

devServer是在开发阶段用到的一些配置，也需要进行一部分设置：

{% highlight js %}
devServer: {
    hot: true,
    contentBase: path.resolve(__dirname, '..', 'dist'),
    historyApiFallback: true,
    proxy: [
        proxyThis('/apiV1'),
        proxyThis('/apiV2')
    ]
}
{% endhighlight %}

这里的proxy作用是对请求进行拦截，转发至另外的服务器。在这个配置中通用的做法是把请求转到mock server上。可以根据自己的需要进行配置，如果有多个配置项推荐写成一个函数调用：

{% highlight js %}
function proxyThis(where) {
  return {
    path: where,
    debug: true,
    target: 'http://your.dev.api.server',
    secure: false,
    changeOrigin: true,
    header: {
      cookie: 'some cookie'
    }
  }
}
{% endhighlight %}

到这里，整个开发环境的配置就完成了。可以通过写入npm script来进行调用，这样就又可以少打几个字：

{% highlight json %}
"scripts": {
    "dev": "cross-env NODE_ENV=development_local webpack-dev-server\
    --colors --config ./build/webpack.config.dev.js"
}
{% endhighlight %}

## server

项目中用到了server render，所以还需要对服务端代码进行打包。打包过程分为两个部分，分为客户端打包和服务端打包。之所以分为两个部分是因为两个部分需求不同，客户端需要代码压缩，需要css文件输出，需要把外部文件打包出来。而服务侧代码则不同，完全拒绝代码压缩，css不需要文件输出，外部node模块直接引用，而无需打包。

在客户端的打包配置如下：

{% highlight js %}
const clientConfig = {
  entry: {
    bundle: path.resolve(__dirname, '..', 'your', 'client', 'index.js'),
    vendor // 根据你自己的项目配置vendor
  },
  output: {
    path: path.resolve(__dirname, '..', 'your', 'client/dist'),
    filename: '[name].[chunkhash:8].js',
    publicPath: process.env.NODE_ENV !== 'production' ?
      `/` : `${your.cdn.server}/`,
    chunkFilename: '[id].[chunkhash:8].js'
  },
  module: getModules(false),
  resolve,
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      filename: '[name].[chunkhash:8].js'
    }),
    new webpack.DefinePlugin({
      NODE_ENV: process.env.NODE_ENV
    }),
    new HtmlWebpackPlugin({
      filename: 'index.ejs',
      template: path.resolve(__dirname, '..', 'your', 'client', 'pc.ejs'),
      inject: true,
      includes: getViewShouldBeIncluded()
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css',
      allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comments: false
    })
  ]
}
{% endhighlight %}

在服务端渲染的时候用了`ejs`作为模板，里面用了一些语法，所以需要include，这里不给出具体的实现了，作用就是把一些需要include的文件加载进来。

服务端的打包比较类似，不过要加上target和一些output的改变, 还有一定要注意不要打包到 public 目录下，这个文件是不能让用户访问得到的：

{% highlight js %}
const serverConfig = {
  devtool: 'source-map',
  entry: path.resolve(__dirname, '..', 'your', 'server', 'entry.js'),
  output: {
    path: path.resolve(__dirname, '..', 'your', 'server', 'output'),
    filename: 'index.js',
    publicPath: process.env.NODE_ENV !== 'production' ?
    `/` : `${your.cdn.server}/`,
    chunkFilename: '[id].[chunkhash:8].js',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },
  module: getModules(true),
  externals: getExternals(),
  resolve,
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) })
  ]
}
{% endhighlight %}

这里的getExternals是把整个`node_modules`作为externals：

{% highlight js %}
function getExternals() {
  return fs.readdirSync(path.resolve(__dirname, '..', 'node_modules'))
    .filter(filename => !filename.includes('.bin'))
    .reduce((externals, filename) => {
      externals[filename] = `commonjs ${filename}`
      return externals
    }, {})
}
{% endhighlight %}

最后的导出需要导出一个数组，webpack是可以接受的：

{% highlight js %}
module.exports = [clientConfig, serverConfig]
{% endhighlight %}

同样写入到npm scripts中

{% highlight json %}
"scripts": {
    "compile": "cross-env NODE_ENV=production webpack\
    --colors --config ./build/webpack.config.server.js && node ./build/postCompile.js"
}
{% endhighlight %}

## 注意事项

* .babelrc

其实之前漏掉了一个很重要的配置：.babelrc

根据官网说是要把 es2015 设置成这样，因为webpack会自动识别并处理：

{% highlight json %}
{ "presets" : [[ "es2015", {"modules": false}], "react"]}
{% endhighlight %}

经过我亲身实践，没错，它是骗你的。

这个点说出来全是泪：有时候要加上`modules: false`，而有时候不需要。我在mac下是需要加，而Ubuntu又不能加。版本更新依旧如此。

所以这个地方，你可能需要靠猜了，加`modules: false`试试，如果报错类似于`exports is not defined`这样的错误就去掉再试试。

变成类似于这样的就可以了：

{% highlight json %}
{
  "presets": [
    "es2015",
    "stage-0",
    "react"
  ],
  "plugins": [
    "transform-runtime",
    "react-hot-loader/babel",
  ]
}
{% endhighlight %}

* ExtractTextPlugin

这个插件也改了配置，需要传入对象。还有，注意不要拼错单词 😑

* import

webpack2推荐使用`import()`异步加载脚本，然而用的时候**有时候**会报错类似于`import and export may only appear at the top level`这样的问题，解决方法是这样的：

{% highlight shell %}
$ yarn add -D babel-plugin-syntax-dynamic-import
{% endhighlight %}

然后加入如下内容到.babelrc中：
{% highlight json %}
{ "plugins": ["syntax-dynamic-import"] }
{% endhighlight %}

* loader-utils

如果你碰到了类似于这样的报错：`parseQuery should get a string as first argument`，恭喜你，你可能又踩坑了，解决方案是更新一下`loader-utils`，这个问题贼坑，我在Ubuntu上没碰到，@可诚 在Mac上碰到了。

解决方法是更新一下这个包

{% highlight shell %}
$ yarn upgrade loader-utils
{% endhighlight %}

* postcss

如果你还用了一大堆postcss的插件，那么你可能需要更新到一个新的`postcss.config.js`中了。

类似于这样的：

{% highlight js %}
module.exports = {
    plugins: [
        require('postcss-modules-values'),
        require('autoprefixer')
    ]
}
{% endhighlight %}

* React-router.match

服务端渲染需要用到match，找了很多资料，都是当做同步函数使用的，然而实际上是异步的. 所以在使用的时候一定要注意。一定要注意！一定要注意！

关于服务端渲染请参考这篇文章的实现：[教你如何搭建一个超完美的服务端渲染开发环境](http://www.jianshu.com/p/0ecd727107bb)

## 如果你还有问题

如果你还有问题，公司的配置我不能开放出来，但是推荐你去看看我另一个项目的配置文件，少了服务端渲染的部分，但是服务端渲染所需要注意的地方在这篇文章中有了一些说明。应该不会有什么问题了的。

[AnnatarHe-graduation-project/exam-online-fe](https://github.com/AnnatarHe-graduation-project/exam-online-fe)

## babel-polyfill

这是一个babel用于兼容低版本浏览器的包，里面又引用了[core.js](https://github.com/zloirock/core-js)，包括了很多es6,7实现的一些方法的实现，这个包挺大的。如果项目中没有用到其中的一些函数，可以选择部分加载。

详细请看[这里](https://github.com/zloirock/core-js/blob/master/shim.js), 选择项目中用到的函数加载好了。

## 结论

如果不在意webpack2的无限大坑文档，其实升级之后的打包效果比较好的。

我们项目原来的三个主要文件分别是(未gzip压缩, 未去除babel-polyfill)：

vendor: 283kb

bundle: 147kb

css: 18.5kb

经过webpack2的打包降成了：

vendor: 216kb

bundle: 177kb

css: 21.9kb

总共降低了37kb.

效果还是有的。

推荐你也快升(cai)级(keng)吧~😊

