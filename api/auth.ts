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
  console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
  console.log("Calling loginPin with pin:", pin);
  try {
    const res = await api.post("/auth/login-pin", { pin });
    console.log("Response:", res.data);
    const token = res.data.token;
    if (token) await AsyncStorage.setItem("authToken", token);
    return res;
  } catch (err: any) {
    console.log("Error:", err.message, err.response?.status, err.response?.data);
    throw err;
  }
};

