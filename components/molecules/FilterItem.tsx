import { View, Text } from "react-native";
import React from "react";
import IconComponent, { IconComponentProps } from "../atoms/IconComponent";

type FilterItemProps = {
  label: string;
  count?: number;
  children?: React.ReactNode;
} & Partial<IconComponentProps>; // Rende opzionale l'icona

export default function FilterItem({ label, count, children, iconCollection, iconProps }: FilterItemProps) {
  return (
    <View className="flex-row justify-between mb-space">
      <View className="flex-row items-center">
        {iconCollection && iconProps && <IconComponent iconCollection={iconCollection} iconProps={iconProps} />}
        <Text className={`text-primary font-bold ${iconCollection ? 'ml-2': ''}`}> {label}{count !== undefined ? ` (${count})` : ''}</Text>
      </View>
      {children}
    </View>
  );
}
