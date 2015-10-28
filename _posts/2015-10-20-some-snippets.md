---
layout: post
title: 小贴条
---

## Purpose

这篇帖子的目的是贴一部分小的 `snippets`。时常可以用来翻看的。

## JavaScript

### react-native
{% highlight console %}
# Windows
node node_modules/react-native/packager/packager.js --nonPersistent
{% endhighlight %}


## PHP

### tinker

创建账户
{% highlight console %}
App\User::create(['name'=> 'Annatar', 'email' => '123@123.com', 'password'=>password_hash('123123', PASSWORD_BCRYPT)]);
{% endhighlight %}

### 验证码

{% highlight php %}
<?php
  $fontsize = 6;
  $width = 100;
  $height = 30;
  // 创建画布，并返回资源
  $image = imagecreatetruecolor($width , $height);
  // 设置画布颜色
  $bgcolor = imagecolorallocate($image,255,255,255);
  // 从左到右填充颜色
  imagefill($image,0,0,$bgcolor);
  // 在图片上生成四个数字
  for ($i=0; $i < 4; $i++) {
    // 创建字体颜色
    $fontColor = imagecolorallocate($image,rand(0,120),rand(0,120),rand(0,120));
    $content   = rand(0,9);
    // 数字的位置
    $x         = ($i * 100 / 4) + rand(5,10);
    $y         = rand(5,10);
    imagestring($image , $fontsize , $x, $y, $content, $fontColor);
  }
  // 设置干扰点
  for ($i=0; $i < 200; $i++) {
    $pointColor = imagecolorallocate($image,rand(50,200),rand(50,200),rand(50,200));
    imagesetpixel($image,rand(1,99),rand(1,29),$pointColor);
  }
  // 干扰线
  for ($i=0; $i < 3; $i++) {
    $lineColor = imagecolorallocate($image, rand(80,220), rand(80,220), rand(80,220));
    imageline($image,rand(1,99),rand(1,29),rand(1,99),rand(1,29),$lineColor);
  }
  // 输出
  header('content-type:image/png');
  imagepng($image);
  imagedestroy($image);
?>
{% endhighlight %}

## CSS

### 背景色渐变

{% highlight css %}
div {
  background: linear-gradient(135deg, red, blue);
}
{% endhighlight %}

### PHP Configure

{% highlight console %}
./configure --enable-debug --with-mysql --with-gd --with-curl --prefix=/opt/php5 --enable-fpm --enable-cgi --with-openssl --with-mbstring
{% endhighlight %}
