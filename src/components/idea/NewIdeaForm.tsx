"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Banknote, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createIdeaSchema, type CreateIdeaInput } from "@/lib/ai/schemas";
import { ideaTypeLabels, ideaTypes } from "@/types/idea";

export function NewIdeaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast, Toast } = useToast();
  const form = useForm<CreateIdeaInput>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: {
      title: "",
      rawContent: "",
      type: "other",
      tags: [],
      source: ""
    }
  });

  async function onSubmit(values: CreateIdeaInput) {
    setLoading(true);
    showToast("已保存原始灵感，正在智能分析...", "info");
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) throw new Error(data.error ?? "create failed");
      showToast("智能分析完成");
      router.push(`/ideas/${data.id}`);
      router.refresh();
    } catch {
      showToast("已保存失败或智能分析暂时失败，请稍后重试", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-4xl">
      <Toast />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bank-900 text-gold-100">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">存入灵感</h1>
            <p className="mt-1 text-sm text-slate-500">低摩擦存入，后续由本地规则引擎完成智能拆解。</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="title">标题</FieldLabel>
              <Input id="title" placeholder="例如：AI 论文简报自动生成网站" {...form.register("title")} />
              {form.formState.errors.title ? (
                <div className="text-xs text-red-600">{form.formState.errors.title.message}</div>
              ) : null}
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="type">灵感类型</FieldLabel>
              <Select id="type" {...form.register("type")}>
                {ideaTypes.map((type) => (
                  <option key={type} value={type}>
                    {ideaTypeLabels[type]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="rawContent">灵感原文</FieldLabel>
            <Textarea
              id="rawContent"
              placeholder="直接写下你的想法，不需要整理。系统会自动拆解摘要、价值、风险和下一步。"
              {...form.register("rawContent")}
            />
            {form.formState.errors.rawContent ? (
              <div className="text-xs text-red-600">{form.formState.errors.rawContent.message}</div>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="tags">标签</FieldLabel>
              <Input id="tags" placeholder="AI 产品, 内容, 个人成长" {...form.register("tags")} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="source">来源</FieldLabel>
              <Input id="source" placeholder="散步、读书、会议、聊天..." {...form.register("source")} />
            </div>
          </div>

          <div className="rounded-md border border-bank-100 bg-bank-50 p-4 text-sm leading-6 text-slate-700">
            保存后会先进入分析中状态，再由本地规则引擎生成结构化拆解和启发性估值。默认不需要第三方 AI API Key。
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? "存入并分析中..." : "存入灵感"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
