---
layout: post
title: 用 golang 实现区块链系列七 | 网络
tags: blockchain code
---

> 原文地址: [Building Blockchain in Go. Part 7: Network](https://jeiwan.cc/posts/building-blockchain-in-go-part-7/)

## 介绍

到现在为止，我们已经实现了一个拥有所有关键功能的区块链了：匿名，安全，还有随机生成的地址；区块链数据存储；工作量证明系统；以可靠的方式存储交易。尽管这些功能很关键，但还是有不足。到底是什么会让这些功能真的闪耀起来呢，到底是什么使得加密货币成为可能呢 —— 是网络。如果一个这样牛逼的区块链只是在一台计算机上运行有什么卵用？当只有一个用户的时候，这些基于密码学的功能有啥好处？是网络使得这些机制可以工作起来，而且变得有用。

你可以把这些区块链的功能想象成教条，类似于那种人们想要一起生活成长就要遵守的教条。这是一种社会准则。区块链网络是一个遵循着同样准则的程序社区，正式这种遵循准则使得社区得以存活。这和真实世界很相似，当人们分享了类似的思想，他们就会更强而且可以一同创造更好的生活。如果有人遵循了一个不同的准则，他们就生活在另一个分离的社会中(比如国家，群体)。相同的，如果有一个区块链节点遵循了不同的准则，他们就会演变成一个分离的网络。

**这点非常重要:**如果没有网络，没有主节点去共享相同的准则，那么准则就是无用的。

> 免责声明： 不幸的是，我没有足够的时间去实现一个真正的 P2P 网络原型。在本文中，我将会演示一个涉及需要不同节点类型的最常见的场景。使这个 P2P 网络改善这种情况对你来说是个很好的挑战，也是一个很棒的练习。我也不能保证除此之外的其他场景也会在这篇文章中实现，将来可能会做。抱歉！
> 
> 这个部分的介绍有重大的代码变化，所以没必要全都解释清楚，请参考 [这个页面](https://github.com/Jeiwan/blockchain_go/compare/part_6...part_7#files_bucket) 了解自上篇文章以来的变化。

## 区块链网络

区块链网络是去中心化的，这意味着没有干活的服务器，也没有调用服务器去接收发送数据的客户端。在区块链网络中有节点，每个节点都是网络中的全量成员。一个节点就包含了所有东西：既是客户端也是服务器。一定要把这点记在脑子里，因为这和正常的网络应用非常不一样。

区块链网络是一个 P2P(Peer-to-Peer, 点对点) 网络，这意味着节点直接和其他节点连接。这个拓扑结构很平，由于节点中并没有登记角色。这是一张示意图：

![p2p network representation](https://jeiwan.cc/images/p2p-network.png)

*([Business vector created by Dooder - Freepik.com](http://www.freepik.com/dooder))*

这样的网络节点很难实现，因为它要做很多的操作。每个节点要和众多其他节点交互，这就必须去请求其他节点的状态，和自己的状态做对比，当不是最新的状态的时候还得更新到最新状态。

## 节点角色(Node Roles)

接管是全量的，网络中的区块链节点依然有着不同的角色。它们分别是：

* 矿工

这终结点运行在很强力而且专业的硬件设备上(像是 ASIC)，它们的唯一目标就是尽可能快地算出新的区块。矿工是区块链上唯一使用工作量证明系统的角色，因为挖坑实际上就是解决工作量证明的问题。例如在 Proof-of-Stake 区块链中，是没有挖矿的。

* 全量节点

这种节点通过矿工和验证交易来验证区块。为了达成这个目的，这种节点必须有区块链的全量副本。而且，这终结点也做类似于路由的操作，比如会帮助其他节点发现彼此。

有用很多个全量节点对于网络来说至关重要，因为这种节点需要做决定：它们决定一个区块或者一笔交易是否合法。

* SPV

SPV 是简单支付验证。这种节点并不保存区块链的全量副本，但是它们仍有能力去验证交易(并非所有交易，只是一个子集，例如，被发送到特殊地址的)。一个 SPV 节点依赖于一个全量节点去获取数据，可以有很多个 SPV 节点链接到一个全量节点上。SPV 使得钱包应用成为可能：无需下载整个区块链，但仍然可以验证交易。

## 网络简化

为了实现我们区块链中的网络，我们需要简化一些东西。问题是我们并没有很多电脑去模拟网络上的众多节点。我们可以用虚拟机或者 Docker 来解决这个问题，但这会让很多事情变得更复杂：在我们集中精力实现区块链的时候，你可能得解决虚拟机或者 Docker 的问题。所以我们想要在单机运行多个区块链节点，而且同时我们还得让它们有不同的地址。为了达成这点，我们要用 **端口作为节点身份**，以此来替换 IP 地址。这就是节点地址了：**127.0.0.1:3000, 127.0.0.1:3001, 127.0.0.1:3002**，等。我们调用端口节点ID，用 **NODE_ID**设置成环境变量。因此，你可以打开多个终端窗口，设置不同的 NODE_ID，用不同的节点运行。

这种方法也需要不同的区块链和钱包。它们现在只能依赖于节点 ID，被命名为类似 **blockchain_3000.db**，**blockchain_30001.db** 和 **wallet_3000.db, wallet_30001.db**等。

## 实现

那么，我们下载比特币核心并首次运行的时候到底发生了什么？它必须要去链接到其他节点去下载区块链的最新状态。考虑到你的电脑并不知道所有的，或者部分的区块链节点，那么这个节点是什么？

在比特币核心中写死一个节点地址是会出错的：这个节点可能会被攻击或者是关掉，这就可能会导致新节点不能被加入到网络中。比特币核心中，[DNS种子(DNS seeds)](https://bitcoin.org/en/glossary/dns-seed) 是被写死的。虽然没有节点，但是 DNS 服务器知道一些节点的地址。当我们启动一个干净的比特币核心，它会链接到其中一个种子节点上，然后拿到所有节点的列表，这就是之后比特币被下载的地方。

在我们的实现中，它仍然会是中心化的。我们会有三个节点：

1. 中心节点。这个节点会被所有的其他节点链接。这个节点也会在其他节点间发送数据。
2. 一个矿工节点。这个节点会在内存池中存储新的交易，在存了足够多的交易后开始挖矿。
3. 一个钱包节点。这个节点将会在钱包间发送币。取消 SPV 节点，它会存储区块链的全量节点。

## 情景

这篇文章的目的是实现下列场景：

1. 中心节点创建一个区块链
2. 其他(钱包)节点链接并下载区块链
3. 多个(矿机)节点连接到中心节点并下载区块链
4. 钱包节点创建交易
5. 矿机节点接收交易并把它放到内存池中
6. 当内存池中有足够的交易之后，矿机开始启动，挖掘新的区块
7. 当一个新的区块被发掘出来，把它存到中心节点
8. 钱包节点同步中心节点
9. 用户的钱包节点确认他们的支付成功了

比特币看起来就是这样的。尽管我们没有实现一个真正的 P2P 网络，我们将要实现一个真的也是重要的比特币用例。

## 版本

节点通过消息的方式进行通讯。当一个新的节点运行了，它会从 DNS种子中获得一些节点，然后发送给它们 **版本(version)** 信息，它在我们的实现中看起来像是这样：

{% highlight golang %}
type version struct {
    Version    int
    BestHeight int
    AddrFrom   string
}
{% endhighlight %}

我们只有一个区块链版本，所以 **Version**字段并不会保存任何重要信息。 **BastHeight**春粗了区块链的节点长度。**AddFrom**存储着发送者的地址。

接收一条**version**消息的节点应该做什么？它会用它自己的 **version** 消息响应。这类似于握手：在对方预先打招呼之前，不能有任何交互的可能。这并非只是礼貌：**version**被用来找到区块链中更长的部分。当一个节点接收到一条 **version** 消息，它会确认区块链节点是否比**BastHeight**的值更长。如果不是，节点会请求并下载遗失的区块。

为了接收消息，我们需要一个服务器：

{% highlight golang %}
var nodeAddress string
var knownNodes = []string{"localhost:3000"}

func StartServer(nodeID, minerAddress string) {
    nodeAddress = fmt.Sprintf("localhost:%s", nodeID)
    miningAddress = minerAddress
    ln, err := net.Listen(protocol, nodeAddress)
    defer ln.Close()

    bc := NewBlockchain(nodeID)

    if nodeAddress != knownNodes[0] {
        sendVersion(knownNodes[0], bc)
    }

    for {
        conn, err := ln.Accept()
        go handleConnection(conn, bc)
    }
}
{% endhighlight %}

首先，我们写死了中心节点的地址：每个节点都必须知道从哪里初始化连接。**minerAddress**参数指定接收挖坑奖励的地址。这一块：

{% highlight golang %}
if nodeAddress != knownNodes[0] {
    sendVersion(knownNodes[0], bc)
}
{% endhighlight %}

它的意思是如果当前节点并非中心节点，它必须发送 **version** 信息给中心节点去找寻确认区块链是否已经失效。

{% highlight golang %}
func sendVersion(addr string, bc *Blockchain) {
    bestHeight := bc.GetBestHeight()
    payload := gobEncode(version{nodeVersion, bestHeight, nodeAddress})

    request := append(commandToBytes("version"), payload...)

    sendData(addr, request)
}
{% endhighlight %}

我们的消息，在底层，是字节序列。头 12 个字节表明了命令名(我们的场景下是 "version")，之后的字节会包含 **gob** 编码过的消息结构。**commandToBytes** 看起来像是这样：

{% highlight golang %}
func commandToBytes(command string) []byte {
    var bytes [commandLength]byte

    for i, c := range command {
        bytes[i] = byte(c)
    }

    return bytes[:]
}
{% endhighlight %}

它创建了一个 12 字节的 buffer 然后用命令名填满，剩余字节是空的。这是一个对立的函数：

{% highlight golang %}
func bytesToCommand(bytes []byte) string {
    var command []byte

    for _, b := range bytes {
        if b != 0x0 {
            command = append(command, b)
        }
    }

    return fmt.Sprintf("%s", command)
}
{% endhighlight %}

当一个节点收到了一条命令，它会执行 **bytesToCommand** 去解析命令名然后用正确地句柄执行命令体：

{% highlight golang %}
func handleConnection(conn net.Conn, bc *Blockchain) {
    request, err := ioutil.ReadAll(conn)
    command := bytesToCommand(request[:commandLength])
    fmt.Printf("Received %s command\n", command)

    switch command {
    ...
    case "version":
        handleVersion(request, bc)
    default:
        fmt.Println("Unknown command!")
    }

    conn.Close()
}
{% endhighlight %}

好了，这是 **version**命令处理函数，看起来大概是这样：

{% highlight golang %}
func handleVersion(request []byte, bc *Blockchain) {
    var buff bytes.Buffer
    var payload verzion

    buff.Write(request[commandLength:])
    dec := gob.NewDecoder(&buff)
    err := dec.Decode(&payload)

    myBestHeight := bc.GetBestHeight()
    foreignerBestHeight := payload.BestHeight

    if myBestHeight < foreignerBestHeight {
        sendGetBlocks(payload.AddrFrom)
    } else if myBestHeight > foreignerBestHeight {
        sendVersion(payload.AddrFrom, bc)
    }

    if !nodeIsKnown(payload.AddrFrom) {
        knownNodes = append(knownNodes, payload.AddrFrom)
    }
}
{% endhighlight %}

首先我们得解码请求并且解析负载。这和所有的处理器一样，所以我会在未来的代码片段中省略这一块。

然后一个节点和消息中的一个 **BastHeight** 比较。如果节点区块链更长，它会返回 **version** 消息；否则，它会发送 **getblocks** 消息。

### getblocks

{% highlight golang %}
type getblocks struct {
    AddrFrom string
}
{% endhighlight %}

**getblocks** 意味着 “告诉我你的区块”(在比特币中，它会更复杂一些)。注意一下，它不会说 “给我你的所有区块”，它会请求一个区块哈希的列表。这会降低网络负载，因为区块可以被从其他节点下载，而且我们也不想从单一节点下载几十 Gb 的数据。

处理命令很简单：

{% highlight golang %}
func handleGetBlocks(request []byte, bc *Blockchain) {
    ...
    blocks := bc.GetBlockHashes()
    sendInv(payload.AddrFrom, "block", blocks)
}
{% endhighlight %}

在我们的简版实现中，它会返回**所有区块哈希**

### inv

{% highlight golang %}
type inv struct {
    AddrFrom string
    Type     string
    Items    [][]byte
}
{% endhighlight %}

比特币使用 **inv** 来向其他节点展示当前区块拥有的区块或者交易。再次声明，它并不包含整个区块或交易，有的只有它们的哈希。**Type**字段会说哪里有区块或者交易。

处理 **inv** 比较困难：

{% highlight golang %}
func handleInv(request []byte, bc *Blockchain) {
    ...
    fmt.Printf("Recevied inventory with %d %s\n", len(payload.Items), payload.Type)

    if payload.Type == "block" {
        blocksInTransit = payload.Items

        blockHash := payload.Items[0]
        sendGetData(payload.AddrFrom, "block", blockHash)

        newInTransit := [][]byte{}
        for _, b := range blocksInTransit {
            if bytes.Compare(b, blockHash) != 0 {
                newInTransit = append(newInTransit, b)
            }
        }
        blocksInTransit = newInTransit
    }

    if payload.Type == "tx" {
        txID := payload.Items[0]

        if mempool[hex.EncodeToString(txID)].ID == nil {
            sendGetData(payload.AddrFrom, "tx", txID)
        }
    }
}
{% endhighlight %}

如果区块哈希被转移了，我们希望把它们存在 **blocksInTransit** 变量中去追踪已下载的区块。这允许我们去从不同的节点中使用已下载的区块。刚好在把区块转成迁移状态后，我们发送 **getdata** 命令到 **inv** 消息的发送者那里，然后更新 **blocksInTransit**。在真实的 P2P 网络中，我们会想要从不同的节点中转移区块。

在我们的实现中，我们从不用多个哈希值发送 **inv**。这也就是为什么只有在**payload.Type == "tx"** 是第一个哈希才会被取走。随后我们会检查我们是否已经在内存池中有了相同的哈希，如果没有，**getdata** 的消息就被发出去了。

### getdata

{% highlight golang %}
type getdata struct {
    AddrFrom string
    Type     string
    ID       []byte
}
{% endhighlight %}

**getdata** 是一个队确定的区块或交易的请求，而且它可以包含且只能包含一个 区块/交易 的 ID。

{% highlight golang %}
func handleGetData(request []byte, bc *Blockchain) {
    ...
    if payload.Type == "block" {
        block, err := bc.GetBlock([]byte(payload.ID))

        sendBlock(payload.AddrFrom, &block)
    }

    if payload.Type == "tx" {
        txID := hex.EncodeToString(payload.ID)
        tx := mempool[txID]

        sendTx(payload.AddrFrom, &tx)
    }
}
{% endhighlight %}

处理方式很直接：如果它们请求一个区块，就返回一个区块；如果请求一笔交易，就返回一笔交易。注意，我们并不确认我们是否真的有这个区块或交易。这是一个瑕疵 :)

### block 和 tx

{% highlight golang %}
type block struct {
    AddrFrom string
    Block    []byte
}

type tx struct {
    AddFrom     string
    Transaction []byte
}
{% endhighlight %}

这些是真正的转移数据的消息。

处理 **block** 消息很简单：

{% highlight golang %}
func handleBlock(request []byte, bc *Blockchain) {
    ...

    blockData := payload.Block
    block := DeserializeBlock(blockData)

    fmt.Println("Recevied a new block!")
    bc.AddBlock(block)

    fmt.Printf("Added block %x\n", block.Hash)

    if len(blocksInTransit) > 0 {
        blockHash := blocksInTransit[0]
        sendGetData(payload.AddrFrom, "block", blockHash)

        blocksInTransit = blocksInTransit[1:]
    } else {
        UTXOSet := UTXOSet{bc}
        UTXOSet.Reindex()
    }
}
{% endhighlight %}

当我们收到一个新的区块，我们把它塞进我们的区块链中。如果有更多的区块被下载，我们从前一个下载的区块的相同的节点中请求。当我们最终下载了所有的区块，UTXO 集就会被重新索引。

> TODO: 替换掉无条件的信任，我们应该在把它们添加到区块链中之前验证每个区块。
>
> TODO: 替换掉执行 UTXOSet.Reindex() 的部分, 应该用 UTXOSet.Update(block)，因为区块链太大了。重新索引整个 UTXO 集合会占用大量的时间。

处理 **tx** 消息是比较难的部分：

{% highlight golang %}
func handleTx(request []byte, bc *Blockchain) {
    ...
    txData := payload.Transaction
    tx := DeserializeTransaction(txData)
    mempool[hex.EncodeToString(tx.ID)] = tx

    if nodeAddress == knownNodes[0] {
        for _, node := range knownNodes {
            if node != nodeAddress && node != payload.AddFrom {
                sendInv(node, "tx", [][]byte{tx.ID})
            }
        }
    } else {
        if len(mempool) >= 2 && len(miningAddress) > 0 {
        MineTransactions:
            var txs []*Transaction

            for id := range mempool {
                tx := mempool[id]
                if bc.VerifyTransaction(&tx) {
                    txs = append(txs, &tx)
                }
            }

            if len(txs) == 0 {
                fmt.Println("All transactions are invalid! Waiting for new ones...")
                return
            }

            cbTx := NewCoinbaseTX(miningAddress, "")
            txs = append(txs, cbTx)

            newBlock := bc.MineBlock(txs)
            UTXOSet := UTXOSet{bc}
            UTXOSet.Reindex()

            fmt.Println("New block is mined!")

            for _, tx := range txs {
                txID := hex.EncodeToString(tx.ID)
                delete(mempool, txID)
            }

            for _, node := range knownNodes {
                if node != nodeAddress {
                    sendInv(node, "block", [][]byte{newBlock.Hash})
                }
            }

            if len(mempool) > 0 {
                goto MineTransactions
            }
        }
    }
}
{% endhighlight %}

第一件要做的事情就是往内存池中塞入一条新的交易(再次声明，在被放入到内存池之前，交易必须要先被验证)，下一块：

{% highlight golang %}
if nodeAddress == knownNodes[0] {
    for _, node := range knownNodes {
        if node != nodeAddress && node != payload.AddFrom {
            sendInv(node, "tx", [][]byte{tx.ID})
        }
    }
}
{% endhighlight %}

确认当前节点是否为中心节点。在我们的实现中，中心节点并不会挖掘区块。而会在网络中转发新的交易给其余节点。

第二大块只是针对矿工节点。让我们分解成小块吧：

{% highlight golang %}
if len(mempool) >= 2 && len(miningAddress) > 0 {
{% endhighlight %}

**miningAddress** 是矿工节点唯一的数据集。当当前(矿工)节点的内存池中有两个或者更多交易的时候，挖坑开始。

{% highlight golang %}
for id := range mempool {
    tx := mempool[id]
    if bc.VerifyTransaction(&tx) {
        txs = append(txs, &tx)
    }
}

if len(txs) == 0 {
    fmt.Println("All transactions are invalid! Waiting for new ones...")
    return
}
{% endhighlight %}

首先，内存池中的所有交易会被验证，非法交易会被忽略掉，如果没有合法交易，挖坑会被中止。

{% highlight golang %}
cbTx := NewCoinbaseTX(miningAddress, "")
txs = append(txs, cbTx)

newBlock := bc.MineBlock(txs)
UTXOSet := UTXOSet{bc}
UTXOSet.Reindex()

fmt.Println("New block is mined!")
{% endhighlight %}

验证过的交易会被塞进区块中，同时还有一笔带着奖励的币基交易。挖矿结束后， UTXO 集被重新索引。

> TODO: 再次声明，UTXOSet.Update 应该替换掉 UTXOSet.Reindex

{% highlight golang %}
for _, tx := range txs {
    txID := hex.EncodeToString(tx.ID)
    delete(mempool, txID)
}

for _, node := range knownNodes {
    if node != nodeAddress {
        sendInv(node, "block", [][]byte{newBlock.Hash})
    }
}

if len(mempool) > 0 {
    goto MineTransactions
}
{% endhighlight %}

一笔交易被挖掘之后，它会在内存池中被删掉。当前节点知道的其他节点，收到带有新区块哈希的 **inv** 消息。在处理了这条消息后，它们可以请求这个区块。

## 结果

我们来重现一下之前定义的场景吧。

首先设定 **NODE_ID** 为 3000(**export NODE_ID=3000**)在第一个窗口中。在下一节之前我会用类似于 **NODE 3000** 或 **NODE 3001**来指代，你要了解哪个节点做什么。

### NODE 3000

创建一个钱包和一条区块链:

{% highlight text %}
$ blockchain_go createblockchain -address CENTREAL_NODE
{% endhighlight %}

*(为了简单清楚地表示，我用了假地址)*

之后，区块链会包含一个创世区块。我们需要保存这个区块并在其他节点中使用。创世区块作为区块链的标识(比特币核心中，创始区块是写死的)。

{% highlight text %}
$ cp blockchain_3000.db blockchain_genesis.db 
{% endhighlight %}

### NODE 3001

下一步打开一个新的终端窗口并设置 node ID 到 3001，这回事一个钱包节点。通过 **blockchain_go createwallet**生成新的地址，我们调用这些地址**WALLET_1, WALLET_2, WALLET_3**

### NODE 3000

发送一些币到钱包地址上:

{% highlight text %}
$ blockchain_go send -from CENTREAL_NODE -to WALLET_1 -amount 10 -mine
$ blockchain_go send -from CENTREAL_NODE -to WALLET_2 -amount 10 -mine
{% endhighlight %}

**-mine** 标识意味着节点会立刻用相同的节点挖坑。我们必须要有这个标识，因为在初始化阶段，网络中并没有矿工节点。

启动这个节点：

{% highlight text %}
$ blockchain_go startnode
{% endhighlight %}

这个节点必须被一直运行，直到场景结束。

### NODE 3001

用上面保存的创始区块启动节点的区块链：

{% highlight text %}
$ cp blockchain_genesis.db blockchain_3001.db
{% endhighlight %}

运行节点：

{% highlight text %}
$ blockchain_go startnode
{% endhighlight %}

它会从中心节点下载所有的区块。为了确认所有事情都对了，停止节点确认一下余额：

{% highlight text %}
$ blockchain_go getbalance -address WALLET_1
Balance of 'WALLET_1': 10

$ blockchain_go getbalance -address WALLET_2
Balance of 'WALLET_2': 10
{% endhighlight %}

你可以在**中心节点**的地址中查看账户余额，因为节点 3001 现在也有区块链：

{% highlight text %}
$ blockchain_go getbalance -address CENTRAL_NODE
Balance of 'CENTRAL_NODE': 10
{% endhighlight %}

### NODE 3002

打开一个新的窗口并把 ID 设为 3002，生成一个钱包，这将会是一个矿工节点。初始化区块链：

{% highlight text %}
$ cp blockchain_genesis.db blockchain_3002.db
{% endhighlight %}

启动节点：

{% highlight text %}
$ blockchain_go startnode -miner MINER_WALLET
{% endhighlight %}

### NODE 3001

发一些币：

{% highlight text %}
$ blockchain_go send -from WALLET_1 -to WALLET_3 -amount 1
$ blockchain_go send -from WALLET_2 -to WALLET_4 -amount 1
{% endhighlight %}

### NODE 3002

快点！切换到矿工节点就可以看到它正在挖新的区块！同时检查一下中心节点的输出。

### NODE 3001

切换到钱包节点并启动它：

{% highlight text %}
$ blockchain_go startnode
{% endhighlight %}

它下载了新的被挖出的区块！

停下，检查一下余额：

{% highlight text %}
$ blockchain_go getbalance -address WALLET_1
Balance of 'WALLET_1': 9

$ blockchain_go getbalance -address WALLET_2
Balance of 'WALLET_2': 9

$ blockchain_go getbalance -address WALLET_3
Balance of 'WALLET_3': 1

$ blockchain_go getbalance -address WALLET_4
Balance of 'WALLET_4': 1

$ blockchain_go getbalance -address MINER_WALLET
Balance of 'MINER_WALLET': 10
{% endhighlight %}

搞定！

## 结语

这是这个系列的最后一个部分。我可以发表更多的文章来演示一个真正的 P2P 网络原型，不过我没时间这么做了。我希望这篇文章回答了你关于比特币技术的一些问题并产生了新的问题，对于这些你可以自己找答案解决。还有很多有趣的东西隐藏在比特币技术中！祝你好运！

P.S. 你可以实现 **addr** 消息来开始优化这个网络，就像是比特币网络协议中所描述的那样(底下会有链接)。这是非常重要的消息，因为这使得节点间可以发现彼此。我已经开始着手实现它了，不过还没完成。

## 链接

1. [源码](https://github.com/Jeiwan/blockchain_go/tree/part_7)
2. [比特币协议文档](https://en.bitcoin.it/wiki/Protocol_documentation)
3. [比特币网络](https://en.bitcoin.it/wiki/Network)

* [基本原型]({% post_url 2017-12-29-building-blockchain-in-go-part-1-basic-prototype %})
* [工作量证明]({% post_url 2017-12-30-building-blockchain-in-go-part-2-proof-of-work %})
* [持久化与命令行]({% post_url 2017-12-30-building-blockchain-in-go-part-3-persistence-and-cli %})
* [交易 1]({% post_url 2018-01-01-build-blockchain-in-go-part-4-transactions-1 %})
* [地址]({% post_url 2018-01-02-building-blockchain-in-go-part-5-addresses %})
* [交易 2]({% post_url 2018-01-06-building-blockchain-in-go-part-6-transactions-2 %})
* [网络]({% post_url 2018-01-12-building-blockchain-go-part-7-network %})

> 非常感谢 **Ivan Kuznetsov** 的文章，感谢 [buctwbzs](https://github.com/buctwbzs) 的校对和 [小洁](https://weibo.com/u/2808613111)的辅助翻译
