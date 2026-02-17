import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type QuantitySelectorProps = {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
};

export default function QuantitySelector({ value, onChange, min = 0, max = Infinity }: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View className="flex-row items-center bg-primary rounded-md overflow-hidden" style={{ width: 140, height: 40 }}>
      <TouchableOpacity disabled={value === min} onPress={handleDecrement} className="flex-1 items-center justify-center">
        <Text className="text-white text-2xl">−</Text>
      </TouchableOpacity>

      <View className="w-1/3 h-full bg-quaternary items-center justify-center">
        <Text className="text-white text-base font-bold">{value}</Text>
      </View>

      <TouchableOpacity disabled={value === max} onPress={handleIncrement} className="flex-1 items-center justify-center">
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
