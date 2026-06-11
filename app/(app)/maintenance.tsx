import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import FacilitiesModal from "@/components/organisms/FacilitiesModal";
import NoteModal from "@/components/organisms/NoteModal";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineAction } from "@/hooks/useOfflineAction";
import { useWindowDimensions } from "react-native";
import { useRef } from "react";  
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const fetchMaintenanceTypes = async (shipId: string, userId: string) => {
  const res = await api.get(`/maintenance/type?shipId=${shipId}`);   // ← shipId in query
  return res.data.maintenanceTypes || [];
};

const fetchMaintenanceJobs = async (typeId: any, shipId: string, userId: string, page: number = 1, limit: number = 20) => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (shipId) params.append("shipId", shipId);
  if (typeId && typeId !== "undefined") params.append("type_id", typeId);

  const url = `/maintenance/jobs?${params.toString()}`;
  const res = await api.get(url);
  return {
    jobs: res.data.jobs || [],
    total: res.data.total ?? 0,
    hasMore: res.data.hasMore ?? false,
  };
};

const getCompletedReport = async (shipId: string, from?: string, to?: string) => {
  const params = new URLSearchParams();
  params.append("ship_id", shipId);
  if (from) params.append("from", from);
  if (to)   params.append("to", to);
  const res = await api.get(`/maintenance/exportCompletedReport?${params.toString()}`);
  return res.data.rows || [];
};

const getPhotosGeneral = async (id: string, type: string) =>
  (await api.get(`/uploadFiles/getPhotosGeneral/${id}/${type}`)).data || { notes: [] };
const getAudiosGeneral = async (id: string, type: string) =>
  (await api.get(`/uploadFiles/getAudiosGeneral/${id}/${type}`)).data || { notes: [] };
const getTextsGeneral = async (id: string, type: string) =>
  (await api.get(`/uploadFiles/getTextNotesGeneral/${id}/${type}`)).data || { notes: [] };

// ─── Cache keys ───────────────────────────────────────────────────────────────
const JOBS_CACHE  = (shipId: string, typeId?: any) => `cache_maint_jobs_${shipId}_${typeId ?? "all"}`;
const TYPES_CACHE = (shipId: string) => `cache_maint_types_${shipId}`;

