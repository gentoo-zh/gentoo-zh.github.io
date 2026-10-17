---
title: "Pastebin"
description: "The community pastebin for sharing code and logs."
---

The backend is [wastebin](https://github.com/matze/wastebin); the command-line tool [gzpaste](https://github.com/gentoo-zh/gzpaste) is MIT-licensed.

<!-- slot:actions -->

## Notes {#notes}

| Item | Limit |
| --- | --- |
| Identity | Anonymous |
| Size | Up to 10 MB per paste |
| Retention | 7 days by default; 1 hour to 1 month when you submit |

Questions? Contact channels are on the [About page](/about/).

## Web {#web}

Open [paste.gentoozh.org](https://paste.gentoozh.org), paste text or drag in a file, select syntax highlighting and retention time, then submit and copy the link.

## Command line {#command-line}

Install [`gzpaste`](https://github.com/gentoo-zh/gzpaste) in `~/.local/bin`. It requires `curl`; ensure the directory is on `PATH`:

```bash
$ mkdir -p ~/.local/bin && curl -fsSL https://gentoozh.org/gzpaste.sh -o ~/.local/bin/gzpaste && chmod +x ~/.local/bin/gzpaste
```

On Gentoo, add the [gentoo-zh overlay](/overlay/), then run the following command to install gzpaste:

```bash
# emerge app-text/gzpaste
```

Upload without installing:

Upload standard input:

```bash
$ some-cmd | sh -c "$(curl -fsSL https://gentoozh.org/gzpaste.sh)"
```

Upload a file:

```bash
$ curl -fsSL https://gentoozh.org/gzpaste.sh | sh -s -- FILE
```

Upload command output:

```bash
$ emerge --info | gzpaste                    # upload system information
$ emerge -pv app-text/gzpaste | gzpaste      # inspect the pending version and USE settings
```

Upload a file by path:

```bash
$ gzpaste /etc/portage/make.conf                                  # config
$ gzpaste /etc/portage/package.use/00-desktop                     # USE settings
$ gzpaste /var/tmp/portage/app-text/gzpaste-0.1.3/temp/build.log  # a failed build log
```

## All options

| Option | What it does |
| --- | --- |
| `-e, --ext EXT` | syntax-highlight language, an extension or filename (see below); omit for no highlighting |
| `-x, --expires SECS` | expire after SECS seconds |
| `-b, --burn` | burn after reading (delete on first view) |
| `-p, --password PW` | encrypt (read with the `wastebin-password` HTTP header) |
| `-r, --raw` | print the `/raw/` plain-text URL |
| `-m, --md` | print the `/md/` rendered-Markdown URL |
| `-o, --owner` | Print the owner token required for deletion |
| `-v, --verbose` | print progress to stderr (URL still on stdout) |
| `-h, --help` | show help |
| `-V, --version` | show version |
| `del <id> <owner>` | delete a paste |

`gzpaste -h` shows the same.

## Highlight languages (178)

`-e` takes an extension or filename; the web form lists them all in a dropdown too:

{{% details title="Show all" %}}
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

## Upload with curl {#without-gzpaste-raw-curl}

gzpaste itself only needs curl. Doing it by hand needs [jq](https://github.com/jqlang/jq/wiki/Installation):

```bash
$ echo "content" | jq -Rs '{text: .}' \
  | curl -s -H 'content-type: application/json' --data-binary @- https://paste.gentoozh.org/ \
  | jq -r '"https://paste.gentoozh.org" + .path'
```

See the full HTTP API in the [wastebin docs](https://github.com/matze/wastebin#api-endpoints).

## Reading {#reading}

Put `/raw/` before the id for plain text, handy for scripts or a direct `curl`; pass `-r` when pasting to get it directly:

```bash
$ curl https://paste.gentoozh.org/raw/ID
```

For a Markdown document, `/md/ID` shows it rendered; pass `-m` when pasting to get that link.

For an encrypted paste, pass the password in the `wastebin-password` HTTP header (without it you only get a password prompt, the content isn't exposed):

```bash
$ curl -H 'wastebin-password: your-password' https://paste.gentoozh.org/raw/ID
```
