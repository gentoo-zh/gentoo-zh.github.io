import json
from pathlib import Path

POLICY = json.loads((Path(__file__).resolve().parents[2] / "data/contributor-roles.json").read_text(encoding="utf-8"))
ROLE_TAGS = {role['id']: role['labels'] for role in POLICY['roles']}
TAG_TO_ROLE_LANG = {
    tag: (role['id'], lang)
    for role in POLICY['roles']
    for lang, tag in role['labels'].items()
}
TAG_TO_ROLE_LANG.update({
    alias['label']: (role['id'], alias['locale'])
    for role in POLICY['roles']
    for alias in role['aliases']
})
SPECIAL_TAGS = set(TAG_TO_ROLE_LANG)
DEFAULT_TAGS = POLICY['fallback']['labels']

def canonical_tag(existing_tag, lang):
    """保留目標語言的標籤與別名；其他語言的標籤改為目標語言的規範標籤。"""
    role, tag_lang = TAG_TO_ROLE_LANG[existing_tag]
    if tag_lang == lang:
        return existing_tag
    return ROLE_TAGS[role][lang]
