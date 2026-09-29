---
title: "gentoo-zh 下載站重做"
description: "overlay、distfiles、binhost 與 Live ISO 集中到一個網站；binhost 遷到 OSUOSL，現有設定不用改。"
date: 2026-09-30
featured: true
tags: ["announcement", "binhost"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

[gentoo-zh 下載站](https://distfiles.gentoozh.org/?lang=zh-tw)（distfiles.gentoozh.org）已經重做。新增 overlay、設定 distfiles 與 binhost、下載 Live ISO、選擇鏡像，現在都在這一個網站完成，本站的 Overlay 頁與下載頁也直接連過去。

## binhost 遷到 OSUOSL

binhost 建置機已遷到[奧勒岡州立大學開源實驗室（OSUOSL）](https://osuosl.org/)提供的伺服器。公開位址與簽名公鑰不變，現有的 `binrepos.conf` 不需要修改。

建置使用的 profile 同時改為 `default/linux/amd64/23.0/desktop/systemd`。兩種 init 的使用者數量差距明顯，建置算力有限，所以只建置這一套。約 4% 的套件 USE 與 systemd 有關，OpenRC 使用者安裝這些套件時，Portage 會略過二進位包、改為本機編譯，其餘套件不受影響。

## 新增美國鏡像

OSUOSL 同時提供了[美國鏡像](https://ftp2.osuosl.org/pub/gentoo-zh/)。現在德國（源站）、中國大陸與美國都有鏡像，列表見[鏡像頁](https://distfiles.gentoozh.org/mirrors?lang=zh-tw)。

中國大陸以外的亞洲地區還沒有鏡像。願意提供的話，從 `rsync://distfiles.gentoozh.org/gentoo-zh/` 同步，再到 [GitHub Issues](https://github.com/gentoo-zh/binhost/issues) 提交鏡像資訊。

## 致謝

感謝 OSUOSL 提供建置機與鏡像，感謝教育網聯合鏡像站、南京大學、南陽理工學院與河南省教育科研網提供鏡像。
