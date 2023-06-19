---
layout: "../../layouts/PostLayout.astro"
title: "CSAPP bomb lab记录"
pubDate: "2023.6.19"
heroImage: "/images/cover2.png"
tags: ["CS自学记录"]
---

## Prerequisites 

### GDB调试一些常用命令

`layout asm`：调出汇编视图

`layout regs`：调出寄存器视图

`s`、`n`：进入函数执行，单步执行（c语言层次）

`si`、`ni`：（汇编层次）

[GDB常用命令](https://beej.us/guide/bggdb/)



### X86-64寄存器

![img](https://miro.medium.com/max/1150/1*4ipwUzIWd4eqUvcEmZ5tMQ.png)



## 解题思路

### Phase1 

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230613230302159.png" alt="image-20230613230302159" style="zoom: 67%;" />

phase_1中进入`strings_not_equal`单步调试，推测此函数为字符串比较函数

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230614114051457.png" alt="image-20230614114051457" style="zoom:50%;" />

在`strings_not_equal`函数中发现有字符串的比较，rdi寄存器对应的是用户输入的值，rsi寄存器对应的则是一串字符串，输入验证为所求字符串

**Border relations with Canada have never been better.**





### Phase2

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230615155927963.png" alt="image-20230615155927963" style="zoom:50%;" />

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230615160148557.png" alt="image-20230615160148557" style="zoom:50%;" />

9:读入6个数字

14:验证第一个数字是不是1，随后跳转到52，将第2个数字传入rbx，将rbp设为第6个数字后一个地址

27～32:比较后一个数字是不是前一个数字的两倍

综上六个数字应该为等比数列

**1 2 4 8 16 32**



### Phase3 

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230615170235522.png" alt="image-20230615170235522" style="zoom:50%;" />

scanf的格式化字符串是%d %d说明输入2个数字分别保存在esp+8和exp+12处，`phase_3+39`处将第一个数字与7比较，如果大于7则失败



那么第一个数就有0～7共8种情况，然后，第二个数的判断依赖于第一个数的大小，因为这是一个间接跳转：

```asm
400f75: jmpq *0x402470(,%rax,8) # 并跳转至%rax*8+0x402470的内存保存的地址上；
```

因此，我们需要看一下可能的8种跳转：

```asm
(gdb) x/8a 0x402470
0x402470:       0x400f7c <phase_3+57>   0x400fb9 <phase_3+118>
0x402480:       0x400f83 <phase_3+64>   0x400f8a <phase_3+71>
0x402490:       0x400f91 <phase_3+78>   0x400f98 <phase_3+85>
0x4024a0:       0x400f9f <phase_3+92>   0x400fa6 <phase_3+99>
```

在对应地址处查看eax为多少，可以得到7种组合

![img](https://pic1.zhimg.com/80/v2-79ade02165e300e8189a33c65798be80_1440w.webp)

### Phase4

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230615174500805.png" alt="image-20230615174500805" style="zoom:50%;" />

第一个红框可以判断出第一个数字小于等于14

第二个红框表明退出func4函数后eax的值应为0

69:第二个数字应为0

进入func4前，edx为14，esi为0，edi为第一个输入数字

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230616191636640.png" alt="image-20230616191636640" style="zoom: 67%;" />

在20处拿第一个输入和ecx比较，ecx的值为7，发现如果第一个数字为7，func4能正确返回且eax为0

**7 0**

### Phase5 

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230616215316881.png" alt="image-20230616215316881" style="zoom:50%;" />

首先29处显示输入字符串为6个字符，随后函数在41～74之间会进入一个循环，该循环对输入的6个字符进行处理,将字符映射到地址0x4024b1开始的地址空间上，具体规则为取出输入字符c的ascii码的最后4位记为x，映射到(0x4024b0+x)处的字符

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230616215729008.png" alt="image-20230616215729008" style="zoom:50%;" />

最后比较的字符串为flyers，根据规则原字符串为

**ionefg**

### Phase6

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230617203317509.png" alt="image-20230617203317509" style="zoom:50%;" />

双重循环判断输入的六个数字是否两两不相同

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230617203421744.png" alt="image-20230617203421744" style="zoom:50%;" />

将读入的数字用7作差

> 后续内容自己做没有想明白，转载了https://zhuanlan.zhihu.com/p/104130161的解析

```asm
401174: jmp    401197 <phase_6+0xa3>
  401176: mov    0x8(%rdx),%rdx # %rdx=mem[%rdx+0x8]
  40117a: add    $0x1,%eax  # 计数器
  40117d: cmp    %ecx,%eax # 运行6次
  40117f: jne    401176 <phase_6+0x82>
  401181: jmp    401188 <phase_6+0x94> # 6次后跳出
  401183: mov    $0x6032d0,%edx
  401188: mov    %rdx,0x20(%rsp,%rsi,2)
  40118d: add    $0x4,%rsi # 另外一个循环，
  401191: cmp    $0x18,%rsi # 保证每个input值都运行过
  401195: je     4011ab <phase_6+0xb7>
  401197: mov    (%rsp,%rsi,1),%ecx # 指针偏移，依次获取6个数
  40119a: cmp    $0x1,%ecx # 比较数字 <= 1
  40119d: jle    401183 <phase_6+0x8f> # 是跳到上面
  40119f: mov    $0x1,%eax # 否 %eax = 1
  4011a4: mov    $0x6032d0,%edx # 这是一个magic number，跳转回到上面后，发现这个数字其实是地址
  4011a9: jmp    401176 <phase_6+0x82>
  # 这一块的逻辑很绕 我们可以从这个magic number入手，打印它前后的信息：
  #
  # (gdb) x 0x6032d0
    # 0x6032d0 <node1>:       0x0000014c
    #
    # 结合add = *(add+8);即mov    0x8(%rdx),%rdx，才想应该是一个数组的结构
    # 我们尝试打印出更多的信息，这个结构体的信息：
    #
    # (gdb) x/24w 0x6032d0
    # 0x6032d0 <node1>:       0x0000014c      0x00000001      0x006032e0      0x00000000
    # 0x6032e0 <node2>:       0x000000a8      0x00000002      0x006032f0      0x00000000
    # 0x6032f0 <node3>:       0x0000039c      0x00000003      0x00603300      0x00000000
    # 0x603300 <node4>:       0x000002b3      0x00000004      0x00603310      0x00000000
    # 0x603310 <node5>:       0x000001dd      0x00000005      0x00603320      0x00000000
    # 0x603320 <node6>:       0x000001bb      0x00000006      0x00000000      0x00000000
    # 那这个结构体是什么样子的呢
    # 在这里，我的输入是1 2 3 4 5 6
    # 我们看到打印出来的结果，每个node里第2个四字节的部分和我们的输入吻合；
    # 而第三个四字节的部分则是下一个node的起始地址，最后一个四字节的部分则为0，
    # 考虑到内存对齐，我们大概能推测出，这应该是一个链表，而我们的输入的数字与在第二个四字节的地方的数据有关，第一个四字节的内容表示的是什么待确定
    # 这个结构体类似：
    # struct {
  	#  int sth; // 某四字节内容
  	#  int input; // 与我们的输入有关
  	#  node* next; // 下一个node地址
    # } node;
    # 回头再看，发现其实这一快的逻辑，是将内存中数组的指针，放到了
    # 首地址为rsp+0x20 尾地址为rsp+0x50的地方
    # 所以现在有了两个数组
    # oldArray -> {0x6032d0 0x6032e0 0x6032f0 0x603300 0x603310 0x603320}
    # 
    # 这个sth是什么我们继续看下面的操作
  4011ab: mov    0x20(%rsp),%rbx # %rbx = head
  4011b0: lea    0x28(%rsp),%rax # %rax = head.next
  4011b5: lea    0x50(%rsp),%rsi # %rsi = tail
  4011ba: mov    %rbx,%rcx # %rcx = head
  4011bd: mov    (%rax),%rdx # %rdx = head.next.value
  4011c0: mov    %rdx,0x8(%rcx) # head.next.value = head.next.value
  4011c4: add    $0x8,%rax # %rax = head.next.next
  4011c8: cmp    %rsi,%rax 
  4011cb: je     4011d2 <phase_6+0xde>
  4011cd: mov    %rdx,%rcx # head.value = head.next.value
  4011d0: jmp    4011bd <phase_6+0xc9>
  4011d2: movq   $0x0,0x8(%rdx)
  4011d9:
  # 我们将断点打到4011da
  # 再次检视链表数据
  # (gdb) x/24w 0x6032d0
  # 0x6032d0 <node1>:       0x0000014c      0x00000001      0x00000000      0x00000000
  # 0x6032e0 <node2>:       0x000000a8      0x00000002      0x006032d0      0x00000000
  # 0x6032f0 <node3>:       0x0000039c      0x00000003      0x006032e0      0x00000000
  # 0x603300 <node4>:       0x000002b3      0x00000004      0x006032f0      0x00000000
  # 0x603310 <node5>:       0x000001dd      0x00000005      0x00603300      0x00000000
  # 0x603320 <node6>:       0x000001bb      0x00000006      0x00603310      0x00000000
  # 发现地址发生了变化，看起来头节点在node6上
  # 结合input原地被7减去，再多试几组数据后发现
  # struct {
  #  int value; // 下一部分需要比对的值
  #  int order; // node序号
  #  node* next; // 下一个node地址，会因为我们的input而改变链接顺序
    # } node;
    # 我们结合以下代码检视%rbx的值
  # (gdb) p/a $rbx
    # $4 = 0x603320 <node6>
    # 发现$rbx上存的就是头指针
    # 那么下面的逻辑也就一目了然了
    #
  # 我们输入的input序列被7减去后得到的序列，是一个向量
  # 向量每个数字是node的序号，向量的顺序是node的链接顺序
  # 也就是说向量的第一个序号对应的node会变成头节点
  # 按照以下的逻辑
  # 我们要求这个链表按照降序排列
  4011da: mov    $0x5,%ebp
  4011df: mov    0x8(%rbx),%rax # %rax保存是%rbx的下一个节点的指针
  4011e3: mov    (%rax),%eax # 结构体中sth的值 保存在%rax中
  4011e5: cmp    %eax,(%rbx) # 比较两个node的sth值
  4011e7: jge    4011ee <phase_6+0xfa> # 如果靠前结点的sth < 靠后结点的sth
  4011e9: callq  40143a <explode_bomb> # 爆炸
  4011ee: mov    0x8(%rbx),%rbx # 移动指针
  4011f2: sub    $0x1,%ebp  
  4011f5: jne    4011df <phase_6+0xeb> # 循环
  4011f7: add    $0x50,%rsp
  4011fb: pop    %rbx
  4011fc: pop    %rbp
  4011fd: pop    %r12
  4011ff: pop    %r13
  401201: pop    %r14
  401203: retq
```

大体逻辑是用读入的六个数字对链表进行排序，要求排序后的链表是降序输出，最后答案为 **4 3 2 1 6 5**