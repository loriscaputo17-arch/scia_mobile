// src/components/atoms/SectionContainer.tsx

import React from "react";
import { ScrollView, View } from "react-native";

type SectionLayout = {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  containerClassName?: string;
};

export default function SectionLayout({
  leftContent,
  rightContent,
  children,
  containerClassName = "",
}: SectionLayout) {
  const hasSides = leftContent || rightContent;

  return (
    <ScrollView>
      <View className={`flex-1 w-full ${hasSides ? "flex-col md:flex-row" : ""} ${containerClassName}`}>
        {hasSides ? (
          <>
            <View className="p-4 xxl:p-8 bg-secondary rounded-md flex-1 md:flex-[2]">
              {leftContent}
            </View>
            <View className="p-4 xxl:p-8 bg-secondary rounded-md mt-space md:mt-0 md:ml-space xxl:ml-space-xxl flex-1 md:flex-[1]">
              {rightContent}
            </View>
          </>
        ) : (
          <View className="p-4 xxl:p-8 bg-secondary rounded-md flex-1">
            {children}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
