# Intelligence Evals

本地评测用于比较 mock、zero-cost、本地 Ollama 和可选外部 provider 对“灵感分析”的稳定性、延迟、结构化质量和成本估算。

## 运行 zero-cost 评测

```bash
pnpm run eval:zero
```

`eval:zero` 会强制使用 `AI_PROVIDER=zero-cost`，不需要任何第三方 AI API Key。结果保存到：

```text
evals/results/
```

## 运行当前 AI 路由评测

```bash
pnpm run eval:ai
```

如果没有配置外部 API Key，当前默认路由会使用 zero-cost；也可以显式比较：

```bash
AI_PROVIDER=mock pnpm run eval:ai
AI_PROVIDER=zero-cost pnpm run eval:ai
AI_PROVIDER=ollama OLLAMA_BASE_URL=http://localhost:11434 AI_MODEL=qwen2.5:7b pnpm run eval:ai
```

`openai` 和 `openai-compatible` 只是可选高级模式，运行前请确认可能产生 API 费用。

## 核心指标

- `schemaValid`：输出是否通过 Zod schema。
- `avgLatencyMs`：平均耗时。
- `avgActionabilityScore`：下一步行动是否具体、可在 30 分钟内启动。
- `avgTitleQualityScore`：标题数量、长度和可发布性。
- `avgOverhypeRiskScore`：夸大风险，越低越克制。
- `avgCommercialValue` / `avgContentValue` / `avgCurrentValue`：规则评分和启发性估值。
- `zeroCostSaving`：以外部模型为基线的估算节省，不代表真实账单。
- `ruleHitCount` / `templateHitCount` / `lexiconHitCount`：zero-cost 可解释性指标。
- `fallbackUsed`：是否经过本地 repair 或 fallback。
- `explainabilityScore`：输出解释性粗略评分。

## 控制台

运行评测后打开：

```text
/admin/evals
```

如果 `evals/results` 为空，页面会提示运行 `pnpm run eval:zero`。
