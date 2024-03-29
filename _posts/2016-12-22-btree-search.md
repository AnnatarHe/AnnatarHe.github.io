---
layout: 'post'
title: Go语言实现二叉树遍历
tags: go algorithm
---

## 生成二叉树

{% highlight go %}
type Node struct {
	data  string
	left  *Node
	right *Node
}

nodeG := Node{data: "g", left: nil, right: nil}
nodeF := Node{data: "f", left: &nodeG, right: nil}
nodeE := Node{data: "e", left: nil, right: nil}
nodeD := Node{data: "d", left: &nodeE, right: nil}
nodeC := Node{data: "c", left: nil, right: nil}
nodeB := Node{data: "b", left: &nodeD, right: &nodeF}
nodeA := Node{data: "a", left: &nodeB, right: &nodeC}
{% endhighlight %}

图例如下:

![btree]({{ site.cdn }}/btree-02.png)

结果应该是分别是：

广度优先: a -> b -> c -> d -> f -> e -> g

先序遍历: a -> b -> d -> e -> f -> g -> c

中序遍历: e -> d -> b -> g -> f -> a -> c

后序遍历: e -> d -> g -> f -> b -> c -> a

## 广度优先遍历

结果存在result里面，如果不存可以少一层变量

{% highlight go %}
func breadthFirstSearch(node Node) []string {
	var result []string
	var nodes []Node = []Node{node}

	for len(nodes) > 0 {
		node := nodes[0]
		nodes = nodes[1:]
		result = append(result, node.data)
		if (node.left != nil) {
			nodes = append(nodes, *node.left)
		}
		if (node.right != nil) {
			nodes = append(nodes, *node.right)
		}
	}
	return result
}
{% endhighlight %}

## 递归版前中后序遍历

{% highlight go %}
func preOrderRecursive(node Node) {
	fmt.Println(node.data)
	if node.left != nil {
		preOrderRecursive(*node.left)
	}
    // 在这里输出就是中序
	if node.right != nil {
		preOrderRecursive(*node.right)
	}
    // 在这里输出是后序
{% endhighlight %}

## 非递归版遍历

这个地方强烈建议读一下下面的第一个链接，我遵照着那篇文章实现的，只是用Go改写了而已。

### seqStack

首先定义一个数据结构，用来存储一些Node的信息。

{% highlight go %}
type seqStack struct {
	data [100]*Node
	tag [100]int // 后续遍历准备
	top int // 数组下标
}
{% endhighlight %}

### preOrder

{% highlight go %}
func preOrderLoop(node *Node) (result []string) {
	var s seqStack
	s.top = -1 // 空
	if node == nil {
		panic("no data here")
	}else {
		for node != nil || s.top != -1 {
			for node != nil {
				result = append(result, node.data)
				s.top++
				s.data[s.top] = node
				node = node.left
			}
			s.top--
			node = s.data[s.top + 1]
			node = node.right
		}
	}
	return
}
{% endhighlight %}

## midOrder

{% highlight go %}
func midOrderLoop(node *Node) (result []string) {
	var s seqStack
	s.top = -1
	if node == nil {
		panic("no data here")
	}else {
		for node != nil || s.top != -1 {
			for node != nil {
				s.top++
				s.data[s.top] = node
				node = node.left
			}
			s.top--
			node = s.data[s.top + 1]
			result = append(result, node.data)
			node = node.right
		}
	}
	return
}
{% endhighlight %}

### postOrder

这里是可以运行的，但是总会抛出一个数组越界的错误，我看了半天也没看出来哪里有问题，Mac版的devel我这边又有bug，没用起来。至少思路对了，我后面再看一下哪里的问题。(感谢 @RiXu 指正)

{% highlight go %}
func postOrderLoop(node *Node) (result []string)  {
	var s seqStack
	s.top = -1

	if node == nil {
		panic("no data here")
	}else {
		for node != nil || s.top != -1 {
			for node != nil {
				s.top++
				s.data[s.top] = node
				s.tag[s.top] = 0
				node = node.left
			}

			if s.tag[s.top] == 0 {
				node = s.data[s.top]
				s.tag[s.top] = 1
				node = node.right
			}else {
				for s.tag[s.top] == 1 {
					s.top--
					node = s.data[s.top + 1]
					fmt.Println(node.data)
					result = append(result, node.data)
					if s.top < 0 {
						break
					}
				}
				node = nil
			}
		}
	}
	return
}
{% endhighlight %}

## References

* [数据结构（六）——二叉树 前序、中序、后序、层次遍历及非递归实现 查找、统计个数、比较、求深度的递归实现](http://blog.csdn.net/fansongy/article/details/6798278)

* [树的遍历](https://zh.wikipedia.org/wiki/%E6%A0%91%E7%9A%84%E9%81%8D%E5%8E%86)

* [Python 广度优先/深度优先遍历二叉树](http://www.jianshu.com/p/7d665f3c01bc)

* [JS中的二叉树遍历](https://segmentfault.com/a/1190000004620352)

