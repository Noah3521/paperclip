import { useLocale } from "./LocaleProvider";

export function useT() {
  return useLocale().t;
}
