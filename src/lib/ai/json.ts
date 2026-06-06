import type { z } from "zod";

export function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  return match?.[0] ?? trimmed;
}

export function parseJsonObject(text: string) {
  return JSON.parse(extractJson(text)) as unknown;
}

export function estimateTokens(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return Math.max(1, Math.ceil((text?.length ?? 0) / 4));
}

export function parseWithSchema<T>(schema: z.ZodSchema<T>, raw: unknown) {
  return schema.parse(raw);
}

export function schemaRepairPrompt(rawText: string, schemaDescription: string) {
  return `请修复下面内容，使它成为严格可解析 JSON。不要添加 Markdown，不要解释。必须符合这个结构要求：\n${schemaDescription}\n\n原始内容：\n${rawText}`;
}
