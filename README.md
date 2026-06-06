# Inspiration Bank

Inspiration Bank Zero-Cost Intelligence Edition 是一个零成本可运行的个人思想资产系统。它把灵感录入、智能分析、启发性估值、灵感利息、内容草稿、评测和自动沉淀放在同一个工作台里。

默认模式不调用任何外部付费 AI API。所有智能分析由本地规则引擎、模板库、评分器和 mock/zero-cost provider 完成。

估值仅为启发性估值，不代表真实市场价格。成本节省为估算值，不代表真实账单。

## 什么是 Zero-Cost Intelligence Edition

第三阶段升级后，项目新增：

- `zero-cost` provider：默认智能引擎，不调用外部 API。
- `src/lib/zero-ai`：本地规则评分、标题生成、平台匹配、产品匹配、利息和内容模板。
- `eval:zero`：无需 API Key 的本地规则评测。
- `/admin/evals`：智能引擎评测中心和成本节省控制台。
- `/api/cron/idea-interest`：自动灵感利息 cron API。
- GitHub Actions / Cloudflare Worker Cron 示例。

## 为什么默认不需要第三方 AI API

zero-cost provider 使用本地代码完成：

- 词库命中
- 规则评分
- 用户画像匹配
- 平台策略
- 产品形态匹配
- 模板化标题、利息和内容草稿

OpenAI、OpenAI-compatible 和 Ollama provider 仍然保留，但它们是可选高级模式，不是必需条件。

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

默认首页会显示当前智能引擎为 `zero-cost`、API 成本为 `￥0`、外部模型未启用。

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

OPENAI_API_KEY=
OPENAI_MODEL=

AI_BASE_URL=
AI_API_KEY=

OLLAMA_BASE_URL=http://localhost:11434
DATABASE_URL="file:./dev.db"
```

默认不需要任何第三方 AI API Key。

## 使用 zero-cost provider

zero-cost 是默认 provider，也可以显式设置：

```bash
AI_PROVIDER=zero-cost pnpm run dev
```

任务级路由也支持：

```env
AI_ANALYZE_PROVIDER=zero-cost
AI_INTEREST_PROVIDER=zero-cost
AI_OUTPUT_PROVIDER=zero-cost
```

## 运行 eval:zero

```bash
pnpm run eval:zero
```

它会读取 `evals/idea-samples.json`，输出到 `evals/results/`，不需要 API Key。

当前路由评测：

```bash
pnpm run eval:ai
```

如果未配置外部 API，`eval:ai` 也会使用 zero-cost 或 mock fallback，不应失败。

## 智能引擎评测中心

运行评测后打开：

```text
/admin/evals
```

页面展示：

- mock / zero-cost / ollama / 可选外部 provider 对比。
- Schema 通过率、平均延迟、行动性、标题质量、夸大风险。
- 规则命中、模板命中、词库命中、可解释性。
- 成本节省估算。
- 样本详情和失败样本区。

如果 `evals/results` 为空，页面会提示运行 `pnpm run eval:zero`。

## 如何理解启发性估值

启发性估值只用于：

- 排序
- 复盘
- 判断行动优先级
- 观察沉淀时间带来的变化

它不代表真实市场价格、交易价格或金融建议。

## 如何理解成本节省

成本节省使用内置价格表做估算：

- zero-cost / mock API 成本为 0。
- Ollama API 成本为 0，但不包含本地硬件、电费和时间成本。
- 外部模型价格只用于估算，可能变化。

页面上所有成本都标注“估算值”。

## GitHub Actions 定时灵感利息

workflow 文件：

```text
.github/workflows/idea-interest.yml
```

配置仓库 secrets：

- `APP_CRON_URL`
- `CRON_SECRET`

默认调用：

```text
GET ${APP_CRON_URL}/api/cron/idea-interest?limit=20&provider=zero-cost
```

如果没有配置 `APP_CRON_URL`，workflow 会输出提示并跳过。

## Cloudflare Worker Cron

示例：

```text
cloudflare/idea-interest-worker.ts
```

Worker 环境变量：

- `APP_CRON_URL`
- `CRON_SECRET`

它会定时调用主应用：

```text
/api/cron/idea-interest?limit=20&provider=zero-cost
```

更多说明见 `docs/cloudflare-zero-cost.md`。

## 手动 dry run

命令行：

```bash
pnpm run cron:idea-interest:dry
```

HTTP：

```text
GET /api/cron/idea-interest?dryRun=1
GET /api/cron/idea-interest?limit=10
GET /api/cron/idea-interest?provider=zero-cost
```

如果设置了 `CRON_SECRET`，请求必须带：

```text
Authorization: Bearer ${CRON_SECRET}
```

## 切换到 Ollama 本地模型

Ollama 是本地可选模式，不是必需：

```env
AI_PROVIDER=ollama
AI_MODEL=qwen2.5:7b
OLLAMA_BASE_URL=http://localhost:11434
AI_FALLBACK_PROVIDER=mock
```

cron 仍建议保持：

```env
CRON_AI_PROVIDER=zero-cost
```

## 可选切换到外部 API

外部 API 是可选高级模式，可能产生费用。

OpenAI：

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o-mini
AI_FALLBACK_PROVIDER=mock
```

OpenAI-compatible：

```env
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://your-compatible-endpoint.example/v1
AI_API_KEY=your-key
AI_MODEL=your-model
AI_FALLBACK_PROVIDER=mock
```

不要把 cron 默认切到付费 provider，除非你明确接受后台自动运行可能产生费用。

## 如何避免产生费用

- 保持 `AI_PROVIDER=zero-cost`。
- 保持 `AI_ANALYZE_PROVIDER/AI_INTEREST_PROVIDER/AI_OUTPUT_PROVIDER=zero-cost`。
- 保持 `CRON_AI_PROVIDER=zero-cost`。
- 不填写外部 API Key。
- 在 `/settings` 查看智能引擎设置。
- 在 `/admin/evals` 查看 API 成本估算。

## 文档

- `docs/zero-cost-intelligence.md`
- `docs/github-actions-cron.md`
- `docs/cloudflare-zero-cost.md`
- `docs/ui-design-notes.md`

## 常用命令

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run eval:zero
pnpm run eval:ai
```

## 后续路线图

- 增加用户可编辑词库和规则权重。
- 为 zero-cost eval 增加人工标注对比。
- 增加本地 Web Worker / IndexedDB 离线模式。
- 可选接入本地 Ollama 多模型路由。
- 探索 Cloudflare D1 / R2 作为开放平台扩展，不影响当前 SQLite 本地开发。
