import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingsData {
  is_notifications_enabled_maintenance?: boolean;
  maintenance_frequency?: string;
  is_notifications_enabled_checklist?: boolean;
  checklist_frequency?: string;
  is_upcoming_maintenance_enabled?: boolean;
  is_upcoming_checklist_enabled?: boolean;
  is_upcoming_spare_enabled?: boolean;
  is_planning_maintenance_enabled?: boolean;
  planning_maintenance_frequency?: string;
  is_planning_checklist_enabled?: boolean;
  planning_checklist_frequency?: string;
  is_planning_spare_enabled?: boolean;
  planning_spare_frequency?: string;
  license?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
const getSettings = async (userId: string) =>
  (await api.get(`/settings/getSettings/${userId}`)).data;

const updateSettingsApi = async (payload: any) =>
  (await api.post("/settings/updateSettings", payload)).data;

const cacheKey = (uid: any) => `cached_settings_${uid}`;
const pendingKey = (uid: any) => `pending_settings_${uid}`;

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({
  title,
  desc,
  value,
  onChange,
}: {
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>{title}</Text>
        <Text style={{ color: "#ffffff99", fontSize: 13, marginTop: 2 }}>{desc}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#6b7280", true: "#4cd964" }}
        thumbColor="#fff"
      />
    </View>
  );
}

// ─── Frequency Picker ─────────────────────────────────────────────────────────
function FrequencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation("settings");

  const options = [
    { label: t("daily"), value: "giornaliero" },
    { label: t("weekly"), value: "settimanale" },
    { label: t("monthly"), value: "mensile" },
    { label: t("annual"), value: "annuale" },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
        marginBottom: 16,
      }}
    >
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: value === opt.value ? "#789fd6" : "#ffffff15",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13 }}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        color: "#ffffff80",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 16,
        marginTop: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {title}
    </Text>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const user = useSelector((state: RootState) => state.auth?.user);
  const { t, i18n } = useTranslation("settings");

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const [notifMaintenance, setNotifMaintenance] = useState(false);
  const [maintenanceFreq, setMaintenanceFreq] = useState("settimanale");
  const [notifChecklist, setNotifChecklist] = useState(false);
  const [checklistFreq, setChecklistFreq] = useState("settimanale");
  const [upcomingMaintenance, setUpcomingMaintenance] = useState(false);
  const [upcomingChecklist, setUpcomingChecklist] = useState(false);
  const [upcomingSpare, setUpcomingSpare] = useState(false);
  const [planningMaintenance, setPlanningMaintenance] = useState(false);
  const [planningMaintenanceFreq, setPlanningMaintenanceFreq] = useState("settimanale");
  const [planningChecklist, setPlanningChecklist] = useState(false);
  const [planningChecklistFreq, setPlanningChecklistFreq] = useState("settimanale");
  const [planningSpare, setPlanningSpare] = useState(false);
  const [planningSpareFreq, setPlanningSpareFreq] = useState("settimanale");
  const [license, setLicense] = useState("");
  const [language, setLanguage] = useState(i18n.language || "it");

  // ── Monitor connettività ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  const applySettings = (d: SettingsData) => {
    setNotifMaintenance(d.is_notifications_enabled_maintenance ?? false);
    setMaintenanceFreq(d.maintenance_frequency || "settimanale");
    setNotifChecklist(d.is_notifications_enabled_checklist ?? false);
    setChecklistFreq(d.checklist_frequency || "settimanale");
    setUpcomingMaintenance(d.is_upcoming_maintenance_enabled ?? false);
    setUpcomingChecklist(d.is_upcoming_checklist_enabled ?? false);
    setUpcomingSpare(d.is_upcoming_spare_enabled ?? false);
    setPlanningMaintenance(d.is_planning_maintenance_enabled ?? false);
    setPlanningMaintenanceFreq(d.planning_maintenance_frequency || "settimanale");
    setPlanningChecklist(d.is_planning_checklist_enabled ?? false);
    setPlanningChecklistFreq(d.planning_checklist_frequency || "settimanale");
    setPlanningSpare(d.is_planning_spare_enabled ?? false);
    setPlanningSpareFreq(d.planning_spare_frequency || "settimanale");
    setLicense(d.license || "");
  };

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);

      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      if (online) {
        try {
          const data = await getSettings(String(user.id));
          if (data) {
            applySettings(data);
            await AsyncStorage.setItem(cacheKey(user.id), JSON.stringify(data));
          }
        } catch {
          await loadFromCache();
        }
      } else {
        await loadFromCache();
      }

      const pending = await AsyncStorage.getItem(pendingKey(user.id));
      if (pending) setIsDirty(true);

      setLoading(false);
    };

    const loadFromCache = async () => {
      try {
        const raw = await AsyncStorage.getItem(cacheKey(user!.id));
        if (raw) applySettings(JSON.parse(raw));
      } catch {}
    };

    load();
  }, [user]);

  const buildCacheSnapshot = (): SettingsData => ({
    is_notifications_enabled_maintenance: notifMaintenance,
    maintenance_frequency: maintenanceFreq,
    is_notifications_enabled_checklist: notifChecklist,
    checklist_frequency: checklistFreq,
    is_upcoming_maintenance_enabled: upcomingMaintenance,
    is_upcoming_checklist_enabled: upcomingChecklist,
    is_upcoming_spare_enabled: upcomingSpare,
    is_planning_maintenance_enabled: planningMaintenance,
    planning_maintenance_frequency: planningMaintenanceFreq,
    is_planning_checklist_enabled: planningChecklist,
    planning_checklist_frequency: planningChecklistFreq,
    is_planning_spare_enabled: planningSpare,
    planning_spare_frequency: planningSpareFreq,
    license,
  });

  const buildApiPayload = () => ({
    user_id: user!.id,
    isNotificationsEnabledMaintenance: notifMaintenance,
    maintenanceFrequency: maintenanceFreq,
    isNotificationsEnabledChecklist: notifChecklist,
    checklistFrequency: checklistFreq,
    license,
    isUpcomingMaintenanceEnabled: upcomingMaintenance,
    isUpcomingChecklistEnabled: upcomingChecklist,
    isUpcomingSpareEnabled: upcomingSpare,
    isPlanningMaintenanceEnabled: planningMaintenance,
    planningMaintenanceFrequency: planningMaintenanceFreq,
    isPlanningChecklistEnabled: planningChecklist,
    planningChecklistFrequency: planningChecklistFreq,
    isPlanningSpareEnabled: planningSpare,
    planningSpareFrequency: planningSpareFreq,
  });

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      const snapshot = buildCacheSnapshot();
      const payload = buildApiPayload();

      await AsyncStorage.setItem(cacheKey(user.id), JSON.stringify(snapshot));

      if (online) {
        await updateSettingsApi(payload);
        await AsyncStorage.removeItem(pendingKey(user.id));
        setIsDirty(false);
        Alert.alert(t("save_success_title"), t("save_success_desc"));
      } else {
        await AsyncStorage.setItem(pendingKey(user.id), JSON.stringify(payload));
        setIsDirty(true);
        Alert.alert(t("save_offline_title"), t("save_offline_desc"));
      }

      await AsyncStorage.setItem("language", language);
      i18n.changeLanguage(language);
    } catch {
      Alert.alert(t("save_error_title"), t("save_error_desc"));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isOnline || !user?.id) return;

    const syncPending = async () => {
      try {
        const raw = await AsyncStorage.getItem(pendingKey(user.id));
        if (!raw) return;

        await updateSettingsApi(JSON.parse(raw));

        await AsyncStorage.removeItem(pendingKey(user.id));

        setIsDirty(false);
      } catch {}
    };

    syncPending();
  }, [isOnline, user]);

  if (loading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#001c38",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#789fd6" size="large" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View
        style={{
          flex: 1,
          padding: isTablet ? 24 : 16,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 900 : "100%",
        }}
      >
        <DashboardHeader />

        {!isOnline && (
          <View
            style={{
              backgroundColor: "#F47216",
              borderRadius: 8,
              padding: 10,
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="cloud-offline-outline" size={16} color="#fff" />

            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              {t("offline_mode")} — {t("changes_saved_locally")}
            </Text>
          </View>
        )}

        {isOnline && isDirty && (
          <View
            style={{
              backgroundColor: "#2DB647",
              borderRadius: 8,
              padding: 10,
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="cloud-upload-outline" size={16} color="#fff" />

            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              {t("syncing_pending_changes")}
            </Text>
          </View>
        )}

        <ScrollView style={{ marginTop: 12 }} showsVerticalScrollIndicator={false}>

          {/* Notifiche scadenza */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title={t("notifications")} />
            <ToggleRow title={t("maintenance_title")} desc={t("maintenance_desc")} value={notifMaintenance} onChange={setNotifMaintenance} />
            {notifMaintenance && <FrequencyPicker value={maintenanceFreq} onChange={setMaintenanceFreq} />}
            <ToggleRow title={t("checklist_title")} desc={t("checklist_desc")} value={notifChecklist} onChange={setNotifChecklist} />
            {notifChecklist && <FrequencyPicker value={checklistFreq} onChange={setChecklistFreq} />}
          </View>

          {/* Notifiche imminenti */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title={t("upcoming_notifications_title")} />
            <ToggleRow title={t("upcoming_maintenance_title")} desc={t("upcoming_maintenance_desc")} value={upcomingMaintenance} onChange={setUpcomingMaintenance} />
            <ToggleRow title={t("upcoming_checklist_title")} desc={t("upcoming_checklist_desc")} value={upcomingChecklist} onChange={setUpcomingChecklist} />
            <ToggleRow title={t("upcoming_spare_title")} desc={t("upcoming_spare_desc")} value={upcomingSpare} onChange={setUpcomingSpare} />
          </View>

          {/* Notifiche pianificazione */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title={t("planning_notifications_title")} />
            <ToggleRow title={t("planning_maintenance_title")} desc={t("planning_maintenance_desc")} value={planningMaintenance} onChange={setPlanningMaintenance} />
            {planningMaintenance && <FrequencyPicker value={planningMaintenanceFreq} onChange={setPlanningMaintenanceFreq} />}
            <ToggleRow title={t("planning_checklist_title")} desc={t("planning_checklist_desc")} value={planningChecklist} onChange={setPlanningChecklist} />
            {planningChecklist && <FrequencyPicker value={planningChecklistFreq} onChange={setPlanningChecklistFreq} />}
            <ToggleRow title={t("planning_spare_title")} desc={t("planning_spare_desc")} value={planningSpare} onChange={setPlanningSpare} />
            {planningSpare && <FrequencyPicker value={planningSpareFreq} onChange={setPlanningSpareFreq} />}
          </View>

          {/* Supporto */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title={t("support")} />
            <TouchableOpacity onPress={() => router.push("/(app)/remoteAssistance" as any)}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 16 }}>{t("support_title")}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>{t("support_desc")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Licenza */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title={t("licenses")} />
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>{t("license_label")}</Text>
            <TextInput value={license} onChangeText={setLicense}
              placeholder={t("license_label")} placeholderTextColor="#6b7280"
              style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }} />
          </View>

          {/* Lingua */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title={t("language")} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { label: "🇮🇹 Italiano", value: "it" },
                { label: "🇬🇧 English", value: "en" },
                { label: "🇪🇸 Español", value: "es" },
              ].map((lang) => (
                <TouchableOpacity key={lang.value} onPress={() => setLanguage(lang.value)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center",
                    backgroundColor: language === lang.value ? "#789fd6" : "#ffffff15" }}>
                  <Text style={{ color: "#fff", fontSize: 13 }}>{lang.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Salva */}
          <TouchableOpacity onPress={handleSave} disabled={saving}
            style={{ backgroundColor: "#789fd6", borderRadius: 10, padding: 16,
              alignItems: "center", marginBottom: 32 }}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {!isOnline && <Ionicons name="cloud-offline-outline" size={18} color="#fff" />}
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                    {isOnline ? t("save_button") : t("save_offline_button")}
                  </Text>
                </View>
            }
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}