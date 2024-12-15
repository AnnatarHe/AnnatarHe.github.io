# ShellTime.xyz 你很需要的命令行记录服务

你有没有想过自己在 terminal 里输入了多少次命令？执行了多少次 `npm` ? 我上周到底用了哪些命令？有没有什么改进空间？
shelltime.xyz 来啦！

它通过在你的 shell 中注入 hook 来进行命令的记录和采集，你可以非常轻松地在网站页面中看到你最近的执行的命令，定期 review 自己记录，哪个时间段最卷。以及更多的综合数据

## 周报

我们每周一都会发送一份周报来告知上周的状态，包括不仅限于用得最多的命令，什么时候最有工作效率，有哪些设备支持，哪种 shell 用得最多等等。

当然啦，将来也会增加更多的数据报表

## 多设备支持

和很多看到这篇文章的朋友类似，我在管理控制的有两台 mac 和 10 台服务器。经常也不知道自己在哪台服务器上做了什么，那么有了 shelltime 的支持，我们可以轻松查看到前段时间在哪台服务器做了什么事情

## 隐私

命令执行是一件很隐私的事情，确实。尤其是一些带有 cookie 和 authorization 的 curl 是不能暴露给外部的。没关系，shelltime 在客户端就已经做了数据脱敏，这些数据并不会带给服务器，所以可以放心使用。如果你真的很关心我们的承诺或者你有更好的 data masking 方案，也欢迎 review 代码或者提交 pull request

[https://github.com/malamtime/cli/blob/188619d610a1d29939f42d88700ef9a170f159a3/model/string.go#L9](https://github.com/malamtime/cli/blob/188619d610a1d29939f42d88700ef9a170f159a3/model/string.go#L9)

## 排名

哈哈哈，我已经知道有人想卷一卷了，没关系，可以来 “排名” 模块来看看，这里每日更新，会有最近 30 天使用命令最多的人的排名

## 通用账户

我们知道你早已经记不住自己众多的账户密码，也厌倦了输入永无止境的两步验证。没关系，我们的 ShellTime 没有这么麻烦的东西，你只要有个 github 账户即可登录，获取 openToken，集成到本地的电脑上。顺滑！

## 第三方 BI 支持

我猜你一会儿进去大概会觉得聚合计算的数据有点儿少。这些功能会在后续提供支持。现在没有也没关系，因为我们支持数据导出！

只需要在全部命令的页面点击导出，后台会执行导出任务，在数据准备完成后会发送到你的邮箱，你可自行下载，并将其导入到自己的 BI 系统中进行完整的数据分析。

如果想要尝试真正企业版，超大规模支持的 BI 系统；亦或是高性能列式分析数据库，也欢迎联系我们 😁

## Internationalization

Yes, we know you may not enjoy reading everything in Chinese. That’s why we also support Korean, Japanese, and, of course, English. English is the default language during development.

Don’t worry; there’s always a chance to pay later. 🐶

## 免费版也够用

我们为高级用户提供数据导出，月报年报（开发中），以及更多报表支持，更多新鲜功能。但是为了维持服务的运行，我们需要一定的费用去维持开发和服务运行。如果你对更丰富的功能感兴趣，欢迎订阅我们的 “先锋版” 套餐

当然，我们也了解每月 12 美金的订阅费不是很便宜。所以也提供较为慷慨的免费服务 —— 你依旧可以查看自己最近执行的命令。收到周报，查看一些基础的数据分析报表。在加入先锋套餐后，可以立刻获取到丰富的付费功能

## 付费有什么？

我们为付费用户提供了数据下载的支持，允许用户导出自己的数据到 csv 格式，交给后续其他的 BI 工具进行更复杂的数据分析工作。

同样提供给付费用户的还有 Webhook 功能。用户可以使用 webhook 功能订阅自己的数据，并自行开发更多更丰富的个人功能，例如数据转存，自定义的通知等等。

## 如何使用

看到这里我相信你大概已经跃跃欲试。
这里先略微介绍一下原理，方便你更好地集成到自己的电脑/Mac/服务器中。

我们是通过 shell hook 的形式来记录命令的，所以需要 shell 能够支持 script hooks，而 bash 对此支持并不是很完整，所以暂时仅支持 `zsh` 和 `fishshell` 。

由于需要注入到本地的 shell initial script 中，所以在加载结束后需要先进行一次 `source` 来加载脚本。

再来是因为我们需要判定用户身份，所以需要用户你先登录到网站中获取一份 openToken 来帮助本地脚本判定身份。

那么，命令如下:

```bash
curl -sSL https://raw.githubusercontent.com/malamtime/installation/master/install.bash | bash

source ~/.zshrc  # for zsh
source ~/.config/fish/config.fish  # for fish

shelltime init
```

## FAQ

### 下载脚本一直卡着，执行不了

you may not be able to execute the download script if you are in china mainland, since we host the binary in github

and if the GFW decided to “protect” you from shelltime in future. you may need additional efforts to access the shelltime.xyz

### 为什么我的命令没有立刻在页面中展示

在你的第一条命令执行后，我们在客户端会立即尝试进行同步。但是后续我们为了降低用户设备的网络流量和服务器的负载。会将数据做聚合，然后传给服务器。目前我们设定的限制是十条数据后上传，后续会提供配置来进行调整。

所以如果没能在页面中看到刚刚执行的命令，可以再去多输入几遍 😁

如果确定已经输入很多，但是页面上还是没有，请尝试联系我们并提供日志，我们需要进行一定程度的排查. 日志在 `~/.shelltime/log.log` 

### 为什么使用之后有点儿卡卡的

“卡” 的原因有两个：分别是本地存储和网络保存

- 本地存储的性能是不错的，在 MacBook Pro 14英寸 1TB 的 M1 Pro 芯片设备上。本地存储的时间稳定在 8ms 以内结束。日常使用很难感受到性能差别。
- 网络存储的性能取决于使用者的距离和网络服务提供商。在新加坡网络下，网络存储多数于 120ms 以内完成。但是如果你的节点较远，比如位于纽约，也许你会经受到较高的网络延时。

在可能网络连接到 [ShellTime.xyz](http://ShellTime.xyz) 较慢的情况下我们建议你可以尝试修改本地配置文件 `~/.shelltime/config.toml` 中的 `FlushCount` 字段到一个较大的数值，在合适的时候执行 `shelltime sync` 去触发手动更新

## 怎么卸载

也许你厌倦了和这些卷王对比命令执行数量，或者其他原因不想再用了。那么可以通过以下两条命令卸载 shelltime，放心，卸载可以做到干干净净:

```bash
rm -rf ~/.shelltime
```

随后需要在你本地的 shell 中移除加载代码: 在 `~/.zshrc` 或 `~/.config/fish/config.fish` 中删除含有 `shelltime` 的两行引用。大概长这个样子

```bash
# .zshrc
export PATH="$HOME/.shelltime/bin:$PATH"
source ~/.shelltime/hooks/zsh.zsh

# .config/fish/config.fish
set -gx PATH $HOME/.shelltime/bin $PATH
source ~/.shelltime/hooks/fish.fish
```

如果有任何问题，欢迎联系我们: [annatar.he+shelltime.xyz@gmail.com](mailto:annatar.he+shelltime.xyz@gmail.com)

祝你玩得开心～
