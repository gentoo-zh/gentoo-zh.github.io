---
title: "distfiles 疑難排解"
description: "排查 overlay 原始碼下載的 404 與 Manifest 驗證失敗。"
---

## distfiles {#distfiles}

<!-- anchor:distfiles-faq -->

### 下載 distfile 時遇到 404，改用本站鏡像能解決嗎？ {#q15}

只有本站保存了所需檔案時才能下載。鏡像範圍、`GENTOO_MIRRORS` 的位址順序與備用下載見[distfiles 設定](/distfiles-setup/#setup)。

### 下載檔案的大小或總和檢查碼與 Manifest 不符，怎麼辦？ {#q16}

上游可能替換了同一位址的檔案，不能只重新產生摘要。[circuitjs1-bin 曾出現這種情況](https://github.com/gentoo-zh/overlay/issues/11038)，需要更新 ebuild 並實際建置、驗證新版本。
