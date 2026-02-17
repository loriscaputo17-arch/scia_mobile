// src/components/atoms/SectionContainer.tsx

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type SectionContainerProps = {
  children: React.ReactNode;
  styleWind?: string;
  title?: string;
};


export default function SectionContainer({ title, children, styleWind }: SectionContainerProps) {
  return (
    <View className={`flex-1 bg-primary p-space xxl:p-space-xxl ${styleWind}`}>
      {title && <Text className="text-primary text-xl font-bold mb-space xxl:mb-space-xxl">{title}</Text>}
      {children}
    </View>
  )
}
