import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Pressable, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchSpare = async (id: string) => {
  const res = await api.get(`/spare/getSpare?id=${id}`);
  return res.data.spares || [];
};

const addProduct = async (spareId: string, userId: string, quantity: string, status: string) => {
  const res = await api.post("/cart/addProduct", {
    spare_id: spareId, user_id: userId, quantity, status,
  });
  return res.data.cartItem;
};

// ─── CartAdded Modal ──────────────────────────────────────────────────────────
function CartAddedModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }} onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", width: "85%", borderRadius: 12, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Aggiunto al carrello</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: "#fff", marginBottom: 20 }}>Prodotto aggiunto con successo al carrello.</Text>
          <TouchableOpacity
            onPress={() => { onClose(); router.push("/(app)/cart"); }}
            style={{ backgroundColor: "#ffffff10", borderRadius: 8, padding: 14, alignItems: "center", marginBottom: 10 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Vai al carrello</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Aggiungi altri prodotti</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── NoteModal ────────────────────────────────────────────────────────────────
function NoteModal({ visible, onClose, spareId }: { visible: boolean; onClose: () => void; spareId: string }) {
  const [type, setType] = useState<"text" | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api.post("/uploadFiles/uploadTextGeneral", {
        content: text.trim(), failureId: spareId, type: "maintenance",
      });
      Alert.alert("Successo", "Nota inviata");
      setText("");
      setType(null);
      onClose();
    } catch {
      Alert.alert("Errore", "Impossibile inviare la nota");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setType(null); setText(""); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={reset}>
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Aggiungi nota</Text>
            <TouchableOpacity onPress={reset}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {!type && (
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              {[
                { id: "text", icon: "document-text-outline", label: "Testo" },
                { id: "photo", icon: "camera-outline", label: "Foto" },
                { id: "vocal", icon: "mic-outline", label: "Audio" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => item.id === "text" ? setType("text") : Alert.alert("Info", "Funzione disponibile nel build nativo")}
                  style={{ flex: 1, backgroundColor: "#001c38", borderRadius: 10, padding: 16, alignItems: "center" }}
                >
                  <Ionicons name={item.icon as any} size={32} color="#789fd6" />
                  <Text style={{ color: "#fff", marginTop: 8, fontSize: 13 }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {type === "text" && (
            <>
              <TextInput
                value={text} onChangeText={setText}
                placeholder="Scrivi la nota..." placeholderTextColor="#6b7280"
                multiline numberOfLines={4}
                style={{ backgroundColor: "#001c38", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 16, minHeight: 100, textAlignVertical: "top" }}
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => setType(null)} style={{ flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: 14, alignItems: "center" }}>
                  <Text style={{ color: "#001c38", fontWeight: "600" }}>Indietro</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ flex: 1, backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Invia</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          {!type && (
            <TouchableOpacity onPress={reset} style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 4 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Chiudi</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: "#fff", fontSize: 15 }}>{String(value)}</Text>
    </View>
  );
}

// ─── Spare Detail Page ────────────────────────────────────────────────────────
export default function SpareDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth?.user);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteModal, setNoteModal] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchSpare(id)
      .then(setData)
      .catch(() => Alert.alert("Errore", "Impossibile caricare il ricambio"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!data || data.length === 0 || !user) return;
    try {
      await addProduct(String(data[0].id), String(user.id), "1", "in_attesa");
      setCartAdded(true);
    } catch {
      Alert.alert("Errore", "Impossibile aggiungere al carrello");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </SafeAreaView>
    );
  }

  const d = data?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        {/* Titolo + azioni */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 12, gap: 10 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 }} numberOfLines={2}>
            {d?.Part_name || "Ricambio"}
          </Text>
          <TouchableOpacity
            onPress={() => setNoteModal(true)}
            style={{ backgroundColor: "#022a52", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Nota</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Aggiungi</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Dettagli principali */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <InfoRow label="Part Number" value={d?.part?.Part_Number} />
            <InfoRow label="Nome originale" value={d?.Part_name} />
            <InfoRow label="Q. installata" value={d?.quantity} />
            <InfoRow label="EAN13" value={d?.ean13 > 0 ? d.ean13 : null} />
            <InfoRow label="NCAGE costruttore" value={d?.NCAGE > 0 ? d.NCAGE : null} />
          </View>

          {/* Prezzi e fornitore */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <InfoRow label="Prezzo unitario" value={d?.Unitary_price ? `${d.Unitary_price} €` : null} />
            <InfoRow label="Lead time" value={d?.Provisioning_Lead_Time_PLT > 0 ? d.Provisioning_Lead_Time_PLT : null} />
            <InfoRow label="Fornitore" value={d?.company > 0 ? d.company : null} />
            <InfoRow label="NCAGE fornitore" value={d?.NCAGE_supplier > 0 ? d.NCAGE_supplier : null} />
          </View>

          {/* Descrizione */}
          {d?.description && (
            <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>Descrizione</Text>
              <Text style={{ color: "#fff", fontSize: 14, lineHeight: 22 }}>{d.description}</Text>
            </View>
          )}

          {/* Sistema/Componente */}
          {d?.elementModel?.ESWBS_code && (
            <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>Sistema / Componente</Text>
              <Text style={{ color: "#fff", fontSize: 14 }}>
                {d.elementModel.ESWBS_code} {d?.part?.Part_name}
              </Text>
            </View>
          )}

          {/* Link carrello */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/cart")}
            style={{
              backgroundColor: "#022a52", borderRadius: 12, padding: 16,
              flexDirection: "row", alignItems: "center", marginBottom: 24,
            }}
          >
            <Ionicons name="cart-outline" size={18} color="#789fd6" style={{ marginRight: 10 }} />
            <Text style={{ color: "#fff", fontSize: 15 }}>In ordine</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <NoteModal visible={noteModal} onClose={() => setNoteModal(false)} spareId={String(id)} />
      <CartAddedModal visible={cartAdded} onClose={() => setCartAdded(false)} />
    </SafeAreaView>
  );
}