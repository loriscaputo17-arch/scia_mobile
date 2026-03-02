import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";

// ─── API ──────────────────────────────────────────────────────────────────────
const getCart = async (shipId: string, userId: string) => {
  const res = await api.get(`/cart/getCart?ship_id=${shipId}&user_id=${userId}`);
  return res.data.cart || [];
};

const removeProductFromCart = async (id: string) => {
  const res = await api.delete(`/cart/removeProduct/${id}`);
  return res.data;
};

const updateProductQuantity = async (id: string, quantity: number) => {
  const res = await api.put(`/cart/updateProduct/${id}`, { quantity });
  return res.data.cartItem;
};

// ─── QuantityControl ──────────────────────────────────────────────────────────
function QuantityControl({ quantity, spareId }: { quantity: number; spareId: string }) {
  const [qty, setQty] = useState(quantity);
  const [loading, setLoading] = useState(false);

  const update = async (newQty: number) => {
    setLoading(true);
    try {
      await updateProductQuantity(spareId, newQty);
      setQty(newQty);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => qty > 1 && update(qty - 1)}
        disabled={loading || qty <= 1}
        style={{ backgroundColor: "#001c38", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>−</Text>
      </TouchableOpacity>
      <Text style={{ color: "#fff", fontSize: 16, paddingHorizontal: 16 }}>{qty}</Text>
      <TouchableOpacity
        onPress={() => update(qty + 1)}
        disabled={loading}
        style={{ backgroundColor: "#001c38", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── CartRow ──────────────────────────────────────────────────────────────────
function CartRow({ data, onRemove }: { data: any; onRemove: (id: string) => void }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    Alert.alert("Rimuovi prodotto", "Sei sicuro di voler rimuovere questo prodotto?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Rimuovi", style: "destructive",
        onPress: async () => {
          setRemoving(true);
          try {
            await removeProductFromCart(data.spare.ID);
            onRemove(data.spare.ID);
          } catch (e) {
            Alert.alert("Errore", "Impossibile rimuovere il prodotto");
          } finally {
            setRemoving(false);
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/spare/${data.spare.ID}` as any)}
      style={{
        backgroundColor: "#022a52", borderRadius: 10,
        padding: 16, marginBottom: 10,
        flexDirection: "row", alignItems: "center", gap: 12,
      }}
    >
      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
          {data?.spare?.Part_name ?? "Nome non disponibile"}
        </Text>
        <Text style={{ color: "#789fd6", fontSize: 13, marginTop: 4 }}>
          {data?.spare?.part?.Part_Number ?? "—"}
        </Text>
        <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>
          {data?.spare?.part?.organizationCompanyNCAGE?.NCAGE_Code ?? "—"}
        </Text>
      </View>

      {/* Quantità */}
      <QuantityControl quantity={data.quantity} spareId={data.spare.ID} />

      {/* Rimuovi */}
      <TouchableOpacity onPress={handleRemove} disabled={removing} style={{ padding: 8 }}>
        {removing
          ? <ActivityIndicator size="small" color="#ef4444" />
          : <Ionicons name="trash-outline" size={20} color="#ef4444" />
        }
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
export default function CartPage() {
  const user = useSelector((state: RootState) => state.auth?.user);
  const [cartData, setCartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const shipId = (user as any)?.teamInfo?.assignedShip?.id || (user as any)?.team?.id;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await getCart(String(shipId), String(user.id));
        setCartData(data);
      } catch (e) {
        setError("Errore nel recupero del carrello");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleRemove = (spareId: string) => {
    setCartData((prev) => prev.filter((item) => item.spare.ID !== spareId));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 16, marginBottom: 12 }}>
          Carrello
        </Text>

        {loading ? (
          <ActivityIndicator color="#789fd6" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: "#ef4444", textAlign: "center", marginTop: 40 }}>{error}</Text>
        ) : cartData.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="cart-outline" size={64} color="#789fd6" />
            <Text style={{ color: "#789fd6", fontSize: 16, marginTop: 16 }}>Il carrello è vuoto</Text>
          </View>
        ) : (
          <FlatList
            data={cartData}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <CartRow data={item} onRemove={handleRemove} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}