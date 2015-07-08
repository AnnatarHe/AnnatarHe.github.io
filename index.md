---
layout: default
title: List of Blogs
---

{% for post in site.posts %}
<tr>
<td><a href="{{post.url}}">{{post.title}}</a></td>
<td>{{post.date|date_to_string}}</td>
</a>
</tr>
{% endfor %}