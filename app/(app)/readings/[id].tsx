import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  Alert, Modal, Pressable, TextInput, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import NoteModal from "@/components/organisms/NoteModal";

// ─── API ──────────────────────────────────────────────────────────────────────
const getReading = async (id: string, userId: string) => {
  const res = await api.get(`/readings/getReading?id=${id}&user_id=${userId}`);
  return res.data || [];
};
const updateReading = async (id: string, data: any) => {
  await api.put(`/readings/${id}`, data);
};
const getPhotos = async (id: string) => {
  const res = await api.get(`/uploadFiles/getPhotos/${id}/reading`);
  return res.data?.notes || [];
};
const getAudios = async (id: string) => {
  const res = await api.get(`/uploadFiles/getAudios/${id}/reading`);
  return res.data?.notes || [];
};
const getTexts = async (id: string) => {
  const res = await api.get(`/uploadFiles/getTextNotes/${id}/reading`);
  return res.data?.notes || [];
};
const uploadPhoto = async (formData: FormData) => {
  await api.post("/uploadFiles/uploadPhoto", formData, { headers: { "Content-Type": "multipart/form-data" } });
};
const uploadText = async (payload: any) => {
  await api.post("/uploadFiles/uploadText", payload);
};

const TAG_COLORS = ["#f78da7","#a78bfa","#60a5fa","#34d399","#fbbf24","#f87171","#38bdf8","#c084fc"];

