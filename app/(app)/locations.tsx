import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, Pressable, TextInput, ScrollView,
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
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchLocations = async (shipId: string, userId: string) => {
  const res = await api.get(`/locations/getLocations?ship_id=${shipId}&user_id=${userId}`);
  return res.data.locations || [];
};

const addLocationApi = async (payload: {
  warehouse: string; ship_id: string; user_id: string; location: string;
}) => {
  const res = await api.post("/locations/addLocation", payload);
  return res.data;
};

// ─── Cache keys ───────────────────────────────────────────────────────────────
const LOCATIONS_CACHE   = (shipId: string) => `cache_locations_${shipId}`;
const PENDING_LOCATIONS = (shipId: string) => `pending_locations_${shipId}`;

// ─── Create Location Modal ────────────────────────────────────────────────────
function CreateLocationModal({ visible, onClose, onAddOptimistic, locations, shipId, userId, isOnline }: any) {
  const { t } = useTranslation("maintenance");
  const [warehouse, setWarehouse] = useState("");
  const [location,  setLocation]  = useState("");
  const [loading,   setLoading]   = useState(false);

  const warehouses = Array.from(
    new Map(
      (locations as any[])
        .filter((l: any) => l.warehouseInfo)
        .map((l: any) => [l.warehouseInfo.id, l.warehouseInfo])
    ).values()
  ) as any[];

  const reset = () => { setWarehouse(""); setLocation(""); onClose(); };

  const handleConfirm = async () => {
    if (!warehouse || !location.trim())
      return Alert.alert("Attenzione", `${t("select_warehouse")} e ${t("location")}`);

    setLoading(true);
    const selectedWarehouse = warehouses.find((w: any) => String(w.id) === warehouse);
    const payload = { warehouse, ship_id: shipId, user_id: userId, location };

    // Oggetto ottimistico da mostrare subito in lista
    const optimisticItem = {
      id: `temp_${Date.now()}`,
      location,
      spare_count: 0,
      warehouseInfo: selectedWarehouse || { id: warehouse, name: warehouse },
      _pending: true, // flag per mostrare badge "in attesa"
    };

    try {
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      if (online) {
        await addLocationApi(payload);
        // Aggiunge ottimisticamente senza il flag pending (API ha già risposto)
        onAddOptimistic({ ...optimisticItem, _pending: false });
      } else {
        // Offline: aggiunge alla lista con badge "in attesa" + salva in coda
        onAddOptimistic(optimisticItem);

        // Accoda il payload in AsyncStorage
        const raw = await AsyncStorage.getItem(PENDING_LOCATIONS(shipId)).catch(() => null);
        const queue: any[] = raw ? JSON.parse(raw) : [];
        queue.push({ ...payload, tempId: optimisticItem.id });
        await AsyncStorage.setItem(PENDING_LOCATIONS(shipId), JSON.stringify(queue));

        Alert.alert(t("confirm"), t("location_saved_offline") || "Posizione salvata offline, sarà sincronizzata quando online.");
      }

      reset();
    } catch {
      Alert.alert("Errore", t("no_data_available"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={reset}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>

          <View style={{ flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("create_location")}</Text>
            <TouchableOpacity onPress={reset}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {/* Banner offline nel modal */}
          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10,
              marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>
                Offline — la posizione sarà sincronizzata quando online
              </Text>
            </View>
          )}

          <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 8,
            fontWeight: "700", textTransform: "uppercase" }}>{t("warehouse")}</Text>
          {warehouses.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {warehouses.map((w: any) => (
                <TouchableOpacity key={w.id} onPress={() => setWarehouse(String(w.id))}
                  style={{ backgroundColor: warehouse === String(w.id) ? "#789fd6" : "#ffffff10",
                    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 }}>
                  <Text style={{ color: "#fff", fontWeight: warehouse === String(w.id) ? "700" : "400" }}>
                    {w.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ backgroundColor: "#ffffff08", borderRadius: 8, padding: 12,
              marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="warning-outline" size={16} color="#FFBF25" />
              <Text style={{ color: "#ffffff80", fontSize: 13 }}>{t("no_warehouse")}</Text>
            </View>
          )}

          <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 8,
            fontWeight: "700", textTransform: "uppercase" }}>{t("location")}</Text>
          <TextInput
            value={location} onChangeText={setLocation}
            placeholder={t("new_location")}
            placeholderTextColor="#6b7280"
            style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8,
              padding: 12, marginBottom: 20, fontSize: 14 }}
          />

          <TouchableOpacity onPress={handleConfirm} disabled={loading}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {!isOnline && <Ionicons name="cloud-offline-outline" size={16} color="#fff" />}
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                    {isOnline ? t("confirm") : t("save_offline_button") || "Salva offline"}
                  </Text>
                </View>
            }
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Location Row ─────────────────────────────────────────────────────────────
function LocationRow({ item }: { item: any }) {
  const { t } = useTranslation("maintenance");
  return (
    <View style={{ backgroundColor: "#022a52", borderRadius: 12, marginBottom: 10,
      flexDirection: "row", alignItems: "stretch", overflow: "hidden",
      opacity: item._pending ? 0.7 : 1 }}>
      <View style={{ width: 4, backgroundColor: item._pending ? "#F47216" : "#789fd6" }} />
      <View style={{ flex: 1, padding: 14, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#ffffff10",
            alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="cube-outline" size={16} color="#789fd6" />
          </View>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700", flex: 1 }} numberOfLines={1}>
            {item.warehouseInfo?.name ?? "—"}
          </Text>
          {/* Badge "in attesa di sync" */}
          {item._pending && (
            <View style={{ backgroundColor: "#F4721633", borderRadius: 12,
              paddingHorizontal: 8, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="cloud-upload-outline" size={11} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 10, fontWeight: "700" }}>In attesa</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="location-outline" size={13} color="#ffffff80" />
            <Text style={{ color: "#ffffff80", fontSize: 13 }}>{item.location || "—"}</Text>
          </View>
          <View style={{ width: 1, height: 12, backgroundColor: "#ffffff20" }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="construct-outline" size={13} color="#ffffff80" />
            <Text style={{ color: "#ffffff80", fontSize: 13 }}>
              {item.spare_count ?? 0} {t("spare_parts")}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => Alert.alert("Stampa", "Non disponibile su mobile")}
        style={{ paddingHorizontal: 16, alignItems: "center", justifyContent: "center",
          borderLeftWidth: 1, borderLeftColor: "#ffffff10" }}>
        <Ionicons name="print-outline" size={20} color="#ffffff60" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Locations Page ───────────────────────────────────────────────────────────
export default function LocationsPage() {
  const { t } = useTranslation("maintenance");
  const user   = useSelector((s: RootState) => s.auth?.user) as any;
  const shipId = String(user?.teamInfo?.assignedShip?.id || "");
  const { isTablet } = useDevice();

  const [locations,  setLocations]  = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [isOnline,   setIsOnline]   = useState(true);
  const [fromCache,  setFromCache]  = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search,     setSearch]     = useState("");

  // ── Monitor connettività ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Caricamento: API → cache → fallback ────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);

    const key = LOCATIONS_CACHE(shipId);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    if (online) {
      try {
        const data = await fetchLocations(shipId, String(user.id));
        // Riunisce dati live + eventuali ottimistici pendenti non ancora confermati
        const pendingRaw = await AsyncStorage.getItem(PENDING_LOCATIONS(shipId)).catch(() => null);
        const pendingQueue: any[] = pendingRaw ? JSON.parse(pendingRaw) : [];
        const pendingItems = locations.filter((l) => l._pending);
        setLocations([...data, ...pendingItems]);
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
      const cached: any[] = raw ? JSON.parse(raw) : [];
      // Recupera anche gli ottimistici pendenti dal queue
      const pendingRaw = await AsyncStorage.getItem(PENDING_LOCATIONS(shipId)).catch(() => null);
      const queue: any[] = pendingRaw ? JSON.parse(pendingRaw) : [];
      const pendingItems = queue.map((q) => ({
        id: q.tempId || `temp_${q.location}`,
        location: q.location,
        spare_count: 0,
        warehouseInfo: { id: q.warehouse, name: q.warehouse },
        _pending: true,
      }));
      setLocations([...cached, ...pendingItems]);
      setFromCache(cached.length > 0);
    } catch {
      setLocations([]);
    }
  };

  useEffect(() => { load(); }, [user]);

  // ── Sync delle location pendenti quando torna online ──────────────────────
  useEffect(() => {
    if (!isOnline || !shipId) return;
    const syncPending = async () => {
      try {
        const raw = await AsyncStorage.getItem(PENDING_LOCATIONS(shipId));
        if (!raw) return;
        const queue: any[] = JSON.parse(raw);
        if (!queue.length) return;

        // Invia in sequenza
        for (const item of queue) {
          const { tempId, ...payload } = item;
          await addLocationApi(payload);
        }
        await AsyncStorage.removeItem(PENDING_LOCATIONS(shipId));
        // Ricarica dalla API per avere i dati confermati
        load(true);
      } catch {}
    };
    syncPending();
  }, [isOnline]);

  // ── Aggiunta ottimistica dalla CreateLocationModal ─────────────────────────
  const handleAddOptimistic = (newItem: any) => {
    setLocations((prev) => [newItem, ...prev]);
    // Aggiorna anche la cache locale con il nuovo item
    AsyncStorage.getItem(LOCATIONS_CACHE(shipId))
      .then((raw) => {
        const cached = raw ? JSON.parse(raw) : [];
        if (!newItem._pending) {
          // Online: item confermato, aggiunge alla cache
          AsyncStorage.setItem(LOCATIONS_CACHE(shipId), JSON.stringify([newItem, ...cached]));
        }
      })
      .catch(() => {});
  };

  const filtered = locations.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.warehouseInfo?.name?.toLowerCase().includes(q) || l.location?.toLowerCase().includes(q);
  });

  const pendingCount = locations.filter((l) => l._pending).length;

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
              Offline{pendingCount > 0 ? ` · ${pendingCount} ${pendingCount === 1 ? "posizione in attesa" : "posizioni in attesa"}` : ""}
            </Text>
          </View>
        )}

        {/* Banner sync completata */}
        {isOnline && fromCache && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Aggiornamento in corso...
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center",
          marginTop: (!isOnline || fromCache) ? 8 : 16, marginBottom: 14, gap: 10 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", flex: 1 }}>
            {t("locations")}{!loading ? ` (${filtered.length})` : ""}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(app)/spare" as any)}
            style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 9,
              borderWidth: 1, borderColor: "#ffffff20" }}>
            <Ionicons name="flask-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCreateOpen(true)}
            style={{ backgroundColor: "#789fd6", borderRadius: 8,
              paddingHorizontal: 14, paddingVertical: 9,
              flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{t("create_location")}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: "#022a52", borderRadius: 10, flexDirection: "row",
          alignItems: "center", paddingHorizontal: 12, marginBottom: 14,
          borderWidth: 1, borderColor: "#ffffff15" }}>
          <Ionicons name="search-outline" size={18} color="#ffffff80" />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder={`${t("search_by_plant")}`}
            placeholderTextColor="#ffffff40"
            style={{ flex: 1, color: "#fff", paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#ffffff60" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
            <Ionicons name="location-outline" size={64} color="#ffffff15" />
            <Text style={{ color: "#ffffff60", fontSize: 16, fontWeight: "600" }}>
              {search ? t("no_data_available") : t("locations")}
            </Text>
            {!search && (
              <TouchableOpacity onPress={() => setCreateOpen(true)}
                style={{ backgroundColor: "#789fd6", borderRadius: 8,
                  paddingHorizontal: 20, paddingVertical: 10 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{t("create_location")}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            numColumns={isTablet ? 2 : 1}
            columnWrapperStyle={isTablet ? { gap: 10 } : undefined}
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <LocationRow item={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <CreateLocationModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onAddOptimistic={handleAddOptimistic}
        locations={locations}
        shipId={shipId}
        userId={String(user?.id)}
        isOnline={isOnline}
      />
    </SafeAreaView>
  );
}