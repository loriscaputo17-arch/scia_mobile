import { View, Image, Modal, ImageSourcePropType } from "react-native";
import React from "react";
import Button from "./Button";
import { MaterialIcons } from "@expo/vector-icons";
import { getImageSource } from "@/app/utils/getImageSource";

type ImageViewerProps = {
  visible: boolean;
  onClose: () => void;
  imgSrc: string | ImageSourcePropType;
};

export default function ImageViewer({ visible, imgSrc, onClose }: ImageViewerProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false} // Permette al Modal di occupare tutto lo schermo
    >
      <View className="flex-1 bg-black justify-center items-center">
        <Button theme="noBackground" IconComponent={MaterialIcons} iconProps={{ name: "close", color: "white", size: 44 }} onPress={onClose} className="absolute top-4 right-4 z-10" />

        <View className="w-full h-full justify-center items-center">
          <Image
            source={getImageSource(imgSrc)}
            className="w-full h-full"
            resizeMode="contain" // Mantiene l'immagine completamente visibile senza ritagliarla
          />
        </View>
      </View>
    </Modal>
  );
}
