---
layout: "../../layouts/PostLayout.astro"
title: "CSAPP proxy lab记录"
pubDate: "2023.8.3"
heroImage: "/images/cover2.png"
tags: ["CS自学记录"]
---


tiny端口：4500

proxy端口：4501



## 注意的点

- 浏览器会自动解析url中的host吗？例如访问http://www.cmu.edu/hub/index.html，请求为`GET http://www.cmu.edu/hub/index.html HTTP/1.1`还是`GET /hub/index.html HTTP/1.1`？这会影响到`parse_uri`中相应的处理
  - 猜测使用curl构造http request不会自动解析，若是浏览器访问可以自动解析出host name

- 



## part 3

cache设计有两个点

- 替换算法
- 命中过程 