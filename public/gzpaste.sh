#!/bin/sh
# gzpaste: paste to paste.gentoozh.org from the command line.
# https://github.com/gentoo-zh/gzpaste
# SPDX-License-Identifier: MIT
set -eu

VERSION=0.1.4
BASE="${GZPASTE_URL:-https://paste.gentoozh.org}"

# Locale -> en / cn (Simplified) / tw (Traditional). GZPASTE_LANG overrides.
case "${GZPASTE_LANG:-${LC_ALL:-${LC_MESSAGES:-${LANG:-}}}}" in
	tw | zh_TW* | zh_HK* | zh_MO* | *[Hh]ant*) L=tw ;;
	cn | zh*) L=cn ;;
	*) L=en ;;
esac

die() { echo "gzpaste: $*" >&2; exit 1; }

t() { # localized message by key
	case "$1.$L" in
	curl.cn) echo "缺 curl（Gentoo：emerge net-misc/curl）" ;;
	curl.tw) echo "缺 curl（Gentoo：emerge net-misc/curl）" ;;
	curl.*) echo "curl is required (Gentoo: emerge net-misc/curl)" ;;
	del.cn) echo "用法：gzpaste del <id> <owner>" ;;
	del.tw) echo "用法：gzpaste del <id> <owner>" ;;
	del.*) echo "usage: gzpaste del <id> <owner>" ;;
	file.cn) echo "读不了文件：" ;;
	file.tw) echo "讀不了檔案：" ;;
	file.*) echo "cannot read file: " ;;
	exp.cn) echo "过期时间要是秒数（整数）" ;;
	exp.tw) echo "過期時間要是秒數（整數）" ;;
	exp.*) echo "expiry must be a whole number of seconds" ;;
	send.cn) echo "上传到 " ;;
	send.tw) echo "上傳到 " ;;
	send.*) echo "uploading to " ;;
	up.cn) echo "上传失败" ;;
	up.tw) echo "上傳失敗" ;;
	up.*) echo "upload failed" ;;
	text.cn) echo "paste 站只存 UTF-8 文本，这个文件不是。先转码（iconv -f gbk -t utf-8 文件 | gzpaste）或编码（base64 文件 | gzpaste）" ;;
	text.tw) echo "paste 站只存 UTF-8 文字，這個檔案不是。先轉碼（iconv -f gbk -t utf-8 檔案 | gzpaste）或編碼（base64 檔案 | gzpaste）" ;;
	text.*) echo "the pastebin stores UTF-8 text only and this file is not text. Convert it first (iconv -f gbk -t utf-8 FILE | gzpaste) or encode it (base64 FILE | gzpaste)" ;;
	big.cn) echo "超过服务器的大小上限" ;;
	big.tw) echo "超過伺服器的大小上限" ;;
	big.*) echo "larger than the server's size limit" ;;
	rate.cn) echo "请求太频繁，等一会儿再试" ;;
	rate.tw) echo "請求太頻繁，等一會兒再試" ;;
	rate.*) echo "too many requests, wait a moment and retry" ;;
	opt.cn) echo "未知选项：" ;;
	opt.tw) echo "未知選項：" ;;
	opt.*) echo "unknown option: " ;;
	esac
}

usage() {
	case "$L" in
	cn) cat <<EOF
gzpaste $VERSION,从命令行贴到 paste.gentoozh.org

用法：
  某命令 | gzpaste [选项]      贴标准输入
  gzpaste [选项] 文件          贴一个文件
  gzpaste del <id> <owner>    删除一份 paste

选项：
  -e, --ext EXT        语法高亮扩展名（py、rs、sh …）
  -x, --expires 秒     多少秒后过期
  -b, --burn           阅后即焚（第一次打开后删除）
  -p, --password 密码   加密（读取时带 wastebin-password 头）
  -r, --raw            输出 /raw/ 纯文本链接
  -m, --md             输出 /md/ Markdown 渲染链接
  -o, --owner          连 owner 一起输出（之后删除要用）
  -v, --verbose        进度打到 stderr
  -h, --help           显示帮助
  -V, --version        显示版本

环境变量：GZPASTE_URL 覆盖地址，GZPASTE_LANG 覆盖语言（en/cn/tw）。
EOF
		;;
	tw) cat <<EOF
