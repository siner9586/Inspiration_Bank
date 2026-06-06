export function truncateText(value: string, max = 120) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function toTagList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value
        .split(/[,，\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function jsonStringArray(value: unknown): string[] {
  return toTagList(value);
}

export function stringifyArray(value: string[]) {
  return JSON.stringify(value.filter(Boolean));
}

export function stringifyObject(value: unknown) {
  return JSON.stringify(value ?? {});
}
