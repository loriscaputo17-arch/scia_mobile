import { useEffect, useState } from "react";
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

// ─── API ──────────────────────────────────────────────────────────────────────
const getFailures = async (shipId: string, userId: string, filters: any = {}) => {
  const params = new URLSearchParams({ ship_id: shipId, userId, ...filters }).toString();
  const res = await api.get(`/failures/getFailures?${params}`);
  return Array.isArray(res.data.failures) ? res.data.failures : [];
};

const addFailure = async (payload: any) => {
  const res = await api.post("/failures/addFailure", payload);
  return res.data;
};

// ─── Gravity helpers ──────────────────────────────────────────────────────────
const gravityColor = (g?: string) => {
  switch (g?.toLowerCase()) {
    case "critica": return "#D0021B";
    case "alta": return "#F47216";
    case "media": return "#FFBF25";
    case "bassa": return "#2DB647";
    default: return "#6b7280";
  }
};

const gravityBg = (g?: string) => {
  switch (g?.toLowerCase()) {
    case "critica": return "#D0021B22";
    case "alta": return "#F4721622";
    case "media": return "#FFBF2522";
    case "bassa": return "#2DB64722";
    default: return "#6b728022";
  }
};

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, filters, onApply }: {
  visible: boolean; onClose: () => void;
  filters: any; onApply: (f: any) => void;
}) {
  const [local, setLocal] = useState(filters);

  useEffect(() => setLocal(filters), [filters]);

  const toggle = (category: string, key: string) => {
    setLocal((prev: any) => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] },
    }));
  };

  const gravities = [
    { key: "critica", label: "Critica", color: "#D0021B" },
    { key: "alta", label: "Alta", color: "#F47216" },
    { key: "media", label: "Media", color: "#FFBF25" },
    { key: "bassa", label: "Bassa", color: "#2DB647" },
  ];

  const teams = [
    { key: "connected_user", label: "Utente connesso" },
    { key: "crew", label: "Equipaggio" },
    { key: "maintenance", label: "Manutenzione" },
    { key: "command", label: "Comando" },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 300, backgroundColor: "#022a52", padding: 24 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>Filtri</Text>

          <Text style={{ color: "#789fd6", marginBottom: 12 }}>Gravità</Text>
          {gravities.map((g) => (
            <TouchableOpacity key={g.key} onPress={() => toggle("gravita", g.key)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: g.color, marginRight: 10 }} />
              <Text style={{ color: "#fff", flex: 1 }}>{g.label}</Text>
              <View style={{
                width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.gravita[g.key] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.gravita[g.key] ? "#789fd6" : "transparent",
              }} />
            </TouchableOpacity>
          ))}

          <Text style={{ color: "#789fd6", marginBottom: 12, marginTop: 16 }}>Squadra</Text>
          {teams.map((t) => (
            <TouchableOpacity key={t.key} onPress={() => toggle("squadra", t.key)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#fff", flex: 1 }}>{t.label}</Text>
              <View style={{
                width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.squadra[t.key] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.squadra[t.key] ? "#789fd6" : "transparent",
              }} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => { onApply(local); onClose(); }}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 24 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Applica filtri</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Add Failure Modal ────────────────────────────────────────────────────────
function AddFailureModal({ visible, onClose, onSuccess, user }: {
  visible: boolean; onClose: () => void; onSuccess: () => void; user: any;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [gravity, setGravity] = useState("");
  const [loading, setLoading] = useState(false);

  const gravities = ["critica", "alta", "media", "bassa"];

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert("Errore", "Il titolo è obbligatorio"); return; }
    setLoading(true);
    try {
      await addFailure({
        title, description, date, gravity,
        executionUserType: "connected_user",
        userExecution: user?.id,
        ship_id: (user as any)?.teamInfo?.assignedShip?.id || 1,
      });
      setTitle(""); setDescription(""); setGravity("");
      onSuccess();
      onClose();
    } catch {
      Alert.alert("Errore", "Impossibile aggiungere il guasto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Aggiungi guasto</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Titolo *</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Inserisci titolo" placeholderTextColor="#6b7280"
              style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 14 }} />

            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Descrizione</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Descrizione..." placeholderTextColor="#6b7280"
              multiline numberOfLines={3} style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 14, minHeight: 80, textAlignVertical: "top" }} />

            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Data</Text>
            <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#6b7280"
              style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 14 }} />

            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 10 }}>Gravità</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {gravities.map((g) => (
                <TouchableOpacity key={g} onPress={() => setGravity(g)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: gravity === g ? gravityColor(g) : "#ffffff15" }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Utente</Text>
            <View style={{ backgroundColor: "#ffffff08", borderRadius: 8, padding: 12, marginBottom: 20 }}>
              <Text style={{ color: "#ffffff60" }}>{user?.firstName} {user?.lastName}</Text>
            </View>

            <TouchableOpacity onPress={handleSubmit} disabled={loading}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginBottom: 8 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Conferma</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Failure Row ──────────────────────────────────────────────────────────────
function FailureRow({ item }: { item: any }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/failures/${item.id}` as any)}
      style={{
        backgroundColor: "#022a52", borderRadius: 10, marginBottom: 10,
        borderLeftWidth: 6, borderLeftColor: gravityColor(item.gravity),
        padding: 14, flexDirection: "row", alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 4 }}>{item.title}</Text>
        {item.partNumber && <Text style={{ color: "#ffffff80", fontSize: 13 }}>{item.partNumber}</Text>}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
          {item.gravity && (
            <View style={{ backgroundColor: gravityBg(item.gravity), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ color: gravityColor(item.gravity), fontSize: 11, fontWeight: "600", textTransform: "capitalize" }}>{item.gravity}</Text>
            </View>
          )}
          {item.date && <Text style={{ color: "#ffffff60", fontSize: 12 }}>{item.date}</Text>}
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        {item.userExecutionData?.first_name && (
          <Text style={{ color: "#ffffff80", fontSize: 12 }}>{item.userExecutionData.first_name} {item.userExecutionData.last_name}</Text>
        )}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Ionicons name="camera-outline" size={18} color={item.img ? "#fff" : "#ffffff25"} />
          <Ionicons name="mic-outline" size={18} color={item.audio ? "#fff" : "#ffffff25"} />
          <Ionicons name="document-text-outline" size={18} color={item.note ? "#fff" : "#ffffff25"} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Failures Page ────────────────────────────────────────────────────────────
export default function FailuresPage() {
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const [failures, setFailures] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filters, setFilters] = useState({
    gravita: { critica: false, alta: false, media: false, bassa: false },
    squadra: { connected_user: false, crew: false, maintenance: false, command: false },
  });

  const shipId = user?.teamInfo?.assignedShip?.id;

  const load = () => {
    if (!user) return;
    setLoading(true);
    getFailures(String(shipId), String(user.id))
      .then((data) => { setFailures(data); setFiltered(data); })
      .catch(() => Alert.alert("Errore", "Impossibile caricare i guasti"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    const activeGravities = Object.entries(filters.gravita).filter(([, v]) => v).map(([k]) => k);
    const activeTeams = Object.entries(filters.squadra).filter(([, v]) => v).map(([k]) => k);
    setFiltered(failures.filter((f) => {
      const matchG = activeGravities.length === 0 || activeGravities.includes(f.gravity);
      const matchT = activeTeams.length === 0 || activeTeams.includes(f.executionUserType);
      return matchG && matchT;
    }));
  }, [filters, failures]);

  const activeFiltersCount = [
    ...Object.values(filters.gravita),
    ...Object.values(filters.squadra),
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 12 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
            Failures ({filtered.length})
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}>
            <TouchableOpacity onPress={() => setFilterOpen(true)}
              style={{ backgroundColor: "#022a52", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="filter-outline" size={18} color="#fff" />
              {activeFiltersCount > 0 && (
                <View style={{ backgroundColor: "#fff", borderRadius: 10, width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#001c38", fontSize: 11, fontWeight: "700" }}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAddOpen(true)}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Aggiungi</Text>
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
            <Text style={{ color: "#789fd6", marginTop: 16, fontSize: 16 }}>Nessun guasto trovato</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <FailureRow item={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FilterModal visible={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onApply={setFilters} />
      <AddFailureModal visible={addOpen} onClose={() => setAddOpen(false)} onSuccess={load} user={user} />
    </SafeAreaView>
  );
}