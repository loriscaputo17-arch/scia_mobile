// api/auth.ts
import api from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// STEP 1: email+password → ritorna { ships: [...] } (NIENTE token qui)
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  // salva la lista navi per la schermata select-ship
  if (res.data?.ships) {
    await AsyncStorage.setItem("ships", JSON.stringify(res.data.ships));
  }
  return res;
};

// STEP 2: pin + shipId → ritorna { token }
export const loginPin = async (pin: string, shipId: number) => {
  const res = await api.post("/auth/login-pin", { pin, shipId });
  const token = res.data?.token;
  if (token) await AsyncStorage.setItem("authToken", token);
  return res;
};

export const logout = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("ships");
  await AsyncStorage.removeItem("selectedShipId");
};