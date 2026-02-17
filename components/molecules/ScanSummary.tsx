import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type System } from "@/data/systems";
import { type Replacement } from "@/data/replacements";
import { isSystem } from "@/app/utils/utils";

type ScanSummary = {
  onShowScansHistory: () => void;
  item: System | Replacement | null;
};


export default function ScanSummary({ item, onShowScansHistory }: ScanSummary) {
  if (item)
    return (
      <TouchableOpacity className="flex-1 flex-col bg-secondary ml-space xxl:ml-space-xxl p-4 rounded-md" onPress={onShowScansHistory}>
        <Text className="text-secondary">Ultima scansione</Text>
        <Text className="text-primary text-lg">Motore centrale</Text>
        <View className="flex flex-row items-center ">
          <MaterialCommunityIcons name="engine" color={"#9ca3af"} size={16} />
          <Text className="text-secondary mx-2" numberOfLines={1}>
            {isSystem(item) ? 
                `${item.fullName} - S/N ${item.serialNumber} - Ore moto: ${item.motionHours}` 
                : 
                `${item.name} - P/N ${item.partNumber} - ${item.magazine} (${item.location})`}
          </Text>
        </View>
      </TouchableOpacity>
    );
}
