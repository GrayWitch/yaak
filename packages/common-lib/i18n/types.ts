export type Language = "system" | "zh-CN" | "en-US";
export type ResolvedLanguage = "zh-CN" | "en-US";

export interface LanguageOption {
  value: Language;
  label: string;
}

export type TranslationParams = Record<string, string | number>;

export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};
