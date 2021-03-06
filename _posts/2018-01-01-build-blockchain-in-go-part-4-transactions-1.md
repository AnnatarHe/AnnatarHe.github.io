---
layout: post
title: 用 golang 实现区块链系列四 | 交易 1
tags: blockchain code
---

> 原文链接： [Building Blockchain in Go. Part 4: Transactions 1](https://jeiwan.cc/posts/building-blockchain-in-go-part-4/)

## 介绍

交易是比特币的核心，而且区块链的唯一目标就是安全可靠地存储交易信息，而且没人可以在它们被创建之后修改它们。今天我们要开始实现交易。但是由于这是一个比较大的话题，因此我会分成两个部分：这一部分，我们会实现交易的通用机制，在第二部分会继续完成细节部分。

由于代码变化会比较大，所以没有必要全部都解释一下，你可以在[这里](https://github.com/Jeiwan/blockchain_go/compare/part_3...part_4#files_bucket)找到所有的变化。

## 没有勺子

如果你曾经做个 web 应用，为了实现支付系统，可能会在数据库里创造这么几个表： **accounts** 和 **transactions**。账户表会存储用户信息，包括个人信息和余额，另一个交易标会存商品中关于钱从哪个账户转给另一个账户的信息。比特币中，支付完完全全是另一种方式。这里：

1. 没有账户
2. 没有余额
3. 没有地址
4. 没有币
5. 没有发送者和接受者

因为区块链是一个公共的，开放的数据库，我们不会想去存一些关于是谁的钱包的这种敏感信息。钱不会存在账户里。交易并不会把钱从一个地址转到另一个地址里。也没有字段或者属性去标记账户余额。这里只有交易。那么交易的内在是什么呢？

## 比特币的交易

一笔交易就是入账和出账的结合：

{% highlight golang %}
type Transaction struct {
    ID   []byte
    Vin  []TXInput
    Vout []TXOutput
}
{% endhighlight %}

一笔新的交易入账依赖于上次交易的出账(这里其实有个例外，我们一会儿再谈)。出账就是钱到底存在哪里。下面的示意图演示了交易的内在联系：

![transactions diagram](https://jeiwan.cc/images/transactions-diagram.png)

 有几点需要注意一下：

 1. 有出账并非和入账相连。
 2. 一次交易中，入账可以参考多笔交易的出账。
 3. 一个入账必须依赖于一笔出账。

概览整篇文章。我们用了类似于这样的词 "钱", "币"，"花", "发", "账户"，等。但仍然对比特币没有概念。交易只是用只能被锁定它对的人解锁的脚本锁定的一些值，

## 交易出账

先看一眼出账的数据结构：

{% highlight golang %}
type TXOutput struct {
    Value        int
    ScriptPubKey string
}
{% endhighlight %}

事实上，这是存储 "币(coins)" 的出账(注意一下上面的 **Value** 字段)。而且，存储意味着迷一样的锁住，所在 **ScriptPubKey** 里。深入其中的话，比特币使用了一种叫做 *Script* 的脚本语言，它一般被用来定义出账的锁定和解锁逻辑。这种语言十分的原始(是故意这么做的，为了避免可能存在的入侵和滥用)，但我们不会在细节上去讨论它。你可以在 [这里](https://en.bitcoin.it/wiki/Script)找到关于它的细节解释。

> 比特币中，*value* 字段存储着 *satoshis* 的数量，并不是比特币的数量。一个 *satoshi* 是一亿个比特币分之一(0.00000001 BTC)，所以这是比特币货币中的最小单位(像是分)。

由于我们并没有实现地址这个功能，我们暂时会避免整个 scripting 相关的逻辑。 **ScriptPubKey** 将会存储一个任意字符串(用户称之为钱包地址).

> 顺便说一下，拥有这种脚本化语言同时意味着比特币也可以成为智能合约平台

关于出账的一个非常重要事情是他们不可再分，这就意味着你不能用它的一部分。当一个出账被新的交易所引用，它用的其实是整个。而且如果这个值比所要求的要大，会生成一个退费，并发回给发送者。这和现实生活中的情况很相似。当你付款的时候，你买一个 1 块钱的东西，给了老板 5 块钱，那么你会收到 4 块钱的找零。

## 交易入账

这是入账的数据结构：

{% highlight golang %}
type TXInput struct {
    Txid      []byte
    Vout      int
    ScriptSig string
}
{% endhighlight %}

之前我们就提到了入账会引用前一个出账： **Txid** 就存储着上一个交易的 ID，**Vout** 存储着交易中的出账索引。**ScriptSig** 是一个提供在出账中使用的 **ScriptPubKey** 数据的脚本。如果数据时正确的，出账可以被解锁，这个值也可以被用来生成新的出账；如果不对，出账就不能被入账所引用。这种机制就保障了用户不能花别人的钱。

跟上面一样，由于我们暂时还没有实现地址，ScriptSig 讲存储一个用户定义的钱包地址的任意值。我们会在下篇文章里实现公钥和签名认证。

来总结一下。出账就是 "币(coins)" 存在哪里。每个出账都带着一个解锁脚本，它决定了解锁出账的逻辑。每个新的交易都必须要有至少一个入账和出账。一个入账会引用上个交易的出账和数据(**ScriptSig** 字段)被用来在出账中解锁脚本去解锁并使用其中的值创建新的出账。

那么问题来了，是先有入账还是先有出账？

## 蛋

在比特币中，先有蛋，再有鸡。入账引用出账的逻辑是典型的 "先有蛋还是先有鸡" 的问题：入账产生出账，出账使得入账成为可能。在比特币种，出账先于入账。

当一个矿工开始挖坑，它就添加了一个 **币基交易(coinbase transaction)**。一个币基交易是交易中的特殊类型，它并不需要上个已处在的出账。它在混沌中自己创造了一个出账(币)，一个没有鸡的蛋。这是给矿工找到新区块的报偿。

就像你知道的那样，创始区块在区块链的起点。这个区块也产生了区块链中的第一笔出账。没有前置出账的要求，因为没有前置交易，也没有出账。

我们来创建一个币基交易吧：

{% highlight golang %}
func NewCoinbaseTX(to, data string) *Transaction {
    if data == "" {
        data = fmt.Sprintf("Reward to '%s'", to)
    }

    txin := TXInput{[]byte{}, -1, data}
    txout := TXOutput{subsidy, to}
    tx := Transaction{nil, []TXInput{txin}, []TXOutput{txout}}
    tx.SetID()

    return &tx
}
{% endhighlight %}

一个币基交易只有一个入账。在我们的实现中， **Txid** 是空的， **Vout** 也等于 -1。而且一个币基交易并不在 **ScriptSig** 中存储脚本。一个任意数据被存在那里。

> 比特币中，第一条币基交易中包含着下面这条信息： "2009年1月3日，财政大臣正处在实施第二轮银行紧急援助的边缘"你可以在[这里](https://blockchain.info/tx/4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b?show_adv=true)自己看

**subsidy** 是奖励金额。比特币中，这个数量不存在任何地方。它只会基于区块总量进行计算。区块被分为 **210000** 个。挖掘创始区块会产生 50 BTC。每 **210000** 个区块被发掘出，奖励就会减半。在我们的实现中，我们会存着一个恒定的常量奖励值(至少是现在啦 😉)

## 在区块链中保存交易信息

到现在为止，每个区块至少存储一笔交易。而且没可能不带交易信息就挖坑。这就意味着我们应该移除 **Block** 中的 **Data** 字段，并用交易替代：

{% highlight golang %}
type Block struct {
    Timestamp     int64
    Transactions  []*Transaction
    PrevBlockHash []byte
    Hash          []byte
    Nonce         int
}
{% endhighlight %}

相应地，**NewBlock** 和 **NewGenesisBlock** 也必须跟着变：

{% highlight golang %}
func NewBlock(transactions []*Transaction, prevBlockHash []byte) *Block {
    block := &Block{time.Now().Unix(), transactions, prevBlockHash, []byte{}, 0}
    ...
}

func NewGenesisBlock(coinbase *Transaction) *Block {
    return NewBlock([]*Transaction{coinbase}, []byte{})
}
{% endhighlight %}

接下来调整新区块链创建的部分：

{% highlight golang %}
func CreateBlockchain(address string) *Blockchain {
    ...
    err = db.Update(func(tx *bolt.Tx) error {
        cbtx := NewCoinbaseTX(address, genesisCoinbaseData)
        genesis := NewGenesisBlock(cbtx)

        b, err := tx.CreateBucket([]byte(blocksBucket))
        err = b.Put(genesis.Hash, genesis.Serialize())
        ...
    })
    ...
}
{% endhighlight %}

现在，这个函数带着一个将接收挖掘创始区块奖励的的地址了。

## 工作量证明

工作量证明算法也要考虑到区块中被存入了交易。为了保证存储交易区块链的一致性和可靠性。我们得改一下 **ProofOfWork.prepareData** 方法：

{% highlight golang %}
func (pow *ProofOfWork) prepareData(nonce int) []byte {
    data := bytes.Join(
        [][]byte{
            pow.block.PrevBlockHash,
            pow.block.HashTransactions(), // 这行改了
            IntToHex(pow.block.Timestamp),
            IntToHex(int64(targetBits)),
            IntToHex(int64(nonce)),
        },
        []byte{},
    )

    return data
}
{% endhighlight %}

替换掉 **pow.block.Data**, 我们现在用 **pow.block.HashTransactions()**：

{% highlight golang %}
func (b *Block) HashTransactions() []byte {
    var txHashes [][]byte
    var txHash [32]byte

    for _, tx := range b.Transactions {
        txHashes = append(txHashes, tx.ID)
    }
    txHash = sha256.Sum256(bytes.Join(txHashes, []byte{}))

    return txHash[:]
}
{% endhighlight %}

再次声明：我们使用哈希算法作为生成独一无二的数据身份的机制。我们想要区块上的所有交易都可以通过单个哈希而有独一无二的身份。为了达成这个目标。我们从每笔交易中生成哈希。把它们连接起来，然后从这个已连接的数据中生成哈希。

> 比特币用了更加精细的技术：它相当于所有的交易都存在一个区块中，作为一个 [Merkle tree](https://en.wikipedia.org/wiki/Merkle_tree) 然后用这个树的根哈希作为工作量证明系统。这种方式就可以很快地确认区块中有没有某笔交易，只要有一个根哈希，而不用下载整个交易记录。

现在来确认一下是不是都弄对了：

{% highlight text %}
$ blockchain_go createblockchain -address Ivan
00000093450837f8b52b78c25f8163bb6137caf43ff4d9a01d1b731fa8ddcc8a

Done!
{% endhighlight %}

好！我们接收到了第一笔挖坑奖励。但是怎么确认余额呢？

## 未花费交易的出账(Unspent Transaction Outputs)

我们需要找到所有的未花费交易的出账(UTXO)。未花费(Unspent)意味着这个出账还没被任何交易所引用。表示的话应该是这样：

1. tx0, output 1;
2. tx1, output 0;
3. tx3, output 0;
4. tx4, output 0.

当然啦，当我们确认余额的时候，我们并不需要所有的这些，只要找能被我们的 key 所解锁的那些就可以了(现在我们并没有实现 keys，暂时会用用户自定义地址来代替)。首先来在入账出账上定义一下加锁和解锁的方法：

{% highlight golang %}
func (in *TXInput) CanUnlockOutputWith(unlockingData string) bool {
    return in.ScriptSig == unlockingData
}

func (out *TXOutput) CanBeUnlockedWith(unlockingData string) bool {
    return out.ScriptPubKey == unlockingData
}
{% endhighlight %}

这里我们只是用**unlockingData**比较一下 script 字段。未来的文章中，这一块会升级一下，大概会在实现了基于用户私钥的地址之后。

下一步 —— 找到包含有未花费出账的交易 —— 其实比较难：

{% highlight golang %}
func (bc *Blockchain) FindUnspentTransactions(address string) []Transaction {
  var unspentTXs []Transaction
  spentTXOs := make(map[string][]int)
  bci := bc.Iterator()

  for {
    block := bci.Next()

    for _, tx := range block.Transactions {
      txID := hex.EncodeToString(tx.ID)

    Outputs:
      for outIdx, out := range tx.Vout {
        // Was the output spent?
        if spentTXOs[txID] != nil {
          for _, spentOut := range spentTXOs[txID] {
            if spentOut == outIdx {
              continue Outputs
            }
          }
        }

        if out.CanBeUnlockedWith(address) {
          unspentTXs = append(unspentTXs, *tx)
        }
      }

      if tx.IsCoinbase() == false {
        for _, in := range tx.Vin {
          if in.CanUnlockOutputWith(address) {
            inTxID := hex.EncodeToString(in.Txid)
            spentTXOs[inTxID] = append(spentTXOs[inTxID], in.Vout)
          }
        }
      }
    }

    if len(block.PrevBlockHash) == 0 {
      break
    }
  }

  return unspentTXs
}
{% endhighlight %}

由于交易信息被存储在区块中，我们只能确认区块链上的每个区块。从先从出账开始：

{% highlight golang %}
if out.CanBeUnlockedWith(address) {
    unspentTXs = append(unspentTXs, tx)
}
{% endhighlight %}

如果一笔出账被我们所搜索的未花费交易出账的相同地址锁住了。那么这就是我们想要的出账。不过在获取之前，我们还得确认这个出账是否已经被入账所引用了：

{% highlight golang %}
if spentTXOs[txID] != nil {
    for _, spentOut := range spentTXOs[txID] {
        if spentOut == outIdx {
            continue Outputs
        }
    }
}
{% endhighlight %}

我们跳过了这些被引用的入账(这些值被移动到了其他的出账中，所以我们不能把它们算上)。在确认了所有获取到的由提供的地址(这不会波及到币基交易，因为它们不会解锁这个出账)可以解锁的出账之后：

{% highlight golang %}
if tx.IsCoinbase() == false {
    for _, in := range tx.Vin {
        if in.CanUnlockOutputWith(address) {
            inTxID := hex.EncodeToString(in.Txid)
            spentTXOs[inTxID] = append(spentTXOs[inTxID], in.Vout)
        }
    }
}
{% endhighlight %}

这个函数返回一个包含着未花费的交易列表。为了计算余额，我们还需要另一个函数，交易信息是输入，只返回出账信息。

{% highlight golang %}
func (bc *Blockchain) FindUTXO(address string) []TXOutput {
       var UTXOs []TXOutput
       unspentTransactions := bc.FindUnspentTransactions(address)

       for _, tx := range unspentTransactions {
               for _, out := range tx.Vout {
                       if out.CanBeUnlockedWith(address) {
                               UTXOs = append(UTXOs, out)
                       }
               }
       }

       return UTXOs
}
{% endhighlight %}

现在，我们可以实现 **getbalance** 命令啦：

{% highlight golang %}
func (cli *CLI) getBalance(address string) {
    bc := NewBlockchain(address)
    defer bc.db.Close()

    balance := 0
    UTXOs := bc.FindUTXO(address)

    for _, out := range UTXOs {
        balance += out.Value
    }

    fmt.Printf("Balance of '%s': %d\n", address, balance)
}
{% endhighlight %}

账户余额就是所有的由账户地址锁定的未花费交易出账的值得总和。

在挖掘了创始区块之后，来确认一下余额：

{% highlight golang %}
$ blockchain_go getbalance -address Ivan
Balance of 'Ivan': 10
{% endhighlight %}

哇， 我们有了第一桶金。

## 发送币

现在我们想发送一些币给其他人。为了实现这一目标，我们要创建一笔新的交易，把它放到区块里面，然后挖掘区块。到现在为止我们只是实现了币基交易(这是交易中的一种特殊类型)，现在我们需要普通交易了：

{% highlight golang %}
func NewUTXOTransaction(from, to string, amount int, bc *Blockchain) *Transaction {
    var inputs []TXInput
    var outputs []TXOutput

    acc, validOutputs := bc.FindSpendableOutputs(from, amount)

    if acc < amount {
        log.Panic("ERROR: Not enough funds")
    }

    // Build a list of inputs
    for txid, outs := range validOutputs {
        txID, err := hex.DecodeString(txid)

        for _, out := range outs {
            input := TXInput{txID, out, from}
            inputs = append(inputs, input)
        }
    }

    // Build a list of outputs
    outputs = append(outputs, TXOutput{amount, to})
    if acc > amount {
        outputs = append(outputs, TXOutput{acc - amount, from}) // a change
    }

    tx := Transaction{nil, inputs, outputs}
    tx.SetID()

    return &tx
}
{% endhighlight %}

在创建新的输出之前，我们要先找到所有的未花费出账并确认它们存了足够的币。这就是 **FindSpendableOutputs** 方法要干的事情。之后，入账所引用的每个找到的出账就这么被创建了出来。接下来，我们得创建两个出账：

1. 一个是被接受者地址所锁定的。这就是真是的币转换的另一个地址。
2. 一个是被发送者地址所锁定的。这是找零。只有当为话费的出账值要比所要求的新交易要多的时候才会被创建。记住，出账是不可见的。

**FindSpendableOutputs** 方法是基于我们之前定义的 **FindUnspentTransactions**方法的：

{% highlight golang %}
func (bc *Blockchain) FindSpendableOutputs(address string, amount int) (int, map[string][]int) {
    unspentOutputs := make(map[string][]int)
    unspentTXs := bc.FindUnspentTransactions(address)
    accumulated := 0

Work:
    for _, tx := range unspentTXs {
        txID := hex.EncodeToString(tx.ID)

        for outIdx, out := range tx.Vout {
            if out.CanBeUnlockedWith(address) && accumulated < amount {
                accumulated += out.Value
                unspentOutputs[txID] = append(unspentOutputs[txID], outIdx)

                if accumulated >= amount {
                    break Work
                }
            }
        }
    }

    return accumulated, unspentOutputs
}
{% endhighlight %}

这个方法迭代了所有的未花费交易并累计了这些值。当累计值大于或等于我们想要交易的额度，它就会停下并返回累计值和由交易 ID 所聚合的出账索引。我们不想要那比我们要花的更多的钱。

现在，我们可以改造一下 **Blockchain.MineBlock** 方法：

{% highlight golang %}
func (bc *Blockchain) MineBlock(transactions []*Transaction) {
    ...
    newBlock := NewBlock(transactions, lastHash)
    ...
}
{% endhighlight %}

最后，实现一下 **send** 命令：

{% highlight golang %}
func (cli *CLI) send(from, to string, amount int) {
    bc := NewBlockchain(from)
    defer bc.db.Close()

    tx := NewUTXOTransaction(from, to, amount, bc)
    bc.MineBlock([]*Transaction{tx})
    fmt.Println("Success!")
}
{% endhighlight %}

发送币意味着创建了一笔交易，而且添加到了区块链中，并发掘出了一个新的区块。但比特币不会立即 处理(我们也不会)。而是把所有新的交易信息推送到内存池中，当矿工准备好了要去挖新的区块，它就会带着所有来自于内存池中的交易信息并创建一个候选区块。当区块被挖掘到并塞入交易信息到区块链的时候，交易只会被确认一次。

来确认一下发送币是不是可以用:

{% highlight text %}
$ blockchain_go send -from Ivan -to Pedro -amount 6
00000001b56d60f86f72ab2a59fadb197d767b97d4873732be505e0a65cc1e37

Success!

$ blockchain_go getbalance -address Ivan
Balance of 'Ivan': 4

$ blockchain_go getbalance -address Pedro
Balance of 'Pedro': 6
{% endhighlight %}

棒棒的，现在我们创建了更多的交易，并确认了从多个出账发送也是没有问题的：

{% highlight text %}
$ blockchain_go send -from Pedro -to Helen -amount 2
00000099938725eb2c7730844b3cd40209d46bce2c2af9d87c2b7611fe9d5bdf

Success!

$ blockchain_go send -from Ivan -to Helen -amount 2
000000a2edf94334b1d94f98d22d7e4c973261660397dc7340464f7959a7a9aa

Success!
{% endhighlight %}

现在 Helen 的币被锁在了两笔出账志宏，一个来自于 Pedro，另一个来自于 lvan，现在来把它发给其他人吧：

{% highlight text %}
$ blockchain_go send -from Helen -to Rachel -amount 3
000000c58136cffa669e767b8f881d16e2ede3974d71df43058baaf8c069f1a0

Success!

$ blockchain_go getbalance -address Ivan
Balance of 'Ivan': 2

$ blockchain_go getbalance -address Pedro
Balance of 'Pedro': 4

$ blockchain_go getbalance -address Helen
Balance of 'Helen': 1

$ blockchain_go getbalance -address Rachel
Balance of 'Rachel': 3
{% endhighlight %}

很好，现在来看看会不会失败：

{% highlight text %}
$ blockchain_go send -from Pedro -to Ivan -amount 5
panic: ERROR: Not enough funds

$ blockchain_go getbalance -address Pedro
Balance of 'Pedro': 4

$ blockchain_go getbalance -address Ivan
Balance of 'Ivan': 2
{% endhighlight %}

## 最后

哈哈，这不是很简单，但现在我们有了交易信息了。不过类似于比特币这样的加密货币的一些重点特性仍有缺失：

1. 地址。我们仍然没有真实的，基于私钥的地址。
2. 奖励。挖坑是真的无利可图。
3. UTXO 集。获取账户余额需要检查整个区块链，在有大量区块的情况下这会花费相当长的时间。而且，如果我们之后想要验证交易信息的话，会花费很长的时间。UTXO 集希望去解决这些问题，而且让交易操作更快。
4. 内存池。这是交易信息在打包进区块链之前交易信息所待的地方。在我们当前的实现中，一个区块只包含一条交易，这样效率太低了。

* [基本原型]({% post_url 2017-12-29-building-blockchain-in-go-part-1-basic-prototype %})
* [工作量证明]({% post_url 2017-12-30-building-blockchain-in-go-part-2-proof-of-work %})
* [持久化与命令行]({% post_url 2017-12-30-building-blockchain-in-go-part-3-persistence-and-cli %})
* [交易 1]({% post_url 2018-01-01-build-blockchain-in-go-part-4-transactions-1 %})
* [地址]({% post_url 2018-01-02-building-blockchain-in-go-part-5-addresses %})
* [交易 2]({% post_url 2018-01-06-building-blockchain-in-go-part-6-transactions-2 %})
* [网络]({% post_url 2018-01-12-building-blockchain-go-part-7-network %})

