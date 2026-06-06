export type Reminder = {
  level: "info" | "action" | "review";
  message: string;
};

export function getDepositReminder(daysSinceCreated: number): Reminder | null {
  if (daysSinceCreated >= 90) {
    return {
      level: "review",
      message: "已沉淀 90 天，建议重新估值或归档"
    };
  }

  if (daysSinceCreated >= 30) {
    return {
      level: "action",
      message: "已沉淀 30 天，可升级为内容或项目"
    };
  }

  if (daysSinceCreated >= 7) {
    return {
      level: "info",
      message: "已沉淀 7 天，可初步复盘"
    };
  }

  return null;
}
