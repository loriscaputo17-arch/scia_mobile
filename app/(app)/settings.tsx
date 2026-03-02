import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Switch, TextInput,
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

// ─── API ──────────────────────────────────────────────────────────────────────
const getSettings = async (userId: string) => {
  const res = await api.get(`/settings/getSettings/${userId}`);
  return res.data;
};

const updateSettings = async (payload: any) => {
  const res = await api.post("/settings/updateSettings", payload);
  return res.data;
};

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({
  title, desc, value, onChange,
}: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
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
function FrequencyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { label: "Giornaliero", value: "giornaliero" },
    { label: "Settimanale", value: "settimanale" },
    { label: "Mensile", value: "mensile" },
    { label: "Annuale", value: "annuale" },
  ];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 16 }}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
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
    <Text style={{ color: "#ffffff80", fontSize: 13, fontWeight: "600", marginBottom: 16, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>
      {title}
    </Text>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const user = useSelector((state: RootState) => state.auth?.user);
  const { i18n } = useTranslation("settings");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (!user?.id) return;
    getSettings(String(user.id))
      .then((data) => {
        if (!data) return;
        setNotifMaintenance(data.is_notifications_enabled_maintenance ?? false);
        setMaintenanceFreq(data.maintenance_frequency || "settimanale");
        setNotifChecklist(data.is_notifications_enabled_checklist ?? false);
        setChecklistFreq(data.checklist_frequency || "settimanale");
        setUpcomingMaintenance(data.is_upcoming_maintenance_enabled ?? false);
        setUpcomingChecklist(data.is_upcoming_checklist_enabled ?? false);
        setUpcomingSpare(data.is_upcoming_spare_enabled ?? false);
        setPlanningMaintenance(data.is_planning_maintenance_enabled ?? false);
        setPlanningMaintenanceFreq(data.planning_maintenance_frequency || "settimanale");
        setPlanningChecklist(data.is_planning_checklist_enabled ?? false);
        setPlanningChecklistFreq(data.planning_checklist_frequency || "settimanale");
        setPlanningSpare(data.is_planning_spare_enabled ?? false);
        setPlanningSpareFreq(data.planning_spare_frequency || "settimanale");
        setLicense(data.license || "");
      })
      .catch(() => Alert.alert("Errore", "Impossibile caricare le impostazioni"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateSettings({
        user_id: user.id,
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

      // Salva lingua
      await AsyncStorage.setItem("language", language);
      i18n.changeLanguage(language);

      Alert.alert("Successo", "Impostazioni salvate");
    } catch {
      Alert.alert("Errore", "Impossibile salvare le impostazioni");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Notifiche" />
            <ToggleRow
              title="Manutenzioni"
              desc="Ricevi notifiche per le manutenzioni in scadenza"
              value={notifMaintenance}
              onChange={setNotifMaintenance}
            />
            {notifMaintenance && <FrequencyPicker value={maintenanceFreq} onChange={setMaintenanceFreq} />}

            <ToggleRow
              title="Checklist"
              desc="Ricevi notifiche per le checklist in scadenza"
              value={notifChecklist}
              onChange={setNotifChecklist}
            />
            {notifChecklist && <FrequencyPicker value={checklistFreq} onChange={setChecklistFreq} />}
          </View>

          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Notifiche upcoming" />
            <ToggleRow title="Manutenzioni imminenti" desc="Avviso per ogni manutenzione in scadenza" value={upcomingMaintenance} onChange={setUpcomingMaintenance} />
            <ToggleRow title="Checklist imminenti" desc="Avviso per ogni checklist in scadenza" value={upcomingChecklist} onChange={setUpcomingChecklist} />
            <ToggleRow title="Ricambi da ordinare" desc="Avviso per ricambi sotto soglia" value={upcomingSpare} onChange={setUpcomingSpare} />
          </View>

          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Planning manutentivo" />

            <ToggleRow title="Manutenzioni" desc="Riepilogo periodico delle manutenzioni" value={planningMaintenance} onChange={setPlanningMaintenance} />
            {planningMaintenance && <FrequencyPicker value={planningMaintenanceFreq} onChange={setPlanningMaintenanceFreq} />}

            <ToggleRow title="Checklist" desc="Riepilogo periodico delle checklist" value={planningChecklist} onChange={setPlanningChecklist} />
            {planningChecklist && <FrequencyPicker value={planningChecklistFreq} onChange={setPlanningChecklistFreq} />}

            <ToggleRow title="Ricambi" desc="Riepilogo periodico dei ricambi" value={planningSpare} onChange={setPlanningSpare} />
            {planningSpare && <FrequencyPicker value={planningSpareFreq} onChange={setPlanningSpareFreq} />}
          </View>

          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Supporto" />
            <TouchableOpacity
              onPress={() => router.push("/(app)/remoteAssistance" as any)}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 16 }}>Assistenza remota</Text>
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>Contatta il supporto tecnico</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Licenza" />
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>Codice licenza</Text>
            <TextInput
              value={license}
              onChangeText={setLicense}
              placeholder="Inserisci il codice licenza"
              placeholderTextColor="#6b7280"
              style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }}
            />
          </View>

          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Lingua" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[{ label: "🇮🇹 Italiano", value: "it" }, { label: "🇬🇧 English", value: "en" }, { label: "🇪🇸 Español", value: "es" }].map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  onPress={() => setLanguage(lang.value)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center",
                    backgroundColor: language === lang.value ? "#789fd6" : "#ffffff15",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 13 }}>{lang.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{ backgroundColor: "#789fd6", borderRadius: 10, padding: 16, alignItems: "center", marginBottom: 32 }}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Salva impostazioni</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}