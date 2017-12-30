---
layout: post
title: 用 golang 实现区块链系列一 | 基本原型
tags: blockchain code
---

> 原文地址： [Building Blockchain in Go. Part 1: Basic Prototype](https://jeiwan.cc/posts/building-blockchain-in-go-part-1/)

## 介绍

区块链是二十一世纪依赖最具革命性的科技之一，它仍在发展中，并且其潜力仍未被充分认知。本质上，区块链只是一个分布式的记录数据库，但使它和其他数据库不一样的是，他并不是一个私有数据库，而是公开的。每个使用它的人都可以完整或者部分地拷贝出。并且一条新的记录只能在被数据库的其他管理员者同意的情况下才能被加入。区块链也使得加密货币和智能合约成为可能。

本系列文章将会构建一个基于简单区块链实现的简单加密货币。

## Block

我们从 "区块链" 的 "区块" 开始讲起。在区块链中， block 存储着有价值的信息。例如，比特币区块存储着交易信息，这是加密货币的本质。除此之外，区块还包含着一些技术信息，像是版本号，当前时间戳，还有上一个区块的 hash 值。
在本文中，我们不回去着手实现一个区块链中表述的区块，也不是比特币标准的区块，而是一个它的简化版本。它只会包含着最重要的信息。长得像是这样：

```go
type Block struct {
    Timestamp     int64
    Data          []byte
    PrevBlockHash []byte
    Hash          []byte
}
```

**Timestamp** 是当前时间戳(区块被创建时), **Data** 是区块中所包含的有实际价值的信息, **PrevBlockHash** 是存储着上个区块的 hash，而 **Hash** 是当前区块的 hash 。在比特币标准中， **Timestamp**, **PrevBlockHash** 和 **Hash** 是区块头，它是一个分离的数据结构，而且 transactions(我们的例子中是**Data**)也是一个分离的数据结构。我们在这边简化处理，合在一起了。

那么怎么取算 hash 值呢？ hash 的计算方式在区块链中是一个非常重要的特性，这个特性使得区块链安全。计算 hash 值是一个难以计算的操作。在很快的电脑上也要花费大量的时间(这也是为什么人们买强大的 GPU 去挖比特币)。添加新的区块很困难是一个很有意思的架构设计，它阻止了添加之后的修改。我们将在以后的文章中去讨论和实现这个机制。

现在，我们先弄几个区块字段，把它们放在一起，再算个 SHA-256 的哈希在拼好的数据上。来写一个 **SetHash** 的方法吧：

```go
func (b *Block) SetHash() {
    timestamp := []byte(strconv.FormatInt(b.Timestamp, 10))
    headers := bytes.Join([][]byte{b.PrevBlockHash, b.Data, timestamp}, []byte{})
    hash := sha256.Sum256(headers)

    b.Hash = hash[:]
}
```

下一步，遵循 Go 语言的惯例，我们实现一个方法来简化区块的创建：

```go
func NewBlock(data string, prevBlockHash []byte) *Block {
    block := &Block{time.Now().Unix(), []byte(data), prevBlockHash, []byte{}}
    block.SetHash()
    return block
}
```

好啦，这就是区块啦！

## 区块链

现在，我们来实现一个简单的区块链。区块链的本质是保存着确定的数据结构的数据库。它是一个有序的，尾部相连的链表。这就意味着区块是有条理地被存储的，每个区块连接着前一个区块。这种结构就可以很快的获取链上的最后一个区块，而且可以很高效地通过 hash 获取区块。

在 Go 语言中，这种结构可以通过使用 array 和 map 来实现：数组可以保存着有序 hash (Go 语言中，数组是有序的)， map 结构可以保存 hash -> block 的匹配信息。但在我们的区块链原型中，我们只会使用一个数组，因为我们暂时并不需要通过 hash 获取区块信息。

```go
type Blockchain struct {
    blocks []*Block
}
```

这就是我们的第一个区块链啦，难以想象竟然会这么简单 😉

现在来赋予它添加区块的能力吧：

```go
func (bc *Blockchain) AddBlock(data string) {
    prevBlock := bc.blocks[len(bc.blocks)-1]
    newBlock := NewBlock(data, prevBlock.Hash)
    bc.blocks = append(bc.blocks, newBlock)
}
```

是。。。这样吗？

要添加一个新的区块，我们就需要一个已存在区块，然而我们的区块链上还没有一个区块！所以，在任何一个区块链中，必须有至少一个区块，这个区块，要是链上的第一个区块，他被称为创始区块(**genesis block**)。现在我们来实现一个方法去创建这样一个区块：

```go
func NewGenesisBlock() *Block {
    return NewBlock("Genesis Block", []byte{})
}
```

现在我们可以实现一个带有创始区块的区块链的方法了：

```go
func NewBlockchain() *Blockchain {
    return &Blockchain{[]*Block{NewGenesisBlock()}}
}
```

现在来去人一下区块链是否正常工作了：

```go
func main() {
    bc := NewBlockchain()

    bc.AddBlock("Send 1 BTC to Ivan")
    bc.AddBlock("Send 2 more BTC to Ivan")

    for _, block := range bc.blocks {
        fmt.Printf("Prev. hash: %x\n", block.PrevBlockHash)
        fmt.Printf("Data: %s\n", block.Data)
        fmt.Printf("Hash: %x\n", block.Hash)
        fmt.Println()
    }
}
```

输出：

```text
Prev. hash:
Data: Genesis Block
Hash: aff955a50dc6cd2abfe81b8849eab15f99ed1dc333d38487024223b5fe0f1168

Prev. hash: aff955a50dc6cd2abfe81b8849eab15f99ed1dc333d38487024223b5fe0f1168
Data: Send 1 BTC to Ivan
Hash: d75ce22a840abb9b4e8fc3b60767c4ba3f46a0432d3ea15b71aef9fde6a314e1

Prev. hash: d75ce22a840abb9b4e8fc3b60767c4ba3f46a0432d3ea15b71aef9fde6a314e1
Data: Send 2 more BTC to Ivan
Hash: 561237522bb7fcfbccbc6fe0e98bbbde7427ffe01c6fb223f7562288ca2295d1
```

这就成了！

## 最后

我们创建了一个超级简单的区块链原型：它只是一个包含有区块的数组，每个区块和前一个连接起来。真实的区块链远比这个要复杂。在我们的区块链中添加一个区块很快，也很简单，不过在真实的区块链中，添加一个新的区块需要费一番功夫：一是需要在添加区块前做一些复杂的计算来获取添加的权限(这个过程被称为 **工作量证明**)。而且，区块链并非是一个单节点决策的东西，它是一个分布式数据库。所以，一个新的区块必须被网络上的其他参与者确认和接受(这个过程被称作 **一致性**)，我们的区块链上到现在还没有交易信息！

之后的文章我们会搞定这些功能。

*其他的文章请返回首页查看.*

*TODO: 添加文章链接*
