import { useEffect } from "react";
import { Stack, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppLayout() {
  useEffect(() => {
    const check = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) router.replace("/(auth)/login");
    };
    check();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}