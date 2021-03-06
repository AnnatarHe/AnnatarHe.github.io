---
layout: post
title: 用 golang 实现区块链系列六 | 交易2
tags: blockchain code
---

> 原文地址: [Building Blockchain in Go. Part 6: Transactions 2](https://jeiwan.cc/posts/building-blockchain-in-go-part-6/)

## 介绍

在这个系列的早期，我说过区块链就是个分布式数据库。回到那个时候，我们决定跳过 "分布式" 的部分而专注于 "数据库" 部分。到现在为止，我们已经实现了区块链数据库的大部分东西。这这篇文章中，我们会搞定之前跳过的一部分的机制，而在下篇文章中我们会着手实现区块链的分布式特性。

之前的文章：

1. [基本原型]({% post_url 2017-12-29-building-blockchain-in-go-part-1-basic-prototype %})
2. [工作量证明]({% post_url 2017-12-30-building-blockchain-in-go-part-2-proof-of-work %})
3. [数据持久化和命令行]({% post_url 2017-12-30-building-blockchain-in-go-part-3-persistence-and-cli%})
4. [交易1]({% post_url 2018-01-01-build-blockchain-in-go-part-4-transactions-1%})
5. [地址]({% post_url 2018-01-02-building-blockchain-in-go-part-5-addresses %})


> 这个部分的介绍有重大的代码变化，所以没必要全都解释清楚，请参考 [这个页面](https://github.com/Jeiwan/blockchain_go/compare/part_5...part_6#files_bucket) 了解自上篇文章以来的变化

## 奖励

我们上篇文章跳过了一个小问题，那就是挖坑奖励。我们已经为实现它准备好了所有的部分。

奖励只是一个币基交易。当一个挖矿节点开始挖一个新的区块时，它会从队列中获取交易信息，并准备一个币基交易。这个币基交易唯一的出账包含着矿工的公钥哈希。

实现奖励机制就是很简单地更新 **send** 命令：

{% highlight go %}
func (cli *CLI) send(from, to string, amount int) {
    ...
    bc := NewBlockchain()
    UTXOSet := UTXOSet{bc}
    defer bc.db.Close()

    tx := NewUTXOTransaction(from, to, amount, &UTXOSet)
    cbTx := NewCoinbaseTX(from, "")
    txs := []*Transaction{cbTx, tx}

    newBlock := bc.MineBlock(txs)
    fmt.Println("Success!")
}
{% endhighlight %}

在我们的实现中，创建交易挖到新区块的人会获得奖励。

## UTXO 集

在 [第三部分：持久化和命令行](/) 我们研究了比特币内核在数据库中存储的方式。那时候说了 区块被存在 **blocks** 数据库中，交易出账被存在 **chainstate** 数据库中。来回忆一下 **chainstate** 的数据结构吧：

1. **'c' + 32 字节的交易哈希 -> 交易的未使用交易出账记录**
2. **'B' -> 32 字节区块哈希： 数据库表示的未使用交易出账的区块哈希**

在那篇文章中，我们已经实现了交易，但我们还没有用 **chainstate** 去保存出账。所以，我们现在就要开始去搞一下了。

**chainstate** 并不存储交易。而是存储名为 UTXO 的集合，或者说是未使用出账的集合。除此之外，他还存储"数据库表示的未使用交易出账的区块哈希"，这个部分我们会暂时省略，因为我们并不使用区块的高度(不过下篇文章会实现)。

那么，我们为什么这么想要 UTXO 集合呢？

回忆一下之前实现的 **Blockchain.FindUnspentTransactions** 方法:

{% highlight go %}
func (bc *Blockchain) FindUnspentTransactions(pubKeyHash []byte) []Transaction {
    ...
    bci := bc.Iterator()

    for {
        block := bci.Next()

        for _, tx := range block.Transactions {
            ...
        }

        if len(block.PrevBlockHash) == 0 {
            break
        }
    }
    ...
}
{% endhighlight %}

这个方法会找到那些未被使用出账的交易。由于交易被存在区块中，所以不得不遍历区块链上的每个区块，来检查每笔交易。到 2017 年 9 月 18 号为止，比特币已经有了 485,860 个区块，整个数据库也会占用 140Gb 以上的硬盘空间。这意味着不得不去运行所有节点去检查交易。此外，检查交易会需要遍历太多的区块。

问题的解决方案是要有一个只存有未使用出账的索引保存下来，这就是 UTXO 集合要干的事情：这是一个从所有区块链交易中构建的缓存(确实需要遍历所有的区块，但好在只遍历一次)，随后被用来计算余额，验证新的交易。在 2017 年 9 月，这个 UTXO 几个占用大概 2.7 Gb 的空间。

好啦，接下来想想为了实现 UTXO 集合我们得做哪些改变。当前，下面的这些方法被用来查找交易：

1. **Blockchain.FindUnspentTransactions** —— 找寻未使用出账交易的主函数。这也是遍历所有区块的地方。
2. **Blockchain.FindSpendableOutputs** —— 当一个新的交易被创建的时候会调用这个方法。如果要找到了足够多的持有需要金额的数量的出账。要用 **Blockchain.FindUnspentTransactions**
3. **Blockchain.FindUTXO** 从公钥哈希中找到未使用出账。在获取余额的时候被调用。用到了 **Blockchain.FindUnspentTransactions**
4. **Blockchain.FindTransaction** —— 通过 ID 在区块链上找到交易。需要遍历所有区块，直到找到为止。

就像你知道的那样，所有的方法都要遍历数据库里的区块，但是我们没办法一下子都改过来，因为 UTXO 集并不保存所有的交易，只保存那些未出账的交易。所以不适用于 **Blockchain.FindTransaction**

所以我们要改下面的这些方法：

1. **Blockchain.FindUTXO** — 通过遍历区块得到所有未使用的出账
2. **UTXOSet.Reindex** — 使用 **FindUTXO** 去找到未使用出账， 并把它们存到数据库里。这是缓存发生的地方。
3. **UTXOSet.FindSpendableOutputs** – 和 **Blockchain.FindSpendableOutputs** 很像, 不过用的是 UTXO 集合。
4. **UTXOSet.FindUTXO** – 和 **Blockchain.FindUTXO** 很像, 不过用的是 UTXO 集合。
5. **Blockchain.FindTransaction** 和之前一样。

那么从现在开始，两个很常用的方法会用到缓存了！开始写代码：

{% highlight go %}
type UTXOSet struct {
    Blockchain *Blockchain
}
{% endhighlight %}

我们将用单个数据库，不过保存 UTXO 集合到另一个桶(bucket)里。这样的话， **UTXO 集合** 会和 **Blockchain** 相结合。

{% highlight go %}
func (u UTXOSet) Reindex() {
    db := u.Blockchain.db
    bucketName := []byte(utxoBucket)

    err := db.Update(func(tx *bolt.Tx) error {
        err := tx.DeleteBucket(bucketName)
        _, err = tx.CreateBucket(bucketName)
    })

    UTXO := u.Blockchain.FindUTXO()

    err = db.Update(func(tx *bolt.Tx) error {
        b := tx.Bucket(bucketName)

        for txID, outs := range UTXO {
            key, err := hex.DecodeString(txID)
            err = b.Put(key, outs.Serialize())
        }
    })
}
{% endhighlight %}

这个方法初始化创建了一个 UTXO 集合。首先，如果已经存在了 bucket，就把它删掉。然后获取区块链上的所有未使用输出，最后把出账存到 bucket 里面去。

**Blockchain.FindUTXO** 和 **Blockchain.FindUnspentTransactions** 很像，但现在它会返回一个 **TransactionID → TransactionOutputs** 的映射 map。

现在，UTXO 集合可以被用来提币了：

{% highlight go %}
func (u UTXOSet) FindSpendableOutputs(pubkeyHash []byte, amount int) (int, map[string][]int) {
    unspentOutputs := make(map[string][]int)
    accumulated := 0
    db := u.Blockchain.db

    err := db.View(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(utxoBucket))
        c := b.Cursor()

        for k, v := c.First(); k != nil; k, v = c.Next() {
            txID := hex.EncodeToString(k)
            outs := DeserializeOutputs(v)

            for outIdx, out := range outs.Outputs {
                if out.IsLockedWithKey(pubkeyHash) && accumulated < amount {
                    accumulated += out.Value
                    unspentOutputs[txID] = append(unspentOutputs[txID], outIdx)
                }
            }
        }
    })

    return accumulated, unspentOutputs
}
{% endhighlight %}

