# Deployment Guide：Netlify/Vercel + Cloudflare DNS

## 当前推荐部署架构

- 主应用：Netlify 或 Vercel，运行完整 Next.js 15 全栈应用。
- 域名 / DNS / CDN / SSL / 安全层：Cloudflare。
- 定时任务：GitHub Actions 或 Cloudflare Worker Cron 只负责调用主应用 API。
- 数据库：SQLite 仅适合本地开发。生产长期持久化建议迁移到 Supabase / Turso / Cloudflare D1 / Neon。
- 当前正式域名：`https://insp.ccwu.cc`。

## 为什么不把完整 App 直接部署到 Cloudflare Pages

Cloudflare Pages 上的 `@cloudflare/next-on-pages` 会要求非静态路由使用 Edge Runtime。当前项目包含：

- Next.js 15 App Router 动态页面。
- API Routes。
- Prisma。
- SQLite 文件写入。
- 本地 zero-cost provider 和 cron API。

这些能力并不适合直接塞进 Pages Edge Runtime。不要为了绕过构建错误给所有页面和 API 添加：

```ts
export const runtime = "edge";
```

这样会让 Prisma、SQLite、Node.js API、文件写入等能力在运行时出现更隐蔽的问题。`next-on-pages` 也不是当前推荐的 Cloudflare 完整 Next.js 路线；后续更适合使用 OpenNext + Cloudflare Workers。

## Netlify 部署设置

- Framework preset: `Next.js`
- Build command: `pnpm run build`
- Publish directory: `.next`
- Install command: `pnpm install`
- Node version: `22` 或 `20`

环境变量：

```env
AI_PROVIDER=zero-cost
AI_MODEL=zero-cost-rule-engine
AI_FALLBACK_PROVIDER=mock

AI_ANALYZE_PROVIDER=zero-cost
AI_INTEREST_PROVIDER=zero-cost
AI_OUTPUT_PROVIDER=zero-cost

CRON_AI_PROVIDER=zero-cost
CRON_SECRET=your-secret

DATABASE_URL=file:./dev.db
```

注意：SQLite 在 Serverless 生产环境不适合作为长期持久化数据库。它可以用于演示和短期试运行，但正式生产应迁移到 Supabase、Turso、D1 或 Neon。

## Vercel 部署设置

- Framework preset: `Next.js`
- Build command: `pnpm run build`
- Output directory: 默认
- Install command: `pnpm install`
- Node version: `22` 或 `20`

## Cloudflare DNS 设置

如果 Cloudflare 托管 `ccwu.cc` 整个 zone，在 Cloudflare 添加：

```text
Type: CNAME
Name: insp
Target: <your-netlify-site>.netlify.app
TTL: Auto
Proxy status: 初次验证建议 DNS only；Netlify SSL 验证通过后再考虑 Proxied
```

SSL/TLS：

- SSL/TLS mode: `Full`
- Always Use HTTPS: `On`
- Automatic HTTPS Rewrites: `On`

## DNSHE 域名委派说明

DNSHE 管理地址：

```text
https://my.dnshe.com/index.php?m=domain_hub
```

可选方案：

1. 如果 DNSHE 支持将 `insp.ccwu.cc` 子域委派到 Cloudflare，则在 DNSHE 的“DNS服务器（域名委派）”中为 `insp.ccwu.cc` 填入 Cloudflare 给出的 nameservers。然后在 Cloudflare 的 `insp.ccwu.cc` zone 中添加 `CNAME @ -> <Netlify 默认域名>`。
2. 如果 Cloudflare 只允许添加根域 `ccwu.cc`，需要把 `ccwu.cc` 整个域名 nameserver 委派到 Cloudflare，再在 Cloudflare 中添加 `insp` 的 CNAME。执行前必须确认不会影响其他现有站点、邮箱和解析。
3. 如果无法委派到 Cloudflare，可在 DNSHE 直接添加 CNAME：
   - 主机记录：`insp`
   - 类型：`CNAME`
   - 值：`<Netlify 默认域名>`
4. 最终目标是让 `https://insp.ccwu.cc` 访问 Netlify 部署的 App。

不要删除已有 DNS 记录；只新增或修改与 `insp.ccwu.cc` 相关的记录。

## GitHub Actions Cron

仓库 Secrets：

```text
APP_CRON_URL=https://insp.ccwu.cc
CRON_SECRET=<与 Netlify 环境变量一致>
```

workflow 应调用：

```text
${{ secrets.APP_CRON_URL }}/api/cron/idea-interest?limit=20&provider=zero-cost
```

## Cloudflare Worker Cron

Worker 只负责调用主应用：

```text
https://insp.ccwu.cc/api/cron/idea-interest?limit=20&provider=zero-cost
```

Worker 环境变量：

```text
APP_CRON_URL=https://insp.ccwu.cc
CRON_SECRET=<与主应用一致>
```

## 未来 Cloudflare 原生部署路线

后续若要迁移到 Cloudflare 原生架构，建议单独开阶段完成：

1. 使用 `@opennextjs/cloudflare`。
2. 使用 Wrangler 构建与部署 Workers。
3. 数据库迁移到 D1 / Turso / Supabase / Neon。
4. 移除 SQLite 文件写入依赖。
5. 系统测试 Workers Runtime 兼容性。
6. 将 marketing 静态官网和完整 App 拆开：静态官网可走 Cloudflare Pages，完整 App 走 Workers 或 Netlify/Vercel。
