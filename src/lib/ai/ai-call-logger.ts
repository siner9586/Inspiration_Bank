import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db/client";
import { estimateTokens } from "@/lib/ai/json";
import { estimateAiCost } from "@/lib/ai/cost-estimator";

export type AiTaskType = "analyze" | "interest" | "output" | "revalue";

export type AiCallLogInput = {
  provider: string;
  model: string;
  taskType: AiTaskType;
  ideaId?: string;
  success: boolean;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  engineType?: string;
  apiCost?: number;
  estimatedSavedCost?: number;
  ruleHitCount?: number;
  templateHitCount?: number;
  lexiconHitCount?: number;
  fallbackUsed?: boolean;
  errorMessage?: string;
};

export type AiCallOptions = {
  providerName?: string;
  model?: string;
  taskType?: AiTaskType;
  ideaId?: string;
  inputPayload?: unknown;
  engineType?: string;
};

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

async function appendJsonl(log: AiCallLogInput) {
  const filePath = process.env.AI_LOG_FILE;
  if (!filePath) return;
  const resolved = path.resolve(process.cwd(), filePath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.appendFile(resolved, `${JSON.stringify({ ...log, createdAt: new Date().toISOString() })}\n`);
}

export async function recordAiCallLog(log: AiCallLogInput) {
  console.info("[ai-call]", log);

  await appendJsonl(log).catch((error) => {
    console.error("[ai-call] failed to append JSONL log", getErrorMessage(error));
  });

  if (process.env.AI_LOG_TO_DB === "false") return;

  await prisma.aiCallLog
    .create({
      data: {
        provider: log.provider,
        model: log.model,
        taskType: log.taskType,
        ideaId: log.ideaId,
        success: log.success,
        latencyMs: log.latencyMs,
        inputTokens: log.inputTokens,
        outputTokens: log.outputTokens,
        estimatedCost: log.estimatedCost,
        engineType: log.engineType,
        apiCost: log.apiCost,
        estimatedSavedCost: log.estimatedSavedCost,
        ruleHitCount: log.ruleHitCount,
        templateHitCount: log.templateHitCount,
        lexiconHitCount: log.lexiconHitCount,
        fallbackUsed: log.fallbackUsed,
        errorMessage: log.errorMessage
      }
    })
    .catch((error) => {
      console.error("[ai-call] failed to persist log to database", getErrorMessage(error));
    });
}

export async function withAiCallLog<T>(
  options: Required<Pick<AiCallOptions, "providerName" | "model" | "taskType">> &
    Omit<AiCallOptions, "providerName" | "model" | "taskType">,
  run: () => Promise<{
    result: T;
    outputPayload?: unknown;
    usage?: { inputTokens?: number; outputTokens?: number };
    log?: Partial<
      Pick<
        AiCallLogInput,
        | "engineType"
        | "apiCost"
        | "estimatedSavedCost"
        | "ruleHitCount"
        | "templateHitCount"
        | "lexiconHitCount"
        | "fallbackUsed"
      >
    >;
  }>
) {
  const startedAt = Date.now();
  try {
    const { result, outputPayload, usage, log } = await run();
    const inputTokens = usage?.inputTokens ?? estimateTokens(options.inputPayload);
    const outputTokens = usage?.outputTokens ?? estimateTokens(outputPayload);
    const estimated = estimateAiCost(inputTokens, outputTokens, options.providerName, options.model);
    await recordAiCallLog({
      provider: options.providerName,
      model: options.model,
      taskType: options.taskType,
      ideaId: options.ideaId,
      success: true,
      latencyMs: Date.now() - startedAt,
      inputTokens,
      outputTokens,
      estimatedCost: estimated.known ? estimated.totalCost : undefined,
      engineType: log?.engineType ?? options.engineType,
      apiCost: log?.apiCost ?? (estimated.known ? estimated.totalCost : undefined),
      estimatedSavedCost: log?.estimatedSavedCost,
      ruleHitCount: log?.ruleHitCount,
      templateHitCount: log?.templateHitCount,
      lexiconHitCount: log?.lexiconHitCount,
      fallbackUsed: log?.fallbackUsed
    });
    return result;
  } catch (error) {
    const inputTokens = estimateTokens(options.inputPayload);
    const estimated = estimateAiCost(inputTokens, 0, options.providerName, options.model);
    await recordAiCallLog({
      provider: options.providerName,
      model: options.model,
      taskType: options.taskType,
      ideaId: options.ideaId,
      success: false,
      latencyMs: Date.now() - startedAt,
      inputTokens,
      estimatedCost: estimated.known ? estimated.totalCost : undefined,
      engineType: options.engineType,
      errorMessage: getErrorMessage(error)
    });
    throw error;
  }
}
