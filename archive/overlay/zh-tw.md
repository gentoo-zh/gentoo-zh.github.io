---
title: "Overlay"
---

[gentoo-zh](https://github.com/gentoo-zh/overlay) 是 Gentoo 中文社群維護的 overlay，前身為 2003 年的 gentoo-tw 與 gentoo-china，收錄大量中文使用者常用的軟體套件。

{{< callout type="info" >}}
Git、Distfiles 與二進位包可分別選擇鏡像，頁面中的配置會隨選擇更新。
{{< /callout >}}

- **中文輸入與字型**：fcitx 輸入法、拼音詞庫、中文字型
- **中國內陸常用應用**：微信、QQ、釘釘、WPS、飛書、網易雲音樂
- **網路與代理工具**
- **打好修補的桌面 / 效能向核心**：cachyos-sources、xanmod、liquorix
- **開發與日常工具**

## 新增 overlay

相應鏡像只提供 gentoo-zh overlay 的 ebuild 倉庫 Git 同步服務，不包含軟體原始碼檔案。

{{< gz-mirror name="git" >}}

安裝 `eselect-repository`，再使用所選鏡像新增並同步 overlay：

{{< gz-cmd path="shell" sudo="true" >}}
emerge --ask app-eselect/eselect-repository
eselect repository add gentoo-zh git @@SRC@@
emaint sync -r gentoo-zh
{{< /gz-cmd >}}

{{% details closed="true" title="手動配置或更換鏡像" %}}

首次配置時，建立 `/etc/portage/repos.conf/gentoo-zh.conf`。更換 Git 鏡像時，只需編輯 `/etc/portage/repos.conf/` 中包含 `[gentoo-zh]` 的配置檔案。透過 `eselect-repository` 生成的配置位於 `/etc/portage/repos.conf/eselect-repo.conf`。

完整配置範例：

{{< gz-cmd path="/etc/portage/repos.conf/gentoo-zh.conf" >}}
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = @@SRC@@
auto-sync = yes
{{< /gz-cmd >}}

更換鏡像後，刪除現有的本地倉庫並重新同步：

{{< gz-cmd path="shell" sudo="true" >}}
rm -rf /var/db/repos/gentoo-zh
emaint sync -r gentoo-zh
{{< /gz-cmd >}}

{{% /details %}}

## 接受測試關鍵字

gentoo-zh 軟體套件僅提供 `~ARCH`（測試）關鍵字，沒有 stable 關鍵字。已全域使用 `~amd64` 的系統可跳過此步驟；使用 stable 關鍵字的系統需要先接受 `~amd64`。

關於 `~ARCH` 的說明見 [Gentoo Wiki](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide)。

`::gentoo-zh` 限定僅作用於該 overlay。由於其中的軟體套件均使用 `~ARCH`，可接受整個 overlay 的 `~amd64` 關鍵字，Gentoo 主倉庫的軟體套件不受影響：

{{< gz-cmd path="/etc/portage/package.accept_keywords/gentoo-zh" >}}
*/*::gentoo-zh ~amd64
{{< /gz-cmd >}}

也可逐個接受軟體套件的測試關鍵字：

{{< gz-cmd path="/etc/portage/package.accept_keywords/gentoo-zh" >}}
net-im/tencent-qq ~amd64
{{< /gz-cmd >}}

## 安裝軟體套件

{{< gz-cmd path="shell" sudo="true" >}}
emerge --ask net-im/tencent-qq
{{< /gz-cmd >}}

列出 overlay 提供的包：`eix -RO gentoo-zh`。

## Distfiles 鏡像與二進位包

Distfiles 與二進位包服務相互獨立，可按需分別配置。

### Distfiles 鏡像

相應鏡像只提供 gentoo-zh overlay 相關的 Distfiles，因此只應追加到現有配置。`::gentoo` 的 Distfiles 配置見[鏡像列表](/mirrorlist/)。

{{< gz-mirror name="dist" set="dist" >}}

{{< gz-mode name="dist" >}}

{{% gz-pane group="dist" name="manual" %}}
{{< gz-cmd path="/etc/portage/make.conf" slot="dist" >}}
GENTOO_MIRRORS="${GENTOO_MIRRORS} @@LIST@@"
{{< /gz-cmd >}}
{{% /gz-pane %}}

{{% gz-pane group="dist" name="quick" %}}
{{< gz-cmd path="shell" sudo="true" slot="dist" >}}
tee -a /etc/portage/make.conf > /dev/null <<'EOF'
GENTOO_MIRRORS="${GENTOO_MIRRORS} @@LIST@@"
EOF
{{< /gz-cmd >}}
{{% /gz-pane %}}

`GENTOO_MIRRORS` 按順序嘗試各地址。所選鏡像排在首位，源站位於末尾；地址末尾無需加入 `distfiles/`，Portage 會自動補充。

### 二進位包（binhost）

[gentoo-zh binhost](https://github.com/gentoo-zh/binhost) 目前提供已簽名的 amd64 二進位包，分為 stable 與 unstable 兩個頻道。二進位包還附帶 gentoo-zh 軟體套件執行期依賴所需的部分 `::gentoo` 軟體套件，不替代 [Gentoo 官方 binhost](https://wiki.gentoo.org/wiki/Gentoo_Binary_Host_Quickstart)。

{{< gz-channel name="bin" >}}

{{% gz-channel-pane group="bin" name="stable" %}}
stable 使用 Gentoo 主倉庫的穩定軟體套件，只對 `::gentoo-zh` 接受 `~amd64`，適合 Gentoo 主倉庫使用 stable 關鍵字的系統。
{{% /gz-channel-pane %}}

{{% gz-channel-pane group="bin" name="unstable" %}}
unstable 全域使用 `~amd64`，適合已設定 `ACCEPT_KEYWORDS="~amd64"` 的系統。
{{% /gz-channel-pane %}}

頻道中的軟體套件數量和狀態見 [gentoo-zh 軟體套件列表](https://distfiles.gentoozh.org/packages)，頻道區別見 [gentoo-zh binhost FAQ](https://distfiles.gentoozh.org/faq#binpkg-channel)。

{{< gz-mirror name="bin" set="dist" >}}

{{< gz-mode name="bin" >}}

匯入簽名公鑰：

{{< gz-cmd path="shell" sudo="true" >}}
emerge sec-keys/openpgp-keys-gentoozh
getuto
gpg --homedir /etc/portage/gnupg --import /usr/share/openpgp-keys/gentoozh.asc
gpg --homedir /etc/portage/gnupg --batch --yes --pinentry-mode loopback \
    --passphrase-file /etc/portage/gnupg/pass --lsign-key 6A0726AF1476A2F382C6AC6638A0234EC16AD42E
gpg --homedir /etc/portage/gnupg --check-trustdb
{{< /gz-cmd >}}

`getuto` 用於建立 `/etc/portage/gnupg` 和 Portage Local Trust Key，必須在匯入公鑰前執行。驗簽以 `portage` 使用者執行，因此需要預先生成 `trustdb`。

新增二進位包倉庫：

{{% gz-pane group="bin" name="manual" %}}
{{< gz-cmd path="/etc/portage/binrepos.conf/gentoo-zh.conf" slot="bin" channel="bin" suffix="/binpkgs/x86-64" >}}
[gentoo-zh]
sync-uri = @@SRC@@
priority = 10
verify-signature = true
location = /var/cache/binhost/gentoo-zh
{{< /gz-cmd >}}

在有合適的二進位包時自動下載並使用：

{{< gz-cmd path="/etc/portage/make.conf" >}}
FEATURES="${FEATURES} getbinpkg"
{{< /gz-cmd >}}
{{% /gz-pane %}}

{{% gz-pane group="bin" name="quick" %}}
{{< gz-cmd path="shell" sudo="true" slot="bin" channel="bin" suffix="/binpkgs/x86-64" >}}
mkdir -p /etc/portage/binrepos.conf
tee /etc/portage/binrepos.conf/gentoo-zh.conf > /dev/null <<'EOF'
[gentoo-zh]
sync-uri = @@SRC@@
priority = 10
verify-signature = true
location = /var/cache/binhost/gentoo-zh
EOF

tee -a /etc/portage/make.conf > /dev/null <<'EOF'
FEATURES="${FEATURES} getbinpkg"
EOF
{{< /gz-cmd >}}
{{% /gz-pane %}}

如果沒有合適的二進位包，Portage 會照常從原始碼編譯。

單次使用二進位套件安裝：

{{< gz-cmd path="shell" sudo="true" >}}
emerge --ask --getbinpkg <package>
{{< /gz-cmd >}}

{{< callout type="warning" >}}
`verify-signature = true` 只要求驗證該倉庫的簽名。全域啟用 `FEATURES="binpkg-request-signature"` 時，還需要為本機透過 `FEATURES="buildpkg"` 建置的包配置簽名。
{{< /callout >}}

{{< callout type="info" >}}
頻道區別及公鑰下載方法見 [gentoo-zh binhost FAQ](https://distfiles.gentoozh.org/faq)，高階配置參考 [Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide)。
{{< /callout >}}

## 注意事項

{{< callout type="info" >}}
2025 年 10 月起官方不再為第三方倉庫提供快取鏡像，gentoo-zh 改為直接從 GitHub 上游同步。在那之前新增過的使用者需要更新同步源，見[這篇說明](/posts/2025-10-07-thirdparty-repo-mirror-removal/)。
{{< /callout >}}

- 倉庫地址是 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)。舊的 `microcai/gentoo-zh` 會 301 到新倉庫，手寫過 remote 的建議更新，詳見[遷移記錄](/posts/2026-07-02-gentoo-zh-repo-migration/)
- 教育網聯合鏡像站不自己存檔案，它把請求轉到就近的成員站，所以 git 會提示一次重新導向，這是正常的
- 各鏡像的同步進度不一定一致，某個源上的版本偏舊時，換另一個再同步
- 打包者：因為版權等原因不希望某個包的原始碼被鏡像時，在它的 ebuild 裡加 `RESTRICT="mirror"`，同步工具會跳過

## 參與貢獻

歡迎參與 gentoo-zh：到 [GitHub 倉庫](https://github.com/gentoo-zh/overlay) 提 Pull Request，發現問題也歡迎提 issue。完整流程見[貢獻指南](/contributing/)。

## 致謝

感謝[教育網聯合鏡像站](https://mirrors.cernet.edu.cn/)、[南京大學](https://mirror.nju.edu.cn/)、[南陽理工學院](https://mirror.nyist.edu.cn/)與[河南省教育科研網](https://mirrors.ha.edu.cn/)為 gentoo-zh 提供鏡像。鏡像清單整理自 [peeweep](/contributors/peeweep/) 的[公告](https://t.me/gentoocn/56)。
