import { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, Pressable,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/api/axios";
import { useTranslation } from "@/app/i18n";

// ─── API ──────────────────────────────────────────────────────────────────────
const uploadPhotoGeneral = async (formData: FormData) => {
  await api.post("/uploadFiles/uploadPhotoGeneral", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
const uploadTextGeneral = async (payload: any) => {
  await api.post("/uploadFiles/uploadTextGeneral", payload);
};

// ─── NoteModal ────────────────────────────────────────────────────────────────
export default function NoteModal({
  visible, onClose, entityId, authorId, entityType = "reading", onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  authorId: string;
  entityType?: string;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation("failures");
  const [type, setType]           = useState<"photo" | "vocal" | "text" | null>(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading]     = useState(false);

  const reset = () => { setType(null); setTextInput(""); onClose(); };

  const uploadAsset = async (uri: string) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", { uri, type: "image/jpeg", name: "note.jpg" } as any);
      fd.append("failureId", entityId);
      fd.append("authorId",  authorId);
      fd.append("type",      entityType);
      fd.append("status",    "read");
      await uploadPhotoGeneral(fd);
      onSuccess?.();
      reset();
    } catch { Alert.alert(t("error"), t("upload_photo")); }
    finally   { setLoading(false); }
  };

  const handleGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert(t("error"), "Consenti l'accesso alla galleria nelle impostazioni.");
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
    });
    if (!res.canceled) await uploadAsset(res.assets[0].uri);
  };

  const handleCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert(t("error"), "Consenti l'accesso alla fotocamera nelle impostazioni.");
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
    });
    if (!res.canceled) await uploadAsset(res.assets[0].uri);
  };

  const handleText = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      await uploadTextGeneral({
        content: textInput.trim(), failureId: entityId,
        authorId, type: entityType, status: "read",
      });
      onSuccess?.();
      reset();
    } catch { Alert.alert(t("error"), t("upload_photo")); }
    finally   { setLoading(false); }
  };

  const handleVocal = () =>
    Alert.alert("Info", t("mic_error"));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={reset}>
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", paddingTop: 60, padding: 24 }}>

          <View style={{ flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 28 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("add_note")}</Text>
            <TouchableOpacity onPress={reset}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {!type && (
            <>
              <View style={{ gap: 12, marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setType("photo")} disabled={loading}
                  style={{ backgroundColor: "#ffffff10", borderRadius: 14,
                    padding: 20, alignItems: "center", gap: 10 }}>
                  <Ionicons name="camera-outline" size={32} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 13 }}>{t("photogtaphic_note")}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleVocal} disabled={loading}
                  style={{ backgroundColor: "#ffffff10", borderRadius: 14,
                    padding: 20, alignItems: "center", gap: 10 }}>
                  <Ionicons name="mic-outline" size={32} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 13 }}>{t("vocal_note")}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setType("text")} disabled={loading}
                  style={{ backgroundColor: "#ffffff10", borderRadius: 14,
                    padding: 20, alignItems: "center", gap: 10 }}>
                  <Ionicons name="document-text-outline" size={32} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 13 }}>{t("text_note")}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={reset}
                style={{ backgroundColor: "#ffffff10", borderRadius: 8, padding: 14, alignItems: "center" }}>
                <Text style={{ color: "#fff" }}>{t("close_button")}</Text>
              </TouchableOpacity>
            </>
          )}

          {type === "photo" && !loading && (
            <>
              <Text style={{ color: "#ffffff80", fontSize: 14, marginBottom: 20 }}>
                {t("upload_photo")}
              </Text>

              {/* Camera */}
              <TouchableOpacity onPress={handleCamera}
                style={{ backgroundColor: "#ffffff10", borderRadius: 14, padding: 20,
                  flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26,
                  backgroundColor: "#789fd6", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="camera" size={26} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{t("start_recording")}</Text>
                  <Text style={{ color: "#ffffff80", fontSize: 13, marginTop: 2 }}>{t("upload_photo")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ffffff60" />
              </TouchableOpacity>

              {/* Gallery */}
              <TouchableOpacity onPress={handleGallery}
                style={{ backgroundColor: "#ffffff10", borderRadius: 14, padding: 20,
                  flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26,
                  backgroundColor: "#2DB647", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="images" size={26} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{t("preview")}</Text>
                  <Text style={{ color: "#ffffff80", fontSize: 13, marginTop: 2 }}>JPG, PNG, HEIC</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ffffff60" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setType(null)}
                style={{ backgroundColor: "#ffffff15", borderRadius: 8, padding: 14, alignItems: "center" }}>
                <Text style={{ color: "#fff" }}>{t("back")}</Text>
              </TouchableOpacity>
            </>
          )}

          {type === "photo" && loading && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
              <ActivityIndicator color="#789fd6" size="large" />
              <Text style={{ color: "#ffffff80" }}>{t("loading")}</Text>
            </View>
          )}

          {type === "text" && (
            <>
              <TextInput
                value={textInput}
                onChangeText={setTextInput}
                placeholder={t("write_here")}
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={6}
                style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 10,
                  padding: 14, minHeight: 140, textAlignVertical: "top",
                  marginBottom: 16, fontSize: 15, lineHeight: 22 }}
                autoFocus
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={() => setType(null)}
                  style={{ flex: 1, backgroundColor: "#ffffff15", borderRadius: 8,
                    padding: 14, alignItems: "center" }}>
                  <Text style={{ color: "#fff" }}>{t("back")}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleText} disabled={loading || !textInput.trim()}
                  style={{ flex: 1, backgroundColor: "#789fd6", borderRadius: 8,
                    padding: 14, alignItems: "center", opacity: !textInput.trim() ? 0.5 : 1 }}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: "#fff", fontWeight: "700" }}>{t("send")}</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </Pressable>
    </Modal>
  );
}