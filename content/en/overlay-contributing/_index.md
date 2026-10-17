---
title: "Overlay contribution guide"
description: "Submit ebuilds, follow repository rules and configure autobump"
---

## Gentoo-zh Overlay Contributing Guide

gentoo-zh is an ebuild repository stacked on top of the official Gentoo repository (`masters = gentoo`), with its source at [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay). New packages and updates arrive as GitHub pull requests, and problems go to [issues](https://github.com/gentoo-zh/overlay/issues). Community maintainers review every pull request and guide contributors through the changes it needs.

{{< callout type="warning" >}}
**The one rule: DO NOT BREAK PEOPLE'S SYSTEM.**
{{< /callout >}}

{{< callout type="info" >}}
The repository moved from `microcai/gentoo-zh` to [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay), and the old URLs redirect to it. Update your fork and local remotes when convenient; see the [migration announcement](/posts/2026-07-02-gentoo-zh-repo-migration/).
{{< /callout >}}

### Before you start

Install `pkgdev`, the commit and QA tool; it pulls in `pkgcheck`:

```bash
# emerge --ask dev-util/pkgdev
```

Fork [gentoo-zh/overlay](https://github.com/gentoo-zh/overlay) on GitHub. Clone it into a `gentoo-zh` directory to match `/var/db/repos/gentoo-zh`, not the default `overlay`:

```bash
$ git clone https://github.com/<your-username>/overlay.git gentoo-zh
```

With the [GitHub CLI](https://cli.github.com/), fork and clone in one step; the `gentoo-zh` after `--` is the directory name:

```bash
$ gh repo fork gentoo-zh/overlay --clone -- gentoo-zh
```

To enable the overlay locally, see the [Overlay setup](/overlay/) guide.

### Writing the ebuild

This page does not teach ebuild writing. The repository follows Gentoo's official ebuild repository rules, so use the official documentation:

- [Devmanual quickstart](https://devmanual.gentoo.org/quickstart/): ebuild structure and common examples
- [Basic guide to write Gentoo Ebuilds](https://wiki.gentoo.org/wiki/Basic_guide_to_write_Gentoo_Ebuilds): the Gentoo Wiki introduction
- [Devmanual](https://devmanual.gentoo.org/): the reference for variables, dependencies, eclasses and phase functions
- [EAPI differences](https://devmanual.gentoo.org/ebuild-writing/eapi/): what each EAPI adds and removes
- [metadata.xml](https://devmanual.gentoo.org/ebuild-writing/misc-files/metadata/) and [keywording](https://devmanual.gentoo.org/keywording/)
- [Ebuild repository](https://wiki.gentoo.org/wiki/Ebuild_repository): the repository layout
- [pkgdev](https://pkgcore.github.io/pkgdev/) and [pkgcheck](https://pkgcore.github.io/pkgcheck/): documentation for the commit and QA tools
- [GLEP 66](https://www.gentoo.org/glep/glep-0066.html): Gentoo's git workflow and commit message rules

### Repository rules

These rules come from the repository [README](https://github.com/gentoo-zh/overlay/blob/master/README.en.md) and the [pull request template](https://github.com/gentoo-zh/overlay/blob/master/.github/pull_request_template.md):

- Use testing keywords only (`~amd64`, `~arm64` and so on), never stable keywords.
- Give every package a `metadata.xml` that names its maintainer and describes each local USE flag.
- The repository uses thin manifests: generate `Manifest` with `pkgdev manifest`; it records only distfile checksums.
- Make sure the ebuild compiles before committing, and test it on every keyword you declare. CI builds on amd64 and arm64; if a problem appears on an arch you do not have and you cannot solve it, remove that keyword.
- `LICENSE` must match what upstream actually grants. For a license that `::gentoo` lacks, add its full text under `licenses/`, put it in the matching group in `profiles/license_groups`, and set `RESTRICT` from its redistribution terms.
- Register every package in `overlay.toml`; see [Automatic version bumps](#autobump).
- Each commit carries all the changes it needs, for example an ebuild and its `Manifest` in the same commit. All commits of one contribution go in one pull request.
- Run `pkgcheck scan --commits --net` locally before opening the pull request, and tick every box in the template; unticked boxes block the merge.
- The `emerge-on-pr` and `pkgcheck` checks on the pull request must pass. Fix what they report, QA warnings included.
- If you use AI, it must follow [AGENTS.md](https://github.com/gentoo-zh/overlay/blob/master/AGENTS.md). You are responsible for every commit, and the submitter and commit author must be a human.
- Keep maintaining the packages you add. When you stop, look for a new maintainer in the issues, or mask the package in `profiles/package.mask` and drop it when the mask expires.

Generate commit messages with `pkgdev commit`. A version bump:

```text
$category/$package: add $new_version, drop $old_version
```

Any other change:

```text
$category/$package: one-line summary

Why you made the change; link the GitHub issue if it fixes a reported bug.
```

### How do I prevent automatic mirroring of a package’s distfile? {#restrict-mirror}

An ebuild’s `RESTRICT` values `mirror` and `fetch` restrict automatic distfile mirroring. `bindist` restricts binary packages and does not by itself determine whether distfiles are mirrored.

### Automatic version bumps (autobump) {#autobump}

[`.github/workflows/overlay.toml`](https://github.com/gentoo-zh/overlay/blob/master/.github/workflows/overlay.toml) is the [nvchecker](https://github.com/lilydjwg/nvchecker) configuration, with one entry per package in `category/package` alphabetical order. When nvchecker finds a new upstream version it opens an [issue](https://github.com/gentoo-zh/overlay/issues) and notifies the entry's `github_account`. If you want to help but have no target, pick up one of these version-bump issues.

The entry for `net-proxy/mihomo`:

```toml
# .github/workflows/overlay.toml
["net-proxy/mihomo"]
source = "github"
github = "MetaCubeX/mihomo"
use_latest_release = true
prefix = "v"
github_account = ["zakkaus"]
autobump = true
```

- `source`, `github`: where versions come from, and the upstream repository.
- `use_latest_release = true`: for upstreams that publish releases; use `use_latest_tag = true` when upstream only tags.
- `prefix = "v"`: when upstream tags carry a `v` that the ebuild version does not.
- `github_account`: the packager's GitHub login; the nvchecker issue notifies this person.
- `autobump = true`: enables automatic bumps; delete the line to turn them off.

A package whose versions cannot be tracked, such as a live-only package, gets a commented entry `#["category/package"]` with the reason. `acct-*`, `virtual` and `app-alternatives` packages are commented entries too, with no reason needed.

For a package with autobump enabled, autobump handles its nvchecker issue: when the bump only changes the version, it copies the ebuild, regenerates `Manifest` and runs a real `emerge` in a CI container, and opens a pull request only if that passes. The pull request still has to pass `emerge-on-pr` and `pkgcheck`, and a maintainer reviews it before merging. When dependencies, USE flags or patches need changes, autobump records the evidence on the issue and leaves the bump to a person.

- Suitable: `-bin` packages, single-file source packages without vendored dependencies, and Go, Rust or npm packages whose entry names the bundle source with `deps` or `bundle`.
- Not suitable: packages whose dependencies change between versions, packages with patches in `files/`, and packages that need a vendor bundle built for every version without the entry saying who builds it (see “Vendor bundles” below).

The packager decides whether to enable autobump by adding `autobump = true` to their entry in a pull request. The value also sets how many versions remain after a bump: `true` drops only the version it replaces, a number `N` keeps the latest N versions, and `"all"` keeps every version. When unsure, a maintainer can run [autobump-trial](https://github.com/gentoo-zh/overlay/actions/workflows/autobump-trial.yml) first; it reports the result without opening a pull request. Full details: [autobump.md](https://github.com/gentoo-zh/overlay/blob/master/scripts/autobump.md).

**Vendor bundles**

When an ebuild downloads separately packaged dependencies (a Go vendor tree, `node_modules`, crates), the entry names who builds the bundle with either `deps` or `bundle`. autobump opens the PR only after the bundle is published, and dispatches the building workflow while no release exists yet.

`deps`: [gentoo-deps](https://github.com/gentoo-zh/gentoo-deps) builds it, and both the bundle and its release tag are named `{P}`.

```toml
# .github/workflows/overlay.toml
["net-dns/ddns-go"]
source = "github"
github = "jeessy2/ddns-go"
use_latest_release = true
prefix = "v"
github_account = ["zakkaus"]
deps = { lang = "golang", vendordir = "{P}" }
```

- `lang`: `golang`, `javascript`, `javascript(pnpm)`, `rust` or `dart`. With no other setting, `deps = "golang"` is enough.
- `repo` defaults to `github` and is required when the version does not come from GitHub; `tag` defaults to `prefix` plus the version and is required when the entry sets `from_pattern` or `to_pattern`.
- `modules = ["service", "core"]`: one bundle per directory; not allowed with `vendordir` or `workdir`.

`bundle`: for a bundle not named `{P}`, or one a repository builds with its own workflow; `repo` must be under gentoo-zh or gentoo-zh-drafts. For example, `net-proxy/clash-verge-rev`:

```toml
bundle = [
  { id = "crates", repo = "gentoo-zh/gentoo-deps", workflow = "generator.yml", tag = "clash-verge-{PV}", inputs = { LANG = "rust", REPO = "clash-verge-rev/clash-verge-rev", TAG = "v{PV}", P = "clash-verge-{PV}" } },
  { id = "web", repo = "gentoo-zh-drafts/tauri-web-dist", workflow = "generator.yml", tag = "{P}", inputs = { REPO = "clash-verge-rev/clash-verge-rev", TAG = "v{PV}", P = "{P}" } },
]
```

- Required: `id`, `repo`, `workflow`, `tag`. `inputs` go to the workflow; `producers` lists the workflows to wait for, by default just `workflow`.
- Templates: `{PN}`, `{PV}`, `{P}`, `{bundle_pv}`.
- When the bundle spells the version differently from Gentoo, rewrite it with `bundle_pv = [["_rc", "-rc."]]` and use `{bundle_pv}` in the templates; this also works with `deps`.

Creating a repository in gentoo-zh-drafts needs organization access. Without it, leave the bundle to gentoo-deps: `deps` when it is named `{P}`, otherwise `bundle` pointing at its `generator.yml`.

A drafts repository that syncs upstream with [golang-dist-mirror-action](https://github.com/projg2/golang-dist-mirror-action) needs neither key. `gentoo-zh-drafts/mihomo`, for example, syncs every hour, and its releases carry `-vendor.tar.xz` and `-deps.tar.xz`.

### Review and help

Maintainers point out what needs to change in the pull request and help you get there. If a CI report is unclear, ask in the pull request.

For anything about the overlay, GitHub [issues](https://github.com/gentoo-zh/overlay/issues) are preferred; the [forum](https://forum.gentoozh.org/) and the Telegram group [@gentoo_zh](https://t.me/gentoo_zh) work too.
