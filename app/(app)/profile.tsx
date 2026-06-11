import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Pressable, TextInput,
  useWindowDimensions
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
import { Image } from "expo-image";
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineAction } from "@/hooks/useOfflineAction";

// ─── API ──────────────────────────────────────────────────────────────────────
const getRanks             = async () => (await api.get("/profile/getRanks")).data || [];
const updateProfileApi     = async (p: any) => (await api.post("/profile/updateProfile", p)).data;
const uploadProfileImageApi = async (fd: FormData) =>
  (await api.post("/profile/uploadProfileImage", fd, { headers: { "Content-Type": "multipart/form-data" } })).data;
const getSecuritySettings  = async (userId: string) => (await api.post("/auth/getSecuritySettings", { userId })).data;
const updateSecurityApi    = async (p: any) => (await api.post("/auth/updateSecuritySettings", p)).data;

// ─── Cache keys ───────────────────────────────────────────────────────────────
const RANKS_CACHE          = "cache_ranks";
const PROFILE_PENDING      = (uid: any) => `pending_profile_${uid}`;
const SECURITY_PENDING     = (uid: any) => `pending_security_${uid}`;

// ─── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({ visible, onClose, userId, isOnline }: {
  visible: boolean; onClose: () => void; userId: string; isOnline: boolean;
}) {
  const { t } = useTranslation("profile");
  const { execute } = useOfflineAction();
  const [oldPassword,     setOldPassword]     = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin,             setPin]             = useState("");
  const [confirmPin,      setConfirmPin]      = useState("");
  const [useQuickPin,     setUseQuickPin]     = useState(false);
  const [loading,         setLoading]         = useState(false);

  useEffect(() => {
    if (!visible) return;
    // Carica security settings — solo se online (dati sensibili, non cacheati)
    if (isOnline) {
      getSecuritySettings(userId)
        .then((s) => { if (s) setUseQuickPin(s.pin_enabled || false); })
        .catch(() => {});
    }
  }, [visible, isOnline]);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert(t("error"), t("passwords_not_matching")); return;
    }
    if (useQuickPin && pin !== confirmPin) {
      Alert.alert(t("error"), t("pins_not_matching")); return;
    }

    // I dati di sicurezza richiedono connessione: non ha senso salvarli offline
    if (!isOnline) {
      Alert.alert(t("error"), t("security_requires_connection")); return;
    }

    setLoading(true);
    try {
      await updateSecurityApi({ userId, oldPassword, newPassword, pin: pin || null, useQuickPin });
      Alert.alert(t("save"), t("security_updated"));
      onClose();
    } catch {
      Alert.alert(t("error"), t("security_update_failed"));
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52",
          borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{t("security")}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {/* Banner: sicurezza richiede connessione */}
          {!isOnline && (
            <View style={{ backgroundColor: "#F4721622", borderRadius: 8, padding: 10, marginBottom: 16,
              flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-offline-outline" size={14} color="#F47216" />
              <Text style={{ color: "#F47216", fontSize: 12 }}>{t("security_requires_connection")}</Text>
            </View>
          )}

          {[
            { label: t("old_password"),     value: oldPassword,     setter: setOldPassword },
            { label: t("new_password"),     value: newPassword,     setter: setNewPassword },
            { label: t("confirm_password"), value: confirmPassword, setter: setConfirmPassword },
          ].map((f) => (
            <View key={f.label} style={{ marginBottom: 12 }}>
              <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{f.label}</Text>
              <TextInput value={f.value} onChangeText={f.setter} secureTextEntry
                editable={isOnline}
                placeholder={f.label} placeholderTextColor="#6b7280"
                style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12,
                  opacity: isOnline ? 1 : 0.5 }} />
            </View>
          ))}

          <TouchableOpacity onPress={() => isOnline && setUseQuickPin(!useQuickPin)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16,
              opacity: isOnline ? 1 : 0.5 }}>
            <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2,
              borderColor: useQuickPin ? "#789fd6" : "#ffffff50",
              backgroundColor: useQuickPin ? "#789fd6" : "transparent" }} />
            <Text style={{ color: "#fff" }}>{t("use_pin")}</Text>
          </TouchableOpacity>

          {useQuickPin && (
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>PIN</Text>
                <TextInput value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric"
                  editable={isOnline} placeholder="PIN" placeholderTextColor="#6b7280"
                  style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("confirm_pin")}</Text>
                <TextInput value={confirmPin} onChangeText={setConfirmPin} secureTextEntry keyboardType="numeric"
                  editable={isOnline} placeholder={t("confirm")} placeholderTextColor="#6b7280"
                  style={{ backgroundColor: "#ffffff10", color: "#fff", borderRadius: 8, padding: 12 }} />
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleSave} disabled={loading || !isOnline}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center",
              opacity: isOnline ? 1 : 0.5 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>{t("save")}</Text>}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, disabled = false }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} editable={!disabled}
        style={{ backgroundColor: disabled ? "#ffffff08" : "#ffffff15",
          color: disabled ? "#ffffff60" : "#fff", borderRadius: 8, padding: 12, opacity: disabled ? 0.6 : 1 }} />
    </View>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {

  const dispatch = useDispatch<AppDispatch>();
  const user     = useSelector((state: RootState) => state.auth?.user) as any;
  const { logout } = useLogout();
  const { t }      = useTranslation("profile");
  const { execute } = useOfflineAction();

  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;

  const [isOnline, setIsOnline] = useState(true);
  const [isDirty,  setIsDirty]  = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName,  setLastName]  = useState(user?.lastName  || "");
  const [email]                   = useState(user?.email     || "");
  const [phone,     setPhone]     = useState(user?.phoneNumber || "");

  const [ranks, setRanks]               = useState<any[]>([]);
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [rankOpen, setRankOpen]         = useState(false);

  const [passwordModal, setPasswordModal] = useState(false);
  const [saving, setSaving]               = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  // ── Carica ranks: API → cache → fallback ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);
      let data: any[] = [];

      if (online) {
        try {
          data = await getRanks();
          await AsyncStorage.setItem(RANKS_CACHE, JSON.stringify(data));
        } catch {
          const raw = await AsyncStorage.getItem(RANKS_CACHE).catch(() => null);
          if (raw) data = JSON.parse(raw);
        }
      } else {
        const raw = await AsyncStorage.getItem(RANKS_CACHE).catch(() => null);
        if (raw) data = JSON.parse(raw);
      }

      setRanks(data);
      const found = data.find((r: any) => r.id === Number(user?.rank));
      if (found) setSelectedRank(found);
    };

    load();
  }, []);

  // ── Auto-sync profilo pendente quando torna online ────────────────────────
  useEffect(() => {
    if (!isOnline || !user?.id) return;
    const syncPending = async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_PENDING(user.id));
        if (!raw) return;
        await updateProfileApi(JSON.parse(raw));
        await AsyncStorage.removeItem(PROFILE_PENDING(user.id));
        setIsDirty(false);
      } catch {}
    };
    syncPending();
  }, [isOnline, user]);

  // ── Upload immagine profilo ───────────────────────────────────────────────
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images as any, quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;

    // Ottimistico: mostra subito la nuova immagine
    setProfileImage(uri);

    await execute({
      type: "UPLOAD_NOTE_PHOTO", // riusa lo stesso tipo — adatta se hai un tipo dedicato
      payload: { entityId: String(user?.id), entityType: "profile", authorId: String(user?.id) },
      localFileUri: uri,
      localFileName: "profile.jpg",
      // Se online l'hook chiama l'API direttamente tramite syncQueue;
      // se offline mette in coda e carica quando torna la rete.
    });
  };

  // ── Salva profilo ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload = {
      userId: user.id,
      firstName, lastName, email,
      phoneNumber: phone,
      rank: selectedRank?.id,
    };

    try {
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      // Ottimistico: aggiorna Redux subito
      dispatch(setUser({ ...user, firstName, lastName, phoneNumber: phone, rank: selectedRank?.id }));

      if (online) {
        await updateProfileApi(payload);
        await AsyncStorage.removeItem(PROFILE_PENDING(user.id));
        setIsDirty(false);
        Alert.alert(t("save"), t("profile_updated"));
      } else {
        // Salva in coda locale
        await AsyncStorage.setItem(PROFILE_PENDING(user.id), JSON.stringify(payload));
        setIsDirty(true);
        Alert.alert(t("save"), t("profile_saved_offline"));
      }
    } catch {
      Alert.alert(t("error"), t("profile_update_failed"));
    } finally { setSaving(false); }
  };

  // Info readonly
  const infoRows = [
    { label: t("type"),              value: user?.type },
    { label: t("team"),              value: user?.teamInfo?.teamName },
    { label: t("responsible"),       value: user?.teamInfo?.teamLeader ? `${user.teamInfo.teamLeader.firstName} ${user.teamInfo.teamLeader.lastName}` : null },
    { label: t("subscription_date"), value: user?.registrationDate ? new Date(user.registrationDate).toLocaleDateString("it-IT") : null },
  ].filter((f) => f.value);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 4 }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>{t("profile")}</Text>
          <TouchableOpacity
            onPress={() => Alert.alert(t("logout"), t("logout_confirm"), [
              { text: t("cancel"), style: "cancel" },
              { text: t("logout"), style: "destructive", onPress: logout },
            ])}
            style={{ marginLeft: "auto", backgroundColor: "#D0021B", borderRadius: 8,
              paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="log-out-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600" }}>{t("logout")}</Text>
          </TouchableOpacity>
        </View>

        {/* Banner offline */}
        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginTop: 8, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — {t("changes_saved_locally")}
            </Text>
          </View>
        )}

        {/* Banner sync pendente */}
        {isOnline && isDirty && (
          <View style={{ backgroundColor: "#2DB647", borderRadius: 8, padding: 10,
            marginTop: 8, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-upload-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              {t("syncing_pending_changes")}
            </Text>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>

          {/* Avatar */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16,
            marginBottom: 12, alignItems: "center" }}>
            <TouchableOpacity onPress={handlePickImage}>
              {profileImage
                ? <Image source={{ uri: profileImage }} style={{ width: 80, height: 80, borderRadius: 40 }} contentFit="cover" />
                : <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#789fd6",
                    alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
              }
              <View style={{ position: "absolute", bottom: 0, right: 0,
                backgroundColor: "#789fd6", borderRadius: 12, padding: 4 }}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            {!isOnline && (
              <Text style={{ color: "#ffffff60", fontSize: 11, marginTop: 8 }}>
                {t("image_upload_queued")}
              </Text>
            )}
          </View>

          {/* Info readonly */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            {infoRows.map((f) => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={{ color: "#789fd6", fontSize: 12 }}>{f.label}</Text>
                <Text style={{ color: "#fff", fontSize: 15, marginTop: 2 }}>{f.value}</Text>
              </View>
            ))}
          </View>

          {/* Form modificabile */}
          <View style={{ backgroundColor: "#022a52", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Field label={t("name")}    value={firstName} onChange={setFirstName} />
            <Field label={t("surname")} value={lastName}  onChange={setLastName} />
            <Field label={t("email")}   value={email}     disabled />
            <Field label={t("phone")}   value={phone}     onChange={setPhone} />

            {/* Rank picker */}
            <Text style={{ color: "#789fd6", fontSize: 13, marginBottom: 6 }}>{t("rank")}</Text>
            <TouchableOpacity onPress={() => setRankOpen(true)}
              style={{ backgroundColor: "#ffffff15", borderRadius: 8, padding: 12,
                flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              {selectedRank ? (
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 10 }}>
                  <Image source={{ uri: selectedRank.distintivo_controspallina }}
                    style={{ width: 16, height: 32 }} contentFit="contain" />
                  <Text style={{ color: "#fff", flex: 1 }}>{selectedRank.grado}</Text>
                </View>
              ) : (
                <Text style={{ color: "#ffffff60", flex: 1 }}>{t("rank")}</Text>
              )}
              <Ionicons name="chevron-down" size={18} color="#fff" />
            </TouchableOpacity>

            {/* Sicurezza */}
            <TouchableOpacity onPress={() => setPasswordModal(true)}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 15 }}>{t("security")}</Text>
                <Text style={{ color: "#ffffff80", fontSize: 13 }}>{t("password_set_and_pin")}</Text>
              </View>
              {!isOnline
                ? <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
                : <Ionicons name="chevron-forward"    size={18} color="#fff" />
              }
            </TouchableOpacity>
          </View>

          {/* Salva */}
          <TouchableOpacity onPress={handleSave} disabled={saving}
            style={{ backgroundColor: "#789fd6", borderRadius: 10, padding: 16,
              alignItems: "center", marginBottom: 32 }}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {!isOnline && <Ionicons name="cloud-offline-outline" size={18} color="#fff" />}
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                    {isOnline ? t("save") : t("save_offline_button")}
                  </Text>
                </View>
            }
          </TouchableOpacity>

        </ScrollView>
      </View>

      {/* Rank Modal */}
      <Modal visible={rankOpen} transparent animationType="slide" onRequestClose={() => setRankOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={() => setRankOpen(false)}>
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52",
            borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "60%" }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 16 }}>{t("rank")}</Text>
            {ranks.length === 0
              ? <Text style={{ color: "#ffffff60", textAlign: "center" }}>{t("no_ranks_available")}</Text>
              : <ScrollView>
                  {ranks.map((r) => (
                    <TouchableOpacity key={r.id} onPress={() => { setSelectedRank(r); setRankOpen(false); }}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12,
                        borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
                      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginRight: 12,
                        borderColor: selectedRank?.id === r.id ? "#789fd6" : "#ffffff50",
                        backgroundColor: selectedRank?.id === r.id ? "#789fd6" : "transparent" }} />
                      <Image source={{ uri: r.distintivo_controspallina }}
                        style={{ width: 24, height: 40, marginRight: 12 }} contentFit="contain" />
                      <Text style={{ color: "#fff", fontSize: 15 }}>{r.grado}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
            }
          </View>
        </Pressable>
      </Modal>

      <PasswordModal
        visible={passwordModal}
        onClose={() => setPasswordModal(false)}
        userId={String(user?.id)}
        isOnline={isOnline}
      />
    </SafeAreaView>
  );
}