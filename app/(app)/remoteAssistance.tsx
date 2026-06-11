import { View, Text, TouchableOpacity, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { useTranslation } from "@/app/i18n";

const loginCareAr = async (payload: { email: string; password: string }) => {
  const res = await api.post("/assistance/loginCareAr", payload);
  return res.data;
};

export default function RemoteAssistancePage() {

  const { t } = useTranslation("remote_assistance");

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
      <View
        style={{
          flex: 1,
          padding: isTablet ? 24 : 16,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 900 : "100%",
        }}
      >
        <DashboardHeader />

        <View
          style={{
            flex: 1,
            backgroundColor: "#022a52",
            borderRadius: 12,
            padding: isTablet ? 40 : 24,
            marginTop: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="headset-outline"
            size={isTablet ? 120 : 100}
            color="#789fd6"
          />

          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontSize: isTablet ? 17 : 15,
              marginVertical: 24,
              maxWidth: isTablet ? 420 : 280,
              lineHeight: 22,
            }}
          >
            {t("remote_assistance_title")}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              width: isTablet ? 420 : "100%",
            }}
          >
            <TouchableOpacity
              onPress={handleStartDevice}
              style={{
                flex: 1,
                backgroundColor: "#ffffff10",
                borderRadius: 8,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                {t("remote_assistance_button1")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartViewer}
              style={{
                flex: 1,
                backgroundColor: "#789fd6",
                borderRadius: 8,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                {t("remote_assistance_button2")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}