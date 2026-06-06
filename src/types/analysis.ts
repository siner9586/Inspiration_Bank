import type { z } from "zod";
import type {
  analysisResultSchema,
  interestResultSchema,
  outputResultSchema,
  userSettingsSchema
} from "@/lib/ai/schemas";

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type InterestResult = z.infer<typeof interestResultSchema>;
export type OutputResult = z.infer<typeof outputResultSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
