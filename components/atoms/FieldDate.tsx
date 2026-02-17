import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, Modal, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type FieldDateProps = {
  title?: string;
  date: string; // Data in formato ISO string
  setDate: (newDate: string) => void; // Funzione per aggiornare la data
  disabled?: boolean;
  placeholder?: string;
  styleContainer?: string;
};

const FieldDate = ({ title, date, setDate, placeholder, disabled = false, styleContainer }: FieldDateProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(date ? new Date(date) : new Date());

  const handleConfirm = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selectedDate) setDate(selectedDate.toISOString());
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const handleIosConfirm = () => {
    setShowPicker(false);
    setDate(tempDate.toISOString());
  };

  const formattedDate = date ? new Date(date).toLocaleDateString("it-IT") : placeholder || "Seleziona una data";

  return (
    <View className={`mb-space xxl:mb-space-xxl ${styleContainer}`}>
      {title && <Text className="text-tertiary mb-2">{title}</Text>}
      <TouchableOpacity
        className={`flex flex-row items-center justify-between bg-[#1c4064] border border-[#1c4064] rounded-lg p-3 ${
          disabled ? "opacity-50" : "opacity-100"
        }`}
        onPress={() => !disabled && setShowPicker(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text className="text-primary font-[500]">{formattedDate}</Text>
        <MaterialIcons name="event" color="#fff" size={24} />
      </TouchableOpacity>

      {showPicker && Platform.OS === "android" && (
        <DateTimePicker value={date ? new Date(date) : new Date()} mode="date" display="default" onChange={handleConfirm} />
      )}

      {showPicker && Platform.OS === "ios" && (
        <Modal transparent={true} animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-4 rounded-lg w-80">
              <DateTimePicker value={tempDate} mode="date" display="spinner" onChange={handleConfirm} />
              <Button title="Conferma" onPress={handleIosConfirm} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default FieldDate;
