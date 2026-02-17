

import React from "react";
import { View} from "react-native";

type SectionHeaderProps = {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  styleWindContainer?: string;
  styleWindLeft?: string;
  styleWindRight?: string;
};

export default function SectionHeader({ leftContent, rightContent, styleWindContainer, styleWindLeft, styleWindRight }: SectionHeaderProps) {
  return (
      <View className={`flex-row justify-between md:items-center mb-space xxl:mb-space-xxl  ${styleWindContainer}`}> 
        <View className={`flex-row ${styleWindLeft}`}>{leftContent}</View>
        <View className={`flex-row ${styleWindRight}`}  >{rightContent}</View>
      </View>
  );
}
