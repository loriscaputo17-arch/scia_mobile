import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    dispatch({ type: "RESET_ALL" });
    router.replace("/(auth)/login");
  };

  return { logout };
};