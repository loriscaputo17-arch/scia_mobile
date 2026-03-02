import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Modal, Pressable,
  TextInput, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchSpareById = async (ean13: string, partNumber: string, eswbsSearch: string) => {
  const params = new URLSearchParams();
  if (ean13) params.append("ean13", ean13);
  if (partNumber) params.append("partNumber", partNumber);
  if (eswbsSearch) params.append("eswbsSearch", eswbsSearch);
  const res = await api.get(`/spare/fetchSpareById?${params.toString()}`);
  return res.data.spares || [];
};

const updateSpare = async (id: string, updateData: any, shipId: string, userId: string) => {
  const res = await api.put(`/spare/moveSpare/${id}`, { updateData, ship_id: shipId, user_id: userId });
  return res.data;
};

const submitProduct = async (payload: any) => {
  const res = await api.post("/spare/submitProduct", payload);
  return res.data;
};

const uploadProductImage = async (formData: FormData) => {
  const res = await api.post("/spare/uploadProductImage", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
};

const saveScan = async (data: any) => {
  await api.put(`/scans/saveScan/${data.scanId}`, { result: data.scannedData, scannedAt: data.scannedAt });
};

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, multiline }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value} onChangeText={onChangeText}
        placeholder={placeholder || "Scrivi qui..."} placeholderTextColor="#6b7280"
        multiline={multiline} numberOfLines={multiline ? 3 : 1}
        style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12, textAlignVertical: multiline ? "top" : "auto", minHeight: multiline ? 80 : undefined }}
      />
    </View>
  );
}

// ─── QR Scanner ───────────────────────────────────────────────────────────────
function QRScannerModal({ visible, onScanned, onClose }: { visible: boolean; onScanned: (v: string) => void; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => { if (visible && !permission?.granted) requestPermission(); }, [visible]);

  const handleBarcode = ({ data }: any) => {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#001c38" }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, paddingTop: 48 }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Scansiona barcode</Text>
        </View>
        {permission?.granted ? (
          <CameraView style={{ flex: 1 }} onBarcodeScanned={handleBarcode} barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "code128"] }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <View style={{ width: 240, height: 240, borderWidth: 2, borderColor: "#e2d52d", borderRadius: 8 }} />
              <Text style={{ color: "#fff", marginTop: 16 }}>Inquadra il barcode</Text>
            </View>
          </CameraView>
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff" }}>Permesso fotocamera necessario</Text>
            <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 12, marginTop: 16 }}>
              <Text style={{ color: "#fff" }}>Concedi permesso</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Move Product Table ───────────────────────────────────────────────────────
function MoveProductTable({ data, onDataChange }: { data: any; onDataChange: (d: any) => void }) {
  const initialLocations = Array.isArray(data.locationData) ? data.locationData : [data.locationData].filter(Boolean);
  const quantityList = typeof data.quantity === "string"
    ? data.quantity.split(",").map((q: string) => parseFloat(q.trim()))
    : [data.quantity ?? 0];

  const [locations, setLocations] = useState(() =>
    initialLocations.map((loc: any, i: number) => ({
      ...loc,
      location: typeof loc.location === "object" ? loc.location?.location : loc.location,
      quantity: quantityList[i] ?? 0,
    }))
  );
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState<number | null>(null);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...locations];
    if (field === "stock") {
      const stockValue = parseInt(value, 10) || 0;
      updated[index] = { ...updated[index], stock: stockValue, quantity: (quantityList[index] ?? 0) - stockValue };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setLocations(updated);
    onDataChange({ ...data, locationData: updated });
  };

  return (
    <View>
      {locations.map((row: any, index: number) => (
        <View key={index} style={{ backgroundColor: "#001c38", borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 8, fontWeight: "600" }}>Ubicazione {index + 1}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 4 }}>Magazzino</Text>
              <TextInput value={row.warehouse || data?.warehouseData?.name || ""} editable={false}
                style={{ backgroundColor: "#ffffff08", color: "#ffffff80", borderRadius: 6, padding: 10, fontSize: 13 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 4 }}>Qtà attuale</Text>
              <TextInput value={String(row.quantity ?? 0)} onChangeText={(v) => handleChange(index, "quantity", v)}
                keyboardType="numeric" style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 6, padding: 10, fontSize: 13 }} />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 4 }}>Ubicazione attuale</Text>
              <TextInput value={row.location || ""} onChangeText={(v) => handleChange(index, "location", v)}
                style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 6, padding: 10, fontSize: 13 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 4 }}>Stock da spostare</Text>
              <TextInput value={String(row.stock || "")} onChangeText={(v) => handleChange(index, "stock", v)}
                keyboardType="numeric" style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 6, padding: 10, fontSize: 13 }} />
            </View>
          </View>

          <Text style={{ color: "#789fd6", fontSize: 12, marginBottom: 4 }}>Nuova ubicazione</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput value={row.newLocation || ""} onChangeText={(v) => handleChange(index, "newLocation", v)}
              style={{ flex: 1, backgroundColor: "#ffffff10", color: "#fff", borderRadius: 6, padding: 10, fontSize: 13 }} />
            <TouchableOpacity onPress={() => { setScanTarget(index); setScannerOpen(true); }}
              style={{ backgroundColor: "#e2d52d", borderRadius: 6, padding: 10 }}>
              <Ionicons name="barcode-outline" size={20} color="#022a52" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <QRScannerModal visible={scannerOpen} onClose={() => setScannerOpen(false)}
        onScanned={(v) => { if (scanTarget !== null) handleChange(scanTarget, "newLocation", v); setScannerOpen(false); }} />
    </View>
  );
}

