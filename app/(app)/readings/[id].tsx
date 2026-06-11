import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  Alert, Modal, Pressable, TextInput, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useLocalSearchParams, router } from "expo-router";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import NoteModal from "@/components/organisms/NoteModal";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const getReading    = async (id: string, userId: string) => {
  const res = await api.get(`/readings/getReading?id=${id}&user_id=${userId}`);
  return res.data || [];
};
const updateReading = async (id: string, data: any) => api.put(`/readings/${id}`, data);
const getPhotos     = async (id: string) => (await api.get(`/uploadFiles/getPhotos/${id}/reading`)).data?.notes || [];
const getAudios     = async (id: string) => (await api.get(`/uploadFiles/getAudios/${id}/reading`)).data?.notes || [];
const getTexts      = async (id: string) => (await api.get(`/uploadFiles/getTextNotes/${id}/reading`)).data?.notes || [];

// ─── Cache keys ───────────────────────────────────────────────────────────────
const READING_CACHE  = (id: string) => `cache_reading_${id}`;
const PENDING_READING = (id: string) => `pending_reading_${id}`;

const TAG_COLORS = ["#f78da7","#a78bfa","#60a5fa","#34d399","#fbbf24","#f87171","#38bdf8","#c084fc"];

// ─── Edit Value Modal ─────────────────────────────────────────────────────────
function EditValueModal({ visible, value, onSave, onClose, isOnline }: any) {
  const { t } = useTranslation("maintenance");
  const [input, setInput] = useState(value);
  useEffect(() => setInput(value), [value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}
        onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 24 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
            {t("insert_value")}
          </Text>

          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10,
              marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>
                Offline — salvato localmente, sincronizzato quando online
              </Text>
            </View>
          )}

          <TextInput value={input} onChangeText={setInput} keyboardType="decimal-pad"
            style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12,
              fontSize: 20, textAlign: "center", marginBottom: 16 }} autoFocus />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={onClose}
              style={{ flex: 1, backgroundColor: "#ffffff15", borderRadius: 8, padding: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>{t("close_button")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onSave(input); onClose(); }}
              style={{ flex: 1, backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {!isOnline && <Ionicons name="cloud-offline-outline" size={14} color="#fff" />}
                <Text style={{ color: "#fff", fontWeight: "700" }}>{t("save")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Photo History Modal ──────────────────────────────────────────────────────
function PhotoHistoryModal({ visible, onClose, photos }: any) {
  const { t } = useTranslation("maintenance");
  const [zoom, setZoom] = useState<string | null>(null);
  const { isTablet } = useDevice();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#001c38" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: isTablet ? 20 : 16 }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{t("photohistory_title")}</Text>
          </View>
          <ScrollView style={{ padding: isTablet ? 20 : 16 }}>
            {photos.map((p: any, i: number) => (
              <TouchableOpacity key={i} onPress={() => setZoom(p.image_url)}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#022a52",
                  borderRadius: 10, padding: 12, marginBottom: 10, gap: 12 }}>
                <Image source={{ uri: p.image_url }} style={{ width: 70, height: 70, borderRadius: 8 }} />
                <View>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {p.authorDetails?.first_name} {p.authorDetails?.last_name}
                  </Text>
                  <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 4 }}>
                    {new Date(p.created_at).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
      {zoom && (
        <Pressable onPress={() => setZoom(null)}
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center", alignItems: "center" }}>
          <Image source={{ uri: zoom }} style={{ width: "95%", height: "80%" }} resizeMode="contain" />
        </Pressable>
      )}
    </Modal>
  );
}

// ─── Text History Modal ───────────────────────────────────────────────────────
function TextHistoryModal({ visible, onClose, texts }: any) {
  const { t } = useTranslation("maintenance");
  const { isTablet } = useDevice();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#001c38" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: isTablet ? 20 : 16 }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{t("texthistory_title")}</Text>
          </View>
          <ScrollView style={{ padding: isTablet ? 20 : 16 }}>
            {texts.map((tx: any, i: number) => (
              <View key={i} style={{ backgroundColor: "#022a52", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <Text style={{ color: "#ffffff80", fontSize: 12 }}>
                  {tx.authorDetails?.first_name} {tx.authorDetails?.last_name}
                </Text>
                <Text style={{ color: "#fff", fontSize: 15, marginTop: 6, marginBottom: 6 }}>{tx.text_field}</Text>
                <Text style={{ color: "#ffffff60", fontSize: 12, textAlign: "right" }}>
                  {new Date(tx.created_at).toLocaleString()}
                </Text>
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
  const { t } = useTranslation("maintenance");
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { isTablet } = useDevice();

  const [reading,      setReading]      = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [isOnline,     setIsOnline]     = useState(true);
  const [fromCache,    setFromCache]    = useState(false);
  const [isDirty,      setIsDirty]      = useState(false); // modifiche locali in attesa
  const [photos,       setPhotos]       = useState<any[]>([]);
  const [audios,       setAudios]       = useState<any[]>([]);
  const [texts,        setTexts]        = useState<any[]>([]);
  const [noteModal,    setNoteModal]    = useState(false);
  const [editValue,    setEditValue]    = useState(false);
  const [photoHistory, setPhotoHistory] = useState(false);
  const [textHistory,  setTextHistory]  = useState(false);
  const [tags,         setTags]         = useState<string[]>([]);
  const [newTag,       setNewTag]       = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  // ── Monitor connettività ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Fetch note (solo online) ───────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!id) return;
    const net = await NetInfo.fetch();
    if (!(net.isConnected && net.isInternetReachable)) return; // note non cacheate
    const [p, a, tx] = await Promise.all([getPhotos(id), getAudios(id), getTexts(id)]);
    const sort = (arr: any[]) => [...arr].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setPhotos(sort(p)); setAudios(sort(a)); setTexts(sort(tx));
  }, [id]);

  // ── Caricamento reading: API → cache → fallback ───────────────────────────
  useEffect(() => {
    if (!id || !user) return;
    const key = READING_CACHE(id);

    const load = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      if (online) {
        try {
          const raw = await getReading(id, String(user.id));
          const r = Array.isArray(raw) ? raw[0] : raw;
          setReading(r);
          if (r?.tags) setTags(r.tags.split(",").map((tg: string) => tg.trim()).filter(Boolean));
          setFromCache(false);
          await AsyncStorage.setItem(key, JSON.stringify(r));
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
          const r = JSON.parse(raw);
          // Sovrapponi eventuali pending locali
          const pendingRaw = await AsyncStorage.getItem(PENDING_READING(id)).catch(() => null);
          const pending = pendingRaw ? JSON.parse(pendingRaw) : {};
          const merged = { ...r, ...pending };
          setReading(merged);
          if (merged?.tags)
            setTags(merged.tags.split(",").map((tg: string) => tg.trim()).filter(Boolean));
          setFromCache(true);
          if (Object.keys(pending).length > 0) setIsDirty(true);
        } else {
          setReading(null);
          setFromCache(true);
        }
      } catch { setReading(null); }
    };

    load();
    fetchNotes();
  }, [id, user]);

  // ── Auto-sync pending al rientro online ───────────────────────────────────
  useEffect(() => {
    if (!isOnline || !isDirty || !id) return;
    const sync = async () => {
      try {
        const pendingRaw = await AsyncStorage.getItem(PENDING_READING(id));
        if (!pendingRaw) return;
        const pending = JSON.parse(pendingRaw);
        await updateReading(id, pending);
        await AsyncStorage.removeItem(PENDING_READING(id));
        setIsDirty(false);
        // Aggiorna la cache con i dati confermati
        const key = READING_CACHE(id);
        const cacheRaw = await AsyncStorage.getItem(key).catch(() => null);
        if (cacheRaw) {
          const cached = JSON.parse(cacheRaw);
          await AsyncStorage.setItem(key, JSON.stringify({ ...cached, ...pending }));
        }
      } catch {}
    };
    sync();
  }, [isOnline]);

  // ── Salva valore (ottimistico + pending) ───────────────────────────────────
  const handleSaveValue = async (val: string) => {
    // Aggiorna UI subito
    setReading((p: any) => ({ ...p, value: val }));

    if (isOnline) {
      try {
        await updateReading(id!, { value: val });
        // Aggiorna cache
        const key = READING_CACHE(id!);
        const raw = await AsyncStorage.getItem(key).catch(() => null);
        if (raw) await AsyncStorage.setItem(key, JSON.stringify({ ...JSON.parse(raw), value: val }));
      } catch {
        await savePending({ value: val });
      }
    } else {
      await savePending({ value: val });
    }
  };

  // ── Aggiungi tag ───────────────────────────────────────────────────────────
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    setNewTag("");
    setShowTagInput(false);
    await saveTagsUpdate(updated);
  };

  const handleRemoveTag = async (i: number) => {
    const updated = tags.filter((_, idx) => idx !== i);
    setTags(updated);
    await saveTagsUpdate(updated);
  };

  const saveTagsUpdate = async (updated: string[]) => {
    const tagStr = updated.join(",");
    setReading((p: any) => ({ ...p, tags: tagStr }));

    if (isOnline) {
      try {
        await updateReading(id!, { tags: tagStr });
        const key = READING_CACHE(id!);
        const raw = await AsyncStorage.getItem(key).catch(() => null);
        if (raw) await AsyncStorage.setItem(key, JSON.stringify({ ...JSON.parse(raw), tags: tagStr }));
      } catch {
        await savePending({ tags: tagStr });
      }
    } else {
      await savePending({ tags: tagStr });
    }
  };

  // ── Salva pending in AsyncStorage (merge con esistenti) ───────────────────
  const savePending = async (fields: Record<string, any>) => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_READING(id!)).catch(() => null);
      const existing = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(PENDING_READING(id!), JSON.stringify({ ...existing, ...fields }));
      setIsDirty(true);
    } catch {}
  };

  const latestPhoto = photos[0];
  const latestAudio = audios[0];
  const latestText  = texts[0];

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color="#789fd6" size="large" />
    </SafeAreaView>
  );

  if (!reading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#fff" }}>{t("no_data_available")}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
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
              Offline{isDirty ? " · modifiche in attesa di sync" : ""}
            </Text>
          </View>
        )}

        {/* Banner sync in attesa quando torna online */}
        {isOnline && isDirty && (
          <View style={{ backgroundColor: "#2DB647", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-upload-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Sincronizzazione modifiche in corso...
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center",
          marginTop: (!isOnline || isDirty) ? 8 : 16, marginBottom: 16, gap: 10 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 }} numberOfLines={2}>
            {reading.task_name}
          </Text>
          <TouchableOpacity onPress={() => setNoteModal(true)}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 14,
              paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600" }}>{t("add_note")}</Text>
          </TouchableOpacity>
        </View>

        {/* Valore */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>{t("value")}</Text>
            {/* Badge "modificato offline" */}
            {isDirty && reading.value && (
              <View style={{ backgroundColor: "#F4721633", borderRadius: 12,
                paddingHorizontal: 8, paddingVertical: 2,
                flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="cloud-upload-outline" size={11} color="#F47216" />
                <Text style={{ color: "#F47216", fontSize: 10, fontWeight: "700" }}>In attesa</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => setEditValue(true)}
            style={{ flexDirection: "row", borderRadius: 8, overflow: "hidden" }}>
            <View style={{ flex: 1, backgroundColor: reading.value ? "#2DB647" : "#ffffff15", padding: 12 }}>
              <Text style={{ color: "#fff" }}>{reading.unit || "—"}</Text>
            </View>
            <View style={{ backgroundColor: reading.value ? "#2DB647" : "#ffffff15",
              padding: 12, minWidth: 80, alignItems: "flex-end" }}>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
                {reading.value || t("insert_value")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Note fotografiche */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>{t("photographic_notes")}</Text>
            <TouchableOpacity onPress={() => setNoteModal(true)}>
              <Text style={{ color: "#fff", fontSize: 13 }}>+ {t("add")}</Text>
            </TouchableOpacity>
            {photos.length > 1 && (
              <TouchableOpacity onPress={() => setPhotoHistory(true)} style={{ marginLeft: 12 }}>
                <Text style={{ color: "#789fd6", fontSize: 13 }}>{t("see_history")}</Text>
              </TouchableOpacity>
            )}
          </View>
          {latestPhoto ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image source={{ uri: latestPhoto.image_url }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              <View>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {latestPhoto.authorDetails?.first_name} {latestPhoto.authorDetails?.last_name}
                </Text>
                <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 4 }}>
                  {new Date(latestPhoto.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontSize: 13 }}>
              {!isOnline ? "Note non disponibili offline" : t("no_data_available")}
            </Text>
          )}
        </View>

        {/* Note vocali */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>{t("vocal_notes")}</Text>
            <TouchableOpacity onPress={() => setNoteModal(true)}>
              <Text style={{ color: "#fff", fontSize: 13 }}>+ {t("add")}</Text>
            </TouchableOpacity>
          </View>
          {latestAudio ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#789fd6",
                alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {latestAudio.authorDetails?.first_name?.[0]}{latestAudio.authorDetails?.last_name?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {latestAudio.authorDetails?.first_name} {latestAudio.authorDetails?.last_name}
                </Text>
                <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 4 }}>
                  {new Date(latestAudio.created_at).toLocaleString()}
                </Text>
              </View>
              <Ionicons name="musical-notes-outline" size={20} color="#789fd6" />
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontSize: 13 }}>
              {!isOnline ? "Note non disponibili offline" : t("no_audio_notes")}
            </Text>
          )}
        </View>

        {/* Note testuali */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>{t("text_notes")}</Text>
            <TouchableOpacity onPress={() => setNoteModal(true)}>
              <Text style={{ color: "#fff", fontSize: 13 }}>+ {t("add")}</Text>
            </TouchableOpacity>
            {texts.length > 1 && (
              <TouchableOpacity onPress={() => setTextHistory(true)} style={{ marginLeft: 12 }}>
                <Text style={{ color: "#789fd6", fontSize: 13 }}>{t("see_history")}</Text>
              </TouchableOpacity>
            )}
          </View>
          {latestText ? (
            <View style={{ backgroundColor: "#00000030", borderRadius: 8, padding: 12 }}>
              <Text style={{ color: "#ffffff80", fontSize: 12 }}>
                {latestText.authorDetails?.first_name} {latestText.authorDetails?.last_name}
              </Text>
              <Text style={{ color: "#fff", fontSize: 15, marginTop: 6, marginBottom: 6 }}>
                {latestText.text_field}
              </Text>
              <Text style={{ color: "#ffffff60", fontSize: 12, textAlign: "right" }}>
                {new Date(latestText.created_at).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontSize: 13 }}>
              {!isOnline ? "Note non disponibili offline" : t("no_data_available")}
            </Text>
          )}
        </View>

        {/* Descrizione */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
          <Text style={{ color: "#789fd6", fontSize: 14, marginBottom: 10 }}>{t("description")}</Text>
          <Text style={{ color: "#fff", fontSize: 14, lineHeight: 22 }}>{reading.description || "—"}</Text>
        </View>

        {/* Impianto / Componente */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
          <Text style={{ color: "#789fd6", fontSize: 14, marginBottom: 10 }}>
            {t("system")} / {t("component")}
          </Text>
          <Text style={{ color: "#fff", fontSize: 14 }}>
            {reading.element?.element_model?.ESWBS_code} {reading.element?.element_model?.LCN_name}
          </Text>
        </View>

        {/* Ricorrenza / Squadra */}
        <View
          style={{
            flexDirection: "row",
            gap: isTablet ? 16 : 10,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16 }}>
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("anniversary")}</Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {reading.recurrence}{t("days_short")}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16 }}>
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("assignment_team")}</Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{reading.team || "—"}</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: isTablet ? 20 : 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#789fd6", fontSize: 14, flex: 1 }}>Tag</Text>
            <TouchableOpacity onPress={() => setShowTagInput((p) => !p)}>
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {showTagInput && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <TextInput value={newTag} onChangeText={setNewTag}
                placeholder={t("write_here")} placeholderTextColor="#6b7280"
                style={{ flex: 1, backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 10 }} />
              <TouchableOpacity onPress={handleAddTag}
                style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
                  alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{t("add")}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {tags.map((tag, i) => (
              <View key={i} style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length],
                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
                flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(i)}>
                  <Ionicons name="close-circle" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {tags.length === 0 && (
              <Text style={{ color: "#ffffff40", fontSize: 13 }}>{t("no_data_available")}</Text>
            )}
          </View>
        </View>

        {/* Torna alla lista */}
        <TouchableOpacity onPress={() => router.back()}
          style={{ backgroundColor: "#ffffff10", borderRadius: 12, padding: 18,
            alignItems: "center", marginBottom: 32 }}>
          <Text style={{ color: "#fff", fontSize: 15 }}>{t("return_to_the_list")}</Text>
        </TouchableOpacity>

      </ScrollView>

      <EditValueModal
        visible={editValue}
        value={reading.value || ""}
        onSave={handleSaveValue}
        onClose={() => setEditValue(false)}
        isOnline={isOnline}
      />
      <NoteModal
        visible={noteModal}
        onClose={() => setNoteModal(false)}
        entityId={id}
        authorId={String(user?.id)}
        entityType="reading"
        onSuccess={fetchNotes}
      />
      <PhotoHistoryModal visible={photoHistory} onClose={() => setPhotoHistory(false)} photos={photos} />
      <TextHistoryModal  visible={textHistory}  onClose={() => setTextHistory(false)}  texts={texts} />
    </SafeAreaView>
  );
}