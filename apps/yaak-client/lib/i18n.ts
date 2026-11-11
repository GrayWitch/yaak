import {
  getLanguage,
  getResolvedLanguage,
  setLanguage,
  subscribeLanguage,
  SUPPORTED_LANGUAGES,
  t,
  type Language,
  type ResolvedLanguage,
} from "@yaakapp-internal/lib";
import { useTranslation } from "@yaakapp-internal/ui";
import { getKeyValue, setKeyValue } from "./keyValueStore";

const KV_KEY = "interface_language";

let isSyncInitialized = false;

export function initLanguageSync() {
  if (isSyncInitialized) return;
  isSyncInitialized = true;

  // Sync from SQLite key-value store if present
  try {
    const saved = getKeyValue<Language>({
      namespace: "global",
      key: KV_KEY,
      fallback: getLanguage(),
    });
    if (saved && (saved === "system" || saved === "zh-CN" || saved === "en-US")) {
      setLanguage(saved);
    }
  } catch (err) {
    console.warn("Failed reading saved language from key_value store:", err);
  }

  // Persist language changes to SQLite key-value store
  subscribeLanguage(() => {
    const current = getLanguage();
    setKeyValue<Language>({
      namespace: "global",
      key: KV_KEY,
      value: current,
    }).catch((err) => {
      console.warn("Failed saving language to key_value store:", err);
    });
  });
}

export {
  getLanguage,
  getResolvedLanguage,
  setLanguage,
  subscribeLanguage,
  SUPPORTED_LANGUAGES,
  t,
  useTranslation,
  type Language,
  type ResolvedLanguage,
};
