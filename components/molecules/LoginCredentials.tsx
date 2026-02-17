// components/molecules/LoginCredentials.tsx
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { router } from "expo-router";
import TextInputField from "../atoms/TextInputField";
import Button from "../atoms/Button";
import { validateEmail } from "@/utils/validationUtils";
import { login } from "@/api/auth";
import { AxiosError } from "axios";

type LoginCredentialsProps = {
  onExit: () => void;
};

export default function LoginCredentials({ onExit }: LoginCredentialsProps) {
  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("123");

  const handleLogin = async () => {
    try {
      const response = await login(email, password);

      if (response.status === 200) router.replace("/(app)/dashboard");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;

      if (err.response?.status === 401) {
        Alert.alert("Credenziali non valide", "Controlla email e password.");
      } else {
        Alert.alert("Errore di login", err.response?.data?.message || err.message || "Errore generico");
      }
    }
  };

  return (
    <View className="w-full items-center">
      <Text className="text-primary text-4xl p-space xxl:p-space-xxl">Login</Text>
      <TextInputField styleContainer="w-full" label="Email" value={email} onChangeText={setEmail} validateInput={validateEmail} />
      <TextInputField styleContainer="w-full" label="Password" value={password} onChangeText={setPassword} /* secureTextEntry  */ />

      <Text className="text-primary font-extrabold underline p-space mb-space">Hai dimenticato la Password?</Text>
      {/*  <Link className="text-primary font-extrabold underline p-space" href="/(app)/dashboard">
          Hai dimenticato la Password?
        </Link> */}

      <Button theme="modal" styleWindContainer="w-[200] m-space w-full" label="Accedi" onPress={handleLogin} />
      {/* <Button theme="modal" styleWindContainer="w-[200] m-space w-full" label="Accedi senza LOGIN" onPress={() => router.replace("/(app)/dashboard")} /> */}
      <Button theme="noBackground" styleWindtext="underline my-space" label="Accedi con il PIN" onPress={onExit} />
    </View>
  );
}
