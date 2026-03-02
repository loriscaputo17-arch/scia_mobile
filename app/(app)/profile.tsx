import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Pressable,
  TextInput, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUser } from "@/features/auth/authSlice";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { useLogout } from "@/hooks/useLogout";
import * as ImagePicker from "expo-image-picker";

// ─── API ──────────────────────────────────────────────────────────────────────
const getRanks = async () => {
  const res = await api.get("/profile/getRanks");
  return res.data || [];
};

const updateProfileData = async (payload: any) => {
  const res = await api.post("/profile/updateProfile", payload);
  return res.data;
};

const uploadProfileImage = async (formData: FormData) => {
  const res = await api.post("/profile/uploadProfileImage", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

const getSecuritySettings = async (userId: string) => {
  const res = await api.post("/auth/getSecuritySettings", { userId });
  return res.data;
};

const updateSecuritySettings = async (payload: any) => {
  const res = await api.post("/auth/updateSecuritySettings", payload);
  return res.data;
};

// ─── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({ visible, onClose, userId }: { visible: boolean; onClose: () => void; userId: string }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [useQuickPin, setUseQuickPin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      getSecuritySettings(userId).then((s) => {
        if (s) setUseQuickPin(s.pin_enabled || false);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert("Errore", "Le password non coincidono");
      return;
    }
    if (useQuickPin && pin !== confirmPin) {
      Alert.alert("Errore", "I PIN non coincidono");
      return;
    }
    setLoading(true);
    try {
      await updateSecuritySettings({ userId, oldPassword, newPassword, pin: pin || null, useQuickPin });
      Alert.alert("Successo", "Impostazioni di sicurezza aggiornate");
      onClose();
    } catch {
      Alert.alert("Errore", "Impossibile aggiornare le impostazioni");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Sicurezza</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {[
            { label: "Vecchia password", value: oldPassword, setter: setOldPassword },
            { label: "Nuova password", value: newPassword, setter: setNewPassword },
            { label: "Conferma password", value: confirmPassword, setter: setConfirmPassword },
          ].map((f) => (
            <View key={f.label} style={{ marginBottom: 12 }}>
              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{f.label}</Text>
              <TextInput
                value={f.value} onChangeText={f.setter}
                secureTextEntry placeholder={f.label} placeholderTextColor="#6b7280"
                style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }}
              />
            </View>
          ))}

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setUseQuickPin(!useQuickPin)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: useQuickPin ? "#789fd6" : "#ffffff50", backgroundColor: useQuickPin ? "#789fd6" : "transparent" }} />
              <Text style={{ color: "#fff" }}>Abilita PIN rapido</Text>
            </TouchableOpacity>
          </View>

          {useQuickPin && (
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>PIN</Text>
                <TextInput value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric" placeholder="PIN" placeholderTextColor="#6b7280" style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Conferma PIN</Text>
                <TextInput value={confirmPin} onChangeText={setConfirmPin} secureTextEntry keyboardType="numeric" placeholder="Conferma" placeholderTextColor="#6b7280" style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }} />
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleSave} disabled={loading} style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center" }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Salva</Text>}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, disabled = false, secureTextEntry = false }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value} onChangeText={onChange}
        editable={!disabled} secureTextEntry={secureTextEntry}
        style={{ backgroundColor: disabled ? "#ffffff08" : "#ffffff15", color: disabled ? "#ffffff60" : "#fff", borderRadius: 8, padding: 12, opacity: disabled ? 0.6 : 1 }}
      />
    </View>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { logout } = useLogout();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [ranks, setRanks] = useState<any[]>([]);
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [rankOpen, setRankOpen] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);

  useEffect(() => {
    getRanks().then((data) => {
      setRanks(data);
      const found = data.find((r: any) => r.id === Number(user?.rank));
      if (found) setSelectedRank(found);
    });
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append("profileImage", { uri, type: "image/jpeg", name: "profile.jpg" } as any);
      formData.append("userId", String(user?.id));
      try {
        const res = await uploadProfileImage(formData);
        if (res?.url) setProfileImage(res.url);
      } catch {
        Alert.alert("Errore", "Impossibile caricare l'immagine");
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileData({
        userId: user?.id,
        firstName, lastName,
        email, phoneNumber: phone,
        rank: selectedRank?.id,
      });
      dispatch(setUser({ ...user, firstName, lastName, phoneNumber: phone, rank: selectedRank?.id }));
      Alert.alert("Successo", "Profilo aggiornato");
    } catch {
      Alert.alert("Errore", "Impossibile aggiornare il profilo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>Profilo</Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Logout", "Sei sicuro di voler uscire?", [
              { text: "Annulla", style: "cancel" },
              { text: "Esci", style: "destructive", onPress: logout },
            ])}
            style={{ marginLeft: "auto", backgroundColor: "#D0021B", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons name="log-out-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12, alignItems: "center" }}>
            <TouchableOpacity onPress={handlePickImage}>
              {profileImage
                ? <Image source={{ uri: profileImage }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                : <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#789fd6", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
              }
              <View style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "#789fd6", borderRadius: 12, padding: 4 }}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Info readonly */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            {[
              { label: "Tipo", value: user?.type },
              { label: "Team", value: user?.team?.name },
              { label: "Responsabile", value: user?.teamLeader ? `${user.teamLeader.firstName} ${user.teamLeader.lastName}` : null },
              { label: "Data iscrizione", value: user?.registrationDate ? new Date(user.registrationDate).toLocaleDateString("it-IT") : null },
            ].filter(f => f.value).map((f) => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={{ color: "#789fd6", fontSize: 12 }}>{f.label}</Text>
                <Text style={{ color: "#fff", fontSize: 15, marginTop: 2 }}>{f.value}</Text>
              </View>
            ))}
          </View>

          {/* Form modificabile */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Field label="Nome" value={firstName} onChange={setFirstName} />
            <Field label="Cognome" value={lastName} onChange={setLastName} />
            <Field label="Email" value={email} disabled />
            <Field label="Telefono" value={phone} onChange={setPhone} />

            {/* Rank picker */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>Grado</Text>
            <TouchableOpacity
              onPress={() => setRankOpen(true)}
              style={{ backgroundColor: "#ffffff15", borderRadius: 8, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 16 }}
            >
              <Text style={{ color: "#fff", flex: 1 }}>{selectedRank?.grado || "Seleziona grado"}</Text>
              <Ionicons name="chevron-down" size={18} color="#fff" />
            </TouchableOpacity>

            {/* Sicurezza */}
            <TouchableOpacity
              onPress={() => setPasswordModal(true)}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 15 }}>Password e PIN</Text>
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>Gestisci le credenziali di accesso</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSave} disabled={saving}
            style={{ backgroundColor: "#789fd6", borderRadius: 10, padding: 16, alignItems: "center", marginBottom: 32 }}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Salva</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Rank Modal */}
      <Modal visible={rankOpen} transparent animationType="slide" onRequestClose={() => setRankOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={() => setRankOpen(false)}>
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "60%" }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 16 }}>Seleziona grado</Text>
            <ScrollView>
              {ranks.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => { setSelectedRank(r); setRankOpen(false); }}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedRank?.id === r.id ? "#789fd6" : "#ffffff50", backgroundColor: selectedRank?.id === r.id ? "#789fd6" : "transparent", marginRight: 12 }} />
                  <Text style={{ color: "#fff", fontSize: 15 }}>{r.grado}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <PasswordModal visible={passwordModal} onClose={() => setPasswordModal(false)} userId={String(user?.id)} />
    </SafeAreaView>
  );
}