---
title: "What we have done recently, and what is still open"
description: "What the community has built over the past few months across the website, chat platforms, the overlay and its distribution, documentation and translation — and the contribution paths that are still missing."
date: 2026-08-26
featured: true
tags: ["community", "overlay", "wiki"]
authors:
  - name: Zakk
    image: /contributors/zakkaus/feature.webp
    link: https://github.com/zakkaus
---

{{< callout type="info" >}}
This English version has only been lightly proofread, so it may still contain mistakes. Corrections are welcome — see [Feedback](#feedback) at the end.
{{< /callout >}}

I have been talking with qingfeng, Clover and Gentoo developers. Broadly, the main problems are the process for finding and fixing problems, and the difficulty of communication.

Gentoo-zh, which qingfeng founded years ago, and the vision on the front page of the [Gentoo Taiwan site](https://paar.kh.edu.tw/gentoo/) were both about the same thing — building a community and giving its work back to the Gentoo Linux project. Neither of them lasted.

## The past few months

### Website and chat platforms

- Reworked the site theme, which had gone more than ten years without an update ([migration post](/posts/2026-05-29-migrate-to-hextra/))
- Moved [gentoo.org.cn](https://gentoo.org.cn) to [gentoozh.org](https://gentoozh.org/) ([domain migration](/posts/2026-07-01-domain-migration/))
- Set up a bridge between the three main chat platforms — Matrix, IRC and Telegram ([where to find us](/about/))
- Brought the community forum back up ([launch post](/posts/2026-07-12-forum-launch/))
- Deployed a Pastebin for storing and sharing plain text, which makes it easier to review and correct long output ([how to use it](/paste/))

### Overlay and distribution

- Something that had been pending for over ten years: moved the [gentoo-zh overlay](https://github.com/gentoo-zh/overlay) out of a personal account and into the organisation ([repository migration](/posts/2026-07-02-gentoo-zh-repo-migration/))
- Cleaned up the packages in the overlay ([cleanup post](/posts/2026-07-29-overlay-package-cleanup/))
- Redeployed distfiles and stood up a new binhost at <https://distfiles.gentoozh.org/> ([launch post](/posts/2026-07-29-binhost-launch/))
- Redeployed the desktop image of GigOS, Mame's KDE Plasma 6 live system with Chinese configuration and networking tools included ([download page](/download/))
- The [minimal installation image](/iso/#minimal) follows the official one, with the kernel replaced by a build carrying the cjktty patch, so the console can display CJK text ([kernel tree](https://github.com/gentoo-zh/linux-cjktty))
- Picked up maintenance of the [cjktty patches](https://github.com/gentoo-zh/cjktty-patches) after six years without an update
- Added three packages built on the official kernel with the cjktty patch applied: `sys-kernel/gentoo-cjk-sources`, `gentoo-cjk-kernel` and `gentoo-cjk-kernel-bin`
- The `-bin` packages are built and distributed by the community ([distfiles.gentoozh.org](https://distfiles.gentoozh.org/)); the same machine also gives overlay developers a personal area on a [public file server](https://distfiles.gentoozh.org/files/)
- Got back in touch with the university mirrors in mainland China and repaired their mirroring of the gentoo-zh overlay's Git repository and of the [distfiles.gentoozh.org](https://distfiles.gentoozh.org/) download site. There are now three mirrors — [Nanjing University](https://mirror.nju.edu.cn/gentoo-zh), [Nanyang Institute of Technology](https://mirror.nyist.edu.cn/gentoo-zh) and the [Henan Education and Research Network](https://mirrors.ha.edu.cn/gentoo-zh) — plus the [MirrorZ](https://mirrors.cernet.edu.cn/gentoo-zh) redirect service

### Documentation and translation

- Organised community members to work on translations for the [official Gentoo Wiki](https://wiki.gentoo.org/) ([translation guide](/posts/2026-06-30-gentoo-wiki-translation/))
- Filled out the gentoo-zh instructions on [MirrorZ Help](https://help.mirrors.cernet.edu.cn/): [gentoo-zh](https://help.mirrors.cernet.edu.cn/gentoo-zh/) and [gentoo-zh.git](https://help.mirrors.cernet.edu.cn/gentoo-zh.git)
- Rewrote the MirrorZ Help pages for the official Gentoo repositories: [gentoo](https://help.mirrors.cernet.edu.cn/gentoo/) and [gentoo-portage.git](https://help.mirrors.cernet.edu.cn/gentoo-portage.git). These may propagate to other universities, such as [Tsinghua University](https://mirrors.tuna.tsinghua.edu.cn/help/gentoo/) and [Nanjing University](https://help.mirror.nju.edu.cn/gentoo/?mirror=NJU)

This is close to the best shape our infrastructure has ever been in. The contribution process and the channels for contributing are another matter, and there is still a lot in the way.

All of this moved fairly fast, so I may slow down a little from here on, to leave more room for other people to take part; and unless there is a real need, I will not be standing up many more new services.

For example, a [discussion](https://wiki.gentoo.org/wiki/Help_talk:Translating#About_Chinese_Localization) about Chinese localisation opened eleven years ago only got [an answer and an update](https://wiki.gentoo.org/wiki/Help_talk:Translating#Chinese_Localization_Today) today, and it came with a number of small problems along the way. I will add those to the [translation guide](/posts/2026-06-30-gentoo-wiki-translation/) later.

## What the process is missing

Communication across languages, efficiency, tool usability and guidance on the process itself all have large gaps.

For example:

**I found a mistake in a wiki translation, or in the content itself**

Discuss it in Chinese → find the right person if you lack the permission → compare against the English → fix the English or the translation

**I want to translate**

Read the translation process → apply for a translator account → discuss the translation → finish it

**I want to contribute**

Work out where I can contribute → find the right place and the right person → review and publish

**I want to contribute a package**

Test locally → review in the [overlay](https://github.com/gentoo-zh/overlay) → keep it clean and stable after it ships → decide to push it to the main tree → open a [Bugzilla](https://bugs.gentoo.org/) bug → [proxy-maint](https://wiki.gentoo.org/wiki/Project:Proxy_Maintainers) (where communication is hard, and where it is uncertain whether anyone will pick it up and discuss it)

A note: a [CONTRIBUTING.md](https://github.com/gentoo-zh/overlay/issues/12212) for the overlay is being planned.

**I ran into a problem**

Where do I ask → what should I attach → is the process quick and easy enough to follow

None of these paths has proper guidance.

## Next

1. Write the missing process guides
2. Organise translation work and maintain the wiki
3. Sort out permissions
4. Deploy mail for gentoozh.org (done; see [Developer mailboxes and forum mail](/posts/2026-10-17-gentoozh-mail/))

## Finally

It is good to see the [Telegram group](https://t.me/gentoo_zh) pass 900 members, which it had not managed to do for several years.

Keeping the community going, bringing in new people, getting more of them involved, and lowering the barriers to communication all matter just as much. I hope the [Gentoo Wiki](https://wiki.gentoo.org/) and the [gentoozh.org](https://gentoozh.org/) site, both of which have stood still for the past ten years, and the [overlay](https://github.com/gentoo-zh/overlay) that has only just been moved out of a personal account, can all get going again.

There is plenty in the Chinese (Simplified) part of the [Gentoo Wiki](https://wiki.gentoo.org/) that needs updating and filling in; for Traditional Chinese there is almost nothing at all.

Please do not run OpenCC or a similar tool over the text and submit the output. Anything contributed to Gentoo has to follow the relevant policies.

## Feedback

Corrections and suggestions are welcome on the chat platforms (Matrix / IRC / Telegram, see [where to find us](/about/)) or on the [forum](https://forum.gentoozh.org/); email to <zakk@gentoozh.org> works too.
