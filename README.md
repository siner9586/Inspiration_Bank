# Inspiration Bank

Inspiration Bank Zero-Cost Intelligence Edition 是一个零成本可运行的个人思想资产系统。它把灵感录入、智能分析、启发性估值、灵感利息、内容草稿、评测、今日行动、周报、项目种子和资产复盘放在同一个工作台里。

默认模式不调用任何外部付费 AI API。所有智能分析由本地规则引擎、模板库、评分器和 mock/zero-cost provider 完成。

估值仅为启发性估值，不代表真实市场价格。成本节省为估算值，不代表真实账单。

## 第四阶段：灵感转化闭环

新增能力：

- `/actions`：今日行动台，从灵感中挑出 3–5 个 30 分钟内可推进动作。
- `/reports/weekly`：灵感周报，统计本周新增、估值变化、高价值灵感、重复主题和下周行动。
- `/projects`：项目种子，把相关灵感合并为小而可验证的 MVP。
- `/insights`：灵感资产复盘，展示关键词、类型分布、转化率、噪音率和长期沉淀机会。
- 一键导出：Markdown、X thread、微信公众号草稿、小红书笔记、短视频脚本、GitHub README、项目计划书。

## 本地启动

```bash
pnpm install
pnpm run db:push
pnpm run db:seed
pnpm run dev
```

打开：

```text
http://localhost:3000
```

## 环境变量

复制 `.env.example` 后保持默认即可：

```env
AI_PROVIDER=zero-cost
AI_MODEL=zero-cost-rule-engine
AI_FALLBACK_PROVIDER=mock

AI_ANALYZE_PROVIDER=zero-cost
AI_INTEREST_PROVIDER=zero-cost
AI_OUTPUT_PROVIDER=zero-cost

CRON_AI_PROVIDER=zero-cost
CRON_SECRET=

DATABASE_URL="file:./dev.db"
```

默认不需要任何第三方 AI API Key。OpenAI、OpenAI-compatible 和 Ollama provider 仍保留为可选高级模式，不是默认依赖。

## 使用 zero-cost provider

```bash
AI_PROVIDER=zero-cost pnpm run dev
```

任务级路由：

```env
AI_ANALYZE_PROVIDER=zero-cost
AI_INTEREST_PROVIDER=zero-cost
AI_OUTPUT_PROVIDER=zero-cost
CRON_AI_PROVIDER=zero-cost
```

## 智能引擎评测中心

运行：

```bash
pnpm run eval:zero
pnpm run eval:ai
```

然后打开：

```text
/admin/evals
```

页面展示 mock / zero-cost / ollama / 可选外部 provider 对比、Schema 通过率、平均延迟、行动性、标题质量、夸大风险、规则命中、模板命中、词库命中和成本节省估算。

## 如何理解启发性估值

启发性估值只用于排序、复盘、行动优先级判断和沉淀时间观察。它不代表真实市场价格、交易价格或金融建议。

## 如何理解成本节省

成本节省使用内置价格表做估算。zero-cost / mock API 成本为 0；Ollama API 成本为 0，但不包含本地硬件、电费和时间成本。页面上所有成本都标注“估算”。

## 部署建议

当前完整 App 不建议直接部署到 Cloudflare Pages。Cloudflare Pages / `@cloudflare/next-on-pages` 会要求非静态路由使用 Edge Runtime，而本项目包含 API Routes、Prisma、SQLite 文件写入和 Node.js 服务端能力。不要为了绕过错误给所有路由盲目添加 `export const runtime = "edge"`。

推荐架构：

- 主应用：Netlify 或 Vercel。
- 域名 / DNS / CDN / SSL / 安全层：Cloudflare。
- 定时任务：GitHub Actions 或 Cloudflare Worker Cron 调用主应用。
- 默认域名：`https://insp.ccwu.cc`。
- Cloudflare Pages：可用于未来静态官网，不建议跑完整 App。
- Cloudflare Worker：可用于 Cron 触发器。

Netlify 建议：

```text
Framework preset: Next.js
Build command: pnpm run build
Publish directory: .next
Install command: pnpm install
Node version: 22 或 20
```

Cloudflare DNS 建议：

```text
CNAME insp <your-netlify-site>.netlify.app
SSL/TLS mode: Full
```

SQLite 仅适合本地开发和短期演示。生产长期持久化建议迁移到 Supabase / Turso / D1 / Neon。

完整部署说明见：

- `docs/deployment.md`
- `docs/cloudflare-pages-static.md`
- `docs/cloudflare-zero-cost.md`
- `docs/github-actions-cron.md`

## GitHub Actions 定时灵感利息

配置仓库 Secrets：

- `APP_CRON_URL=https://insp.ccwu.cc`
- `CRON_SECRET=<与部署平台环境变量一致>`

默认调用：

```text
GET ${APP_CRON_URL}/api/cron/idea-interest?limit=20&provider=zero-cost
```

如果没有配置 `APP_CRON_URL`，workflow 会输出提示并跳过。

## 手动 dry run

```bash
pnpm run cron:idea-interest:dry
```

HTTP：

```text
GET /api/cron/idea-interest?dryRun=1
GET /api/cron/idea-interest?limit=10
GET /api/cron/idea-interest?provider=zero-cost
```

## 常用命令

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run eval:zero
pnpm run eval:ai
pnpm run cron:idea-interest:dry
```

## 后续路线图

- 增加用户可编辑词库和规则权重。
- 为 zero-cost eval 增加人工标注对比。
- 增加本地 Web Worker / IndexedDB 离线模式。
- 可选接入本地 Ollama 多模型路由。
- 若迁移 Cloudflare 原生部署，使用 OpenNext + Workers，并迁移数据库到 D1 / Turso / Supabase / Neon。
