import { View, Text } from "react-native";
import React from "react";

type FieldProps = {
  label?: string;
  value?: string;
  containerStyle?: string;
  child?: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
};

export default function Field({
  label,
  value,
  containerStyle,
  child,
  labelClassName = "text-tertiary",
  valueClassName = "text-primary font-bold",
}: FieldProps) {
  return (
    <View className={`flex mb-space xxl:mb-space-xxl ${containerStyle}`}>
      {label && <Text className={`${labelClassName} ${value || child ? 'mb-2' : ''}`}>{label}</Text>}
      {value && (
        <Text className={`${valueClassName} ${child ? 'mb-2' : ''}`} numberOfLines={2}>
          {value}
        </Text>
      )}
      {child}
    </View>
  );
}