gzpaste $VERSION,從命令列貼到 paste.gentoozh.org

用法：
  某命令 | gzpaste [選項]      貼標準輸入
  gzpaste [選項] 檔案          貼一個檔案
  gzpaste del <id> <owner>    刪除一份 paste

選項：
  -e, --ext EXT        語法高亮副檔名（py、rs、sh …）
  -x, --expires 秒     多少秒後過期
  -b, --burn           閱後即焚（第一次開啟後刪除）
  -p, --password 密碼   加密（讀取時帶 wastebin-password 標頭）
  -r, --raw            輸出 /raw/ 純文字連結
  -m, --md             輸出 /md/ Markdown 算圖連結
  -o, --owner          連 owner 一起輸出（之後刪除要用）
  -v, --verbose        進度打到 stderr
  -h, --help           顯示說明
  -V, --version        顯示版本

環境變數：GZPASTE_URL 覆蓋位址，GZPASTE_LANG 覆蓋語言（en/cn/tw）。
EOF
		;;
	*) cat <<EOF
gzpaste $VERSION, paste to paste.gentoozh.org from the command line

Usage:
  some-cmd | gzpaste [options]   paste stdin
  gzpaste [options] FILE         paste a file
  gzpaste del <id> <owner>       delete a paste

Options:
  -e, --ext EXT         syntax-highlight extension (py, rs, sh, ...)
  -x, --expires SECS    expire after SECS seconds
  -b, --burn            burn after reading (delete on first view)
  -p, --password PW     encrypt (read with the wastebin-password header)
  -r, --raw             output the /raw/ plain-text URL
  -m, --md              output the /md/ rendered-Markdown URL
  -o, --owner           also print the owner token (needed to delete)
  -v, --verbose         print progress to stderr
  -h, --help            show this help
  -V, --version         show version

Environment: GZPASTE_URL overrides the base URL, GZPASTE_LANG the language (en/cn/tw).
EOF
		;;
	esac
}

command -v curl >/dev/null 2>&1 || die "$(t curl)"

case "${1:-}" in
del | delete)
	id="${2:-}"
	owner="${3:-}"
	if [ -z "$id" ] || [ -z "$owner" ]; then die "$(t del)"; fi
	id="${id##*/}" # accept a full URL too
	ck="$(mktemp)"
	trap 'rm -f "$ck"' EXIT
	curl -fsS -c "$ck" -G --data-urlencode "owner=$owner" "$BASE/$id" -o /dev/null
	curl -fsS -b "$ck" -X DELETE "$BASE/$id"
	exit 0
	;;
esac

ext=
expires=
burn=false
password=
showowner=false
raw=false
md=false
verbose=false
file=
while [ $# -gt 0 ]; do
	case "$1" in
	-e | --ext) ext="${2:?}"; shift 2 ;;
	-x | --expires) expires="${2:?}"; shift 2 ;;
	-b | --burn) burn=true; shift ;;
	-p | --password) password="${2:?}"; shift 2 ;;
	-o | --owner) showowner=true; shift ;;
	-r | --raw) raw=true; shift ;;
	-m | --md) md=true; shift ;;
	-v | --verbose) verbose=true; shift ;;
	-h | --help) usage; exit 0 ;;
	-V | --version) echo "gzpaste $VERSION"; exit 0 ;;
	--) shift; file="${1:-}"; break ;;
	-*) die "$(t opt)$1" ;;
	*) file="$1"; shift ;;
	esac
done

case "$expires" in
'') ;;
*[!0-9]*) die "$(t exp)" ;;
esac

