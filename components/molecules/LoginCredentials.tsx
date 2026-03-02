import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "@/app/i18n";
import { login } from "@/api/auth";
import { AxiosError } from "axios";

type JwtPayload = { exp?: number };

export default function LoginPage() {
  const { t, i18n } = useTranslation("maintenance");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          try {
            const decoded = jwtDecode<JwtPayload>(token);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp > now) {
              router.replace("/(app)/dashboard");
              return;
            }
          } catch {
            await AsyncStorage.removeItem("authToken");
          }
        }
      } finally {
        setIsReady(true);
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await AsyncStorage.setItem("auth_in_progress", "true");
      const response = await login(email, password);
      const token = response?.data?.token;
      if (!token) throw new Error("Errore login");

      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const now = Date.now() / 1000;
        if (!decoded.exp || decoded.exp < now)
          throw new Error("Token scaduto.");
      } catch {
        await AsyncStorage.removeItem("authToken");
        throw new Error("Token non valido.");
      }

      await AsyncStorage.setItem("authToken", token);
      setSuccess("Login effettuato con successo! Reindirizzamento in corso...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.replace("/(app)/dashboard");
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      const message =
        e.response?.data?.message ||
        e.message ||
        "Errore di connessione al server";
      setError(message);
      Alert.alert("Errore di login", message);
    } finally {
      await AsyncStorage.removeItem("auth_in_progress");
      setLoading(false);
    }
  };

  if (!i18n.isInitialized || !isReady) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>

            {/* Titolo */}
            <Text style={{ fontSize: 26, fontWeight: "600", color: "#fff", textAlign: "center", marginBottom: 32 }}>
              {t("login")}
            </Text>

            {/* Errore / Successo */}
            {!!error && (
              <Text style={{ color: "#ef4444", textAlign: "center", marginBottom: 12 }}>{error}</Text>
            )}
            {!!success && (
              <Text style={{ color: "#22c55e", textAlign: "center", marginBottom: 12 }}>{success}</Text>
            )}

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "#789fd6", marginBottom: 8, fontSize: 14 }}>{t("email")}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: "#1E2A3D",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: "#789fd6", marginBottom: 8, fontSize: 14 }}>{t("password")}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: "#1E2A3D",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={{ alignItems: "center", paddingVertical: 12, marginBottom: 8 }}
              onPress={() => router.push("/reset-password")}
            >
              <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
                {t("forgot_password")}
              </Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "#4a6fa5" : "#789fd6",
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  {t("log_in")}
                </Text>
              )}
            </TouchableOpacity>

            {/* Links bottom */}
            <View style={{ flexDirection: "row", marginTop: 28 }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TouchableOpacity onPress={() => router.push("/login-pin")}>
                  <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
                    {t("rapid_pin")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TouchableOpacity onPress={() => router.push("/adminLogin")}>
                  <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
                    {t("admin_access")}
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