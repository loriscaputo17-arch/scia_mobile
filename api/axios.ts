// api/axios.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { router } from "expo-router";

const API_URL = "https://scia-back.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Inserisce dinamicamente il token JWT se presente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestione automatica token scaduto
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      
      Alert.alert("Sessione scaduta", "Effettua nuovamente il login.");

      await AsyncStorage.removeItem("authToken");

      router.replace("/(auth)/login");
    }

    return Promise.reject(error);
  }
);

export default api;
