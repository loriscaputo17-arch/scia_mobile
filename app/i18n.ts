import i18n from "i18next";
import { initReactI18next, useTranslation as useTranslationOrg } from "react-i18next";
import { getLocales } from "expo-localization"; // ✅ API corretta per expo-localization v15+

import itCommon from "@/locales/it/common.json";
import enCommon from "@/locales/en/common.json";

const resources = {
  it: { common: itCommon },
  en: { common: enCommon },
};

const deviceLang = getLocales()[0]?.languageCode ?? "it";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4", // ✅ i18next v23+ richiede v4
    fallbackLng: "it",
    lng: deviceLang,
    supportedLngs: ["it", "en", "es"],
    resources,
    ns: ["common", "maintenance", "settings"],
    defaultNS: "common",
    react: {
      useSuspense: false,
    },
  });
}

export const useTranslation = (ns = "common") => useTranslationOrg(ns);

export default i18n;