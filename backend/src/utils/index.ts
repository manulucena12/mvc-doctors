import { Utils } from "../types";

export const utils: Utils = {
  getHours(beggin, end) {
    const firstHour =
      beggin.startsWith("10") ||
      beggin.startsWith("11") ||
      beggin.startsWith("12")
        ? Number(beggin.substring(0, 2))
        : Number(beggin.substring(0, 1));
    const firstTime =
      beggin.startsWith("10") ||
      beggin.startsWith("11") ||
      beggin.startsWith("12")
        ? beggin.substring(3)
        : beggin.substring(2);
    const secondHour =
      end.startsWith("10") || end.startsWith("11") || end.startsWith("12")
        ? Number(end.substring(0, 2))
        : Number(end.substring(0, 1));
    const secondTime =
      end.startsWith("10") || end.startsWith("11") || end.startsWith("12")
        ? end.substring(3)
        : end.substring(2);
    return [firstHour, firstTime, secondHour, secondTime];
  },
};
