import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, Pressable,
  TextInput, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { router } from "expo-router";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineAction } from "@/hooks/useOfflineAction";
import { useDevice } from "@/hooks/useDevice";
import FacilitiesModal from "@/components/organisms/FacilitiesModal";

// ─── API ──────────────────────────────────────────────────────────────────────
const getFailures = async (shipId: string, userId: string) => {
  const params = new URLSearchParams({ ship_id: shipId, userId }).toString();
  const res = await api.get(`/failures/getFailures?${params}`);
  return Array.isArray(res.data.failures) ? res.data.failures : [];
};

const FAILURES_CACHE = (shipId: string) => `cache_failures_${shipId}`;

// ─── Helpers colore gravità ───────────────────────────────────────────────────
const gravityColor = (g?: string) => {
  switch (g?.toLowerCase()) {
    case "critica": return "#D0021B";
    case "alta":    return "#F47216";
    case "media":   return "#FFBF25";
    case "bassa":   return "#2DB647";
    default:        return "#6b7280";
  }
};
const gravityBg = (g?: string) => {
  switch (g?.toLowerCase()) {
    case "critica": return "#D0021B22";
    case "alta":    return "#F4721622";
    case "media":   return "#FFBF2522";
    case "bassa":   return "#2DB64722";
    default:        return "#6b728022";
  }
};

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, filters, onApply }: {
  visible: boolean; onClose: () => void; filters: any; onApply: (f: any) => void;
}) {
  const { t } = useTranslation("failures");
  const [local, setLocal] = useState(filters);
  useEffect(() => setLocal(filters), [filters]);

  const toggle = (category: string, key: string) =>
    setLocal((prev: any) => ({ ...prev, [category]: { ...prev[category], [key]: !prev[category][key] } }));

  const gravities = [
    { key: "critica", label: t("gravities.critica"), color: "#D0021B" },
    { key: "alta",    label: t("gravities.alta"),    color: "#F47216" },
    { key: "media",   label: t("gravities.media"),   color: "#FFBF25" },
    { key: "bassa",   label: t("gravities.bassa"),   color: "#2DB647" },
  ];
  const teams = [
    { key: "connected_user", label: t("user_types.connected_user") },
    { key: "crew",           label: t("user_types.crew") },
    { key: "maintenance",    label: t("user_types.maintenance") },
    { key: "command",        label: t("user_types.command") },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 300,
          paddingTop: 80, backgroundColor: "#022a52", padding: 24 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>{t("filters")}</Text>

          <Text style={{ color: "#789fd6", marginBottom: 12 }}>{t("severity")}</Text>
          {gravities.map((g) => (
            <TouchableOpacity key={g.key} onPress={() => toggle("gravita", g.key)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: g.color, marginRight: 10 }} />
              <Text style={{ color: "#fff", flex: 1 }}>{g.label}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.gravita[g.key] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.gravita[g.key] ? "#789fd6" : "transparent" }} />
            </TouchableOpacity>
          ))}

          <Text style={{ color: "#789fd6", marginBottom: 12, marginTop: 16 }}>{t("failure_modal1")}</Text>
          {teams.map((team) => (
            <TouchableOpacity key={team.key} onPress={() => toggle("squadra", team.key)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#fff", flex: 1 }}>{team.label}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.squadra[team.key] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.squadra[team.key] ? "#789fd6" : "transparent" }} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => { onApply(local); onClose(); }}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 24 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("apply_filters")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Add Failure Modal ────────────────────────────────────────────────────────
// Sostituisce la AddFailureModal esistente nella pagina failures.
// Allineata al web FailureModal: aggiunge selezione impianto/componente
// (element_id / eswbs_code / component_name) e campi custom.
function AddFailureModal({ visible, onClose, onAddOptimistic, onSaved, user, isOnline }: {
  visible: boolean; onClose: () => void;
  onAddOptimistic: (item: any) => void;
  onSaved?: () => void;
  user: any; isOnline: boolean;
}) {
  const { t } = useTranslation("failures");
  const { execute } = useOfflineAction();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
  const [gravity,     setGravity]     = useState("");
  const [loading,     setLoading]     = useState(false);

  // Impianto / componente selezionato (dal FacilitiesModal)
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [facilitiesOpen,    setFacilitiesOpen]    = useState(false);

  // Campi custom (nome/valore), come il web
  const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>([
    { name: "", value: "" },
  ]);

  const gravities = ["critica", "alta", "media", "bassa"];

  const updateCustomField = (index: number, field: "name" | "value", value: string) => {
    setCustomFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const addCustomField    = () => setCustomFields((prev) => [...prev, { name: "", value: "" }]);
  const removeCustomField = (index: number) =>
    setCustomFields((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle(""); setDescription(""); setGravity("");
    setSelectedComponent(null);
    setCustomFields([{ name: "", value: "" }]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert(t("error"), t("titolo")); return; }
    setLoading(true);
    const cleanCustomFields = customFields.filter((f) => f.name.trim() || f.value.trim());
    const payload = {
      title,
      description,
      date,
      gravity,
      executionUserType: "connected_user",
      userExecution: user?.id,
      ship_id: user?.teamInfo?.assignedShip?.id || 1,
      element_id:     selectedComponent?.id ?? null,
      eswbs_code:     selectedComponent?.eswbs_code ?? null,
      component_name: selectedComponent?.name ?? null,
      customFields:   cleanCustomFields,
    };

    const optimisticItem = {
      id: `temp_${Date.now()}`,
      title, description, date, gravity,
      executionUserType: "connected_user",
      userExecutionData: {
        first_name: user?.firstName,
        last_name:  user?.lastName,
      },
      component_name: selectedComponent?.name ?? null,
      img: false, audio: false, note: false,
      _pending: true,
    };
    let ok = false;
try {
  if (isOnline) {
    // Online: chiamata diretta (funziona, dà 201). Niente coda.
    await api.post("/failures/addFailure", payload);
    onAddOptimistic(optimisticItem);
  } else {
    // Offline: metti in coda per la sync successiva
    await execute({
      type: "ADD_FAILURE",
      payload,
      optimistic: () => onAddOptimistic(optimisticItem),
    });
  }
  ok = true;
} catch (err: any) {
  console.log("[ADD_FAILURE] errore:", err?.response?.status, err?.response?.data);
  Alert.alert("Errore", err?.response?.data?.message || "Impossibile salvare l'avaria");
} finally {
  setLoading(false);
}

if (ok) {
  resetForm();
  onClose();
  if (isOnline) {
    onSaved?.();
  } else {
    Alert.alert(
      t("confirm") || "Salvato",
      t("failure_saved_offline") || "Avaria salvata offline, sarà sincronizzata quando online."
    );
  }
}
  };

  const componentLabel = selectedComponent
    ? `${selectedComponent.eswbs_code ?? ""} — ${selectedComponent.name ?? ""}`.trim()
    : t("choose");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24, maxHeight: "90%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("add_failure")}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10,
              marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>
                Offline — l'avaria sarà sincronizzata quando online
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Titolo */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("titolo")} *</Text>
            <TextInput value={title} onChangeText={setTitle}
              placeholder={t("write_here")} placeholderTextColor="#6b7280"
              style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 14 }} />

            {/* Impianto / Componente */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>
              {t("system")}/{t("component")}
            </Text>
            <TouchableOpacity onPress={() => setFacilitiesOpen(true)}
              style={{ backgroundColor: "#ffffff15", borderRadius: 8, padding: 12, marginBottom: 14,
                flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: selectedComponent ? "#fff" : "#6b7280", flex: 1 }} numberOfLines={1}>
                {componentLabel}
              </Text>
              {selectedComponent && (
                <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); setSelectedComponent(null); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: 8 }}>
                  <Ionicons name="close-circle" size={16} color="#ffffff80" />
                </TouchableOpacity>
              )}
              <Ionicons name="chevron-forward" size={16} color="#ffffff80" />
            </TouchableOpacity>

            {/* Descrizione */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("desription")}</Text>
            <TextInput value={description} onChangeText={setDescription}
              placeholder={t("write_here")} placeholderTextColor="#6b7280"
              multiline numberOfLines={3}
              style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12,
                marginBottom: 14, minHeight: 80, textAlignVertical: "top" }} />

            {/* Data */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("date")}</Text>
            <TextInput value={date} onChangeText={setDate}
              placeholder="YYYY-MM-DD" placeholderTextColor="#6b7280"
              style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 14 }} />

            {/* Gravità */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 10 }}>{t("select_severity")}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {gravities.map((g) => (
                <TouchableOpacity key={g} onPress={() => setGravity(g)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center",
                    backgroundColor: gravity === g ? gravityColor(g) : "#ffffff15" }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                    {t(`gravities.${g}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Campi custom */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 10 }}>
              {t("add_custom_field")}
            </Text>
            {customFields.map((field, index) => (
              <View key={index} style={{ flexDirection: "row", gap: 8, marginBottom: 10, alignItems: "center" }}>
                <TextInput value={field.name} onChangeText={(v) => updateCustomField(index, "name", v)}
                  placeholder={t("name")} placeholderTextColor="#6b7280"
                  style={{ flex: 1, backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 10 }} />
                <TextInput value={field.value} onChangeText={(v) => updateCustomField(index, "value", v)}
                  placeholder={t("value")} placeholderTextColor="#6b7280"
                  style={{ flex: 1, backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 10 }} />
                <TouchableOpacity onPress={() => removeCustomField(index)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#ef4444",
                    alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>−</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addCustomField}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center",
                gap: 6, paddingVertical: 10, marginBottom: 16 }}>
              <Ionicons name="add-circle-outline" size={18} color="#789fd6" />
              <Text style={{ color: "#789fd6", fontSize: 13, fontWeight: "600" }}>{t("add_custom_field")}</Text>
            </TouchableOpacity>

            {/* Esecutore */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("user")}</Text>
            <View style={{ backgroundColor: "#ffffff08", borderRadius: 8, padding: 12, marginBottom: 20 }}>
              <Text style={{ color: "#ffffff60" }}>{user?.firstName} {user?.lastName}</Text>
            </View>

            <TouchableOpacity onPress={handleSubmit} disabled={loading}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14,
                alignItems: "center", marginBottom: 8 }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {!isOnline && <Ionicons name="cloud-offline-outline" size={16} color="#fff" />}
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {isOnline ? t("confirm") : (t("save_offline_button") || "Salva offline")}
                    </Text>
                  </View>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Pressable>

      <FacilitiesModal
        visible={facilitiesOpen}
        onClose={() => setFacilitiesOpen(false)}
        onSelectSystem={(node: any) => {
          setSelectedComponent(node);
          setFacilitiesOpen(false);
        }}
      />
    </Modal>
  );
}

// ─── Failure Row ──────────────────────────────────────────────────────────────
function FailureRow({ item }: { item: any }) {
  return (
    <TouchableOpacity
      onPress={() => !item._pending && router.push(`/(app)/failures/${item.id}` as any)}
      style={{ backgroundColor: "#022a52", borderRadius: 10, marginBottom: 10,
        borderLeftWidth: 6, borderLeftColor: item._pending ? "#F47216" : gravityColor(item.gravity),
        padding: 14, flexDirection: "row", alignItems: "center",
        opacity: item._pending ? 0.75 : 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", flex: 1 }}>{item.title}</Text>
          {item._pending && (
            <View style={{ backgroundColor: "#F4721633", borderRadius: 12,
              paddingHorizontal: 8, paddingVertical: 2,
              flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="cloud-upload-outline" size={11} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 10, fontWeight: "700" }}>In attesa</Text>
            </View>
          )}
        </View>
        {item.partNumber && (
          <Text style={{ color: "#ffffff80", fontSize: 13 }}>{item.partNumber}</Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
          {item.gravity && (
            <View style={{ backgroundColor: gravityBg(item.gravity),
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ color: gravityColor(item.gravity), fontSize: 11,
                fontWeight: "600", textTransform: "capitalize" }}>
                {item.gravity}
              </Text>
            </View>
          )}
          {item.date && (
            <Text style={{ color: "#ffffff60", fontSize: 12 }}>{item.date}</Text>
          )}
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        {item.userExecutionData?.first_name && (
          <Text style={{ color: "#ffffff80", fontSize: 12 }}>
            {item.userExecutionData.first_name} {item.userExecutionData.last_name}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Ionicons name="camera-outline"        size={18} color={item.img   ? "#fff" : "#ffffff25"} />
          <Ionicons name="mic-outline"           size={18} color={item.audio ? "#fff" : "#ffffff25"} />
          <Ionicons name="document-text-outline" size={18} color={item.note  ? "#fff" : "#ffffff25"} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Failures Page ────────────────────────────────────────────────────────────
export default function FailuresPage() {
  const { t } = useTranslation("failures");
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { isTablet } = useDevice();

  const [failures,   setFailures]   = useState<any[]>([]);
  const [filtered,   setFiltered]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [isOnline,   setIsOnline]   = useState(true);
  const [fromCache,  setFromCache]  = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen,    setAddOpen]    = useState(false);
  const [filters, setFilters] = useState({
    gravita: { critica: false, alta: false, media: false, bassa: false },
    squadra: { connected_user: false, crew: false, maintenance: false, command: false },
  });

  const shipId = String(user?.teamInfo?.assignedShip?.id || "");

  // ── Monitor connettività ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Caricamento: API → cache → fallback ───────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);

    const key = FAILURES_CACHE(shipId);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    if (online) {
      try {
        const data = await getFailures(shipId, String(user.id));
        const stillPending = failures.filter(
          (f) => f._pending && String(f.id).startsWith("temp_")
        );
        // Se siamo online, i temp_ sono stati salvati ora → non ri-inserirli.
        const merged = online ? data : [...stillPending, ...data];
        setFailures(merged);
        setFromCache(false);
        await AsyncStorage.setItem(key, JSON.stringify(data));
      } catch {
        await loadFromCache(key);
      }
    } else {
      await loadFromCache(key);
    }

    if (!silent) setLoading(false);
  }, [user, shipId]);

  const loadFromCache = async (key: string) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      const data: any[] = raw ? JSON.parse(raw) : [];
      setFailures(data);
      setFromCache(data.length > 0);
    } catch {
      setFailures([]);
    }
  };

  useEffect(() => { load(); }, [user]);

  // ── Ricarica live quando torna online ─────────────────────────────────────
  useEffect(() => {
    if (isOnline && fromCache) load(true);
  }, [isOnline]);

  // ── Applica filtri ─────────────────────────────────────────────────────────
  useEffect(() => {
    const activeGravities = Object.entries(filters.gravita).filter(([, v]) => v).map(([k]) => k);
    const activeTeams     = Object.entries(filters.squadra).filter(([, v]) => v).map(([k]) => k);
    setFiltered(failures.filter((f) => {
      const matchG = activeGravities.length === 0 || activeGravities.includes(f.gravity);
      const matchT = activeTeams.length === 0     || activeTeams.includes(f.executionUserType);
      return matchG && matchT;
    }));
  }, [filters, failures]);

  // ── Aggiunta ottimistica ──────────────────────────────────────────────────
  const handleAddOptimistic = (newItem: any) => {
    setFailures((prev) => [newItem, ...prev]);
  };

  const activeFiltersCount = [
    ...Object.values(filters.gravita),
    ...Object.values(filters.squadra),
  ].filter(Boolean).length;

  const pendingCount = failures.filter((f) => f._pending).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View
        style={{
          flex: 1,
          padding: isTablet ? 24 : 16,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 1000 : "100%",
        }}
      >
        <DashboardHeader />

        {/* Banner offline */}
        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline{pendingCount > 0
                ? ` · ${pendingCount} ${pendingCount === 1 ? "avaria in attesa" : "avarie in attesa"}`
                : ""}
            </Text>
          </View>
        )}

        {/* Banner aggiornamento in corso */}
        {isOnline && fromCache && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Aggiornamento in corso...
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center",
          marginTop: (!isOnline || fromCache) ? 8 : 16, marginBottom: 12 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
            {t("failures")} ({filtered.length})
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}>
            <TouchableOpacity onPress={() => setFilterOpen(true)}
              style={{ backgroundColor: "#022a52", borderRadius: 8, paddingHorizontal: 12,
                paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="filter-outline" size={18} color="#fff" />
              {activeFiltersCount > 0 && (
                <View style={{ backgroundColor: "#fff", borderRadius: 10, width: 18, height: 18,
                  alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#001c38", fontSize: 11, fontWeight: "700" }}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAddOpen(true)}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 12,
                paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>{t("add_failure")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="warning-outline" size={64} color="#789fd6" />
            <Text style={{ color: "#789fd6", marginTop: 16, fontSize: 16 }}>{t("no_results")}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <FailureRow item={item} />}
            showsVerticalScrollIndicator={false}
            numColumns={isTablet ? 2 : 1}
            columnWrapperStyle={isTablet ? { gap: 10 } : undefined}
            contentContainerStyle={isTablet ? { gap: 10 } : undefined}
          />
        )}
      </View>

      <FilterModal
        visible={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} onApply={setFilters}
      />
      <AddFailureModal
        visible={addOpen} onClose={() => setAddOpen(false)}
        onAddOptimistic={handleAddOptimistic}
        onSaved={() => { console.log("[failures] onSaved → load"); load(true); }}
        user={user} isOnline={isOnline}
      />
    </SafeAreaView>
  );
}