或者用来确认余额：

{% highlight go %}
func (u UTXOSet) FindUTXO(pubKeyHash []byte) []TXOutput {
    var UTXOs []TXOutput
    db := u.Blockchain.db

    err := db.View(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(utxoBucket))
        c := b.Cursor()

        for k, v := c.First(); k != nil; k, v = c.Next() {
            outs := DeserializeOutputs(v)

            for _, out := range outs.Outputs {
                if out.IsLockedWithKey(pubKeyHash) {
                    UTXOs = append(UTXOs, out)
                }
            }
        }

        return nil
    })

    return UTXOs
}
{% endhighlight %}

这些是 **Blockchain** 里面相关方法略微调整过的版本。这些 **Blockchain** 方法不再被需要了。

有了 UTXO 集合意味着我们的数据(交易信息)现在被分开存储了：实际交易信息被存在区块链中，未被花费的出账被存在 UTXO 集中。这样的分离需要有很强力的同步机制，因为我们想要 UTXO 集总是最新的，而且总是最近的交易出账。但是我们不希望每一个区块被挖出来都要重新索引一遍数据，因为这会太经常访问区块链，这正是我们要避免的情况。所以，我们需要一个可以更新 UTXO 集合的机制：

{% highlight golang %}
func (u UTXOSet) Update(block *Block) {
    db := u.Blockchain.db

    err := db.Update(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(utxoBucket))

        for _, tx := range block.Transactions {
            if tx.IsCoinbase() == false {
                for _, vin := range tx.Vin {
                    updatedOuts := TXOutputs{}
                    outsBytes := b.Get(vin.Txid)
                    outs := DeserializeOutputs(outsBytes)

                    for outIdx, out := range outs.Outputs {
                        if outIdx != vin.Vout {
                            updatedOuts.Outputs = append(updatedOuts.Outputs, out)
                        }
                    }

                    if len(updatedOuts.Outputs) == 0 {
                        err := b.Delete(vin.Txid)
                    } else {
                        err := b.Put(vin.Txid, updatedOuts.Serialize())
                    }

                }
            }

            newOutputs := TXOutputs{}
            for _, out := range tx.Vout {
                newOutputs.Outputs = append(newOutputs.Outputs, out)
            }

            err := b.Put(tx.ID, newOutputs.Serialize())
        }
    })
}
{% endhighlight %}

