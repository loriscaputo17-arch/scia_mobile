import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  ActivityIndicator, Alert, Modal, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import { useLocalSearchParams, router } from "expo-router";
import NoteModal from "@/components/organisms/NoteModal";
import FacilitiesModal from "@/components/organisms/FacilitiesModal";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchLocation = async (id: string) => {
  const res = await api.get(`/locations/getLocation?id=${id}`);
  return res.data.location ?? res.data ?? null;
};
const fetchSpares = async (locationId: string) => {
  const res = await api.get(`/spare/getSpares?location_id=${locationId}`);
  return res.data.spares || [];
};
const getPhotos = async (id: string) =>
  [...((await api.get(`/uploadFiles/getPhotosGeneral/${id}/location`)).data?.notes || [])]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
const getAudios = async (id: string) =>
  [...((await api.get(`/uploadFiles/getAudiosGeneral/${id}/location`)).data?.notes || [])]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
const getTexts = async (id: string) =>
  [...((await api.get(`/uploadFiles/getTextNotesGeneral/${id}/location`)).data?.notes || [])]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

// ─── Cache keys ───────────────────────────────────────────────────────────────
const LOC_CACHE    = (id: string) => `cache_location_${id}`;
const SPARES_CACHE = (id: string) => `cache_location_spares_${id}`;

// ─── Photo History Modal ──────────────────────────────────────────────────────
function PhotoHistoryModal({ visible, onClose, photos, loading }: any) {
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: 24, maxHeight: "85%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico fotografico</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView>
              {loading ? <ActivityIndicator color="#789fd6" /> :
                photos.length === 0
                  ? <Text style={{ color: "#ffffff60", fontStyle: "italic" }}>Nessuna foto</Text>
                  : photos.map((p: any, i: number) => (
                      <TouchableOpacity key={i} onPress={() => setZoom(p.image_url)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 }}>
                        <Image source={{ uri: p.image_url }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                        <View>
                          <Text style={{ color: "#fff", fontWeight: "600" }}>{p.authorDetails?.first_name} {p.authorDetails?.last_name}</Text>
                          <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>{new Date(p.created_at).toLocaleString("it-IT")}</Text>
                        </View>
                      </TouchableOpacity>
                    ))
              }
            </ScrollView>
            <TouchableOpacity onPress={onClose}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={!!zoom} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center" }}
          onPress={() => setZoom(null)}>
          {zoom && <Image source={{ uri: zoom }} style={{ width: "95%", height: "80%" }} resizeMode="contain" />}
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Audio History Modal ──────────────────────────────────────────────────────
function AudioHistoryModal({ visible, onClose, audios, loading }: any) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico audio</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {loading ? <ActivityIndicator color="#789fd6" /> :
              audios.length === 0
                ? <Text style={{ color: "#ffffff60", fontStyle: "italic" }}>Nessuna nota audio</Text>
                : audios.map((a: any, i: number) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12,
                      backgroundColor: "#00000030", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#789fd6",
                        alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          {a.authorDetails?.first_name?.[0]}{a.authorDetails?.last_name?.[0]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#fff", fontWeight: "600" }}>{a.authorDetails?.first_name} {a.authorDetails?.last_name}</Text>
                        <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(a.created_at).toLocaleString("it-IT")}</Text>
                      </View>
                      <Ionicons name="play-circle-outline" size={34} color="#789fd6" />
                    </View>
                  ))
            }
          </ScrollView>
          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Text History Modal ───────────────────────────────────────────────────────
