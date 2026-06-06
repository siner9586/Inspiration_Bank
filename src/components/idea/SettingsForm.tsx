"use client";

import type { UserSettings } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FieldLabel, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { userSettingsSchema } from "@/lib/ai/schemas";
import type { UserSettingsInput } from "@/types/analysis";
import { toTagList } from "@/lib/utils/text";

export function SettingsForm({ settings }: { settings: UserSettings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast, Toast } = useToast();
  const form = useForm<UserSettingsInput>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      focusDirections: settings.focusDirections,
      platforms: toTagList(settings.platforms),
      contentStyle: settings.contentStyle,
      resources: settings.resources,
      skills: settings.skills,
      conversionGoal: settings.conversionGoal
    }
  });

  async function onSubmit(values: UserSettingsInput) {
    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) throw new Error("save settings failed");
      showToast("设置已保存");
      router.refresh();
    } catch {
      showToast("设置保存失败", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-4xl">
      <Toast />
      <CardHeader>
        <h1 className="text-xl font-semibold text-ink">用户画像与方向设置</h1>
        <p className="mt-1 text-sm text-slate-500">智能分析会结合这些信息判断个人匹配度、平台建议和转化方向。</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <FieldLabel htmlFor="focusDirections">我最近关注的方向</FieldLabel>
            <Textarea id="focusDirections" {...form.register("focusDirections")} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="platforms">我常用的平台</FieldLabel>
            <Input
              id="platforms"
              placeholder="微信公众号, X, 小红书, 即刻"
              value={form.watch("platforms").join(", ")}
              onChange={(event) =>
                form.setValue(
                  "platforms",
                  event.target.value
                    .split(/[,，\s]+/)
                    .map((item) => item.trim())
                    .filter(Boolean),
                  { shouldDirty: true }
                )
              }
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="contentStyle">我的内容风格</FieldLabel>
            <Textarea id="contentStyle" {...form.register("contentStyle")} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="resources">我的资源条件</FieldLabel>
              <Textarea id="resources" {...form.register("resources")} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="skills">我的技能</FieldLabel>
              <Textarea id="skills" {...form.register("skills")} />
            </div>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="conversionGoal">我希望把灵感转化为什么</FieldLabel>
            <Input id="conversionGoal" placeholder="内容 / 产品 / 商业项目 / 学术研究 / 个人成长" {...form.register("conversionGoal")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? "保存中..." : "保存设置"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
