import React, { useState } from "react";
import { View} from "react-native";

import LoginPin from "@/components/molecules/LoginPin";
import LoginCredentials from "@/components/molecules/LoginCredentials";

export default function Login() {
  const [loginWithPIN, setLoginWithPIN] = useState(false);

  return (
    <View className="flex-1 justify-center items-center bg-primary ">
      <View className="w-[80%] md:w-[40%] justify-center items-center">{loginWithPIN ? <LoginPin onExit={() => setLoginWithPIN(false)} /> : <LoginCredentials onExit={() => setLoginWithPIN(true)} />}</View>
    </View>
  );
}