function TextHistoryModal({ visible, onClose, texts, loading }: any) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico note testo</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {loading ? <ActivityIndicator color="#789fd6" /> :
              texts.length === 0
                ? <Text style={{ color: "#ffffff60", fontStyle: "italic" }}>Nessuna nota testo</Text>
                : texts.map((t: any, i: number) => (
                    <View key={i} style={{ backgroundColor: "#00000038", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <Text style={{ color: "#ffffff80", fontSize: 12 }}>{t.authorDetails?.first_name} {t.authorDetails?.last_name}</Text>
                      <Text style={{ color: "#fff", marginTop: 6, marginBottom: 6, lineHeight: 20 }}>{t.text_field}</Text>
                      <Text style={{ color: "#ffffff60", fontSize: 11, alignSelf: "flex-end" }}>{new Date(t.created_at).toLocaleString("it-IT")}</Text>
                    </View>
                  ))
            }
          </ScrollView>
          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Section({ title, children }: any) {
  const { isTablet } = useDevice();

  return (
    <View
      style={{
        backgroundColor: "#022a52",
        borderRadius: 14,
        padding: isTablet ? 20 : 16,
        marginBottom: isTablet ? 18 : 14,
      }}
    >
      {title && (
        <Text
          style={{
            color: "#789fd6",
            fontSize: isTablet ? 13 : 12,
            fontWeight: "700",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8,
      borderBottomWidth: 1, borderBottomColor: "#ffffff10" }}>
      <Text style={{ color: "#ffffff80", fontSize: 13 }}>{label}</Text>
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", maxWidth: "55%", textAlign: "right" }}>{value}</Text>
    </View>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LocationDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useSelector((s: RootState) => s.auth?.user) as any;
  const { isTablet } = useDevice();

  const [location,     setLocation]     = useState<any>(null);
  const [spares,       setSpares]       = useState<any[]>([]);
  const [photos,       setPhotos]       = useState<any[]>([]);
  const [audios,       setAudios]       = useState<any[]>([]);
  const [texts,        setTexts]        = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [isOnline,     setIsOnline]     = useState(true);
  const [fromCache,    setFromCache]    = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  const [noteOpen,       setNoteOpen]       = useState(false);
  const [photoHistOpen,  setPhotoHistOpen]  = useState(false);
  const [audioHistOpen,  setAudioHistOpen]  = useState(false);
  const [textHistOpen,   setTextHistOpen]   = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);

  // ── Monitor connettività ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Caricamento: API → cache → fallback ───────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);

    const locKey    = LOC_CACHE(id);
    const sparesKey = SPARES_CACHE(id);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    if (online) {
      try {
        const [loc, sp] = await Promise.all([fetchLocation(id), fetchSpares(id)]);
        setLocation(loc);
        setSpares(sp);
        setFromCache(false);
        await AsyncStorage.setItem(locKey,    JSON.stringify(loc));
        await AsyncStorage.setItem(sparesKey, JSON.stringify(sp));

        // Note in background (non cacheate)
        setNotesLoading(true);
        const [p, a, t] = await Promise.all([getPhotos(id), getAudios(id), getTexts(id)]);
        setPhotos(p); setAudios(a); setTexts(t);
      } catch {
        await loadFromCache(locKey, sparesKey);
      } finally { setNotesLoading(false); }
    } else {
      await loadFromCache(locKey, sparesKey);
    }

    if (!silent) setLoading(false);
  }, [id]);

  const loadFromCache = async (locKey: string, sparesKey: string) => {
    try {
      const [rawLoc, rawSp] = await Promise.all([
        AsyncStorage.getItem(locKey),
        AsyncStorage.getItem(sparesKey),
      ]);
      setLocation(rawLoc ? JSON.parse(rawLoc) : null);
      setSpares(rawSp ? JSON.parse(rawSp) : []);
      setFromCache(true);
      setPhotos([]); setAudios([]); setTexts([]); // note non disponibili offline
    } catch {
      setLocation(null);
    }
  };

  useEffect(() => { load(); }, [id]);

  // ── Ricarica live quando torna online ─────────────────────────────────────
  useEffect(() => {
    if (isOnline && fromCache) load(true);
  }, [isOnline]);

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#789fd6" size="large" />
    </SafeAreaView>
  );

  if (!location) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={fromCache ? "cloud-offline-outline" : "warning-outline"} size={48} color="#ffffff40" />
      <Text style={{ color: "#ffffff60", marginTop: 12 }}>
        {fromCache ? "Nessun dato in cache" : "Location non trovata"}
      </Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
        <Text style={{ color: "#789fd6" }}>← Torna indietro</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>

      {/* Header */}
      <View
        style={{
          paddingHorizontal: isTablet ? 24 : 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#ffffff10",
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 1100 : "100%",
        }}
      >
        <DashboardHeader />

        {/* Banner offline */}
        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 10, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — dati dalla cache
            </Text>
          </View>
        )}

        {/* Banner aggiornamento */}
        {isOnline && fromCache && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginTop: 10, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Aggiornamento...</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, marginBottom: 10 }}>
          <Ionicons name="chevron-back" size={18} color="#ffffff80" />
          <Text style={{ color: "#ffffff80", fontSize: 14 }}>Ubicazioni</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: isTablet ? 24 : 20,
                fontWeight: "700",
              }}
            >
              {location.warehouseInfo?.name ?? "—"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="location-outline" size={14} color="#789fd6" />
              <Text style={{ color: "#789fd6", fontSize: 14 }}>{location.location ?? "—"}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setNoteOpen(true)}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 12,
              paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Aggiungi nota</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: isTablet ? 24 : 16,
          paddingBottom: 48,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 1100 : "100%",
        }}
      >
        {/* Note fotografiche */}
        <Section title="Note fotografiche">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#ffffff80", fontSize: 13 }}>
              {!isOnline ? "Non disponibili offline" : photos.length > 0 ? `${photos.length} foto` : "Nessuna foto"}
            </Text>
            {isOnline && (
              <TouchableOpacity onPress={() => setPhotoHistOpen(true)}>
                <Text style={{ color: "#fff", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            )}
          </View>
          {photos[0] && isOnline ? (
            <TouchableOpacity onPress={() => setPhotoHistOpen(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Image source={{ uri: photos[0].image_url }} style={{ width: 80, height: 80, borderRadius: 10 }} />
              <View>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{photos[0].authorDetails?.first_name} {photos[0].authorDetails?.last_name}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>{new Date(photos[0].created_at).toLocaleString("it-IT")}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "#ffffff40", fontStyle: "italic" }}>
              {!isOnline ? "Connettiti per vedere le note" : "Nessuna foto disponibile"}
            </Text>
          )}
        </Section>

        {/* Note vocali */}
        <Section title="Note vocali">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#ffffff80", fontSize: 13 }}>
              {!isOnline ? "Non disponibili offline" : audios.length > 0 ? `${audios.length} audio` : "Nessuna nota vocale"}
            </Text>
            {isOnline && (
              <TouchableOpacity onPress={() => setAudioHistOpen(true)}>
                <Text style={{ color: "#fff", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            )}
          </View>
          {audios[0] && isOnline ? (
            <TouchableOpacity onPress={() => setAudioHistOpen(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 12,
                backgroundColor: "#00000030", borderRadius: 10, padding: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#789fd6",
                alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {audios[0].authorDetails?.first_name?.[0]}{audios[0].authorDetails?.last_name?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{audios[0].authorDetails?.first_name} {audios[0].authorDetails?.last_name}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(audios[0].created_at).toLocaleString("it-IT")}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={34} color="#789fd6" />
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "#ffffff40", fontStyle: "italic" }}>
              {!isOnline ? "Connettiti per vedere le note" : "Nessuna nota vocale"}
            </Text>
          )}
        </Section>

        {/* Note testo */}
        <Section title="Note testo">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#ffffff80", fontSize: 13 }}>
              {!isOnline ? "Non disponibili offline" : texts.length > 0 ? `${texts.length} note` : "Nessuna nota testo"}
            </Text>
            {isOnline && (
              <TouchableOpacity onPress={() => setTextHistOpen(true)}>
                <Text style={{ color: "#fff", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            )}
          </View>
          {texts[0] && isOnline ? (
            <View style={{ backgroundColor: "#00000038", borderRadius: 10, padding: 14 }}>
              <Text style={{ color: "#ffffff80", fontSize: 12, marginBottom: 4 }}>
                {texts[0].authorDetails?.first_name} {texts[0].authorDetails?.last_name}
              </Text>
              <Text style={{ color: "#fff", lineHeight: 20 }}>{texts[0].text_field}</Text>
              <Text style={{ color: "#ffffff60", fontSize: 11, marginTop: 6, alignSelf: "flex-end" }}>
                {new Date(texts[0].created_at).toLocaleString("it-IT")}
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontStyle: "italic" }}>
              {!isOnline ? "Connettiti per vedere le note" : "Nessuna nota testo"}
            </Text>
          )}
        </Section>

        {/* Ricambi in ubicazione */}
        <Section title="Ricambi in ubicazione">
          {spares.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {spares.map((s: any, i: number) => {
                const qty = s.quantity ?? 0;
                const dotColor = qty > 5 ? "#2DB647" : qty > 0 ? "#FFBF25" : "#D0021B";
                const dotLabel = qty > 5 ? "Disponibile" : qty > 0 ? "In esaurimento" : "Non disponibile";
                return (
                  <TouchableOpacity key={i} onPress={() => router.push(`/(app)/spare/${s.id}` as any)}
                    style={{ backgroundColor: "#ffffff10", borderRadius: 10, padding: 12,
                      marginRight: 10, minWidth: isTablet ? 200 : 150, borderWidth: 1, borderColor: "#ffffff15" }}>
                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }} numberOfLines={2}>{s.Part_name}</Text>
                    <Text style={{ color: "#63c7ff", fontSize: 12, marginTop: 4 }}>Qty: {qty}</Text>
                    {s.part_number && <Text style={{ color: "#ffffff60", fontSize: 11, marginTop: 2 }}>PN: {s.part_number}</Text>}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                      <Text style={{ color: "#ffffff80", fontSize: 11 }}>{dotLabel}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={{ color: "#ffffff40", fontStyle: "italic" }}>
              {fromCache && !isOnline
                ? "Nessun ricambio in cache per questa ubicazione"
                : "Nessun ricambio in questa ubicazione"}
            </Text>
          )}
        </Section>

        {/* Impianto / Componente */}
        {location.element_eswbs_instance_id && (
          <Section title="Impianto / Componente">
            <TouchableOpacity onPress={() => setFacilitiesOpen(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#ffffff15",
                alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="construct-outline" size={20} color="#789fd6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{location.element_eswbs_instance_id}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ffffff80" />
            </TouchableOpacity>
          </Section>
        )}

        {/* Informazioni */}
        <Section title="Informazioni">
          <InfoRow label="Magazzino"  value={location.warehouseInfo?.name ?? null} />
          <InfoRow label="Ubicazione" value={location.location ?? null} />
          <InfoRow label="Ricambi"    value={spares.length > 0 ? `${spares.length} ricambi` : null} />
          {location.created_at && (
            <InfoRow label="Creata il"
              value={new Date(location.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })} />
          )}
        </Section>

      </ScrollView>

      {/* Modali */}
      <NoteModal
        visible={noteOpen}
        onClose={() => setNoteOpen(false)}
        entityId={id}
        authorId={String(user?.id)}
        entityType="location"
        onSuccess={() => isOnline && load(true)}
      />
      <PhotoHistoryModal visible={photoHistOpen} onClose={() => setPhotoHistOpen(false)} photos={photos} loading={notesLoading} />
      <AudioHistoryModal visible={audioHistOpen} onClose={() => setAudioHistOpen(false)} audios={audios} loading={notesLoading} />
      <TextHistoryModal  visible={textHistOpen}  onClose={() => setTextHistOpen(false)}  texts={texts}  loading={notesLoading} />
      <FacilitiesModal
        visible={facilitiesOpen}
        onClose={() => setFacilitiesOpen(false)}
        eswbsCode={location.element_eswbs_instance_id}
      />
    </SafeAreaView>
  );
}