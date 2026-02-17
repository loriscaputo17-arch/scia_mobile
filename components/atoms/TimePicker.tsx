import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type TimePickerProps = {
  value: number | undefined;
  onPress: () => void;
};

const TimePicker = ({ value, onPress }: TimePickerProps) => {
  return (
    <View className="flex-1">
      <Text className="text-tertiary mb-2">Tempo impiegato</Text>
      <TouchableOpacity onPress={onPress} className="bg-quaternary font-semibold p-3 rounded-md h-12">
        <Text className={`${value ? "text-primary" : "text-secondary"} font-medium`}>
          {value || "Digita qui..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TimePicker;
