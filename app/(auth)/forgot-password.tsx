import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message || "Email di recupero inviata!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>

            {/* Titolo */}
            <Text style={{ fontSize: 24, fontWeight: "600", color: "#fff", textAlign: "center", marginBottom: 32 }}>
              Recupera password
            </Text>

            {!!message && (
              <Text style={{ color: "#22c55e", textAlign: "center", marginBottom: 12 }}>{message}</Text>
            )}
            {!!error && (
              <Text style={{ color: "#ef4444", textAlign: "center", marginBottom: 12 }}>{error}</Text>
            )}

            {/* Email */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: "#789fd6", marginBottom: 8, fontSize: 14 }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  paddingHorizontal: 16, paddingVertical: 14,
                  backgroundColor: "#1E2A3D", color: "#fff",
                  borderRadius: 8, fontSize: 16,
                }}
              />
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: "#789fd6", paddingVertical: 16,
                borderRadius: 8, alignItems: "center",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Invia email di recupero</Text>
              }
            </TouchableOpacity>

            {/* Torna al login */}
            <TouchableOpacity style={{ alignItems: "center", marginTop: 24 }} onPress={() => router.back()}>
              <Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>
                Torna al login
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}