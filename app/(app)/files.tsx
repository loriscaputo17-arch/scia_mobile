import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Modal, Pressable, Platform, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import FacilitiesModal from "@/components/organisms/FacilitiesModal";
import Pdf from "react-native-pdf";
import { WebView } from "react-native-webview";
import RNBlobUtil from "react-native-blob-util";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useDevice } from "@/hooks/useDevice";

// ─── File fissi (come il web) ───────────────────────────────────────────────
const MANUAL_SG118 = {
  id: "sg118-manual",
  file_name: "Manuale Nave SG_118 digital",
  file_link: "https://drive.google.com/file/d/1sbTC0cKFtwSehB01PqjXLsxICUOl4TWc/view?usp=drive_link",
  file_type: "application/pdf",
  isFixed: true,
};
const DRIVE_FOLDER_DISEGNI = {
  id: "drive-folder-disegni",
  file_name: "Disegni nave (cartella Drive)",
  file_link: "https://drive.google.com/drive/folders/1lBk-6LniVUcAPxz737L3Bw3N0ZmY5ykL?usp=drive_link",
  file_type: "application/vnd.google-apps.folder",
  isFixed: true,
  isFolder: true,
};

// ─── API ──────────────────────────────────────────────────────────────────────
const getTree = async (shipId: string) => {
  const res = await api.get(`/shipFiles/tree/${shipId}`);
  return Array.isArray(res.data) ? res.data : [];
};

const TREE_CACHE = (shipId: string) => `cache_ship_tree_${shipId}`;

// ─── Helpers Drive / URL ──────────────────────────────────────────────────────
const isGDrive = (link?: string) => !!link?.includes("drive.google.com");
const isGDriveFolder = (link?: string) => !!link?.includes("drive.google.com/drive/folders");
const toPreview = (link: string) => link.replace("/view", "/preview");

