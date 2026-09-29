---
title: "Overlay"
---

[gentoo-zh](https://github.com/gentoo-zh/overlay) 是 Gentoo 中文社区维护的 overlay，前身为 2003 年的 gentoo-tw 与 gentoo-china，收录大量中文用户常用的软件包。

{{< callout type="info" >}}
Git、Distfiles 与二进制包可分别选择镜像，页面中的配置会随选择更新。
{{< /callout >}}

- **中文输入与字体**：fcitx 输入法、拼音词库、中文字体
- **国内常用应用**：微信、QQ、钉钉、WPS、飞书、网易云音乐
- **网络与代理工具**
- **打好补丁的桌面 / 性能向内核**：cachyos-sources、xanmod、liquorix
- **开发与日常工具**

## 添加 overlay

相应镜像只提供 gentoo-zh overlay 的 ebuild 仓库 Git 同步服务，不包含软件源代码文件。

{{< gz-mirror name="git" >}}

安装 `eselect-repository`，再使用所选镜像添加并同步 overlay：

{{< gz-cmd path="shell" sudo="true" >}}
emerge --ask app-eselect/eselect-repository
eselect repository add gentoo-zh git @@SRC@@
emaint sync -r gentoo-zh
{{< /gz-cmd >}}

{{% details closed="true" title="手动配置或更换镜像" %}}

首次配置时，创建 `/etc/portage/repos.conf/gentoo-zh.conf`。更换 Git 镜像时，只需编辑 `/etc/portage/repos.conf/` 中包含 `[gentoo-zh]` 的配置文件。通过 `eselect-repository` 生成的配置位于 `/etc/portage/repos.conf/eselect-repo.conf`。

完整配置示例：

{{< gz-cmd path="/etc/portage/repos.conf/gentoo-zh.conf" >}}
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = @@SRC@@
auto-sync = yes
{{< /gz-cmd >}}

更换镜像后，删除现有的本地仓库并重新同步：

{{< gz-cmd path="shell" sudo="true" >}}
rm -rf /var/db/repos/gentoo-zh
emaint sync -r gentoo-zh
{{< /gz-cmd >}}

{{% /details %}}

## 接受测试关键字

gentoo-zh 软件包仅提供 `~ARCH`（测试）关键字，没有 stable 关键字。已全局使用 `~amd64` 的系统可跳过此步骤；使用 stable 关键字的系统需要先接受 `~amd64`。

关于 `~ARCH` 的说明见 [Gentoo Wiki](https://wiki.gentoo.org/wiki//etc/portage/package.accept_keywords#.7EARCH_system-wide)。

`::gentoo-zh` 限定仅作用于该 overlay。由于其中的软件包均使用 `~ARCH`，可接受整个 overlay 的 `~amd64` 关键字，Gentoo 主仓库的软件包不受影响：

{{< gz-cmd path="/etc/portage/package.accept_keywords/gentoo-zh" >}}
*/*::gentoo-zh ~amd64
{{< /gz-cmd >}}

也可逐个接受软件包的测试关键字：

{{< gz-cmd path="/etc/portage/package.accept_keywords/gentoo-zh" >}}
net-im/tencent-qq ~amd64
{{< /gz-cmd >}}

## 安装软件包

{{< gz-cmd path="shell" sudo="true" >}}
emerge --ask net-im/tencent-qq
{{< /gz-cmd >}}

列出 overlay 提供的包：`eix -RO gentoo-zh`。

## Distfiles 镜像与二进制包

Distfiles 与二进制包服务相互独立，可按需分别配置。

### Distfiles 镜像

相应镜像只提供 gentoo-zh overlay 相关的 Distfiles，因此只应追加到现有配置。`::gentoo` 的 Distfiles 配置见[镜像列表](/mirrorlist/)。

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

`GENTOO_MIRRORS` 按顺序尝试各地址。所选镜像排在首位，源站位于末尾；地址末尾无需加入 `distfiles/`，Portage 会自动补充。

### 二进制包（binhost）

[gentoo-zh binhost](https://github.com/gentoo-zh/binhost) 目前提供已签名的 amd64 二进制包，分为 stable 与 unstable 两个频道。二进制包还附带 gentoo-zh 软件包运行期依赖所需的部分 `::gentoo` 软件包，不替代 [Gentoo 官方 binhost](https://wiki.gentoo.org/wiki/Gentoo_Binary_Host_Quickstart)。

{{< gz-channel name="bin" >}}

{{% gz-channel-pane group="bin" name="stable" %}}
stable 使用 Gentoo 主仓库的稳定软件包，只对 `::gentoo-zh` 接受 `~amd64`，适合 Gentoo 主仓库使用 stable 关键字的系统。
{{% /gz-channel-pane %}}

{{% gz-channel-pane group="bin" name="unstable" %}}
unstable 全局使用 `~amd64`，适合已设置 `ACCEPT_KEYWORDS="~amd64"` 的系统。
{{% /gz-channel-pane %}}

频道中的软件包数量和状态见 [gentoo-zh 软件包列表](https://distfiles.gentoozh.org/packages)，频道区别见 [gentoo-zh binhost FAQ](https://distfiles.gentoozh.org/faq#binpkg-channel)。

{{< gz-mirror name="bin" set="dist" >}}

{{< gz-mode name="bin" >}}

导入签名公钥：

{{< gz-cmd path="shell" sudo="true" >}}
emerge sec-keys/openpgp-keys-gentoozh
getuto
gpg --homedir /etc/portage/gnupg --import /usr/share/openpgp-keys/gentoozh.asc
gpg --homedir /etc/portage/gnupg --batch --yes --pinentry-mode loopback \
    --passphrase-file /etc/portage/gnupg/pass --lsign-key 6A0726AF1476A2F382C6AC6638A0234EC16AD42E
gpg --homedir /etc/portage/gnupg --check-trustdb
{{< /gz-cmd >}}

`getuto` 用于建立 `/etc/portage/gnupg` 和 Portage Local Trust Key，必须在导入公钥前执行。验签以 `portage` 用户执行，因此需要预先生成 `trustdb`。

添加二进制包仓库：

{{% gz-pane group="bin" name="manual" %}}
{{< gz-cmd path="/etc/portage/binrepos.conf/gentoo-zh.conf" slot="bin" channel="bin" suffix="/binpkgs/x86-64" >}}
[gentoo-zh]
sync-uri = @@SRC@@
priority = 10
verify-signature = true
location = /var/cache/binhost/gentoo-zh
{{< /gz-cmd >}}

在有合适的二进制包时自动下载并使用：

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

如果没有合适的二进制包，Portage 会照常从源码编译。

单次使用二进制包安装：

{{< gz-cmd path="shell" sudo="true" >}}
emerge --ask --getbinpkg <package>
{{< /gz-cmd >}}

{{< callout type="warning" >}}
`verify-signature = true` 只要求验证该仓库的签名。全局启用 `FEATURES="binpkg-request-signature"` 时，还需要为本机通过 `FEATURES="buildpkg"` 构建的包配置签名。
{{< /callout >}}

{{< callout type="info" >}}
频道区别及公钥下载方法见 [gentoo-zh binhost FAQ](https://distfiles.gentoozh.org/faq)，高级配置参考 [Binary package guide](https://wiki.gentoo.org/wiki/Binary_package_guide)。
{{< /callout >}}

## 注意事项

{{< callout type="info" >}}
2025 年 10 月起官方不再为第三方仓库提供缓存镜像，gentoo-zh 改为直接从 GitHub 上游同步。在那之前添加过的用户需要更新同步源，见[这篇说明](/posts/2025-10-07-thirdparty-repo-mirror-removal/)。
{{< /callout >}}

- 仓库地址是 [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay)。旧的 `microcai/gentoo-zh` 会 301 到新仓库，手写过 remote 的建议更新，详见[迁移记录](/posts/2026-07-02-gentoo-zh-repo-migration/)
- 教育网联合镜像站不自己存文件，它把请求转到就近的成员站，所以 git 会提示一次重定向，这是正常的
- 各镜像的同步进度不一定一致，某个源上的版本偏旧时，换另一个再同步
- 打包者：因为版权等原因不希望某个包的源码被镜像时，在它的 ebuild 里加 `RESTRICT="mirror"`，同步工具会跳过

## 参与贡献

欢迎参与 gentoo-zh：到 [GitHub 仓库](https://github.com/gentoo-zh/overlay) 提 Pull Request，发现问题也欢迎提 issue。完整流程见[贡献指南](/contributing/)。

## 致谢

感谢[教育网联合镜像站](https://mirrors.cernet.edu.cn/)、[南京大学](https://mirror.nju.edu.cn/)、[南阳理工学院](https://mirror.nyist.edu.cn/)与[河南省教育科研网](https://mirrors.ha.edu.cn/)为 gentoo-zh 提供镜像。镜像清单整理自 [peeweep](/contributors/peeweep/) 的[公告](https://t.me/gentoocn/56)。
