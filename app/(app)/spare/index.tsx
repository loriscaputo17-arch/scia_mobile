import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, TextInput, Modal, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { router } from "expo-router";
import MoveProductModal from "@/components/spare/MoveProductModal";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineAction } from "@/hooks/useOfflineAction";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchSpares = async (shipId: string) => {
  const res = await api.get(`/spare/getSpares?ship_id=${shipId}`);
  return res.data.spares || [];
};

const SPARES_CACHE = (shipId: string) => `cache_spares_${shipId}`;

const getQuantitySum = (q?: string) => {
  if (!q) return 0;
  return q.split(",").map((v) => parseFloat(v)).filter((v) => !isNaN(v)).reduce((a, b) => a + b, 0);
};

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, filters, onApply }: {
  visible: boolean; onClose: () => void; filters: any; onApply: (f: any) => void;
}) {
  const { t } = useTranslation("maintenance");
  const [local, setLocal] = useState(filters);
  useEffect(() => setLocal(filters), [filters]);

  const toggle = (cat: string, key: string) =>
    setLocal((p: any) => ({ ...p, [cat]: { ...p[cat], [key]: !p[cat][key] } }));

  const stockItems = [
    { key: "inGiacenza",    label: t("stock") },
    { key: "nonDisponibile", label: t("no_warehouse") },
  ];
  const warehouseItems = [
    { key: "onboard",  label: "A bordo" },
    { key: "dockside", label: "In banchina" },
    { key: "drydock",  label: "In bacino" },
    { key: "external", label: "Esterno" },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 300,
          backgroundColor: "#022a52", padding: 24, paddingTop: 80 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>{t("filters")}</Text>

          <Text style={{ color: "#789fd6", marginBottom: 10 }}>{t("stock")}</Text>
          {stockItems.map((item) => (
            <TouchableOpacity key={item.key} onPress={() => toggle("task", item.key)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <Text style={{ color: "#fff", flex: 1 }}>{item.label}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.task[item.key] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.task[item.key] ? "#789fd6" : "transparent" }} />
            </TouchableOpacity>
          ))}

          <Text style={{ color: "#789fd6", marginBottom: 10, marginTop: 16 }}>{t("warehouse")}</Text>
          {warehouseItems.map((item) => (
            <TouchableOpacity key={item.key} onPress={() => toggle("magazzino", item.key)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <Text style={{ color: "#fff", flex: 1 }}>{item.label}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.magazzino[item.key] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.magazzino[item.key] ? "#789fd6" : "transparent" }} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => { onApply(local); onClose(); }}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 24 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("confirm")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Cart Added Modal ─────────────────────────────────────────────────────────
function CartAddedModal({ visible, onClose, isOffline }: {
  visible: boolean; onClose: () => void; isOffline: boolean;
}) {
  const { t } = useTranslation("maintenance");
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}
        onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("added_to_the_cart")}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {/* Messaggio contestuale offline */}
          {isOffline ? (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10, marginBottom: 16,
              flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12, flex: 1 }}>
                Offline — aggiunto alla coda, sarà sincronizzato quando online
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#ffffff80", marginBottom: 20 }}>{t("added_cart_text")}</Text>
          )}

          {!isOffline && (
            <TouchableOpacity onPress={() => { onClose(); router.push("/(app)/cart" as any); }}
              style={{ backgroundColor: "#ffffff15", borderRadius: 8, padding: 14,
                alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>{t("go_to_cart")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>{t("add_other_products")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Spare Row ────────────────────────────────────────────────────────────────
function SpareRow({ item, userId, onCartAdded, isOnline }: {
  item: any; userId: string; onCartAdded: (offline: boolean) => void; isOnline: boolean;
}) {
  const { t } = useTranslation("maintenance");
  const { execute } = useOfflineAction();
  const [addingToCart, setAddingToCart] = useState(false);

  const qty = getQuantitySum(item.quantity);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await execute({
      type: "ADD_TO_CART",
      payload: {
        spare_id: String(item.ID),
        user_id: userId,
        quantity: "1",
        status: "in_attesa",
      },
      optimistic: () => onCartAdded(!isOnline),
    });
    setAddingToCart(false);
  };

  return (
    <View style={{ backgroundColor: "#022a52", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <TouchableOpacity onPress={() => router.push(`/(app)/spare/${item.ID}` as any)} style={{ padding: 14 }}>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 4 }} numberOfLines={1}>
          {item.Part_name ? item.Part_name : t("name_not_available")}
        </Text>
        {item.elementModel?.ESWBS_code && (
          <Text style={{ color: "#ffffff80", fontSize: 13, marginBottom: 6 }}>
            {item.elementModel.ESWBS_code}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ backgroundColor: qty > 0 ? "#2DB64722" : "#D0021B22",
            borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ color: qty > 0 ? "#2DB647" : "#D0021B", fontSize: 12, fontWeight: "600" }}>
              {t("quantity")}: {qty}
            </Text>
          </View>
          {item.part?.Part_Number && (
            <Text style={{ color: "#ffffff80", fontSize: 12 }} numberOfLines={1}>
              PN: {item.part.Part_Number}
            </Text>
          )}
          {item.locations?.length > 0 && (
            <Text style={{ color: "#789fd6", fontSize: 12 }}>
              <Ionicons name="location-outline" size={12} /> {item.locations.length} {t("locations")}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAddToCart} disabled={addingToCart}
        style={{ backgroundColor: "#ffffff10", paddingVertical: 10, alignItems: "center",
          flexDirection: "row", justifyContent: "center", gap: 8 }}>
        {addingToCart
          ? <ActivityIndicator size="small" color="#fff" />
          : <>
              <Ionicons
                name={isOnline ? "cart-outline" : "cloud-offline-outline"}
                size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                {isOnline ? t("added_to_the_cart") : t("added_to_the_cart") + " (offline)"}
              </Text>
            </>
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Spare Page ───────────────────────────────────────────────────────────────
export default function SparePage() {
  const { t } = useTranslation("maintenance");
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { isTablet } = useDevice();

  const [spares,      setSpares]      = useState<any[]>([]);
  const [filtered,    setFiltered]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [isOnline,    setIsOnline]    = useState(true);
  const [fromCache,   setFromCache]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [cartAdded,   setCartAdded]   = useState(false);
  const [cartOffline, setCartOffline] = useState(false);
  const [moveOpen,    setMoveOpen]    = useState(false);
  const [filters, setFilters] = useState({
    task: { inGiacenza: false, nonDisponibile: false },
    magazzino: { onboard: false, dockside: false, drydock: false, external: false },
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
    if (!shipId) return;
    if (!silent) setLoading(true);

    const key = SPARES_CACHE(shipId);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    if (online) {
      try {
        const data = await fetchSpares(shipId);
        setSpares(data);
        setFromCache(false);
        await AsyncStorage.setItem(key, JSON.stringify(data));
      } catch {
        await loadFromCache(key);
      }
    } else {
      await loadFromCache(key);
    }

    if (!silent) setLoading(false);
  }, [shipId]);

  const loadFromCache = async (key: string) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) { setSpares(JSON.parse(raw)); setFromCache(true); }
      else { setSpares([]); setFromCache(true); }
    } catch { setSpares([]); }
  };

  useEffect(() => { load(); }, [shipId]);

  // ── Ricarica live quando torna online ─────────────────────────────────────
  useEffect(() => {
    if (isOnline && fromCache) load(true);
  }, [isOnline]);

  // ── Filtri ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let result = spares;
    if (search.trim())
      result = result.filter((s) => s.Part_name?.toLowerCase().includes(search.toLowerCase()));

    const qty = (s: any) => getQuantitySum(s.quantity);
    if (filters.task.inGiacenza)     result = result.filter((s) => qty(s) > 0);
    if (filters.task.nonDisponibile) result = result.filter((s) => qty(s) <= 0);

    const warehouseActive = Object.values(filters.magazzino).some(Boolean);
    if (warehouseActive) {
      result = result.filter((s) =>
        (s.warehouses || []).some((w: any) => {
          const n = w.name?.toLowerCase() || "";
          return (
            (filters.magazzino.onboard  && n.includes("a bordo"))    ||
            (filters.magazzino.dockside && n.includes("banchina"))   ||
            (filters.magazzino.drydock  && n.includes("bacino"))     ||
            (filters.magazzino.external && n.includes("fornitore"))
          );
        })
      );
    }
    setFiltered(result);
  }, [search, filters, spares]);

  const totalQty     = spares.reduce((acc, s) => acc + getQuantitySum(s.quantity), 0);
  const activeFilters = [...Object.values(filters.task), ...Object.values(filters.magazzino)].filter(Boolean).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View
        style={{
          flex: 1,
          padding: isTablet ? 24 : 16,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 1200 : "100%",
        }}
      >
        <DashboardHeader />

        {/* Banner offline */}
        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — catalogo dalla cache · aggiunte al carrello in coda
            </Text>
          </View>
        )}

        {/* Banner aggiornamento */}
        {isOnline && fromCache && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Aggiornamento catalogo...
            </Text>
          </View>
        )}

        <View style={{ marginTop: (!isOnline || fromCache) ? 8 : 16, marginBottom: 12 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
            {t("spare_parts_catalogue")} ({totalQty})
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => setMoveOpen(true)}
              style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8 }}>
              <Ionicons name="add-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(app)/locations" as any)}
              style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#022a52",
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
              <Ionicons name="flag-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(app)/scan" as any)}
              style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8 }}>
              <Ionicons name="barcode-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterOpen(true)}
              style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8, position: "relative" }}>
              <Ionicons name="filter-outline" size={20} color="#fff" />
              {activeFilters > 0 && (
                <View style={{ position: "absolute", top: 2, right: 2, backgroundColor: "#789fd6",
                  borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>{activeFilters}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ backgroundColor: "#022a52", borderRadius: 8, flexDirection: "row",
          alignItems: "center", paddingHorizontal: 12, marginBottom: 12 }}>
          <Ionicons name="search-outline" size={18} color="#ffffff80" />
          <TextInput value={search} onChangeText={setSearch}
            placeholder={t("search_by_name")} placeholderTextColor="#6b7280"
            style={{ flex: 1, color: "#fff", padding: 10 }} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#ffffff80" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="construct-outline" size={64} color="#789fd6" />
            <Text style={{ color: "#789fd6", marginTop: 16, fontSize: 16 }}>
              {fromCache && !search ? "Nessun dato in cache" : t("no_data_available")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.ID)}
            renderItem={({ item }) => (
              <SpareRow
                item={item}
                userId={String(user?.id)}
                isOnline={isOnline}
                onCartAdded={(offline) => { setCartOffline(offline); setCartAdded(true); }}
              />
            )}
            showsVerticalScrollIndicator={false}
            numColumns={isTablet ? 2 : 1}
            columnWrapperStyle={isTablet ? { gap: 10 } : undefined}
            contentContainerStyle={isTablet ? { gap: 10 } : undefined}
          />
        )}
      </View>

      <FilterModal  visible={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onApply={setFilters} />
      <CartAddedModal visible={cartAdded} onClose={() => setCartAdded(false)} isOffline={cartOffline} />
      <MoveProductModal visible={moveOpen} onClose={() => setMoveOpen(false)} />
    </SafeAreaView>
  );
}