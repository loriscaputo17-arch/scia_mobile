import React from "react";
import { View, Modal, Pressable, Text, ScrollView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Button from "../atoms/Button";

type ModalSize = "small" | "medium" | "full";

type SciaModalProps = {
  title: string;
  visible: boolean;
  onClose: () => void;
  onCllickButton?: () => void;
  buttonName?: string;
  children: React.ReactNode;
  mode?: "default" | "panel-right";
  sizeW?: ModalSize;
  sizeH?: ModalSize;
};

const widthMap: Record<ModalSize, string> = {
  small: "w-1/2",
  medium: "w-4/5",
  full: "w-full",
};

const heightMap: Record<ModalSize, string> = {
  small: "h-1/2",
  medium: "h-4/5",
  full: "h-full",
};

const SciaModal: React.FC<SciaModalProps> = ({ title, visible, onClose, children, buttonName, onCllickButton, sizeW = "medium", sizeH = "medium", mode = "default" }) => {
  const widthClass = widthMap[sizeW];
  const heightClass = heightMap[sizeH];

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      {mode === "default" ? (
        // Modal centrato
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className={`${widthClass} ${heightClass} bg-secondary rounded-md p-space xxl:p-space-xxl`}>
            {/* Header */}
            <View className="flex-row justify-between mb-space xxl:mb-space-xxl">
              <Text className="text-primary text-2xl font-bold">{title}</Text>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" color="#fff" size={28} />
              </Pressable>
            </View>
            {/* Content */}
            {children}
            {onCllickButton && <Button theme="modal" label={buttonName} onPress={onCllickButton} />}
          </View>
        </View>
      ) : (
        // Modal come pannello sulla destra
        <View className="flex-1 flex-row">
          {/* Sfondo trasparente cliccabile per chiudere */}
          <Pressable className="flex-1 bg-black/60" onPress={onClose} />
          {/* Pannello */}
          <View className="h-full w-11/12 sm:w-1/2 lg:w-1/3 bg-secondary p-space xxl:p-space-xxl">
            {/* Header */}
            <View className="flex-row justify-between mb-space xxl:mb-space-xxl">
              <Text className="text-primary text-2xl font-bold">{title}</Text>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" color="#fff" size={28} />
              </Pressable>
            </View>
            <ScrollView>{children}</ScrollView>
            {onCllickButton && <Button theme="modal" label={buttonName} onPress={onCllickButton} />}
          </View>
        </View>
      )}
    </Modal>
  );
};

export default SciaModal;
