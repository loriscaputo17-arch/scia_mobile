import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  ActivityIndicator, Alert, Modal, Pressable, TextInput, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import { useLocalSearchParams, router } from "expo-router";
import Pdf from "react-native-pdf";
import RNBlobUtil from "react-native-blob-util";
import NoteModal from "@/components/organisms/NoteModal";
import FacilitiesModal from "@/components/organisms/FacilitiesModal";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineAction } from "@/hooks/useOfflineAction";
import { useDevice } from "@/hooks/useDevice";

const fetchJob = async (taskId: string, shipId: string) => {
  const res = await api.get(`/maintenance/job?taskId=${taskId}&shipId=${shipId}`);
  const jobs = res.data?.jobs;
  if (Array.isArray(jobs)) return jobs[0] ?? null;
  return jobs ?? null;
};
const apiUpdateStatus      = async (taskId: string, status_id: number) => api.post(`/maintenance/updateStatus/${taskId}`, { status_id });
const apiSaveStatusComment = async (taskId: string, data: any) => api.post(`/maintenance/saveStatusComment/${taskId}`, data);
const apiMarkAsOk          = async (taskId: string) => api.patch(`/maintenance/markAsOk/${taskId}`);
const apiMarkAs            = async (taskId: string, mark: number) => api.patch(`/maintenance/reportAnomaly/${taskId}`, { mark });
const apiGetPhotos          = async (id: string) => [...((await api.get(`/uploadFiles/getPhotosGeneral/${id}/maintenance`)).data?.notes || [])].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
const apiGetAudios          = async (id: string) => [...((await api.get(`/uploadFiles/getAudiosGeneral/${id}/maintenance`)).data?.notes || [])].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
const apiGetTexts           = async (id: string) => [...((await api.get(`/uploadFiles/getTextNotesGeneral/${id}/maintenance`)).data?.notes || [])].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
const apiGetLevels          = async () => (await api.get("/admin/maintenanceLevel/getMaintenanceLevels")).data || [];

// ─── Cache key ────────────────────────────────────────────────────────────────
const JOB_CACHE = (id: string) => `cache_maint_job_${id}`;

