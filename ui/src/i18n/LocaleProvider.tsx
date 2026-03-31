import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  resolveInitialLocale,
  translate,
  type Locale,
  type TranslationValues,
} from "./index";
import type { MessageKey } from "./messages/en";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (nextLocale: Locale) => void;
  toggleLocale: () => void;
  t: (key: MessageKey, values?: TranslationValues) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => resolveInitialLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage access failures in restricted environments.
    }
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    startTransition(() => {
      setLocaleState(nextLocale);
    });
  }, []);

  const toggleLocale = useCallback(() => {
    startTransition(() => {
      setLocaleState((current) => (current === "en" ? "ko" : DEFAULT_LOCALE));
    });
  }, []);

  const t = useCallback(
    (key: MessageKey, values?: TranslationValues) => translate(locale, key, values),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