// ─── Date utils ───────────────────────────────────────────────────────────────
const MS = 86400000;
const addDuration = (date: Date, dur: any): Date => {
  const d = new Date(date);
  if (dur.years)  d.setFullYear(d.getFullYear() + dur.years);
  if (dur.months) d.setMonth(d.getMonth() + dur.months);
  if (dur.days)   d.setDate(d.getDate() + dur.days);
  return d;
};
const durationFromRecurrency = (r: any): any => {
  if (!r) return null;
  if (typeof r.to_days === "number" && r.to_days > 0) return { days: r.to_days };
  const n = (r.name || "").toLowerCase();
  if (n === "weekly")    return { days: 7 };
  if (n === "monthly")   return { months: 1 };
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
const computeExpiryDate = (item: any): Date | null => {
  if (item.execution_date && item.maintenance_list?.recurrency_type) {
    const exec = new Date(item.execution_date);
    if (!isNaN(exec.getTime())) {
      const dur = durationFromRecurrency(item.maintenance_list.recurrency_type);
      if (dur) return addDuration(exec, dur);
    }
  }
  if (item.ending_date) {
    const d = new Date(item.ending_date);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};
const diffDays = (date: Date | null): number | null =>
  date ? Math.ceil((date.getTime() - Date.now()) / MS) : null;

const getRowColor = (item: any): string => {
  const exp = computeExpiryDate(item);
  const d = diffDays(exp);
  if (d === null || !exp) return "transparent";
  const early  = Number(item.maintenance_list?.recurrency_type?.early_threshold  ?? 0);
  const due    = Number(item.maintenance_list?.recurrency_type?.due_threshold    ?? 0);
  const delay  = Number(item.maintenance_list?.recurrency_type?.delay_threshold  ?? 0);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  const greenStart  = new Date(exp); greenStart.setDate(exp.getDate()  - early);
  const yellowStart = new Date(exp); yellowStart.setDate(exp.getDate() - due);
  const redStart    = new Date(exp); redStart.setDate(exp.getDate()    + delay);
  if (today < greenStart)  return "transparent";
  if (today < yellowStart) return "#2DB647";
  if (today < exp)         return "#FFBF25";
  if (today < redStart)    return "#F47216";
  return "#D0021B";
};

// ─── Default filters ──────────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  stato:      { scaduta: false, scadutaDaPoco: false, inScadenza: false, attiva: false, inPausa: false, programmata: false },
  ricorrenza: { settimanale: false, bisettimanale: false, mensile: false, bimestrale: false, trimestrale: false, semestrale: false, annuale: false, biennale: false, triennale: false },
  livello:    { aBordo: false, inBanchina: false, inBacino: false, fornitoreEsterno: false },
  squadra:    { operatori: false, equipaggio: false, manutentori: false, comando: false },
  ricambi:    { richiesti: false, richiestiDisponibili: false, richiestiNonDisponibili: false, richiestiInEsaurimento: false },
  system:     { selectedElement: null },
};

// ─── Select Type Modal ─────────────────────────────────────────────────────────
function SelectTypeModal({ visible, onClose, shipId, userId, onSelect, isOnline }: any) {
  const [types,      setTypes]      = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const key = TYPES_CACHE(shipId);
    const load = async () => {
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);
      if (online) {
        try {
          const data = await fetchMaintenanceTypes(shipId, userId);
          setTypes(data);
          await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch {
          const raw = await AsyncStorage.getItem(key).catch(() => null);
          if (raw) setTypes(JSON.parse(raw));
        }
      } else {
        const raw = await AsyncStorage.getItem(key).catch(() => null);
        if (raw) setTypes(JSON.parse(raw));
      }
      setLoading(false);
    };
    load();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Seleziona tipo</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 6, padding: 8, marginBottom: 12,
              flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="cloud-offline-outline" size={13} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>Dati dalla cache locale</Text>
            </View>
          )}
          {loading ? <ActivityIndicator color="#789fd6" /> : (
            <ScrollView>
              <TouchableOpacity onPress={() => { onSelect(null); onClose(); }}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14,
                  borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginRight: 14,
                  borderColor: !selectedId ? "#789fd6" : "#ffffff50",
                  backgroundColor: !selectedId ? "#789fd6" : "transparent" }} />
                <Text style={{ color: "#fff", fontSize: 15 }}>Tutti</Text>
              </TouchableOpacity>
              {types.map((t) => (
                <TouchableOpacity key={t.id}
                  onPress={() => { setSelectedId(t.id); onSelect(t); onClose(); }}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14,
                    borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginRight: 14,
                    borderColor: selectedId === t.id ? "#789fd6" : "#ffffff50",
                    backgroundColor: selectedId === t.id ? "#789fd6" : "transparent" }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 15 }}>{t.title || t.name}</Text>
                    {t.tasks !== undefined && (
                      <Text style={{ color: "#ffffff80", fontSize: 12 }}>Task: {t.tasks}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Legend Modal ─────────────────────────────────────────────────────────────
function LegendModal({ visible, onClose }: any) {
  const ITEMS = [
    { color: "#2DB647",  label: "Attiva (> early threshold)" },
    { color: "#FFBF25",  label: "In scadenza (entro due threshold)" },
    { color: "#F47216",  label: "Scaduta di poco (entro delay threshold)" },
    { color: "#D0021B",  label: "Scaduta" },
    { icon: "time-outline",         label: "Scadenza temporale" },
    { icon: "pause-circle-outline", label: "Fermo previsto" },
    { icon: "construct-outline",    label: "Ricambi richiesti" },
  ];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }} onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Legenda</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          {ITEMS.map((item, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 }}>
              {item.color
                ? <View style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: item.color }} />
                : <Ionicons name={item.icon as any} size={18} color="#fff" />}
              <Text style={{ color: "#fff", fontSize: 14 }}>{item.label}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
const fmtDate = (d: any) => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("it-IT");
};

const presetRange = (key: string) => {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const start = new Date(today);
  switch (key) {
    case "month":   start.setMonth(start.getMonth() - 1); break;
    case "quarter": start.setMonth(start.getMonth() - 3); break;
    case "year":    start.setFullYear(start.getFullYear() - 1); break;
    case "all":     return { from: "", to: "" };
    default:        return { from: "", to: "" };
  }
  return { from: start.toISOString().slice(0, 10), to };
};

const PRESETS = [
  { key: "month",   label: "Ultimo mese" },
  { key: "quarter", label: "Ultimo trimestre" },
  { key: "year",    label: "Ultimo anno" },
  { key: "all",     label: "Tutte" },
];

