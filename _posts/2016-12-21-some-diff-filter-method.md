---
layout: 'post'
title: js 数组去重
tags: js array algorithm
---

最近写了一道数组去重的题，手抖，紧张，没写好。后来写了一会儿觉得还挺有意义的。现在做一下记录

## Test case

测试用例如下

{% highlight js %}

import test from 'ava'
import unique from '../src/unique'

test('[1,1,2] should return [1, 2]', t => {
    t.plan(3)
    const src = [1,1,2]
    const result = unique(src)
    t.is(result.length, 2)
    t.is(result[0], 1)
    t.is(result[1], 2)
})

test('[1, 1, "1"] should return [1, "1"]', t => {
    t.plan(4)
    const src = [1, 1, '1']
    const result = unique(src)
    t.is(result.length, 2)
    t.is(result.indexOf(1), 0)
    t.is(typeof result[1], 'string')
    t.is(result.indexOf('1'), 1)
})

test('deep unique', t => {
    const src = [1, 1, "1", false, false, true, {hello: 'world'}, [1, 2], [1, 2]]
    const result = unique(src)
    t.is(result.length, 6)
})

test('deep unique', t => {
    const src = [1, 1, "1", false, false, true, {hello: 'world'}, [1, 2], [1, 2], {hello: 'world'}]
    const result = unique(src)
    t.is(result.length, 7)
})

{% endhighlight %}

## 简单去重的几种方法

暂时先只看数组中存number的去重方法：

最粗暴的是这种，利用Set不能有重复数据的特性做
{% highlight js %}
const unique = arr => Array.from(new Set(arr))
{% endhighlight %}

正常思路如下，维护一个暂存数组，将数据存进去
{% highlight js %}
function unique(arr) {
    let temp = []
    for (let i = 0; i < arr.length; i++) {
        if (temp.indexOf(arr[i]) === -1) {
            temp.push(arr[i])
        }
    }
    return temp
}
{% endhighlight %}

reduce做去重(下面有参考链接)，意思是每次往前一个数组中塞数据，其实就是上面正常思路的去中间变量版
{% highlight js %}
function uniqueByReduce(arr) {
    return arr.reduce((prev, next) => {
        if (prev.indexOf(next) === -1) {
            prev.push(next)
        }
        return prev
    }, [])
}
{% endhighlight %}

这个时候基本int型数据都没什么问题了。

但是我上面测试用例中最后一个用例明显是无法通过的。那么就需要更多的判断

## 更复杂的去重

先贴代码:

{% highlight js %}
function unique(arr) {
    let temp = []
    for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] === 'object' && (! Array.isArray(arr[i]))) {
            if (! objects.contains(temp, arr[i])) {
                temp.push(arr[i])
            }
        }else if (Array.isArray(arr[i])) {
            if (! arrays.contains(temp, arr[i])) {
                temp.push(arr[i])
            }
        }else {
            if (temp.indexOf(arr[i]) === -1) {
                temp.push(arr[i])
            }
        }
    }
    return temp
}
{% endhighlight %}

意思是在推进去的时候多做一些判断，主要是对Object和Array的判定。

其中有`objects.contains`和`arrays.contains`两个方法做判定工作。其实现分别如下

{% highlight js %}
// array.js
export function equals(src, dist) {
    if ((! Array.isArray(src)) || (! Array.isArray(dist))) {
        throw new Error('请传入Array哦~😃')
    }

    if (src.length !== dist.length) {
        return false
    }

    for (let index = 0; index < src.length; index++) {
        if (Array.isArray(src[index]) && Array.isArray(dist[index])) {
            if (! equals(src[index], dist[index])) {
                return false
            }
        } else {
            if (src[index] !== dist[index]) {
                return false
            }
        }
    }
    return true
}

export function contains(father, child) {
    let flags = []
    father.forEach(item => {
        if (Array.isArray(item)) {
            if (equals(item, child)) {
                flags.push(true)
            }
        }
    })

    return flags.indexOf(true) !== -1
}
{% endhighlight %}

{% highlight js %}
// objects.js
function isPlainObj(obj) {
    return typeof obj === 'object' && (! Array.isArray(obj)) && obj !== null
}

export function equals(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false
    }

    for (let item in obj1) {
        // 这里简单判断算了，后面可以更复杂
        if (isPlainObj(obj1[item])) {
            if (isPlainObj(obj2[item])) {
                if (! equals(obj1[item], obj2[item])) {
                    return false
                }
            }else {
                return false
            }
        }else {
            if (obj1[item] !== obj2[item]) {
                return false
            }
        }
    }

    return true
}

export function contains(father, child) {
    for (let key in father) {
        if (isPlainObj(father[key])) {
            // 因为只给了值，所以得有个中间层
            const tempObj = {
                [key]: father[key]
            }
            if (equals(tempObj, child)) {
                return true
            }
        }
    }
    return false
}

{% endhighlight %}

关于array.js和objects.js的测试用例我就不给出了。

反正最后测试都通过了，感觉真好~

## References

* [数组去重的几个方法](http://www.zhuowenli.com/frontend/array-unique.html)

* [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