# JSON-encode stdin as a quoted JSON string. Byte-for-byte equivalent to
# `jq -Rs .`, verified across quotes, backslashes, newlines, tabs, UTF-8 and
# control characters, so gzpaste needs only curl (no jq).
json_str() {
	LC_ALL=C awk '
	BEGIN { RS = "\0"; ORS = ""; seen = 0; nul = 0 }
	{
		if (seen) nul = 1
		seen = 1; s = $0
		gsub(/\\/, "&&", s); gsub(/"/, "\\\"", s)
		gsub(/\010/, "\\b", s); gsub(/\011/, "\\t", s); gsub(/\012/, "\\n", s)
		gsub(/\014/, "\\f", s); gsub(/\015/, "\\r", s)
		gsub(/\001/, "\\u0001", s); gsub(/\002/, "\\u0002", s); gsub(/\003/, "\\u0003", s)
		gsub(/\004/, "\\u0004", s); gsub(/\005/, "\\u0005", s); gsub(/\006/, "\\u0006", s)
		gsub(/\007/, "\\u0007", s); gsub(/\013/, "\\u000b", s); gsub(/\016/, "\\u000e", s)
		gsub(/\017/, "\\u000f", s); gsub(/\020/, "\\u0010", s); gsub(/\021/, "\\u0011", s)
		gsub(/\022/, "\\u0012", s); gsub(/\023/, "\\u0013", s); gsub(/\024/, "\\u0014", s)
		gsub(/\025/, "\\u0015", s); gsub(/\026/, "\\u0016", s); gsub(/\027/, "\\u0017", s)
		gsub(/\030/, "\\u0018", s); gsub(/\031/, "\\u0019", s); gsub(/\032/, "\\u001a", s)
		gsub(/\033/, "\\u001b", s); gsub(/\034/, "\\u001c", s); gsub(/\035/, "\\u001d", s)
		gsub(/\036/, "\\u001e", s); gsub(/\037/, "\\u001f", s); gsub(/\177/, "\\u007f", s)
		printf "\"%s\"", s
	}
	END { if (nul) exit 2; if (!seen) printf "\"\"" }
	'
}

build_json() { # reads the paste text from stdin
	text=$(json_str) || return 1 # 2 = NUL byte, i.e. not a text file
	printf '{"text":%s' "$text"
	if [ -n "$ext" ]; then printf ',"extension":%s' "$(printf '%s' "$ext" | json_str)"; fi
	if [ -n "$password" ]; then printf ',"password":%s' "$(printf '%s' "$password" | json_str)"; fi
	if [ -n "$expires" ]; then printf ',"expires":%s' "$expires"; fi
	if [ "$burn" = true ]; then printf ',"burn_after_reading":true'; fi
	printf '}'
}

# Bare interactive run (no file, stdin is a terminal): show help instead of
# blocking on stdin.
if [ -z "$file" ] && [ -t 0 ]; then usage; exit 0; fi

if [ -n "$file" ]; then
	if [ ! -f "$file" ] || [ ! -r "$file" ]; then die "$(t file)$file"; fi
	json=$(build_json <"$file") || die "$(t text)"
else
	json=$(build_json) || die "$(t text)"
fi

if [ "$verbose" = true ]; then echo "gzpaste: $(t send)$BASE" >&2; fi
# No -f here: the server explains a rejection in the body, and curl -f throws
# that away, which turned every binary or non-UTF-8 file into a bare
# "upload failed". The status code comes last so sed can split the two.
out=$(printf '%s' "$json" | curl -sS -w '\n%{http_code}' \
	-H 'content-type: application/json' --data-binary @- "$BASE/") || die "$(t up)"
code=$(printf '%s' "$out" | sed -n '$p')
resp=$(printf '%s' "$out" | sed '$d')

case "$code" in
2??) ;;
400)
	# wastebin takes the paste as a JSON string, so a NUL byte, a raw control
	# byte or invalid UTF-8 (GBK text, an image, an archive) fails to parse.
	case "$resp" in
	*"invalid unicode code point"* | *"control character"*) die "$(t text)" ;;
	esac
	die "$(t up) (HTTP $code)${resp:+: $resp}"
	;;
413) die "$(t big)" ;;
429) die "$(t rate)" ;;
*) die "$(t up) (HTTP $code)${resp:+: $resp}" ;;
esac

path=$(printf '%s' "$resp" | sed -n 's/.*"path":"\([^"]*\)".*/\1/p')
[ -n "$path" ] || die "$(t up)${resp:+: $resp}"
if [ "$raw" = true ]; then
	url="$BASE/raw$path"
elif [ "$md" = true ]; then
	url="$BASE/md$path"
else
	url="$BASE$path"
fi
if [ "$showowner" = true ]; then
	owner=$(printf '%s' "$resp" | sed -n 's/.*"owner":"\([^"]*\)".*/\1/p')
	printf '%s\towner: %s\n' "$url" "$owner"
else
	printf '%s\n' "$url"
fi
