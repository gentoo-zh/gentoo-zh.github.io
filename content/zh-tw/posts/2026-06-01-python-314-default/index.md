---
title: "Python 3.14 成為預設版本（2026-06-01）"
description: "Gentoo 已把系統預設的 Python 從 3.13 換成 3.14。大多數人不用管，等它自己升過去就行；想自己控制升級時機、或升級時遇到 USE / 依賴報錯的，這篇說說怎麼辦。"
date: 2026-06-01
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

**2026-06-01 起，Gentoo 把系統預設的 Python 從 3.13 換成了 3.14。**

如果你從沒自己設過 `PYTHON_TARGETS` 或 `PYTHON_SINGLE_TARGET`（大多數人都沒設過），那基本不用管——下次 `emerge` 升級時，系統會自動開始往 3.14 切。

> 官方公告原文：[Python 3.14 to become the default on 2026-06-01](https://www.gentoo.org/support/news-items/2026-04-16-python3-14.html)（2026-04-16 釋出；本機也能用 `eselect news read` 看）。

## 大多數人：等它自己升就行

很多包還在往 3.14 適配，所以**不用著急**——跟著平時的 `@world` 升級，讓它慢慢切過去就好。

升級的過程是這樣的：每個包在重新編譯時，順帶就切到新的 Python。所以一串互相依賴的包，得**都**支援 3.14 了，升級才推得動；中途可能有個別指令**暫時**找不到依賴（已經開著的程式一般不受影響）。這些都是過渡期的正常現象，全部升完就好了。

## 如果你在 make.conf 裡設過 Python 版本，先刪掉

{{< callout type="warning" >}}
如果你在 `make.conf` 裡寫過 `PYTHON_TARGETS` 或 `PYTHON_SINGLE_TARGET`，**先把它們刪掉**——官方不建議在 make.conf 裡設 Python 版本，它會蓋掉各個包自己該用的預設值。

下面要寫的配置，統一放到 **`/etc/portage/package.use/python`** 這個檔案裡（`package.use` 是個目錄，檔名隨便取，這裡就叫 `python`）。
{{< /callout >}}

## 想自己控制升級時機

下面幾種做法，挑一種就行。

**① 跟著預設走，自動升**

什麼都不設，系統會自己處理。萬一中途卡住，手動跑一遍後面的「升級指令」。

**② 先不升，暫時留在 3.13**

往 `/etc/portage/package.use/python` 寫：

```
*/* PYTHON_TARGETS: -* python3_13
*/* PYTHON_SINGLE_TARGET: -* python3_13
```

這只是拖一拖，早晚還是要升的。

**③ 現在就升到 3.14**

往 `/etc/portage/package.use/python` 寫：

```
*/* PYTHON_TARGETS: -* python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

然後跑後面的「升級指令」。等預設正式切過去之後，記得把這兩行**刪掉**——不然將來會擋住自動升到 3.15。

**④ 更穩妥的分步升級**

先讓 3.13、3.14 兩個版本並存，再慢慢撤掉 3.13。相關的包要編兩遍，更慢，但中途出問題的機率更低。

第一步，往 `/etc/portage/package.use/python` 寫（兩版並存），跑一遍「升級指令」：

```
*/* PYTHON_TARGETS: -* python3_13 python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_13
```

第二步，改成下面這樣，再跑一遍：

```
*/* PYTHON_TARGETS: -* python3_13 python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

第三步，只留 3.14，最後再升一遍：

```
*/* PYTHON_TARGETS: -* python3_14
*/* PYTHON_SINGLE_TARGET: -* python3_14
```

## 升級指令

切換版本時，舊的 3.13 要從整個依賴樹裡**一起**清掉；要是有掉隊的舊包沒收拾乾淨，就會報依賴衝突。所以升級要走 `--deep --changed-use @world`，並且升級前先把沒用的孤兒包清了：

```
emerge --depclean
emerge -1vUD @world
emerge --depclean
```

## Python 3.11 和 PyPy 3.11 這次也會移除

這輪還會移除對 `python3_11` 和 PyPy 3.11（`pypy3_11`）的支援。PyPy 目前沒有相容 Python 3.12 的版本，因此 Gentoo 會暫時移除 PyPy 支援，待新版本釋出後再恢復。

## 升級時報 USE 衝突怎麼辦

過渡期裡，如果某個包還沒適配 3.14，`@world` 升級時可能會報 `The following USE changes are necessary to proceed`。這通常是暫時的：按上面 **②** 的寫法，給對應的包指定 Python 版本繞過去，或者等幾天讓包跟上，就能繼續。

有問題可以到 [Telegram 群](https://t.me/gentoo_zh) 或 [GitHub](https://github.com/gentoo-zh/gentoo-zh.github.io) 反饋。
