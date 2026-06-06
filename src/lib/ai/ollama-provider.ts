import type { z } from "zod";
import type { UserSettings } from "@prisma/client";
import {
  analysisResultSchema,
  interestResultSchema,
  outputResultSchema
} from "@/lib/ai/schemas";
import {
  analyzeIdeaPrompt,
  generateInterestPrompt,
  generateOutputPrompt,
  revalueIdeaPrompt
} from "@/lib/ai/prompts";
import { schemaRepairPrompt, parseJsonObject } from "@/lib/ai/json";
import { withAiCallLog, type AiCallOptions } from "@/lib/ai/ai-call-logger";
import { mockAiProvider } from "@/lib/ai/mock-provider";
import type { AiIdeaInput, AiIdeaRecord, AiProvider } from "@/lib/ai/provider";
import type { AnalysisResult, InterestResult, OutputResult } from "@/types/analysis";
import type { OutputType } from "@/types/idea";
import { toTagList } from "@/lib/utils/text";

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
  prompt_eval_count?: number;
  eval_count?: number;
  error?: string;
};

const schemaDescriptions = {
  analysis:
    "AnalysisResult: summary:string; feasibilityLevel:低|中|高; commercialValue/contentValue/viralityScore/productizationScore/personalFitScore:0-100 integer; viralityLevel:低|中|中高|高; productizationLevel/shortVideoFit/longTermFit/riskLevel/priority; spreadableTitles 至少 5 个对象; productSuggestions/recommendedPlatforms/requiredResources/targetUsers/monetizationMethods/risks 数组; nextMinimalAction:string; valueExplanation:string.",
  interest:
    "InterestResult: { interests: 3 到 5 个对象，每个对象包含 interestType:string, content:string, suggestedAction:string }",
  output:
    "OutputResult: { outputType, title:string, content:string }，outputType 必须是请求中的类型。"
};

function baseUrl() {
  return (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
}

function resolveModel(options?: AiCallOptions) {
  return options?.model ?? process.env.AI_MODEL ?? "qwen2.5:7b";
}

function settingsPayload(settings: UserSettings | null) {
  if (!settings) return null;
  return {
    focusDirections: settings.focusDirections,
    platforms: toTagList(settings.platforms),
    contentStyle: settings.contentStyle,
    resources: settings.resources,
    skills: settings.skills,
    conversionGoal: settings.conversionGoal
  };
}

async function chat(model: string, system: string, user: string) {
  const response = await fetch(`${baseUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      options: {
        temperature: 0.2
      },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${await response.text()}`);
  }

  const json = (await response.json()) as OllamaChatResponse;
  if (json.error) throw new Error(`Ollama error: ${json.error}`);
  const content = json.message?.content;
  if (!content) throw new Error("Ollama returned empty content");
  return {
    content,
    usage: {
      inputTokens: json.prompt_eval_count,
      outputTokens: json.eval_count
    }
  };
}

async function parseOrRepair<T>(
  model: string,
  rawContent: string,
  schema: z.ZodSchema<T>,
  schemaDescription: string
) {
  try {
    const first = schema.safeParse(parseJsonObject(rawContent));
    if (first.success) return first.data;
  } catch {
    // Continue to repair with the same local model.
  }

  const repair = await chat(
    model,
    "你是 JSON 修复器，只能输出严格 JSON。",
    schemaRepairPrompt(rawContent, schemaDescription)
  );
  const second = schema.safeParse(parseJsonObject(repair.content));
  if (second.success) return second.data;

  throw new Error(`Ollama JSON repair failed: ${second.error.message}`);
}

async function requestStructured<T>(params: {
  prompt: string;
  payload: unknown;
  schema: z.ZodSchema<T>;
  schemaDescription: string;
  options?: AiCallOptions;
}) {
  const model = resolveModel(params.options);
  const taskType = params.options?.taskType ?? "analyze";

  return withAiCallLog(
    {
      providerName: "ollama",
      model,
      taskType,
      ideaId: params.options?.ideaId,
      inputPayload: params.payload
    },
    async () => {
      const response = await chat(model, params.prompt, JSON.stringify(params.payload, null, 2));
      const result = await parseOrRepair(model, response.content, params.schema, params.schemaDescription);
      return {
        result,
        outputPayload: result,
        usage: response.usage
      };
    }
  );
}

export const ollamaProvider: AiProvider = {
  async analyzeIdea(input: AiIdeaInput, settings: UserSettings | null, options?: AiCallOptions) {
    try {
      return (await requestStructured({
        prompt: analyzeIdeaPrompt,
        payload: { idea: input, userSettings: settingsPayload(settings) },
        schema: analysisResultSchema,
        schemaDescription: schemaDescriptions.analysis,
        options: { ...options, taskType: "analyze" }
      })) as AnalysisResult;
    } catch (error) {
      console.error("[ollama] analyze failed, falling back to mock provider", error);
      return mockAiProvider.analyzeIdea(input, settings, options);
    }
  },

  async revalueIdea(idea: AiIdeaRecord, settings: UserSettings | null, options?: AiCallOptions) {
    try {
      return (await requestStructured({
        prompt: revalueIdeaPrompt,
        payload: { idea, userSettings: settingsPayload(settings) },
        schema: analysisResultSchema,
        schemaDescription: schemaDescriptions.analysis,
        options: { ...options, taskType: "revalue", ideaId: options?.ideaId ?? idea.id }
      })) as AnalysisResult;
    } catch (error) {
      console.error("[ollama] revalue failed, falling back to mock provider", error);
      return mockAiProvider.revalueIdea(idea, settings, options);
    }
  },

  async generateInterest(idea: AiIdeaRecord, settings: UserSettings | null, options?: AiCallOptions) {
    try {
      return (await requestStructured({
        prompt: generateInterestPrompt,
        payload: { idea, userSettings: settingsPayload(settings) },
        schema: interestResultSchema,
        schemaDescription: schemaDescriptions.interest,
        options: { ...options, taskType: "interest", ideaId: options?.ideaId ?? idea.id }
      })) as InterestResult;
    } catch (error) {
      console.error("[ollama] interest failed, falling back to mock provider", error);
      return mockAiProvider.generateInterest(idea, settings, options);
    }
  },

  async generateOutput(
    idea: AiIdeaRecord,
    outputType: OutputType,
    settings: UserSettings | null,
    options?: AiCallOptions
  ) {
    try {
      return (await requestStructured({
        prompt: generateOutputPrompt,
        payload: { idea, outputType, userSettings: settingsPayload(settings) },
        schema: outputResultSchema,
        schemaDescription: schemaDescriptions.output,
        options: { ...options, taskType: "output", ideaId: options?.ideaId ?? idea.id }
      })) as OutputResult;
    } catch (error) {
      console.error("[ollama] output failed, falling back to mock provider", error);
      return mockAiProvider.generateOutput(idea, outputType, settings, options);
    }
  }
};
