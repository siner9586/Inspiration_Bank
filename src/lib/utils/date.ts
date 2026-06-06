import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatDate(date: Date | string) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "yyyy-MM-dd HH:mm");
}

export function fromNow(date: Date | string) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: zhCN
  });
}
