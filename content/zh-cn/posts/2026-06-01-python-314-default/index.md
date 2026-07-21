---
title: "Python 3.14 成为默认版本（2026-06-01）"
description: "Gentoo 已把系统默认的 Python 从 3.13 换成 3.14。大多数人不用管，等它自己升过去就行；想自己控制升级时机、或升级时遇到 USE / 依赖报错的，这篇说说怎么办。"
date: 2026-06-01
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

**2026-06-01 起，Gentoo 把系统默认的 Python 从 3.13 换成了 3.14。**

如果你从没自己设过 `PYTHON_TARGETS` 或 `PYTHON_SINGLE_TARGET`（大多数人都没设过），那基本不用管——下次 `emerge` 升级时，系统会自动开始往 3.14 切。

> 官方公告原文：[Python 3.14 to become the default on 2026-06-01](https://www.gentoo.org/support/news-items/2026-04-16-python3-14.html)（2026-04-16 发布；本机也能用 `eselect news read` 看）。

## 大多数人：等它自己升就行

很多包还在往 3.14 适配，所以**不用着急**——跟着平时的 `@world` 升级，让它慢慢切过去就好。

升级的过程是这样的：每个包在重新编译时，顺带就切到新的 Python。所以一串互相依赖的包，得**都**支持 3.14 了，升级才推得动；中途可能有个别命令**暂时**找不到依赖（已经开着的程序一般不受影响）。这些都是过渡期的正常现象，全部升完就好了。

## 如果你在 make.conf 里设过 Python 版本，先删掉

{{< callout type="warning" >}}
如果你在 `make.conf` 里写过 `PYTHON_TARGETS` 或 `PYTHON_SINGLE_TARGET`，**先把它们删掉**——官方不建议在 make.conf 里设 Python 版本，它会盖掉各个包自己该用的默认值。

下面要写的配置，统一放到 **`/etc/portage/package.use/python`** 这个文件里（`package.use` 是个目录，文件名随便取，这里就叫 `python`）。
{{< /callout >}}

## 想自己控制升级时机

下面几种做法，挑一种就行。

**① 跟着默认走，自动升**

什么都不设，系统会自己处理。万一中途卡住，手动跑一遍后面的「升级命令」。

**② 先不升，暂时留在 3.13**

往 `/etc/portage/package.use/python` 写：

```
*/* PYTHON_TARGETS: -* python3_13
*/* PYTHON_SINGLE_TARGET: -* python3_13
```

这只是拖一拖，早晚还是要升的。

**③ 现在就升到 3.14**

往 `/etc/portage/package.use/python` 写：

```
*/* PYTHON_TARGETS: -* python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

然后跑后面的「升级命令」。等默认正式切过去之后，记得把这两行**删掉**——不然将来会挡住自动升到 3.15。

**④ 更稳妥的分步升级**

先让 3.13、3.14 两个版本并存，再慢慢撤掉 3.13。相关的包要编两遍，更慢，但中途出问题的概率更低。

第一步，往 `/etc/portage/package.use/python` 写（两版并存），跑一遍「升级命令」：

```
*/* PYTHON_TARGETS: -* python3_13 python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_13
```

第二步，改成下面这样，再跑一遍：

```
*/* PYTHON_TARGETS: -* python3_13 python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

第三步，只留 3.14，最后再升一遍：

```
*/* PYTHON_TARGETS: -* python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

## 升级命令

切换版本时，旧的 3.13 要从整个依赖树里**一起**清掉；要是有掉队的旧包没收拾干净，就会报依赖冲突。所以升级要走 `--deep --changed-use @world`，并且升级前先把没用的孤儿包清了：

```
emerge --depclean
emerge -1vUD @world
emerge --depclean
```

## Python 3.11 和 PyPy 3.11 这次也会移除

这轮还会移除对 `python3_11` 和 PyPy 3.11（`pypy3_11`）的支持。PyPy 目前没有兼容 Python 3.12 的版本，因此 Gentoo 会暂时移除 PyPy 支持，待新版本发布后再恢复。

## 升级时报 USE 冲突怎么办

过渡期里，如果某个包还没适配 3.14，`@world` 升级时可能会报 `The following USE changes are necessary to proceed`。这通常是暂时的：按上面 **②** 的写法，给对应的包指定 Python 版本绕过去，或者等几天让包跟上，就能继续。

有问题可以到 [Telegram 群](https://t.me/gentoo_zh) 或 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) 反馈。
