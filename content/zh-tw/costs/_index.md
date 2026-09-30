---
title: "基礎設施開銷"
description: "Gentoo 中文社群各臺伺服器的配置、價格與累計支出，數字隨網站建置更新。"
---

下面的伺服器與服務中，建置伺服器由 [OSUOSL](https://osuosl.org/) 贊助，其餘由 [Zakk](/contributors/zakkaus/) 個人承擔，沒有社群經費。另有幾項由其他成員承擔，列在文末。

## 裝置

{{< gz-costs >}}

## 支出

{{< gz-costs table="ledger" >}}

## 計算方式

- 累計從起算日計到今天：按月付費的按已開始的月數計，按年付費的按已付的年數計。因為年付是一次付清整年，所以不按天數攤分。
- 匯率取自下載伺服器年付的實際扣款：100 EUR 折合 115.24 USD、777 CNY、3713.80 TWD、900 HKD。各項幣種不同，表內統一折成美元再合計。

## 各項用途

- **下載伺服器**：[distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 的源站，提供 overlay 的 distfiles 與二進位包，同時作為各高校鏡像的 rsync 同步源。
- **建置伺服器**：每晚建置 overlay 的[二進位包](/posts/2026-07-29-binhost-launch/)。2026-09-27 起改由 OSUOSL 贊助的伺服器承擔，不產生費用。此前自有的 80 執行緒伺服器於 2026-09-29 停用，表中保留它停用前的支出。
- **論壇伺服器**：執行 [forum.gentoozh.org](https://forum.gentoozh.org/)。
- **Matrix 與橋接伺服器**：執行 Matrix 服務端，以及 Telegram、IRC、Matrix 之間的訊息轉發。
- **高可用節點**：異地探測鏡像與各網站，與主力機不在同一機房，避免同時失效。2026-09-30 停用。
- **域名**：[gentoozh.org](/posts/2026-07-01-domain-migration/) 與 gentootw.org，都在 Porkbun 註冊。
- **Cloudflare Workers**：託管官網與鏡像落地頁，付費方案提供的是請求配額與 CPU 時間。
- **郵件傳送**：論壇的註冊驗證與通知郵件由 Hostinger 的發信服務投遞，不自建 SMTP，因為自建 IP 難以透過各家郵件服務商的投遞策略。
- **監控與告警**：執行 Grafana 與 Alertmanager，狀態公開在 [status.gentoozh.org](https://status.gentoozh.org/)。

## 由其他成員承擔

下面幾項不在上面的表裡，費用由他們自己承擔：

- **gentoocn.org**：[Clover](/contributors/simplewrite/) 續費。
- **gentoo.org.cn**：一位不願具名的老社群成員續費。
- **早前的建置機**：由[梁永祥](/contributors/liangyongxiang/)提供，2022-08-09 至 2026-04-30 在用，月付 37.30 EUR，45 個月合計 1678.50 EUR，折合約 1934.30 USD。overlay 的二進位包建置現由 OSUOSL 贊助的建置伺服器承擔。
- **早前的下載站**：伺服器由 [peeweep](/contributors/peeweep/) 提供，現已關閉，Live ISO 與 distfiles 遷至上表的下載伺服器。

## 參與方式

社群不接受捐款。binhost 建置機與美國鏡像由 OSUOSL 免費提供，如需資助，請[捐給 OSUOSL](https://osuosl.org/donate/)。

提交 ebuild、修正缺陷與改進文件的流程見[貢獻指南](/contributing/)。
