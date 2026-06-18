#!/bin/bash
#
# sync_to_tw.sh — 从 zh-cn 源生成 zh-tw（OpenCC s2twp + 针对本站的 sed 修正）。
# 转换内核（convert_one）未改动；外层只是加了几种便捷调用方式。
#
# 用法：
#   sync_to_tw.sh                   同步所有「相对 git HEAD 改动过的」zh-cn 文件（自动排除 contributors/）
#   sync_to_tw.sh <zh-cn 文件>      同步单个文件，目标自动推导（content/zh-cn/… → content/zh-tw/…）
#   sync_to_tw.sh <源文件> <目标>   显式指定源与目标（经典用法，向后兼容）
#   sync_to_tw.sh --all             同步整棵 content/zh-cn 树（排除 contributors/）
#   sync_to_tw.sh --check           只检查不写：报告哪些 zh-tw 落后于 zh-cn，有漂移则非零退出（适合 pre-commit / CI）
#   sync_to_tw.sh -h | --help       显示本帮助
#
# contributors/ 始终排除：那是 scripts/update-contributors.py 直接生成简繁两版的，不走本脚本。

set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"

# 绝对化自身路径：smart 模式会 cd 到仓库根目录，之后仍需能重新调用自己。
SELF="$(cd "$(dirname "$0")" 2>/dev/null && pwd)/$(basename "$0")"

# 可移植的就地编辑：GNU sed（Linux / CI）用 `-i`，BSD/macOS sed 用 `-i ''`。
if sed --version >/dev/null 2>&1; then SEDI=(-i); else SEDI=(-i ''); fi

usage() {
  cat >&2 <<'EOF'
用法：
  sync_to_tw.sh                   同步所有「相对 git HEAD 改动过的」zh-cn 文件（自动排除 contributors/）
  sync_to_tw.sh <zh-cn 文件>      同步单个文件，目标自动推导（content/zh-cn/… → content/zh-tw/…）
  sync_to_tw.sh <源文件> <目标>   显式指定源与目标（经典用法，向后兼容）
  sync_to_tw.sh --all             同步整棵 content/zh-cn 树（排除 contributors/）
  sync_to_tw.sh --check           只检查不写：报告哪些 zh-tw 落后于 zh-cn，有漂移则非零退出
  sync_to_tw.sh -h | --help       显示本帮助
EOF
}

require_opencc() {
  if ! command -v opencc &> /dev/null; then
    echo "Error: opencc not found. Please install it first:" >&2
    echo "  Gentoo: emerge --ask app-i18n/opencc | macOS: brew install opencc | Debian/Ubuntu: sudo apt install opencc" >&2
    exit 1
  fi
}

repo_root() { git rev-parse --show-toplevel 2>/dev/null || pwd; }

