import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { type Replacement } from "@/data/replacements";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { getImageSource } from "@/app/utils/getImageSource";

type SelectReplacementProps = {
  replacement: Replacement;
  quantity: number;
  onSelect: (quantity: number) => void;
};

export default function SelectReplacement({ replacement, quantity, onSelect }: SelectReplacementProps) {
  const selected = quantity > 0;
  const maxQuantity = replacement.quantity - quantity <= 0;
  const border = selected ? "border-2 border-[#2DB647]" : "";

  const handleIncrement = () => {
    if (!maxQuantity) onSelect(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onSelect(quantity - 1);
    }
  };
  const handleReset = () => {
    onSelect(0);
  };

  return (
    <View className={`relative mr-4`}>
      {/* Immagine del ricambio */}
      <TouchableOpacity
        className={`w-28 h-28 rounded-md ${border} flex justify-center items-center`}
        disabled={replacement.quantity === 0} // Disabilita il touch se la quantità è zero
        onPress={selected ? handleReset : handleIncrement}
      >
        <Image source={getImageSource(replacement.img)} className={`w-full h-full rounded-md ${replacement.quantity === 0 ? "opacity-40" : "opacity-1"}`} />
      </TouchableOpacity>

      {/* Icona del cerchio di selezione */}
      <View className="absolute top-1 left-1 ">
        {selected ? <AntDesign name={"checkcircle"} size={18} color={"#2DB647"} /> : <MaterialIcons name={"radio-button-unchecked"} size={20} color={"#919191"} />}
      </View>

      {/* Se quantità inferiore alla soglia */}
      {replacement.quantity < replacement.stockOutThresold && !selected && (
        <View className="absolute top-1 right-1">
          <AntDesign name={replacement.quantity > 0 ? "exclamationcircle" : "closecircle"} size={18} color={replacement.quantity > 0 ? "#F47217" : "#D0021B"} />
        </View>
      )}

      {/* Mostra i pulsanti +, -, e la quantità solo se l'elemento è selezionato e ha disponibilità */}
      {selected && replacement.quantity > 0 && (
        <View className="flex-row justify-center items-center mt-4">
          <TouchableOpacity onPress={handleDecrement} className="px-2">
            <AntDesign name="minus" size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="px-2 text-white">{quantity}</Text>
          <TouchableOpacity onPress={handleIncrement} className={`px-2 ${maxQuantity ? "opacity-20" : ""}`} disabled={maxQuantity}>
            <AntDesign name="plus" size={24} color={"white"} />
          </TouchableOpacity>
        </View>
      )}
      
    </View>
  );
}
