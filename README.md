# gentoozh.org

[gentoozh.org](https://gentoozh.org/) 的源码，用 Astro 与 Astryx 构建，部署在 Cloudflare Workers。

## 命令

```sh
pnpm install --frozen-lockfile
pnpm dev     # 开发服务器
pnpm build   # 构建 dist/
pnpm check   # 全部检查
```

需要 Node.js 22.12.0 以上与 pnpm 11.15.1。

## 内容

- `content/{zh-cn,zh-tw,en}/`：三语页面与文章
- `src/i18n/`：界面文字

## 每月更新

`update-contributors` 工作流每月 1 日更新贡献者名单，并执行 `pnpm gen:home-images` 重新生成首页头像图片。
