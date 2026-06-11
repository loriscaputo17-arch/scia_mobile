import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const getCart = async (shipId: string, userId: string) => {
  const res = await api.get(`/cart/getCart?ship_id=${shipId}&user_id=${userId}`);
  return res.data.cart || [];
};
const removeProductFromCartApi = async (id: string) =>
  (await api.delete(`/cart/removeProduct/${id}`)).data;
const updateProductQuantityApi = async (id: string, quantity: number) =>
  (await api.put(`/cart/updateProduct/${id}`, { quantity })).data.cartItem;

// Helper: il backend a volte ritorna `spare`, a volte `Spare` (capitalizzato).
const getSpare = (item: any) => item?.spare ?? item?.Spare ?? null;

// ─── Cache / pending keys ─────────────────────────────────────────────────────
const CART_CACHE   = (shipId: string) => `cache_wishlist_${shipId}`;

// ─── QuantityControl ──────────────────────────────────────────────────────────
function QuantityControl({ quantity, spareId, isOnline, onOptimisticChange }: {
  quantity: number; spareId: string;
  isOnline: boolean;
  onOptimisticChange: (id: string, qty: number) => void;
}) {
  const [qty,     setQty]     = useState(quantity);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setQty(quantity); }, [quantity]);

  const update = async (newQty: number) => {
    if (newQty < 1) return;
    setLoading(true);
    setQty(newQty);
    onOptimisticChange(spareId, newQty);

    if (isOnline) {
      try {
        await updateProductQuantityApi(spareId, newQty);
      } catch {
        setQty(qty);
        onOptimisticChange(spareId, qty);
      }
    }
    setLoading(false);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={() => update(qty - 1)} disabled={loading || qty <= 1}
        style={{ backgroundColor: "#001c38", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6,
          opacity: qty <= 1 ? 0.4 : 1 }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>−</Text>
      </TouchableOpacity>
      <Text style={{ color: "#fff", fontSize: 16, paddingHorizontal: 16 }}>{qty}</Text>
      <TouchableOpacity onPress={() => update(qty + 1)} disabled={loading}
        style={{ backgroundColor: "#001c38", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── WishlistRow ──────────────────────────────────────────────────────────────
function WishlistRow({ data, onRemove, onQtyChange, isOnline }: {
  data: any;
  onRemove: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  isOnline: boolean;
}) {
  const [removing, setRemoving] = useState(false);
  const spare = getSpare(data);
  const spareId = spare?.ID;

  const handleRemove = () => {
    Alert.alert("Rimuovi prodotto", "Sei sicuro di voler rimuovere questo prodotto?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Rimuovi", style: "destructive",
        onPress: async () => {
          setRemoving(true);
          onRemove(spareId);
          if (isOnline) {
            try {
              await removeProductFromCartApi(spareId);
            } catch {
              Alert.alert("Attenzione", "Rimozione non sincronizzata, riprova.");
            }
          }
          setRemoving(false);
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={() => spareId && router.push(`/(app)/spare/${spareId}` as any)}
      style={{ backgroundColor: "#022a52", borderRadius: 10, padding: 16,
        marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
          {spare?.Part_name ?? "Nome non disponibile"}
        </Text>
        <Text style={{ color: "#789fd6", fontSize: 13, marginTop: 4 }}>
          {spare?.Serial_number.length > 15
                ? spare?.Serial_number.slice(0, 15) + "..."
                : spare?.Serial_number}
        </Text>
        <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>
          {spare?.part?.organizationCompanyNCAGE?.NCAGE_Code ?? "Nome non disponibile"}
        </Text>
        {data._dirty && !isOnline && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Ionicons name="cloud-upload-outline" size={11} color="#F47216" />
            <Text style={{ color: "#F47216", fontSize: 10 }}>Modifica in attesa</Text>
          </View>
        )}
      </View>

      <QuantityControl
        quantity={data.quantity}
        spareId={spareId}
        isOnline={isOnline}
        onOptimisticChange={onQtyChange}
      />

      <TouchableOpacity onPress={handleRemove} disabled={removing} style={{ padding: 8 }}>
        {removing
          ? <ActivityIndicator size="small" color="#ef4444" />
          : <Ionicons name="trash-outline" size={20} color="#ef4444" />
        }
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Wishlist Page ────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { t } = useTranslation("cart");
  const user = useSelector((state: RootState) => state.auth?.user);
  const { isTablet } = useDevice();

  const [cartData,  setCartData]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [isOnline,  setIsOnline]  = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [search,    setSearch]    = useState("");

  const shipId = String((user as any)?.teamInfo?.assignedShip?.id || (user as any)?.team?.id || "");

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  const persistCache = useCallback((data: any[]) => {
    AsyncStorage.setItem(CART_CACHE(shipId), JSON.stringify(data)).catch(() => {});
  }, [shipId]);

  useEffect(() => {
    if (!user) return;
    const key = CART_CACHE(shipId);

    const load = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      if (online) {
        try {
          const data = await getCart(shipId, String(user.id));
          setCartData(data);
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
        if (raw) { setCartData(JSON.parse(raw)); setFromCache(true); }
        else { setCartData([]); setFromCache(true); }
      } catch { setCartData([]); setError("Cache non disponibile"); }
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!isOnline || !fromCache || !user) return;
    getCart(shipId, String(user.id))
      .then(async (data) => {
        setCartData(data);
        setFromCache(false);
        await AsyncStorage.setItem(CART_CACHE(shipId), JSON.stringify(data));
      })
      .catch(() => {});
  }, [isOnline]);

  const handleRemove = useCallback((spareId: string) => {
    setCartData((prev) => {
      const updated = prev.filter((item) => getSpare(item)?.ID !== spareId);
      persistCache(updated);
      return updated;
    });
  }, [persistCache]);

  const handleQtyChange = useCallback((spareId: string, qty: number) => {
    setCartData((prev) => {
      const updated = prev.map((item) =>
        getSpare(item)?.ID === spareId
          ? { ...item, quantity: qty, _dirty: !isOnline }
          : item
      );
      persistCache(updated);
      if (isOnline) {
        updateProductQuantityApi(spareId, qty).catch(() => {});
      }
      return updated;
    });
  }, [isOnline, persistCache]);

  useEffect(() => {
    if (!isOnline) return;
    const dirtyItems = cartData.filter((item) => item._dirty);
    if (!dirtyItems.length) return;
    Promise.allSettled(
      dirtyItems.map((item) => updateProductQuantityApi(getSpare(item)?.ID, item.quantity))
    ).then(() => {
      setCartData((prev) => prev.map((item) => ({ ...item, _dirty: false })));
    });
  }, [isOnline]);

  // Filtro ricerca per nome/part number
  const filtered = search.trim()
    ? cartData.filter((item) => {
        const sp = getSpare(item);
        const low = search.toLowerCase();
        return (
          sp?.Part_name?.toLowerCase().includes(low) ||
          String(sp?.part?.Part_Number || "").toLowerCase().includes(low)
        );
      })
    : cartData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: isTablet ? 24 : 16, alignSelf: "center",
        width: "100%", maxWidth: isTablet ? 1100 : "100%" }}>
        <DashboardHeader />

        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — modifiche salvate localmente
            </Text>
          </View>
        )}
        {isOnline && fromCache && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Aggiornamento...</Text>
          </View>
        )}

        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700",
          marginTop: (!isOnline || fromCache) ? 8 : 16, marginBottom: 12 }}>
          {t("cart")}{cartData.length > 0 ? ` (${cartData.length})` : ""}
        </Text>

        {/* Search */}
        {cartData.length > 0 && (
          <View style={{ backgroundColor: "#022a52", borderRadius: 8, flexDirection: "row",
            alignItems: "center", paddingHorizontal: 12, marginBottom: 12 }}>
            <Ionicons name="search-outline" size={18} color="#ffffff80" />
            <TextInput value={search} onChangeText={setSearch}
              placeholder={t("name")} placeholderTextColor="#6b7280"
              style={{ flex: 1, color: "#fff", padding: 10 }} />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#ffffff80" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {loading ? (
          <ActivityIndicator color="#789fd6" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: "#ef4444", textAlign: "center", marginTop: 40 }}>{error}</Text>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="cart-outline" size={64} color="#789fd6" />
            <Text style={{ color: "#789fd6", fontSize: 16, marginTop: 16 }}>
              {search ? "Nessun risultato" : fromCache ? "Cache vuota" : "La wishlist è vuota"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <WishlistRow
                data={item}
                onRemove={handleRemove}
                onQtyChange={handleQtyChange}
                isOnline={isOnline}
              />
            )}
            showsVerticalScrollIndicator={false}
            numColumns={isTablet ? 2 : 1}
            columnWrapperStyle={isTablet ? { gap: 10 } : undefined}
            contentContainerStyle={isTablet ? { gap: 10 } : undefined}
          />
        )}
      </View>
    </SafeAreaView>
  );
}