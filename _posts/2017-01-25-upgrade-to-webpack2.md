---
layout: 'post'
title: 升级到 webpack2
tags: fe webpack2 webpack
---

近期在公司把 PC-WWW 项目从之前比较复杂的脚本改成了webpack，随后因为看到webpack2发布了正式版本又升级到了 webpack2。效果非常好。

最后会给出前后的结果。

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
{% highlight js %}
entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './your/entry.js'
],
{% endhighlight %}

至于output的配置也是比较正常的，有一点需要注意的是尽量使用 `path.resolve` 来解析路径，我踩了很多次

{% highlight js %}
output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
    chunkFilename: '[name]-[id].chunk.js'
},
{% endhighlight %}

module的地方配置项变了很多，需要一些调整：

这个module我因为dev和server两个部分都要用，所以把它写成了一个func放在base中。至于做成函数而不是配置项是因为css需要在服务端渲染的时候需要切换成另一套配置。

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

getCssLoader 是这么写的，需要在不同的环境下返回不同的配置

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

所以现在只要调用就可以得到相应的module配置了：

{% highlight js %}
module: getModules(false)
{% endhighlight %}

关于plugin，新版取消了几个配置，这个配置目前感觉是比较合适的：

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

devServer也需要进行一部分设置：

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

这里的proxy可以根据自己的需要进行配置，如果有多个配置项推荐写成一个函数调用：

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

项目中用到了server render，所以还需要对服务端代码进行打包。打包过程分为两个部分，分为客户端打包和服务端打包。
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
这里的getModules是把整个`node_modules`作为externals：

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

这个点说出来全是泪：有时候要加上`modules: false`，而有时候不需要。我在mac下是不需要加，而Ubuntu又要加。版本更新依旧如此。

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

* laoder-utils

如果你碰到了类似于这样的报错：`parseQuery should get a string as first argument`，恭喜你，你可能又踩坑了，解决方案是更新一下`loader-utils`，这个问题贼坑，我在Ubuntu上没碰到，@可诚 在Mac上碰到了。
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

如果你还有问题，公司的配置我不能开放出来，但是推荐你去看看我另一个项目的配置文件，少了服务端渲染的部分，但是服务端渲染所需要注意的地方我都在这篇文章中说明了。应该没什么问题了的。

[AnnatarHe-graduation-project/exam-online-fe](https://github.com/AnnatarHe-graduation-project/exam-online-fe)

## 结论

忘记webpack2的无限大坑文档，升级之后的打包效果非常好。

我们项目原来的三个主要文件分别是(未gzip压缩)：

vendor: 283kb

bundle: 147kb

css: 18.5kb

经过webpack2的打包降成了：

vendor: 216kb

bundle: 86kb

css: 21.9kb

所以`vendor`减少到了webpack1的 **76.3%**，而`bundle`则减少到了原来的**58.5%**

效果还是挺显著的。

推荐你也快升(cai)级(keng)吧~