// ─── PDF helpers ──────────────────────────────────────────────────────────────
const getCachedPath = (url: string) => {
  const raw = url.split("?")[0].split("/").pop() || "document";
  const safe = raw.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${RNBlobUtil.fs.dirs.CacheDir}/${safe}.pdf`;
};
const isFileCached = async (path: string) => { try { return await RNBlobUtil.fs.exists(path); } catch { return false; } };
const downloadPdf  = async (url: string, path: string) => {
  await RNBlobUtil.config({ path, fileCache: true }).fetch("GET", url.split("#")[0]);
};

// ─── PDF Viewer Modal ─────────────────────────────────────────────────────────
function PdfViewerModal({ visible, onClose, url, isOnline }: {
  visible: boolean; onClose: () => void; url: string | null; isOnline: boolean;
}) {
  const [pdfSource, setPdfSource] = useState<{ uri: string } | null>(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!visible || !url) return;
    setPdfSource(null);
    setLoading(true);
    (async () => {
      try {
        const path = getCachedPath(url);
        const cached = await isFileCached(path);
        if (cached) {
          setPdfSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
        } else if (isOnline) {
          await downloadPdf(url, path);
          setPdfSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
        } else {
          setPdfSource(null);
        }
      } catch {
        setPdfSource({ uri: url.split("#")[0] });
      } finally { setLoading(false); }
    })();
  }, [visible, url]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
          paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 14 }}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", flex: 1 }}>Documento</Text>
          <Ionicons name="document-text-outline" size={22} color="#789fd6" />
        </View>
        <View style={{ flex: 1, backgroundColor: "#022a52" }}>
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
              <ActivityIndicator color="#789fd6" size="large" />
              <Text style={{ color: "#789fd6" }}>Caricamento PDF...</Text>
            </View>
          ) : pdfSource ? (
            <Pdf source={pdfSource} style={{ flex: 1, backgroundColor: "#022a52" }}
              onError={() => Alert.alert("Errore", "Impossibile aprire il PDF")} trustAllCerts={false} />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
              <Ionicons name={!isOnline ? "cloud-offline-outline" : "document-outline"} size={56} color="#ffffff30" />
              <Text style={{ color: "#ffffff60", textAlign: "center", paddingHorizontal: 32 }}>
                {!isOnline ? "PDF non disponibile offline.\nConnettiti per scaricarlo." : "Nessun documento"}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Status utils ─────────────────────────────────────────────────────────────
const MS = 86_400_000;
const addDur = (d: Date, dur: any) => {
  const r = new Date(d);
  if (dur.years)  r.setFullYear(r.getFullYear() + dur.years);
  if (dur.months) r.setMonth(r.getMonth() + dur.months);
  if (dur.days)   r.setDate(r.getDate() + dur.days);
  return r;
};
const durFromRec = (r: any): any => {
  if (!r) return null;
  if (r.to_days > 0) return { days: r.to_days };
  const n = (r.name || "").toLowerCase();
  if (n === "weekly")   return { days: 7 };
  if (n === "monthly")  return { months: 1 };
  if (n === "quarterly") return { months: 3 };
  if (n === "semiannual") return { months: 6 };
  if (n === "yearly" || n === "annually") return { years: 1 };
  const m = n.match(/every\s+([\d.]+)\s*(day|week|month|year)/i);
  if (m) {
    const q = parseFloat(m[1]);
    if (/day/.test(m[2]))   return { days: q };
    if (/week/.test(m[2]))  return { days: q * 7 };
    if (/month/.test(m[2])) return { months: q };
    if (/year/.test(m[2]))  return { years: q };
  }
  return null;
};
const expiryOf = (job: any): Date | null => {
  if (job?.execution_date && job?.maintenance_list?.recurrency_type) {
    const exec = new Date(job.execution_date);
    if (!isNaN(exec.getTime())) {
      const dur = durFromRec(job.maintenance_list.recurrency_type);
      if (dur) return addDur(exec, dur);
    }
  }
  if (job?.ending_date) { const d = new Date(job.ending_date); if (!isNaN(d.getTime())) return d; }
  return null;
};
const daysTo = (date: Date | null) => date ? Math.ceil((date.getTime() - Date.now()) / MS) : null;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ job, localStatus }: { job: any; localStatus?: number | null }) {
  const statusId: number = localStatus ?? job?.status?.id;
  const isPaused = statusId === 2;
  const exp = expiryOf(job);
  const d   = daysTo(exp);

  let bg = "#6b7280"; let label = ""; let textDark = false; let dateToShow: Date | null = null;

  if (isPaused) {
    bg = "rgba(255,255,255,0.2)"; label = "In pausa dal";
    dateToShow = job?.pauseDate ? new Date(job.pauseDate) : null;
  } else if (d === null) { label = "—";
  } else if (d < 0)   { bg = "#D0021B"; label = "Scaduta da"; dateToShow = exp;
  } else if (d <= 5)  { bg = "#F47216"; label = "Attiva fino al"; dateToShow = exp;
  } else if (d <= 15) { bg = "#FFBF25"; textDark = true; label = "Attiva fino al"; dateToShow = exp;
  } else              { bg = "#2DB647"; label = "Attiva fino al"; dateToShow = exp; }

  const dateStr = dateToShow ? dateToShow.toLocaleDateString("it-IT") : "N/A";
  const daysStr = !isPaused && d !== null ? ` (${d < 0 ? "+" : "-"}${Math.abs(d)}gg)` : "";

  return (
    <View style={{ backgroundColor: bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: "flex-start" }}>
      <Text style={{ color: textDark ? "#000" : "#fff", fontSize: 13, fontWeight: "600" }}>
        {label} {dateStr}{daysStr}
      </Text>
    </View>
  );
}

// ─── Pause Modal ──────────────────────────────────────────────────────────────
function PauseModal({ visible, oldStatusId, jobId, onClose, onSuccess, isOnline, shipId }: any) {
  const { execute } = useOfflineAction();
  const [date,    setDate]    = useState("");
  const [noReact, setNoReact] = useState(false);
  const [reason,  setReason]  = useState("");
  const [onlyThis, setOnlyThis] = useState(false);
  const [allFac,   setAllFac]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSave = async () => {
    const newStatusId = oldStatusId === 1 ? 2 : 1;
    setLoading(true);
    await execute({
      type: "PAUSE_MAINTENANCE",
      payload: {
        taskId: jobId,
        maintenance_id: jobId,
        date: date ? new Date(date) : null,
        date_flag: noReact ? "no_reactivation" : null,
        reason, only_this: onlyThis ? "true" : null,
        all_from_this_product: allFac ? "true" : null,
        old_status_id: oldStatusId,
        new_status_id: newStatusId,
        shipId,
      },
      optimistic: () => { onSuccess(newStatusId); onClose(); },
    });
    setLoading(false);
    if (!isOnline) Alert.alert("Offline", "Pausa salvata localmente, sarà sincronizzata quando online.");
  };

  const Checkbox = ({ val, set, label }: any) => (
    <TouchableOpacity onPress={() => set(!val)}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
        borderColor: val ? "#789fd6" : "#ffffff40",
        backgroundColor: val ? "#789fd6" : "transparent" }} />
      <Text style={{ color: "#fff", flex: 1 }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Metti in pausa</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10,
              marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>Offline — sarà sincronizzata quando online</Text>
            </View>
          )}

          <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 6 }}>Data di riattivazione</Text>
          <TextInput value={date} onChangeText={setDate} placeholder="GG/MM/AAAA" placeholderTextColor="#6b7280"
            editable={!noReact}
            style={{ backgroundColor: "#ffffff15", color: noReact ? "#ffffff50" : "#fff",
              borderRadius: 8, padding: 12, marginBottom: 10, opacity: noReact ? 0.5 : 1 }} />
          <Checkbox val={noReact} set={setNoReact} label="Nessuna riattivazione" />

          <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 6 }}>Motivo</Text>
          <TextInput value={reason} onChangeText={setReason} placeholder="Inserisci motivo..."
            placeholderTextColor="#6b7280" multiline numberOfLines={3}
            style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8,
              padding: 12, marginBottom: 16, minHeight: 80, textAlignVertical: "top" }} />
          <Checkbox val={onlyThis} set={setOnlyThis} label="Solo questa manutenzione" />
          <Checkbox val={allFac}   set={setAllFac}   label="Tutte le manutenzioni di questo componente" />

          <TouchableOpacity onPress={handleSave} disabled={loading}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
            {loading ? <ActivityIndicator color="#fff" />
              : <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {!isOnline && <Ionicons name="cloud-offline-outline" size={14} color="#fff" />}
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Salva</Text>
                </View>
            }
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Confirm OK Modal ─────────────────────────────────────────────────────────
function ConfirmOkModal({ visible, onClose, job, user, onSuccess, isOnline, shipId }: any) {
  const { execute } = useOfflineAction();
  const [time,    setTime]    = useState<number | null>(null);
  const [levelId, setLevelId] = useState("");
  const [levels,  setLevels]  = useState<any[]>([]);
  const [selectedSpares, setSelSp] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const TIME_OPTS = [5, 10, 15, 30, 45, 60, 90, 120];

  useEffect(() => {
    if (visible && isOnline) apiGetLevels().then(setLevels).catch(() => {});
  }, [visible]);

  const toggleSpare = (id: number) =>
    setSelSp(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const handleConfirm = async () => {
    if (!time)    return Alert.alert("Attenzione", "Seleziona il tempo impiegato");
    if (!levelId && isOnline) return Alert.alert("Attenzione", "Seleziona un livello");
    setLoading(true);
    await execute({
      type: "MARK_MAINTENANCE_OK",
      payload: { taskId: String(job.id), time, levelId, spares: selectedSpares, shipId },
      optimistic: () => { onSuccess(); onClose(); },
    });
    setLoading(false);
    if (!isOnline) Alert.alert("Offline", "Completamento salvato localmente, sarà sincronizzato quando online.");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24, maxHeight: "92%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Conferma esecuzione</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10,
              marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>Offline — sarà sincronizzato quando online</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {job?.spares?.length > 0 && (
              <View style={{ marginBottom: 18 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>Ricambi utilizzati</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {job.spares.map((s: any) => {
                    const sel = selectedSpares.includes(s.ID);
                    return (
                      <TouchableOpacity key={s.ID} onPress={() => toggleSpare(s.ID)}
                        style={{ backgroundColor: sel ? "#ffffff1a" : "#00000020",
                          borderWidth: 1.5, borderColor: sel ? "#789fd6" : "#ffffff20",
                          borderRadius: 10, padding: 12, marginRight: 10, minWidth: 140 }}>
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }} numberOfLines={2}>{s.Part_name}</Text>
                        <Text style={{ color: "#63c7ff", fontSize: 12, marginTop: 4 }}>Qty: {s.quantity || 0}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>Tempo impiegato</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {TIME_OPTS.map(min => (
                <TouchableOpacity key={min} onPress={() => setTime(min)}
                  style={{ backgroundColor: time === min ? "#789fd6" : "#ffffff10",
                    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
                  <Text style={{ color: "#fff", fontWeight: time === min ? "700" : "400" }}>{min} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            {isOnline && levels.length > 0 && (
              <>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>Livello manutenzione</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                  {levels.map(lvl => (
                    <TouchableOpacity key={lvl.id} onPress={() => setLevelId(String(lvl.id))}
                      style={{ backgroundColor: levelId === String(lvl.id) ? "#789fd6" : "#ffffff10",
                        borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 }}>
                      <Text style={{ color: "#fff", fontWeight: levelId === String(lvl.id) ? "700" : "400" }}>
                        {lvl.Level_MMI}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Esecutore</Text>
            <View style={{ backgroundColor: "#ffffff10", borderRadius: 8, padding: 12, marginBottom: 8, opacity: 0.6 }}>
              <Text style={{ color: "#fff" }}>{user?.first_name} {user?.last_name}</Text>
            </View>
          </ScrollView>

          <TouchableOpacity onPress={handleConfirm} disabled={loading}
            style={{ backgroundColor: "#2DB647", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 10 }}>
            {loading ? <ActivityIndicator color="#fff" />
              : <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {!isOnline && <Ionicons name="cloud-offline-outline" size={14} color="#fff" />}
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Salva</Text>
                </View>
            }
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Instruction Modal ────────────────────────────────────────────────────────
function InstructionModal({ visible, onClose, text }: any) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 24 }} onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 24, maxHeight: "80%" }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>Istruzioni</Text>
          <ScrollView>
            <Text style={{ color: "#ffffffcc", lineHeight: 22 }}>{text || "Nessuna istruzione disponibile"}</Text>
          </ScrollView>
          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Photo History Modal ──────────────────────────────────────────────────────
function PhotoHistoryModal({ visible, onClose, photos, loading }: any) {
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "85%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico fotografico</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView>
              {loading ? <ActivityIndicator color="#789fd6" /> :
               photos.length === 0 ? <Text style={{ color: "#ffffff60", fontStyle: "italic" }}>Nessuna foto disponibile</Text> :
               photos.map((p: any, i: number) => (
                <TouchableOpacity key={i} onPress={() => setZoom(p.image_url)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <Image source={{ uri: p.image_url }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                  <View>
                    <Text style={{ color: "#fff", fontWeight: "600" }}>{p.authorDetails?.first_name} {p.authorDetails?.last_name}</Text>
                    <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>{new Date(p.created_at).toLocaleString("it-IT")}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={onClose}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={!!zoom} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center" }} onPress={() => setZoom(null)}>
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
        <View style={{ backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico audio</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {loading ? <ActivityIndicator color="#789fd6" /> :
             audios.length === 0 ? <Text style={{ color: "#ffffff60", fontStyle: "italic" }}>Nessuna nota audio</Text> :
             audios.map((a: any, i: number) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#00000030", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#789fd6", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>{a.authorDetails?.first_name?.[0]}{a.authorDetails?.last_name?.[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{a.authorDetails?.first_name} {a.authorDetails?.last_name}</Text>
                  <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(a.created_at).toLocaleString("it-IT")}</Text>
                </View>
                <Ionicons name="play-circle-outline" size={34} color="#789fd6" />
              </View>
            ))}
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
        <View style={{ backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Storico note testo</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView>
            {loading ? <ActivityIndicator color="#789fd6" /> :
             texts.length === 0 ? <Text style={{ color: "#ffffff60", fontStyle: "italic" }}>Nessuna nota testo</Text> :
             texts.map((t: any, i: number) => (
              <View key={i} style={{ backgroundColor: "#00000038", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <Text style={{ color: "#ffffff80", fontSize: 12 }}>{t.authorDetails?.first_name} {t.authorDetails?.last_name}</Text>
                <Text style={{ color: "#fff", marginTop: 6, marginBottom: 6, lineHeight: 20 }}>{t.text_field}</Text>
                <Text style={{ color: "#ffffff60", fontSize: 11, alignSelf: "flex-end" }}>{new Date(t.created_at).toLocaleString("it-IT")}</Text>
              </View>
            ))}
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

// ─── Add Spare Modal ──────────────────────────────────────────────────────────
function AddSpareModal({ visible, onClose, maintenanceListId, isOnline }: any) {
  const [brand,   setBrand]   = useState("");
  const [model,   setModel]   = useState("");
  const [pn,      setPn]      = useState("");
  const [desc,    setDesc]    = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!brand.trim() || !pn.trim()) return Alert.alert("Attenzione", "Marca e Part Number obbligatori");
    if (!isOnline) { Alert.alert("Offline", "Aggiungi ricambi quando sei connesso."); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("brand", brand); fd.append("model", model);
      fd.append("part_number", pn); fd.append("description", desc);
      fd.append("maintenanceList_id", String(maintenanceListId));
      await api.post(`/spare/${maintenanceListId}/spares`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      Alert.alert("✓", "Ricambio aggiunto");
      setBrand(""); setModel(""); setPn(""); setDesc(""); onClose();
    } catch { Alert.alert("Errore", "Impossibile aggiungere il ricambio"); }
    finally { setLoading(false); }
  };

  const fields = [
    { label: "Marca *", val: brand, set: setBrand },
    { label: "Modello", val: model, set: setModel },
    { label: "Part Number *", val: pn, set: setPn },
    { label: "Descrizione", val: desc, set: setDesc },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Aggiungi ricambio</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10, marginBottom: 14,
              flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>Offline — operazione non disponibile</Text>
            </View>
          )}
          {fields.map(f => (
            <View key={f.label} style={{ marginBottom: 12 }}>
              <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 4 }}>{f.label}</Text>
              <TextInput value={f.val} onChangeText={f.set} editable={isOnline}
                placeholder={`Inserisci ${f.label.replace(" *", "")}`} placeholderTextColor="#6b7280"
                style={{ backgroundColor: "#ffffff15", color: "#fff", borderRadius: 8, padding: 12, opacity: isOnline ? 1 : 0.5 }} />
            </View>
          ))}
          <TouchableOpacity onPress={handleSave} disabled={loading || !isOnline}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 4, opacity: !isOnline ? 0.4 : 1 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Salva</Text>}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
export default function MaintenanceDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useSelector((s: RootState) => s.auth?.user) as any;
  const { execute } = useOfflineAction();
  const { isTablet } = useDevice();

  const [job,          setJob]          = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [isOnline,     setIsOnline]     = useState(true);
  const [fromCache,    setFromCache]    = useState(false);
  const [localStatus,  setLocalStatus]  = useState<number | null>(null); // ottimistico
  const [localDone,    setLocalDone]    = useState<string | null>(null); // ottimistico execution_state
  const [photos,       setPhotos]       = useState<any[]>([]);
  const [audios,       setAudios]       = useState<any[]>([]);
  const [texts,        setTexts]        = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // modali
  const [pauseOpen,      setPauseOpen]      = useState(false);
  const [confirmOkOpen,  setConfirmOkOpen]  = useState(false);
  const [noteOpen,       setNoteOpen]       = useState(false);
  const [instrOpen,      setInstrOpen]      = useState(false);
  const [photoHistOpen,  setPhotoHistOpen]  = useState(false);
  const [audioHistOpen,  setAudioHistOpen]  = useState(false);
  const [textHistOpen,   setTextHistOpen]   = useState(false);
  const [addSpareOpen,   setAddSpareOpen]   = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);
  const [pdfViewOpen,    setPdfViewOpen]    = useState(false);

  // ── Monitor connettività ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  const shipId = String(user?.teamInfo?.assignedShip?.id || "");

  // ── Carica job: API → cache → fallback ────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    const key = JOB_CACHE(id);
    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    if (online) {
      try {
        const j = await fetchJob(id, shipId);
        setJob(j);
        setFromCache(false);
        setLocalStatus(null);
        setLocalDone(null);
        await AsyncStorage.setItem(key, JSON.stringify(j));
        // Note in background
        setNotesLoading(true);
        const [p, a, t] = await Promise.all([apiGetPhotos(id), apiGetAudios(id), apiGetTexts(id)]);
        setPhotos(p); setAudios(a); setTexts(t);
      } catch {
        await loadFromCache(key);
      } finally { setNotesLoading(false); }
    } else {
      await loadFromCache(key);
    }

    if (!silent) setLoading(false);
  }, [id, shipId]);

  const loadFromCache = async (key: string) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) { setJob(JSON.parse(raw)); setFromCache(true); }
      else { setJob(null); setFromCache(true); }
    } catch { setJob(null); }
  };

  useEffect(() => { load(); }, [id]);

  // ── Ricarica live quando torna online ─────────────────────────────────────
  useEffect(() => {
    if (isOnline && fromCache) load(true);
  }, [isOnline]);

  const handleOk = () => setConfirmOkOpen(true);

  const handleAnomaly = async () => {
    await execute({
      type: "MARK_MAINTENANCE_ANOMALY",
      payload: { taskId: id, mark: 2, shipId }, 
      optimistic: () => setLocalDone("2"),
    });
    if (isOnline) load(true);
  };

  const handleNotPerformed = async () => {
    await execute({
      type: "MARK_MAINTENANCE_NOT_PERFORMED",
      payload: { taskId: id, mark: 3, shipId },   // ← aggiungi shipId
      optimistic: () => setLocalDone("3"),
    });
    if (isOnline) load(true);
  };

  const handleResume = async () => {
    await execute({
      type: "RESUME_MAINTENANCE",
      payload: { taskId: id, status_id: 1, shipId },   // ← aggiungi shipId
      optimistic: () => setLocalStatus(1),
    });
    if (isOnline) load(true);
  };

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#789fd6" size="large" />
    </SafeAreaView>
  );

  if (!job) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="warning-outline" size={48} color="#ffffff40" />
      <Text style={{ color: "#ffffff60", marginTop: 12 }}>Job non trovato</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
        <Text style={{ color: "#789fd6" }}>← Torna indietro</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Stato derivato ────────────────────────────────────────────────────────
  const effectiveStatusId: number = localStatus ?? job?.status?.id;
  const isPaused  = effectiveStatusId === 2;

  const isDone =
  localDone !== null ||
  job?.execution_state === "1" ||
  job?.execution_state === "2" ||
  job?.execution_state === "3";

  const exp       = expiryOf(job);

  const jobName = (() => {
    const n = job?.maintenance_list?.name || "";
    if (!n) return "";
    const low = n.toLowerCase();
    return low.charAt(0).toUpperCase() + low.slice(1);
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View
        style={{
          paddingHorizontal: isTablet ? 24 : 16,
          paddingTop: 8,
          paddingBottom: 4,
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
              Offline{fromCache ? " — dati dalla cache · azioni in coda" : ""}
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

        <View style={{ alignItems: "flex-start", gap: 10, paddingTop: 14 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{jobName}</Text>
            <StatusBadge job={job} localStatus={localStatus} />
          </View>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-start", paddingBottom: 10 }}>
            {effectiveStatusId === 1 && (
              <TouchableOpacity onPress={() => setPauseOpen(true)}
                style={{ backgroundColor: "#022a52", width: isTablet ? "32%" : "48%", borderRadius: 8, paddingHorizontal: 12,
                  paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6,
                  borderWidth: 1, borderColor: "#ffffff20" }}>
                <Ionicons name="pause" size={14} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Pausa</Text>
                {!isOnline && <Ionicons name="cloud-offline-outline" size={12} color="#F47216" style={{ marginLeft: "auto" }} />}
              </TouchableOpacity>
            )}
            {(effectiveStatusId === 2 || effectiveStatusId === 3) && (
              <TouchableOpacity onPress={handleResume}
                style={{ backgroundColor: "#022a52", width: isTablet ? "32%" : "48%", borderRadius: 8, paddingHorizontal: 12,
                  paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6,
                  borderWidth: 1, borderColor: "#ffffff20" }}>
                <Ionicons name="play" size={14} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Riprendi</Text>
                {!isOnline && <Ionicons name="cloud-offline-outline" size={12} color="#F47216" style={{ marginLeft: "auto" }} />}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setNoteOpen(true)}
              style={{ backgroundColor: "#789fd6", width: isTablet ? "32%" : "48%", borderRadius: 8, paddingHorizontal: 12,
                paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Nota</Text>
            </TouchableOpacity>
          </View>
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
              {!isOnline ? "Non disponibili offline" : audios.length > 0 ? `${audios.length} note audio` : "Nessuna nota vocale"}
            </Text>
            {isOnline && (
              <TouchableOpacity onPress={() => setAudioHistOpen(true)}>
                <Text style={{ color: "#fff", fontSize: 13 }}>Vedi storico</Text>
              </TouchableOpacity>
            )}
          </View>
          {audios[0] && isOnline ? (
            <TouchableOpacity onPress={() => setAudioHistOpen(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#00000030", borderRadius: 10, padding: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#789fd6", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{audios[0].authorDetails?.first_name?.[0]}{audios[0].authorDetails?.last_name?.[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{audios[0].authorDetails?.first_name} {audios[0].authorDetails?.last_name}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(audios[0].created_at).toLocaleString("it-IT")}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={34} color="#789fd6" />
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "#ffffff40", fontStyle: "italic" }}>
              {!isOnline ? "Connettiti per vedere le note" : "Nessuna nota vocale disponibile"}
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
              <Text style={{ color: "#ffffff80", fontSize: 12, marginBottom: 4 }}>{texts[0].authorDetails?.first_name} {texts[0].authorDetails?.last_name}</Text>
              <Text style={{ color: "#fff", lineHeight: 20 }}>{texts[0].text_field}</Text>
              <Text style={{ color: "#ffffff60", fontSize: 11, marginTop: 6, alignSelf: "flex-end" }}>{new Date(texts[0].created_at).toLocaleString("it-IT")}</Text>
            </View>
          ) : (
            <Text style={{ color: "#ffffff40", fontStyle: "italic" }}>
              {!isOnline ? "Connettiti per vedere le note" : "Nessuna nota testo disponibile"}
            </Text>
          )}
        </Section>

        {/* Bottoni azione OK / Anomalia / Non eseguito */}
        <View
          style={{
            flexDirection: "row",
            gap: isTablet ? 16 : 10,
            marginBottom: 16,
          }}
        >
          {[
            { label: "OK",           icon: "checkmark-circle-outline", color: "#2DB647", onPress: handleOk },
            { label: "Anomalia",     icon: "warning-outline",          color: "#FFBF25", onPress: handleAnomaly },
            { label: "Non eseguito", icon: "time-outline",             color: "#789fd6", onPress: handleNotPerformed },
          ].map(btn => (
            <TouchableOpacity key={btn.label} onPress={() => !isDone && btn.onPress()} disabled={isDone}
              style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, paddingVertical: 16,
                alignItems: "center", gap: 6, opacity: isDone ? 0.4 : 1,
                borderWidth: 1, borderColor: `${btn.color}66` }}>
              <Ionicons name={btn.icon as any} size={24} color={btn.color} />
              <Text style={{ color: btn.color, fontSize: 11, fontWeight: "700", textAlign: "center" }}>{btn.label}</Text>
              {/* Icona offline piccola sul bottone */}
              {!isOnline && !isDone && (
                <Ionicons name="cloud-offline-outline" size={10} color="#F47216" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Descrizione */}
        <Section title="Descrizione">
          <Text style={{ color: "#fff", lineHeight: 20 }} numberOfLines={4}>
            {job?.maintenance_list?.Maintenance_under_condition_description || "—"}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            {job?.documentFileUrl && (
              <TouchableOpacity onPress={() => setPdfViewOpen(true)}
                style={{ backgroundColor: "#ffffff15", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
                  flexDirection: "row", alignItems: "center", gap: 6,
                  opacity: !isOnline ? 0.7 : 1 }}>
                <Ionicons name={isOnline ? "document-outline" : "cloud-offline-outline"} size={14} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 13 }}>Vedi file</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setInstrOpen(true)}
              style={{ backgroundColor: "#ffffff15", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
                flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="list-outline" size={14} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13 }}>Vedi istruzioni</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <Section title="Impianto / Componente">
          <TouchableOpacity
            onPress={() => {
              if (job?.Element?.id) {
                router.push(`/(app)/impianti/${job.Element.id}` as any);
              }
            }}
            disabled={!job?.Element?.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, opacity: job?.Element?.id ? 1 : 0.6 }}>
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#ffffff15",
              alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="construct-outline" size={20} color="#789fd6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {job?.Element?.element_model?.ESWBS_code}{" "}
                {(job?.Element?.element_model?.LCN_name || "").substring(0, 20)}
                {(job?.Element?.element_model?.LCN_name || "").length > 20 ? "…" : ""}
              </Text>
              {job?.Element?.name && (
                <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 2 }}>{job.Element.name}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ffffff80" />
          </TouchableOpacity>
        </Section>

        {/* Informazioni */}
        <Section title="Informazioni">
          <InfoRow label="Frequenza"
            value={job?.maintenance_list?.recurrency_type?.name
              ? `${job.maintenance_list.recurrency_type.name}${job.maintenance_list.recurrency_type.to_days ? ` (${job.maintenance_list.recurrency_type.to_days} gg)` : ""}`
              : null} />
          <InfoRow label="Livello"
            value={job?.maintenance_list?.maintenance_level
              ? `${job.maintenance_list.maintenance_level.Level_MMI}${job.maintenance_list.maintenance_level.Description ? ` — ${job.maintenance_list.maintenance_level.Description}` : ""}`
              : null} />
          <InfoRow label="Operativo" value={job?.maintenance_list?.Operational_Not_operational || null} />
          <InfoRow label="Durata stimata"
            value={job?.maintenance_list?.Mean_elapsed_time_MELAP ? `${job.maintenance_list.Mean_elapsed_time_MELAP} min` : null} />
          <InfoRow label="Personale"
            value={job?.maintenance_list?.Personnel_no
              ? `${job.maintenance_list.Personnel_no} ${job.maintenance_list.Personnel_no === 1 ? "persona" : "persone"}`
              : null} />
          <InfoRow label="Paragrafo manuale"
            value={job?.maintenance_list?.Service_or_Maintenance_manual_ParagraphPage
              ? `Pag. ${job.maintenance_list.Service_or_Maintenance_manual_ParagraphPage}` : null} />
          <InfoRow label="Ultima esecuzione"
            value={job?.execution_date ? new Date(job.execution_date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" }) : null} />
          <InfoRow label="Scadenza" value={exp ? exp.toLocaleDateString("it-IT") : null} />
        </Section>

        {/* Consumabili */}
        {job?.consumables?.length > 0 && (
          <Section title="Consumabili">
            {job.consumables.map((c: any, i: number) => (
              <View key={c.ID ?? i} style={{ flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", backgroundColor: "#ffffff0d", borderRadius: 8,
                paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}>
                <Text style={{ color: "#fff", fontSize: 13, flex: 1 }} numberOfLines={2}>{c.Commercial_Name}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 12, marginLeft: 10 }}>{c.quantity ?? "AR"} {c.unit || ""}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Attrezzature */}
        {job?.tools?.length > 0 && (
          <Section title="Attrezzature">
            {job.tools.map((tl: any, i: number) => (
              <View key={tl.ID ?? i} style={{ flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", backgroundColor: "#ffffff0d", borderRadius: 8,
                paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}>
                <Text style={{ color: "#fff", fontSize: 13, flex: 1 }} numberOfLines={2}>{tl.Tool_name}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 12, marginLeft: 10 }}>{tl.quantity ?? "—"} {tl.unit || ""}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Soglie ricorrenza */}
        {(job?.maintenance_list?.recurrency_type?.early_threshold > 0 ||
          job?.maintenance_list?.recurrency_type?.due_threshold > 0 ||
          job?.maintenance_list?.recurrency_type?.delay_threshold > 0) && (
          <Section title="Soglie">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              {Number(job.maintenance_list.recurrency_type.early_threshold) > 0 && (
                <Text style={{ color: "#2DB647", fontSize: 13 }}>Anticipo: {job.maintenance_list.recurrency_type.early_threshold} gg</Text>
              )}
              {Number(job.maintenance_list.recurrency_type.due_threshold) > 0 && (
                <Text style={{ color: "#FFBF25", fontSize: 13 }}>Scadenza: {job.maintenance_list.recurrency_type.due_threshold} gg</Text>
              )}
              {Number(job.maintenance_list.recurrency_type.delay_threshold) > 0 && (
                <Text style={{ color: "#F47216", fontSize: 13 }}>Ritardo: {job.maintenance_list.recurrency_type.delay_threshold} gg</Text>
              )}
            </View>
          </Section>
        )}

      </ScrollView>

      {/* ── Modali ── */}
      <PdfViewerModal visible={pdfViewOpen} onClose={() => setPdfViewOpen(false)} url={job?.documentFileUrl ?? null} isOnline={isOnline} />
      <PauseModal visible={pauseOpen} oldStatusId={effectiveStatusId} jobId={id} onClose={() => setPauseOpen(false)}
        onSuccess={(newStatus: number) => { setLocalStatus(newStatus); }} isOnline={isOnline} shipId={shipId} />
      <ConfirmOkModal visible={confirmOkOpen} onClose={() => setConfirmOkOpen(false)} job={job} user={user}
        onSuccess={() => { setLocalDone("1"); if (isOnline) load(true); }} isOnline={isOnline} shipId={shipId} />
      <NoteModal visible={noteOpen} onClose={() => setNoteOpen(false)} entityId={id}
        authorId={String(user?.id)} entityType="maintenance" onSuccess={() => isOnline && load(true)} />
      <InstructionModal visible={instrOpen} onClose={() => setInstrOpen(false)}
        text={job?.maintenance_list?.Maintenance_under_condition_description} />
      <PhotoHistoryModal visible={photoHistOpen} onClose={() => setPhotoHistOpen(false)} photos={photos} loading={notesLoading} />
      <AudioHistoryModal visible={audioHistOpen} onClose={() => setAudioHistOpen(false)} audios={audios} loading={notesLoading} />
      <TextHistoryModal  visible={textHistOpen}  onClose={() => setTextHistOpen(false)}  texts={texts}  loading={notesLoading} />
      <AddSpareModal visible={addSpareOpen} onClose={() => setAddSpareOpen(false)} maintenanceListId={job?.id} isOnline={isOnline} />
      <FacilitiesModal visible={facilitiesOpen} onClose={() => setFacilitiesOpen(false)} eswbsCode={job?.Element?.element_model?.ESWBS_code} />
    </SafeAreaView>
  );
}