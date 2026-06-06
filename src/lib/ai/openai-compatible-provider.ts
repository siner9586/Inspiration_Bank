import OpenAI from "openai";
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
import { mockAiProvider } from "@/lib/ai/mock-provider";
import { parseJsonObject } from "@/lib/ai/json";
import { withAiCallLog, type AiCallOptions } from "@/lib/ai/ai-call-logger";
import type { AiIdeaInput, AiIdeaRecord, AiProvider } from "@/lib/ai/provider";
import type { OutputType } from "@/types/idea";
import { toTagList } from "@/lib/utils/text";

type OpenAiCompatibleConfig = {
  providerName: "openai" | "openai-compatible";
  baseURL?: string;
  apiKey?: string;
  model?: string;
  requireApiKey?: boolean;
};

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

function createClient(config: OpenAiCompatibleConfig) {
  const apiKey =
    config.apiKey ??
    (config.providerName === "openai" ? process.env.OPENAI_API_KEY : process.env.AI_API_KEY) ??
    "";

  if (config.requireApiKey && !apiKey) {
    throw new Error(`${config.providerName} provider requires an API key`);
  }

  return new OpenAI({
    apiKey: apiKey || "not-needed",
    baseURL: config.baseURL ?? (config.providerName === "openai-compatible" ? process.env.AI_BASE_URL : undefined)
  });
}

function resolveModel(config: OpenAiCompatibleConfig, options?: AiCallOptions) {
  return (
    options?.model ??
    config.model ??
    (config.providerName === "openai" ? process.env.OPENAI_MODEL : undefined) ??
    process.env.AI_MODEL ??
    "gpt-4o-mini"
  );
}

async function requestJson(config: OpenAiCompatibleConfig, params: {
  prompt: string;
  payload: unknown;
  options?: AiCallOptions;
}) {
  const model = resolveModel(config, params.options);
  const taskType = params.options?.taskType ?? "analyze";
  const providerName = config.providerName;

  return withAiCallLog(
    {
      providerName,
      model,
      taskType,
      ideaId: params.options?.ideaId,
      inputPayload: params.payload
    },
    async () => {
      const completion = await createClient(config).chat.completions.create({
        model,
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.prompt },
          { role: "user", content: JSON.stringify(params.payload, null, 2) }
        ]
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error(`${providerName} returned empty content`);

      const json = parseJsonObject(content);
      return {
        result: json,
        outputPayload: json,
        usage: {
          inputTokens: completion.usage?.prompt_tokens,
          outputTokens: completion.usage?.completion_tokens
        }
      };
    }
  );
}

export function createOpenAiCompatibleProvider(config: OpenAiCompatibleConfig): AiProvider {
  return {
    async analyzeIdea(input: AiIdeaInput, settings: UserSettings | null, options?: AiCallOptions) {
      try {
        const json = await requestJson(config, {
          prompt: analyzeIdeaPrompt,
          payload: { idea: input, userSettings: settingsPayload(settings) },
          options: { ...options, taskType: "analyze" }
        });
        return analysisResultSchema.parse(json);
      } catch (error) {
        console.error(`[${config.providerName}] analyze failed, falling back to mock provider`, error);
        return mockAiProvider.analyzeIdea(input, settings, options);
      }
    },

    async revalueIdea(idea: AiIdeaRecord, settings: UserSettings | null, options?: AiCallOptions) {
      try {
        const json = await requestJson(config, {
          prompt: revalueIdeaPrompt,
          payload: { idea, userSettings: settingsPayload(settings) },
          options: { ...options, taskType: "revalue", ideaId: options?.ideaId ?? idea.id }
        });
        return analysisResultSchema.parse(json);
      } catch (error) {
        console.error(`[${config.providerName}] revalue failed, falling back to mock provider`, error);
        return mockAiProvider.revalueIdea(idea, settings, options);
      }
    },

    async generateInterest(idea: AiIdeaRecord, settings: UserSettings | null, options?: AiCallOptions) {
      try {
        const json = await requestJson(config, {
          prompt: generateInterestPrompt,
          payload: { idea, userSettings: settingsPayload(settings) },
          options: { ...options, taskType: "interest", ideaId: options?.ideaId ?? idea.id }
        });
        return interestResultSchema.parse(json);
      } catch (error) {
        console.error(`[${config.providerName}] interest failed, falling back to mock provider`, error);
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
        const json = await requestJson(config, {
          prompt: generateOutputPrompt,
          payload: { idea, outputType, userSettings: settingsPayload(settings) },
          options: { ...options, taskType: "output", ideaId: options?.ideaId ?? idea.id }
        });
        return outputResultSchema.parse(json);
      } catch (error) {
        console.error(`[${config.providerName}] output failed, falling back to mock provider`, error);
        return mockAiProvider.generateOutput(idea, outputType, settings, options);
      }
    }
  };
}

export const openaiCompatibleProvider = createOpenAiCompatibleProvider({
  providerName: "openai-compatible",
  baseURL: process.env.AI_BASE_URL,
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL,
  requireApiKey: false
});
