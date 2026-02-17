// api/auth.ts
import api from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });

  const token = res.data.token;
  if (token) {
    await AsyncStorage.setItem("authToken", token);
  }

  return res;
};

export const logout = async () => {
  await AsyncStorage.removeItem("authToken");
};

export const loginPin = async (pin: string) => {
  const res = await api.post("/auth/login-pin", { pin });

  const token = res.data.token;
  if (token) {
    await AsyncStorage.setItem("authToken", token);
  }

  return res;
};

