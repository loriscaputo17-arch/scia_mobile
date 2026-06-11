import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { router } from "expo-router";
import NoteModal from "@/components/organisms/NoteModal";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineAction } from "@/hooks/useOfflineAction";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchTasks = async (shipId: string, userId: string) => {
  const res = await api.get(`/checklist/getTasks?ship_id=${shipId}&userId=${userId}`);
  return res.data.tasks || [];
};
const markAsOkApi = async (taskId: string, payload: any) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) =>
    fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v))
  );
  await api.patch(`/maintenance/markAsOk/${taskId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
const markAsApi = async (taskId: string, mark: number) =>
  api.patch(`/maintenance/reportAnomaly/${taskId}`, { mark });

const getPhotosGeneral = async (id: string, type: string) =>
  (await api.get(`/uploadFiles/getPhotosGeneral/${id}/${type}`)).data || { notes: [] };
const getAudiosGeneral = async (id: string, type: string) =>
  (await api.get(`/uploadFiles/getAudiosGeneral/${id}/${type}`)).data || { notes: [] };
const getTextsGeneral = async (id: string, type: string) =>
  (await api.get(`/uploadFiles/getTextsGeneral/${id}/${type}`)).data || { notes: [] };

// ─── Cache key ────────────────────────────────────────────────────────────────
const TASKS_CACHE = (shipId: string) => `cache_checklist_${shipId}`;

// ─── Status color ─────────────────────────────────────────────────────────────
const getDueDaysColor = (expirationDate?: string) => {
  if (!expirationDate) return "#6b7280";
  const days = Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
  if (days < -15) return "#D0021B";
  if (days < 0)   return "#F47216";
  if (days <= 3)  return "#FFBF25";
  if (days > 15)  return "#2DB647";
  return "#CCCCCC";
};

// ─── Select Type Modal ────────────────────────────────────────────────────────
function SelectTypeModal({ visible, onClose, tasks, onSelect }: {
  visible: boolean; onClose: () => void; tasks: any[]; onSelect: (t: any) => void;
}) {
  const { t } = useTranslation("maintenance");
  const [grouped,    setGrouped]    = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<any>(null);

  useEffect(() => {
    if (!tasks.length) return;
    const map = new Map<any, any>();
    tasks.forEach((task) => {
      const key = task.maintenance_list?.id;
      if (!key) return;
      if (!map.has(key)) map.set(key, { id: key, title: task.maintenance_list.name, tasks: [] });
      map.get(key).tasks.push(task);
    });
    setGrouped(Array.from(map.values()));
  }, [tasks]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52",
          borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("select_checklist")}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {grouped.map((g) => (
              <TouchableOpacity key={g.id} onPress={() => setSelectedId(g.id)}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14,
                  borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginRight: 14,
                  borderColor: selectedId === g.id ? "#789fd6" : "#ffffff50",
                  backgroundColor: selectedId === g.id ? "#789fd6" : "transparent" }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>{g.title}</Text>
                  <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>Task: {g.tasks.length}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity disabled={!selectedId}
            onPress={() => { const f = grouped.find((g) => g.id === selectedId); if (f) { onSelect(f); onClose(); } }}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center",
              marginTop: 16, opacity: !selectedId ? 0.5 : 1 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("confirm")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, filters, onApply }: {
  visible: boolean; onClose: () => void; filters: any; onApply: (f: any) => void;
}) {
  const { t } = useTranslation("maintenance");
  const [local, setLocal] = useState(filters);
  useEffect(() => setLocal(filters), [filters]);

  const toggle = (cat: string, key: string) =>
    setLocal((p: any) => ({ ...p, [cat]: { ...p[cat], [key]: !p[cat][key] } }));

  const macros = [
    "100 - Scafo", "200 - Propulsioni/Motori", "300 - Impianto elettrico",
    "400 - Comando, controllo e sorveglianza", "500 - Impianti ausiliari",
    "600 - Allestimento e arredamento", "700 - Armamenti",
    "800 - Integration / Engineering", "900 - Ship assembly / Support services",
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 300,
          backgroundColor: "#022a52", padding: 24, paddingTop: 80 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>{t("filters")}</Text>

          <Text style={{ color: "#789fd6", marginBottom: 10 }}>Task</Text>
          <TouchableOpacity onPress={() => toggle("task", "nascondiTaskEseguiti")}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#fff", flex: 1 }}>Nascondi task eseguiti</Text>
            <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
              borderColor: local.task.nascondiTaskEseguiti ? "#789fd6" : "#ffffff40",
              backgroundColor: local.task.nascondiTaskEseguiti ? "#789fd6" : "transparent" }} />
          </TouchableOpacity>

          <Text style={{ color: "#789fd6", marginBottom: 10 }}>{t("assignment_team")}</Text>
          {["operatori", "equipaggio", "manutentori", "comando"].map((k) => (
            <TouchableOpacity key={k} onPress={() => toggle("squadraDiAssegnazione", k)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#fff", flex: 1, textTransform: "capitalize" }}>{k}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
                borderColor: local.squadraDiAssegnazione[k] ? "#789fd6" : "#ffffff40",
                backgroundColor: local.squadraDiAssegnazione[k] ? "#789fd6" : "transparent" }} />
            </TouchableOpacity>
          ))}

          <Text style={{ color: "#789fd6", marginBottom: 10, marginTop: 8 }}>{t("macrogroup")}</Text>
          <ScrollView style={{ maxHeight: 220 }}>
            {macros.map((m) => (
              <TouchableOpacity key={m} onPress={() => toggle("macrogruppoESWBS", m)}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#fff", flex: 1, fontSize: 12 }}>{m}</Text>
                <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 2,
                  borderColor: local.macrogruppoESWBS[m] ? "#789fd6" : "#ffffff40",
                  backgroundColor: local.macrogruppoESWBS[m] ? "#789fd6" : "transparent" }} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={() => { onApply(local); onClose(); }}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("confirm")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Notes View Modal ─────────────────────────────────────────────────────────
function NotesViewModal({ visible, onClose, taskId }: {
  visible: boolean; onClose: () => void; taskId: string;
}) {
  const { t } = useTranslation("maintenance");
  const [photo,   setPhoto]   = useState<any>(null);
  const [audio,   setAudio]   = useState<any>(null);
  const [text,    setText]    = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !taskId) return;
    setLoading(true);
    Promise.all([
      getPhotosGeneral(taskId, "maintenance"),
      getAudiosGeneral(taskId, "maintenance"),
      getTextsGeneral(taskId, "maintenance"),
    ]).then(([p, a, tx]) => {
      const sort = (arr: any[]) => [...arr].sort((x, y) =>
        new Date(y.created_at).getTime() - new Date(x.created_at).getTime());
      setPhoto(sort(p.notes  || [])[0] || null);
      setAudio(sort(a.notes  || [])[0] || null);
      setText(sort(tx.notes  || [])[0] || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [visible, taskId]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}
        onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{t("notes")}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator color="#789fd6" style={{ paddingVertical: 24 }} /> : (
            <>
              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>{t("photographic_notes")}</Text>
              {photo
                ? <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <View style={{ width: 70, height: 70, borderRadius: 8, backgroundColor: "#ffffff15",
                      alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="image-outline" size={28} color="#789fd6" />
                    </View>
                    <View>
                      <Text style={{ color: "#fff" }}>{photo.authorDetails?.first_name} {photo.authorDetails?.last_name}</Text>
                      <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(photo.created_at).toLocaleString()}</Text>
                    </View>
                  </View>
                : <Text style={{ color: "#ffffff40", fontSize: 13, marginBottom: 16 }}>{t("no_data_available")}</Text>}

              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>{t("vocal_notes")}</Text>
              {audio
                ? <View style={{ flexDirection: "row", alignItems: "center", gap: 12,
                    backgroundColor: "#00000030", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#789fd6",
                      alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        {audio.authorDetails?.first_name?.[0]}{audio.authorDetails?.last_name?.[0]}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 13 }}>{audio.authorDetails?.first_name} {audio.authorDetails?.last_name}</Text>
                      <Text style={{ color: "#ffffff80", fontSize: 11 }}>{new Date(audio.created_at).toLocaleString()}</Text>
                    </View>
                    <Ionicons name="musical-notes-outline" size={20} color="#789fd6" />
                  </View>
                : <Text style={{ color: "#ffffff40", fontSize: 13, marginBottom: 16 }}>{t("no_audio_notes")}</Text>}

              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>{t("text_notes")}</Text>
              {text
                ? <View style={{ backgroundColor: "#00000038", borderRadius: 8, padding: 12 }}>
                    <Text style={{ color: "#ffffff80", fontSize: 12 }}>{text.authorDetails?.first_name} {text.authorDetails?.last_name}</Text>
                    <Text style={{ color: "#fff", fontSize: 14, marginTop: 6 }}>{text.text_field}</Text>
                    <Text style={{ color: "#ffffff60", fontSize: 11, marginTop: 6, textAlign: "right" }}>
                      {new Date(text.created_at).toLocaleString()}
                    </Text>
                  </View>
                : <Text style={{ color: "#ffffff40", fontSize: 13 }}>{t("no_data_available")}</Text>}
            </>
          )}
          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>{t("close_button")}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Checklist Row ────────────────────────────────────────────────────────────
function ChecklistRow({ item, onReload, isOnline }: {
  item: any; onReload: () => void; isOnline: boolean;
}) {
  const { t } = useTranslation("maintenance");
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { execute } = useOfflineAction();

  const [noteViewOpen, setNoteViewOpen] = useState(false);
  const [noteAddOpen,  setNoteAddOpen]  = useState(false);
  const [uploading,    setUploading]    = useState(false);

  // Stato ottimistico locale — sovrascrive item.execution_state finché non ricarica
  const [localState, setLocalState] = useState<string | null>(null);

  const effectiveState = localState ?? item.execution_state;
  const isDone    = effectiveState !== null;
  const isOk      = effectiveState === "1" || effectiveState === 1;
  const isAnomaly = effectiveState === "2" || effectiveState === 2;

  const dueDaysColor = getDueDaysColor(item.data_recovery_expiration);
  const hasPhoto = (item.photographicNotes?.length || 0) > 0;
  const hasAudio = (item.vocalNotes?.length        || 0) > 0;
  const hasText  = (item.textNotes?.length         || 0) > 0;

  const handleOk = async () => {
    if (uploading) return;
    setUploading(true);
    await execute({
      type: "MARK_MAINTENANCE_OK",
      payload: {
        taskId: item.id,
        maintenanceList_id: item.id,
        userId: user?.id,
        userType: "User logged in",
        time: 0, level: null, spares: [],
      },
      optimistic: () => setLocalState("1"),
    });
    setUploading(false);
    if (isOnline) onReload();
  };

  const handleAnomaly = async () => {
    if (uploading) return;
    setUploading(true);
    await execute({
      type: "MARK_MAINTENANCE_ANOMALY",
      payload: { taskId: item.id, mark: 2, userId: user?.id },
      optimistic: () => setLocalState("2"),
    });
    setUploading(false);
    if (isOnline) onReload();
  };

  return (
    <View style={{ backgroundColor: isDone ? "#022a5288" : "#022a52", borderRadius: 10,
      marginBottom: 10, overflow: "hidden", opacity: isDone ? 0.85 : 1 }}>
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        backgroundColor: dueDaysColor }} />

      <TouchableOpacity onPress={() => router.push(`/(app)/checklist/${item.id}` as any)}
        style={{ padding: 14, paddingLeft: 18 }}>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 4 }} numberOfLines={2}>
          {item.maintenance_list?.name}
        </Text>
        <Text style={{ color: "#ffffff80", fontSize: 13, marginBottom: 8 }} numberOfLines={1}>
          {item.Element?.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ backgroundColor: "#ffffff15", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ color: "#fff", fontSize: 12 }}>
              {item.maintenance_list?.recurrency_type?.name || "—"}
            </Text>
          </View>

          {/* Badge stato offline */}
          {localState && !isOnline && (
            <View style={{ backgroundColor: "#F4721633", borderRadius: 12,
              paddingHorizontal: 8, paddingVertical: 2,
              flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="cloud-upload-outline" size={11} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 10, fontWeight: "700" }}>In attesa</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setNoteViewOpen(true)}
            style={{ flexDirection: "row", gap: 8 }}>
            <Ionicons name="camera-outline"        size={18} color={hasPhoto ? "#fff" : "#ffffff25"} />
            <Ionicons name="mic-outline"           size={18} color={hasAudio ? "#fff" : "#ffffff25"} />
            <Ionicons name="document-text-outline" size={18} color={hasText  ? "#fff" : "#ffffff25"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setNoteAddOpen(true)} style={{ marginLeft: "auto" }}>
            <Ionicons name="add-circle-outline" size={20} color="#789fd6" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* OK / Anomaly */}
      <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#ffffff15" }}>
        <TouchableOpacity onPress={handleAnomaly} disabled={uploading}
          style={{ flex: 1, padding: 12, alignItems: "center", flexDirection: "row",
            justifyContent: "center", gap: 8,
            backgroundColor: isAnomaly ? "#FFBF2533" : "transparent" }}>
          {uploading && isAnomaly
            ? <ActivityIndicator size="small" color="#FFBF25" />
            : <Text style={{ color: isAnomaly ? "#FFBF25" : "#ffffff80", fontSize: 13, fontWeight: "600" }}>
                {t("anomaly")}
              </Text>
          }
        </TouchableOpacity>

        <View style={{ width: 1, backgroundColor: "#ffffff15" }} />

        <TouchableOpacity onPress={handleOk} disabled={uploading}
          style={{ flex: 1, padding: 12, alignItems: "center", flexDirection: "row",
            justifyContent: "center", gap: 8,
            backgroundColor: isOk ? "#2DB64733" : "transparent" }}>
          {uploading && isOk
            ? <ActivityIndicator size="small" color="#2DB647" />
            : <Text style={{ color: isOk ? "#2DB647" : "#ffffff80", fontSize: 13, fontWeight: "600" }}>
                {t("ok")}
              </Text>
          }
        </TouchableOpacity>
      </View>

      <NotesViewModal visible={noteViewOpen} onClose={() => setNoteViewOpen(false)} taskId={String(item.id)} />
      <NoteModal
        visible={noteAddOpen}
        onClose={() => setNoteAddOpen(false)}
        entityId={String(item.id)}
        authorId={String(user?.id)}
        entityType="maintenance"
        onSuccess={() => { setNoteAddOpen(false); onReload(); }}
      />
    </View>
  );
}

// ─── Checklist Page ───────────────────────────────────────────────────────────
export default function ChecklistPage() {
  const { t } = useTranslation("maintenance");
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { isTablet } = useDevice();

  const [tasks,        setTasks]        = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [isOnline,     setIsOnline]     = useState(true);
  const [fromCache,    setFromCache]    = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectOpen,   setSelectOpen]   = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [filters, setFilters] = useState({
    task: { nascondiTaskEseguiti: false },
    squadraDiAssegnazione: { operatori: false, equipaggio: false, manutentori: false, comando: false },
    macrogruppoESWBS: {
      "100 - Scafo": false, "200 - Propulsioni/Motori": false,
      "300 - Impianto elettrico": false, "400 - Comando, controllo e sorveglianza": false,
      "500 - Impianti ausiliari": false, "600 - Allestimento e arredamento": false,
      "700 - Armamenti": false, "800 - Integration / Engineering": false,
      "900 - Ship assembly / Support services": false,
    },
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
  const loadTasks = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);

    const key = TASKS_CACHE(shipId);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    if (online) {
      try {
        const data = await fetchTasks(shipId, String(user.id));
        setTasks(data);
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
      if (raw) { setTasks(JSON.parse(raw)); setFromCache(true); }
      else { setTasks([]); setFromCache(true); }
    } catch { setTasks([]); }
  };

  useEffect(() => { loadTasks(); }, [user]);

  // ── Ricarica live quando torna online ─────────────────────────────────────
  useEffect(() => {
    if (isOnline && fromCache) loadTasks(true);
  }, [isOnline]);

  // ── Filtri + sort ──────────────────────────────────────────────────────────
  const allTasks = selectedType ? selectedType.tasks : tasks;

  const filtered = [...allTasks].filter((task) => {
    if (filters.task.nascondiTaskEseguiti && task.execution_state !== null) return false;
    const eswbs = task?.Element?.element_model?.ESWBS_code?.trim();
    const macroActive = Object.entries(filters.macrogruppoESWBS).filter(([, v]) => v);
    if (macroActive.length > 0) {
      if (!eswbs || !macroActive.some(([k]) => eswbs[0] === k[0])) return false;
    }
    const teamActive = Object.entries(filters.squadraDiAssegnazione).filter(([, v]) => v);
    if (teamActive.length > 0) {
      const team = task?.assigned_to?.team;
      if (!team || !(filters.squadraDiAssegnazione as any)[team]) return false;
    }
    return true;
  }).sort((a, b) => {
    const aDone = a.execution_state !== null;
    const bDone = b.execution_state !== null;
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  const activeFiltersCount = [
    filters.task.nascondiTaskEseguiti,
    ...Object.values(filters.squadraDiAssegnazione),
    ...Object.values(filters.macrogruppoESWBS),
  ].filter(Boolean).length;

  const pendingCount = tasks.filter((task) => task._pendingState).length;

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
              Offline — azioni in coda · dati dalla cache
            </Text>
          </View>
        )}

        {/* Banner aggiornamento */}
        {isOnline && fromCache && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Aggiornamento checklist...
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center",
          marginTop: (!isOnline || fromCache) ? 8 : 16, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setSelectOpen(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {selectedType
                ? `${selectedType.title} (${selectedType.tasks?.length})`
                : `${t("all")} (${filtered.length})`}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilterOpen(true)}
            style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8 }}>
            <Ionicons name="filter-outline" size={20} color="#fff" />
            {activeFiltersCount > 0 && (
              <View style={{ position: "absolute", top: 2, right: 2, backgroundColor: "#789fd6",
                borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {selectedType && (
          <TouchableOpacity onPress={() => setSelectedType(null)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Ionicons name="close-circle" size={16} color="#789fd6" />
            <Text style={{ color: "#789fd6", fontSize: 13 }}>{t("view_all")}</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="clipboard-outline" size={64} color="#789fd6" />
            <Text style={{ color: "#789fd6", marginTop: 16, fontSize: 16 }}>
              {fromCache ? "Nessun dato in cache" : t("no_data_available")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ChecklistRow item={item} onReload={() => loadTasks()} isOnline={isOnline} />
            )}
            showsVerticalScrollIndicator={false}
            numColumns={isTablet ? 2 : 1}
            columnWrapperStyle={isTablet ? { gap: 10 } : undefined}
            contentContainerStyle={isTablet ? { gap: 10 } : undefined}
          />
        )}
      </View>

      <SelectTypeModal
        visible={selectOpen} onClose={() => setSelectOpen(false)}
        tasks={tasks} onSelect={setSelectedType}
      />
      <FilterModal
        visible={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} onApply={setFilters}
      />
    </SafeAreaView>
  );
}