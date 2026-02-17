import { View, useWindowDimensions } from "react-native";
import React from "react";
import Button from "../atoms/Button";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { breakpoints } from "@/constants/breakpoints";

type ActivityDetailsExButtonsProps = {
  onPressEsitoOk: () => void;
  onPressAnomalia: () => void;
  onPressNonEseguito?: () => void;
  disabled?: boolean;
};

export default function ActivityDetailsExButtons({ disabled, onPressAnomalia, onPressEsitoOk, onPressNonEseguito }: ActivityDetailsExButtonsProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.md;

  return (
    <View className="mb-space flex-row">

      <Button
        label={isMobile ? "" : "Esito Ok"}
        onPress={onPressEsitoOk}
        IconComponent={AntDesign}
        iconProps={{ name: "checksquare", color: "#fff" }}
        styleWindContainer={`bg-customGreen mr-space ${isMobile ? "flex-1  p-4" : ""}`}
        theme="default"
        disabled={disabled}
      />

      <Button
        label={isMobile ? "" : "Anomalia"}
        onPress={onPressAnomalia}
        IconComponent={AntDesign}
        iconProps={{ name: "closesquareo", color: "#fff" }}
        styleWindContainer={`bg-quaternary ${isMobile ? "flex-1 p-4" : ""} ${onPressNonEseguito && "mr-space"}`}
        theme="default"
        disabled={disabled}
      />
      {onPressNonEseguito && (
        <Button
          label={isMobile ? "" : "Non eseguito"}
          onPress={onPressNonEseguito}
          IconComponent={Ionicons}
          iconProps={{ name: "hourglass-outline", color: "#fff" }}
          styleWindContainer={`bg-quaternary ${isMobile ? "flex-1 p-4" : ""}`}
          theme="default"
          disabled={disabled}
        />
      )}
    </View>
  );
}
