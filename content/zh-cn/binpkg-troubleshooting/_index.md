---
title: "二进制包排障"
description: "排查二进制包的系统兼容性、公钥导入与源码回退问题。"
---

## 二进制包 {#binpkg}

<!-- anchor:usage -->

### OpenRC 和 systemd 都能使用吗？ {#q3}

两个频道均以 `desktop/systemd` profile 构建，没有单独的 OpenRC 产物；OpenRC 系统能否使用，取决于软件包的 USE 与依赖。USE 不匹配时见[源码回退排查](#q1)。

### 导入公钥时出现 no writable keyring found，怎么办？ {#binpkg-keyring}

先执行 `getuto`，再按[公钥导入步骤](/binpkg-setup/#import-key)执行完整命令。目录、Portage Local Trust Key、口令与 `trustdb` 的初始化都在该步骤中完成。口令由 `--passphrase-file` 从 `/etc/portage/gnupg/pass` 读取；验签以 `portage` 用户执行，因此须预先生成 `trustdb`，即该步骤最后的 `--check-trustdb`。

<!-- anchor:troubleshooting -->

### 配置之后 emerge 为何仍然从源码编译？ {#q1}

启用二进制包不保证每个软件包都能使用现有产物。USE 不匹配时，Portage 的普通安装会改用可用的源码 ebuild；依赖能否满足也取决于当前系统。先核对 [getbinpkg 配置](/binpkg-setup/#setup)、[频道](/binpkg-setup/#channel)与[软件包列表](/packages/)；服务异常可查看[服务状态](/status/)。

### 二进制包是否可能无法在我的 CPU 上运行？ {#q4}

仍有可能。两个频道使用 `CFLAGS="-O2 -pipe -march=x86-64 -mtune=generic"`，不使用 `-march=native`，但该设置不能改变 ebuild 附带的上游预编译对象或程序库。Portage 选择二进制包时不比较 `CFLAGS`，因此选用的二进制包不一定与 CPU 兼容。
