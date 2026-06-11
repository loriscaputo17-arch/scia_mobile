import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  ActivityIndicator, Alert, Modal, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import { useLocalSearchParams, router } from "expo-router";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import NoteModal from "@/components/organisms/NoteModal";
import FacilitiesModal from "@/components/organisms/FacilitiesModal";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchElementData = async (code: string, shipId: string) => {
  const res = await api.post("/element/getElement", { element: code, ship_id: shipId });
  return res.data || null;
};
const updateTimeToWork = async (elementId: string, time: number) =>
  api.post("/element/addTimeWork", { id: elementId, time });

// ─── Cache / Pending keys ─────────────────────────────────────────────────────
const ELEMENT_CACHE = (code: string) => `cache_element_${code}`;
const PENDING_HOURS = (id: string)   => `pending_hours_${id}`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "Info",         labelKey: "tab_info" },
  { key: "Manutenzioni", labelKey: "tab_maintenances" },
  { key: "Ricambi",      labelKey: "tab_spares" },
  { key: "Note",         labelKey: "tab_notes" },
  { key: "Componenti",   labelKey: "tab_components" },
];

// ─── Edit Hours Modal ─────────────────────────────────────────────────────────
function EditHoursModal({ visible, onClose, onSave, isOnline }: {
  visible: boolean; onClose: () => void; onSave: (v: number) => void; isOnline: boolean;
}) {
  const { t } = useTranslation("facilities");
  const [input, setInput] = useState("");
  const { isTablet } = useDevice();

  const handleButton = (val: string) => {
    if (val === "clear") return setInput(p => p.slice(0, -1));
    if (val === "." && input.includes(".")) return;
    if (input.length >= 6) return;
    setInput(p => p + val);
  };

  const handleConfirm = () => {
    const n = parseFloat(input);
    if (!isNaN(n)) { onSave(n); setInput(""); onClose(); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center", alignItems: "center" }} onPress={onClose}>
        <Pressable style={{ backgroundColor: "#022a52", width: "85%", borderRadius: 16, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontSize: isTablet ? 24 : 20, fontWeight: "700" }}>
              {t("motorcycles_hours")}
            </Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10,
              marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>
                Offline — salvato localmente, sincronizzato quando online
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center",
            marginBottom: 16, backgroundColor: "#ffffff10", borderRadius: 8, padding: 12 }}>
            <Text style={{ color: "#ffffff60", fontSize: 18, marginRight: 8 }}>h</Text>
            <Text style={{ color: input ? "#fff" : "#ffffff60", fontSize: 28, fontWeight: "700" }}>
              {input || "0.00"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {["1","2","3","4","5","6","7","8","9",".","0","clear"].map((v) => (
              <TouchableOpacity key={v} onPress={() => handleButton(v)}
                style={{ width: "30%", height: 56, backgroundColor: "#ffffff10",
                  borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
                  {v === "clear" ? "⌫" : v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleConfirm}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 16, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {!isOnline && <Ionicons name="cloud-offline-outline" size={14} color="#fff" />}
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{t("confirm")}</Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children, action, onAction }: any) {
  const { isTablet } = useDevice();
  return (
    <View style={{ backgroundColor: "#022a52", borderRadius: 14,
      padding: isTablet ? 20 : 16, marginBottom: isTablet ? 18 : 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: "#789fd6", fontSize: isTablet ? 13 : 12, fontWeight: "700",
          textTransform: "uppercase", letterSpacing: 0.5, flex: 1 }}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={onAction}>
            <Text style={{ color: "#fff", fontSize: 12 }}>{action}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between",
      paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ffffff10" }}>
      <Text style={{ color: "#ffffff80", fontSize: 13 }}>{label}</Text>
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600",
        maxWidth: "60%", textAlign: "right" }}>{value}</Text>
    </View>
  );
}

// Riga di lista generica (manutenzioni / ricambi / componenti)
function ListRow({ title, subtitle, badges, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: "#ffffff10" }}>
      <View style={{ flex: 1 }}>
        {subtitle ? (
          <Text style={{ color: "#ffffff40", fontSize: 11, fontFamily: "monospace", marginBottom: 2 }}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }} numberOfLines={1}>{title}</Text>
        {badges?.length > 0 && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
            {badges.map((b: string, i: number) => (
              <Text key={i} style={{ color: "#ffffff80", fontSize: 12 }}>{b}</Text>
            ))}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#ffffff40" />
    </TouchableOpacity>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ImpiantiDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useSelector((s: RootState) => s.auth?.user) as any;
  const { t } = useTranslation("facilities");
  const shipId = String(user?.teamInfo?.assignedShip?.id || "");
  const { isTablet } = useDevice();

  const [data,         setData]         = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [isOnline,     setIsOnline]     = useState(true);
  const [fromCache,    setFromCache]    = useState(false);
  const [usageHours,   setUsageHours]   = useState<number>(0);
  const [hoursDirty,   setHoursDirty]   = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [noteOpen,     setNoteOpen]     = useState(false);
  const [activeTab,    setActiveTab]    = useState("Info");
  const [descExpanded, setDescExpanded] = useState(false);

  // ── Connettività ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Caricamento ───────────────────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    const key = ELEMENT_CACHE(id);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    if (online) {
      try {
        const res = await fetchElementData(id, shipId);
        setData(res);
        setFromCache(false);
        const pendingKey = res?.element?.id ? PENDING_HOURS(String(res.element.id)) : null;
        const pendingRaw = pendingKey ? await AsyncStorage.getItem(pendingKey).catch(() => null) : null;
        const pendingHours = pendingRaw ? JSON.parse(pendingRaw) : null;
        if (pendingHours !== null) {
          try {
            await updateTimeToWork(String(res.element.id), pendingHours);
            await AsyncStorage.removeItem(pendingKey!);
            setUsageHours(pendingHours);
            setHoursDirty(false);
          } catch { setUsageHours(pendingHours); }
        } else {
          setUsageHours(res?.element?.time_to_work ?? 0);
        }
        await AsyncStorage.setItem(key, JSON.stringify(res));
      } catch {
        await loadFromCache(key);
      }
    } else {
      await loadFromCache(key);
    }
    if (!silent) setLoading(false);
  }, [id, shipId]);

  const loadFromCache = async (key: string) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const cached = JSON.parse(raw);
        setData(cached);
        setFromCache(true);
        const pendingKey = cached?.element?.id ? PENDING_HOURS(String(cached.element.id)) : null;
        const pendingRaw = pendingKey ? await AsyncStorage.getItem(pendingKey).catch(() => null) : null;
        const pendingHours = pendingRaw ? JSON.parse(pendingRaw) : null;
        setUsageHours(pendingHours ?? cached?.element?.time_to_work ?? 0);
        if (pendingHours !== null) setHoursDirty(true);
      } else {
        setData(null);
        setFromCache(true);
      }
    } catch { setData(null); }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (isOnline && fromCache) load(true); }, [isOnline]);

  // ── Salva ore ─────────────────────────────────────────────────────────────
  const handleSaveHours = async (val: number) => {
    setUsageHours(val);
    const key = ELEMENT_CACHE(id!);
    const raw = await AsyncStorage.getItem(key).catch(() => null);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached?.element) {
        cached.element.time_to_work = val;
        await AsyncStorage.setItem(key, JSON.stringify(cached));
      }
    }
    if (isOnline) {
      try {
        await updateTimeToWork(String(data.element.id), val);
        setHoursDirty(false);
        await AsyncStorage.removeItem(PENDING_HOURS(String(data.element.id))).catch(() => {});
      } catch {
        await AsyncStorage.setItem(PENDING_HOURS(String(data.element.id)), JSON.stringify(val));
        setHoursDirty(true);
      }
    } else {
      await AsyncStorage.setItem(PENDING_HOURS(String(data.element.id)), JSON.stringify(val));
      setHoursDirty(true);
    }
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#789fd6" size="large" />
    </SafeAreaView>
  );

  if (!data) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="warning-outline" size={48} color="#ffffff40" />
      <Text style={{ color: "#ffffff60", marginTop: 12 }}>{t("element_not_found")}</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
        <Text style={{ color: "#789fd6" }}>← {t("facilities")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const {
    element, model, organization, manufacturer, supplier, parent,
    notes, maintenances = [], spares = [], children = [], readings = [], jobExecutions = [], scans = [],
  } = data;

  // Conteggi tab
  const counts: Record<string, number> = {
    Manutenzioni: maintenances?.length || 0,
    Ricambi: spares?.length || 0,
    Componenti: children?.length || 0,
  };

  // Stato manutenzioni per ricorrenza (come MaintenanceStatus web)
  const byRecurrency: Record<string, number> = {};
  maintenances?.forEach((m: any) => {
    const name = m.recurrency_type?.name || "Altro";
    byRecurrency[name] = (byRecurrency[name] || 0) + 1;
  });

  // Stato ricambi (come SparePartsStatus web)
  const parseQty = (q: any) => q ? parseFloat(q.toString().replace(",", ".").replace(/[^0-9.-]/g, "")) : 0;
  const inStock = spares.filter((s: any) => parseQty(s.quantity) > 0).length;
  const outOfStock = spares.length - inStock;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>

      {/* Header */}
      <View style={{ paddingHorizontal: isTablet ? 24 : 16, paddingTop: 8, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: "#ffffff10", alignSelf: "center",
        width: "100%", maxWidth: isTablet ? 1100 : "100%" }}>
        <DashboardHeader />

        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 10, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline{hoursDirty ? " · ore in attesa di sync" : " — dati dalla cache"}
            </Text>
          </View>
        )}
        {isOnline && fromCache && !hoursDirty && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginTop: 10, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Aggiornamento...</Text>
          </View>
        )}

        {/* Titolo + parent + downloads + note */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#ffffff60", fontSize: 12, fontFamily: "monospace" }}>
              {model?.ESWBS_code}
            </Text>
            <Text style={{ color: "#fff", fontSize: isTablet ? 24 : 20, fontWeight: "700" }}>
              {element?.name || model?.LCN_name || "—"}
            </Text>
          </View>

          {/* Vai al padre */}
          {parent?.element?.id && (
            <TouchableOpacity onPress={() => router.push(`/(app)/impianti/${parent.element.id}` as any)}
              style={{ backgroundColor: "#ffffff10", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
                flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="arrow-up" size={12} color="#ffffffaa" />
              <Text style={{ color: "#ffffffaa", fontSize: 12 }}>{parent.model?.ESWBS_code}</Text>
            </TouchableOpacity>
          )}

          {model?.ElementModel_installation_drawing_link && (
            <TouchableOpacity
              onPress={() => isOnline
                ? Alert.alert("Download", "Documento disponibile online")
                : Alert.alert("Offline", "Documento disponibile solo online")}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
                flexDirection: "row", alignItems: "center", gap: 6, opacity: !isOnline ? 0.5 : 1 }}>
              <Ionicons name={isOnline ? "download-outline" : "cloud-offline-outline"} size={16} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{t("downloads")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setNoteOpen(true)}
            style={{ backgroundColor: "#ffffff15", borderRadius: 8, padding: 9 }}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const cnt = counts[tab.key];
            return (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)}
                style={{ paddingHorizontal: 14, paddingVertical: 10, marginRight: 4,
                  borderBottomWidth: 2, borderBottomColor: active ? "#789fd6" : "transparent",
                  flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: active ? "#fff" : "#ffffff70", fontSize: 14,
                  fontWeight: active ? "700" : "500" }}>{t(tab.labelKey)}</Text>
                {cnt > 0 && (
                  <View style={{ backgroundColor: "#789fd6", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{cnt}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ padding: isTablet ? 24 : 16, paddingBottom: 48,
          alignSelf: "center", width: "100%", maxWidth: isTablet ? 1100 : "100%" }}>

        {/* ── TAB INFO ── */}
        {activeTab === "Info" && (
          <>
            <Section title={t("system") + " / " + t("component")}>
              <InfoRow label={t("system") + " / " + t("component")} value={model?.LCN_name} />
              <InfoRow label={t("builder")}
                value={organization?.Organization_name
                  || manufacturer?.organizationCompanyNCAGE?.Organization_name || null} />
              <InfoRow label="Fornitore" value={supplier?.Organization_name} />
              <InfoRow label="ESWBS" value={model?.ESWBS_code} />
              <InfoRow label="LCN" value={model?.LCN} />
              <InfoRow label="LCN Type" value={model?.LCNtype_ID} />
              <InfoRow label="Serial Number" value={element?.serial_number} />
              <InfoRow label="Codice riferimento" value={element?.progressive_code} />
              <InfoRow label="Qtà installata"
                value={model?.Installed_Quantity_on_Ship ? String(model.Installed_Quantity_on_Ship) : null} />
              <InfoRow label="Potenza nominale (kW)" value={model?.RatedPower} />
              <InfoRow label="Alimentazione" value={model?.Power_supply} />
              <InfoRow label="Corrente assorbita (A)" value={model?.Absorbed_current} />
              <InfoRow label="Velocità (giri/min)" value={model?.Revolution_speed} />
              <InfoRow label="Pressione operativa (bar)" value={model?.Operating_pressure} />
              <InfoRow label="Peso (kg)" value={model?.Weight} />
              <InfoRow label="Dimensioni (LxWxH)" value={model?.Dimensions_LxWxH} />
              <InfoRow label="Area / Stanza" value={model?.Installation_Room_Name} />
              <InfoRow label="Ponte" value={model?.Deck} />
              <InfoRow label="Testate" value={model?.Frame} />
              {model?.Drawing_number && (
                <InfoRow label="Drawing Number"
                  value={`${model.Drawing_number}${model.Drawing_number_revision_index ? " Rev." + model.Drawing_number_revision_index : ""}`} />
              )}
              <InfoRow label="Drawing Title" value={model?.Drawing_title} />
            </Section>

            {/* Ore motore */}
            <Section title={t("motorcycles_hours")}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: "#fff", fontSize: isTablet ? 34 : 28, fontWeight: "700" }}>
                      {usageHours} <Text style={{ fontSize: 14, color: "#ffffff80" }}>h</Text>
                    </Text>
                    {hoursDirty && (
                      <View style={{ backgroundColor: "#F4721633", borderRadius: 12,
                        paddingHorizontal: 8, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="cloud-upload-outline" size={11} color="#F47216" />
                        <Text style={{ color: "#F47216", fontSize: 10, fontWeight: "700" }}>In attesa</Text>
                      </View>
                    )}
                  </View>
                  {element?.updated_at && (
                    <Text style={{ color: "#ffffff60", fontSize: 12, marginTop: 4 }}>
                      {new Date(element.updated_at).toLocaleString("it-IT")}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setEditOpen(true)}
                  style={{ backgroundColor: "#ffffff15", borderRadius: 8, padding: 10 }}>
                  <Ionicons name="pencil-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </Section>

            {/* Stato manutenzioni */}
            <Section title={t("maintenance_status")}>
              {maintenances.length === 0 ? (
                <Text style={{ color: "#ffffff40", fontSize: 13 }}>Nessuna manutenzione</Text>
              ) : (
                <>
                  <TouchableOpacity onPress={() => router.push("/(app)/maintenance" as any)}
                    style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
                    <Text style={{ color: "#fff", fontSize: 14 }}>Totale manutenzioni</Text>
                    <Text style={{ color: "#789fd6", fontSize: 14, fontWeight: "700" }}>{maintenances.length}</Text>
                  </TouchableOpacity>
                  {Object.entries(byRecurrency).map(([name, count]) => (
                    <View key={name} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                      <Text style={{ color: "#ffffff80", fontSize: 13 }}>{name}</Text>
                      <Text style={{ color: "#ffffff80", fontSize: 13 }}>{count}</Text>
                    </View>
                  ))}
                </>
              )}
            </Section>

            {/* Stato ricambi */}
            <Section title={t("spare_parts_status")}>
              {spares.length === 0 ? (
                <Text style={{ color: "#ffffff40", fontSize: 13 }}>Nessun ricambio</Text>
              ) : (
                <>
                  <TouchableOpacity onPress={() => router.push("/(app)/spare" as any)}
                    style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
                    <Text style={{ color: "#fff", fontSize: 14 }}>Totale ricambi</Text>
                    <Text style={{ color: "#789fd6", fontSize: 14, fontWeight: "700" }}>{spares.length}</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#2DB647" }} />
                      <Text style={{ color: "#ffffff80", fontSize: 13 }}>In giacenza</Text>
                    </View>
                    <Text style={{ color: "#2DB647", fontSize: 13 }}>{inStock}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#D0021B" }} />
                      <Text style={{ color: "#ffffff80", fontSize: 13 }}>Non disponibili</Text>
                    </View>
                    <Text style={{ color: "#D0021B", fontSize: 13 }}>{outOfStock}</Text>
                  </View>
                </>
              )}
            </Section>

            {/* Descrizione */}
            {model?.LCN_name && (
              <Section title={t("description")}>
                <Text style={{ color: "#fff", fontSize: 14, lineHeight: 22 }}
                  numberOfLines={descExpanded ? undefined : 3}>
                  {model.LCN_name.charAt(0).toUpperCase() + model.LCN_name.slice(1).toLowerCase()}
                </Text>
                {!descExpanded && (
                  <TouchableOpacity onPress={() => setDescExpanded(true)}
                    style={{ marginTop: 8, backgroundColor: "#ffffff10", borderRadius: 6,
                      paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start" }}>
                    <Text style={{ color: "#fff", fontSize: 13 }}>{t("details")}</Text>
                  </TouchableOpacity>
                )}
              </Section>
            )}
          </>
        )}

        {/* ── TAB MANUTENZIONI ── */}
        {activeTab === "Manutenzioni" && (
          <Section title={t("tab_maintenances")}>
            {maintenances.length === 0 ? (
              <Text style={{ color: "#ffffff40", fontSize: 13, textAlign: "center", paddingVertical: 16 }}>
                {t("no_linked_maintenance")}
              </Text>
            ) : maintenances.map((m: any) => (
              <ListRow key={m.id}
                title={m.name}
                badges={[
                  m.recurrency_type?.name,
                  m.maintenance_level?.Industry_Level,
                  m.Operational_Not_operational,
                ].filter(Boolean)}
                onPress={() => router.push(`/(app)/maintenance/${m.id}` as any)}
              />
            ))}
          </Section>
        )}

        {/* ── TAB RICAMBI ── */}
        {activeTab === "Ricambi" && (
          <Section title={t("tab_spares")}>
            {spares.length === 0 ? (
              <Text style={{ color: "#ffffff40", fontSize: 13, textAlign: "center", paddingVertical: 16 }}>
                {t("no_linked_spare")}
              </Text>
            ) : spares.map((s: any) => (
              <ListRow key={s.ID}
                title={s.Part_name}
                badges={[
                  s.Serial_number ? `S/N: ${s.Serial_number}` : null,
                  s.quantity != null ? `Qty: ${s.quantity}` : null,
                  s.NSN ? `NSN: ${s.NSN}` : null,
                ].filter(Boolean)}
                onPress={() => router.push(`/(app)/spare/${s.ID}` as any)}
              />
            ))}
          </Section>
        )}

        {/* ── TAB NOTE ── */}
        {activeTab === "Note" && (
          <Section title={t("tab_notes")}>
            {(!notes?.photos?.length && !notes?.text?.length && !notes?.vocal?.length) ? (
              <Text style={{ color: "#ffffff40", fontSize: 13, textAlign: "center", paddingVertical: 16 }}>
                {t("no_notes_available")}
              </Text>
            ) : (
              <>
                {notes?.photos?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: "#789fd6", fontSize: 13, fontWeight: "600", marginBottom: 10 }}>
                      {t("photo_notes")} ({notes.photos.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {notes.photos.map((p: any) => (
                        <Image key={p.id} source={{ uri: p.image_url }}
                          style={{ width: 80, height: 80, borderRadius: 10, marginRight: 10 }} />
                      ))}
                    </ScrollView>
                  </View>
                )}
                {notes?.text?.length > 0 && (
                  <View>
                    <Text style={{ color: "#789fd6", fontSize: 13, fontWeight: "600", marginBottom: 10 }}>
                      {t("text_notes")} ({notes.text.length})
                    </Text>
                    {notes.text.map((n: any) => (
                      <View key={n.id} style={{ backgroundColor: "#00000030", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                        <Text style={{ color: "#ffffff80", fontSize: 11, marginBottom: 4 }}>
                          {n.authorDetails ? `${n.authorDetails.first_name} ${n.authorDetails.last_name}` : ""}
                          {" · "}{new Date(n.created_at).toLocaleString("it-IT")}
                        </Text>
                        <Text style={{ color: "#fff", fontSize: 14 }}>{n.text_field}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </Section>
        )}

        {/* ── TAB COMPONENTI ── */}
        {activeTab === "Componenti" && (
          <Section title={t("tab_components")}>
            {children.length === 0 ? (
              <Text style={{ color: "#ffffff40", fontSize: 13, textAlign: "center", paddingVertical: 16 }}>
                {t("no_child_component")}
              </Text>
            ) : children.map((c: any) => (
              <ListRow key={c.element.id}
                subtitle={c.model?.ESWBS_code}
                title={c.element.name}
                badges={c.element.serial_number ? [`S/N: ${c.element.serial_number}`] : []}
                onPress={() => router.push(`/(app)/impianti/${c.element.id}` as any)}
              />
            ))}
          </Section>
        )}

      </ScrollView>

      <EditHoursModal visible={editOpen} onClose={() => setEditOpen(false)}
        onSave={handleSaveHours} isOnline={isOnline} />
      <NoteModal visible={noteOpen} onClose={() => setNoteOpen(false)}
        entityId={String(element?.id ?? id)} authorId={String(user?.id ?? "")}
        entityType="element" onSuccess={() => isOnline && load(true)} />
    </SafeAreaView>
  );
}