---
title: "如何参与 Gentoo Wiki 的翻译工作"
description: "面向中文译者的 Gentoo Wiki 翻译入门：前置要求、账号与翻译权限申请、翻译界面用法，以及翻译规范与中文排版约定。"
date: 2026-06-30
tags: ["wiki", "翻译", "贡献"]
authors:
  - name: Mame
    image: /contributors/yangmame/feature.webp
    link: https://github.com/YangMame
  - name: Clover（审校）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
  - name: Zakk（审校）
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/Zakkaus
---

## 前置要求

- 拥有基础的 Linux 知识
- 基本掌握 Gentoo 系统和 Portage 包管理的使用
- 良好的英语基础和语言习惯，并熟悉大部分计算机专业词汇

如果你自觉满足以上要求，哪怕不能满足个别要求，只要你有相当的耐心，那就大胆开工。

## 准备工作

首先需要注册 Gentoo Wiki 账号：[Special:CreateAccount](https://wiki.gentoo.org/index.php?title=Special:CreateAccount)。

注册完成后，进入下方链接留言，为自己的账号申请翻译权限：[Gentoo Wiki:Translator account requests](https://wiki.gentoo.org/wiki/Gentoo_Wiki:Translator_account_requests)。

在等待通过申请期间，可以通过空空前辈的[翻译历史](https://wiki.gentoo.org/index.php?title=Special:Contributions/%E7%A9%BA%E7%A9%BA&offset=&limit=500&target=%E7%A9%BA%E7%A9%BA)来学习。

## 开始

鉴于新手可能难以找到翻译的界面，可以使用[这个链接](https://wiki.gentoo.org/index.php?title=Special:Translate)搜索你想要翻译的页面：

![搜索想要翻译的页面](search.webp)

或者你也可以直接在这个页面开始工作，新增或校验过时的翻译。

{{< callout type="warning" >}}
在这个页面直接翻译时，大部分内容没有上下文，请谨慎翻译句子。
{{< /callout >}}

例如，新增翻译：

![新增翻译](new-translation.webp)

校验过时翻译：

![校验过时翻译](verify-translation.webp)

当你打腻了这些小怪后，就可以开始挑战翻译整篇文章了。找到自己想翻译的未翻译页面：

![找到未翻译的页面](find-page.webp)

此时记得转到“所有”以防漏过上下文，或直接访问原文链接：

![转到“所有”视图](switch-to-all.webp)

## 翻译规范

### 拼写

- 尽量避免不必要的缩写词。
- 专有名词的拼写与项目官方主页里面的拼写保持一致。

### 措辞

- 文章的措辞应做到十分正式、专业且精确。
- 编写时，请注意不光说怎么样，还要回答为什么？解释远胜单纯的指导。
- 不要加入个人评论，后者应该放到讨论页面，一般不要用第一人称。
- 不要说现在、当前等等，请给出具体的时间。
- 编辑内容时，保持和页面其它内容的一致性，用一样的人称描述。
- 在多个选项间提供选择时，不要感性地建议一个或另一个，请客观地描述每一个选择的优点和缺点，让用户自行选择。
- 翻译页面时，请尽量避免使用第二人称代词“你”或“您”。确实需要使用第二人称代词时，如果页面中现存的翻译已使用其中的一种，请与其保持一致；如果使用了多种，请考虑统一为其中的一种；如果页面中没有使用，则可以自行决定使用哪一种，但请确保在翻译中保持一致。

### 三个基本原则

1. 总是正确使用编辑摘要；
2. 不要一次进行大量的改动；
3. 进行页面重排前应进行讨论。

这三条是中文 wiki 约定俗成的编辑规则，整理自 [ArchLinux 中文 Wiki · 三个基本原则](https://wiki.archlinuxcn.org/wiki/Project:%E8%B4%A1%E7%8C%AE#%E4%B8%89%E4%B8%AA%E5%9F%BA%E6%9C%AC%E5%8E%9F%E5%88%99)。

### 中文排版

- 中文之间不要加空格（即使样式不同，比如包含链接）；
- 尽量避免使用中文斜体。

### 中英文混排

- 英文和数字使用半角字符；
- 中文文字之间不加空格；
- 中文文字与英文、阿拉伯数字及 `@ # $ % ^ & * . ( )` 等符号之间加空格；
- 中文标点之间不加空格；
- 中文标点与前后字符（无论全角或半角）之间不加空格；
- 翻译时，正文的英文常见标点等需要换为中文标点；
- 当半角符号 `/` 表示“或者”之意时，与前后的字符之间均不加空格。

以上排版规则为中文 wiki 约定俗成，整理自 [ArchLinux 中文 Wiki · 风格](https://wiki.archlinuxcn.org/wiki/Help:%E9%A3%8E%E6%A0%BC)。

## 关于 AI 翻译

Gentoo 理事会于 2024 年 4 月通过了 [AI 政策](https://wiki.gentoo.org/wiki/Project:Council/AI_policy)：

> 严禁向 Gentoo 提交任何借助自然语言处理人工智能工具创建的内容。如果此类工具的使用不涉及版权、伦理或质量问题，则可以重新考虑此禁令。

机器翻译与大语言模型同属此类工具，因此请勿用 AI 代为翻译后直接提交，译文须由你本人完成。这既是政策要求，也关乎 wiki 质量：AI 译文常常看似通顺，实则用词不精准、容易出现歧义，因而需要大量人工复核，反而增加工作量。

借助词典、术语库、智能工具帮助理解是可以的，但最终的句子请自己斟酌、自己落笔。

## 扩展阅读

- [Gentoo Wiki 翻译帮助页面](https://wiki.gentoo.org/wiki/Help:Translating/zh-cn)
