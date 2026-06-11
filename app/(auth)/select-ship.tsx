import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "@/api/auth";
import { useDevice } from "@/hooks/useDevice";

type Ship = { shipId: number; shipName: string; modules?: Record<string, { write?: boolean }> };

export default function SelectShipPage() {
  const { isTablet } = useDevice();
  const [ships, setShips] = useState<Ship[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("ships");
        if (!raw) { router.replace("/(auth)/login"); return; }
        setShips(JSON.parse(raw));
      } catch {
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (ship: Ship) => {
    setSelected(ship.shipId);
    // porta al PIN passando lo shipId come param
    router.push({ pathname: "/(auth)/login-pin", params: { shipId: String(ship.shipId) } });
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#789fd6" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: isTablet ? 40 : 24 }}>
        <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "600", color: "#fff", textAlign: "center", marginBottom: 4 }}>
            Seleziona unità navale
          </Text>
          <Text style={{ color: "#789fd6", textAlign: "center", fontSize: 14, marginBottom: 28 }}>
            Scegli la nave a cui vuoi accedere
          </Text>

          <View style={{ gap: 12 }}>
            {ships.map((ship) => {
              const isSel = selected === ship.shipId;
              return (
                <TouchableOpacity
                  key={ship.shipId}
                  onPress={() => handleSelect(ship)}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 16, borderRadius: 8, borderWidth: 1,
                    backgroundColor: isSel ? "#789fd6" : "#1E2A3D",
                    borderColor: isSel ? "#789fd6" : "transparent",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View>
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>{ship.shipName}</Text>
                      <Text style={{ color: "#ffffff99", fontSize: 12, marginTop: 4, fontFamily: "monospace" }}>
                        ID {String(ship.shipId).padStart(4, "0")}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isSel ? "#fff" : "#ffffff66"} />
                  </View>

                  {ship.modules && Object.keys(ship.modules).length > 0 && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
                      {Object.entries(ship.modules).map(([mod, perm]) => (
                        <Text key={mod} style={{
                          fontSize: 10, fontFamily: "monospace", paddingHorizontal: 8, paddingVertical: 2,
                          borderRadius: 4, textTransform: "uppercase",
                          color: isSel ? "#fff" : perm?.write ? "#789fd6" : "#ffffff66",
                          backgroundColor: isSel ? "#ffffff33" : perm?.write ? "#789fd633" : "#ffffff11",
                        }}>
                          {mod}
                        </Text>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={handleLogout} style={{ marginTop: 24, alignItems: "center" }}>
            <Text style={{ color: "#ffffff80", fontSize: 14 }}>← Esci / Cambia account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}