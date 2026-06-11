import i18n from "i18next";
import { initReactI18next, useTranslation as useTranslationOrg } from "react-i18next";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── IT ───────────────────────────────────────────────────────────────────────
import itCommon           from "@/locales/it/common.json";
import itMaintenance      from "@/locales/it/maintenance.json";
import itFailures         from "@/locales/it/failures.json";
import itFacilities       from "@/locales/it/facilities.json";
import itSettings         from "@/locales/it/settings.json";
import itHeader           from "@/locales/it/header.json";
import itCart             from "@/locales/it/cart.json";
import itDashboard        from "@/locales/it/dashboard.json";
import itProfile          from "@/locales/it/profile.json";
import itFilters          from "@/locales/it/filters.json";
import itBreadcrumbs      from "@/locales/it/breadcrumbs.json";
import itTeam             from "@/locales/it/team.json";
import itRemoteAssistance from "@/locales/it/remote_assistance.json";

// ─── EN ───────────────────────────────────────────────────────────────────────
import enCommon           from "@/locales/en/common.json";
import enMaintenance      from "@/locales/en/maintenance.json";
import enFailures         from "@/locales/en/failures.json";
import enFacilities       from "@/locales/en/facilities.json";
import enSettings         from "@/locales/en/settings.json";
import enHeader           from "@/locales/en/header.json";
import enCart             from "@/locales/en/cart.json";
import enDashboard        from "@/locales/en/dashboard.json";
import enProfile          from "@/locales/en/profile.json";
import enFilters          from "@/locales/en/filters.json";
import enBreadcrumbs      from "@/locales/en/breadcrumbs.json";
import enTeam             from "@/locales/en/team.json";
import enRemoteAssistance from "@/locales/en/remote_assistance.json";

// ─── ES ───────────────────────────────────────────────────────────────────────
import esCommon           from "@/locales/es/common.json";
import esMaintenance      from "@/locales/es/maintenance.json";
import esFailures         from "@/locales/es/failures.json";
import esFacilities       from "@/locales/es/facilities.json";
import esSettings         from "@/locales/es/settings.json";
import esHeader           from "@/locales/es/header.json";
import esCart             from "@/locales/es/cart.json";
import esDashboard        from "@/locales/es/dashboard.json";
import esProfile          from "@/locales/es/profile.json";
import esFilters          from "@/locales/es/filters.json";
import esBreadcrumbs      from "@/locales/es/breadcrumbs.json";
import esTeam             from "@/locales/es/team.json";
import esRemoteAssistance from "@/locales/es/remote_assistance.json";

const resources = {
  it: { common: itCommon, maintenance: itMaintenance, failures: itFailures,
        facilities: itFacilities, settings: itSettings, header: itHeader,
        cart: itCart, dashboard: itDashboard, profile: itProfile,
        filters: itFilters, breadcrumbs: itBreadcrumbs, team: itTeam,
        remote_assistance: itRemoteAssistance },
  en: { common: enCommon, maintenance: enMaintenance, failures: enFailures,
        facilities: enFacilities, settings: enSettings, header: enHeader,
        cart: enCart, dashboard: enDashboard, profile: enProfile,
        filters: enFilters, breadcrumbs: enBreadcrumbs, team: enTeam,
        remote_assistance: enRemoteAssistance },
  es: { common: esCommon, maintenance: esMaintenance, failures: esFailures,
        facilities: esFacilities, settings: esSettings, header: esHeader,
        cart: esCart, dashboard: esDashboard, profile: esProfile,
        filters: esFilters, breadcrumbs: esBreadcrumbs, team: esTeam,
        remote_assistance: esRemoteAssistance },
};

const supportedLangs = ["it", "en", "es"];
const deviceLang = getLocales()[0]?.languageCode ?? "it";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    fallbackLng: "it",
    lng: supportedLangs.includes(deviceLang) ? deviceLang : "it",
    supportedLngs: supportedLangs,
    resources,
    ns: ["common", "maintenance", "failures", "facilities", "settings",
         "header", "cart", "dashboard", "profile", "filters",
         "breadcrumbs", "team", "remote_assistance"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  AsyncStorage.getItem("language").then((saved) => {
    if (saved && supportedLangs.includes(saved) && i18n.language !== saved) {
      i18n.changeLanguage(saved);
    }
  });
}

export const useTranslation = (ns = "common") => useTranslationOrg(ns);
export default i18n;