function ReportModal({ visible, onClose, shipId }: any) {
  const [preset,  setPreset]  = useState("month");
  const [from,    setFrom]    = useState(presetRange("month").from);
  const [to,      setTo]      = useState(presetRange("month").to);
  const [rows,    setRows]    = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const applyPreset = (key: string) => {
    setPreset(key);
    const r = presetRange(key);
    setFrom(r.from); setTo(r.to);
  };

  const generate = async () => {
    setLoading(true); setError(null); setRows(null);
    try {
      const data = await getCompletedReport(String(shipId), from, to);
      setRows(data);
    } catch (e: any) {
      setError(e?.message || "Errore generazione report");
    } finally {
      setLoading(false);
    }
  };

  const esc = (v: any) =>
    String(v ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const esito = (e: string) =>
    e === "OK" ? "OK" : e === "Anomalia" ? "Anomalia" : "—";

  const periodLabel = () => {
    if (!from && !to) return "Tutte le attività";
    if (from && to)   return `Dal ${fmtDate(from)} al ${fmtDate(to)}`;
    if (from)         return `Dal ${fmtDate(from)}`;
    return `Fino al ${fmtDate(to)}`;
  };

  const buildHtml = () => {
    const body = (rows || []).map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${esc(r.task)}</td>
        <td class="mono">${esc(r.eswbs)}</td>
        <td>${esc(r.componente)}</td>
        <td>${esc(r.esecutore)}</td>
        <td>${esc(fmtDate(r.data_esecuzione))}</td>
        <td>${esc(esito(r.esito))}</td>
      </tr>`).join("");

    return `
    <!DOCTYPE html><html lang="it"><head><meta charset="utf-8"/>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
      .head { display:flex; justify-content:space-between; align-items:baseline;
        border-bottom:3px solid #022a52; padding-bottom:10px; margin-bottom:14px; }
      .head h1 { color:#022a52; font-size:18px; margin:0; }
      .meta { font-size:11px; color:#555; text-align:right; }
      .meta b { color:#022a52; }
      table { width:100%; border-collapse:collapse; font-size:11px; }
      thead th { background:#022a52; color:#fff; text-align:left; padding:7px; }
      tbody td { border-bottom:1px solid #ddd; padding:6px 7px; }
      tbody tr:nth-child(even) { background:#f4f7fb; }
      .mono { font-family:monospace; }
      .empty { padding:20px; text-align:center; color:#777; }
    </style></head><body>
      <div class="head">
        <h1>Report attività completate</h1>
        <div class="meta">
          <div><b>Periodo:</b> ${esc(periodLabel())}</div>
          <div><b>Totale:</b> ${(rows || []).length}</div>
          <div>Generato il ${esc(new Date().toLocaleString("it-IT"))}</div>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Task</th><th>ESWBS</th><th>Componente</th>
          <th>Esecutore</th><th>Data</th><th>Esito</th>
        </tr></thead>
        <tbody>${body || `<tr><td colspan="7" class="empty">Nessuna attività nel periodo</td></tr>`}</tbody>
      </table>
    </body></html>`;
  };

  const printOrShare = async () => {
    if (!rows || rows.length === 0) return;
    try {
      const { uri } = await Print.printToFileAsync({ html: buildHtml() });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Report manutenzioni" });
      } else {
        await Print.printAsync({ uri });
      }
    } catch (e: any) {
      setError(e?.message || "Errore stampa report");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }} onPress={onClose}>
        <Pressable style={{ backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24, maxHeight: "88%", flexShrink: 1 }} onPress={(e) => e.stopPropagation?.()}>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Report attività</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8 }}>Periodo</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {PRESETS.map((p) => (
              <TouchableOpacity key={p.key} onPress={() => applyPreset(p.key)}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: preset === p.key ? "#789fd6" : "#ffffff10" }}>
                <Text style={{ color: preset === p.key ? "#022a52" : "#ffffffaa",
                  fontSize: 13, fontWeight: preset === p.key ? "700" : "400" }}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {(from || to) && (
            <Text style={{ color: "#ffffff80", fontSize: 12, marginBottom: 16 }}>{periodLabel()}</Text>
          )}

          <TouchableOpacity onPress={generate} disabled={loading}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center",
              opacity: loading ? 0.6 : 1, marginBottom: 16 }}>
            {loading
              ? <ActivityIndicator color="#022a52" />
              : <Text style={{ color: "#022a52", fontWeight: "700" }}>Genera report</Text>}
          </TouchableOpacity>

          {error && (
            <View style={{ backgroundColor: "#D0021B22", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: "#ff8a8a", fontSize: 13 }}>{error}</Text>
            </View>
          )}

          {rows && (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>{rows.length} attività</Text>
                {rows.length > 0 && (
                  <TouchableOpacity onPress={printOrShare}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6,
                      backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Ionicons name="share-outline" size={16} color="#022a52" />
                    <Text style={{ color: "#022a52", fontWeight: "700", fontSize: 13 }}>Esporta PDF</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={{ maxHeight: 320 }}>
                {rows.length === 0 ? (
                  <Text style={{ color: "#ffffff40", textAlign: "center", paddingVertical: 30, fontSize: 13 }}>
                    Nessuna attività nel periodo selezionato
                  </Text>
                ) : rows.map((r, i) => (
                  <View key={r.id ?? i} style={{ backgroundColor: "#00000025", borderRadius: 8,
                    padding: 12, marginBottom: 8 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={2}>
                      {r.task || "—"}
                    </Text>
                    <Text style={{ color: "#789fd6", fontSize: 12, marginTop: 2 }}>
                      {r.eswbs || "—"} · {r.componente || "—"}
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                      <Text style={{ color: "#ffffff80", fontSize: 12 }}>
                        {r.esecutore || "—"} · {fmtDate(r.data_esecuzione)}
                      </Text>
                      <View style={{ backgroundColor:
                        r.esito === "Anomalia" ? "#D0021B33" : r.esito === "OK" ? "#2DB64733" : "#ffffff15",
                        borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: "600", color:
                          r.esito === "Anomalia" ? "#ff8a8a" : r.esito === "OK" ? "#7ee29a" : "#ffffff80" }}>
                          {esito(r.esito)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, filters, onApply }: any) {
  const mergeWithDefaults = (f: any) => ({
    stato:      { ...DEFAULT_FILTERS.stato,      ...(f?.stato      || {}) },
    ricorrenza: { ...DEFAULT_FILTERS.ricorrenza, ...(f?.ricorrenza || {}) },
    livello:    { ...DEFAULT_FILTERS.livello,    ...(f?.livello    || {}) },
    squadra:    { ...DEFAULT_FILTERS.squadra,    ...(f?.squadra    || {}) },
    ricambi:    { ...DEFAULT_FILTERS.ricambi,    ...(f?.ricambi    || {}) },
    system:     { ...DEFAULT_FILTERS.system,     ...(f?.system     || {}) },
  });

  const [local, setLocal]           = useState(() => mergeWithDefaults(filters));
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);

  useEffect(() => setLocal(mergeWithDefaults(filters)), [filters]);

  const toggle = (cat: string, key: string) =>
    setLocal((p: any) => ({ ...p, [cat]: { ...(p[cat] || {}), [key]: !(p[cat]?.[key] ?? false) } }));

  const STATO = [
    { key: "scaduta",       label: "Scaduta",         color: "#D0021B" },
    { key: "scadutaDaPoco", label: "Scaduta di poco", color: "#F47216" },
    { key: "inScadenza",    label: "In scadenza",      color: "#FFBF25" },
    { key: "attiva",        label: "Attiva",           color: "#2DB647" },
    { key: "inPausa",       label: "In pausa",         color: "#6b7280" },
    { key: "programmata",   label: "Programmata",      color: "#789fd6" },
  ];
  const RICORRENZA = ["settimanale","bisettimanale","mensile","bimestrale","trimestrale","semestrale","annuale","biennale","triennale"];
  const LIVELLO    = ["aBordo","inBanchina","inBacino","fornitoreEsterno"];
  const SQUADRA    = ["operatori","equipaggio","manutentori","comando"];
  const RICAMBI    = ["richiesti","richiestiDisponibili","richiestiNonDisponibili","richiestiInEsaurimento"];

  const CheckRow = ({ cat, k, label, color }: { cat: string; k: string; label: string; color?: string }) => {
    const catObj = (local as any)[cat] || {};
    return (
      <TouchableOpacity onPress={() => toggle(cat, k)}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 }}>
        {color && <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: color }} />}
        <Text style={{ color: "#fff", flex: 1, fontSize: 13 }}>{label}</Text>
        <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
          borderColor: catObj[k] ? "#789fd6" : "#ffffff40",
          backgroundColor: catObj[k] ? "#789fd6" : "transparent" }} />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
          <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 300,
            backgroundColor: "#022a52", padding: 20, paddingTop: 60 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Filtri</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: "#789fd6", marginBottom: 10, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Stato</Text>
              {STATO.map(s => <CheckRow key={s.key} cat="stato" k={s.key} label={s.label} color={s.color} />)}

              <Text style={{ color: "#789fd6", marginTop: 14, marginBottom: 10, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Ricorrenza</Text>
              {RICORRENZA.map(k => <CheckRow key={k} cat="ricorrenza" k={k} label={k.charAt(0).toUpperCase() + k.slice(1)} />)}

              <Text style={{ color: "#789fd6", marginTop: 14, marginBottom: 10, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Livello</Text>
              {LIVELLO.map(k => <CheckRow key={k} cat="livello" k={k} label={k.replace(/([A-Z])/g, " $1")} />)}

              <Text style={{ color: "#789fd6", marginTop: 14, marginBottom: 10, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Squadra</Text>
              {SQUADRA.map(k => <CheckRow key={k} cat="squadra" k={k} label={k.charAt(0).toUpperCase() + k.slice(1)} />)}

              <Text style={{ color: "#789fd6", marginTop: 14, marginBottom: 10, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Impianto</Text>
              <TouchableOpacity onPress={() => setFacilitiesOpen(true)}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff10",
                  borderRadius: 8, padding: 10, marginBottom: 14 }}>
                <Text style={{ color: local.system?.selectedElement ? "#789fd6" : "#ffffff80", flex: 1, fontSize: 13 }}>
                  {local.system?.selectedElement ? `Selezionato: ${local.system.selectedElement}` : "Seleziona impianto"}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#ffffff80" />
              </TouchableOpacity>

              <Text style={{ color: "#789fd6", marginBottom: 10, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>Ricambi</Text>
              {RICAMBI.map(k => <CheckRow key={k} cat="ricambi" k={k} label={k.replace(/([A-Z])/g, " $1")} />)}
            </ScrollView>

            <TouchableOpacity onPress={() => { onApply(local); onClose(); }}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Applica</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <FacilitiesModal
        visible={facilitiesOpen}
        onClose={() => setFacilitiesOpen(false)}
        onSelectSystem={(node: any) => {
          setLocal((p: any) => ({ ...p, system: { selectedElement: node?.id ?? null } }));
          setFacilitiesOpen(false);
        }}
      />
    </>
  );
}

// ─── Notes View Modal ─────────────────────────────────────────────────────────
function NotesViewModal({ visible, onClose, taskId }: any) {
  const [photo,   setPhoto]   = useState<any>(null);
  const [audio,   setAudio]   = useState<any>(null);
  const [text,    setText]    = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !taskId) return;
    setLoading(true);
    const sort = (arr: any[]) =>
      [...arr].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    Promise.all([
      getPhotosGeneral(taskId, "maintenance"),
      getAudiosGeneral(taskId, "maintenance"),
      getTextsGeneral(taskId, "maintenance"),
    ]).then(([p, a, t]) => {
      setPhoto(sort(p.notes || [])[0] || null);
      setAudio(sort(a.notes || [])[0] || null);
      setText(sort(t.notes  || [])[0] || null);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, taskId]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }} onPress={onClose}>
        <View style={{ backgroundColor: "#022a52", borderRadius: 16, padding: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Note</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator color="#789fd6" style={{ paddingVertical: 24 }} /> : (
            <>
              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Foto</Text>
              {photo
                ? <View style={{ flexDirection: "row", gap: 10, marginBottom: 14, alignItems: "center" }}>
                    <View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: "#ffffff15",
                      alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="image-outline" size={22} color="#789fd6" />
                    </View>
                    <View>
                      <Text style={{ color: "#fff" }}>{photo.authorDetails?.first_name} {photo.authorDetails?.last_name}</Text>
                      <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(photo.created_at).toLocaleString("it-IT")}</Text>
                    </View>
                  </View>
                : <Text style={{ color: "#ffffff40", fontSize: 13, marginBottom: 14 }}>Nessuna foto</Text>}

              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Audio</Text>
              {audio
                ? <View style={{ flexDirection: "row", gap: 10, marginBottom: 14, alignItems: "center",
                    backgroundColor: "#00000030", borderRadius: 8, padding: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#789fd6",
                      alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                        {audio.authorDetails?.first_name?.[0]}{audio.authorDetails?.last_name?.[0]}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: "#fff", fontSize: 13 }}>{audio.authorDetails?.first_name} {audio.authorDetails?.last_name}</Text>
                      <Text style={{ color: "#ffffff80", fontSize: 12 }}>{new Date(audio.created_at).toLocaleString("it-IT")}</Text>
                    </View>
                  </View>
                : <Text style={{ color: "#ffffff40", fontSize: 13, marginBottom: 14 }}>Nessun audio</Text>}

              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Testo</Text>
              {text
                ? <View style={{ backgroundColor: "#00000030", borderRadius: 8, padding: 12 }}>
                    <Text style={{ color: "#ffffff80", fontSize: 12 }}>{text.authorDetails?.first_name} {text.authorDetails?.last_name}</Text>
                    <Text style={{ color: "#fff", marginTop: 4 }}>{text.text_field}</Text>
                  </View>
                : <Text style={{ color: "#ffffff40", fontSize: 13 }}>Nessuna nota testo</Text>}
            </>
          )}
          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Maintenance Row ──────────────────────────────────────────────────────────
function MaintenanceRow({ item, onReload, isOnline }: { item: any; onReload: () => void; isOnline: boolean }) {
  const user    = useSelector((state: RootState) => state.auth?.user) as any;
  const { execute } = useOfflineAction();

  const [notesOpen,   setNotesOpen]   = useState(false);
  const [noteAddOpen, setNoteAddOpen] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  // Ottimistic local state per pausa/riprendi
  const [localStatus, setLocalStatus] = useState<number | null>(null);

  const rowColor  = getRowColor(item);
  const exp       = computeExpiryDate(item);
  const days      = diffDays(exp);
  const hasPhoto  = (item.photographicNotes?.length || 0) > 0;
  const hasAudio  = (item.vocalNotes?.length        || 0) > 0;
  const hasText   = (item.textNotes?.length         || 0) > 0;
  const hasSpares = Array.isArray(item.spares) && item.spares.length > 0;

  const effectiveStatusId = localStatus ?? item.status_id;

  const handlePausa = async () => {
    setMenuOpen(false);
    await execute({
      type: "PAUSE_MAINTENANCE",
      payload: { taskId: item.id, userId: user?.id },
      optimistic: () => setLocalStatus(3),
    });
    if (isOnline) onReload();
  };

  const handleRiprendi = async () => {
    setMenuOpen(false);
    await execute({
      type: "RESUME_MAINTENANCE",
      payload: { taskId: item.id, userId: user?.id },
      optimistic: () => setLocalStatus(1),
    });
    if (isOnline) onReload();
  };

  return (
    <View style={{ backgroundColor: "#022a52", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5,
        backgroundColor: rowColor !== "transparent" ? rowColor : "#ffffff15" }} />

      <TouchableOpacity onPress={() => router.push(`/(app)/maintenance/${item.id}` as any)}
        style={{ padding: 14, paddingLeft: 18 }}>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 4 }} numberOfLines={2}>
          {item.maintenance_list?.name}
        </Text>
        <Text style={{ color: "#ffffff80", fontSize: 13, marginBottom: 8 }} numberOfLines={1}>
          {item.Element?.element_model?.ESWBS_code} {item.Element?.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          {item.maintenance_list?.recurrency_type?.name && (
            <View style={{ backgroundColor: "#ffffff15", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: "#fff", fontSize: 12 }}>{item.maintenance_list.recurrency_type.name}</Text>
            </View>
          )}
          {item.maintenance_list?.maintenance_level?.Level_MMI && (
            <View style={{ backgroundColor: "#ffffff10", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: "#789fd6", fontSize: 12 }}>{item.maintenance_list.maintenance_level.Level_MMI}</Text>
            </View>
          )}
          {exp && (
            <View style={{ backgroundColor: rowColor !== "transparent" ? rowColor + "33" : "#ffffff10",
              borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: rowColor !== "transparent" ? rowColor : "#fff", fontSize: 12, fontWeight: "600" }}>
                {exp.toLocaleDateString("it-IT")}
                {days !== null ? ` (${days > 0 ? "-" : "+"}${Math.abs(days)}gg)` : ""}
              </Text>
            </View>
          )}
          {/* Badge pausa locale (ottimistico offline) */}
          {localStatus === 3 && (
            <View style={{ backgroundColor: "#6b728033", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: "#6b7280", fontSize: 11 }}>In pausa{!isOnline ? " (offline)" : ""}</Text>
            </View>
          )}
          {hasSpares && <Ionicons name="construct-outline" size={16} color="#fff" />}
          <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); setNotesOpen(true); }}
            style={{ flexDirection: "row", gap: 6, marginLeft: "auto" }}>
            <Ionicons name="camera-outline"        size={16} color={hasPhoto ? "#fff" : "#ffffff25"} />
            <Ionicons name="mic-outline"           size={16} color={hasAudio ? "#fff" : "#ffffff25"} />
            <Ionicons name="document-text-outline" size={16} color={hasText  ? "#fff" : "#ffffff25"} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#ffffff15" }}>
        <TouchableOpacity onPress={() => setNoteAddOpen(true)}
          style={{ flex: 1, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Ionicons name="add-circle-outline" size={18} color="#789fd6" />
          <Text style={{ color: "#789fd6", fontSize: 13 }}>Nota</Text>
        </TouchableOpacity>
        <View style={{ width: 1, backgroundColor: "#ffffff15" }} />
        <TouchableOpacity onPress={() => setMenuOpen(true)}
          style={{ padding: 12, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="ellipsis-vertical" size={18} color="#ffffff80" />
        </TouchableOpacity>
      </View>

      {/* Ellipsis menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 40 }}
          onPress={() => setMenuOpen(false)}>
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, overflow: "hidden" }}>
            {!isOnline && (
              <View style={{ padding: 12, backgroundColor: "#F4721622", flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="cloud-offline-outline" size={13} color="#F47216" />
                <Text style={{ color: "#F47216", fontSize: 12 }}>Sarà sincronizzato quando online</Text>
              </View>
            )}
            <TouchableOpacity onPress={handlePausa}
              style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
              <Text style={{ color: "#fff", fontSize: 15 }}>Pausa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRiprendi}
              style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
              <Text style={{ color: "#fff", fontSize: 15 }}>Riprendi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMenuOpen(false); router.push(`/(app)/maintenance/${item.id}` as any); }}
              style={{ padding: 16 }}>
              <Text style={{ color: "#fff", fontSize: 15 }}>Dettagli</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <NotesViewModal visible={notesOpen} onClose={() => setNotesOpen(false)} taskId={String(item.id)} />
      <NoteModal
        visible={noteAddOpen}
        onClose={() => setNoteAddOpen(false)}
        entityId={String(item.id)}
        authorId={String(user?.id)}
        entityType="maintenance"
        onSuccess={onReload}
      />
    </View>
  );
}

// ─── Apply filters ────────────────────────────────────────────────────────────
const applyFilters = (data: any[], filters: any): any[] => {
  if (!filters) return data;
  return data.filter((item) => {
    const exp = computeExpiryDate(item);
    const d   = diffDays(exp);
    const { stato, ricorrenza, livello, squadra, ricambi, system } = filters;
    if (stato) {
      const active = Object.values(stato).some(Boolean);
      if (active) {
        const match = [
          stato.scaduta       && d !== null && d < -15,
          stato.scadutaDaPoco && d !== null && d >= -15 && d < 0,
          stato.inScadenza    && d !== null && d >= 0 && d <= 15,
          stato.attiva        && d !== null && d > 15,
          stato.inPausa       && (item.status_id === 2 || item.execution_state === 2),
          stato.programmata   && item.starting_date && new Date(item.starting_date) > new Date(),
        ].some(Boolean);
        if (!match) return false;
      }
    }
    if (ricorrenza) {
      const recurrenceMap: Record<string, number[]> = {
        settimanale: [2], bisettimanale: [7], mensile: [3], bimestrale: [8],
        trimestrale: [4], semestrale: [30, 40], annuale: [5], biennale: [9], triennale: [10],
      };
      const sel = Object.entries(ricorrenza).filter(([, v]) => v).flatMap(([k]) => recurrenceMap[k] || []);
      if (sel.length > 0 && !sel.includes(item.maintenance_list?.recurrency_type?.id)) return false;
    }
    if (livello) {
      const lvlMap: Record<string, string[]> = {
        aBordo: ["I"], inBanchina: ["II"], inBacino: ["IV - BACINO"], fornitoreEsterno: ["III"],
      };
      const sel = Object.entries(livello).filter(([, v]) => v).flatMap(([k]) => lvlMap[k] || []);
      if (sel.length > 0 && !sel.includes(item.maintenance_list?.maintenance_level?.Level_MMI)) return false;
    }
    if (system?.selectedElement) {
      const id = Number(system.selectedElement);
      if (item.Element?.id !== id && !item.spares?.some((s: any) => s.element_model_id === id)) return false;
    }
    if (ricambi?.richiesti && !(item.spares?.length > 0)) return false;
    return true;
  });
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MaintenancePage() {
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const reqIdRef = useRef(0);

  const [jobs,         setJobs]         = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [isOnline,     setIsOnline]     = useState(true);
  const [fromCache,    setFromCache]    = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectOpen,   setSelectOpen]   = useState(false);
  const [legendOpen,   setLegendOpen]   = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [filters,      setFilters]      = useState<any>(DEFAULT_FILTERS);

  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total,       setTotal]       = useState(0);
  const [reportOpen, setReportOpen] = useState(false);


  const shipId = String(user?.teamInfo?.assignedShip?.id || "");

  // ── Monitor connettività ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  const PAGE_SIZE = 20;

// carica la prima pagina (reset)
const loadJobs = useCallback(async () => {
  if (!user?.id || !shipId) return;
  const myReq = ++reqIdRef.current;
  setLoading(true);
  setPage(1);
  const key = JOBS_CACHE(shipId, selectedType?.id);
  const net = await NetInfo.fetch();
  const online = !!(net.isConnected && net.isInternetReachable);

  if (online) {
    try {
      const { jobs: data, total: tot, hasMore: more } =
        await fetchMaintenanceJobs(selectedType?.id, shipId, String(user.id), 1, PAGE_SIZE);
      if (myReq !== reqIdRef.current) return;
      setJobs(data);
      setTotal(tot);
      setHasMore(more);
      setFromCache(false);
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch {
      if (myReq !== reqIdRef.current) return;
      const raw = await AsyncStorage.getItem(key).catch(() => null);
      if (raw) { setJobs(JSON.parse(raw)); setFromCache(true); setHasMore(false); }
      else setJobs([]);
    }
  } else {
    const raw = await AsyncStorage.getItem(key).catch(() => null);
    if (myReq !== reqIdRef.current) return;
    if (raw) { setJobs(JSON.parse(raw)); setFromCache(true); setHasMore(false); }
    else setJobs([]);
  }
  if (myReq === reqIdRef.current) setLoading(false);
}, [user, selectedType, shipId]);

// carica la pagina successiva (append)
const loadMore = useCallback(async () => {
  if (loadingMore || !hasMore || loading || !isOnline) return;
  if (!user?.id || !shipId) return;
  setLoadingMore(true);
  const nextPage = page + 1;
  try {
    const { jobs: data, hasMore: more } =
      await fetchMaintenanceJobs(selectedType?.id, shipId, String(user.id), nextPage, PAGE_SIZE);
    setJobs((prev) => {
      const existing = new Set(prev.map((j) => j.id));
      const fresh = data.filter((j: any) => !existing.has(j.id));
      return [...prev, ...fresh];
    });
    setPage(nextPage);
    setHasMore(more);
  } catch {
    // ignora errori di pagina
  } finally {
    setLoadingMore(false);
  }
}, [loadingMore, hasMore, loading, isOnline, user, shipId, selectedType, page]);

useEffect(() => { loadJobs(); }, [loadJobs]);

useEffect(() => {
  if (isOnline && fromCache) loadJobs();
}, [isOnline]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // ── Ricarica live quando torna online ────────────────────────────────────
  useEffect(() => {
    if (isOnline && fromCache) loadJobs();
  }, [isOnline]);

  const displayed = applyFilters(jobs, filters)
    .filter((j) => j.maintenance_list?.name)
    .sort((a, b) => {
      const da = computeExpiryDate(a)?.getTime() ?? Infinity;
      const db = computeExpiryDate(b)?.getTime() ?? Infinity;
      return da - db;
    });

  const filterCount = (Object.values(filters) as any[]).reduce((acc: number, cat: any) => {
    if (cat && typeof cat === "object")
      return acc + (Object.values(cat) as any[]).filter(Boolean).length;
    return acc;
  }, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{
        flex: 1,
        padding: isTablet ? 24 : 16,
        alignSelf: "center",
        width: "100%",
        maxWidth: isTablet ? 1000 : "100%",
      }}>
        <DashboardHeader />

        {/* Banner offline */}
        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — dati dalla cache · Azioni in coda
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setSelectOpen(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {selectedType
                ? `${selectedType.title || selectedType.name} (${selectedType.tasks ?? displayed.length})`
                : `Tutti (${total || displayed.length})`}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#fff" />
          </TouchableOpacity>

           <TouchableOpacity onPress={() => setReportOpen(true)}
            style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8, marginLeft: 6,
              flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="document-text-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setLegendOpen(true)} style={{ backgroundColor: "#022a52", marginLeft: 6, borderRadius: 8, padding: 8, }}>
            <Ionicons name="information-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilterOpen(true)}
            style={{ backgroundColor: "#022a52", borderRadius: 8, padding: 8, marginLeft: 6 }}>
            <Ionicons name="filter-outline" size={20} color="#fff" />
            {filterCount > 0 && (
              <View style={{ position: "absolute", top: 2, right: 2, backgroundColor: "#789fd6",
                borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {selectedType && (
          <TouchableOpacity onPress={() => setSelectedType(null)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Ionicons name="close-circle" size={16} color="#789fd6" />
            <Text style={{ color: "#789fd6", fontSize: 13 }}>Mostra tutti</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        ) : displayed.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="build-outline" size={64} color="#789fd6" />
            <Text style={{ color: "#789fd6", marginTop: 16 }}>
              {fromCache ? "Nessun dato in cache" : "Nessun job trovato"}
            </Text>
          </View>
        ) : (
          <FlatList
              data={displayed}
              style={{ flex: 1 }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <MaintenanceRow item={item} onReload={loadJobs} isOnline={isOnline} />
              )}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator color="#789fd6" style={{ paddingVertical: 16 }} />
                ) : !hasMore && displayed.length > 0 ? (
                  <Text style={{ color: "#ffffff40", textAlign: "center", paddingVertical: 16, fontSize: 12 }}>
                    Tutti i record caricati
                  </Text>
                ) : null
              }
            />
        )}
      </View>

      <SelectTypeModal
        visible={selectOpen} onClose={() => setSelectOpen(false)}
        shipId={shipId} userId={String(user?.id)}
        onSelect={setSelectedType} isOnline={isOnline}
      />
      <LegendModal  visible={legendOpen} onClose={() => setLegendOpen(false)} />
      <ReportModal  visible={reportOpen} onClose={() => setReportOpen(false)} shipId={shipId} />
      <FilterModal  visible={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onApply={setFilters} />
    </SafeAreaView>
  );
}