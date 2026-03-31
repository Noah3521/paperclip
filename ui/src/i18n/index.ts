import { enMessages, type MessageKey } from "./messages/en";
import { koMessages } from "./messages/ko";

export type Locale = "en" | "ko";

export interface TranslationValues {
  [key: string]: string | number | null | undefined;
}

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "paperclip.locale";

const localeMessages: Record<Locale, Record<MessageKey, string>> = {
  en: enMessages,
  ko: koMessages,
};

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  if (normalized === "ko" || normalized.startsWith("ko-")) return "ko";
  return null;
}

export function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    const stored = normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    // Ignore storage access failures in restricted environments.
  }

  const browserLocales = Array.isArray(window.navigator.languages) && window.navigator.languages.length > 0
    ? window.navigator.languages
    : [window.navigator.language];

  for (const locale of browserLocales) {
    const normalized = normalizeLocale(locale);
    if (normalized) return normalized;
  }

  return DEFAULT_LOCALE;
}

export function formatMessage(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(values[key] ?? ""));
}

export function translate(locale: Locale, key: MessageKey, values?: TranslationValues): string {
  const template = localeMessages[locale][key] ?? localeMessages.en[key];
  return formatMessage(template, values);
}
