import type { UserSettings } from "@prisma/client";
import {
  analysisResultSchema,
  interestResultSchema,
  outputResultSchema
} from "@/lib/ai/schemas";
import { withAiCallLog, type AiCallOptions } from "@/lib/ai/ai-call-logger";
import { mockAiProvider } from "@/lib/ai/mock-provider";
import type { AiIdeaInput, AiIdeaRecord, AiProvider } from "@/lib/ai/provider";
import { analyzeIdeaZeroCost } from "@/lib/zero-ai/analyze";
import { generateContentDraftZeroCost } from "@/lib/zero-ai/content-generator";
import { generateIdeaInterestZeroCost } from "@/lib/zero-ai/interest-generator";
import type { ZeroAiInput } from "@/lib/zero-ai/types";
import type { OutputType } from "@/types/idea";
import { toTagList } from "@/lib/utils/text";

function toZeroInput(input: AiIdeaInput, settings: UserSettings | null): ZeroAiInput {
  return {
    title: input.title,
    rawContent: input.rawContent,
    type: input.type,
    tags: input.tags ?? [],
    source: input.source,
    createdAt: input.createdAt,
    userSettings: settings
  };
}

function recordToZeroInput(idea: AiIdeaRecord, settings: UserSettings | null): ZeroAiInput {
  return {
    title: idea.title,
    rawContent: idea.rawContent,
    type: idea.type as ZeroAiInput["type"],
    tags: toTagList(idea.tags),
    source: idea.source,
    createdAt: idea.createdAt,
    userSettings: settings
  };
}

function zeroOptions(options: AiCallOptions | undefined, taskType: AiCallOptions["taskType"]) {
  return {
    ...options,
    providerName: "zero-cost",
    model: options?.model ?? process.env.AI_MODEL ?? "zero-cost-rule-engine",
    taskType: taskType ?? "analyze",
    engineType: "zero-cost"
  };
}

function fallbackLog() {
  return {
    engineType: "zero-cost",
    apiCost: 0,
    estimatedSavedCost: 0.003,
    fallbackUsed: true
  };
}

function forcedMilestoneFromOptions(options?: AiCallOptions): "7d" | "30d" | "90d" | undefined {
  const payload = options?.inputPayload;
  if (!payload || typeof payload !== "object") return undefined;
  const milestone = (payload as { milestone?: unknown }).milestone;
  return milestone === "7d" || milestone === "30d" || milestone === "90d" ? milestone : undefined;
}

export const zeroCostProvider: AiProvider = {
  async analyzeIdea(input, settings, options) {
    try {
      const payload = { idea: input, userSettings: settings };
      return await withAiCallLog(zeroOptions({ ...options, inputPayload: options?.inputPayload ?? payload }, "analyze"), async () => {
        const generated = analyzeIdeaZeroCost(toZeroInput(input, settings));
        const parsed = analysisResultSchema.safeParse(generated);
        const result = parsed.success
          ? parsed.data
          : analysisResultSchema.parse({
              ...analyzeIdeaZeroCost(toZeroInput(input, settings)),
              summary: generated.summary || input.title,
              nextMinimalAction: generated.nextMinimalAction || `用 30 分钟写下“${input.title}”的目标用户和验证问题。`
            });
        const zeroAi = generated.zeroAi;
        return {
          result,
          outputPayload: result,
          log: {
            engineType: "zero-cost",
            apiCost: 0,
            estimatedSavedCost: zeroAi.estimatedSavedCost,
            ruleHitCount: zeroAi.ruleHitCount,
            templateHitCount: zeroAi.templateHitCount,
            lexiconHitCount: zeroAi.lexiconHitCount,
            fallbackUsed: !parsed.success
          }
        };
      });
    } catch (error) {
      console.error("[zero-cost] analyze failed, falling back to mock provider", error);
      return mockAiProvider.analyzeIdea(input, settings, options);
    }
  },

  async revalueIdea(idea, settings, options) {
    try {
      const payload = { idea, userSettings: settings };
      return await withAiCallLog(
        zeroOptions({ ...options, inputPayload: options?.inputPayload ?? payload, ideaId: options?.ideaId ?? idea.id }, "revalue"),
        async () => {
          const generated = analyzeIdeaZeroCost(recordToZeroInput(idea, settings));
          const parsed = analysisResultSchema.safeParse(generated);
          const result = parsed.success ? parsed.data : analysisResultSchema.parse(analyzeIdeaZeroCost(recordToZeroInput(idea, settings)));
          const zeroAi = generated.zeroAi;
          return {
            result,
            outputPayload: result,
            log: {
              engineType: "zero-cost",
              apiCost: 0,
              estimatedSavedCost: zeroAi.estimatedSavedCost,
              ruleHitCount: zeroAi.ruleHitCount,
              templateHitCount: zeroAi.templateHitCount,
              lexiconHitCount: zeroAi.lexiconHitCount,
              fallbackUsed: !parsed.success
            }
          };
        }
      );
    } catch (error) {
      console.error("[zero-cost] revalue failed, falling back to mock provider", error);
      return mockAiProvider.revalueIdea(idea, settings, options);
    }
  },

  async generateInterest(idea, settings, options) {
    try {
      const payload = { idea, userSettings: settings };
      return await withAiCallLog(
        zeroOptions({ ...options, inputPayload: options?.inputPayload ?? payload, ideaId: options?.ideaId ?? idea.id }, "interest"),
        async () => {
          const generated = generateIdeaInterestZeroCost(
            recordToZeroInput(idea, settings),
            forcedMilestoneFromOptions(options)
          );
          const parsed = interestResultSchema.safeParse(generated);
          const result = parsed.success
            ? parsed.data
            : interestResultSchema.parse(
                generateIdeaInterestZeroCost(recordToZeroInput(idea, settings), forcedMilestoneFromOptions(options))
              );
          return {
            result,
            outputPayload: result,
            log: {
              engineType: "zero-cost",
              apiCost: 0,
              estimatedSavedCost: 0.003,
              ruleHitCount: result.interests.length,
              templateHitCount: generated.zeroAi.templateHitCount,
              lexiconHitCount: 0,
              fallbackUsed: !parsed.success
            }
          };
        }
      );
    } catch (error) {
      console.error("[zero-cost] interest failed, falling back to mock provider", error);
      const fallback = await mockAiProvider.generateInterest(idea, settings, options);
      return interestResultSchema.parse(fallback);
    }
  },

  async generateOutput(idea, outputType: OutputType, settings, options) {
    try {
      const payload = { idea, outputType, userSettings: settings };
      return await withAiCallLog(
        zeroOptions({ ...options, inputPayload: options?.inputPayload ?? payload, ideaId: options?.ideaId ?? idea.id }, "output"),
        async () => {
          const generated = generateContentDraftZeroCost({
            idea,
            outputType,
            userSettings: settings
          });
          const parsed = outputResultSchema.safeParse(generated);
          const result = parsed.success
            ? parsed.data
            : outputResultSchema.parse({
                outputType,
                title: `${idea.title} - 内容草稿`,
                content: generated.content || `模板生成，可继续手动润色。\n\n${idea.summary || idea.rawContent}`
              });
          return {
            result,
            outputPayload: result,
            log: {
              ...fallbackLog(),
              fallbackUsed: !parsed.success,
              templateHitCount: 1,
              ruleHitCount: 1,
              lexiconHitCount: 0
            }
          };
        }
      );
    } catch (error) {
      console.error("[zero-cost] output failed, falling back to mock provider", error);
      return mockAiProvider.generateOutput(idea, outputType, settings, options);
    }
  }
};
