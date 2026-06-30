---
title: "如何參與 Gentoo Wiki 的翻譯工作"
description: "面向中文譯者的 Gentoo Wiki 翻譯入門：前置要求、賬號與翻譯權限申請、翻譯介面用法，以及翻譯規範與中文排版約定。"
date: 2026-06-30
tags: ["wiki", "翻譯", "貢獻"]
authors:
  - name: Mame
    image: /contributors/yangmame/feature.webp
    link: https://github.com/YangMame
  - name: Clover（審校）
    image: /contributors/simplewrite/feature.webp
    link: https://github.com/simpleWrite
  - name: Zakk（審校）
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/Zakkaus
---

## 前置要求

- 擁有基礎的 Linux 知識
- 基本掌握 Gentoo 系統和 Portage 包管理的使用
- 良好的英語基礎和語言習慣，並熟悉大部分計算機專業詞彙

如果你自覺滿足以上要求，哪怕不能滿足個別要求，只要你有相當的耐心，那就大膽開工。

## 準備工作

首先需要註冊 Gentoo Wiki 賬號：[Special:CreateAccount](https://wiki.gentoo.org/index.php?title=Special:CreateAccount)。

註冊完成後，進入下方連結留言，為自己的賬號申請翻譯權限：[Gentoo Wiki:Translator account requests](https://wiki.gentoo.org/wiki/Gentoo_Wiki:Translator_account_requests)。

在等待透過申請期間，可以透過空空前輩的[翻譯歷史](https://wiki.gentoo.org/index.php?title=Special:Contributions/%E7%A9%BA%E7%A9%BA&offset=&limit=500&target=%E7%A9%BA%E7%A9%BA)來學習。

## 開始

鑑於新手可能難以找到翻譯的介面，可以使用[這個連結](https://wiki.gentoo.org/index.php?title=Special:Translate)搜尋你想要翻譯的頁面：

![搜尋想要翻譯的頁面](search.webp)

或者你也可以直接在這個頁面開始工作，新增或校驗過時的翻譯。

{{< callout type="warning" >}}
在這個頁面直接翻譯時，大部分內容沒有上下文，請謹慎翻譯句子。
{{< /callout >}}

例如，新增翻譯：

![新增翻譯](new-translation.webp)

校驗過時翻譯：

![校驗過時翻譯](verify-translation.webp)

當你打膩了這些小怪後，就可以開始挑戰翻譯整篇文章了。找到自己想翻譯的未翻譯頁面：

![找到未翻譯的頁面](find-page.webp)

此時記得轉到“所有”以防漏過上下文，或直接訪問原文連結：

![轉到“所有”檢視](switch-to-all.webp)

## 翻譯規範

### 拼寫

- 儘量避免不必要的縮寫詞。
- 專有名詞的拼寫與專案官方主頁裡面的拼寫保持一致。

### 措辭

- 文章的措辭應做到十分正式、專業且精確。
- 編寫時，請注意不光說怎麼樣，還要回答為什麼？解釋遠勝單純的指導。
- 不要加入個人評論，後者應該放到討論頁面，一般不要用第一人稱。
- 不要說現在、當前等等，請給出具體的時間。
- 編輯內容時，保持和頁面其它內容的一致性，用一樣的人稱描述。
- 在多個選項間提供選擇時，不要感性地建議一個或另一個，請客觀地描述每一個選擇的優點和缺點，讓使用者自行選擇。
- 翻譯頁面時，請儘量避免使用第二人稱代詞“你”或“您”。確實需要使用第二人稱代詞時，如果頁面中現存的翻譯已使用其中的一種，請與其保持一致；如果使用了多種，請考慮統一為其中的一種；如果頁面中沒有使用，則可以自行決定使用哪一種，但請確保在翻譯中保持一致。

### 三個基本原則

1. 總是正確使用編輯摘要；
2. 不要一次進行大量的改動；
3. 進行頁面重排前應進行討論。

這三條是中文 wiki 約定俗成的編輯規則，整理自 [ArchLinux 中文 Wiki · 三個基本原則](https://wiki.archlinuxcn.org/wiki/Project:%E8%B4%A1%E7%8C%AE#%E4%B8%89%E4%B8%AA%E5%9F%BA%E6%9C%AC%E5%8E%9F%E5%88%99)。

### 中文排版

- 中文之間不要加空格（即使樣式不同，比如包含連結）；
- 儘量避免使用中文斜體。

### 中英文混排

- 英文和數字使用半形字元；
- 中文文字之間不加空格；
- 中文文字與英文、阿拉伯數字及 `@ # $ % ^ & * . ( )` 等符號之間加空格；
- 中文標點之間不加空格；
- 中文標點與前後字元（無論全形或半形）之間不加空格；
- 翻譯時，正文的英文常見標點等需要換為中文標點；
- 當半形符號 `/` 表示“或者”之意時，與前後的字元之間均不加空格。

以上排版規則為中文 wiki 約定俗成，整理自 [ArchLinux 中文 Wiki · 風格](https://wiki.archlinuxcn.org/wiki/Help:%E9%A3%8E%E6%A0%BC)。

## 關於 AI 翻譯

Gentoo 理事會於 2024 年 4 月通過了 [AI 政策](https://wiki.gentoo.org/wiki/Project:Council/AI_policy)：

> 嚴禁向 Gentoo 提交任何借助自然語言處理人工智慧工具創建的內容。如果此類工具的使用不涉及版權、倫理或品質問題，則可以重新考慮此禁令。

機器翻譯與大語言模型同屬此類工具，因此請勿用 AI 代為翻譯後直接提交，譯文須由你本人完成。這既是政策要求，也關乎 wiki 品質：AI 譯文常常看似通順，實則用詞不精準、容易出現歧義，因而需要大量人工複核，反而增加工作量。

借助詞典、術語庫、智慧工具幫助理解是可以的，但最終的句子請自己斟酌、自己落筆。

## 擴展閱讀

- [Gentoo Wiki 翻譯幫助頁面](https://wiki.gentoo.org/wiki/Help:Translating/zh-cn)