// ─── PDF cache helpers ────────────────────────────────────────────────────────
const getCachedPath = (fileName: string) => {
  const safe = (fileName || "doc").replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${RNBlobUtil.fs.dirs.CacheDir}/${safe}.pdf`;
};
const isFileCached = async (path: string) => {
  try { return await RNBlobUtil.fs.exists(path); } catch { return false; }
};
const downloadFile = async (url: string, path: string) => {
  await RNBlobUtil.config({ path, fileCache: true }).fetch("GET", url);
};

// ─── Folder Row (cartella espandibile, ricorsiva) ─────────────────────────────
function FolderRow({ node, depth, selectedId, onSelectFile }: {
  node: any; depth: number; selectedId: any; onSelectFile: (f: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const children: any[] = node.children || [];
  const hasChildren = children.length > 0;

  return (
    <View>
      <TouchableOpacity
        onPress={() => hasChildren && setOpen((o) => !o)}
        style={{ flexDirection: "row", alignItems: "center", gap: 8,
          paddingVertical: 10, paddingLeft: 8 + depth * 16, paddingRight: 8 }}>
        <Ionicons
          name={hasChildren ? (open ? "chevron-down" : "chevron-forward") : "ellipse-outline"}
          size={hasChildren ? 14 : 6}
          color={hasChildren ? "#ffffffaa" : "#ffffff33"} />
        <Ionicons name="folder-outline" size={16} color="#789fd6" />
        <Text style={{ color: "#ffffffcc", fontSize: 13, fontWeight: "500", flex: 1 }} numberOfLines={1}>
          {node.file_name}
        </Text>
        {hasChildren && (
          <Text style={{ color: "#ffffff40", fontSize: 11 }}>{children.length}</Text>
        )}
      </TouchableOpacity>

      {open && children.map((child: any) => (
        child.is_folder ? (
          <FolderRow key={child.id} node={child} depth={depth + 1}
            selectedId={selectedId} onSelectFile={onSelectFile} />
        ) : (
          <TouchableOpacity key={child.id} onPress={() => onSelectFile(child)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8,
              paddingVertical: 10, paddingLeft: 8 + (depth + 1) * 16 + 14, paddingRight: 8,
              backgroundColor: selectedId === child.id ? "#789fd622" : "transparent",
              borderRadius: 6 }}>
            <Ionicons
              name={isGDrive(child.file_link) ? "logo-google" : "document-text-outline"}
              size={15} color={selectedId === child.id ? "#789fd6" : "#ffffff60"} />
            <Text style={{ color: selectedId === child.id ? "#fff" : "#ffffff99",
              fontSize: 13, flex: 1 }} numberOfLines={1}>{child.file_name}</Text>
          </TouchableOpacity>
        )
      ))}
    </View>
  );
}

// ─── File Row (file singolo) ──────────────────────────────────────────────────
function FileRow({ file, selectedId, onSelect }: { file: any; selectedId: any; onSelect: (f: any) => void }) {
  const folder = isGDriveFolder(file.file_link);
  const drive = isGDrive(file.file_link);
  const active = selectedId === file.id;
  return (
    <TouchableOpacity onPress={() => onSelect(file)}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 8,
        backgroundColor: active ? "#789fd622" : "transparent", borderRadius: 8 }}>
      <Ionicons
        name={folder ? "folder-outline" : drive ? "logo-google" : "document-text-outline"}
        size={16} color="#789fd6" />
      <Text style={{ color: active ? "#fff" : "#ffffffcc", fontSize: 14, flex: 1,
        fontWeight: active ? "600" : "400" }} numberOfLines={1}>{file.file_name}</Text>
      {folder && <Ionicons name="open-outline" size={13} color="#ffffff40" />}
    </TouchableOpacity>
  );
}

// ─── Select File Modal (con albero cartelle) ──────────────────────────────────
function SelectFileModal({ visible, onClose, folders, flatFiles, selectedId, onSelect, elementLabel }: {
  visible: boolean; onClose: () => void;
  folders: any[]; flatFiles: any[];
  selectedId: any; onSelect: (f: any) => void; elementLabel?: string | null;
}) {
  const { t } = useTranslation("maintenance");
  const pick = (f: any) => { onSelect(f); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 20, maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("select_file")}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Documenti principali fissi */}
            <Text style={{ color: "#ffffff40", fontSize: 11, fontWeight: "700",
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Documento principale
            </Text>
            <FileRow file={MANUAL_SG118} selectedId={selectedId} onSelect={pick} />
            <FileRow file={DRIVE_FOLDER_DISEGNI} selectedId={selectedId} onSelect={pick} />

            {/* Cartelle (albero) */}
            {folders.length > 0 && (
              <>
                <View style={{ height: 1, backgroundColor: "#ffffff10", marginVertical: 10 }} />
                <Text style={{ color: "#ffffff40", fontSize: 11, fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  Cartelle
                </Text>
                {folders.map((folder) => (
                  <FolderRow key={folder.id} node={folder} depth={0}
                    selectedId={selectedId} onSelectFile={pick} />
                ))}
              </>
            )}

            {/* File flat (eventualmente filtrati per impianto) */}
            {flatFiles.length > 0 && (
              <>
                <View style={{ height: 1, backgroundColor: "#ffffff10", marginVertical: 10 }} />
                <Text style={{ color: "#ffffff40", fontSize: 11, fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  {elementLabel ? `Impianto: ${elementLabel}` : "Documenti"}
                </Text>
                {flatFiles.map((f) => (
                  <FileRow key={f.id} file={f} selectedId={selectedId} onSelect={pick} />
                ))}
              </>
            )}

            {folders.length === 0 && flatFiles.length === 0 && (
              <Text style={{ color: "#ffffff60", textAlign: "center", paddingVertical: 24 }}>
                {t("no_data_available")}
              </Text>
            )}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Manuali Page ─────────────────────────────────────────────────────────────
export default function ManualiPage() {
  const { t } = useTranslation("maintenance");
  const { isTablet } = useDevice();
  const user = useSelector((s: RootState) => s.auth?.user) as any;

  const [folders,     setFolders]     = useState<any[]>([]);   // cartelle (is_folder)
  const [flatFiles,   setFlatFiles]   = useState<any[]>([]);   // file non in cartella
  const [selected,    setSelected]    = useState<any>(MANUAL_SG118);
  const [loading,     setLoading]     = useState(true);
  const [isOnline,    setIsOnline]    = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [filteredFiles,   setFilteredFiles]   = useState<any[] | null>(null);

  const [pdfSource, setPdfSource] = useState<{ uri: string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const shipId = String(user?.teamInfo?.assignedShip?.id || "");

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // Carica albero: separa cartelle e file flat (come il web)
  useEffect(() => {
    if (!shipId) return;
    const key = TREE_CACHE(shipId);
    const load = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);
      let data: any[] = [];
      if (online) {
        try {
          data = await getTree(shipId);
          await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch {
          const raw = await AsyncStorage.getItem(key).catch(() => null);
          data = raw ? JSON.parse(raw) : [];
        }
      } else {
        const raw = await AsyncStorage.getItem(key).catch(() => null);
        data = raw ? JSON.parse(raw) : [];
      }
      setFolders(data.filter((n: any) => n.is_folder));
      setFlatFiles(data.filter((n: any) => !n.is_folder));
      setLoading(false);
    };
    load();
  }, [shipId]);

  // Carica PDF quando cambia il file (solo PDF non-Drive)
  useEffect(() => {
    const link = selected?.file_link;
    if (!link || isGDrive(link)) { setPdfSource(null); return; }
    (async () => {
      setPdfLoading(true);
      setPdfSource(null);
      const path = getCachedPath(selected.file_name);
      const cached = await isFileCached(path);
      if (cached) {
        setPdfSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
      } else if (isOnline) {
        try {
          await downloadFile(link, path);
          setPdfSource({ uri: Platform.OS === "android" ? `file://${path}` : path });
        } catch { setPdfSource({ uri: link }); }
      } else { setPdfSource(null); }
      setPdfLoading(false);
    })();
  }, [selected]);

  // Filtro impianto
  const handleElementSelect = (node: any) => {
    setSelectedElement(node);
    const filtered = flatFiles.filter(
      (f) => String(f.element_id) === String(node.id) ||
             String(f.element_model_id) === String(node.element_model_id)
    );
    setFilteredFiles(filtered);
    if (filtered.length > 0) setSelected(filtered[0]);
  };
  const clearElementFilter = () => {
    setSelectedElement(null);
    setFilteredFiles(null);
    setSelected(MANUAL_SG118);
  };

  const displayFlat = filteredFiles !== null ? filteredFiles : flatFiles;

  const link = selected?.file_link;
  const drive = isGDrive(link);
  const driveFolder = isGDriveFolder(link);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: isTablet ? 24 : 16, alignSelf: "center",
        width: "100%", maxWidth: isTablet ? 1200 : "100%" }}>
        <DashboardHeader />

        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 12, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — i documenti Drive richiedono connessione
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, gap: 8 }}>
          <TouchableOpacity onPress={() => setModalOpen(true)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 }} numberOfLines={1}>
              {selected ? selected.file_name : t("select_file")}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilterOpen(true)}
            style={{ backgroundColor: "#ffffff10", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}>
            <Ionicons name="filter-outline" size={16} color="#fff" />
          </TouchableOpacity>

          {link && (
            <TouchableOpacity onPress={() => Linking.openURL(link)}
              style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Ionicons name="download-outline" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Chip filtro impianto */}
        {selectedElement && (
          <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
            backgroundColor: "#789fd622", borderColor: "#789fd640", borderWidth: 1,
            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 10, gap: 8 }}>
            <Ionicons name="filter" size={13} color="#789fd6" />
            <Text style={{ color: "#789fd6", fontSize: 13, maxWidth: 180 }} numberOfLines={1}>
              {selectedElement.name}
            </Text>
            <TouchableOpacity onPress={clearElementFilter}>
              <Ionicons name="close" size={14} color="#789fd6" />
            </TouchableOpacity>
          </View>
        )}

        {/* Viewer */}
        <View style={{ flex: 1, marginTop: 12, borderRadius: 12, overflow: "hidden",
          backgroundColor: "#022a52", minHeight: isTablet ? 600 : undefined }}>
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color="#789fd6" size="large" />
            </View>
          ) : driveFolder ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
              <Ionicons name="folder-outline" size={56} color="#789fd6" />
              <Text style={{ color: "#ffffff80", textAlign: "center" }}>{selected.file_name}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(link)}
                style={{ backgroundColor: "#789fd6", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
                  flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Apri cartella in Google Drive</Text>
                <Ionicons name="open-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : drive ? (
            isOnline ? (
              <WebView source={{ uri: toPreview(link) }} style={{ flex: 1, backgroundColor: "#022a52" }}
                startInLoadingState
                renderLoading={() => (
                  <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator color="#789fd6" size="large" />
                  </View>
                )} />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
                <Ionicons name="cloud-offline-outline" size={56} color="#ffffff40" />
                <Text style={{ color: "#ffffff60", textAlign: "center" }}>
                  Documento Google Drive non disponibile offline.
                </Text>
              </View>
            )
          ) : pdfLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color="#789fd6" size="large" />
              <Text style={{ color: "#789fd6", marginTop: 12 }}>{t("loading")}...</Text>
            </View>
          ) : pdfSource ? (
            <Pdf source={pdfSource} style={{ flex: 1, backgroundColor: "#022a52" }}
              onError={() => Alert.alert("Errore", t("no_data_available"))} trustAllCerts={false} />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
              <Ionicons name="folder-open-outline" size={56} color="#789fd6" />
              <Text style={{ color: "#789fd6", textAlign: "center" }}>{t("select_file")}</Text>
            </View>
          )}
        </View>
      </View>

      <SelectFileModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        folders={folders}
        flatFiles={displayFlat}
        selectedId={selected?.id}
        onSelect={setSelected}
        elementLabel={selectedElement?.name}
      />

      <FacilitiesModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onSelectSystem={(node: any) => { handleElementSelect(node); setFilterOpen(false); }}
      />
    </SafeAreaView>
  );
}