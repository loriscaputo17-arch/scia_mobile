import React from "react";
import { View, Text } from "react-native";

type DividerWithTextProps = {
  text: string;
};

export default function DividerWithText({ text }: DividerWithTextProps) {
  return (
    <View className="flex-row items-center my-space xxl:my-space-xxl">
      <View className="flex-1 h-[3px] bg-white/30" />
      <Text className="mx-3 text-secondary font-semibold text-sm">{text}</Text>
      <View className="flex-1 h-[3px] bg-white/30" />
    </View>
  );
}
