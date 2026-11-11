import { useLicense } from "@yaakapp-internal/license";
import type { Settings } from "@yaakapp-internal/models";
import { patchModel, settingsAtom } from "@yaakapp-internal/models";
import { SettingsInterface as SharedSettingsInterface, VStack } from "@yaakapp-internal/ui";
import { useAtomValue } from "jotai";
import { activeWorkspaceAtom } from "../../hooks/useActiveWorkspace";
import { useSettingsView } from "../../hooks/useSettingsView";
import { showConfirm } from "../../lib/confirm";
import { useTranslation, type Language } from "../../lib/i18n";
import { pricingUrl } from "../../lib/pricingUrl";
import { CargoFeature } from "../CargoFeature";
import { Link } from "../core/Link";
import { SettingRowBoolean, SettingRowSelect, SettingsSection } from "../core/SettingRow";

export function SettingsInterface() {
  const { t, language, setLanguage, languages } = useTranslation();
  const workspace = useAtomValue(activeWorkspaceAtom);
  const settings = useAtomValue(settingsAtom);
  const bound = useSettingsView();

  if (settings == null || workspace == null || bound == null) {
    return null;
  }

  return (
    <SharedSettingsInterface
      view={bound.view}
      callbacks={bound.callbacks}
      leadingSections={
        <>
          <SettingsSection title={t("settings.interface.language", "Language")}>
            <SettingRowSelect
              title={t("settings.interface.interfaceLanguage", "Interface Language")}
              description={t(
                "settings.interface.interfaceLanguageDesc",
                "Choose your preferred display language for Yaak.",
              )}
              name="interfaceLanguage"
              value={language}
              onChange={async (v) => {
                setLanguage(v as Language);
              }}
              options={languages.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
            />
          </SettingsSection>
          <SettingsSection title={t("settings.interface.workspaces", "Workspaces")}>
            <SettingRowSelect
              title={t("settings.interface.openWorkspaceBehavior", "Open workspace behavior")}
              description={t(
                "settings.interface.openWorkspaceBehaviorDesc",
                "Choose what happens when opening another workspace.",
              )}
              name="switchWorkspaceBehavior"
              value={
                settings.openWorkspaceNewWindow === true
                  ? "new"
                  : settings.openWorkspaceNewWindow === false
                    ? "current"
                    : "ask"
              }
              onChange={async (v) => {
                if (v === "current") await patchModel(settings, { openWorkspaceNewWindow: false });
                else if (v === "new") await patchModel(settings, { openWorkspaceNewWindow: true });
                else await patchModel(settings, { openWorkspaceNewWindow: null });
              }}
              options={[
                { label: t("settings.interface.workspaceAsk", "Always ask"), value: "ask" },
                {
                  label: t("settings.interface.workspaceCurrent", "Open in current window"),
                  value: "current",
                },
                { label: t("settings.interface.workspaceNew", "Open in new window"), value: "new" },
              ]}
            />
          </SettingsSection>
        </>
      }
      trailingSections={
        <CargoFeature feature="license">
          <LicenseSettings settings={settings} />
        </CargoFeature>
      }
    />
  );
}

function LicenseSettings({ settings }: { settings: Settings }) {
  const license = useLicense();
  if (license.check.data?.status !== "personal_use") {
    return null;
  }

  return (
    <SettingsSection title="License">
      <SettingRowBoolean
        checked={settings.hideLicenseBadge}
        title="Hide personal use badge"
        description="Hide the personal-use badge from the interface."
        onChange={async (hideLicenseBadge) => {
          if (hideLicenseBadge) {
            const confirmed = await showConfirm({
              id: "hide-license-badge",
              title: "Confirm Personal Use",
              confirmText: "Confirm",
              description: (
                <VStack space={3}>
                  <p>Hey there 👋🏼</p>
                  <p>
                    Yaak is free for personal projects and learning.{" "}
                    <strong>If you’re using Yaak at work, a license is required.</strong>
                  </p>
                  <p>
                    Licenses help keep Yaak independent and sustainable.{" "}
                    <Link href={pricingUrl("app.license.badge-hide-confirm")}>
                      Purchase a License →
                    </Link>
                  </p>
                </VStack>
              ),
              requireTyping: "Personal Use",
              color: "info",
            });
            if (!confirmed) {
              return;
            }
          }
          await patchModel(settings, { hideLicenseBadge });
        }}
      />
    </SettingsSection>
  );
}
