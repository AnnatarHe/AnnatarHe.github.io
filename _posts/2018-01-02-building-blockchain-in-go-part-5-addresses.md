---
layout: post
title: 用 golang 实现区块链系列五 | 地址
tags: blockchain code
---

> 原文链接： [Building Blockchain in Go. Part 5: Addresses](https://jeiwan.cc/posts/building-blockchain-in-go-part-5/)

## 介绍

在 [上篇文章]({% post_url 2018-01-01-build-blockchain-in-go-part-4-transactions-1 %}) 中，我们已经着手实现了交易信息。你也已经了解到了交易的中立性：比特币没有用户账户，私人数据(像是名字，护照或者身份证号)也并非必需的，更不会保存。但仍要有一些东西可以用来识别是你，作为交易的出账(就像出账的时候，币的拥有者被锁定在了上面)。这就是为什么会需要比特币的地址。到现在为止，我们用了用户随意定制的字符串作为地址，那么是时候去实现一个真正的地址了，就像他们在比特币上做的那样。

> 这个部分的介绍有重大的代码变化，所以没必要全都解释清楚，请参考 [这个页面](https://github.com/Jeiwan/blockchain_go/compare/part_4...part_5#files_bucket) 了解自上篇文章以来的变化

## 比特币地址

这里有个比特币地址的例子： [1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa](https://blockchain.info/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa)。这是一个最早的比特币地址，据说它属于中本聪。比特币的地址是公开的。如果你想要提币给其他人，你需要知道他们的地址。然而地址(尽管是唯一的)并不能证明你是钱包的所有者。事实上，这个地址是个人类可读的公钥摘要。在比特币中，你的身份是存在电脑(或者其他你能访问到的地方)里的公钥和私钥的配对。比特币依靠着一个加密算法的组合去创造这些 keys, 以此来确保这个世界上除你之外的任何人能够拿到你的钱，而这不需要物理设备访问你的秘钥。我们来谈谈这个算法是什么吧。

## 公钥加密

公钥加密算法使用了钥匙对： 公钥和私钥。公钥并不包含敏感信息，而且可以被公开给任何人。与之不同的是私钥，私钥不应该被公开：除了所有人，它不应该能被任何人访问到因为私钥被用来证明所有者的身份。你就是你的私钥(在加密货币的范畴里)。

本质上来说，一个比特币钱包就是这样钥匙的配对。当你安装了一个钱包应用，或者使用比特币客户端去生成了新的地址，为你定制的钥匙对就被生成出来了。在比特币中，谁控制了私钥，谁就控制了所有进入这个钱包的币。

公钥和私钥只是随机的字符序列。所以它不能被打印到屏幕上，也不可读。这就是为什么比特币用了个算法去转换公钥地址到一个人类可读的字符串上。

> 如果你曾经用过比特币钱包，可能也会给你生成提示词。这些词被用来替代私钥，而且可以被用来生成私钥。这种机制在 [BIP-039](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) 中实现

好了，我们已经知道了比特币如何分辨用户，那么比特币是如何确认交易出账的所有权(币是存在里面吗)？

## 数字签名

在数学和加密货币学中，有一个数字签名的概念 —— 这个算法保障了：

1. 在发送者发给接受者的数据，在交易过程中不会被改变;
2. 数据一定是被发送者创建的;
3. 发送者不能否认发送过数据.

通过给数据上加入数字签名算法(即在数据上加密)，得到一个签名，这个签名可以在随后被验证。数字签名使用私钥，而验证需要公钥。

为了给数据签名，我们需要下面的东西：

1. 要被签名的数据;
2. 私钥.

签字的操作生成一个签名，它被存在交易入账中。为了可被验证，需要下面的东西：

1. 被签名的数据;
2. 签名;
3. 公钥.

简而言之，验证过程可以被这样解释：确认这个签名确实是是用私钥产生出的公钥中产生的。

> 数字签名并不加密, 你不能从签名中重建数据。这有点儿类似于哈希：你把数据喂给哈希算法，然后得到一个数据的摘要。数字签名和哈希算法的不同就是 key 的匹配：这使得签名验证成为可能。
>
> 不过密钥对可以被用来加密数据。一个私钥用来加密，公钥用来解密。比特币并不使用加密算法。

比特币的每一笔入账交易都被创建这笔交易的人所签名了。比特币的每一笔交易在被放入区块之前都必须被验证。验证意味着(不包含其他流程)：

1. 确认从上笔交易中有权限使用出账。
2. 确认交易签名是对的。

签名数据和验证签名的过程的示意图：

![the process of signing data and verifying signature](https://jeiwan.cc/images/signing-scheme.png)

先来看一眼整个交易的生命周期:

1. 最开始，在包含着币基交易的创始区块上。币基交易中没有真正的入账，所以签名并非必需的。币基交易的出账包含着哈希过的公钥(这里用**(RIPEMD16(SHA256(PubKey))**算法)。
2. 当一个人提币，交易就被触发。交易的入账将会引用上笔交易的出账。每笔入账都存有公钥(未被哈希的)而且整个交易都被签名。
3. 比特币网络的其余节点接收到交易并会验证它。除此之外，它们还会确认：入账的公钥哈希是否和被引用的出账哈希一样(这就保证了提币的人只能提他自己的币); 签名是不是正确地(这就保证了这笔交易确实是被币的所有者所创建的)。
4. 当一个矿工节点准备挖一个新的区块，它就会把交易信息放入区块，然后开始挖坑。
5. 当区块被挖到了，网络中的其他节点收到了一个消息说区块已经被挖到了，并把这个区块添加到区块链中。
6. 区块被添加到区块链中后，交易完成，出账可以被引用到一笔新的交易上了。

## 椭圆曲线密码学

就像上面说的，公钥和私钥是随机的字节序列。由于私钥被用来表明是币的所有者，它就需要以下几个条件： 随机算法必须要产生真随机字节。我们不希望意外产生其他人的私钥。

比特币使用椭圆曲线算法去生成私钥。椭圆曲线算法是一个非常复杂的数学概念，所以我们并不会详细地解释(如果你感兴趣，可以去这里看：[this gentle introduction to elliptic curves](http://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/)，警告：有数学公式)。我们只要知道这个曲线算法真的可以产生巨大的随机数字，这个曲线算法被比特币用来选取 0 到 2 的 256 次方间的数字(这大概是 10 的 77 次方。可见宇宙中大概有 10 的 78 到 82 次方的原子)。如此巨大的上限意味着几乎不可能生成两个相同的私钥。

所以，比特币使用(我们也会) ECDSA(Elliptic Curve Digital Signature Algorithm) 算法去给交易签名。

## Base58

现在来看一下上面提到的比特币地址：1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa。现在我们已经知道了这是一个人类可读的公钥摘要。如果我们解码一下，这个公钥看起来就像是这样(一个在十六进制系统中的字节序列)：

{% highlight text %}
0062E907B15CBF27D5425399EBF6F0FB50EBB88F18C29B7D93
{% endhighlight %}

比特币使用 Base58 算法去转换公钥到人类可读的格式。这个算法很像注明的 Base64，不过它使用较短的字母。一些字母表中的字符被移除了，为了避免相似字符的攻击。这样，这样，里面就没了这些字符：`0(零)`, `O(大写的 o)`，`I(大写的 i)`，`l(小写的 L)`，因为它们很像，也没有 `+`, `/`这两个符号

来可视化一下从公钥中获取地址的过程：

![the process of getting an address from a public key](https://jeiwan.cc/images/address-generation-scheme.png)

上面提到的解码公钥由三个部分组成:

{% highlight text %}
Version  Public key hash                           Checksum
00       62E907B15CBF27D5425399EBF6F0FB50EBB88F18  C29B7D93
{% endhighlight %}

由于哈希算法是单向的(它们不能被反向解码出源数据)。这也就不可能从哈希中提取出公钥。但我们可以通过运行存下来的哈希算法来获得哈希，然后与之比较检查。

好了，现在我们有了所有的模块，来写点儿代码，在我们写代码的时候，这些概念会更清晰。

## 实现地址

我们从 **Wallet** 结构开始：

{% highlight golang %}
type Wallet struct {
    PrivateKey ecdsa.PrivateKey
    PublicKey  []byte
}

type Wallets struct {
    Wallets map[string]*Wallet
}

func NewWallet() *Wallet {
    private, public := newKeyPair()
    wallet := Wallet{private, public}

    return &wallet
}

func newKeyPair() (ecdsa.PrivateKey, []byte) {
    curve := elliptic.P256()
    private, err := ecdsa.GenerateKey(curve, rand.Reader)
    pubKey := append(private.PublicKey.X.Bytes(), private.PublicKey.Y.Bytes()...)

    return *private, pubKey
}
{% endhighlight %}

一个钱包只是秘钥对。我们也需要一个 **Wallets** 类型来保有一个钱包的集合，把它们保存到文件里，然后加载读取。在 **Wallet** 的构造方法里，一对新的秘钥被生成了出来。 **newKeyPair** 方法很直接： ECDSA 是基于椭圆曲线算法的，所以我们需要一个。下一步，一个私钥被通过椭圆曲线算法生成出来了。而公钥被通过私钥算出来了。有个要注意的点：在基于椭圆曲线算法的算法中。公钥是曲线上的一个点，所以公钥是 X,Y 坐标的结合。在比特币中，这些坐标连接，形成公钥。

现在，我们来生成一个地址：

{% highlight golang %}
func (w Wallet) GetAddress() []byte {
    pubKeyHash := HashPubKey(w.PublicKey)

    versionedPayload := append([]byte{version}, pubKeyHash...)
    checksum := checksum(versionedPayload)

    fullPayload := append(versionedPayload, checksum...)
    address := Base58Encode(fullPayload)

    return address
}

func HashPubKey(pubKey []byte) []byte {
    publicSHA256 := sha256.Sum256(pubKey)

    RIPEMD160Hasher := ripemd160.New()
    _, err := RIPEMD160Hasher.Write(publicSHA256[:])
    publicRIPEMD160 := RIPEMD160Hasher.Sum(nil)

    return publicRIPEMD160
}

func checksum(payload []byte) []byte {
    firstSHA := sha256.Sum256(payload)
    secondSHA := sha256.Sum256(firstSHA[:])

    return secondSHA[:addressChecksumLen]
}
{% endhighlight %}

这是转换公钥地址到 Base58 的步骤：

1. 获取公钥，用 **RIPEMD160(SHA256(PubKey))** 的哈希算法哈希两次。
2. 准备转哈希地址生成算法的版本
3. 通过用 **SHA256(SHA256(payload))** 哈希步骤 2 的结果计算 checksum。这个 checksum 是哈希结果的头四个字节。
4. 准备 checksum 到 **version+PubKeyHash** 的组合。
5. 用 Base58 编码 **version+PubKeyHash+checksum** 的组合。

这个步骤的结果，你就会得到 **真的比特币地址**。你甚至可以在 [blockchain.info](https://blockchain.info/) 查询自己的余额。但是我肯定无论你生成多少次新的地址去查看余额，它肯定都是 0。这就是为何选择合适的公钥加密算法是如此的重要：想象一下私钥是随机数字，产生出相同数字的几率必须尽可能低。理想情况下，必须要低到“不可能”。

注意一点：你无须链接到比特币节点就能得到一个地址，这个地址生成算法运用了开放的算法组合，实现在编程语言和库中。

现在你得用地址改一下入账出账：

{% highlight golang %}
type TXInput struct {
    Txid      []byte
    Vout      int
    Signature []byte
    PubKey    []byte
}

func (in *TXInput) UsesKey(pubKeyHash []byte) bool {
    lockingHash := HashPubKey(in.PubKey)

    return bytes.Compare(lockingHash, pubKeyHash) == 0
}

type TXOutput struct {
    Value      int
    PubKeyHash []byte
}

func (out *TXOutput) Lock(address []byte) {
    pubKeyHash := Base58Decode(address)
    pubKeyHash = pubKeyHash[1 : len(pubKeyHash)-4]
    out.PubKeyHash = pubKeyHash
}

func (out *TXOutput) IsLockedWithKey(pubKeyHash []byte) bool {
    return bytes.Compare(out.PubKeyHash, pubKeyHash) == 0
}
{% endhighlight %}

我们不再使用 **ScriptPubKey** 和 **ScriptSig** 字段了，因为我们并不会去实现一个脚本语言。作为替代，**ScriptSig** 被分成了 **Signature** 和 **PubKey** 两个字段，**ScriptPubKey** 也改名成了 **PubKeyHash**. 好啦，我们实现了和比特币一样的出账锁/解锁，还有入账的签名逻辑。不过还没在方法中修改。

**UsesKey** 方法用一个特殊 key 去解锁出账检查入账。入账保存了公钥(未哈希)，不过需要一个哈希函数。**IsLockedWithKey** 检查提供的公钥哈希是否能解锁输出。这和 **UsesKey** 是一个互补的函数，他们都使用 **FindUnspentTransactions** 在交易间构建联系。

**Lock** 就是简单地锁住出账。当我们提币给其他人的时候，我们只知道他们的地址，所以这个地址就是函数的唯一参数。这个地址随后被解码，然后从中提取出公钥哈希，并保存在 **PubKeyHash** 字段中。

现在，来确认一下是不是都对了：

{% highlight text %}
$ blockchain_go createwallet
Your new address: 13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt

$ blockchain_go createwallet
Your new address: 15pUhCbtrGh3JUx5iHnXjfpyHyTgawvG5h

$ blockchain_go createwallet
Your new address: 1Lhqun1E9zZZhodiTqxfPQBcwr1CVDV2sy

$ blockchain_go createblockchain -address 13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt
0000005420fbfdafa00c093f56e033903ba43599fa7cd9df40458e373eee724d

Done!

$ blockchain_go getbalance -address 13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt
Balance of '13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt': 10

$ blockchain_go send -from 15pUhCbtrGh3JUx5iHnXjfpyHyTgawvG5h -to 13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt -amount 5
2017/09/12 13:08:56 ERROR: Not enough funds

$ blockchain_go send -from 13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt -to 15pUhCbtrGh3JUx5iHnXjfpyHyTgawvG5h -amount 6
00000019afa909094193f64ca06e9039849709f5948fbac56cae7b1b8f0ff162

Success!

$ blockchain_go getbalance -address 13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt
Balance of '13Uu7B1vDP4ViXqHFsWtbraM3EfQ3UkWXt': 4

$ blockchain_go getbalance -address 15pUhCbtrGh3JUx5iHnXjfpyHyTgawvG5h
Balance of '15pUhCbtrGh3JUx5iHnXjfpyHyTgawvG5h': 6

$ blockchain_go getbalance -address 1Lhqun1E9zZZhodiTqxfPQBcwr1CVDV2sy
Balance of '1Lhqun1E9zZZhodiTqxfPQBcwr1CVDV2sy': 0
{% endhighlight %}

Nice！来实现一下交易签名吧。

## 实现签名

比特币中保障一个用户不能花别人的币的唯一方法就是对交易签名加密。如果签名不合法，交易也会要考虑一下是不是合法的，然后就不能被添加到区块链上了。

我们已经有了所有实现交易签名的必备模块了，咦，还差一个：数据的签名(data to sign)。交易里的哪个部分要被签名？或者对整个交易都签名吗？选择需要签名的数据相当的重要。签名数据必须用一种独特的方式包含信息和身份证明。例如，单纯的对出账信息签名没有意义，因为这个签名并没有考虑到发送方和接收方。

考虑一下，交易被上一个出账所解锁，重新分配值，然后锁住一个新的出账，下面的数据就必须被签名：

1. 存在解锁出账里的公钥哈希。这是一笔交易的发送者身份证明。
2. 新的，已锁的出账公钥。这是一笔交易的接受者身份证明。
3. 新出账的值。

> 在比特币中，锁定和解锁逻辑被存在脚本里，分别在出账和入账的 **ScriptSig** 和 **ScriptPubKey** 字段中。由于比特币允许不同类型的脚本，所以要对 **ScriptPubKey** 的整个内容签名。

正如你看到的一样，我们不需要对入账中的公钥签名。因为，在比特币中，这不是被签名的交易信息，而且它是来自于引用的出账中存在入账的 **ScriptPubKey** 的精简版本

> 关于获取精简交易信息的操作细节可以在 [这里](https://en.bitcoin.it/wiki/File:Bitcoin_OpCheckSig_InDetail.png) 找到，好像是过时了，不过我没能找到一个关于此信息更可靠地消息源。

好吧，看起来蛮复杂的，开始写点儿代码好了。我们会从 **Sign** 方法开始：

{% highlight golang %}
func (tx *Transaction) Sign(privKey ecdsa.PrivateKey, prevTXs map[string]Transaction) {
    if tx.IsCoinbase() {
        return
    }

    txCopy := tx.TrimmedCopy()

    for inID, vin := range txCopy.Vin {
        prevTx := prevTXs[hex.EncodeToString(vin.Txid)]
        txCopy.Vin[inID].Signature = nil
        txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].PubKeyHash
        txCopy.ID = txCopy.Hash()
        txCopy.Vin[inID].PubKey = nil

        r, s, err := ecdsa.Sign(rand.Reader, &privKey, txCopy.ID)
        signature := append(r.Bytes(), s.Bytes()...)

        tx.Vin[inID].Signature = signature
    }
}
{% endhighlight %}

这个方法获取了一个私钥，还有上个交易信息的 map。像上面提到的那样，为了给交易签名，我们需要去访问被入账交易引用的出账，所以我们需要交易保存着这些输出。

来一步步看这段代码吧：

{% highlight golang %}
if tx.IsCoinbase() {
    return
}
{% endhighlight %}

币基交易不会被签名，因为它并没有真正的入账。

{% highlight golang %}
txCopy := tx.TrimmedCopy()
{% endhighlight %}

一个精简的版本会被签名，并不是整个交易：

{% highlight golang %}
func (tx *Transaction) TrimmedCopy() Transaction {
    var inputs []TXInput
    var outputs []TXOutput

    for _, vin := range tx.Vin {
        inputs = append(inputs, TXInput{vin.Txid, vin.Vout, nil, nil})
    }

    for _, vout := range tx.Vout {
        outputs = append(outputs, TXOutput{vout.Value, vout.PubKeyHash})
    }

    txCopy := Transaction{tx.ID, inputs, outputs}

    return txCopy
}
{% endhighlight %}

这个精简版会包含完整的入账和出账。不过 **XInput.Signature** 和 **TXInput.PubKey** 会被设为 nil。

下一步，我们队这个精简版的入账进行遍历:

{% highlight golang %}
for inID, vin := range txCopy.Vin {
    prevTx := prevTXs[hex.EncodeToString(vin.Txid)]
    txCopy.Vin[inID].Signature = nil
    txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].PubKeyHash
{% endhighlight %}

在每个入账中，**Signature** 被设为 **nil**(只是再检查一次)，**PubKey** 被设为被引用的出账的 **PubKeyHash**。在这个时候，除了现有交易外，其他所有交易都是空的。它们的 **Signature** 和 **PubKey** 字段都被设成了 nil。这样，入账就分别被签名了，尽管对于我们的应用来说是没必要的，但比特币允许交易包含不同地址的入账。

{% highlight golang %}
    txCopy.ID = txCopy.Hash()
    txCopy.Vin[inID].PubKey = nil
{% endhighlight %}

**Hash** 方法会序列化交易，并用 SHA-256 算法其散列哈希。这个结果就是我们要去签名的数据。在获取到哈希值之后我们得把 **PubKey** 重置一下，这样它就不会在未来的迭代中产生影响。

现在，中间这块长这样：

{% highlight golang %}
    r, s, err := ecdsa.Sign(rand.Reader, &privKey, txCopy.ID)
    signature := append(r.Bytes(), s.Bytes()...)

    tx.Vin[inID].Signature = signature
{% endhighlight %}

我们用 **privKey** 对 **txCopy.ID** 进行签名。一个 ECDSA 签名是一对数字，我们会把它们连接并存储到入账的 **Signature** 字段中。

现在，这是验证函数：

{% highlight golang %}
func (tx *Transaction) Verify(prevTXs map[string]Transaction) bool {
    txCopy := tx.TrimmedCopy()
    curve := elliptic.P256()

    for inID, vin := range tx.Vin {
        prevTx := prevTXs[hex.EncodeToString(vin.Txid)]
        txCopy.Vin[inID].Signature = nil
        txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].PubKeyHash
        txCopy.ID = txCopy.Hash()
        txCopy.Vin[inID].PubKey = nil

        r := big.Int{}
        s := big.Int{}
        sigLen := len(vin.Signature)
        r.SetBytes(vin.Signature[:(sigLen / 2)])
        s.SetBytes(vin.Signature[(sigLen / 2):])

        x := big.Int{}
        y := big.Int{}
        keyLen := len(vin.PubKey)
        x.SetBytes(vin.PubKey[:(keyLen / 2)])
        y.SetBytes(vin.PubKey[(keyLen / 2):])

        rawPubKey := ecdsa.PublicKey{curve, &x, &y}
        if ecdsa.Verify(&rawPubKey, txCopy.ID, &r, &s) == false {
            return false
        }
    }

    return true
}
{% endhighlight %}

这个方法相当直接。首先，我们需要相同的简易版交易信息：

{% highlight golang %}
txCopy := tx.TrimmedCopy()
{% endhighlight %}

现在我们需要和产生秘钥对一样的曲线：

{% highlight golang %}
curve := elliptic.P256()
{% endhighlight %}

现在要来确认一下每个入账都会被签名：

{% highlight golang %}
for inID, vin := range tx.Vin {
    prevTx := prevTXs[hex.EncodeToString(vin.Txid)]
    txCopy.Vin[inID].Signature = nil
    txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].PubKeyHash
    txCopy.ID = txCopy.Hash()
    txCopy.Vin[inID].PubKey = nil
{% endhighlight %}

这一块和**Sign** 方法中的一样，因为在验证过程中，我们需要签名的相同的数据。

{% highlight golang %}
    r := big.Int{}
    s := big.Int{}
    sigLen := len(vin.Signature)
    r.SetBytes(vin.Signature[:(sigLen / 2)])
    s.SetBytes(vin.Signature[(sigLen / 2):])

    x := big.Int{}
    y := big.Int{}
    keyLen := len(vin.PubKey)
    x.SetBytes(vin.PubKey[:(keyLen / 2)])
    y.SetBytes(vin.PubKey[(keyLen / 2):])
{% endhighlight %}

这里，我们把存在 **TXInput.Signature** 和 **TXInput.PubKey** 里的值拿出来，由于签名就是数字对，而公钥是一对坐标。我们之前为了存储就把它们连在了一块，现在要用 **crypto/ecdsa** 方法去取出来。

{% highlight golang %}
    rawPubKey := ecdsa.PublicKey{curve, &x, &y}
    if ecdsa.Verify(&rawPubKey, txCopy.ID, &r, &s) == false {
        return false
    }
}

return true
{% endhighlight %}

这里，我们使用了从入账中提取出了公钥创建了**ecdsa.PublicKey** 并执行了 **ecdsa.Verify** ，参数是从入账提取出的签名。如果所有的入账都验证过了，就返回 true, 如果在输入的验证中有一个出错了，就返回 false。

现在我们得要一个可以获取上笔交易的方法。由于需要和区块链交互，所以把这个方法挂在 **Blockchain** 上：

{% highlight golang %}
func (bc *Blockchain) FindTransaction(ID []byte) (Transaction, error) {
    bci := bc.Iterator()

    for {
        block := bci.Next()

        for _, tx := range block.Transactions {
            if bytes.Compare(tx.ID, ID) == 0 {
                return *tx, nil
            }
        }

        if len(block.PrevBlockHash) == 0 {
            break
        }
    }

    return Transaction{}, errors.New("Transaction is not found")
}

func (bc *Blockchain) SignTransaction(tx *Transaction, privKey ecdsa.PrivateKey) {
    prevTXs := make(map[string]Transaction)

    for _, vin := range tx.Vin {
        prevTX, err := bc.FindTransaction(vin.Txid)
        prevTXs[hex.EncodeToString(prevTX.ID)] = prevTX
    }

    tx.Sign(privKey, prevTXs)
}

func (bc *Blockchain) VerifyTransaction(tx *Transaction) bool {
    prevTXs := make(map[string]Transaction)

    for _, vin := range tx.Vin {
        prevTX, err := bc.FindTransaction(vin.Txid)
        prevTXs[hex.EncodeToString(prevTX.ID)] = prevTX
    }

    return tx.Verify(prevTXs)
}
{% endhighlight %}

这个函数很简单: **FindTransaction** 通过 ID 找到一笔交易(这需要遍历区块链上的所有区块)；**SignTransaction** 拿到交易，找到它所引用的交易，对其进行签名; **VerifyTransaction** 做的也一样，不过是验证交易。

现在，我们得真的签名并验证交易，在 **NewUTXOTransaction** 中去做：

{% highlight golang %}
func NewUTXOTransaction(from, to string, amount int, bc *Blockchain) *Transaction {
    ...

    tx := Transaction{nil, inputs, outputs}
    tx.ID = tx.Hash()
    bc.SignTransaction(&tx, wallet.PrivateKey)

    return &tx
}
{% endhighlight %}

在交易被放到区块前验证：

{% highlight golang %}
func (bc *Blockchain) MineBlock(transactions []*Transaction) {
    var lastHash []byte

    for _, tx := range transactions {
        if bc.VerifyTransaction(tx) != true {
            log.Panic("ERROR: Invalid transaction")
        }
    }
    ...
}
{% endhighlight %}

搞定！检查一下是不是都对了：

{% highlight text %}
$ blockchain_go createwallet
Your new address: 1AmVdDvvQ977oVCpUqz7zAPUEiXKrX5avR

$ blockchain_go createwallet
Your new address: 1NE86r4Esjf53EL7fR86CsfTZpNN42Sfab

$ blockchain_go createblockchain -address 1AmVdDvvQ977oVCpUqz7zAPUEiXKrX5avR
000000122348da06c19e5c513710340f4c307d884385da948a205655c6a9d008

Done!

$ blockchain_go send -from 1AmVdDvvQ977oVCpUqz7zAPUEiXKrX5avR -to 1NE86r4Esjf53EL7fR86CsfTZpNN42Sfab -amount 6
0000000f3dbb0ab6d56c4e4b9f7479afe8d5a5dad4d2a8823345a1a16cf3347b

Success!

$ blockchain_go getbalance -address 1AmVdDvvQ977oVCpUqz7zAPUEiXKrX5avR
Balance of '1AmVdDvvQ977oVCpUqz7zAPUEiXKrX5avR': 4

$ blockchain_go getbalance -address 1NE86r4Esjf53EL7fR86CsfTZpNN42Sfab
Balance of '1NE86r4Esjf53EL7fR86CsfTZpNN42Sfab': 6
{% endhighlight %}

完美！

现在试一下把 **NewUTXOTransaction** 里的 **bc.SignTransaction(&tx, wallet.PrivateKey)** 注释掉，以此来保证未被签名的交易无法被挖矿。

{% highlight golang %}
func NewUTXOTransaction(from, to string, amount int, bc *Blockchain) *Transaction {
   ...
    tx := Transaction{nil, inputs, outputs}
    tx.ID = tx.Hash()
    // bc.SignTransaction(&tx, wallet.PrivateKey)

    return &tx
}
{% endhighlight %}

{% highlight text %}
$ go install
$ blockchain_go send -from 1AmVdDvvQ977oVCpUqz7zAPUEiXKrX5avR -to 1NE86r4Esjf53EL7fR86CsfTZpNN42Sfab -amount 1
2017/09/12 16:28:15 ERROR: Invalid transaction
{% endhighlight %}

## 结论

我们现在已经实现了比特币中的大部分关键功能，太厉害了！我们已经实现了除了网络外的大部分功能，在下个部分，我们会把交易做完。

链接：

1. [完整的代码](https://github.com/Jeiwan/blockchain_go/tree/part_5)
2. [公钥加密](https://en.wikipedia.org/wiki/Public-key_cryptography)
3. [数字签名](https://en.wikipedia.org/wiki/Digital_signature)
4. [椭圆曲线](https://en.wikipedia.org/wiki/Elliptic_curve)
5. [椭圆曲线加密](https://en.wikipedia.org/wiki/Elliptic_curve_cryptography)
6. [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
7. [比特币地址的技术背景](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses)
8. [地址](https://en.bitcoin.it/wiki/Address)
9. [Base58](https://en.bitcoin.it/wiki/Base58Check_encoding)
10. [椭圆曲线加密简单入门](http://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/)

* [基本原型]({% post_url 2017-12-29-building-blockchain-in-go-part-1-basic-prototype %})
* [工作量证明]({% post_url 2017-12-30-building-blockchain-in-go-part-2-proof-of-work %})
* [持久化与命令行]({% post_url 2017-12-30-building-blockchain-in-go-part-3-persistence-and-cli %})
* [交易 1]({% post_url 2018-01-01-build-blockchain-in-go-part-4-transactions-1 %})
* [地址]({% post_url 2018-01-02-building-blockchain-in-go-part-5-addresses %})
* [交易 2]({% post_url 2018-01-06-building-blockchain-in-go-part-6-transactions-2 %})
* [网络]({% post_url 2018-01-12-building-blockchain-go-part-7-network %})

