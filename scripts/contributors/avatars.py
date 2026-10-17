import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from .config import AVATAR_SIZES, CONTENT_DIRS
from .github import run_command

CURL_TIMEOUT = 30

def download_and_convert_avatar(login, avatar_url, dry_run=False):
    """下載並轉換多尺寸 WebP 頭像，寫入各語言目錄。"""
    if dry_run:
        print(f"  [DRY-RUN] 會下載頭像: {avatar_url}")
        return

    first_dir = CONTENT_DIRS['zh-cn'] / login
    first_dir.mkdir(parents=True, exist_ok=True)

    fd, temp_path = tempfile.mkstemp(
        prefix=f".avatar_{login}_",
        suffix=".png",
        dir=str(first_dir),
    )
    os.close(fd)
    temp_avatar = Path(temp_path)

    try:
        try:
            run_command(
                ['curl', '-sSLf', '--max-time', str(CURL_TIMEOUT),
                 '-o', str(temp_avatar), avatar_url],
                check=True,
                timeout=CURL_TIMEOUT + 5,
            )
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
            print(f"  警告: 下載 {login} 頭像失敗（{e}），跳過頭像處理")
            return

        if not temp_avatar.exists() or temp_avatar.stat().st_size == 0:
            print(f"  警告: {login} 頭像檔為空，跳過")
            return

        for size_name, size in AVATAR_SIZES.items():
            tmp_out = first_dir / f".avatar_{size_name}.{login}.tmp"
            try:
                run_command(
                    # 合成到白底，避免透明頭像的深色線條在深色頁面消失。
                    ['cwebp', '-quiet', '-q', '90',
                     '-blend_alpha', '0xFFFFFF',
                     '-resize', str(size), str(size),
                     str(temp_avatar), '-o', str(tmp_out)],
                    check=True,
                    timeout=30,
                )
                for lang, base_dir in CONTENT_DIRS.items():
                    target_dir = base_dir / login
                    target_dir.mkdir(parents=True, exist_ok=True)
                    target = target_dir / f"avatar_{size_name}.webp"
                    final_tmp = target.with_suffix('.webp.tmp')
                    shutil.copyfile(str(tmp_out), str(final_tmp))
                    os.replace(str(final_tmp), str(target))
                tmp_out.unlink()
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
                print(f"  警告: 轉換 {login} {size_name} 失敗（{e}）")
                try:
                    tmp_out.unlink()
                except FileNotFoundError:
                    pass
        for base_dir in CONTENT_DIRS.values():
            d = base_dir / login
            if (d / "avatar_card.webp").exists():
                (d / "feature.webp").unlink(missing_ok=True)
    finally:
        try:
            temp_avatar.unlink()
        except FileNotFoundError:
            pass
