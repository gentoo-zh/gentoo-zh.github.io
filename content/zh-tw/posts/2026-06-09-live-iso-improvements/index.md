---
title: "中文社群近期更新：Live ISO、官網、下載站與測速"
description: "把社群最近這段時間的改動整理一下：定製的 KDE Live ISO、Calamares 安裝器、gentoo-zh overlay、自動構建流水線、官網（遷移到 Hextra 並新增英文）、下載站與測速站。"
date: 2026-06-09
tags: ["announcement"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

把社群最近這段時間的改動整理一下，分專案說。各項都附了倉庫連結，想看完整改動可以翻提交記錄。

## Live ISO

中文社群定製的 KDE Plasma 6 桌面 Live ISO（[Gentoo-zh/Live-ISO](https://github.com/Gentoo-zh/Live-ISO)）：

- **三語言開箱即用**：引導選單分簡體 / 繁體 / 英文三檔，整套 live 環境跟著所選語言走；裝好的系統也沿用你在安裝器裡選的語言。
- **預置中文輸入法**：fcitx5 + rime，開箱即可輸入，內建朙月拼音、注音、五筆86、倉頡、粵拼。
- **閉源 NVIDIA 可選**：引導選單選 NVIDIA 項會常規載入閉源驅動（需先關 Secure Boot）；不選則用開源 nouveau。
- **順手的 live 桌面開關**：桌面放了幾個僅 live 用的一鍵圖示，需要時點一下即可——臨時關閉自動休眠 / 鎖屏（折騰或裝機時不被打斷）、開啟免密 sudo、一鍵開啟 SSH（方便遠端裝機或除錯）。
- **裝好的系統是乾淨的**：上面這些 live 便利（連同預設的 SDDM 免密自動登入）都只在 live 裡，安裝器裝機時會復位 / 清掉，裝好的系統回到 KDE 正常預設：登入要密碼、sudo 要授權、休眠鎖屏照常。
- **開箱即用的細節**：PipeWire 音訊、網路開機自動連、MAKEOPTS 與 CPU 指令集按你的機器自適應。

裝系統推薦照 [Gentoo 官方手冊](https://wiki.gentoo.org/wiki/Handbook:AMD64/zh-cn) 一步步來更穩妥；live 裡也帶了圖形安裝器（Calamares），想快速裝也可以用。

## 安裝器（Calamares）

安裝器配置 [Gentoo-zh/calamares-settings-gig](https://github.com/Gentoo-zh/calamares-settings-gig)：裝機後會清掉 live 專用的殘留設定，並按你在 live 裡選的顯示卡方案配置 NVIDIA。分割槽時根檔案系統預設 btrfs，也可選 xfs / ext4 / ZFS——選 ZFS 並勾選加密就是 ZFS 原生加密（aes-256-gcm）、由 ZFSBootMenu 引導（GRUB 讀不了帶原生加密的 ZFS 池，所以 ZFS 根改用 ZBM）。這套裝機流程（含 ZFS 加密安裝）在虛擬機器上做過實機安裝測試。

## Live ISO 用的 overlay

Live ISO 構建所需的包來自 [Gentoo-zh/gig](https://github.com/Gentoo-zh/gig)——它是 Gig OS overlay 的 fork、專給 Live ISO 用，跟社群主 overlay [gentoo-zh](https://github.com/microcai/gentoo-zh) 不是一個。這次把其中的 Calamares 更新到支援 Python 3.14 的 3.3.14-r8，修復了 `emerge --sync` 的報錯，並清理了一批冗餘 / 失效的包。

## 自動構建與釋出

構建流水線 [Zakkaus/gentoozh-liveiso-infra](https://github.com/Zakkaus/gentoozh-liveiso-infra)：Live ISO 每週一自動編譯，編好後上傳到 **Cloudflare R2**。流水線會逐位元組核對「R2 上的 = 這次編出來的」、並確認下載頁已反映新鏡像，一致才算上線；也加了對滾動樹過渡期 USE / 關鍵字變化的自適應處理（見 [Python 3.14 成為預設版本](/posts/2026-06-01-python-314-default/)）。

## 官網

官網 [www.gentoo.org.cn](https://www.gentoo.org.cn/)（原始碼 [gentoo-zh.github.io](https://github.com/Gentoo-zh/gentoo-zh.github.io)）從 Blowfish 遷移到了 Hextra——更輕、更快、對文件和文字瀏覽器更友好（細節見[遷移那篇](/posts/2026-05-29-migrate-to-hextra/)）。表現層抽成了獨立的 Hextra 補丁包 [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)，補全了 SEO、頁尾與無障礙。下載頁也接入了下載站、補了 Live ISO 的功能說明和硬體要求，並新增了 FAQ 頁。這次還給公共頁面加了**英文國際化**，簡 / 繁 / 英可切。

## 下載站

下載站 [mirror.gentoozh.org](https://mirror.gentoozh.org/)（原始碼 [Zakkaus/gentoozh-mirror](https://github.com/Zakkaus/gentoozh-mirror)）**遷到了 Cloudflare，不再用自建伺服器**：ISO 存 **Cloudflare R2**（`r2.gentoozh.org`，零出口流量、全球邊緣、可快取），落地頁改成 **Cloudflare Worker**——在邊緣即時讀 R2，列出最新鏡像和**全部歷史版本**，永遠反映當前內容。頁面保留簡 / 繁 / 英三語與淺 / 深色。

## 測速站

測速改用 [Cloudflare 官方測速](https://speed.cloudflare.com/)——下載本來就走 Cloudflare 邊緣，用它測更貼近實際下載速度；原先自建的 speed.gentoozh.org 隨下載站上雲一併下線。

---

想試 Live ISO 就到[下載頁](/download/)。有問題歡迎到 [Telegram 群](https://t.me/gentoo_zh) 或各專案的 GitHub 反饋。
