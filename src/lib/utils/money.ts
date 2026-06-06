export function formatMoney(value: number) {
  return `￥${Math.max(0, Math.round(value)).toLocaleString("zh-CN")}`;
}

export function formatValueRange(value: number) {
  if (value >= 2000) return "￥2000+";
  if (value >= 500) return "￥500-1999";
  if (value >= 100) return "￥100-499";
  return "￥0-99";
}
