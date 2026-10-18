---
title: "Website contribution guide"
description: "Write articles and translations, set up development and submit changes"
---

## Community website contribution guide (articles, translations and docs) {#community-website-contributing-guide-articles--translations--docs}

The site's source is [gentoo-zh/gentoo-zh.github.io](https://github.com/gentoo-zh/gentoo-zh.github.io), built with [Astro](https://astro.build/) and Astryx components. Articles, translations and fixes all go in through pull requests.

### Project structure {#project-structure}

`content/` holds the locale directories; `src/pages/` defines routes, `src/ui/` contains page components, and `src/markdown/` renders article bodies.

### Content organization {#how-content-is-organized}

Posts live in `content/<locale>/posts/`; section pages use `content/<locale>/<section>/_index.md`. Keep related images beside their article.

### Configuration files {#configuration-files}

`astro.config.ts` configures the build, `src/content.config.ts` validates front matter, and `src/i18n/` defines messages and locale routes.

### Theme and assets {#theme-and-assets}

Astryx supplies the components. The theme source is `src/theme/gentoo.ts`; after editing it, run `pnpm theme` to regenerate `src/theme/built/`. Files served at fixed URLs live in `public/`.

<!-- steps -->

### Set up {#setup}

<!-- anchor:setting-up-your-environment -->

You need Node.js 22.12 or later and pnpm 11:

```bash
$ git clone https://github.com/<your-username>/gentoo-zh.github.io.git
$ cd gentoo-zh.github.io
$ pnpm install --frozen-lockfile
$ pnpm dev        # local preview
```

### Write an article {#write}

<!-- anchor:1-submit-a-new-article -->

<!-- anchor:multilingual-support -->

- A new article goes in `content/<locale>/posts/<date>-<name>/index.md`, with its images in the same directory, referenced by relative path.
- Simplified Chinese (`zh-cn`), Traditional Chinese (`zh-tw`) and English (`en`) are each written directly; nothing is converted. A locale without a translation can wait.
- Front matter accepts only `title`, `description`, `date`, `lastmod`, `tags`, `authors` (`name`, `image`, `link`), `aliases`, `featured`, `image`, `cover` and `summary`; a misspelled field fails the build.
- Available shortcodes: `callout` (`type` is `info`, `warning` or `error`) and `details`.

The homepage shows the three latest articles.

### Check and submit {#submit}

```bash
$ pnpm check      # type check, content and UI gates, and one build
```

When everything passes, push to your fork and open a pull request on GitHub. Write commit messages in English as `<scope>: <imperative>`, for example `docs: Fix the binhost URL`.

<!-- /steps -->

<!-- anchor:3-article-attribution-and-avatars -->

### Bylines and avatars

Name the authors under `authors` in the front matter; the byline shows the avatar, name and link, or only the name when `image` is left out:

```yaml
authors:
  - name: Your Name
    image: /contributors/<your-id>/feature.webp
    link: https://github.com/yourname
```

<!-- anchor:4-improving-existing-content--technical-improvements -->

### Improving existing content

Typos, outdated information, usage tips, missing Traditional Chinese or English translations: fixes are all welcome, and so are improvements to templates, styles, performance and features.

The [contributor list](/contributors/) is updated monthly by `scripts/update-contributors.py`. It counts commits across eligible gentoo-zh organization repositories, excluding forks, archived repositories, bots and configured exclusions, and sorts by each person’s total. Do not edit `content/*/contributors/` by hand.

### Submitting a pull request

```bash
$ git checkout -b your-feature-branch
$ git add .
$ git commit -m "Describe your change"
$ git push origin your-feature-branch
# then open a pull request on GitHub
```

<!-- anchor:markdown-formatting -->

<!-- anchor:chinese-typography -->

### Writing conventions

- Put commands, paths and package names in inline code or code blocks, and name the language of each block; `bash`, `ini`, `conf`, `diff`, `yaml`, `toml` and others are highlighted.
- Prefix commands with a prompt: `$ ` for commands a normal user runs (including `sudo`), `# ` for commands run in a root shell; output and file contents get none. The copy button drops the prompt.
- Start headings at `##` and do not skip levels.
- Keep proper nouns in their original form, such as Gentoo and Portage.
- Keep images in the article directory and reference them by relative path.
- In Chinese text, put a space between Chinese and English or digits, and use full-width Chinese punctuation.

### FAQ {#faq}

Questions that come up while maintaining the site.

### Updating the theme {#how-do-i-update-the-theme}

Bump `@astryxdesign/core` and `@astryxdesign/cli` together, run `pnpm exec astryx upgrade --from <old version> --apply`, then `pnpm theme` and `pnpm check`. The full steps are under “Upgrade Astryx” in the repository’s `docs/workflow.en.md`.

### Adding a section page {#how-do-i-add-a-new-section-page}

Add each locale’s `_index.md` under `content/`, then register its route and navigation entry in `src/pages/` and `src/ui/chrome/sections.ts`. The full steps are under “Add a page” in `docs/workflow.en.md`; follow `docs/architecture.en.md` for component slots.

<!-- anchor:2-simplified-to-traditional-conversion -->

### Keeping languages in sync {#what-if-the-simplified-and-traditional-content-gets-out-of-sync}

Write the three languages separately; there is no automatic Simplified–Traditional conversion. When you change one, check the facts and links in the other two.

## Website help

Run into a problem, or have a suggestion?

- **Telegram channel**: [@gentoocn](https://t.me/gentoocn)
- **Telegram group**: [@gentoo_zh](https://t.me/gentoo_zh)
- **GitHub Issues**: <https://github.com/gentoo-zh/gentoo-zh.github.io/issues>
- **Site contact email**: <zakk@gentoozh.org>

For more channels, see [Channels](/channels/).

## License

Content on this site is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) unless stated otherwise. Code contributions follow the project's MIT license.
