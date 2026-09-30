---
title: "基础设施开销"
description: "Gentoo 中文社区各台服务器的配置、价格与累计支出，数字随站点构建更新。"
---

下面的服务器与服务中，构建服务器由 [OSUOSL](https://osuosl.org/) 赞助，其余由 [Zakk](/contributors/zakkaus/) 个人承担，没有社区经费。另有几项由其他成员承担，列在文末。

## 设备

{{< gz-costs >}}

## 支出

{{< gz-costs table="ledger" >}}

## 计算方式

- 累计从起算日计到今天：按月付费的按已开始的月数计，按年付费的按已付的年数计。因为年付是一次付清整年，所以不按天数摊分。
- 汇率取自下载服务器年付的实际扣款：100 EUR 折合 115.24 USD、777 CNY、3713.80 TWD、900 HKD。各项币种不同，表内统一折成美元再合计。

## 各项用途

- **下载服务器**：[distfiles.gentoozh.org](https://distfiles.gentoozh.org/) 的源站，提供 overlay 的 distfiles 与二进制包，同时作为各高校镜像的 rsync 同步源。
- **构建服务器**：每晚构建 overlay 的[二进制包](/posts/2026-07-29-binhost-launch/)。2026-09-27 起改由 OSUOSL 赞助的服务器承担，不产生费用。此前自有的 80 线程服务器于 2026-09-29 停用，表中保留它停用前的支出。
- **论坛服务器**：运行 [forum.gentoozh.org](https://forum.gentoozh.org/)。
- **Matrix 与桥接服务器**：运行 Matrix 服务端，以及 Telegram、IRC、Matrix 之间的消息转发。
- **高可用节点**：异地探测镜像与各站点，与主力机不在同一机房，避免同时失效。
- **域名**：[gentoozh.org](/posts/2026-07-01-domain-migration/) 与 gentootw.org，都在 Porkbun 注册。
- **Cloudflare Workers**：托管官网与镜像落地页，付费方案提供的是请求配额与 CPU 时间。
- **邮件发送**：论坛的注册验证与通知邮件由 Hostinger 的发信服务投递，不自建 SMTP，因为自建 IP 难以通过各家邮件服务商的投递策略。
- **监控与告警**：运行 Grafana 与 Alertmanager，状态公开在 [status.gentoozh.org](https://status.gentoozh.org/)。

## 由其他成员承担

下面几项不在上面的表里，费用由他们自己承担：

- **gentoocn.org**：[Clover](/contributors/simplewrite/) 续费。
- **gentoo.org.cn**：一位不愿具名的老社区成员续费。
- **早前的构建机**：由[梁永祥](/contributors/liangyongxiang/)提供，2022-08-09 至 2026-04-30 在用，月付 37.30 EUR，45 个月合计 1678.50 EUR，折合约 1934.30 USD。overlay 的二进制包构建现由 OSUOSL 赞助的构建服务器承担。
- **早前的下载站**：服务器由 [peeweep](/contributors/peeweep/) 提供，现已关闭，Live ISO 与 distfiles 迁至上表的下载服务器。

## 参与方式

社区不接受捐款。binhost 构建机与美国镜像由 OSUOSL 免费提供，如需资助，请[捐给 OSUOSL](https://osuosl.org/donate/)。

提交 ebuild、修复缺陷与改进文档的流程见[贡献指南](/contributing/)。
