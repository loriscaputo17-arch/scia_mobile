import { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, Pressable,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/api/axios";

// ─── API (General endpoints) ──────────────────────────────────────────────────
const uploadPhotoGeneral = async (formData: FormData) => {
  await api.post("/uploadFiles/uploadPhotoGeneral", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const uploadAudioGeneral = async (formData: FormData) => {
  await api.post("/uploadFiles/uploadAudioGeneral", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const uploadTextGeneral = async (payload: any) => {
  await api.post("/uploadFiles/uploadTextGeneral", payload);
};

// ─── NoteModal ────────────────────────────────────────────────────────────────
// Props:
//   visible     - boolean
//   onClose     - () => void
//   entityId    - ID del reading/failure/spare a cui allegare la nota
//   authorId    - user.id
//   entityType  - "reading" | "failure" | "spare" (default "reading")
//   onSuccess   - () => void  chiamata dopo upload ok per refresh
// ─────────────────────────────────────────────────────────────────────────────
export default function NoteModal({ visible, onClose, entityId, authorId, entityType = "reading", onSuccess }: {
  visible: boolean; onClose: () => void;
  entityId: string; authorId: string;
  entityType?: string; onSuccess?: () => void;
}) {
  const [type, setType] = useState<"photo" | "vocal" | "text" | null>(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setType(null); setTextInput(""); onClose(); };

  const handlePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", { uri: result.assets[0].uri, type: "image/jpeg", name: "note.jpg" } as any);
      fd.append("failureId", entityId);
      fd.append("authorId", authorId);
      fd.append("type", entityType);
      fd.append("status", "read");
      await uploadPhotoGeneral(fd);
      onSuccess?.();
      reset();
    } catch { Alert.alert("Errore", "Upload foto fallito"); }
    finally { setLoading(false); }
  };

  const handleText = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      await uploadTextGeneral({
        content: textInput.trim(),
        failureId: entityId,
        authorId,
        type: entityType,
        status: "read",
      });
      onSuccess?.();
      reset();
    } catch { Alert.alert("Errore", "Upload testo fallito"); }
    finally { setLoading(false); }
  };

  // Audio placeholder (expo-av / react-native-audio-recorder needed for full impl)
  const handleVocal = () => {
    Alert.alert("Info", "Registrazione audio disponibile nel build nativo con expo-av");
  };

  const NOTE_TYPES = [
    { key: "photo" as const, icon: "camera-outline", label: "Foto", action: handlePhoto },
    { key: "vocal" as const, icon: "mic-outline", label: "Audio", action: handleVocal },
    { key: "text" as const, icon: "document-text-outline", label: "Testo", action: () => setType("text") },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={reset}>
        <View style={{ position: "absolute", top:0, bottom: 0, left: 0, right: 0, backgroundColor: "#022a52", paddingTop: 60, padding: 24 }}>
          
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Aggiungi nota</Text>
            <TouchableOpacity onPress={reset}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {/* Type selection */}
          {!type && (
            <>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                {NOTE_TYPES.map((item) => (
                  <TouchableOpacity key={item.key} onPress={item.action} disabled={loading}
                    style={{ flex: 1, backgroundColor: "#ffffff10", borderRadius: 12, padding: 20, alignItems: "center", gap: 10 }}>
                    {loading && item.key === "photo" ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Ionicons name={item.icon as any} size={32} color="#fff" />
                    )}
                    <Text style={{ color: "#fff", fontSize: 13 }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={reset}
                style={{ backgroundColor: "#ffffff10", borderRadius: 8, padding: 14, alignItems: "center" }}>
                <Text style={{ color: "#fff" }}>Chiudi</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Text input */}
          {type === "text" && (
            <>
              <TextInput
                value={textInput} onChangeText={setTextInput}
                placeholder="Scrivi la nota..." placeholderTextColor="#6b7280"
                multiline numberOfLines={5}
                style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12, minHeight: 120, textAlignVertical: "top", marginBottom: 16 }}
                autoFocus
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={() => setType(null)}
                  style={{ flex: 1, backgroundColor: "#ffffff15", borderRadius: 8, padding: 14, alignItems: "center" }}>
                  <Text style={{ color: "#fff" }}>Indietro</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleText} disabled={loading || !textInput.trim()}
                  style={{ flex: 1, backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", opacity: !textInput.trim() ? 0.5 : 1 }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Invia</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}