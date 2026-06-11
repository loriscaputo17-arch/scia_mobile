import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";
import { getProfile } from "../api/profile";
import { AppDispatch } from "@/store/store";
import { AxiosError } from "axios";

type JwtPayload = { exp?: number };

export default function IndexRedirect() {
  const dispatch = useDispatch<AppDispatch>();
  const [checking, setChecking] = useState(true);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    const checkSession = async () => {
      // ⚠️ SOLO PER SVILUPPO — rimuovi prima del build finale
      await AsyncStorage.clear();

      try {
        const token = await AsyncStorage.getItem("authToken");

        if (!token) {
          router.replace("/(auth)/login");
          return;
        }

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const now = Date.now() / 1000;

          if (!decoded.exp || decoded.exp < now) {
            await AsyncStorage.removeItem("authToken");
            router.replace("/(auth)/login");
            return;
          }
        } catch {
          await AsyncStorage.removeItem("authToken");
          router.replace("/(auth)/login");
          return;
        }

        const res = await getProfile();

        if (res.status === 200) {
          dispatch(setUser(res.data));
          router.replace("/(app)/dashboard");
        } else {
          router.replace("/(auth)/login");
        }
      } catch (err) {
        const error = err as AxiosError;

        if (!error.response) {
          console.error("Errore di rete:", error.message);
        }

        router.replace("/(auth)/login");
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  if (!checking) return null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.box,
          isTablet && styles.boxTablet
        ]}
      >
        <ActivityIndicator
          size={isTablet ? "large" : "small"}
          color="#789fd6"
        />

        <Text
          style={[
            styles.text,
            isTablet && styles.textTablet
          ]}
        >
          Controllo accesso in corso...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001c38",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    alignItems: "center",
    padding: 20,
  },

  boxTablet: {
    padding: 40,
  },

  text: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },

  textTablet: {
    fontSize: 22,
  },
});