这个方法看起来很多代码，不过它做事的方式却很直接。当一个新的区块被发掘的，UTXO 集合就应该被更新。更新意味着要移除已花费的出账，从新的已被挖掘到的交易中添加新的出账。如果一笔交易的出账被删掉了，再没有出账了，它也会被移除。很简单。

现在来在需要 UTXO 集合的地方用上吧：

{% highlight golang %}
func (cli *CLI) createBlockchain(address string) {
    ...
    bc := CreateBlockchain(address)
    defer bc.db.Close()

    UTXOSet := UTXOSet{bc}
    UTXOSet.Reindex()
    ...
}
{% endhighlight %}

一条新的区块链被创建的时候，才需要重新索引。现在，这里是唯一一个会用到 **Reindex** 的地方，虽然看起来是多余的。在区块链开始的时候，这里只有一个区块，也只有一笔交易， 可以用**Update** 替换掉它。不过我们将来可能会需要这个重新索引的机制。

{% highlight golang %}
func (cli *CLI) send(from, to string, amount int) {
    ...
    newBlock := bc.MineBlock(txs)
    UTXOSet.Update(newBlock)
}
{% endhighlight %}

UTXO 集合会在一个新的区块被发掘后得到更新。

来确认一下有没有正常工作：

{% highlight text %}
$ blockchain_go createblockchain -address 1JnMDSqVoHi4TEFXNw5wJ8skPsPf4LHkQ1
00000086a725e18ed7e9e06f1051651a4fc46a315a9d298e59e57aeacbe0bf73

Done!

$ blockchain_go send -from 1JnMDSqVoHi4TEFXNw5wJ8skPsPf4LHkQ1 -to 12DkLzLQ4B3gnQt62EPRJGZ38n3zF4Hzt5 -amount 6
0000001f75cb3a5033aeecbf6a8d378e15b25d026fb0a665c7721a5bb0faa21b

Success!

$ blockchain_go send -from 1JnMDSqVoHi4TEFXNw5wJ8skPsPf4LHkQ1 -to 12ncZhA5mFTTnTmHq1aTPYBri4jAK8TacL -amount 4
000000cc51e665d53c78af5e65774a72fc7b864140a8224bf4e7709d8e0fa433