// ─── Edit Value Modal ─────────────────────────────────────────────────────────
function EditValueModal({ visible, value, onSave, onClose }: any) {
  const [input, setInput] = useState(value);
  useEffect(() => setInput(value), [value]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }} onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 24 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 16 }}>Inserisci valore</Text>
          <TextInput value={input} onChangeText={setInput} keyboardType="decimal-pad"
            style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12, fontSize: 20, textAlign: "center", marginBottom: 16 }}
            autoFocus />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={onClose} style={{ flex: 1, backgroundColor: "#ffffff15", borderRadius: 8, padding: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onSave(input); onClose(); }} style={{ flex: 1, backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Salva</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Photo History Modal ──────────────────────────────────────────────────────
function PhotoHistoryModal({ visible, onClose, photos }: any) {
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#001c38" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico foto</Text>
          </View>
          <ScrollView style={{ padding: 16 }}>
            {photos.map((p: any, i: number) => (
              <TouchableOpacity key={i} onPress={() => setZoom(p.image_url)}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#022a52", borderRadius: 10, padding: 12, marginBottom: 10, gap: 12 }}>
                <Image source={{ uri: p.image_url }} style={{ width: 70, height: 70, borderRadius: 8 }} />
                <View>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{p.authorDetails?.first_name} {p.authorDetails?.last_name}</Text>
                  <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 4 }}>{new Date(p.created_at).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
      {zoom && (
        <Pressable onPress={() => setZoom(null)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
          <Image source={{ uri: zoom }} style={{ width: "95%", height: "80%" }} resizeMode="contain" />
        </Pressable>
      )}
    </Modal>
  );
}

// ─── Text History Modal ───────────────────────────────────────────────────────
function TextHistoryModal({ visible, onClose, texts }: any) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#001c38" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico note testuali</Text>
          </View>
          <ScrollView style={{ padding: 16 }}>
            {texts.map((t: any, i: number) => (
              <View key={i} style={{ backgroundColor: "#022a52", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <Text style={{ color: "#ffffff80", fontSize: 12 }}>{t.authorDetails?.first_name} {t.authorDetails?.last_name}</Text>
                <Text style={{ color: "#fff", fontSize: 15, marginTop: 6, marginBottom: 6 }}>{t.text_field}</Text>
                <Text style={{ color: "#ffffff60", fontSize: 12, textAlign: "right" }}>{new Date(t.created_at).toLocaleString()}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Reading Detail Page ──────────────────────────────────────────────────────
export default function ReadingDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth?.user) as any;

  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [audios, setAudios] = useState<any[]>([]);
  const [texts, setTexts] = useState<any[]>([]);

  const [noteModal, setNoteModal] = useState(false);
  const [editValue, setEditValue] = useState(false);
  const [photoHistory, setPhotoHistory] = useState(false);
  const [textHistory, setTextHistory] = useState(false);

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const fetchNotes = async () => {
    if (!id) return;
    const [p, a, t] = await Promise.all([getPhotos(id), getAudios(id), getTexts(id)]);
    const sort = (arr: any[]) => [...arr].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setPhotos(sort(p));
    setAudios(sort(a));
    setTexts(sort(t));
  };

  useEffect(() => {
    if (!id || !user) return;
    getReading(id, String(user.id))
      .then((data) => {
        const r = Array.isArray(data) ? data[0] : data;
        setReading(r);
        if (r?.tags) setTags(r.tags.split(",").map((t: string) => t.trim()).filter(Boolean));
      })
      .catch(() => Alert.alert("Errore", "Impossibile caricare la lettura"))
      .finally(() => setLoading(false));
    fetchNotes();
  }, [id, user]);

  const handleSaveValue = (val: string) => {
    setReading((p: any) => ({ ...p, value: val }));
    updateReading(id!, { value: val });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    setNewTag("");
    setShowTagInput(false);
    updateReading(id!, { tags: updated.join(",") });
  };

  const handleRemoveTag = (i: number) => {
    const updated = tags.filter((_, idx) => idx !== i);
    setTags(updated);
    updateReading(id!, { tags: updated.join(",") });
  };

  const latestPhoto = photos[0];
  const latestAudio = audios[0];
  const latestText = texts[0];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </SafeAreaView>
    );
  }

  if (!reading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Lettura non trovata</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <DashboardHeader />

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 16, gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 4 }}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 }} numberOfLines={2}>{reading.task_name}</Text>
          <TouchableOpacity onPress={() => setNoteModal(true)}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600" }}>Nota</Text>
          </TouchableOpacity>
        </View>

        {/* ── VALUE ── */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: "#789fd6", fontSize: 14, marginBottom: 10 }}>Valore</Text>
          <TouchableOpacity onPress={() => setEditValue(true)}
            style={{ flexDirection: "row", borderRadius: 8, overflow: "hidden" }}>
            <View style={{ flex: 1, backgroundColor: reading.value ? "#2DB647" : "#ffffff15", padding: 12 }}>
              <Text style={{ color: "#fff" }}>{reading.unit || "—"}</Text>
            </View>
            <View style={{ backgroundColor: reading.value ? "#2DB647" : "#ffffff15", padding: 12, minWidth: 80, alignItems: "flex-end" }}>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{reading.value || "Inserisci"}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── PHOTO NOTE ── */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>Note fotografiche</Text>
            <TouchableOpacity onPress={() => { setNoteModal(true); }}>
              <Text style={{ color: "#fff", fontSize: 13 }}>+ Aggiungi</Text>
            </TouchableOpacity>
            {photos.length > 1 && (
              <TouchableOpacity onPress={() => setPhotoHistory(true)} style={{ marginLeft: 12 }}>
                <Text style={{ color: "#789fd6", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            )}
          </View>
          {latestPhoto ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image source={{ uri: latestPhoto.image_url }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              <View>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{latestPhoto.authorDetails?.first_name} {latestPhoto.authorDetails?.last_name}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 4 }}>{new Date(latestPhoto.created_at).toLocaleString()}</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontSize: 13 }}>Nessuna foto</Text>
          )}
        </View>

        {/* ── VOCAL NOTE ── */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>Note vocali</Text>
            <TouchableOpacity onPress={() => setNoteModal(true)}>
              <Text style={{ color: "#fff", fontSize: 13 }}>+ Aggiungi</Text>
            </TouchableOpacity>
          </View>
          {latestAudio ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#789fd6", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {latestAudio.authorDetails?.first_name?.[0]}{latestAudio.authorDetails?.last_name?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{latestAudio.authorDetails?.first_name} {latestAudio.authorDetails?.last_name}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 4 }}>{new Date(latestAudio.created_at).toLocaleString()}</Text>
              </View>
              <Ionicons name="musical-notes-outline" size={20} color="#789fd6" />
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontSize: 13 }}>Nessun audio</Text>
          )}
        </View>

        {/* ── TEXT NOTE ── */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>Note testuali</Text>
            <TouchableOpacity onPress={() => setNoteModal(true)}>
              <Text style={{ color: "#fff", fontSize: 13 }}>+ Aggiungi</Text>
            </TouchableOpacity>
            {texts.length > 1 && (
              <TouchableOpacity onPress={() => setTextHistory(true)} style={{ marginLeft: 12 }}>
                <Text style={{ color: "#789fd6", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            )}
          </View>
          {latestText ? (
            <View style={{ backgroundColor: "#00000030", borderRadius: 8, padding: 12 }}>
              <Text style={{ color: "#ffffff80", fontSize: 12 }}>{latestText.authorDetails?.first_name} {latestText.authorDetails?.last_name}</Text>
              <Text style={{ color: "#fff", fontSize: 15, marginTop: 6, marginBottom: 6 }}>{latestText.text_field}</Text>
              <Text style={{ color: "#ffffff60", fontSize: 12, textAlign: "right" }}>{new Date(latestText.created_at).toLocaleString()}</Text>
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontSize: 13 }}>Nessuna nota testuale</Text>
          )}
        </View>

        {/* ── INFO SECTION ── */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: "#789fd6", fontSize: 14, marginBottom: 10 }}>Descrizione</Text>
          <Text style={{ color: "#fff", fontSize: 14, lineHeight: 22 }}>{reading.description || "—"}</Text>
        </View>

        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: "#789fd6", fontSize: 14, marginBottom: 10 }}>Impianto / Componente</Text>
          <Text style={{ color: "#fff", fontSize: 14 }}>
            {reading.element?.element_model?.ESWBS_code} {reading.element?.element_model?.LCN_name}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, padding: 16 }}>
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Ricorrenza</Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{reading.recurrence}gg</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, padding: 16 }}>
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Squadra</Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{reading.team || "—"}</Text>
          </View>
        </View>

        {/* ── TAGS ── */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>Tag</Text>
            <TouchableOpacity onPress={() => setShowTagInput((p) => !p)}>
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {showTagInput && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <TextInput value={newTag} onChangeText={setNewTag} placeholder="Nuovo tag" placeholderTextColor="#6b7280"
                style={{ flex: 1, backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 10 }} />
              <TouchableOpacity onPress={handleAddTag} style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Aggiungi</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {tags.map((tag, i) => (
              <View key={i} style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length], borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(i)}>
                  <Ionicons name="close-circle" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {tags.length === 0 && <Text style={{ color: "#ffffff40", fontSize: 13 }}>Nessun tag</Text>}
          </View>
        </View>

        {/* ── BACK ── */}
        <TouchableOpacity onPress={() => router.back()}
          style={{ backgroundColor: "#ffffff10", borderRadius: 12, padding: 18, alignItems: "center", marginBottom: 32 }}>
          <Text style={{ color: "#fff", fontSize: 15 }}>Torna alla lista</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditValueModal visible={editValue} value={reading.value || ""} onSave={handleSaveValue} onClose={() => setEditValue(false)} />
        <NoteModal
        visible={noteModal}
        onClose={() => setNoteModal(false)}
        entityId={id}
        authorId={String(user?.id)}
        entityType="reading"
        onSuccess={fetchNotes}
        />
      <PhotoHistoryModal visible={photoHistory} onClose={() => setPhotoHistory(false)} photos={photos} />
      <TextHistoryModal visible={textHistory} onClose={() => setTextHistory(false)} texts={texts} />
    </SafeAreaView>
  );
}