import { View, Text } from "react-native";
import React from "react";
import Button from "../atoms/Button";
import { router } from "expo-router";

type AddToCartProps = {
  onAddOtherProducts : ()=> void;
  onAddToCart : ()=> void;
}

export default function AddToCart({onAddOtherProducts, onAddToCart}: AddToCartProps) {
  return (
    <>
      <View className="flex-1 mt-space xxl:mt-space-xxl">
        <Text className="text-primary font-bold">Il prodotto “Guarnizione della testa” è stato aggiunto al tuo carrello</Text>
      </View>
      <View className="flex-row space-x-space ">
        <Button theme="mediumQuaternary" styleWindContainer="flex-1" label="Aggiungi altri prodotti" onPress={onAddOtherProducts} />
        <Button theme="mediumTertiary" styleWindContainer="flex-1" label="Vai al Carrello" onPress={onAddToCart} />
      </View>
    </>
  );
}
