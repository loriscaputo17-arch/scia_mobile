import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, Pressable, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { router } from "expo-router";

// ─── API ──────────────────────────────────────────────────────────────────────
const getReadings = async (shipId: string, userId: string) => {
  const res = await api.get(`/readings/getReadings?ship_id=${shipId}&user_id=${userId}`);
  return res.data || [];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TAG_COLORS = ["#f78da7", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f87171", "#38bdf8", "#c084fc"];

const parseTags = (tags?: string): string[] => {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
};

// ─── Select Type Modal ────────────────────────────────────────────────────────
function SelectTypeModal({ visible, onClose, data, onSelect }: {
  visible: boolean; onClose: () => void; data: any[]; onSelect: (t: any) => void;
}) {
  const [grouped, setGrouped] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<any>(null);

  useEffect(() => {
    if (!data.length) return;
    const map = new Map<any, any>();
    data.forEach((item) => {
      const id = item.type?.id;
      if (!id) return;
      if (!map.has(id)) map.set(id, { id, name: item.type.name, tasks: [] });
      map.get(id).tasks.push(item);
    });
    const result = Array.from(map.values()).map((g) => {
      const sorted = [...g.tasks].sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
      return { id: g.id, name: g.name, taskCount: g.tasks.length, latestDueDate: sorted[0]?.due_date || "N/A", lastExec: sorted[1]?.due_date || "N/A" };
    });
    setGrouped(result);
  }, [data]);

  const handleConfirm = () => {
    const found = grouped.find((g) => g.id === selectedId);
    if (found) { onSelect(found); onClose(); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Seleziona tipo lettura</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {grouped.map((g) => (
              <TouchableOpacity key={g.id} onPress={() => setSelectedId(g.id)}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedId === g.id ? "#789fd6" : "#ffffff50", backgroundColor: selectedId === g.id ? "#789fd6" : "transparent", marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>{g.name}</Text>
                  <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>Task: {g.taskCount} · Scad: {g.latestDueDate}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={handleConfirm} disabled={!selectedId}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16, opacity: !selectedId ? 0.5 : 1 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Conferma</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, filters, onApply }: {
  visible: boolean; onClose: () => void; filters: any; onApply: (f: any) => void;
}) {
  const [local, setLocal] = useState(filters);
  useEffect(() => setLocal(filters), [filters]);

  const toggle = (cat: string, key: string) =>
    setLocal((p: any) => ({ ...p, [cat]: { ...p[cat], [key]: !p[cat][key] } }));

  const macros = [
    "100 - Scafo", "200 - Propulsioni/Motori", "300 - Impianto elettrico",
    "400 - Comando, controllo e sorveglianza", "500 - Impianti ausiliari",
    "600 - Allestimento e arredamento", "700 - Armamenti",
    "800 - Integration / Engineering", "900 - Ship assembly / Support services",
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 300, backgroundColor: "#022a52", padding: 24, paddingTop: 60, }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>Filtri</Text>

          <Text style={{ color: "#789fd6", marginBottom: 10 }}>Task</Text>
          <TouchableOpacity onPress={() => toggle("task", "nascondiTaskEseguiti")}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#fff", flex: 1 }}>Nascondi task eseguiti</Text>
            <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: local.task.nascondiTaskEseguiti ? "#789fd6" : "#ffffff40", backgroundColor: local.task.nascondiTaskEseguiti ? "#789fd6" : "transparent" }} />
          </TouchableOpacity>

          <Text style={{ color: "#789fd6", marginBottom: 10, marginTop: 8 }}>Squadra</Text>
          {["operatori", "equipaggio", "manutentori", "comando"].map((k) => (
            <TouchableOpacity key={k} onPress={() => toggle("squadraDiAssegnazione", k)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#fff", flex: 1, textTransform: "capitalize" }}>{k}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: local.squadraDiAssegnazione[k] ? "#789fd6" : "#ffffff40", backgroundColor: local.squadraDiAssegnazione[k] ? "#789fd6" : "transparent" }} />
            </TouchableOpacity>
          ))}

          <Text style={{ color: "#789fd6", marginBottom: 10, marginTop: 8 }}>Macrogruppo ESWBS</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            {macros.map((m) => (
              <TouchableOpacity key={m} onPress={() => toggle("macrogruppoESWBS", m)}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#fff", flex: 1, fontSize: 12 }}>{m}</Text>
                <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: local.macrogruppoESWBS[m] ? "#789fd6" : "#ffffff40", backgroundColor: local.macrogruppoESWBS[m] ? "#789fd6" : "transparent" }} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={() => { onApply(local); onClose(); }}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Applica</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Reading Row ──────────────────────────────────────────────────────────────
function ReadingRow({ item }: { item: any }) {
  const tags = parseTags(item.tags);
  const cameraStatus = item.img ? "active" : "inactive";
  const micStatus = item.audio ? "active" : "inactive";
  const docStatus = item.note ? "active" : "inactive";

  return (
    <TouchableOpacity onPress={() => router.push(`/(app)/readings/${item.id}` as any)}
      style={{ backgroundColor: "#022a52", borderRadius: 10, marginBottom: 10, padding: 14 }}>
      
      {/* Tags */}
      {tags.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {tags.map((tag, i) => (
            <View key={i} style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length], borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 4 }} numberOfLines={1}>
        {item.task_name}
      </Text>
      <Text style={{ color: "#ffffff80", fontSize: 13, marginBottom: 10 }} numberOfLines={1}>
        {item.element?.name}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Recurrence */}
        <View style={{ backgroundColor: "#ffffff15", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 10 }}>
          <Text style={{ color: "#fff", fontSize: 12 }}>{item.recurrence}gg</Text>
        </View>

        {/* Note icons */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Ionicons name="camera-outline" size={18} color={cameraStatus === "active" ? "#fff" : "#ffffff25"} />
          <Ionicons name="mic-outline" size={18} color={micStatus === "active" ? "#fff" : "#ffffff25"} />
          <Ionicons name="document-text-outline" size={18} color={docStatus === "active" ? "#fff" : "#ffffff25"} />
        </View>

        {/* Value */}
        <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "baseline", gap: 4 }}>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>{item.value || "—"}</Text>
          {item.unit && <Text style={{ color: "#ffffff80", fontSize: 13 }}>{item.unit}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Readings Page ────────────────────────────────────────────────────────────
export default function ReadingsPage() {
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    task: { nascondiTaskEseguiti: false },
    squadraDiAssegnazione: { operatori: false, equipaggio: false, manutentori: false, comando: false },
    macrogruppoESWBS: {
      "100 - Scafo": false, "200 - Propulsioni/Motori": false,
      "300 - Impianto elettrico": false, "400 - Comando, controllo e sorveglianza": false,
      "500 - Impianti ausiliari": false, "600 - Allestimento e arredamento": false,
      "700 - Armamenti": false, "800 - Integration / Engineering": false,
      "900 - Ship assembly / Support services": false,
    },
  });

  const shipId = user?.teamInfo?.assignedShip?.id;

  useEffect(() => {
    if (!user) return;
    getReadings(String(shipId), String(user.id))
      .then(setReadings)
      .catch(() => Alert.alert("Errore", "Impossibile caricare le letture"))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = readings.filter((r) => {
    if (selectedType && r.type?.id !== selectedType.id) return false;
    if (filters.task.nascondiTaskEseguiti && r.value && r.value !== "") return false;

    const squadActive = Object.values(filters.squadraDiAssegnazione).some(Boolean);
    if (squadActive) {
      const teamMap: any = { operatori: "operatori", equipaggio: "equipaggio", manutentori: "manutentori", comando: "comando" };
      const match = Object.entries(filters.squadraDiAssegnazione)
        .filter(([, v]) => v)
        .some(([k]) => r.team?.toLowerCase().includes(teamMap[k]));
      if (!match) return false;
    }

    const macroActive = Object.values(filters.macrogruppoESWBS).some(Boolean);
    if (macroActive) {
      const code = r?.element?.element_model?.ESWBS_code?.trim();
      if (!code) return false;
      const match = Object.entries(filters.macrogruppoESWBS)
        .filter(([, v]) => v)
        .some(([k]) => code.startsWith(k.split(" - ")[0][0]));
      if (!match) return false;
    }

    return true;
  });

  const activeFiltersCount = [
    filters.task.nascondiTaskEseguiti,
    ...Object.values(filters.squadraDiAssegnazione),
    ...Object.values(filters.macrogruppoESWBS),
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setSelectOpen(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {selectedType ? `${selectedType.name} (${selectedType.taskCount})` : `Tutte le letture (${filtered.length})`}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilterOpen(true)}
            style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8 }}>
            <Ionicons name="filter-outline" size={20} color="#fff" />
            {activeFiltersCount > 0 && (
              <View style={{ position: "absolute", top: 2, right: 2, backgroundColor: "#789fd6", borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Reset type selection */}
        {selectedType && (
          <TouchableOpacity onPress={() => setSelectedType(null)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Ionicons name="close-circle" size={16} color="#789fd6" />
            <Text style={{ color: "#789fd6", fontSize: 13 }}>Mostra tutte</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="speedometer-outline" size={64} color="#789fd6" />
            <Text style={{ color: "#789fd6", marginTop: 16, fontSize: 16 }}>Nessuna lettura trovata</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ReadingRow item={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <SelectTypeModal visible={selectOpen} onClose={() => setSelectOpen(false)} data={readings} onSelect={setSelectedType} />
      <FilterModal visible={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onApply={setFilters} />
    </SafeAreaView>
  );
}