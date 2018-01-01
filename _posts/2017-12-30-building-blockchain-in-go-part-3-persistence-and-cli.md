---
layout: post
title: 用 golang 实现区块链系列三 | 持久化与命令行
tags: blockchain code
---

> 原文地址： [Building Blockchain in Go. Part 3: Persistence and CLI](https://jeiwan.cc/posts/building-blockchain-in-go-part-3/)

## 简介

[到现在为止](/)，我们已经搞了一个带有工作量证明的区块链，它使得挖矿成为可能。我们的实现已经离一个功能全面的区块链更近了一步，但仍然缺少一些重要的功能。今天我们会开始吧区块链存在一个数据库里，然后做一个简单的命令行接口投操作区块链。本质上，区块链是一个分布式的数据库。我们先省略“分布式”这个部分，集中处理“数据库”这部分。

## 数据库选择

当前，我们的视线中没有数据库；作为替代，我们每次运行程序会创建区块并存在内存里。我们不能重复使用区块链，我们不能和其他人共享数据，所以我们需要把它存在硬盘上。

我们需要哪种数据库？事实上，一个都不需要。在 [比特币论文的原文](https://bitcoin.org/bitcoin.pdf) 中，从来没说过要用哪种依存数据库，所以开发者高兴用哪个就用哪个。 [比特币核心](https://github.com/bitcoin/bitcoin)，就那个中本聪最初发布的版本，也是目前比特币实现的参考版本，使用的是 [LevelDB](https://github.com/google/leveldb) (尽管在 2012 年才给客户公布出来)，所以咱也用这个。

## BoltDB

因为：

1. 他很简单而且很小
2. 它用 Go 写的
3. 它不需要跑一个服务器
4. 它允许我们去创建我们自己想要的数据结构

下面来自于 BlotDB 在 github 上的 README 写的：

>  Blot 是一个用纯 Go 写的键值存储，受 Howard Chu 的 LMDB 项目启发而做的。本项目的目标是给并不需要类似于 Postgres 或者 MySQL 这样完整数据库服务的项目提供一个简单的，快速的，可靠地数据库。
> 
> 由于 Blot 是用来做底层功能的，简单是关键。API 就很小而且只集中于写数据和读数据，仅此而已。

听起来就是我们需要的！花点儿时间再去审核一下这个东西。

BoltDB 是一个键值存储，这就意味着没有像是 SQL 关系型数据库(像是 MySQL, PostgresQL 等)的表结构，没有行，没有列。取而代之的是数据以键值配对(像是 Go 语言里的 map)，键值配对被存储在桶(bucket)中。这样就可以集合相似的匹配关系(类似于关系型数据库里面的表结构)，这样，为了获得值，我们就需要一个桶和一个键(key)

BoltDB 还有一个重要的特性就是它没有数据结构：键和值都是二进制数组。因为我们需要存储 Go 数据结构(特指**区块**)到数据库里，我们需要序列化数据。我们需要实现一种机制去转换 Go 的数据结构到 byte 数组还要从 byte 数组里把它恢复出来。我们使用 [encoding/gob](https://golang.org/pkg/encoding/gob/) 做这个事情。 不过**JSON**, **XML**, **Protocol Buffers**也都行。我们用 **encoding/gob** 是因为它很简单，而且是 Go 语言标准库的一部分。

## 数据库结构

在实现持久化逻辑之前，我们得首先去决定如何在数据库里保存数据。因为这个事情，我们得去参考一下比特币核心怎么做的。

简而言之，比特币核心用了两个桶(bucket)去保存数据：

1. **blocks** 保存链上所有区块的元信息
2. **chainstate** 保存链的状态，它是所有当前未完成的交易输出和一些元信息。

同时，区块被分散地存储在硬盘上，这是为了性能烤炉：读单个的区块并不需要加载其中所有(或者一部分)到内存里。我们不会实现这个部分。

在 **blocks** 中， **key -> value** 对应关系是这样的：

1. **'b' + 32 字节的区块 hash -> 区块索引记录**
2. **'f' + 4 字节文件数字 -> 文件信息记录**
3. **'l' -> 4 字节文件数字： 最后一个使用过的区块文件数字**
4. **'R' -> 1 字节布尔值： 我们是否要去重新索引**
5. **'F' + 1 字节标志名长度 + 标志名 -> 1 字节布尔值： 开或关的多种标志**
6. **'t' + 32 字节交易 hash -> 交易索引记录**

在 **chainstate**, **key -> value** 对应关系是这样的：

1. **'c' + 32 字节交易 hash -> 未使用的交易输出记录**
2. **'B' -> 32 字节区块 hash： 区块 hash 到哪里了，数据库应该表示的未使用交易输出**

*(更详细的解释可以在[这里](https://en.bitcoin.it/wiki/Bitcoin_Core_0.11_(ch_2):_Data_Storage)找到)*

因为我们暂时并没有交易信息，我们可以只有一个 **blocks** 桶。所以，像上面说的那样，我们将会把整个数据库存成单文件，不会分成几个文件。这样我们就不需要任何关于文件号的信息了。这样，键值对应关系就会成这样：

1. **32 字节区块 hash -> 区块数据(序列化后的)** 
2. **'l' -> 链上最后一个区块的 hash**

这些就是我们开始实现持久化机制所应知道的所有东西了

## 序列化

就像前面说的那样，在 BoltDB 值只能是 **[]byte** 类型，那么我们想存储 **Block** 结构到数据库里，我们需要用 [encoding/gob](https://golang.org/pkg/encoding/gob/) 去序列化数据结构。

现在来给 **Block** 实现一个 **Serialize** 方法吧(为了简略，错误处理就省略了):

```go
func (b *Block) Serialize() []byte {
    var result bytes.Buffer
    encoder := gob.NewEncoder(&result)

    err := encoder.Encode(b)

    return result.Bytes()
}
```

这一块很简洁：我们申明了一个将会存储序列化后结构的 buffer；随后出赤化 **gob** 编码器并对区块进行编码；最后把字节数组作为结果返回出去。

然后，我们需要反序列化的方法，它要接受一个字节数组作为输入，并且返回一个区块。这不会是一个方法看，而是一个独立函数：

```go
func DeserializeBlock(d []byte) *Block {
    var block Block

    decoder := gob.NewDecoder(bytes.NewReader(d))
    err := decoder.Decode(&block)

    return &block
}
```

这就是序列化要做的事情啦！

## 持久化

让我们从 **NewBlockchain** 函数开始。 现在，它创建一个 **Blockchain** 的实例，并添加一个创始区块到里面。我们想做的是这样的：

1. 打开数据库文件
2. 确认是否有可以复原的区块链信息
3. 如果有区块链的话：1. 创建一个区块链实例。2. 设定区块链实例恢复到 数据库里的最后一个区块 hash。
4. 如果没有已存在的区块链： 1. 创建创始区块。2. 存入数据库。3. 存储创始区块的 hash 作为最后一个区块 hash。 5. 创建一个新的区块链实例，指向创始区块

代码上像是这样：

```go
func NewBlockchain() *Blockchain {
    var tip []byte
    db, err := bolt.Open(dbFile, 0600, nil)

    err = db.Update(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))

        if b == nil {
            genesis := NewGenesisBlock()
            b, err := tx.CreateBucket([]byte(blocksBucket))
            err = b.Put(genesis.Hash, genesis.Serialize())
            err = b.Put([]byte("l"), genesis.Hash)
            tip = genesis.Hash
        } else {
            tip = b.Get([]byte("l"))
        }

        return nil
    })

    bc := Blockchain{tip, db}

    return &bc
}
```   

我们来一块块地看。

```go
db, err := bolt.Open(dbFile, 0600, nil)
```

这是打开 BoltDB 文件的标准方式。注意，如果不存在文件，它并不会返回错误。

```go
err = db.Update(func(tx *bolt.Tx) error {
...
})
```

在 BoltDB 中，是在事务(transaction)中操作数据库的。这里又两种事务类型：只读和读写。这里，我们开一个读写事务(**db.Update(...)**)，因为我们期望把创始区块放到数据库里。

```go
b := tx.Bucket([]byte(blocksBucket))

if b == nil {
    genesis := NewGenesisBlock()
    b, err := tx.CreateBucket([]byte(blocksBucket))
    err = b.Put(genesis.Hash, genesis.Serialize())
    err = b.Put([]byte("l"), genesis.Hash)
    tip = genesis.Hash
} else {
    tip = b.Get([]byte("l"))
}
```

这个部分是函数的核心。这里我们省略了桶存储我们的区块：如果存在，我们读 **l** 键；如果不存在，我们声称一个创始区块，创建 bucket，保存区块到数据库里，顺便更新 **l** 键存储到链上的最后一个区块。

而且，注意一下创建 **Blockchain** 的新方法：

```go
bc := Blockchain{tip, db}
```

我们再不存储所有的区块到数据库里了，取而代之的是只有链顶端被保存。同时我们也留下了数据库资源，因为我们只想打开它一次，并在程序运行的时候都持有着。这样，**Blockchain** 数据结构就成了这样：

```go
type Blockchain struct {
    tip []byte
    db  *bolt.DB
}
```

我们下一个要更新的是 **AddBlock** 方法：现在添加一个区块到链上不再是一个像是在数组里添加一个元素那么简单的事情了。现在，我们得把区块存到数据库里：

```go
func (bc *Blockchain) AddBlock(data string) {
    var lastHash []byte

    err := bc.db.View(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))
        lastHash = b.Get([]byte("l"))

        return nil
    })

    newBlock := NewBlock(data, lastHash)

    err = bc.db.Update(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))
        err := b.Put(newBlock.Hash, newBlock.Serialize())
        err = b.Put([]byte("l"), newBlock.Hash)
        bc.tip = newBlock.Hash

        return nil
    })
}
```

再来一块一块地看：

```go
err := bc.db.View(func(tx *bolt.Tx) error {
    b := tx.Bucket([]byte(blocksBucket))
    lastHash = b.Get([]byte("l"))

    return nil
})
```

这是 BlotDB 事务的另一个类型(只读)。这里，我们需要获取从数据库里获取最后一个区块 hash，然后用它挖掘下一个新的区块 hash。

```go
newBlock := NewBlock(data, lastHash)
b := tx.Bucket([]byte(blocksBucket))
err := b.Put(newBlock.Hash, newBlock.Serialize())
err = b.Put([]byte("l"), newBlock.Hash)
bc.tip = newBlock.Hash
```

挖掘到新的区块后，我们需要存储序列化的代表数据到数据库里，并更新 **l** 键，它现在保存着新的区块 hash。

搞定了！这也不是很难，对吧？

## 检查区块链

现在所有的新的区块都存在数据库里了，所以我们可以重复打开区块链并在其上添加新的区块。但在实现这个功能之后，我们同样失去了一个重要的功能：我们再不能打印出区块链里的区块了，因为我们不再是把区块链存在数组里了，让我们来修复这个问题。

BoltDB 允许我们迭代出桶里的所有键，不过这些键都是被存储在字节排序过的列表里的，我们期望的是可以按照在区块链中的顺序打印出区块。同时我们也不想要把区块链上所有的区块都加载到数组里(我们的区块链数据库可能会非常的大。。。好吧，假装它很大好了)，我们要一个个读。为了完成这个目标，我们要去做区块链的迭代。

```go
type BlockchainIterator struct {
    currentHash []byte
    db          *bolt.DB
}
```

一个迭代器可以在我们想要遍历区块链上的数据的时候被创建，而且它可以存储当前迭代的区块哈希和一个数据库链接资源。一个迭代器逻辑上市依附于区块链的(这是个存有数据库链接资源的 **Blockchain** 实例)，所以了，我们在 **Blockchain** 里创建方法:

```go
func (bc *Blockchain) Iterator() *BlockchainIterator {
    bci := &BlockchainIterator{bc.tip, bc.db}

    return bci
}
```

需要注意的是，迭代器初始化的时候是指向区块链顶端的，所以区块要遵循自上而下，从最新到最旧。实际上，**选择一个顶部意味着区块链中的"选举"**。一个区块链可以有很多的分支，而其中最长的那条就是主分支。在找到顶端后(区块链中的任意区块都可能是顶端)，我们要重新构建整个区块链并计算它的长度，这项工作需要去构建它。这个事情同时也意味着顶端也是区块链自身身份的一种标识。

**BlockchainIterator** 将只会做一件事情：它会返回区块链中的下一个区块。

```go
func (i *BlockchainIterator) Next() *Block {
    var block *Block

    err := i.db.View(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))
        encodedBlock := b.Get(i.currentHash)
        block = DeserializeBlock(encodedBlock)

        return nil
    })

    i.currentHash = block.PrevBlockHash

    return block
}
```

这就是数据库的部分了。

## 命令行(CLI)

我们的实现至今还没有提供一个可以和程序交互的接口：我们简单地在 **main** 函数里执行 **NewBlockchain**， **bc.AddBlock**。是时候升级一下了。我们需要这么几个命令：

```text
blockchain_go addblock "Pay 0.031337 for a coffee"
blockchain_go printchain
```

所有的命令行依赖的操作都会被在 **CLI** 结构中进行：

```go
type CLI struct {
    bc *Blockchain
}
```

这个"入口"就是 **Run** 函数：

```go
func (cli *CLI) Run() {
    cli.validateArgs()

    addBlockCmd := flag.NewFlagSet("addblock", flag.ExitOnError)
    printChainCmd := flag.NewFlagSet("printchain", flag.ExitOnError)

    addBlockData := addBlockCmd.String("data", "", "Block data")

    switch os.Args[1] {
    case "addblock":
        err := addBlockCmd.Parse(os.Args[2:])
    case "printchain":
        err := printChainCmd.Parse(os.Args[2:])
    default:
        cli.printUsage()
        os.Exit(1)
    }

    if addBlockCmd.Parsed() {
        if *addBlockData == "" {
            addBlockCmd.Usage()
            os.Exit(1)
        }
        cli.addBlock(*addBlockData)
    }

    if printChainCmd.Parsed() {
        cli.printChain()
    }
}
```

我们使用标准的 [flag](https://golang.org/pkg/flag/) 包来解析命令行参数。

```go
addBlockCmd := flag.NewFlagSet("addblock", flag.ExitOnError)
printChainCmd := flag.NewFlagSet("printchain", flag.ExitOnError)
addBlockData := addBlockCmd.String("data", "", "Block data")
```

首先，我们创建了两个子命令，**addblock** 和 **printchain**，随后我们添加了 **-data**前缀的数据。 **printchain** 并不会有任何标识。

```go
switch os.Args[1] {
case "addblock":
    err := addBlockCmd.Parse(os.Args[2:])
case "printchain":
    err := printChainCmd.Parse(os.Args[2:])
default:
    cli.printUsage()
    os.Exit(1)
}
```

下一步我们要确认一下用户提供的命令并解析出对应的 **标识** 子命令。

```go
if addBlockCmd.Parsed() {
    if *addBlockData == "" {
        addBlockCmd.Usage()
        os.Exit(1)
    }
    cli.addBlock(*addBlockData)
}

if printChainCmd.Parsed() {
    cli.printChain()
}
```

下一步我们要确认解析出了哪个子命令，并且运行对应的方法。

```go
func (cli *CLI) addBlock(data string) {
    cli.bc.AddBlock(data)
    fmt.Println("Success!")
}

func (cli *CLI) printChain() {
    bci := cli.bc.Iterator()

    for {
        block := bci.Next()

        fmt.Printf("Prev. hash: %x\n", block.PrevBlockHash)
        fmt.Printf("Data: %s\n", block.Data)
        fmt.Printf("Hash: %x\n", block.Hash)
        pow := NewProofOfWork(block)
        fmt.Printf("PoW: %s\n", strconv.FormatBool(pow.Validate()))
        fmt.Println()

        if len(block.PrevBlockHash) == 0 {
            break
        }
    }
}
```

这一块很像我们之前我们有的那个。唯一的不同就是我们现在用 **BlockchainIterator** 去迭代区块链上的区块。

那么，不要忘了要把 **main** 函数里对应的地方改掉：

```go
func main() {
    bc := NewBlockchain()
    defer bc.db.Close()

    cli := CLI{bc}
    cli.Run()
}
```

注意一下新的区块会被创建出来，无论命令行的参数中是否提供这样的参数。

搞定咯！现在来确认一下它会不会如我们期望的一样工作：

```text
$ blockchain_go printchain
No existing blockchain found. Creating a new one...
Mining the block containing "Genesis Block"
000000edc4a82659cebf087adee1ea353bd57fcd59927662cd5ff1c4f618109b

Prev. hash:
Data: Genesis Block
Hash: 000000edc4a82659cebf087adee1ea353bd57fcd59927662cd5ff1c4f618109b
PoW: true

$ blockchain_go addblock -data "Send 1 BTC to Ivan"
Mining the block containing "Send 1 BTC to Ivan"
000000d7b0c76e1001cdc1fc866b95a481d23f3027d86901eaeb77ae6d002b13

Success!

$ blockchain_go addblock -data "Pay 0.31337 BTC for a coffee"
Mining the block containing "Pay 0.31337 BTC for a coffee"
000000aa0748da7367dec6b9de5027f4fae0963df89ff39d8f20fd7299307148

Success!

$ blockchain_go printchain
Prev. hash: 000000d7b0c76e1001cdc1fc866b95a481d23f3027d86901eaeb77ae6d002b13
Data: Pay 0.31337 BTC for a coffee
Hash: 000000aa0748da7367dec6b9de5027f4fae0963df89ff39d8f20fd7299307148
PoW: true

Prev. hash: 000000edc4a82659cebf087adee1ea353bd57fcd59927662cd5ff1c4f618109b
Data: Send 1 BTC to Ivan
Hash: 000000d7b0c76e1001cdc1fc866b95a481d23f3027d86901eaeb77ae6d002b13
PoW: true

Prev. hash:
Data: Genesis Block
Hash: 000000edc4a82659cebf087adee1ea353bd57fcd59927662cd5ff1c4f618109b
PoW: true
```

*(哎呀，感觉可以开酒了哎~)*

## 最后

下一步我们会实现地址，钱包，(可能还有)交易。来继续吧！

*其他的文章请返回首页查看.*

*TODO: 添加文章链接*
