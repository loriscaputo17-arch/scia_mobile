import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

type LoadingScreenProps = {
  message?: string;
  styleWind?: string; // Tailwind class string opzionale per la <View>
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Caricamento in corso...",
  styleWind,
}) => {
  return (
    <View className={`flex-1 justify-center items-center bg-primary ${styleWind}`}>
      <ActivityIndicator size="large" />
      <Text className="text-primary mt-2 text-base text-center">{message}</Text>
    </View>
  );
};

export default LoadingScreen;
