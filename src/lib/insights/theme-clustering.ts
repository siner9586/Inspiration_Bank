import { toTagList } from "@/lib/utils/text";

export function extractThemes(items: { title: string; summary: string; tags: string }[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    for (const tag of toTagList(item.tags)) map.set(tag, (map.get(tag) ?? 0) + 3);
    for (const word of `${item.title} ${item.summary}`.split(/[\s,，。；：、/|]+/).filter((value) => value.length >= 2 && value.length <= 12)) {
      map.set(word, (map.get(word) ?? 0) + 1);
    }
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
}
