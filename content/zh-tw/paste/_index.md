---
title: "Pastebin"
description: "社群自建的 pastebin，用來分享程式碼與日誌。"
---

後端是 [wastebin](https://github.com/matze/wastebin)；指令列工具 [gzpaste](https://github.com/gentoo-zh/gzpaste) 以 MIT 授權發布。

<!-- slot:actions -->

## 說明 {#說明}

| 項目 | 限制 |
| --- | --- |
| 身分 | 匿名 |
| 單份大小 | 最大 10 MB |
| 保留時間 | 預設 7 天，提交時可選 1 小時到 1 個月 |

有問題請到[社群簡介](/about/)查詢聯絡方式。

## 網頁 {#網頁}

開啟 [paste.gentoozh.org](https://paste.gentoozh.org)，貼上文字或拖入檔案，選擇語法醒目提示與保留時間，提交後複製連結。

## 指令列 {#指令列}

安裝 [`gzpaste`](https://github.com/gentoo-zh/gzpaste)，僅需 `curl`。將工具安裝至 `~/.local/bin`，並確認該目錄已加入 `PATH`：

```bash
$ mkdir -p ~/.local/bin && curl -fsSL https://gentoozh.org/gzpaste.sh -o ~/.local/bin/gzpaste && chmod +x ~/.local/bin/gzpaste
```

在 Gentoo 上，新增 [gentoo-zh overlay](/overlay/) 後，可執行以下指令安裝：

```bash
# emerge app-text/gzpaste
```

無需安裝即可上傳：

上傳標準輸入：

```bash
$ 某指令 | sh -c "$(curl -fsSL https://gentoozh.org/gzpaste.sh)"
```

上傳檔案：

```bash
$ curl -fsSL https://gentoozh.org/gzpaste.sh | sh -s -- 檔案
```

上傳指令輸出：

```bash
$ emerge --info | gzpaste                    # 上傳系統資訊
$ emerge -pv app-text/gzpaste | gzpaste      # 查看待安裝版本與 USE 設定
```

依路徑上傳檔案：

```bash
$ gzpaste /etc/portage/make.conf                                  # 設定
$ gzpaste /etc/portage/package.use/00-desktop                     # USE 設定
$ gzpaste /var/tmp/portage/app-text/gzpaste-0.1.3/temp/build.log  # 建置失敗的日誌
```

## 全部選項

| 選項 | 作用 |
| --- | --- |
| `-e, --ext EXT` | 語法醒目提示使用的語言，以副檔名或檔名指定（見下）；未指定時不啟用 |
| `-x, --expires 秒` | 多少秒後過期 |
| `-b, --burn` | 閱後即焚，第一次開啟後刪除 |
| `-p, --password 密碼` | 加密，讀取時帶 `wastebin-password` HTTP 標頭 |
| `-r, --raw` | 輸出 `/raw/` 純文字連結 |
| `-m, --md` | 輸出 `/md/` Markdown 渲染連結 |
| `-o, --owner` | 輸出刪除所需的 owner token |
| `-v, --verbose` | 進度輸出到 stderr（URL 仍在 stdout） |
| `-h, --help` | 顯示說明 |
| `-V, --version` | 顯示版本 |
| `del <id> <owner>` | 刪除一份 paste |

`gzpaste -h` 輸出的內容相同。

## 語法醒目提示支援的語言（178 種）

`-e` 的值是副檔名或檔名，網頁表單的下拉式選單裡也能選：

{{% details title="展開全部" %}}
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

## 使用 curl 上傳 {#不裝-gzpaste直接用-curl}

gzpaste 本身只要 curl。手動實現則需要安裝 [jq](https://github.com/jqlang/jq/wiki/Installation)：

```bash
$ echo "內容" | jq -Rs '{text: .}' \
  | curl -s -H 'content-type: application/json' --data-binary @- https://paste.gentoozh.org/ \
  | jq -r '"https://paste.gentoozh.org" + .path'
```

完整 HTTP API 見 [wastebin 文件](https://github.com/matze/wastebin#api-endpoints)。

## 讀取 {#讀取}

在連結的 ID 前新增 `/raw/` 可讀取純文字，供指令碼或 `curl` 使用；上傳時新增 `-r` 可直接取得純文字連結：

```bash
$ curl https://paste.gentoozh.org/raw/ID
```

Markdown 文件可透過 `/md/ID` 查看呈現結果；上傳時新增 `-m` 可直接取得該連結。

加密的 paste，讀取時把密碼放在 `wastebin-password` HTTP 標頭中（不帶密碼開啟只會看到密碼框，內容不洩露）：

```bash
$ curl -H 'wastebin-password: 你的密碼' https://paste.gentoozh.org/raw/ID
```
