export const projectStatuses = ["构思中", "验证中", "开发中", "已发布", "已暂停"] as const;

export function parseJsonList(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