Success!

$ blockchain_go getbalance -address 1JnMDSqVoHi4TEFXNw5wJ8skPsPf4LHkQ1
Balance of '1F4MbuqjcuJGymjcuYQMUVYB37AWKkSLif': 20

$ blockchain_go getbalance -address 12DkLzLQ4B3gnQt62EPRJGZ38n3zF4Hzt5
Balance of '1XWu6nitBWe6J6v6MXmd5rhdP7dZsExbx': 6

$ blockchain_go getbalance -address 12ncZhA5mFTTnTmHq1aTPYBri4jAK8TacL
Balance of '13UASQpCR8Nr41PojH8Bz4K6cmTCqweskL': 4
{% endhighlight %}

棒棒的！**1JnMDSqVoHi4TEFXNw5wJ8skPsPf4LHkQ1** 这个地址接收到了三次奖励：

1. 一次来自于创始区块
2. 一次来自于挖掘区块 **0000001f75cb3a5033aeecbf6a8d378e15b25d026fb0a665c7721a5bb0faa21b**
3. 一次来自于挖掘区块 **000000cc51e665d53c78af5e65774a72fc7b864140a8224bf4e7709d8e0fa433**

## Merkle 树(Merkle Tree)

这篇文章中还有一个关于性能的机制要谈一下。

我们之前说过，整个比特币的数据库(也是区块链)占用了超过 140Gb 的硬盘空间。由于比特币的去中心化的本质，网络中的每个节点必须独立自足，也就是说每个节点必须保存着区块链的完整副本。随着更多的人使用比特币，这条准则越来越难以执行：并不是每个人都要运行所有节点。由于接电视网络的充分参与者，它们就有这样的责任：它们必须验证交易与区块。而且需要有一定的互联网流量来和其他节点交互，下载新的区块。

