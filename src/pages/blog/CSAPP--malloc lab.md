---
layout: "../../layouts/PostLayout.astro"
title: "CSAPP malloc lab记录"
pubDate: "2023.8.3"
heroImage: "/images/cover2.png"
tags: ["CS自学记录"]
---



## 得分指标

- 空间利用率
- 吞吐量



malloc分配的空间并不一定是用户要求的空间大小，为了效率，系统一般会对分配的堆块进行对齐操作，从而多出了部分冗余的空间。另外，为了进行堆块的管理，系统一般会新增头部甚至尾部来存储块的分配状态和大小。为了提高空间利用率，设计者要尽量减少有效载荷以外空间的大小。                                       

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/v2-c0cb0926ad2e469833bfff9e3fffd2e4_r.jpg" alt="img" style="zoom:50%;" />

吞吐量主要和空闲块的组织形式有关，动态内存分配主要耗时操作在于从系统堆中找到符合要求的块返还给用户。常见的组织形式包括隐式链表、显式链表、分离链表三类。

- 隐式链表

**![img](https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/v2-b67fdbe90574f0f7c58b794a9af56b14_1440w.png)**

隐式链表块中不存在指向其他块的指针，块与块之间通过块大小来确定边界

- 显式链表

  <img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/v2-031f2c9d9b8282a33bf98ff8243b987e_1440w.png" alt="img"  />

显式链表的空闲块中有指针域指向下一个空闲块

- 分离链表

  ![img](https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/v2-b030b86e5f0314d2925352e3e62f9290_1440w.png)

分离链表是一种更精细管理空闲块的方式，将不同的空闲块按照大小分配到不同的链表上



## 设计细节

采用分离链表的组织形式，堆大小采用双字对齐。因为Makefile中使用32位编译，双字即为8字节。