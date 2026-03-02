import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";
import { loginPin } from "@/api/auth";
import { getProfile } from "@/api/profile";
import { AppDispatch } from "@/store/store";
import { AxiosError } from "axios";

const PIN_LENGTH = 4;
const KEYS = ["1","2","3","4","5","6","7","8","9","","0","DEL"];

export default function PinLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("authToken").then((token) => {
      if (token) router.replace("/(app)/dashboard");
    });
  }, []);

  const handleKey = (value: string) => {
    if (loading) return;
    if (value === "DEL") { setPin((p) => p.slice(0, -1)); return; }
    if (value === "") return;
    if (pin.length >= PIN_LENGTH) return;
    const newPin = pin + value;
    setPin(newPin);
    if (newPin.length === PIN_LENGTH) handleLogin(newPin);
  };

  const handleLogin = async (enteredPin: string) => {
    setLoading(true);
    setError(false);
    try {
      const response = await loginPin(enteredPin);
      if (response.status === 200) {
        const token = response?.data?.token;
        if (token) await AsyncStorage.setItem("authToken", token);

        const profileRes = await getProfile();
        if (profileRes?.data) {
          dispatch(setUser(profileRes.data));
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>

        <Text style={{ fontSize: 24, fontWeight: "600", color: "#fff", marginBottom: 8 }}>
          Inserisci PIN
        </Text>

        {error && (
          <Text style={{ color: "#ef4444", marginBottom: 8 }}>
            PIN non corretto, riprova.
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 16, marginVertical: 32 }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={{
              width: 16, height: 16, borderRadius: 8,
              backgroundColor: i < pin.length ? "#fff" : "transparent",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.5)",
            }} />
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#789fd6" size="large" style={{ marginVertical: 40 }} />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", width: 280, gap: 12, justifyContent: "center" }}>
            {KEYS.map((key, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleKey(key)}
                disabled={key === ""}
                style={{
                  width: 80, height: 56,
                  backgroundColor: key === "" ? "transparent" : "#022a52",
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: key === "" ? 0 : 1,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
                  {key === "DEL" ? "⌫" : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={{ marginTop: 32 }}
          onPress={() => router.replace("/(auth)/login")}
          disabled={loading}
        >
          <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
            Vai al login tradizionale
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}