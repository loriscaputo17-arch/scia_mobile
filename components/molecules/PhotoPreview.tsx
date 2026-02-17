import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import React from "react";
import { getImageSource } from "@/app/utils/getImageSource";
import { FontAwesome5 } from "@expo/vector-icons";
import IconComponent, { type IconCollection } from "../atoms/IconComponent";

type PhotoUriProps = {
  photoUri: ImageSourcePropType | string | null;
  styleWindContainer?: string;
  styleWindImage?: string;
  iconCollectionPlaceholder?: IconCollection;
  iconCollectionPlaceholderProps?: {
    name: string;
    size?: number;
    color?: string;
  };
  onPress: () => void;
};

export default function PhotoPreview({
  photoUri,
  styleWindContainer,
  styleWindImage,
  iconCollectionPlaceholder = "FontAwesome5",
  iconCollectionPlaceholderProps = { color: "white", name: "user-alt", size: 42 },
  onPress,
}: PhotoUriProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`rounded-full w-20 h-20 bg-primary my-space xxl:my-space-xxl flex justify-center items-center ${styleWindContainer}`} 
      disabled={!photoUri}>
      {photoUri ? (
        <Image source={getImageSource(photoUri)} className={`w-20 h-20 rounded-full ${styleWindImage}`} />
      ) : (
        <IconComponent iconCollection={iconCollectionPlaceholder} iconProps={iconCollectionPlaceholderProps} />
      )}
    </TouchableOpacity>
  );
}
