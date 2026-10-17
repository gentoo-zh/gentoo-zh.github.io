---
title: "Overlay 鏡像"
description: "gentoo-zh overlay、distfiles 與二進位套件的鏡像"
anchors:
  "gentoo-鏡像": "/gentoo-mirrors/#gentoo-鏡像"
  "鏡像總覽": "/gentoo-mirrors/#鏡像總覽"
  "配置教學": "/gentoo-repo-setup/#git-sync"
  "使用-git-同步-gentoo-ebuild-倉庫": "/gentoo-repo-setup/#git-sync"
  "使用-rsync-同步-gentoo-ebuild-倉庫": "/gentoo-repo-setup/#rsync-sync"
  "distfiles-配置gentoo_mirrors": "/gentoo-distfiles-setup/#distfiles"
  "官方二進位包binhost": "/gentoo-binpkg-setup/#binhost"
  "gentoo-prefix-bootstrap-鏡像配置": "/gentoo-prefix-setup/#prefix"
---

## gentoo-zh 鏡像 {#list}

gentoo-zh overlay 的 Git 儲存庫、distfiles 與二進位套件由下列鏡像提供。用法見[文件](/docs/)中的 overlay、二進位套件與 distfiles 設定；各鏡像的同步狀態見 [同步狀態](/status/)。Gentoo 官方儲存庫的鏡像見[官方鏡像](/gentoo-mirrors/)。

Git 鏡像只同步 overlay 的 ebuild 儲存庫，不含原始碼檔案。

<!-- gz-mirror-table -->

### 自建鏡像 {#own}

從下面的位址同步；如需加入鏡像列表，請在 [GitHub Issues](https://github.com/gentoo-zh/binhost/issues) 提交鏡像資訊。

```text
rsync://distfiles.gentoozh.org/gentoo-zh/
```

## 使用教育網聯合鏡像站時，為什麼 Git 提示重新導向？ {#cernet-redirect}

教育網聯合鏡像站將請求重新導向鄰近的其他鏡像站，本身不儲存檔案。因此，Git 提示重新導向是正常現象。

## 為什麼各鏡像的版本不一致？ {#mirror-sync}

各鏡像依自己的排程同步，進度可能不同。某個鏡像版本偏舊時，可換另一個鏡像再同步；ISO 請選擇對應目錄中的最新版本。位址見[鏡像列表](/mirrorlist/#list)。

<!-- anchor:gentoo-鏡像 -->

<!-- anchor:鏡像總覽 -->

<!-- anchor:配置教學 -->

<!-- anchor:使用-git-同步-gentoo-ebuild-倉庫 -->

<!-- anchor:使用-rsync-同步-gentoo-ebuild-倉庫 -->

<!-- anchor:distfiles-配置gentoo_mirrors -->

<!-- anchor:官方二進位包binhost -->

<!-- anchor:gentoo-prefix-bootstrap-鏡像配置 -->

[官方鏡像](/gentoo-mirrors/) · [官方鏡像設定](/gentoo-repo-setup/)

<!-- slot:legacy -->
