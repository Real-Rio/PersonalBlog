---
layout: "../../layouts/PostLayout.astro"
title: "博客搭建记录"
description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
pubDate: "2022.12.31"
heroImage: "/post_img.webp"
tags: ["Blog"]
updatedDate: "2023.1.1"
---






## 技术选型

- astro
- theme：https://github.com/manuelernestog/astro-modern-personal-website
- daisyUI
- netlify
- tailwind
- sitemap



## 导入主题

我理想中的博客颜值是放在第一位的，最好留白要多，内容密度不要这么大，整体黑白色调走高级风。astro官网的主题商店选择并不是特别多，这一款比较对感觉。整体很简洁，左侧有一个边栏进行内容的划分，右侧是主要的内容展示，看了下源代码结构也很清晰，方便后续的更新迭代。

![](https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20221231205546.png)

从作者的[github主题](https://github.com/manuelernestog/astro-modern-personal-website)中clone下来`npm install` `npm run dev`后即可跑起来，随后修改一下个人信息，将项目push到自己的github仓库



## 博客部署

<img src="https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20221231202731.png?token=AOCZR6IM3GJAFI6ICN66WYDDWAVPE" style="zoom:25%;" />

在netlify上新建站点，选择从github上导入已有项目

<img src="https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20221231203027.png?token=AOCZR6OR6OKDZHCRQYBC6U3DWAV2C" style="zoom:25%;" />

导入后如图所示



## 域名配置

<img src="https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20221231201855.png?token=AOCZR6JHNE5JD7YK3LLDDVTDWAUO6" style="zoom: 25%;" />

阿里云上购买域名，需要登记一些个人信息



<img src="https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20221231212615.png" style="zoom:33%;" />

在阿里云上配置域名解析，将我们买的域名解析到netlify上生成的域名中，类型为CNAME，配置好后要等个5分钟dns记录才能同步



![](https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20221231214802.png)

配置好域名解析后在netlify上按照提示将我们购买的域名添加上去，这样可以利用netlify的dns服务器加速，国外访问的话会快速一点



![](https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20221231220248.png)

在cloudflare上配置CDN加速

<img src="https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20230101092803.png" style="zoom:33%;" />

修改阿里云上默认的dns服务器为cloudflare提供的dns服务器



## https配置

<img src="https://raw.githubusercontent.com/Real-Rio/pictures/main/img/20230101093321.png" style="zoom:33%;" />

在完成之前的配置之后，可以看到netlify已经自动配置好了证书，完成了https的配置。如果没有自动完成的话，在这个界面跟着引导一路操作就好了

## 待解决

- [ ] tailwind语法
- [ ] 优雅地上传图片
- [ ] front matter
- [ ] sitemap
- [ ] 夜间模式
- [ ] 标签管理系统

