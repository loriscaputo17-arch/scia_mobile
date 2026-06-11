import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";
import { loginPin } from "@/api/auth";
import { getProfile } from "@/api/profile";
import { AppDispatch } from "@/store/store";
import { AxiosError } from "axios";
import NetInfo from "@react-native-community/netinfo";
import { useDevice } from "@/hooks/useDevice";
import { router, useLocalSearchParams } from "expo-router";

type JwtPayload = { exp?: number };

const PIN_LENGTH = 4;
const KEYS = ["1","2","3","4","5","6","7","8","9","","0","DEL"];
const PROFILE_CACHE_KEY = "cached_user_profile";

export default function PinLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [pin,      setPin]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isReady,  setIsReady]  = useState(false);
  const { isTablet } = useDevice();
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

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

        const net = await NetInfo.fetch();
        const online = !!(net.isConnected && net.isInternetReachable);

        if (online) {
          try {
            const profileRes = await getProfile();
            if (profileRes?.data) {
              dispatch(setUser(profileRes.data));
              await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileRes.data));
            }
          } catch {
            const ok = await restoreProfileFromCache();
            if (!ok) return;
          }
        } else {
          const ok = await restoreProfileFromCache();
          if (!ok) return;
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

  const handleKey = (value: string) => {
    if (loading) return;
    if (value === "DEL") { setPin((p) => p.slice(0, -1)); setError(false); return; }
    if (value === "") return;
    if (pin.length >= PIN_LENGTH) return;
    const newPin = pin + value;
    setPin(newPin);
    if (newPin.length === PIN_LENGTH) handleLogin(newPin);
  };

  useEffect(() => {
    if (!shipId) router.replace("/(auth)/select-ship");
  }, [shipId]);

  // ── Login con PIN ─────────────────────────────────────────────────────────
  const handleLogin = async (enteredPin: string) => {
    setLoading(true);
    setError(false);

    const net = await NetInfo.fetch();
    const online = !!(net.isConnected && net.isInternetReachable);

    // Offline: il PIN non può essere verificato dal server
    if (!online) {
      Alert.alert(
        "Offline",
        "Il PIN deve essere verificato dal server.\nConnettiti per accedere con PIN.",
        [{ text: "OK", onPress: () => { setPin(""); setLoading(false); } }],
      );
      return;
    }

    // Online: login PIN normale
    try {
      const response = await loginPin(enteredPin, Number(shipId));
        if (response.status === 200) {
          const token = response?.data?.token;
          if (token) await AsyncStorage.setItem("authToken", token);
          await AsyncStorage.setItem("selectedShipId", String(shipId));   // ← salva la nave

          const profileRes = await getProfile();
          if (profileRes?.data) {
            dispatch(setUser(profileRes.data));
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileRes.data));
          }
          router.replace("/(app)/dashboard");
        }
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setError(true);
      setPin("");
      if (e.response?.status === 401) {
        Alert.alert("PIN errato", "Controlla e riprova.");
      } else {
        Alert.alert("Errore", e.response?.data?.message || "Errore generico");
      }
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
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: isTablet ? 40 : 24,
        }}
      >

        {/* Banner offline */}
        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 8,
            width: "100%", maxWidth: 320 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", flex: 1 }}>
              Offline — PIN non verificabile senza connessione
            </Text>
          </View>
        )}

        <Text
          style={{
            fontSize: isTablet ? 28 : 24,
            fontWeight: "600",
            color: "#fff",
            marginBottom: 8,
          }}
        >
          Inserisci PIN
        </Text>

        {error && (
          <Text style={{ color: "#ef4444", marginBottom: 8 }}>
            PIN non corretto, riprova.
          </Text>
        )}

        {/* Pallini PIN */}
        <View style={{ flexDirection: "row", gap: 16, marginVertical: 32 }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={{
              width: isTablet ? 20 : 16,
              height: isTablet ? 20 : 16, borderRadius: 8,
              backgroundColor: i < pin.length ? "#fff" : "transparent",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.5)",
            }} />
          ))}
        </View>

        {/* Tastiera */}
        {loading ? (
          <ActivityIndicator color="#789fd6" size="large" style={{ marginVertical: 40 }} />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", width: isTablet ? 340 : 280,
            gap: 12, justifyContent: "center" }}>
            {KEYS.map((key, i) => (
              <TouchableOpacity key={i} onPress={() => handleKey(key)}
                disabled={key === "" || (!isOnline && key !== "DEL")}
                style={{
                  width: isTablet ? 100 : 80,
                  height: isTablet ? 70 : 56,
                  backgroundColor: key === "" ? "transparent" : "#022a52",
                  borderRadius: 10,
                  alignItems: "center", justifyContent: "center",
                  opacity: key === "" ? 0 : (!isOnline && key !== "DEL") ? 0.35 : 1,
                }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
                  {key === "DEL" ? "⌫" : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={{ marginTop: 32 }}
          onPress={() => router.replace("/(auth)/login")} disabled={loading}>
          <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
            Vai al login tradizionale
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}