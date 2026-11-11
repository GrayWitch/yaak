import { describe, expect, it } from "vitest";
import {
  getLanguage,
  getResolvedLanguage,
  setLanguage,
  SUPPORTED_LANGUAGES,
  t,
} from "./i18n/index";

describe("i18n module", () => {
  it("defaults to system language", () => {
    setLanguage("system");
    expect(getLanguage()).toBe("system");
    expect(getResolvedLanguage()).toBe("en-US");
  });

  it("translates English when language is en-US", () => {
    setLanguage("en-US");
    expect(getLanguage()).toBe("en-US");
    expect(getResolvedLanguage()).toBe("en-US");
    expect(t("common.ok")).toBe("OK");
    expect(t("common.cancel")).toBe("Cancel");
    expect(t("settings.tabs.general")).toBe("General");
  });

  it("translates Chinese when language is zh-CN", () => {
    setLanguage("zh-CN");
    expect(getLanguage()).toBe("zh-CN");
    expect(getResolvedLanguage()).toBe("zh-CN");
    expect(t("common.ok")).toBe("确定");
    expect(t("common.cancel")).toBe("取消");
    expect(t("settings.tabs.general")).toBe("通用");
    expect(t("settings.tabs.interface")).toBe("界面");
    expect(t("request.tabs.params")).toBe("参数");
    expect(t("request.tabs.headers")).toBe("请求头");
  });

  it("interpolates parameters correctly", () => {
    setLanguage("zh-CN");
    expect(t("dialogs.deleteCount", { count: 5 })).toBe("确定要永久删除这 5 项内容吗？");

    setLanguage("en-US");
    expect(t("dialogs.deleteCount", { count: 5 })).toBe(
      "Are you sure you want to permanently delete 5 items?",
    );
  });

  it("falls back to default fallback text if key is unknown", () => {
    expect(t("unknown.nonexistent.key", "My Fallback")).toBe("My Fallback");
  });

  it("lists supported languages", () => {
    expect(SUPPORTED_LANGUAGES).toEqual([
      { value: "system", label: "跟随系统 (System Default)" },
      { value: "zh-CN", label: "简体中文 (Simplified Chinese)" },
      { value: "en-US", label: "English" },
    ]);
  });
});
