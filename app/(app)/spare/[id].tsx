import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Pressable, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import NoteModal from "@/components/organisms/NoteModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Pdf from "react-native-pdf";
import RNBlobUtil from "react-native-blob-util";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineAction } from "@/hooks/useOfflineAction";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchSpare = async (id: string) => {
  const res = await api.get(`/spare/getSpare?id=${id}`);
  return res.data.spares || [];
};

const SPARE_CACHE = (id: string) => `cache_spare_detail_${id}`;

// ─── PDF Viewer Modal ─────────────────────────────────────────────────────────
function PdfViewerModal({ visible, onClose, url, title, isOnline }: {
  visible: boolean; onClose: () => void;
  url: string | null; title?: string; isOnline: boolean;
}) {
  const { t } = useTranslation("maintenance");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [source,     setSource]     = useState<{ uri: string } | null>(null);

  useEffect(() => {
    if (!visible || !url) return;
    setSource(null);
    setPdfLoading(true);
    const dlUrl = url.split("#")[0];
    const safe  = (dlUrl.split("/").pop() || "doc").replace(/[^a-zA-Z0-9._-]/g, "_");
    const path  = `${RNBlobUtil.fs.dirs.CacheDir}/${safe}.pdf`;

    (async () => {
      try {
        const exists = await RNBlobUtil.fs.exists(path);
        if (exists) {
          setSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
        } else if (isOnline) {
          await RNBlobUtil.config({ path, fileCache: true }).fetch("GET", dlUrl);
          setSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
        } else {
          // Offline e non in cache
          setSource(null);
        }
      } catch { setSource({ uri: dlUrl }); }
      finally   { setPdfLoading(false); }
    })();
  }, [visible, url]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
        <View style={{ flexDirection: "row", alignItems: "center",
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 14 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 }} numberOfLines={1}>
            {title || t("see_files")}
          </Text>
        </View>

        {pdfLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
            <ActivityIndicator color="#789fd6" size="large" />
            <Text style={{ color: "#789fd6" }}>{t("loading")}</Text>
          </View>
        ) : source ? (
          <Pdf source={source} style={{ flex: 1, backgroundColor: "#001c38" }}
            onError={() => Alert.alert("Errore", "Impossibile aprire il PDF")}
            trustAllCerts={false} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
            <Ionicons
              name={!isOnline ? "cloud-offline-outline" : "document-outline"}
              size={56} color="#ffffff40" />
            <Text style={{ color: "#ffffff60", marginTop: 4, textAlign: "center", paddingHorizontal: 32 }}>
              {!isOnline
                ? "PDF non disponibile offline.\nConnettiti per scaricarlo."
                : t("no_data_available")}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── CartAdded Modal ──────────────────────────────────────────────────────────
function CartAddedModal({ visible, onClose, isOffline }: {
  visible: boolean; onClose: () => void; isOffline: boolean;
}) {
  const { t } = useTranslation("maintenance");
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center", alignItems: "center" }} onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", width: "85%", borderRadius: 12, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("added_to_the_cart")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {isOffline ? (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10,
              marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12, flex: 1 }}>
                Offline — sarà aggiunto al carrello quando online
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#fff", marginBottom: 20 }}>{t("added_cart_text")}</Text>
          )}

          {!isOffline && (
            <TouchableOpacity onPress={() => { onClose(); router.push("/(app)/cart"); }}
              style={{ backgroundColor: "#ffffff10", borderRadius: 8,
                padding: 14, alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>{t("go_to_cart")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {isOffline ? "OK" : t("add_other_products")}
            </Text>
          </TouchableOpacity>
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
  const { t } = useTranslation("maintenance");
  const { execute } = useOfflineAction();
  const { isTablet } = useDevice();

  const [data,       setData]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [isOnline,   setIsOnline]   = useState(true);
  const [fromCache,  setFromCache]  = useState(false);
  const [noteModal,  setNoteModal]  = useState(false);
  const [cartAdded,  setCartAdded]  = useState(false);
  const [cartOffline,setCartOffline]= useState(false);
  const [pdfOpen,    setPdfOpen]    = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  // ── Monitor connettività ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Caricamento: API → cache → fallback ───────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const key = SPARE_CACHE(id);

    const load = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      if (online) {
        try {
          const fetched = await fetchSpare(id);
          setData(fetched);
          setFromCache(false);
          await AsyncStorage.setItem(key, JSON.stringify(fetched));
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
        if (raw) { setData(JSON.parse(raw)); setFromCache(true); }
        else { setData([]); setFromCache(true); }
      } catch { setData([]); }
    };

    load();
  }, [id]);

  // ── Aggiungi al carrello ───────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!data || data.length === 0 || !user) return;
    setAddingCart(true);

    const spareId = String(data[0].ID ?? data[0].id);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    await execute({
      type: "ADD_TO_CART",
      payload: {
        spare_id: spareId,
        user_id: String(user.id),
        quantity: "1",
        status: "in_attesa",
      },
      optimistic: () => {
        setCartOffline(!online);
        setCartAdded(true);
      },
    });

    setAddingCart(false);
  };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#789fd6" size="large" />
    </SafeAreaView>
  );

  const d = data?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View
        style={{
          flex: 1,
          padding: isTablet ? 24 : 16,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 1100 : "100%",
        }}
      >
        <DashboardHeader />

        {/* Banner offline */}
        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline{fromCache ? " — dati dalla cache" : ""}
            </Text>
          </View>
        )}

        {/* Titolo + azioni */}
        <View style={{ flexDirection: "row", alignItems: "center",
          marginTop: !isOnline ? 8 : 16, marginBottom: 12, gap: 10 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 }} numberOfLines={2}>
            {d?.Part_name || t("name_not_available")}
          </Text>

          <TouchableOpacity onPress={() => setNoteModal(true)}
            style={{ backgroundColor: "#022a52", borderRadius: 8,
              paddingHorizontal: 12, paddingVertical: 8,
              flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{t("add_note")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddToCart} disabled={addingCart}
            style={{ backgroundColor: "#789fd6", borderRadius: 8,
              paddingHorizontal: 12, paddingVertical: 8,
              flexDirection: "row", alignItems: "center", gap: 6,
              opacity: addingCart ? 0.7 : 1 }}>
            {addingCart
              ? <ActivityIndicator size="small" color="#fff" />
              : <>
                  <Ionicons
                    name={isOnline ? "cart-outline" : "cloud-offline-outline"}
                    size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{t("add")}</Text>
                </>
            }
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Immagine + PDF */}
          <View style={{
            backgroundColor: "#022a52",
            borderRadius: 12,
            padding: isTablet ? 20 : 16,
            marginBottom: 12,
          }}>
            <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
              textTransform: "uppercase", marginBottom: 12 }}>{t("image")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: "#ffffff10",
                alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="cube-outline" size={36} color="#789fd6" />
              </View>
              {d?.documentFileUrl && (
                <TouchableOpacity onPress={() => setPdfOpen(true)}
                  style={{ backgroundColor: "#ffffff10", borderRadius: 8,
                    paddingHorizontal: 12, paddingVertical: 8,
                    flexDirection: "row", alignItems: "center", gap: 6,
                    opacity: !isOnline ? 0.6 : 1 }}>
                  <Ionicons
                    name={isOnline ? "document-outline" : "cloud-offline-outline"}
                    size={16} color="#789fd6" />
                  <Text style={{ color: "#fff", fontSize: 13 }}>{t("see_files")}</Text>
                  {d?.part?.Position_on_Document_file && (
                    <Text style={{ color: "#ffffff60", fontSize: 11 }}>
                      p.{d.part.Position_on_Document_file}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Dati tecnici */}
          <View style={{
            backgroundColor: "#022a52",
            borderRadius: 12,
            padding: isTablet ? 20 : 16,
            marginBottom: 12,
          }}>
            <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
              textTransform: "uppercase", marginBottom: 12 }}>{t("description")}</Text>
            <InfoRow label="Part Number"        value={d?.part?.Part_Number} />
            <InfoRow label={t("original_name")} value={d?.Part_name} />
            <InfoRow label={t("q_installed")}   value={d?.quantity} />
            <InfoRow label="Nr. serie"          value={d?.Serial_number !== "0" ? d?.Serial_number : null} />
            <InfoRow label="NSN"                value={d?.NSN} />
            <InfoRow label={t("costructor")}    value={d?.NCAGE > 0 ? String(d.NCAGE) : null} />
            <InfoRow label="Drawing Number"     value={d?.part?.Drawing_number} />
            <InfoRow label="Drawing Rev."       value={d?.part?.Drawing_number_revision_index} />
            {(d?.part?.Dimension_L || d?.part?.Dimension_W || d?.part?.Dimension_H) && (
              <InfoRow
                label="Dimensioni (L×W×H)"
                value={[d?.part?.Dimension_L, d?.part?.Dimension_W, d?.part?.Dimension_H]
                  .filter(Boolean).join(" × ") + " mm"}
              />
            )}
          </View>

          {/* EAN13 */}
          {d?.ean13 > 0 && (
            <View style={{
              backgroundColor: "#022a52",
              borderRadius: 12,
              padding: isTablet ? 20 : 16,
              marginBottom: 12,
            }}>
              <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
                textTransform: "uppercase", marginBottom: 8 }}>EAN13</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 60, height: 60, backgroundColor: "#ffffff10", borderRadius: 8,
                  alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="barcode-outline" size={28} color="#789fd6" />
                </View>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 2 }}>
                  {d.ean13}
                </Text>
              </View>
            </View>
          )}

          {/* Magazzino */}
          <View style={{
            backgroundColor: "#022a52",
            borderRadius: 12,
            padding: isTablet ? 20 : 16,
            marginBottom: 12,
          }}>
            <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
              textTransform: "uppercase", marginBottom: 12 }}>
              {t("warehouse")} ({t("locations")})
            </Text>
            {d?.locations?.length > 0 ? (() => {
              const quantities = String(d.quantity ?? "").split(",");
              return d.locations.map((loc: any, i: number) => {
                const wh = d.warehouses?.find((w: any) => String(w.id) === String(loc.warehouse));
                return (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8,
                    paddingVertical: 8,
                    borderBottomWidth: i < d.locations.length - 1 ? 1 : 0,
                    borderBottomColor: "#ffffff10" }}>
                    <Ionicons name="cube-outline" size={16} color="#789fd6" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontWeight: "600" }}>{wh?.name ?? "—"}</Text>
                      <Text style={{ color: "#ffffff80", fontSize: 12 }}>{loc.location}</Text>
                    </View>
                    <View style={{ backgroundColor: "#ffffff15", borderRadius: 6,
                      paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>×{quantities[i] ?? "0"}</Text>
                    </View>
                  </View>
                );
              });
            })() : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="warning-outline" size={16} color="#FFBF25" />
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>{t("no_warehouse")}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => router.push("/(app)/spare" as any)}
              style={{ marginTop: 12, backgroundColor: "#ffffff10", borderRadius: 8,
                paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start" }}>
              <Text style={{ color: "#fff", fontSize: 13 }}>{t("manage")}</Text>
            </TouchableOpacity>
          </View>

          {/* Prezzo e fornitore */}
          <View style={{
            backgroundColor: "#022a52",
            borderRadius: 12,
            padding: isTablet ? 20 : 16,
            marginBottom: 12,
          }}>
            <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
              textTransform: "uppercase", marginBottom: 12 }}>
              {t("price")} & {t("supplier")}
            </Text>
            <InfoRow label={t("price")}   value={d?.Unitary_price ? `${d.Unitary_price} €` : null} />
            <InfoRow label="Lead time"    value={d?.Provisioning_Lead_Time_PLT > 0 ? `${d.Provisioning_Lead_Time_PLT} ${t("days_short")}` : null} />
            <InfoRow label="Shelf life"   value={d?.Shelf_Life > 0 ? `${d.Shelf_Life} ${t("days_short")}` : null} />
            <InfoRow label="Limited life" value={d?.Limited_Life > 0 ? `${d.Limited_Life} ${t("days_short")}` : null} />
            {d?.part?.organizationCompanyNCAGE && (
              <InfoRow label={t("supplier")}
                value={d.part.organizationCompanyNCAGE.NCAGE_Code
                  ? `${d.part.organizationCompanyNCAGE.NCAGE_Code}${d.part.organizationCompanyNCAGE.Organization_name ? ` – ${d.part.organizationCompanyNCAGE.Organization_name}` : ""}`
                  : null} />
            )}
            <InfoRow label={`NCAGE ${t("supplier")}`}
              value={d?.NCAGE_supplier > 0 ? String(d.NCAGE_supplier) : null} />
          </View>

          {/* Descrizione */}
          {d?.description && (
            <View style={{
              backgroundColor: "#022a52",
              borderRadius: 12,
              padding: isTablet ? 20 : 16,
              marginBottom: 12,
            }}>
              <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
                textTransform: "uppercase", marginBottom: 8 }}>{t("description")}</Text>
              <Text style={{ color: "#fff", fontSize: 14, lineHeight: 22 }}>{d.description}</Text>
            </View>
          )}

          {/* Sistema / Componente */}
          {d?.elementModel?.ESWBS_code && (
            <View style={{
              backgroundColor: "#022a52",
              borderRadius: 12,
              padding: isTablet ? 20 : 16,
              marginBottom: 12,
            }}>
              <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
                textTransform: "uppercase", marginBottom: 8 }}>
                {t("system")} / {t("component")}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#ffffff10",
                  alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="construct-outline" size={18} color="#789fd6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {d.elementModel.ESWBS_code} – {d.elementModel.LCN_name ?? d?.part?.Part_name ?? ""}
                  </Text>
                  {d.elementModel.LCN && (
                    <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>{d.elementModel.LCN}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Manutenzioni collegate */}
          {d?.maintenances?.length > 0 && (
            <View style={{
              backgroundColor: "#022a52",
              borderRadius: 12,
              padding: isTablet ? 20 : 16,
              marginBottom: 12,
            }}>
              <Text style={{ color: "#789fd6", fontSize: 12, fontWeight: "700",
                textTransform: "uppercase", marginBottom: 12 }}>
                {t("view_maintenances")}
              </Text>
              {d.maintenances.map((m: any, i: number) => (
                <TouchableOpacity key={m.id ?? i}
                  onPress={() => router.push(`/(app)/maintenance/${m.id}` as any)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8,
                    paddingVertical: 12,
                    borderBottomWidth: i < d.maintenances.length - 1 ? 1 : 0,
                    borderBottomColor: "#ffffff10" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                      {m.name}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                      {m.recurrency_type?.name && (
                        <Text style={{ color: "#ffffff80", fontSize: 12 }}>{m.recurrency_type.name}</Text>
                      )}
                      {m.maintenance_level?.Industry_Level && (
                        <Text style={{ color: "#ffffff80", fontSize: 12 }}>{m.maintenance_level.Industry_Level}</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#ffffff80" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* In ordine */}
          <TouchableOpacity onPress={() => router.push("/(app)/cart")}
            style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16,
              flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
            <Ionicons name="cart-outline" size={18} color="#789fd6" style={{ marginRight: 10 }} />
            <Text style={{ color: "#fff", fontSize: 15 }}>{t("in_order")}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: "auto" }} />
          </TouchableOpacity>

        </ScrollView>
      </View>

      <PdfViewerModal
        visible={pdfOpen}
        onClose={() => setPdfOpen(false)}
        url={d?.documentFileUrl ?? null}
        title={d?.part?.Part_name || d?.Part_name || t("see_files")}
        isOnline={isOnline}
      />
      <NoteModal
        visible={noteModal}
        onClose={() => setNoteModal(false)}
        entityId={String(id)}
        authorId={String((user as any)?.id ?? "")}
        entityType="spare"
        onSuccess={() => {}}
      />
      <CartAddedModal
        visible={cartAdded}
        onClose={() => setCartAdded(false)}
        isOffline={cartOffline}
      />
    </SafeAreaView>
  );
}