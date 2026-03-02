import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Modal, Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import Pdf from "react-native-pdf";
import RNBlobUtil from "react-native-blob-util";

// ─── API ──────────────────────────────────────────────────────────────────────
const getFiles = async (shipId: string, userId: string) => {
  const res = await api.get(`/shipFiles/getFiles?ship_id=${shipId}&user_id=${userId}`);
  return res.data.files || [];
};

// ─── Utils ────────────────────────────────────────────────────────────────────
const getCachedPath = (fileName: string) => {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${RNBlobUtil.fs.dirs.CacheDir}/${safe}.pdf`;
};

const isFileCached = async (path: string): Promise<boolean> => {
  try {
    return await RNBlobUtil.fs.exists(path);
  } catch {
    return false;
  }
};

const downloadFile = async (url: string, path: string): Promise<void> => {
  await RNBlobUtil.config({ path, fileCache: true }).fetch("GET", url);
};

// ─── Select File Modal ────────────────────────────────────────────────────────
function SelectFileModal({ visible, onClose, files, selected, onSelect, cachedFiles }: {
  visible: boolean; onClose: () => void;
  files: any[]; selected: any; onSelect: (f: any) => void;
  cachedFiles: Set<string>;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24, maxHeight: "70%",
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Seleziona file</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>
          {files.length === 0 ? (
            <Text style={{ color: "#ffffff80", textAlign: "center", padding: 24 }}>Nessun file disponibile</Text>
          ) : (
            <FlatList
              data={files}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const isCached = cachedFiles.has(item.file_name);
                return (
                  <TouchableOpacity
                    onPress={() => { onSelect(item); onClose(); }}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}
                  >
                    <View style={{
                      width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                      borderColor: selected?.id === item.id ? "#789fd6" : "#ffffff50",
                      backgroundColor: selected?.id === item.id ? "#789fd6" : "transparent",
                      marginRight: 14,
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>{item.file_name}</Text>
                      {item.file_type && <Text style={{ color: "#789fd6", fontSize: 12, marginTop: 2 }}>{item.file_type}</Text>}
                    </View>
                    {isCached
                      ? <Ionicons name="checkmark-circle" size={18} color="#4cd964" />
                      : <Ionicons name="cloud-download-outline" size={18} color="#ffffff60" />
                    }
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Files Page ───────────────────────────────────────────────────────────────
export default function FilesPage() {
  const user = useSelector((state: RootState) => state.auth?.user);
  const [files, setFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfSource, setPdfSource] = useState<{ uri: string; cache?: boolean } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [cachedFiles, setCachedFiles] = useState<Set<string>>(new Set());

  const shipId = (user as any)?.teamInfo?.assignedShip?.id || (user as any)?.team?.id;

  useEffect(() => {
    if (!user) return;
    getFiles(String(shipId), String(user.id))
      .then(async (data) => {
        setFiles(data);
        // Controlla quali file sono già in cache
        const cached = new Set<string>();
        for (const f of data) {
          const path = getCachedPath(f.file_name);
          if (await isFileCached(path)) cached.add(f.file_name);
        }
        setCachedFiles(cached);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => Alert.alert("Errore", "Impossibile caricare i file"))
      .finally(() => setLoading(false));
  }, [user]);

  // Quando cambia il file selezionato, carica il PDF
  useEffect(() => {
    if (!selected) return;
    loadPdf(selected);
  }, [selected]);

  const loadPdf = async (file: any) => {
    if (!file?.file_link) return;
    setPdfLoading(true);
    setPdfSource(null);

    const path = getCachedPath(file.file_name);
    const cached = await isFileCached(path);

    if (cached) {
      // Carica da cache locale
      setPdfSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
    } else {
      // Prova a scaricare
      try {
        await downloadFile(file.file_link, path);
        setCachedFiles((prev) => new Set([...prev, file.file_name]));
        setPdfSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
      } catch {
        // Fallback: carica direttamente dall'URL (richiede connessione)
        setPdfSource({ uri: file.file_link, cache: true });
        Alert.alert("Attenzione", "File non scaricato, visualizzazione online");
      }
    }
    setPdfLoading(false);
  };

  const handleDownload = async () => {
    if (!selected?.file_link) return;
    setPdfLoading(true);
    try {
      const path = getCachedPath(selected.file_name);
      await downloadFile(selected.file_link, path);
      setCachedFiles((prev) => new Set([...prev, selected.file_name]));
      setPdfSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
      Alert.alert("Successo", "File scaricato e disponibile offline");
    } catch {
      Alert.alert("Errore", "Impossibile scaricare il file");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </SafeAreaView>
    );
  }

  const isCached = selected ? cachedFiles.has(selected.file_name) : false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        {/* Selettore file */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 }}>
          <TouchableOpacity onPress={() => setModalOpen(true)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 }} numberOfLines={1}>
              {selected ? selected.file_name : "Seleziona file"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Badge cache */}
          {isCached && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="checkmark-circle" size={16} color="#4cd964" />
              <Text style={{ color: "#4cd964", fontSize: 12 }}>Offline</Text>
            </View>
          )}

          {/* Download button */}
          <TouchableOpacity
            onPress={handleDownload}
            disabled={!selected || pdfLoading}
            style={{ backgroundColor: isCached ? "#ffffff20" : "#789fd6", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6, opacity: !selected ? 0.5 : 1 }}
          >
            <Ionicons name={isCached ? "refresh-outline" : "download-outline"} size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>{isCached ? "Aggiorna" : "Scarica"}</Text>
          </TouchableOpacity>
        </View>

        {/* PDF Viewer */}
        <View style={{ flex: 1, marginTop: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "#022a52" }}>
          {pdfLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color="#789fd6" size="large" />
              <Text style={{ color: "#789fd6", marginTop: 12 }}>Caricamento PDF...</Text>
            </View>
          ) : pdfSource ? (
            <Pdf
              source={pdfSource}
              style={{ flex: 1, backgroundColor: "#022a52" }}
              onError={() => Alert.alert("Errore", "Impossibile aprire il PDF")}
              trustAllCerts={false}
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="folder-open-outline" size={64} color="#789fd6" />
              <Text style={{ color: "#789fd6", fontSize: 16, marginTop: 16 }}>Nessun file selezionato</Text>
            </View>
          )}
        </View>
      </View>

      <SelectFileModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        files={files}
        selected={selected}
        onSelect={setSelected}
        cachedFiles={cachedFiles}
      />
    </SafeAreaView>
  );
}