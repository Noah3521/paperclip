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
import { translateRawUiText } from "./raw";

const originalTextContent = new WeakMap<Text, string>();
const translatedAttributes = ["placeholder", "title", "aria-label", "alt"] as const;

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  const tag = parent.tagName;
  return tag === "CODE" || tag === "PRE" || tag === "KBD" || tag === "SCRIPT" || tag === "STYLE";
}

function translateTextNode(node: Text, locale: Locale) {
  if (shouldSkipTextNode(node)) return;
  const current = node.textContent ?? "";
  let source = originalTextContent.get(node);
  if (source === undefined) {
    source = current;
    originalTextContent.set(node, source);
  } else {
    const translatedFromSource = translateRawUiText(source, "ko");
    const reactUpdatedNode = current !== source && current !== translatedFromSource;
    if (reactUpdatedNode) {
      source = current;
      originalTextContent.set(node, source);
    }
  }
  const next = translateRawUiText(source, locale);
  if (current !== next) {
    node.textContent = next;
  }
}

function translateElementAttributes(element: Element, locale: Locale) {
  for (const attr of translatedAttributes) {
    if (element.hasAttribute(attr) === false) continue;
    const cacheAttr = `data-paperclip-i18n-${attr}`;
    const current = element.getAttribute(attr) ?? "";
    let source = element.getAttribute(cacheAttr);
    if (source === null) {
      source = current;
      element.setAttribute(cacheAttr, source);
    } else {
      const translatedFromSource = translateRawUiText(source, "ko");
      const reactUpdatedAttr = current !== source && current !== translatedFromSource;
      if (reactUpdatedAttr) {
        source = current;
        element.setAttribute(cacheAttr, source);
      }
    }
    const next = translateRawUiText(source, locale);
    if (current !== next) {
      element.setAttribute(attr, next);
    }
  }
}

function translateTree(root: Node, locale: Locale) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, locale);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const element = root as Element;
  translateElementAttributes(element, locale);
  for (const child of element.childNodes) {
    translateTree(child, locale);
  }
}

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

  useEffect(() => {
    const body = document.body;
    if (!body) return;

    translateTree(body, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
          translateTextNode(mutation.target as Text, locale);
          continue;
        }
        if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) {
          translateElementAttributes(mutation.target as Element, locale);
          continue;
        }
        for (const node of mutation.addedNodes) {
          translateTree(node, locale);
        }
      }
    });

    observer.observe(body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    });

    return () => observer.disconnect();
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
