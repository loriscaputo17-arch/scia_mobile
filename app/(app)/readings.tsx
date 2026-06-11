import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, Pressable, ScrollView,
  useWindowDimensions
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

// ─── API + Cache ──────────────────────────────────────────────────────────────
const CACHE_KEY = (shipId: string, userId: string) => `cache_readings_${shipId}_${userId}`;

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
  const { t } = useTranslation("maintenance");
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52",
          borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("select_maintenance")}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {grouped.map((g) => (
              <TouchableOpacity key={g.id} onPress={() => setSelectedId(g.id)}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14,
                  borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                  borderColor: selectedId === g.id ? "#789fd6" : "#ffffff50",
                  backgroundColor: selectedId === g.id ? "#789fd6" : "transparent", marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>{g.name}</Text>
                  <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>
                    Task: {g.taskCount} · {t("expiration")}: {g.latestDueDate}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={() => { const found = grouped.find((g) => g.id === selectedId); if (found) { onSelect(found); onClose(); } }}
            disabled={!selectedId}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center",
              marginTop: 16, opacity: !selectedId ? 0.5 : 1 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("confirm")}</Text>
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
  const { t } = useTranslation("maintenance");
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
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 300,
          backgroundColor: "#022a52", padding: 24, paddingTop: 60 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>{t("filters")}</Text>

          <Text style={{ color: "#789fd6", marginBottom: 10 }}>Task</Text>
          <TouchableOpacity onPress={() => toggle("task", "nascondiTaskEseguiti")}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#fff", flex: 1 }}>Nascondi task eseguiti</Text>
            <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
              borderColor: local.task.nascondiTaskEseguiti ? "#789fd6" : "#ffffff40",
              backgroundColor: local.task.nascondiTaskEseguiti ? "#789fd6" : "transparent" }} />
          </TouchableOpacity>

          <Text style={{ color: "#789fd6", marginBottom: 10, marginTop: 8 }}>{t("assignment_team")}</Text>
          {["operatori", "equipaggio", "manutentori", "comando"].map((k) => (
            <TouchableOpacity key={k} onPress={() => toggle("squadraDiAssegnazione", k)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#fff", flex: 1, textTransform: "capitalize" }}>{k}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.squadraDiAssegnazione[k] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.squadraDiAssegnazione[k] ? "#789fd6" : "transparent" }} />
            </TouchableOpacity>
          ))}

          <Text style={{ color: "#789fd6", marginBottom: 10, marginTop: 8 }}>{t("macrogroup")}</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            {macros.map((m) => (
              <TouchableOpacity key={m} onPress={() => toggle("macrogruppoESWBS", m)}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#fff", flex: 1, fontSize: 12 }}>{m}</Text>
                <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 2,
                  borderColor: local.macrogruppoESWBS[m] ? "#789fd6" : "#ffffff40",
                  backgroundColor: local.macrogruppoESWBS[m] ? "#789fd6" : "transparent" }} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={() => { onApply(local); onClose(); }}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("confirm")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Reading Row ──────────────────────────────────────────────────────────────
function ReadingRow({ item }: { item: any }) {
  const { t } = useTranslation("maintenance");
  const tags = parseTags(item.tags);

  return (
    <TouchableOpacity onPress={() => router.push(`/(app)/readings/${item.id}` as any)}
      style={{ backgroundColor: "#022a52", borderRadius: 10, marginBottom: 10, padding: 14 }}>
      {tags.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {tags.map((tag, i) => (
            <View key={i} style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length],
              borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
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
        <View style={{ backgroundColor: "#ffffff15", borderRadius: 20,
          paddingHorizontal: 10, paddingVertical: 4, marginRight: 10 }}>
          <Text style={{ color: "#fff", fontSize: 12 }}>{item.recurrence}{t("days_short")}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Ionicons name="camera-outline" size={18} color={item.img   ? "#fff" : "#ffffff25"} />
          <Ionicons name="mic-outline"    size={18} color={item.audio ? "#fff" : "#ffffff25"} />
          <Ionicons name="document-text-outline" size={18} color={item.note ? "#fff" : "#ffffff25"} />
        </View>
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

  const { t } = useTranslation("maintenance");
  const user = useSelector((state: RootState) => state.auth?.user) as any;

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    task: { nascondiTaskEseguiti: false },
    squadraDiAssegnazione: {
      operatori: false,
      equipaggio: false,
      manutentori: false,
      comando: false
    },
    macrogruppoESWBS: {
      "100 - Scafo": false,
      "200 - Propulsioni/Motori": false,
      "300 - Impianto elettrico": false,
      "400 - Comando, controllo e sorveglianza": false,
      "500 - Impianti ausiliari": false,
      "600 - Allestimento e arredamento": false,
      "700 - Armamenti": false,
      "800 - Integration / Engineering": false,
      "900 - Ship assembly / Support services": false,
    },
  });

  const shipId = user?.teamInfo?.assignedShip?.id;

  // ── Monitor connettività ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Caricamento dati ────────────────────────────────────────────────────────
  useEffect(() => {

    if (!user || !shipId) return;

    const key = CACHE_KEY(String(shipId), String(user.id));

    const load = async () => {

      setLoading(true);

      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      if (online) {

        try {

          const data = await getReadings(String(shipId), String(user.id));

          setReadings(data);
          setFromCache(false);

          await AsyncStorage.setItem(key, JSON.stringify(data));

        } catch {

          await loadFromCache(key);

        }

      } else {

        await loadFromCache(key);

      }

      setLoading(false);
    };

    const loadFromCache = async (k: string) => {

      try {

        const raw = await AsyncStorage.getItem(k);

        if (raw) {

          setReadings(JSON.parse(raw));
          setFromCache(true);

        } else {

          setReadings([]);
          setFromCache(true);

        }

      } catch {

        setReadings([]);

      }
    };

    load();

  }, [user, shipId]);

  // ── Auto refresh quando torna online ────────────────────────────────────────
  useEffect(() => {

    if (!isOnline || !user || !shipId || !fromCache) return;

    const key = CACHE_KEY(String(shipId), String(user.id));

    getReadings(String(shipId), String(user.id))
      .then(async (data) => {

        setReadings(data);
        setFromCache(false);

        await AsyncStorage.setItem(key, JSON.stringify(data));

      })
      .catch(() => {});

  }, [isOnline]);

  const filtered = readings;

  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>

      <View
        style={{
          flex: 1,
          padding: isTablet ? 24 : 16,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 900 : "100%"
        }}
      >

        <DashboardHeader />

        {!isOnline && (
          <View style={{
            backgroundColor: "#F47216",
            borderRadius: 8,
            padding: 10,
            marginTop: 12,
            marginBottom: 4,
            flexDirection: "row",
            alignItems: "center",
            gap: 8
          }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — {t("no_data_available_cached")}
            </Text>
          </View>
        )}

        <View style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
          marginBottom: 12
        }}>

          <TouchableOpacity
            onPress={() => setSelectOpen(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}
          >

            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {t("all")} ({filtered.length})
            </Text>

            <Ionicons name="chevron-down" size={18} color="#fff" />

          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8 }}
          >
            <Ionicons name="filter-outline" size={20} color="#fff" />
          </TouchableOpacity>

        </View>

        {loading ? (

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
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

      <SelectTypeModal
        visible={selectOpen}
        onClose={() => setSelectOpen(false)}
        data={readings}
        onSelect={setSelectedType}
      />

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

    </SafeAreaView>
  );
}