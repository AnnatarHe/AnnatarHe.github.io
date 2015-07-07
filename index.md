---
title: helloworld
---

#Hello world
{% highlight c %}
	/* hello world demo */
	#include <stdio.h>
	int main(int argc, char **argv)
	{
	    printf("Hello, World!\n");
	    return 0;
	}
{% endhighlight %}

{% for post in site.posts %}
[{{post.title}}]({{post.url}})
{% endfor %}
