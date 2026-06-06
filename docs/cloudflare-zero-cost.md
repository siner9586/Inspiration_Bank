# Cloudflare Zero-Cost Deployment Notes

本项目默认不依赖第三方付费 AI API。Cloudflare 可以作为开放平台自动化的一部分使用，但本阶段不要求迁移数据库，也不破坏 Prisma SQLite 本地开发。

## Cloudflare Pages 路线

如果使用 Cloudflare Pages 部署 Next.js，需要先确认当前 Next.js 功能、Prisma 和运行时是否完全兼容目标平台。由于项目当前使用 Prisma SQLite，本阶段更稳妥的推荐是：

- 本地开发继续使用 Prisma SQLite。
- 主应用优先部署到 Vercel 或兼容 Node.js 的平台。
- Cloudflare 用于 Worker Cron，定时触发主应用 `/api/cron/idea-interest`。

## Worker Cron 触发路线

示例文件：

```text
cloudflare/idea-interest-worker.ts
```

Worker 读取环境变量：

- `APP_CRON_URL`：主应用地址，例如 `https://your-app.example.com`。
- `CRON_SECRET`：可选，与主应用 `CRON_SECRET` 一致。

定时调用：

```text
/api/cron/idea-interest?limit=20&provider=zero-cost
```

## KV 未来方案

Cloudflare KV 可用于存放轻量配置：

- 默认 cron provider。
- 平台策略开关。
- 轻量词库版本。
- 用户公开偏好。

本阶段不需要接入 KV。

## D1 未来方案

Cloudflare D1 可以作为未来替代 SQLite 的方向，但需要重新评估 Prisma 适配、迁移策略和部署运行时。

本阶段不迁移到 D1，避免破坏本地开发体验。

## R2 未来方案

Cloudflare R2 可用于存放：

- 导出的灵感 JSON。
- eval 结果归档。
- 内容草稿备份。

本阶段不需要 R2。

## 成本注意事项

- zero-cost provider 当前设计不调用付费 AI API。
- Cloudflare 免费额度和限制会变化，以 Cloudflare 控制台为准。
- 如果将 cron provider 改成外部 API，后台自动运行可能产生费用。
- 成本节省展示都是估算值，不代表真实账单。

## 不依赖第三方 AI API 的部署方式

部署环境只需要：

```env
AI_PROVIDER=zero-cost
AI_MODEL=zero-cost-rule-engine
CRON_AI_PROVIDER=zero-cost
CRON_SECRET=your-secret
```

外部模型 API Key 保持为空即可。
