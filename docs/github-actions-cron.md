# GitHub Actions Cron

`.github/workflows/idea-interest.yml` 每天定时调用主应用的灵感利息 cron API，也支持手动 `workflow_dispatch`。

## Secrets

在 GitHub 仓库 Settings -> Secrets and variables -> Actions 中配置：

- `APP_CRON_URL`：部署后的主应用地址。
- `CRON_SECRET`：可选。如果主应用设置了 `CRON_SECRET`，这里必须一致。

不要把密钥写进 workflow 文件。

## 默认调用

```text
GET ${APP_CRON_URL}/api/cron/idea-interest?limit=20&provider=zero-cost
```

cron 默认使用 zero-cost provider，不会调用外部付费 AI API。

## 手动触发

进入 GitHub Actions 页面，选择 `Idea Interest Cron`，点击 `Run workflow`。

## 本地 dry run

```bash
pnpm run cron:idea-interest:dry
```

或在应用运行时访问：

```text
/api/cron/idea-interest?dryRun=1
```

## 常见错误

- `APP_CRON_URL is not configured`：未配置主应用地址，workflow 会跳过调用。
- `401 Unauthorized`：主应用设置了 `CRON_SECRET`，但 Actions secret 缺失或不一致。
- `fetch failed`：主应用未部署、地址错误或部署平台阻止访问。
- `provider` 不是 zero-cost：检查 URL 查询参数和 `CRON_AI_PROVIDER`。
