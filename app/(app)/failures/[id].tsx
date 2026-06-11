import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Pressable, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { useLocalSearchParams, router } from "expo-router";
import NoteModal from "@/components/organisms/NoteModal";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
// Come il web: fetch del SINGOLO guasto per id (niente più scarico di tutta la lista)
const getFailureById = async (id: string) => {
  const res = await api.get(`/failures/getFailure/${id}`);
  return res.data?.failure || null;
};
const getPhotos = async (id: string) => {
  const res = await api.get(`/uploadFiles/getPhotos/${id}/failure`);
  return res.data.notes || [];
};
const getAudios = async (id: string) => {
  const res = await api.get(`/uploadFiles/getAudios/${id}/failure`);
  return res.data.notes || [];
};
const getTexts = async (id: string) => {
  const res = await api.get(`/uploadFiles/getTextNotes/${id}/failure`);
  return res.data.notes || [];
};

// ─── Gravity color ────────────────────────────────────────────────────────────
const gColor = (g?: string) => {
  switch (g?.toLowerCase()) {
    case "critica": return "#D0021B";
    case "alta":    return "#F47216";
    case "media":   return "#FFBF25";
    case "bassa":   return "#2DB647";
    default:        return "#6b7280";
  }
};

// ─── Photo History Modal ──────────────────────────────────────────────────────
function PhotoHistoryModal({ visible, onClose, photos }: { visible: boolean; onClose: () => void; photos: any[] }) {
  const [zoom, setZoom] = useState<string | null>(null);
  const { isTablet } = useDevice();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: isTablet ? 20 : 16 }}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 20, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico foto</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {photos.length === 0
              ? <Text style={{ color: "#ffffff80", textAlign: "center" }}>Nessuna foto</Text>
              : photos.map((p, i) => (
                <TouchableOpacity key={i} onPress={() => setZoom(p.image_url)}
                  style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                  <Image source={{ uri: p.image_url }} style={{ width: isTablet ? 90 : 70, height: isTablet ? 90 : 70, borderRadius: 8, marginRight: 12 }} />
                  <View>
                    <Text style={{ color: "#fff" }}>{p.authorDetails?.first_name} {p.authorDetails?.last_name}</Text>
                    <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(p.created_at).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Chiudi</Text>
          </TouchableOpacity>
        </View>
        {zoom && (
          <Pressable style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" } as any} onPress={() => setZoom(null)}>
            <Image source={{ uri: zoom }} style={{ width: "95%", height: 400, borderRadius: 12 }} resizeMode="contain" />
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

// ─── Text History Modal ───────────────────────────────────────────────────────
function TextHistoryModal({ visible, onClose, texts }: { visible: boolean; onClose: () => void; texts: any[] }) {
  const { isTablet } = useDevice();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: isTablet ? 20 : 16 }}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 20, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico testi</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {texts.length === 0
              ? <Text style={{ color: "#ffffff80", textAlign: "center" }}>Nessuna nota testuale</Text>
              : texts.map((t, i) => (
                <View key={i} style={{ backgroundColor: "#00000038", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <Text style={{ color: "#ffffff80", fontSize: 12 }}>{t.authorDetails?.first_name} {t.authorDetails?.last_name}</Text>
                  <Text style={{ color: "#fff", fontSize: 15, marginTop: 6 }}>{t.text_field}</Text>
                  <Text style={{ color: "#ffffff60", fontSize: 11, marginTop: 6, textAlign: "right" }}>{new Date(t.created_at).toLocaleString()}</Text>
                </View>
              ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Failure Detail Page ──────────────────────────────────────────────────────
export default function FailureDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { isTablet } = useDevice();

  const [failure, setFailure] = useState<any>(null);
  const [photos,  setPhotos]  = useState<any[]>([]);
  const [audios,  setAudios]  = useState<any[]>([]);
  const [texts,   setTexts]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteModal,  setNoteModal]  = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [textModal,  setTextModal]  = useState(false);

  const loadNotes = async () => {
    const [p, a, t] = await Promise.all([
      getPhotos(id).catch(() => []),
      getAudios(id).catch(() => []),
      getTexts(id).catch(() => []),
    ]);
    setPhotos(p); setAudios(a); setTexts(t);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFailureById(String(id))
      .then((f) => setFailure(f))
      .catch(() => setFailure(null))
      .finally(() => setLoading(false));
    loadNotes();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </SafeAreaView>
    );
  }

  if (!failure) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="warning-outline" size={48} color="#ffffff40" />
        <Text style={{ color: "#ffffff60", marginTop: 12 }}>Guasto non trovato</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#789fd6" }}>← Torna indietro</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  let customFields: any[] = [];
  try {
    customFields = typeof failure.customFields === "string"
      ? JSON.parse(failure.customFields)
      : failure.customFields || [];
  } catch {}

  // Impianto/componente: come il web, fallback su element_model se presente
  const componentName  = failure.element?.element_model?.LCN_name || failure.component_name;
  const componentEswbs = failure.element?.element_model?.ESWBS_code || failure.eswbs_code;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: isTablet ? 24 : 16, alignSelf: "center",
        width: "100%", maxWidth: isTablet ? 1100 : "100%" }}>
        <DashboardHeader />

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 12, gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 4 }}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: isTablet ? 22 : 18, fontWeight: "700", flex: 1 }} numberOfLines={2}>
            {failure.title}
          </Text>
          {failure.gravity && (
            <View style={{ backgroundColor: gColor(failure.gravity) + "33", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: gColor(failure.gravity), fontSize: 12, fontWeight: "700", textTransform: "capitalize" }}>{failure.gravity}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => setNoteModal(true)}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Nota</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isTablet ? 64 : 32 }}>

          {/* Info principali */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
            {failure.userExecutionData?.first_name && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 4 }}>Utente</Text>
                <Text style={{ color: "#fff", fontSize: 15 }}>{failure.userExecutionData.first_name} {failure.userExecutionData.last_name}</Text>
              </View>
            )}
            {failure.date && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 4 }}>Data inserimento</Text>
                <Text style={{ color: "#fff", fontSize: 15 }}>{failure.date}</Text>
              </View>
            )}
            {failure.description ? (
              <View>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 4 }}>Descrizione</Text>
                <Text style={{ color: "#fff", fontSize: 14, lineHeight: 22 }}>{failure.description}</Text>
              </View>
            ) : null}
          </View>

          {/* Impianto / Componente (come il web) */}
          {(componentEswbs || componentName) && (
            <TouchableOpacity
              onPress={() => failure.element_id && router.push(`/(app)/impianti/${failure.element_id}` as any)}
              disabled={!failure.element_id}
              style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16,
                marginBottom: 12, flexDirection: "row", alignItems: "center",
                opacity: failure.element_id ? 1 : 0.85 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 4 }}>Impianto / Componente</Text>
                {componentEswbs && (
                  <Text style={{ color: "#789fd6", fontSize: 13, fontFamily: "monospace" }}>{componentEswbs}</Text>
                )}
                <Text style={{ color: "#fff", fontSize: 15, marginTop: 2 }} numberOfLines={2}>{componentName || "—"}</Text>
              </View>
              {failure.element_id && <Ionicons name="chevron-forward" size={18} color="#ffffff80" />}
            </TouchableOpacity>
          )}

          {/* Custom fields */}
          {customFields.length > 0 && (
            <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
              {customFields.map((f: any, i: number) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text style={{ color: "#ee81e5", fontSize: 13, marginBottom: 4 }}>{f.name}</Text>
                  <Text style={{ color: "#fff", fontSize: 15 }}>{f.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Note fotografiche */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#789fd6", fontSize: 15, fontWeight: "600", flex: 1 }}>Note fotografiche</Text>
              <TouchableOpacity onPress={() => setPhotoModal(true)}>
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            </View>
            {photos.length === 0
              ? <Text style={{ color: "#ffffff60", fontSize: 13 }}>Nessuna foto</Text>
              : <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image source={{ uri: photos[0].image_url }} style={{ width: isTablet ? 90 : 70, height: isTablet ? 90 : 70, borderRadius: 8, marginRight: 12 }} />
                  <View>
                    <Text style={{ color: "#fff" }}>{photos[0].authorDetails?.first_name} {photos[0].authorDetails?.last_name}</Text>
                    <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(photos[0].created_at).toLocaleString()}</Text>
                    {photos.length > 1 && <Text style={{ color: "#789fd6", fontSize: 12, marginTop: 4 }}>+{photos.length - 1} altre</Text>}
                  </View>
                </View>
            }
          </View>

          {/* Note audio */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 15, fontWeight: "600", marginBottom: 8 }}>Note vocali</Text>
            {audios.length === 0
              ? <Text style={{ color: "#ffffff60", fontSize: 13 }}>Nessuna nota vocale</Text>
              : audios.map((a: any, i: number) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, backgroundColor: "#00000030", borderRadius: 8, padding: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#789fd6", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>{a.authorDetails?.first_name?.[0]}{a.authorDetails?.last_name?.[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 13 }}>{a.authorDetails?.first_name} {a.authorDetails?.last_name}</Text>
                    <Text style={{ color: "#ffffff80", fontSize: 11 }}>{new Date(a.created_at).toLocaleString()}</Text>
                  </View>
                  <Ionicons name="musical-notes-outline" size={20} color="#789fd6" />
                </View>
              ))
            }
          </View>

          {/* Note testo */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#789fd6", fontSize: 15, fontWeight: "600", flex: 1 }}>Note testuali</Text>
              <TouchableOpacity onPress={() => setTextModal(true)}>
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            </View>
            {texts.length === 0
              ? <Text style={{ color: "#ffffff60", fontSize: 13 }}>Nessuna nota testuale</Text>
              : <View style={{ backgroundColor: "#00000038", borderRadius: 8, padding: 12 }}>
                  <Text style={{ color: "#ffffff80", fontSize: 12 }}>{texts[0].authorDetails?.first_name} {texts[0].authorDetails?.last_name}</Text>
                  <Text style={{ color: "#fff", fontSize: 14, marginTop: 6 }}>{texts[0].text_field}</Text>
                  <Text style={{ color: "#ffffff60", fontSize: 11, marginTop: 6, textAlign: "right" }}>{new Date(texts[0].created_at).toLocaleString()}</Text>
                  {texts.length > 1 && <Text style={{ color: "#789fd6", fontSize: 12, marginTop: 6 }}>+{texts.length - 1} altre note</Text>}
                </View>
            }
          </View>
        </ScrollView>
      </View>

      <NoteModal
        visible={noteModal}
        onClose={() => setNoteModal(false)}
        entityId={id}
        authorId={String(user?.id)}
        entityType="failure"
        onSuccess={loadNotes}
      />
      <PhotoHistoryModal visible={photoModal} onClose={() => setPhotoModal(false)} photos={photos} />
      <TextHistoryModal  visible={textModal}  onClose={() => setTextModal(false)}  texts={texts} />
    </SafeAreaView>
  );
}