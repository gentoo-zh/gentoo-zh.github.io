---
title: "Contributing Guide"
description: "How to contribute to the Gentoo-zh Overlay and the Gentoo-zh Community website"
---

Welcome to the Gentoo-zh Community! Contributions come in a few flavours:

- **Contribute to the Gentoo-zh Overlay** (packages / ebuilds) — the main community track, and the source of the [contributor wall](/contributors/) (a script pulls everyone with 5+ commits to [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay) every month). See "Gentoo-zh Overlay Contributing Guide" below.
- **Contribute to the community website** (articles / translations / fixes) — lives in the [gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io) repo. See "Community Website Contributing Guide" in the second half of this page.
- **Translate the official Gentoo Wiki** (Chinese translators) — see [How to help translate the Gentoo Wiki](https://gentoozh.org/posts/2026-06-30-gentoo-wiki-translation/).

## Gentoo-zh Overlay Contributing Guide

gentoo-zh is a `masters = gentoo` Gentoo overlay (stacked on top of the official Portage tree) carrying 450+ packages, with its source at [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay). Adding or updating ebuilds, fixing bugs, keeping up with new upstream releases — it all goes through GitHub Pull Requests. Found a problem? File an [issue](https://github.com/gentoo-zh/overlay/issues) too.

{{< callout type="info" >}}
The overlay repo has moved to the org repo [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay), and the links on this page all point there. The old `microcai/gentoo-zh` personal repo 301-redirects to the new one; update your fork and local remotes to the new URL when convenient. See the [announcement and migration record](/posts/2026-07-02-gentoo-zh-repo-migration/).
{{< /callout >}}

{{< callout type="info" >}}
The [contributor wall](/contributors/) on the homepage counts exactly this kind of contribution — a script pulls everyone with 5+ commits to this repo every month.
{{< /callout >}}

### Getting set up

```bash
# Commit/QA tooling: pkgdev generates commit messages and Manifests, pkgcheck does the checks
# (these two have replaced the old repoman and are the current official tools)
emerge --ask dev-util/pkgdev   # pulls in pkgcheck as well
```

Fork the repo on [GitHub](https://github.com/gentoo-zh/overlay), clone your fork, and create a branch. Enable the overlay locally so you can test against it (see the [Overlay page](/overlay/)).

The repo is now named [`overlay`](https://github.com/gentoo-zh/overlay), so `git clone` creates an `overlay/` directory by default. **Clone it into a `gentoo-zh` directory instead** (to match `/var/db/repos/gentoo-zh`, not the default `overlay`):

```bash
# after forking on GitHub, clone your own fork
git clone https://github.com/<your-username>/overlay.git gentoo-zh
cd gentoo-zh
```

Or fork and clone in one step with the [GitHub CLI](https://cli.github.com/) (the `gentoo-zh` after `--` is the clone directory):

```bash
gh repo fork gentoo-zh/overlay --clone -- gentoo-zh
cd gentoo-zh
```

### Standard workflow for submitting an ebuild

This repo follows the official Gentoo ebuild repository spec; the authoritative reference for how to write ebuilds is the [Devmanual](https://devmanual.gentoo.org/):

1. **Put it in the right place**: `<category>/<package>/<package>-<version>.ebuild`. `category` must be one of the official categories (inherited from `::gentoo`'s `profiles/categories`, e.g. `app-misc`, `dev-libs`, `net-im`); directory name, file name and version all follow the official naming rules.
2. **Write the ebuild**: use the current **`EAPI=9`** (EAPI 8 is the previous generation — most older packages in the tree are still on 8, but new packages should go straight to 9; the differences from 8 are in the collapsible below). The standard two-line copyright header uses the year-range form, matching the official tree: `# Copyright 1999-2026 Gentoo Authors` + the GPL-2 notice. Fill in `DESCRIPTION`, `HOMEPAGE`, `SRC_URI`, `LICENSE`, `SLOT`, `IUSE`, and split dependencies by role: `DEPEND` (headers/libraries needed at build time), `RDEPEND` (runtime), `BDEPEND` (tools that run on the **build host**, e.g. pkgconfig, gettext), `IDEPEND` (tools used only during the install phase in `pkg_*`).
3. **KEYWORDS: testing keywords only** (`~amd64`, `~arm64`, etc.) — **this repo does not accept stable keywords**; a package that only works on specific arches uses a form like `-* ~amd64` to exclude the rest.
4. **Write `metadata.xml`**: every package needs one, declaring the maintainer and documenting every **local USE flag** (global flags are already described centrally in `use.desc`, so don't repeat them; required by the official spec, and `pkgcheck` will check for it).
5. **Generate the Manifest**: `pkgdev manifest`. This repo uses thin manifests (`thin-manifests = true`), so the `Manifest` records only distfile checksums (BLAKE2B/SHA512) — ebuild integrity is left to git.
6. **Test the build locally**: `ebuild <file> clean install` or `emerge`, and **actually test it on every architecture** listed in its `KEYWORDS` — don't claim support for something you haven't tested.
7. **Run QA yourself**: `pkgcheck scan --commits --net` (`--commits` checks only what your commits changed; `--net` allows networked checks such as whether `SRC_URI` still downloads; CI runs `pkgcheck` separately too).
8. **Commit**: use `pkgdev commit` to generate a spec-compliant commit message (format below), committing the ebuild, `metadata.xml` and `Manifest` together. Put all the commits for a single contribution in the **same PR** — don't split them.
9. **Open the PR and watch CI**: CI will automatically `emerge` the package and run `pkgcheck` — check the status on the PR's **Checks** tab (or your fork's **Actions**) and fix anything that goes red. The PR template has one box to tick — confirming you ran `pkgcheck scan --commits --net` locally. It merges only once everything is green and the box is ticked.

{{% details title="Full example: app-misc/foo (ebuild + metadata.xml)" %}}

`app-misc/foo/foo-1.2.3.ebuild`:

```bash
# Copyright 1999-2026 Gentoo Authors
# Distributed under the terms of the GNU General Public License v2

EAPI=9

inherit toolchain-funcs

DESCRIPTION="Example: a tiny tool that prints a greeting (for teaching)"
HOMEPAGE="https://github.com/gentoo-zh/foo"
SRC_URI="https://github.com/gentoo-zh/foo/archive/refs/tags/v${PV}.tar.gz -> ${P}.tar.gz"

LICENSE="MIT"
SLOT="0"
KEYWORDS="~amd64 ~arm64"
IUSE="examples nls"

RDEPEND="
	sys-libs/zlib
	nls? ( virtual/libintl )
"
DEPEND="${RDEPEND}"
BDEPEND="
	virtual/pkgconfig
	nls? ( sys-devel/gettext )
"

src_compile() {
	# Plain Makefile (no ./configure); an autotools package would usually call
	# econf in src_configure and rely on the default src_compile / src_install.
	emake CC="$(tc-getCC)" PREFIX="${EPREFIX}/usr" NLS="$(usex nls 1 0)"
}

src_install() {
	emake CC="$(tc-getCC)" PREFIX="${EPREFIX}/usr" DESTDIR="${D}" install
	einstalldocs

	if use examples; then
		docinto examples
		dodoc -r examples/.
	fi
}
```

`app-misc/foo/metadata.xml` (`nls` is a global flag so it needs no entry; `examples` is a local flag and must be described):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE pkgmetadata SYSTEM "https://www.gentoo.org/dtd/metadata.dtd">
<pkgmetadata>
	<maintainer type="person">
		<email>you@example.com</email>
		<name>Your Name</name>
	</maintainer>
	<use>
		<flag name="examples">Install example files into the documentation directory</flag>
	</use>
	<upstream>
		<remote-id type="github">gentoo-zh/foo</remote-id>
		<bugs-to>https://github.com/gentoo-zh/foo/issues</bugs-to>
	</upstream>
</pkgmetadata>
```

Once both files are written, run the whole flow from inside the package directory:

```bash
cd app-misc/foo
pkgdev manifest                          # 1. generate the Manifest (download distfile + record BLAKE2B/SHA512)
ebuild foo-1.2.3.ebuild clean install    # 2. build-test locally; or emerge -av app-misc/foo. Test on every KEYWORDS arch
pkgcheck scan --commits --net            # 3. QA — clear every error / warning
pkgdev commit                            # 4. generate the spec-compliant commit (ebuild + metadata.xml + Manifest together)
git push                                 # 5. push to your fork, then open a PR on GitHub
```

6. After opening the PR, **watch the CI**: on the PR's **Checks** tab (or your fork's **Actions** tab) look at the `emerge-on-pr` and `pkgcheck` pipelines — if one goes red, open the log and fix as directed, then `git push --force-with-lease` to update the branch (it re-runs automatically); it merges only once everything is **green and the PR template box is ticked**.

{{% /details %}}

{{% details title="What changed in EAPI 9 vs 8 (read this if you're coming from 8)" %}}

- **`assert` was removed** → use **`pipestatus`** (it checks the exit status of **every** command in the last pipeline: `foo | bar; pipestatus || die`).
- **`domo` was removed** → use `insinto` + `newins`.
- New: **`ver_replacing`** (compares a version against `REPLACING_VERSIONS`, handy in `pkg_postinst` for upgrade-path-specific messages) and **`edo`** (print a command and then run it, dying on failure — saves writing `echo` + `|| die`).
- **A batch of variables are no longer exported to the environment**: `ROOT`, `EROOT`, `USE`, `FILESDIR`, `DISTDIR`, `WORKDIR`, `S` and others are now plain shell variables usable inside the ebuild but not exported to child processes (the exceptions — `SYSROOT`, `ESYSROOT`, `BROOT`, `TMPDIR`, `HOME` — stay exported as before). If an external program you call reads these from the environment, `export` them yourself.
- Bash is now 5.3; when merging `D` to `ROOT`, absolute symlinks are merged as-is.

The full list is in the [Devmanual's EAPI differences table](https://devmanual.gentoo.org/ebuild-writing/eapi/).

{{% /details %}}

{{< callout type="warning" >}}
**The one rule: DO NOT BREAK PEOPLE'S SYSTEM.**
{{< /callout >}}

*This section (the ebuild submission flow) was reviewed and expanded by Chris🦈 Su (脆脆) — thank you.*

### Commit message conventions

We recommend using `pkgdev commit` to auto-generate a spec-compliant commit message.

{{% details title="Commit message format examples" %}}

A regular (non-version-bump) change:

```text
$category/$package: one-line summary

A multi-line explanation of why you made the change; if it's a bug fix and there's a
corresponding issue on GitHub, link it here.
```

A version bump:

```text
$category/$package: add $new_version, drop $old_version
```

{{% /details %}}

### Keeping up with upstream releases (nvchecker)

The repo uses [nvchecker](https://github.com/lilydjwg/nvchecker) to check each package against its upstream version every day (configured in `.github/workflows/overlay.toml`). When a new release shows up, it automatically opens or updates a [GitHub issue](https://github.com/gentoo-zh/overlay/issues) for it — **if you don't know where to start, grabbing a version-bump issue is the easiest way in.** When you add a new package, add an nvchecker rule for it in `overlay.toml` too (spelling out where its upstream version comes from), so it gets tracked as well.

### git config, signing and rebase

The details of a PR are governed by the official docs (see "Official specs and references" below); here are the ones you'll use most:

- **Identity**: set your real name and email first — your commit attribution uses them:

  ```bash
  git config user.name  "Your Name"
  git config user.email "you@example.com"
  ```

- **GPG signing (optional)**: this overlay does **not** require signing (`layout.conf` states there's no signing policy, and existing commits are mostly unsigned), but the official tree requires every commit to be OpenPGP-signed (see the [Gentoo git workflow](https://wiki.gentoo.org/wiki/Gentoo_git_workflow); the key policy is [GLEP 63](https://www.gentoo.org/glep/glep-0063.html)), and it's good practice. Generate a key per [Gentoo's GnuPG guide](https://wiki.gentoo.org/wiki/Project:Infrastructure/Generating_GLEP_63_based_OpenPGP_keys), then enable it:

  ```bash
  git config user.signingkey <your-key-id>
  git config commit.gpgsign true
  ```

  Official convention ([GLEP 76](https://www.gentoo.org/glep/glep-0076.html)) also wants a `Signed-off-by` line (developer certificate of origin) on each commit; `pkgdev commit` adds it automatically, or pass `-s` to a manual `git commit`.

- **Rebase to keep history clean**: before opening or updating a PR, rebase your branch onto the latest master — don't tangle history with merge commits — and squash stray fixup commits into the logical commit they belong to:

  ```bash
  git pull --rebase origin master   # sync with upstream
  git rebase -i origin/master       # tidy up / squash your own commits
  git push --force-with-lease        # update an already-opened PR branch
  ```

  `--force-with-lease` is only for **your own fork's PR branch** (the normal way to update a PR after rebasing); **never** rewrite history or force-push the shared upstream master — the official policy allows only fast-forward pushes to master. Put all the commits of one contribution in the same PR (the README's hard rule) — don't split them.

### Official specs and references

The how-to is **governed by the official docs**; this page is just a pointer:

- [Gentoo Devmanual](https://devmanual.gentoo.org/) — the authoritative manual for writing ebuilds (EAPI, variables, dependencies, `metadata.xml`, etc.)
- [Ebuild repository format](https://wiki.gentoo.org/wiki/Repository_format) and the [Overlays project](https://wiki.gentoo.org/wiki/Project:Overlays)
- [Gentoo git workflow](https://wiki.gentoo.org/wiki/Gentoo_git_workflow), [GLEP 76](https://www.gentoo.org/glep/glep-0076.html) (copyright and `Signed-off-by`), [GLEP 63](https://www.gentoo.org/glep/glep-0063.html) (OpenPGP keys)
- `pkgdev` / `pkgcheck` (`dev-util`) — the current commit and QA tools
- This repo's [README](https://github.com/gentoo-zh/overlay#readme) and the [dependency table](https://github.com/gentoo-zh/overlay/blob/deps-table/relation.md)

---

## Community Website Contributing Guide (articles / translations / docs)

## Project overview

This site is built with the [Hugo](https://gohugo.io/) static site generator, built by GitHub Actions and deployed to Cloudflare Workers (static asset hosting). The presentation layer (the theme) is [Hextra](https://imfing.github.io/hextra/) plus our own patch module [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme) — the latter is pulled in via [Hugo Modules](https://gohugo.io/hugo-modules/) and layers its overrides on top of Hextra, giving a dependency chain of **site → gentoozh-theme → Hextra**. So this repo holds only content and config; the template/style source lives in the patch module.

**Project repositories**: content/config at <https://github.com/gentoo-zh/gentoo-zh.github.io>; theme patch module at <https://github.com/gentoo-zh/gentoozh-theme>

## Project structure

### How content is organized

Content is stored in per-language directories: Simplified Chinese under `content/zh-cn/`, Traditional Chinese under `content/zh-tw/`, and English under `content/en/`. All three have identical directory structures:

- `download/` — download pages (mirrors and installation media)
- `overlay/` — Gentoo-zh Overlay docs
- `mirrorlist/` — mirror lists (Portage tree and Distfiles config)
- `about/` — about pages (project history, community channels, language notes)
- `contributors/` — contributors page (**auto-updated, no manual editing needed**)
- `contributing/` — contributing guide (this page)
- `changelog/` — changelog
- `posts/` — news articles and tutorials

> The Simplified version of a given piece goes under `content/zh-cn/...`, the Traditional version under the matching `content/zh-tw/...`, and the English version under the matching `content/en/...`. The filenames are `index.md` / `_index.md` (the `index.zh-cn.md` language-suffix style is **no longer** used).

### Configuration files

The main config lives in `config/_default/`:

- `hugo.toml` — main Hugo config (site info, taxonomies, Markdown rendering, output formats, etc.)
- `languages.toml` — language config (Simplified, Traditional and English, split into `[zh-cn]` / `[zh-tw]` / `[en]` within a single file)
- `menus.zh-cn.toml` / `menus.zh-tw.toml` / `menus.en.toml` — navigation menus per language
- `params.toml` — theme parameters (appearance, feature toggles)

### Multilingual support

- UI string translations live mostly in the **gentoozh-theme patch module**'s `i18n/` (the presentation layer); this repo's `i18n/` holds only a few site-specific strings (such as contributor role names)
- The default language is Simplified Chinese, served from the site root `/`; Traditional Chinese is served from `/zh-tw/`; English from `/en/`
- Simplified-to-Traditional conversion is handled by the repo's `sync_to_tw.sh` script (see below)

### Theme and assets

The presentation layer has been split out into a standalone patch-module, **[gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme)** (layered on top of Hextra, still tracking upstream updates), so this repo no longer holds template/style source:

- Templates (`layouts/`, including the homepage `home-bento`, the contributors page, etc.), site styles (`assets/css/custom.css`, the Gentoo-brand purple, etc.), and UI strings (`i18n/`) all live in gentoozh-theme
- The site pulls it in via `[[module.imports]]` in `config/_default/hugo.toml`, and pins the version in `go.mod`
- `static/` (`CNAME`, favicon, logo, OG images, etc.) still lives in this repo
- **Changing templates / styles → go to the [gentoozh-theme](https://github.com/Gentoo-zh/gentoozh-theme) repo; changing content → stay in this repo**

## Setting up your environment

The theme uses SCSS (pulled in via Hugo Modules), so you need the **Hugo extended** build — i.e. the **`extended` USE** on `www-apps/hugo` (it provides SASS/SCSS support; the USE is on by default, but make sure you haven't turned it off). You also need the **Go** toolchain to fetch the theme module.

```bash
# Gentoo: make sure hugo is built with the extended USE (required for Hextra's SCSS)
echo "www-apps/hugo extended" >> /etc/portage/package.use/hugo
emerge --ask www-apps/hugo dev-lang/go

# macOS (Homebrew's hugo is already the extended build)
brew install hugo go
```

> Note: Hugo's embedded SCSS transpiler (LibSass) was deprecated in v0.153.0 and will be removed in a future release; at that point you'll need the external [Dart Sass](https://gohugo.io/functions/css/sass/) (which works with the standard edition too, independent of the build). For now the extended build's embedded transpiler still works.

Fork and clone the repo (**no** `git submodule` needed — the module is fetched automatically at build time):

```bash
git clone https://github.com/your-username/gentoo-zh.github.io.git
cd gentoo-zh.github.io
```

Preview locally:

```bash
hugo server -D
# visit http://localhost:1313 to preview
```

## How to contribute to the website

### 1. Submit a new article

Articles use the [page bundle](https://gohugo.io/content-management/page-bundles/) form (one directory per article, body in `index.md`, so images sit next to the text). The default language is Simplified Chinese, so just scaffold it with `hugo new` (it lands under the default language's `content/zh-cn/`):

```bash
hugo new posts/2026-05-29-my-article/index.md
# creates content/zh-cn/posts/2026-05-29-my-article/index.md
```

The front matter that `hugo new` generates from `archetypes/default.md` carries `draft: true`, so once you're done, **drop `draft`** (otherwise the production build won't include it) and add `tags` and `authors` (see section 3). The final front matter looks like:

```yaml
---
title: "Article Title"
date: 2026-05-29
tags: ["tutorial"]
---

Article body... (for author attribution, see section 3 below)
```

Optional tags (`tags`, shown as `#tag` in the article list and on the article page, linked to the `/tags/` aggregation page; the homepage article cards also show the first tag): `tutorial`, `news`, `announcement`, `website`.

The homepage "Latest posts" puts tutorials first and announcements last by default; for a major announcement you can add `featured: true` to the front matter to pin it to the very front of the homepage, and remove it once the event has passed.

Once the Simplified version is done, generate the Traditional version with the script (see the next section) and put it at the matching `content/zh-tw/posts/.../index.md`.

### 2. Simplified-to-Traditional conversion

`sync_to_tw.sh` wraps OpenCC (`s2twp`) plus this site's terminology fixes and known-misconversion cleanups. Pass it the Simplified source file — the Traditional target path is derived automatically:

```bash
# install OpenCC first
emerge --ask app-i18n/opencc   # Gentoo
brew install opencc            # macOS
sudo apt install opencc        # Debian/Ubuntu

# Simplified → Traditional (target auto-generated at the matching content/zh-tw/ path)
./sync_to_tw.sh content/zh-cn/posts/2026-05-29-my-article/index.md

# no arguments: sync every Simplified file changed relative to git HEAD
./sync_to_tw.sh

# check only, don't write: report which Traditional versions lag their Simplified source (run this before committing)
./sync_to_tw.sh --check
```

After converting, check by hand for Taiwanese-usage differences.

### 3. Article attribution and avatars

In the article's front matter, list the author(s) under `authors` in "mapping" form, and Hextra will show the avatar + name + link in the byline:

```yaml
authors:
  - name: Your Name
    image: /contributors/<your-id>/feature.webp
    link: https://github.com/yourname
```

`image` can point to the avatar on your contributors page; omit `image` and only the name is shown.

### 4. Improving existing content / technical improvements

Typos, outdated info, usage tips, missing Traditional Chinese, English translations — spot any and fix them on the spot. Improvements on the technical side — templates, styles, performance, features — are welcome too.

> **The contributor lists (`content/*/contributors/`) are maintained automatically by a script.** It pulls everyone with 5+ commits to the [Gentoo-zh Overlay](https://github.com/gentoo-zh/overlay), shows their commit counts, sorts by commit volume, and updates monthly (`scripts/update-contributors.py` + GitHub Actions). **Do not edit that directory by hand**; the homepage contributor showcase updates along with it automatically.

## Submitting a Pull Request

```bash
git checkout -b your-feature-branch
git add .
git commit -m "describe your changes"
git push origin your-feature-branch
# then create a Pull Request on GitHub
```

## Writing conventions

### Markdown formatting

- Use standard Markdown syntax
- Label code blocks with the language (e.g. ` ```bash `)
- Place images inside the article directory and use relative paths
- Use Markdown formatting for links

### Chinese typography

- Leave one space between Chinese and Latin text
- Use full-width Chinese punctuation
- Use half-width characters for numbers and Latin text
- Keep proper nouns in their original form (e.g. Gentoo, Hugo, Hextra, Portage)

## FAQ

### How do I update the theme?

The theme layer is a standalone [gentoozh-theme](https://github.com/gentoo-zh/gentoozh-theme) patch module, so **the Hextra upgrade happens in that repo**:

```bash
# in the gentoozh-theme repo
hugo mod get -u github.com/imfing/hextra
hugo mod tidy
git commit -am "bump hextra"
git tag vX.Y.Z          # tag a new release
```

Then come back to **this** site's repo and pin the patch module to the new version:

```bash
hugo mod get github.com/gentoo-zh/gentoozh-theme@vX.Y.Z
git commit -am "bump gentoozh-theme"
```

### How do I add a new section page?

Create `_index.md` under `content/zh-cn/<section>/`, generate `content/zh-tw/<section>/_index.md` with the script, and if you want it in the top navigation, add a `[[main]]` entry to `config/_default/menus.zh-cn.toml` and `menus.zh-tw.toml` (and `menus.en.toml` for an English entry).

### What if the Simplified and Traditional content gets out of sync?

Treat the Simplified version as the source: re-run `sync_to_tw.sh` (usage above) to regenerate and overwrite the Traditional version, then proofread by hand. Don't keep two copies of the body text by hand, or they'll drift apart.

## Community

Run into a problem, or have a suggestion?

- **Telegram channel**: [@gentoocn](https://t.me/gentoocn)
- **Telegram group**: [@gentoo_zh](https://t.me/gentoo_zh)
- **GitHub Issues**: <https://github.com/gentoo-zh/gentoo-zh.github.io/issues>
- **Site contact email**: <zakk@gentoozh.org>

For more channels (IRC / Matrix / casual chat groups, etc.), see the [about page](/about/).

## License

Content on this site is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) unless stated otherwise. Code contributions follow the project's MIT license.

---

Fixing a typo, adding a line of translation, sending a PR — it all counts. The Gentoo-zh Community was built up exactly this way, one bit at a time.