// ─── Add Product Form ─────────────────────────────────────────────────────────
function AddProductForm({ onClose, shipId, userId }: { onClose: () => void; shipId: string; userId: string }) {
  const [form, setForm] = useState({ ean13: "", partNumber: "", originalName: "", supplier: "", supplierNcage: "", manufacturerNcage: "", manufacturerPartNumber: "", price: "", leadTime: "", description: "", warehouse: "", location: "", stock: "1" });
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        const fd = new FormData();
        fd.append("file", { uri: image.uri, type: "image/jpeg", name: "product.jpg" } as any);
        fd.append("userId", userId);
        const res = await uploadProductImage(fd);
        imageUrl = res?.url;
      }
      await submitProduct({ ...form, ship_id: shipId, user_id: userId, image: imageUrl });
      Alert.alert("Successo", "Ricambio aggiunto");
      onClose();
    } catch { Alert.alert("Errore", "Impossibile aggiungere il ricambio"); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Inserisci ricambio</Text>
        <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
      </View>

      {/* Image picker */}
      <TouchableOpacity onPress={pickImage} style={{ backgroundColor: "#ffffff10", borderRadius: 10, height: 120, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        {image ? <Image source={{ uri: image.uri }} style={{ width: "100%", height: 120, borderRadius: 10 }} resizeMode="cover" />
          : <><Ionicons name="camera-outline" size={36} color="#789fd6" /><Text style={{ color: "#789fd6", marginTop: 8 }}>Aggiungi immagine</Text></>}
      </TouchableOpacity>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Part Number" value={form.partNumber} onChangeText={(v: string) => set("partNumber", v)} /></View>
        <View style={{ flex: 1 }}><Field label="EAN13" value={form.ean13} onChangeText={(v: string) => set("ean13", v)} /></View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Nome originale" value={form.originalName} onChangeText={(v: string) => set("originalName", v)} /></View>
        <View style={{ flex: 1 }}><Field label="Fornitore" value={form.supplier} onChangeText={(v: string) => set("supplier", v)} /></View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="NCAGE Fornitore" value={form.supplierNcage} onChangeText={(v: string) => set("supplierNcage", v)} /></View>
        <View style={{ flex: 1 }}><Field label="NCAGE Costruttore" value={form.manufacturerNcage} onChangeText={(v: string) => set("manufacturerNcage", v)} /></View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Prezzo" value={form.price} onChangeText={(v: string) => set("price", v)} /></View>
        <View style={{ flex: 1 }}><Field label="Lead Time" value={form.leadTime} onChangeText={(v: string) => set("leadTime", v)} /></View>
      </View>
      <Field label="Descrizione" value={form.description} onChangeText={(v: string) => set("description", v)} multiline />

      {/* Location with scanner */}
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
        <View style={{ flex: 1 }}><Field label="Magazzino" value={form.warehouse} onChangeText={(v: string) => set("warehouse", v)} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Ubicazione</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
            <TextInput value={form.location} onChangeText={(v) => set("location", v)} placeholderTextColor="#6b7280"
              style={{ flex: 1, backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }} />
            <TouchableOpacity onPress={() => setScannerOpen(true)} style={{ backgroundColor: "#e2d52d", borderRadius: 8, padding: 12 }}>
              <Ionicons name="barcode-outline" size={20} color="#022a52" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}><Field label="Stock iniziale" value={form.stock} onChangeText={(v: string) => set("stock", v)} /></View>
      </View>

      <TouchableOpacity onPress={handleConfirm} disabled={loading}
        style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 8 }}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Conferma</Text>}
      </TouchableOpacity>

      <QRScannerModal visible={scannerOpen} onClose={() => setScannerOpen(false)}
        onScanned={(v) => { set("location", v); setScannerOpen(false); }} />
    </ScrollView>
  );
}

