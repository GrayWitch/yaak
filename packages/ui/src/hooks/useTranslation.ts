import {
  getLanguage,
  getResolvedLanguage,
  setLanguage,
  subscribeLanguage,
  SUPPORTED_LANGUAGES,
  t,
  type Language,
} from "@yaakapp-internal/lib";
import { useCallback, useSyncExternalStore } from "react";

export function useTranslation() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage, () => "en-US" as Language);
  const resolvedLanguage = getResolvedLanguage();

  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
  }, []);

  return {
    t,
    language,
    resolvedLanguage,
    setLanguage: changeLanguage,
    languages: SUPPORTED_LANGUAGES,
  };
}

export { getLanguage, getResolvedLanguage, setLanguage, subscribeLanguage, SUPPORTED_LANGUAGES, t };
