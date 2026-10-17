---
title: "Pastebin"
description: "社区自建的 pastebin，用来分享代码与日志。"
---

后端是 [wastebin](https://github.com/matze/wastebin)；命令行工具 [gzpaste](https://github.com/gentoo-zh/gzpaste) 以 MIT 许可发布。

<!-- slot:actions -->

## 说明 {#说明}

| 项目 | 限制 |
| --- | --- |
| 身份 | 匿名 |
| 单份大小 | 最大 10 MB |
| 保留时间 | 默认 7 天，提交时可选 1 小时到 1 个月 |

有问题请到[社区简介](/about/)查找联系方式。

## 网页 {#网页}

打开 [paste.gentoozh.org](https://paste.gentoozh.org)，粘贴文本或拖入文件，选择语法高亮与保留时间，提交后复制链接。

## 命令行 {#命令行}

安装 [`gzpaste`](https://github.com/gentoo-zh/gzpaste)，仅依赖 `curl`。将工具安装到 `~/.local/bin`，并确认该目录已加入 `PATH`：

```bash
$ mkdir -p ~/.local/bin && curl -fsSL https://gentoozh.org/gzpaste.sh -o ~/.local/bin/gzpaste && chmod +x ~/.local/bin/gzpaste
```

在 Gentoo 上，添加 [gentoo-zh overlay](/overlay/) 后，可执行以下命令安装：

```bash
# emerge app-text/gzpaste
```

无需安装即可上传：

上传标准输入：

```bash
$ 某命令 | sh -c "$(curl -fsSL https://gentoozh.org/gzpaste.sh)"
```

上传文件：

```bash
$ curl -fsSL https://gentoozh.org/gzpaste.sh | sh -s -- 文件
```

上传命令输出：

```bash
$ emerge --info | gzpaste                    # 上传系统信息
$ emerge -pv app-text/gzpaste | gzpaste      # 查看待安装版本与 USE 设置
```

按路径上传文件：

```bash
$ gzpaste /etc/portage/make.conf                                  # 配置
$ gzpaste /etc/portage/package.use/00-desktop                     # USE 设置
$ gzpaste /var/tmp/portage/app-text/gzpaste-0.1.3/temp/build.log  # 构建失败的日志
```

## 全部选项

| 选项 | 作用 |
| --- | --- |
| `-e, --ext EXT` | 语法高亮语言，扩展名或文件名（见下）；不指定则不高亮 |
| `-x, --expires 秒` | 多少秒后过期 |
| `-b, --burn` | 阅后即焚，第一次打开后删除 |
| `-p, --password 密码` | 加密，读取时带 `wastebin-password` HTTP 请求头 |
| `-r, --raw` | 输出 `/raw/` 纯文本链接 |
| `-m, --md` | 输出 `/md/` Markdown 渲染链接 |
| `-o, --owner` | 输出删除所需的 owner token |
| `-v, --verbose` | 进度输出到 stderr（URL 仍在 stdout） |
| `-h, --help` | 显示帮助 |
| `-V, --version` | 显示版本 |
| `del <id> <owner>` | 删除一份 paste |

`gzpaste -h` 输出的内容相同。

## 高亮语言（178 种）

`-e` 的值是扩展名或文件名，网页表单的下拉列表里也能选：

{{% details title="展开全部" %}}
```text
adb                haml               rails
adoc               hh.in              rb
adp                h.in               rd
applescript        hs                 re
as                 htm.j2             rego
asa                html               requirements.txt
asp                html.eex           resolv.conf
attributes         http               rkt
authorized_keys    idr                robot
awk                ini                rs
bat                j2                 rst
bib                java               rxml
build              jl                 sass
c                  jq                 scala
cabal              js                 scss
cfml               js.erb             sh
clj                json               show-nonprintable
CMakeCache.txt     jsonnet            slim
CMakeLists.txt     jsp                sml
cmd-help           known_hosts        sol
coffee             kt                 sources.list
COMMIT_EDITMSG     lean               sql
conf.erb           less               ssh_config
cpp                lhs                sshd_config
cpuinfo            lisp               strace
cr                 ll                 sty
cs                 log                styl
css                ls                 sv
csv                lua                svlt
d                  m                  swift
dart               .mailmap           syslog
diff               make               tab
Dockerfile         man                tcl
dot                matlab             tex
elm                md                 textile
eml                mediawiki          tf
.env               meminfo            tfstate
envvars            ml                 todo.txt
erbsql             mll                toml
erl                mly                ts
ex                 mm                 tsv
exclude            namelist           tsx
f                  nim                twig
f90                ninja              txt
fish               nix                typ
fs                 nsi                v
fstab              odin               varlink
gd                 org                vhd
.git               pas                vim
gitconfig          passwd             vs
gitlog             pb.txt             vue
git-rebase-todo    php                vy
go                 pl                 wgsl
go.mod             pp                 xml
go.sum             properties         yaml
gp                 proto              yasm
graphql            purs               yaws
groff              py                 zig
groovy             qml
group              R
```
{{% /details %}}

## 使用 curl 上传 {#不装-gzpaste直接用-curl}

gzpaste 本身只要 curl。手动实现则需要安装 [jq](https://github.com/jqlang/jq/wiki/Installation)：

```bash
$ echo "内容" | jq -Rs '{text: .}' \
  | curl -s -H 'content-type: application/json' --data-binary @- https://paste.gentoozh.org/ \
  | jq -r '"https://paste.gentoozh.org" + .path'
```

完整 HTTP API 见 [wastebin 文档](https://github.com/matze/wastebin#api-endpoints)。

## 读取 {#读取}

在链接的 ID 前添加 `/raw/` 可读取纯文本，供脚本或 `curl` 使用；上传时添加 `-r` 可直接获取纯文本链接：

```bash
$ curl https://paste.gentoozh.org/raw/ID
```

Markdown 文档可通过 `/md/ID` 查看渲染结果；上传时添加 `-m` 可直接获取该链接。

加密的 paste，读取时把密码放在 `wastebin-password` HTTP 请求头中（不带密码打开只会看到密码框，内容不泄露）：

```bash
$ curl -H 'wastebin-password: 你的密码' https://paste.gentoozh.org/raw/ID
```
