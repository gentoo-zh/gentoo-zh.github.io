from pathlib import Path

import yaml

CONTENT_DIRS = {
    'zh-cn': Path("content/zh-cn/contributors"),
    'zh-tw': Path("content/zh-tw/contributors"),
    'en': Path("content/en/contributors"),
}

CONFIG_FILE = Path(__file__).resolve().parents[1] / "contributors-config.yaml"

def load_config():
    """從配置檔載入設定，提供預設值"""
    default_config = {
        'org': 'gentoo-zh',
        'exclude_repos': [],
        'bots': [],
        'blocklist': [],
        'avatar_sizes': {'card': 200, 'single': 240},
    }

    if not CONFIG_FILE.exists():
        print(f"警告: 配置檔 {CONFIG_FILE} 不存在，使用預設配置")
        return default_config

    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f) or {}
        for key, value in default_config.items():
            config.setdefault(key, value)
        return config
    except Exception as e:
        print(f"警告: 讀取配置檔失敗: {e}，使用預設配置")
        return default_config


config = load_config()
ORG = config['org']
AVATAR_SIZES = config['avatar_sizes']
EXCLUDE_REPOS = set(config['exclude_repos'])
# GitHub 帳號不分大小寫，名單一律以 casefold 比對
BOTS = {login.casefold() for login in config['bots']}
BLOCKLIST = {login.casefold() for login in config['blocklist']}
