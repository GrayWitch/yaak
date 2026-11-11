import { enUS } from "./locales/en-US";
import { zhCN } from "./locales/zh-CN";
import type {
  Language,
  LanguageOption,
  ResolvedLanguage,
  TranslationDictionary,
  TranslationParams,
} from "./types";

export * from "./types";
export { enUS, zhCN };

export const STORAGE_KEY_LANGUAGE = "yaak_interface_language";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "system", label: "跟随系统 (System Default)" },
  { value: "zh-CN", label: "简体中文 (Simplified Chinese)" },
  { value: "en-US", label: "English" },
];

const LOCALES: Record<ResolvedLanguage, TranslationDictionary> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

let currentLanguage: Language = getInitialLanguage();
const listeners = new Set<() => void>();

function getInitialLanguage(): Language {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_LANGUAGE);
      if (stored === "system" || stored === "zh-CN" || stored === "en-US") {
        return stored;
      }
    } catch {
      // Ignore localStorage access errors
    }
  }
  return "system";
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language): void {
  if (currentLanguage === lang) return;
  currentLanguage = lang;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    } catch {
      // Ignore localStorage access errors
    }
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error in language change listener:", e);
    }
  });
}

export function subscribeLanguage(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getResolvedLanguage(): ResolvedLanguage {
  if (currentLanguage === "system") {
    if (typeof navigator !== "undefined" && navigator.language) {
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith("zh")) {
        return "zh-CN";
      }
    }
    return "en-US";
  }
  return currentLanguage;
}

function getNestedValue(obj: TranslationDictionary, path: string): string | null {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return null;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : null;
}

function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{(\w+)\}|\$\{(\w+)\}/g, (_, k1, k2) => {
    const key = k1 || k2;
    const val = params[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

/**
 * Translate a key into the active language.
 *
 * Usage examples:
 * - t("common.ok") => "确定" / "OK"
 * - t("common.cancel", "Cancel") => with fallback
 * - t("dialogs.deleteCount", { count: 5 }) => with interpolation
 * - t("dialogs.deleteCount", { count: 5 }, "Delete 5 items") => with interpolation and fallback
 */
export function t(
  key: string,
  paramsOrFallback?: string | TranslationParams,
  fallback?: string,
): string {
  const resolvedLang = getResolvedLanguage();
  const dict = LOCALES[resolvedLang] ?? enUS;

  let text = getNestedValue(dict, key);
  if (text == null && resolvedLang !== "en-US") {
    text = getNestedValue(enUS, key);
  }

  let finalFallback = fallback;
  let params: TranslationParams | undefined;

  if (typeof paramsOrFallback === "string") {
    finalFallback = paramsOrFallback;
  } else if (paramsOrFallback != null && typeof paramsOrFallback === "object") {
    params = paramsOrFallback;
  }

  const result = text ?? finalFallback ?? key.split(".").pop() ?? key;

  if (params && typeof result === "string") {
    return interpolate(result, params);
  }

  return result;
}
