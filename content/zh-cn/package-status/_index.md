---
title: "软件包状态说明"
description: "软件包列表各状态的触发条件，以及本站的收录范围"
---

## 收录范围 {#scope}

本站发布构建机的整个 `PKGDIR`，包括收录的 overlay 软件包及从源码构建的 `::gentoo` 依赖。发布前移除被 mask、受 `RESTRICT=bindist` 限制或继承 `linux-mod` 的二进制包；`acct-group`、`acct-user` 与 `virtual` 不按类别排除。附带的依赖不替代 Gentoo 官方 binhost。纯文本清单见 [stable](https://distfiles.gentoozh.org/packages.txt) 与 [unstable](https://distfiles.gentoozh.org/packages-unstable.txt)。

## 状态说明 {#status-help}

包列表分开显示公开索引、直接构建清单、当前发布政策和 distfiles 镜像状态。同一行可以同时出现多个状态，因为它们说明不同事实。distfiles 列显示索引中的文件数量。

| 状态 | 触发条件与常见原因 |
| --- | --- |
| `已发布` | 公开索引已有该包，可从本站下载。发布政策列针对当前 ebuild；已发布产物按其版本与构建时的 USE 通过发布检查。 |
| `待发布` | 该包是直接构建目标，但公开索引尚无二进制包。它可能尚未完成首次构建，也可能最近一次未成功发布；该状态只表示目前没有公开产物。 |
| `已排除` | 维护清单明确排除该包。常见原因包括无法构建、缺少支持或需要进一步核对再分发条件；原因列显示记录的具体原因。 |
| `不在此频道` | 该包仍在共用收录清单中，但不符合当前频道的依赖或构建条件，因此本频道不直接构建。另一个频道仍可能发布该包。该包作为其他包的依赖构建时，本频道仍可能有它的二进制包。 |
| `清单外` | 该包不是直接构建目标。上游已经提供预编译内容或构建收益较低时通常不会直接收录，但仍可能作为依赖随包发布；包名含 `-bin` 不会自动决定该状态。未检测到常见构建 eclass，或检测到构建流程但不在构建清单中，也会显示此状态；这不是发布限制。 |
| `不提供 binpkg` | 当前 ebuild 的 `RESTRICT` 包含 `bindist`，因此本站不发布该包的二进制包。源码包和上游预编译包都可能设置这项限制，常见原因是许可证、上游发布条款或预编译内容的再分发条件不允许本站分发二进制产物；包名含 `-bin` 本身不是判定依据。distfiles 是否镜像仍按 `RESTRICT` 中的 `mirror`、`fetch` 与每项 `SRC_URI` 单独判断。 |
| `许可证限制` | 当前 ebuild 的 `LICENSE` 表达式不属于本站固定的 `@BINARY-REDISTRIBUTABLE`。许可证可能允许附带条件的再分发，但本站不会据此发布二进制包；该状态与 `RESTRICT=bindist` 分开判定。 |
| `已移除` | overlay 已移除该包，但公开索引仍有它的二进制包，仍可以下载。该行不链接到 overlay。 |
| `Distfiles —` | 该包没有声明 distfile、`RESTRICT` 包含 `mirror` 或 `fetch`，或声明的文件尚未全部进入镜像。该状态不表示二进制包不可用。 |
| 政策不明 | 无法确定当前 ebuild 是否符合二进制包发布政策 |
| `无 amd64` | 没有 amd64 关键字 |
| `已屏蔽` | 被 `profiles/package.mask` 屏蔽 |
| `仅 9999` | 仅有 live ebuild，本站不发布二进制包 |
