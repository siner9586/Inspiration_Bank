import type { ProjectDraft } from "@/lib/projects/merge-ideas";
import { parseJsonList } from "@/lib/projects/roadmap";

type StoredProjectLike = {
  name: string;
  positioning: string;
  problem: string;
  solution: string;
  mvpScope: string | string[];
  roadmap: string | string[];
};

export function generateProjectReadme(project: ProjectDraft | StoredProjectLike) {
  const scope = Array.isArray(project.mvpScope) ? project.mvpScope : parseJsonList(project.mvpScope);
  const roadmap = Array.isArray(project.roadmap) ? project.roadmap : parseJsonList(project.roadmap);
  return `# ${project.name}

## 一句话定位
${project.positioning}

## Problem
${project.problem}

## Solution
${project.solution}

## MVP Scope
${scope.map((item) => `- ${item}`).join("\n")}

## 7 天行动计划
${roadmap.map((item) => `- ${item}`).join("\n")}

> 模板生成，可继续人工润色。`;
}
