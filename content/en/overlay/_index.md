---
title: "Overlay"
---

An overlay is a source of software outside the official Portage tree—layer it on top and you can install packages that aren't in the official repos. gentoo-zh is one of the long-standing ones: it grew out of gentoo-tw (started in 2003) and the later gentoo-china, when the two communities merged. The source lives on [GitHub](https://github.com/gentoo-zh/overlay).

{{< callout type="info" >}}
The overlay repo has moved to the organization repo [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay). The old personal repo `microcai/gentoo-zh` now redirects (301) to the new one; update to the new URL when you get a chance. See the [announcement and record](/posts/2026-07-02-gentoo-zh-repo-migration/) for details.
{{< /callout >}}

By now gentoo-zh carries over 450 packages, roughly in these categories:

- **Chinese / CJK**: the fcitx input methods plus a whole pile of plugins and input tables (rime, chinese-addons, etc.), Sogou / Moegirl / zhwiki pinyin dictionaries, Chinese fonts, and CJK patches for various software
- **Networking, dev tools, and the like**: we're Gentoo users, after all, and who doesn't have a few packages of their own to maintain
- **Patched desktop / performance kernels**: cachyos-sources, xanmod, liquorix, and friends

Some are packages the official repos have nobody looking after right now, so we keep shipping new versions here. There are also bug fixes: when a developer hits a bug, the fix gets pushed straight back into the repo.

One rule: don't break other people's systems. Every ebuild gets tested on the arches it supports before it goes in.

## Adding the gentoo-zh Overlay

{{% details title="Enable it with eselect repository" %}}

Install `app-eselect/eselect-repository` first:

```bash
eselect repository enable gentoo-zh
emerge --sync gentoo-zh
```

{{% /details %}}

{{% details title="Manual setup (if you'd rather not use eselect)" %}}

Create `gentoo-zh.conf` under `/etc/portage/repos.conf/`:

```ini
[gentoo-zh]
location = /var/db/repos/gentoo-zh
sync-type = git
sync-uri = https://github.com/gentoo-zh/overlay.git
auto-sync = yes
```

Then run `emerge --sync gentoo-zh`.

{{% /details %}}

{{< callout type="info" >}}
As of October 2025, the official project no longer provides cache mirrors for third-party repositories, so gentoo-zh now syncs directly from GitHub upstream. If you added it before, you'll need to update your sync source, see [this note](/posts/2025-10-07-thirdparty-repo-mirror-removal/).
{{< /callout >}}

## Mirrors for mainland China

If connecting straight to GitHub or the official distfiles is slow, you can switch gentoo-zh over to a mainland China mirror. Collected from [peeweep](/contributors/peeweep/)'s [announcement](https://t.me/gentoocn/56), thanks!

### git sync source

Point the overlay's sync source at a mainland mirror (gentoo-zh is a full ebuild mirror of [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay): ebuilds only, no source code). Available sources:

- Chongqing University: `https://mirrors.cqu.edu.cn/git/gentoo-zh.git`
- Nanjing University: `https://mirror.nju.edu.cn/git/gentoo-zh.git`

Adding it for the first time (install git first):

```bash
sudo emerge -aq dev-vcs/git          # install git if you don't have it
rm -rf /var/db/repos/gentoo-zh       # clear out the old one if you've synced before
eselect repository add gentoo-zh git https://mirrors.cqu.edu.cn/git/gentoo-zh.git
emerge --sync gentoo-zh
```

If you've already added it, just change the `sync-uri` in `/etc/portage/repos.conf/gentoo-zh.conf` to either address above.

### distfiles cache

Speeds up downloading package source code. The origin is <https://distfiles.gentoozh.org/>; available mirrors:

- Nanjing University: `https://mirror.nju.edu.cn/gentoo-zh`

In `GENTOO_MIRRORS` in `/etc/portage/make.conf`, append after the official mirrors:

```bash
GENTOO_MIRRORS="${GENTOO_MIRRORS} https://distfiles.gentoozh.org"
```

{{< callout type="info" >}}
If you don't want certain distfiles to be mirrored (for copyright reasons, etc.), add `RESTRICT="mirror"` to the relevant ebuild.
{{< /callout >}}

## Using packages from the overlay

All gentoo-zh packages are **`~arch` (testing) keyworded, with nothing marked stable**. Systems already running `~amd64` (the testing branch) can just `emerge` them directly; on a **stable branch** system you'll need to accept the testing keyword for these packages before installing.

Allow individual packages as you need them (recommended, only accept what you actually use):

```bash
echo "app-foo/bar ~amd64" >> /etc/portage/package.accept_keywords/gentoo-zh
emerge --ask app-foo/bar
```

Or allow the whole overlay (convenient, but it pulls in a lot more testing packages along the way, so it's your call):

```bash
echo "*/*::gentoo-zh ~amd64" >> /etc/portage/package.accept_keywords/gentoo-zh
```

To see what packages the overlay offers: `eix -RO gentoo-zh`.

## Contributing

We'd love help building out gentoo-zh: open a pull request on the [GitHub repository](https://github.com/gentoo-zh/overlay), and if you find a problem, issues are welcome too.