# 从 zh-cn 源路径推导出对应的 zh-tw 目标路径；不是 zh-cn 源则报错。
derive_target() {
  case "$1" in
    *content/zh-cn/*) printf '%s\n' "$1" | sed 's|content/zh-cn/|content/zh-tw/|' ;;
    *) echo "Error: 不是 content/zh-cn/ 下的源文件：$1" >&2; return 1 ;;
  esac
}

# 列出全部 zh-cn 的 .md（排除 contributors/）。
list_all_sources() {
  find content/zh-cn -type f -name '*.md' -not -path '*/contributors/*' | sort
}

# 列出相对 git HEAD 改动过（含未跟踪）的 zh-cn 的 .md（排除 contributors/）。
list_changed_sources() {
  { git diff --name-only HEAD -- content/zh-cn 2>/dev/null || true
    git ls-files --others --exclude-standard -- content/zh-cn 2>/dev/null || true
  } | sort -u | grep -E '\.md$' | grep -v '/contributors/' || true
}

# ── 转换内核（与原脚本逐字一致，只是包进函数）─────────────────────────────────
# Notes on rule selection:
#   - OpenCC s2twp already converts most simplified->traditional + Taiwan
#     phrases (软件->軟體, 内存->記憶體, etc.). We do NOT duplicate those.
#   - Only add rules for terms that OpenCC misses or converts wrong for
#     this site's domain (Gentoo/Linux/Hugo).
#   - Do NOT add a blanket s/包/套件/g — it breaks 包含/包括/打包/包装.
#   - Do NOT add a blanket s/文件/檔案/g — OpenCC converts 文档->文件
#     (documentation); we keep 文件 as documentation.
#   - Cleanup pass at the end fixes known OpenCC phrase-dict artifacts.
convert_one() {
  local SOURCE_FILE="$1" TARGET_FILE="$2"

  if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: source file '$SOURCE_FILE' not found" >&2
    return 1
  fi

  # 目标目录不存在时自动建好（首次为新栏目生成繁体时省去手动 mkdir）。
  mkdir -p "$(dirname "$TARGET_FILE")"

  # Step 1: OpenCC base conversion (simplified -> traditional w/ Taiwan phrases)。
  opencc -c s2twp -i "$SOURCE_FILE" -o "$TARGET_FILE"

  # Step 2: Domain-specific replacements OpenCC may miss.
  # Keep this list short and word-specific. Multi-char phrases first to avoid
  # greedy single-char matches.
  sed "${SEDI[@]}" \
    -e 's/分区/分割/g' \
    -e 's/挂载/掛載/g' \
    -e 's/卸载/卸載/g' \
    -e 's/编译/編譯/g' \
    -e 's/源码/原始碼/g' \
    -e 's/源代码/原始碼/g' \
    -e 's/守护进程/守護程式/g' \
    -e 's/进程/行程/g' \
    -e 's/线程/執行緒/g' \
    -e 's/插件/外掛/g' \
    -e 's/脚本/指令碼/g' \
    -e 's/链接/連結/g' \
    -e 's/U *[盘盤]/隨身碟/g' \
    -e 's/[优優][盘盤]/隨身碟/g' \
    -e 's/优化/最佳化/g' \
    -e 's/视频/影片/g' \
    -e 's/音频/音訊/g' \
    -e 's/接口/介面/g' \
    -e 's/界面/介面/g' \
    -e 's/分辨率/解析度/g' \
    -e 's/端口/連接埠/g' \
    -e 's/服务器/伺服器/g' \
    -e 's/客户端/客戶端/g' \
    -e 's/虚拟机/虛擬機/g' \
    -e 's/数据库/資料庫/g' \
    -e 's/算法/演算法/g' \
    -e 's/缓存/快取/g' \
    -e 's/网络/網路/g' \
    -e 's/网卡/網路卡/g' \
    -e 's/声卡/音效卡/g' \
    -e 's/键盘/鍵盤/g' \
    -e 's/鼠标/滑鼠/g' \
    -e 's/屏幕/螢幕/g' \
    -e 's/硬盘/硬碟/g' \
    -e 's/磁盘/磁碟/g' \
    -e 's/操作系统/作業系統/g' \
    -e 's/教程/教學/g' \
    -e 's/示例/範例/g' \
    -e 's/示範/範例/g' \
    -e 's/调试器/除錯器/g' \
    -e 's/调试/除錯/g' \
    -e 's/中转/中轉/g' \
    -e 's/性能/效能/g' \
    -e 's/兼容/相容/g' \
    -e 's/构建/構建/g' \
    -e 's/依赖/依賴/g' \
    -e 's/仓库/倉庫/g' \
    -e 's/项目/專案/g' \
    -e 's/账户/帳戶/g' \
    -e 's/默认/預設/g' \
    -e 's/计划/計畫/g' \
    -e 's/博客/部落格/g' \
    -e 's/字体/字型/g' \
    -e 's/布局/佈局/g' \
    -e 's/数据/資料/g' \
    -e 's/信息/資訊/g' \
    -e 's/信号/訊號/g' \
    -e 's/重定向/重新導向/g' \
    -e 's/环境变量/環境變數/g' \
    -e 's/变量/變數/g' \
    -e 's/函数/函式/g' \
    -e 's/参数/參數/g' \
    -e 's/选项/選項/g' \
    -e 's/返回值/回傳值/g' \
    -e 's/模块/模組/g' \
    -e 's/组件/元件/g' \
    -e 's/进阶/進階/g' \
    -e 's/查找/搜尋/g' \
    -e 's/命令/指令/g' \
    -e 's/终端/終端機/g' \
    -e 's/同步/同步/g' \
    -e 's/固件/韌體/g' \
    -e 's/电源/電源/g' \
    -e 's/电池/電池/g' \
    -e 's/主板/主機板/g' \
    -e 's/设备/裝置/g' \
    -e 's/路径/路徑/g' \
    -e 's/权限/權限/g' \
    -e 's/所有者/擁有者/g' \
    -e 's/根目录/根目錄/g' \
    -e 's/工作目录/工作目錄/g' \
    -e 's/目录/目錄/g' \
    -e 's/临时/暫時/g' \
    -e 's/解压/解壓/g' \
    -e 's/压缩/壓縮/g' \
    -e 's/传输/傳輸/g' \
    -e 's/启动/啟動/g' \
    -e 's/重启/重啟/g' \
    -e 's/登录/登入/g' \
    -e 's/注销/登出/g' \
    -e 's/连接/連線/g' \
    -e 's/断开/中斷/g' \
    -e 's/上传/上傳/g' \
    -e 's/下载/下載/g' \
    -e 's/创建/建立/g' \
    -e 's/删除/刪除/g' \
    -e 's/复制/複製/g' \
    -e 's/粘贴/貼上/g' \
    -e 's/保存/儲存/g' \
    -e 's/隐藏/隱藏/g' \
    -e 's/开启/開啟/g' \
    -e 's/关闭/關閉/g' \
    -e 's/编辑器/編輯器/g' \
    -e 's/编辑/編輯/g' \
    -e 's/编译器/編譯器/g' \
    -e 's/手册/手冊/g' \
    -e 's/制作/製作/g' \
    -e 's/简化/簡化/g' \
    -e 's/延伸阅读/延伸閱讀/g' \
    -e 's/结语/結語/g' \
    -e 's/可参考/可參考/g' \
    -e 's/著称/著稱/g' \
    -e 's/有线/有線/g' \
    -e 's/无线/無線/g' \
    -e 's/虚拟/虛擬/g' \
    -e 's/架构/架構/g' \
    -e 's/驱动/驅動/g' \
    -e 's/通过/透過/g' \
    -e 's/支持/支援/g' \
    -e 's/软件/軟體/g' \
    -e 's/硬件/硬體/g' \
    -e 's/内存/記憶體/g' \
    -e 's/内核/核心/g' \
    -e 's/显卡/顯示卡/g' \
    -e 's/顯卡/顯示卡/g' \
    -e 's/社区/社群/g' \
    -e 's/用户/使用者/g' \
    -e 's/用户组/使用者群組/g' \
    -e 's/文件系统/檔案系統/g' \
    -e 's/环境/環境/g' \
    -e 's/设置/設定/g' \
    -e 's/系统/系統/g' \
    -e 's/安装/安裝/g' \
    -e 's/注释/註釋/g' \
    -e 's/绑定/繫結/g' \
    -e 's/映射/對應/g' \
    "$TARGET_FILE"

  # Step 3: Cleanup pass — fix OpenCC s2twp + sed phrase-dict artifacts.
  # These run AFTER all substitutions above to undo known over-conversions.
  sed "${SEDI[@]}" \
    -e 's/使用者名稱稱/使用者名稱/g' \
    -e 's/新新增/新增/g' \
    -e 's/套件含/包含/g' \
    -e 's/套件括/包括/g' \
    -e 's/套件圍/包圍/g' \
    -e 's/打套件/打包/g' \
    -e 's/字地化/本地化/g' \
    -e 's/檔案翻譯/文件翻譯/g' \
    -e 's/中文檔案/中文文件/g' \
    -e 's/Overlay 檔案/Overlay 文件/g' \
    -e 's/映象/鏡像/g' \
    -e 's/映像源/鏡像源/g' \
    -e 's/映像列表/鏡像列表/g' \
    -e 's/解除安裝/卸載/g' \
    -e 's/軟體包/軟體套件/g' \
    -e 's/安裝包/安裝套件/g' \
    -e 's/包管理器/套件管理器/g' \
    -e 's/包管理/套件管理/g' \
    -e 's/包依賴/套件依賴/g' \
    -e 's/包安裝/套件安裝/g' \
    -e 's/包名/套件名/g' \
    -e 's/包列表/套件列表/g' \
    -e 's/包版本/套件版本/g' \
    -e 's/包源/套件源/g' \
    -e 's/質量/品質/g' \
    -e 's/隻是/只是/g' -e 's/隻有/只有/g' -e 's/隻要/只要/g' -e 's/隻能/只能/g' -e 's/隻會/只會/g' -e 's/隻認/只認/g' \
    "$TARGET_FILE"

  # Step 4: Mirror-source localization for Taiwan (TWAREN).
  # Only fires when the source file references the BFSU mirror.
  sed "${SEDI[@]}" \
    -e 's|https://mirrors\.bfsu\.edu\.cn/gentoo/releases/amd64/autobuilds/|http://ftp.twaren.net/Linux/Gentoo/releases/amd64/autobuilds/|g' \
    -e 's|GENTOO_MIRRORS="https://mirrors\.bfsu\.edu\.cn/gentoo/"|GENTOO_MIRRORS="http://ftp.twaren.net/Linux/Gentoo/"|g' \
    -e 's|sync-uri = https://mirrors\.bfsu\.edu\.cn/git/gentoo-portage\.git|sync-uri = https://github.com/gentoo-mirror/gentoo.git|g' \
    -e 's|以 BFSU 鏡像站|以 TWAREN 鏡像站|g' \
    "$TARGET_FILE"

  # Step 4b: Terminology localization for Taiwan readers.
  # 简体的「国内 / 境内」对台湾读者指的是台湾；繁体版改用「中国内陆」把所指说清楚。
  # 先用占位符保护「國內外 / 境內外」以免被误伤成「中國內陸外」。
  sed "${SEDI[@]}" \
    -e 's/國內外/GUONEIWAI_KEEP/g' \
    -e 's/國內/中國內陸/g' \
    -e 's/GUONEIWAI_KEEP/國內外/g' \
    -e 's/境內外/JINGNEIWAI_KEEP/g' \
    -e 's/境內/中國內陸/g' \
    -e 's/JINGNEIWAI_KEEP/境內外/g' \
    "$TARGET_FILE"

  # Step 5: Strip /zh-tw suffix from Gentoo wiki links (no Taiwan locale exists)
  sed "${SEDI[@]}" \
    -e 's|wiki.gentoo.org/wiki/\([^)]*\)/zh-tw)|wiki.gentoo.org/wiki/\1)|g' \
    -e 's|wiki.gentoo.org/wiki/\([^)]*\)/zh-tw#|wiki.gentoo.org/wiki/\1#|g' \
    "$TARGET_FILE"

  echo "Converted: $SOURCE_FILE -> $TARGET_FILE"
}

# ── 调度 ──────────────────────────────────────────────────────────────────────

# 1) 帮助（无需 opencc）
case "${1-}" in -h|--help) usage; exit 0 ;; esac

require_opencc

# 2) 经典两参数（显式源 + 目标，向后兼容）。$1 不以 - 开头才走这条。
if [ "$#" -eq 2 ] && [ "${1#-}" = "$1" ]; then
  convert_one "$1" "$2"
  exit 0
fi

# 3) smart 模式（在仓库根目录下操作）
case "${1-}" in
  --check)
    cd "$(repo_root)"
    stale=0; checked=0
    while IFS= read -r src; do
      [ -n "$src" ] || continue
      checked=$((checked + 1))
      tgt="$(derive_target "$src")"
      tmp="$(mktemp)"
      if ! convert_one "$src" "$tmp" >/dev/null 2>&1; then
        echo "转换失败: $src" >&2; rm -f "$tmp"; exit 1
      fi
      if [ ! -f "$tgt" ]; then
        echo "缺失: $tgt （$src 尚未生成繁体）"; stale=$((stale + 1))
      elif ! diff -q "$tgt" "$tmp" >/dev/null; then
        echo "漂移: $tgt 落后于 $src"; stale=$((stale + 1))
      fi
      rm -f "$tmp"
    done < <(list_all_sources)
    if [ "$stale" -gt 0 ]; then
      echo "✗ 检查 $checked 个，$stale 个 zh-tw 需要重新同步（运行 sync_to_tw.sh 重生成）" >&2
      exit 1
    fi
    echo "✓ 检查 $checked 个，全部 zh-tw 与 zh-cn 一致"
    exit 0
    ;;
  --all)
    cd "$(repo_root)"
    n=0
    while IFS= read -r src; do
      [ -n "$src" ] || continue
      convert_one "$src" "$(derive_target "$src")" >/dev/null
      echo "synced: $src"; n=$((n + 1))
    done < <(list_all_sources)
    echo "✓ 同步 $n 个文件（content/zh-cn → zh-tw，已排除 contributors/）"
    exit 0
    ;;
  "")
    cd "$(repo_root)"
    files="$(list_changed_sources)"
    if [ -z "$files" ]; then
      echo "没有相对 git HEAD 改动过的 zh-cn 文件需要同步。"
      exit 0
    fi
    n=0
    while IFS= read -r src; do
      [ -n "$src" ] || continue
      convert_one "$src" "$(derive_target "$src")" >/dev/null
      echo "synced: $src"; n=$((n + 1))
    done <<< "$files"
    echo "✓ 同步 $n 个改动过的文件（已排除 contributors/）"
    exit 0
    ;;
  -*)
    echo "未知选项：$1" >&2; usage; exit 1
    ;;
esac

# 4) 单参数：一个 zh-cn 源 → 自动推导目标
if [ "$#" -eq 1 ]; then
  tgt="$(derive_target "$1")" || exit 1
  convert_one "$1" "$tgt"
  exit 0
fi

usage
exit 1
