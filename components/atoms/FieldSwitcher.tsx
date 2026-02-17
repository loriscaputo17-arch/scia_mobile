import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

type DropdownSwitcherProps = {
  title?: string;
  value: string | null; // Valore che rappresenta l'id
  items: { label: string; value: string }[]; // label=nome, value=id
  setValue: (value: any) => void;
  disabled?: boolean;
  placeholder?: string;
  styleContainer?: string;
};

const FieldSwitcher = ({
  title,
  value,
  items,
  placeholder,
  setValue,
  disabled = false,
  styleContainer,
}: DropdownSwitcherProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handleNextValue = () => {
    if (disabled) return;

    // Avvia l'animazione di uscita
    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 20, // Scorre leggermente a destra
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0, // Diminuisce l'opacità
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Aggiorna il valore e resetta l'animazione
      const currentIndex = items.findIndex((item) => item.value === value);
      const nextIndex = (currentIndex + 1) % items.length; // Passa al primo elemento se è l'ultimo
      setValue(items[nextIndex]?.value || null);

      // Ripristina posizione e opacità per l'animazione di entrata
      translateX.setValue(-20); // Parte da sinistra
      opacity.setValue(0);

      // Avvia l'animazione di ingresso
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const selectedItem = items.find((item) => item.value === value);

  return (
    <View className={`mb-space xxl:mb-space-xxl ${styleContainer}`}>
      {title && <Text className="text-tertiary mb-2">{title}</Text>}
      <TouchableOpacity
        className={`flex flex-row items-center justify-between bg-[#1c4064] border border-[#1c4064] rounded-lg p-3 ${disabled ? "opacity-50" : "opacity-100"} overflow-hidden`} // Limita la visibilità del contenuto
        onPress={handleNextValue}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Animated.Text
          className="text-primary font-[500]"
          style={{
            transform: [{ translateX }],
            opacity,
          }}
        >
          {selectedItem?.label || placeholder || "Seleziona"}
        </Animated.Text>
        <MaterialIcons name="navigate-next" color="#fff" size={24} style={{ marginRight: -4 }} />
      </TouchableOpacity>
    </View>
  );
};

export default FieldSwitcher;
