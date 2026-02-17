import { Maintenance } from "@/data/maintenences";
import { Task } from "@/data/tasks";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type DashboardCardProps = {
  onPress?: () => Promise<void> | void;
  IconComponent: React.ComponentType<any>; // Il tipo del componente dell'icona
  title: string;
  listTitle: string;
  list: string[];
  counter: number;
  iconProps: {
    name: string;
    size?: number;
    color?: string;
  };
};

export default function DashboardCard({ onPress, title, listTitle, list, counter, IconComponent, iconProps }: DashboardCardProps) {
  const maxLines = 3;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col bg-secondary rounded-md flex-shrink-0 flex-grow
            p-space xxl:p-space-xxl mr-space xxl:mr-space-xxl mb-space xxl:mb-space-xxl min-h-[280px] min-w-[280px]
            md:w-1/3 lg:w-1/4 xxl:w-1/5"
    >
      <View className="flex flex-row justify-between mb-space xxl:mb-space-xxl">
        <IconComponent size={80} color="#789fd6" {...iconProps} className="mb-space xxl:mb-spa" />
        {counter > 0 && (
          <View className="bg-red-500 rounded-full h-8 w-8 items-center justify-center">
            <Text className="text-primary text-lg font-bold">{counter}</Text>
          </View>
        )}
      </View>
      <View className="flex-col flex-1">
        <Text className="text-tertiary mb-space xxl:mb-space-xxl">{listTitle}</Text>
        {list?.map((item, index) => {
          if (index < maxLines + 1) {
            if (index >= maxLines)
              return (
                <Text className="text-secondary" key={index}>
                  {`+ altre ${list.length + 1 - maxLines}..`}
                </Text>
              );
            else if (index < maxLines - 1 || index === list.length - 1)
              return (
                <Text className="text-secondary" key={index}>
                  {item}
                </Text>
              );
          }
        })}
      </View>

      <Text className="text-primary text-2xl font-bold">{title}</Text>
    </TouchableOpacity>
  );
}
