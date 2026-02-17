import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Button from "@/components/atoms/Button";
import { AxiosError } from "axios";
import { loginPin } from "@/api/auth";
import { router } from "expo-router";
import NumericKeypad from "../atoms/NumericKeypad";

type LoginPinProps = {
  pinDigits?: number;
  onExit: () => void;
};

const LoginPin = ({ pinDigits = 4, onExit }: LoginPinProps) => {
  const [pin, setPin] = useState("");

  const handleKeyPress = (value: string) => {
    if (value === "CANC") {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < pinDigits && /^\d$/.test(value)) {
      const newPin = pin + value;
      setPin(newPin);

      if (newPin.length === pinDigits) {
        handleLoginPin(newPin);
      }
    }
  };

  const handleLoginPin = async (pin: string) => {
    try {
      const response = await loginPin(pin);

      if (response.status === 200) router.replace("/(app)/dashboard");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;

      setPin("");

      if (err.response?.status === 401) {
        Alert.alert("Il PIN inserito non e' corretto", "Controlla e riprova.");
      } else {
        Alert.alert("Errore di login", err.response?.data?.message || err.message || "Errore generico");
      }
    }
  };

  return (
    <View className="w-full items-center">
      <Text className="text-primary text-4xl p-space xxl:p-space-xxl">Inserisci PIN</Text>

      <View className="flex-row space-x-4 mb-space p-space xxl:p-space-xxl">
        {Array.from({ length: pinDigits }).map((_, i) => (
          <View key={i} className={`w-4 h-4 rounded-full border border-white ${i < pin.length ? "bg-white" : "bg-transparent"}`} />
        ))}
      </View>

      <NumericKeypad keys={["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "CANC"]} onKeyPress={(key) => handleKeyPress(key)} styleWindContainer="mb-space xxl:mb-space-xxl" />

      <Button theme="noBackground" styleWindtext="underline my-space" label="Vai al login tradizionale" onPress={onExit} />
    </View>
  );
};

export default LoginPin;
