import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { ActivityType } from '@/data/activityLists';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ActivityListHeaderProps = {
    activityType: ActivityType;
    listName: string;
    selectedCount: number;
    onPress?: () => void;
}

export default function ActivityListHeader({ activityType, listName, selectedCount, onPress } :  ActivityListHeaderProps) {
    if (activityType === "malfunction") {
      return <Text className="text-primary text-xl font-bold mb-space xxl:mb-space-xxl">{`${listName} (${selectedCount})`}</Text>;
    }
  
    return (
      <Pressable className="flex-row" onPress={onPress}>
        <Text className="text-primary text-xl underline font-bold mb-space xxl:mb-space-xxl">
          {`${listName} (${selectedCount})`}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" color="#fff" size={26} />
      </Pressable>
    );
  }
  