import { useEffect } from "react";
import { router } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";
import { AxiosError } from "axios";
import { getProfile } from "../api/profile";

export default function IndexRedirect() {
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        
        const res = await getProfile();

        if (res.status === 200) {
          router.replace("/(app)/dashboard");
        } else {
          // qualunque altro status → considera come non autenticato
          router.replace("/(auth)/login");
        }
      } catch (err) {
        const error = err as AxiosError;

        // ✅ solo in caso di errore di rete o server
        if (!error.response) {
          console.error("Errore di rete o server non raggiungibile:", error.message);
        }

        // per tutto il resto: redirect silenzioso
        router.replace("/(auth)/login");
      }
    };

    checkSession();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" />
      <Text className="text-base mt-4">Controllo accesso in corso...</Text>
    </View>
  );
}
