---
title: "Overlay 疑難排解"
description: "處理 gentoo-zh overlay 的同步位址問題。"
---

## Overlay {#overlay}

### gentoo-zh overlay 和官方 Portage 樹是什麼關係？ {#overlay-vs-gentoo}

overlay 是疊加在官方 Portage 樹之上的套件來源，存放官方來源沒有的套件：中文輸入法、字型、詞庫，以及版本更新或附加修補的套件。安裝與測試關鍵字見 [Overlay 設定](/overlay/)。

### 舊的 overlay 同步位址還可用嗎？ {#overlay-sync}

2025 年 10 月起，Gentoo 官方不再為第三方儲存庫提供快取鏡像。此前加入的 gentoo-zh 儲存庫需更新同步來源。舊的 `microcai/gentoo-zh` 位址會重新導向 `gentoo-zh/overlay`，手動設定過 remote 的使用者也應更新位址。

設定步驟見 [Overlay 設定](/overlay/#manual-config)；背景見[快取鏡像停用說明](/posts/2025-10-07-thirdparty-repo-mirror-removal/)與[儲存庫遷移記錄](/posts/2026-07-02-gentoo-zh-repo-migration/)。
