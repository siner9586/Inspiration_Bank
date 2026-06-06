export function buildDownloadFilename(title: string, ext: "md" | "txt") {
  const safe = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "inspiration";
  return `${safe}.${ext}`;
}
