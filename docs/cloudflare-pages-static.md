# Cloudflare Pages Static Site Option

Cloudflare Pages 当前不建议承载完整 Inspiration Bank App。未来如果要使用 Pages，应拆分为静态官网：

- `marketing site`：只包含静态介绍页、文档、截图、注册入口，可部署到 Cloudflare Pages。
- `app`：包含 API Routes、Prisma、数据库写入、cron API，继续部署到 Netlify/Vercel，或迁移到 OpenNext + Workers。
- 静态官网不得依赖 API Routes。
- 静态官网不得依赖 Prisma SQLite。
- 完整 App 若要 Cloudflare 原生化，需要同步迁移数据库到 D1 / Turso / Supabase / Neon。
