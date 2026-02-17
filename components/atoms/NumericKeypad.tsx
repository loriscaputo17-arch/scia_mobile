import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { FontAwesome6 } from "@expo/vector-icons";

type NumericKeypadProps = {
  keys: string[];
  disabledKeys?: string[];
  styleWindContainer?: string;
  onKeyPress: (key: string) => void;
};

export default function NumericKeypad({ keys, disabledKeys, styleWindContainer, onKeyPress }: NumericKeypadProps) {
  return (
    <View className={`flex-row flex-wrap justify-center w-full ${styleWindContainer} `}>
      {keys.map((item, index) => (
        <TouchableOpacity
          key={index}
          className="w-1/4 p-4 m-1 bg-primaryLighter rounded items-center justify-center"
          onPress={() => onKeyPress(item)}
          disabled={disabledKeys?.includes(item)} //
        >
          {item === "CANC" ? <FontAwesome6 name={"delete-left"} color={"white"} size={28} /> : <Text className="text-2xl font-bold text-white">{item}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}
