import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";

const loginCareAr = async (payload: { email: string; password: string }) => {
  const res = await api.post("/assistance/loginCareAr", payload);
  return res.data;
};

export default function RemoteAssistancePage() {
  const handleStartDevice = async () => {
    try {
      await loginCareAr({ email: "tuo@email.it", password: "tuapassword" });
      Alert.alert("Connesso", "Sessione dispositivo avviata");
    } catch {
      Alert.alert("Errore", "Impossibile avviare la sessione");
    }
  };

  const handleStartViewer = () => {
    Alert.alert("Info", "Funzione viewer in arrivo");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 16, marginBottom: 16 }}>
          Assistenza remota
        </Text>

        <View style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, padding: 24, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="headset-outline" size={100} color="#789fd6" />

          <Text style={{ color: "#fff", textAlign: "center", fontSize: 15, marginVertical: 24, maxWidth: 280, lineHeight: 22 }}>
            Avvia una sessione di assistenza remota con il supporto tecnico
          </Text>

          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <TouchableOpacity
              onPress={handleStartDevice}
              style={{ flex: 1, backgroundColor: "#ffffff10", borderRadius: 8, padding: 16, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Avvia dispositivo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartViewer}
              style={{ flex: 1, backgroundColor: "#789fd6", borderRadius: 8, padding: 16, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Avvia viewer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}