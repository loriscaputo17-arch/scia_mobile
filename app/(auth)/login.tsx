import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";
import { login } from "@/api/auth";
import { getProfile } from "@/api/profile";
import { AppDispatch } from "@/store/store";
import { AxiosError } from "axios";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { useDevice } from "@/hooks/useDevice";

type JwtPayload = { exp?: number };

const PROFILE_CACHE_KEY = "cached_user_profile";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [isReady,  setIsReady]  = useState(false);
  const { isTablet } = useDevice();

  // ── All'avvio: token valido → entra subito (online o offline) ───────────
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;

        const decoded = jwtDecode<JwtPayload>(token);
        const now = Date.now() / 1000;
        if (!decoded.exp || decoded.exp <= now) {
          await AsyncStorage.removeItem("authToken");
          return;
        }

        // Token valido — controlla rete
        const net = await NetInfo.fetch();
        const online = !!(net.isConnected && net.isInternetReachable);

        if (online) {
          // Aggiorna profilo fresco e salva in cache
          try {
            const profileRes = await getProfile();
            if (profileRes?.data) {
              dispatch(setUser(profileRes.data));
              await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileRes.data));
            }
          } catch {
            // getProfile fallita: usa cache
            const ok = await restoreProfileFromCache();
            if (!ok) return;
          }
        } else {
          // Offline: usa profilo cacheato
          const ok = await restoreProfileFromCache();
          if (!ok) {
            setError("Offline — effettua il login almeno una volta con connessione");
            return;
          }
        }

        router.replace("/(app)/dashboard");
      } catch {
        await AsyncStorage.removeItem("authToken");
      } finally {
        setIsReady(true);
      }
    };

    checkToken();
  }, []);

  const restoreProfileFromCache = async (): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (raw) { dispatch(setUser(JSON.parse(raw))); return true; }
    } catch {}
    return false;
  };

  // ── Tasto Accedi ──────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    // Offline: non possiamo autenticare credenziali nuove
    if (!online) {
      const token = await AsyncStorage.getItem("authToken").catch(() => null);
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded.exp && decoded.exp > Date.now() / 1000) {
            const ok = await restoreProfileFromCache();
            if (ok) { router.replace("/(app)/dashboard"); setLoading(false); return; }
          }
        } catch {}
      }
      setError("Offline — connettiti per accedere");
      Alert.alert(
        "Offline",
        "Non è possibile autenticarsi senza connessione.\nSe hai già effettuato il login in precedenza, l'app si apre automaticamente.",
      );
      setLoading(false);
      return;
    }

    // Online: login normale
    // Online: STEP 1 — credenziali → lista navi → vai a select-ship
try {
  const response = await login(email, password);
  const ships = response?.data?.ships;
  if (!ships || ships.length === 0) {
    throw new Error("Nessuna nave disponibile per questo utente");
  }
  router.push("/(auth)/select-ship");   // ← non più dashboard
} catch (err: unknown) {
  const e = err as AxiosError<{ error?: string; message?: string }>;
  const message = e.response?.data?.error || e.response?.data?.message || e.message || "Errore login";
  setError(message);
  Alert.alert("Errore", message);
} finally {
  setLoading(false);
}
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: isTablet ? 40 : 24,
          }}
          keyboardShouldPersistTaps="handled">
          <View
            style={{
              width: "100%",
              maxWidth: isTablet ? 520 : 480,
              alignSelf: "center",
              backgroundColor: isTablet ? "#022a52" : "transparent",
              borderRadius: isTablet ? 16 : 0,
              padding: isTablet ? 32 : 0,
            }}
          >

            <Text
              style={{
                fontSize: isTablet ? 30 : 26,
                fontWeight: "600",
                color: "#fff",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Login
            </Text>

            {!!error && (
              <View style={{ backgroundColor: "#D0021B22", borderRadius: 8, padding: 10,
                marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
                <Text style={{ color: "#ef4444", flex: 1 }}>{error}</Text>
              </View>
            )}

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "#789fd6", marginBottom: 8 }}>Email</Text>
              <TextInput
                value={email} onChangeText={setEmail}
                placeholder="Email" placeholderTextColor="#6b7280"
                keyboardType="email-address" autoCapitalize="none"
                style={{ paddingHorizontal: 16, paddingVertical: isTablet ? 16 : 14, backgroundColor: "#1E2A3D",
                  color: "#fff", borderRadius: 8, fontSize: 16 }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "#789fd6", marginBottom: 8 }}>Password</Text>
              <TextInput
                value={password} onChangeText={setPassword}
                placeholder="Password" placeholderTextColor="#6b7280"
                secureTextEntry
                style={{ paddingHorizontal: 16, paddingVertical: isTablet ? 16 : 14, backgroundColor: "#1E2A3D",
                  color: "#fff", borderRadius: 8, fontSize: 16 }}
              />
            </View>

            <TouchableOpacity
              style={{ alignItems: "center", paddingVertical: 12 }}
              onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
                Hai dimenticato la password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={loading}
              style={{ backgroundColor: "#789fd6", paddingVertical: isTablet ? 18 : 16, borderRadius: 8,
                alignItems: "center", marginTop: 8 }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Accedi</Text>
              }
            </TouchableOpacity>

            <View style={{ flexDirection: "row", marginTop: 28 }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TouchableOpacity onPress={() => router.push("/(auth)/login-pin")}>
                  <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
                    Accedi con Pin Rapido
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}