在中本聪公布的[最初的比特币论文中](https://bitcoin.org/bitcoin.pdf)，针对这种情况有一种解决方案：简单支付验证(Simplified Payment Verification, SPV)。SPV 是一个比特币的轻量节点，这种节点不会下载整个区块链，也**不会验证区块和交易**。而是找到区块中的交易(去验证支付)然后链接到全量节点仅取回所需的数据。这种机制允许仅允许一个全量节点就可以有多个轻量级钱包节点。

为了让 SPV 得以实现，就必须要有一种方式来确认区块中是否包含有某笔交易而不用下载整个区块。这就把 Merkle 树带到了这个场景中。

Merkle 树被比特币用来获取交易的哈希，它被存在区块头中，而且被工作量证明系统所引用。直到现在，我们连接了区块中每笔交易的哈希，然后用 **SHA-256** 跑了一下。这也是一种获取区块交易独特特征的一种方式，但是它并没有 Merkle 树的优势。

我们来看一下 Merkle 树：

![merkle tree example](https://jeiwan.cc/images/merkle-tree-diagram.png)

一颗 Merkle 树是对每个区块构建的，由叶节点(树的底部)开始的，叶节点就是交易哈希(比特币使用两个 **SHA256** 哈希)。叶节点的数量必须是偶数个，但并不是每个区块都有偶数笔交易。如果有了单数笔交易的情况发生了，最后一笔交易则重复创建(只是在 Merkle 树中，并非在区块链中！)。

从低到上，叶节点被成对组织到一起，它们的哈希被链接到一起，一个新的哈希就从被链接的哈希中生成。这个新的哈希形成新的树节点。这个工作一直重复，直到只有一个节点，它被成为根节点。这个根哈希随后就被用来做交易的独特标志，它被存在区块头中，也被用到工作量证明系统中。

Merkle 树的优点就在于一个节点可以验证某笔交易中的成员而不用下载整个区块。只要一个交易哈希，一个 Merkle 树的根节点，还有 Merkle 路径就可以了。

好了，写点儿代码：

{% highlight golang %}
type MerkleTree struct {
    RootNode *MerkleNode
}

type MerkleNode struct {
    Left  *MerkleNode
    Right *MerkleNode
    Data  []byte
}
{% endhighlight %}

先从数据结构开始。每个 **MerkleNode** 都有数据，也链接到他们的分支，**MerkleTree** 世界上就是链接到下个节点的根节点。它们又链接到更远的节点。

我们首先来创建一个新的节点吧：

{% highlight golang %}
func NewMerkleNode(left, right *MerkleNode, data []byte) *MerkleNode {
    mNode := MerkleNode{}

    if left == nil && right == nil {
        hash := sha256.Sum256(data)
        mNode.Data = hash[:]
    } else {
        prevHashes := append(left.Data, right.Data...)
        hash := sha256.Sum256(prevHashes)
        mNode.Data = hash[:]
    }

    mNode.Left = left
    mNode.Right = right

    return &mNode
}
{% endhighlight %}

每个节点都包含一些数据。当一个节点为叶节点时，数据就被从外部传入(我们的场景中是一笔被序列化的交易)。当一个节点是被链接到其他节点的时候，它会从叶节点中拿数据，连接它们，然后哈希。

{% highlight golang %}
func NewMerkleTree(data [][]byte) *MerkleTree {
    var nodes []MerkleNode

    if len(data)%2 != 0 {
        data = append(data, data[len(data)-1])
    }

    for _, datum := range data {
        node := NewMerkleNode(nil, nil, datum)
        nodes = append(nodes, *node)
    }

    for i := 0; i < len(data)/2; i++ {
        var newLevel []MerkleNode

        for j := 0; j < len(nodes); j += 2 {
            node := NewMerkleNode(&nodes[j], &nodes[j+1], nil)
            newLevel = append(newLevel, *node)
        }

        nodes = newLevel
    }

    mTree := MerkleTree{&nodes[0]}

    return &mTree
}
{% endhighlight %}

当一个树被创建出，第一件事就是保证叶节点必须为偶数个。随后，**data**(被序列化的交易数组)被转化到树的叶节点中，这棵树也会从这些叶节点中成长。

现在，改一下 **Block.HashTransactions**，它被用到了工作量证明系统中来保证交易哈希的一致：

{% highlight golang %}
func (b *Block) HashTransactions() []byte {
    var transactions [][]byte

    for _, tx := range b.Transactions {
        transactions = append(transactions, tx.Serialize())
    }
    mTree := NewMerkleTree(transactions)

    return mTree.RootNode.Data
}
{% endhighlight %}

首先，交易被序列化了(用 **encoding/gob**)，然后它们被用来构建一个 Merkle 树。树的根节点将会被用作区块交易的独特 ID。

## P2PKH

在细节上还有一点要说一下。

你记得吗，在比特币种有一种脚本(*Script*)编程语言，它被用来锁定交易出账：交易入账提供数据去锁定出账。这个语言非常简单，语言的代码也就仅仅是数据和操作符的排列而已。看下这个例子：

{% highlight text %}
5 2 OP_ADD 7 OP_EQUAL
{% endhighlight %}

**5**, **2**, 和 **7** 都是数据. **OP_ADD** 和 **OP_EQUAL** 是操作符。*Script* 的代码是从左至右执行的：数据的每一块都被塞进栈里然后下个操作会会被栈顶的元素调用。*Script*的栈只是一个简单的 FILO(先入后出)内存存储：栈中的第一个进去的元素会被最后一个拿走，之后进来的每个元素都是放到前一个的上面。

来分解一下上面这个脚本执行的步骤吧：

1. 栈：空。脚本：**5 2 OP_ADD 7 OP_EQUAL**
2. 栈：**5**。脚本：**2 OP_ADD 7 OP_EQUAL**
3. 栈：**5 2**。脚本：**OP_ADD 7 OP_EQUAL**
4. 栈：**7**。脚本：**7 OP_EQUAL**
5. 栈：**7 7**。脚本：**OP_EQUAL**
6. 栈：**true**。脚本：空

**OP_ADD**拿走栈上的两个元素，求和，然后把和再塞进栈里。**OP_EQUAL**从栈里拿两个元素，然后比较： 如果一样就把**true** 推到栈里，不一样就把**false**推进去。脚本执行的结果就是栈顶的值：在我们的场景下，它是 **true**，这就意味着脚本正常地成功执行了。

现在来看一眼比特币中执行支付的脚本：

{% highlight text %}
<signature> <pubKey> OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
{% endhighlight %}

这个脚本被称作*付款给公钥哈希(Pay to Public Key Hash)*(P2PKH)，这是比特币中最常用的脚本。它就是字面上的给公钥哈希付款的意思，它会用一个确定的公钥锁币。这是 **比特币支付的核心**：无账户，两者之间无资金交互；只有脚本去确认提供的数字签名和公钥是正确的。

此脚本实质上存在两个部分：

1. 第一块。**signature**, **pubKey**存在入账的 **ScriptSig** 字段中。
2. 第二部分。**OP_DUP OP_HASH160 pubKeyHash OP_EQUALVERIFY OP_CHECKSIG**存在出账的 **ScriptPubKey** 中。

所以，它是定义解锁逻辑的出账，也是提供数据区解锁出账的入账。来执行以下这个脚本：

1
栈: empty
脚本: signature pubKey OP_DUP OP_HASH160 pubKeyHash OP_EQUALVERIFY OP_CHECKSIG

2
栈: signature
脚本: pubKey OP_DUP OP_HASH160 pubKeyHash OP_EQUALVERIFY OP_CHECKSIG

3
栈: signature pubKey
脚本: OP_DUP OP_HASH160 pubKeyHash OP_EQUALVERIFY OP_CHECKSIG

4
栈: signature pubKey pubKey
脚本: OP_HASH160 pubKeyHash OP_EQUALVERIFY OP_CHECKSIG

5
栈: signature pubKey pubKeyHash
脚本: pubKeyHash OP_EQUALVERIFY OP_CHECKSIG

6
栈: signature pubKey pubKeyHash pubKeyHash
脚本: OP_EQUALVERIFY OP_CHECKSIG

7
栈: signature pubKey
脚本: OP_CHECKSIG

8
栈: **true** 或 **false**. Script: empty.

**OP_DUP** 复制栈顶的一个元素. **OP_HASH160** 拿走栈顶的元素，并用 **RIPEMD160** 哈希一下; 再把结果塞到栈里. **OP_EQUALVERIFY** 对比栈顶的两个元素，如果不一样就中断脚本的执行. **OP_CHECKSIG** 通过哈希交易，还有 **signature** 和 **pubKey** 来验证交易的签名. 后面的一个操作颇为复杂: 它做了一个简版的交易副本, 对它哈希(因为这是被签名的交易哈希), 然后用提供的 **signature** 和 **pubKey** 验证签名.

有了这样的脚本语言就允许比特币可以成为智能合约平台：这种语言是的除了穿衣单个秘钥之外的其他交易方式成为了可能。例如，

## 结论

搞定了！我们已经几乎实现了基于区块链的数字加密货币所有的重要特性。我们有了区块链，地址，挖坑和交易。但是仍然有一个事情会让这些机制充满活力，并使比特币成为一个全球性的系统：一致性。在下篇文章中，我们会实现区块链中的 "去中心化" 特性。敬请关注！

### Links

1. [完整代码](https://github.com/Jeiwan/blockchain_go/tree/part_6)
2. [UTXO 集](https://en.bitcoin.it/wiki/Bitcoin_Core_0.11_(ch_2):_Data_Storage#The_UTXO_set_.28chainstate_leveldb.29)
3. [Merkle Tree](https://en.bitcoin.it/wiki/Protocol_documentation#Merkle_Trees)
4. [Script](https://en.bitcoin.it/wiki/Script)
5. [“Ultraprune” Bitcoin Core commit](https://github.com/sipa/bitcoin/commit/450cbb0944cd20a06ce806e6679a1f4c83c50db2)
6. [UTXO set statistics](https://statoshi.info/dashboard/db/unspent-transaction-output-set)
7. [比特币与智能合约](https://medium.com/@maraoz/smart-contracts-and-bitcoin-a5d61011d9b1)
8. [为何每个比特币用户都应该理解"SPV安全"](https://medium.com/@jonaldfyookball/why-every-bitcoin-user-should-understand-spv-security-520d1d45e0b9)

* [基本原型]({% post_url 2017-12-29-building-blockchain-in-go-part-1-basic-prototype %})
* [工作量证明]({% post_url 2017-12-30-building-blockchain-in-go-part-2-proof-of-work %})
* [持久化与命令行]({% post_url 2017-12-30-building-blockchain-in-go-part-3-persistence-and-cli %})
* [交易 1]({% post_url 2018-01-01-build-blockchain-in-go-part-4-transactions-1 %})
* [地址]({% post_url 2018-01-02-building-blockchain-in-go-part-5-addresses %})
* [交易 2]({% post_url 2018-01-06-building-blockchain-in-go-part-6-transactions-2 %})
* [网络]({% post_url 2018-01-12-building-blockchain-go-part-7-network %})