// ─── Move Product Modal ───────────────────────────────────────────────────────
export default function MoveProductModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const shipId = String(user?.teamInfo?.assignedShip?.id || "");

  const [ean13, setEan13] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [addSpare, setAddSpare] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => { setEan13(""); setPartNumber(""); setResults(null); setShowResults(false); setAddSpare(false); onClose(); };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetchSpareById(ean13, partNumber, "");
      if (res.length > 0) { setResults(res[0]); setShowResults(true); }
      else setAddSpare(true);
    } catch { Alert.alert("Errore", "Ricerca fallita"); }
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!results) return;
    setLoading(true);
    try {
      await updateSpare(results.ID, { ...results, updatedAt: new Date().toISOString() }, shipId, String(user?.id));
      Alert.alert("Successo", "Ricambio aggiornato");
      reset();
    } catch { Alert.alert("Errore", "Aggiornamento fallito"); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={reset}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "90%" }}>

          {/* ADD NEW SPARE */}
          {addSpare && (
            <AddProductForm onClose={() => { setAddSpare(false); reset(); }} shipId={shipId} userId={String(user?.id)} />
          )}

          {/* SEARCH */}
          {!addSpare && !showResults && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Sposta/Aggiungi ricambio</Text>
                <TouchableOpacity onPress={reset}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setScanning(true)}
                style={{ backgroundColor: "#e2d52d", borderRadius: 10, padding: 16, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Ionicons name="barcode-outline" size={24} color="#022a52" />
                <Text style={{ color: "#022a52", fontWeight: "700" }}>Scansiona barcode</Text>
              </TouchableOpacity>

              <Field label="EAN13" value={ean13} onChangeText={setEan13} />
              <Field label="Part Number" value={partNumber} onChangeText={setPartNumber} />

              <TouchableOpacity onPress={handleSearch} disabled={loading || (!ean13 && !partNumber)}
                style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", opacity: (!ean13 && !partNumber) ? 0.5 : 1 }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Cerca</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* RESULTS */}
          {!addSpare && showResults && results && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Sposta ricambio</Text>
                <TouchableOpacity onPress={reset}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
              </View>

              <View style={{ backgroundColor: "#001c38", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <Text style={{ color: "#789fd6", fontSize: 13 }}>Nome</Text>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 4 }}>{results.Part_name}</Text>
                <Text style={{ color: "#789fd6", fontSize: 13, marginTop: 10 }}>Part Number</Text>
                <Text style={{ color: "#fff", fontSize: 15, marginTop: 4 }}>{results.Serial_number}</Text>
              </View>

              <MoveProductTable data={results} onDataChange={setResults} />

              <TouchableOpacity onPress={handleConfirm} disabled={loading}
                style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 8 }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Conferma</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Pressable>

      <QRScannerModal visible={scanning} onClose={() => setScanning(false)}
        onScanned={(v) => { setEan13(v); setScanning(false); saveScan({ scannedData: v, scannedAt: new Date().toISOString(), scanId: null }).catch(() => {}); }} />
    </Modal>
  );
}