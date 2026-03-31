import { useLocale } from "./LocaleProvider";
import { translateRawUiText } from "./raw";

export function useRawT() {
  const { locale } = useLocale();
  return (value: string) => translateRawUiText(value, locale);
}
