import { formatISODate } from "@/app/utils/utils";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Button from "../atoms/Button";

type TextNoteInsertProps = {
  onSave: (text: string) => void;
};

export default function TextNoteInsert({ onSave }: TextNoteInsertProps) {
  const [inputValue, setInputValue] = useState("");
  const [currentTime, setCurrentTime] = useState(formatISODate(new Date().toISOString()));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatISODate(new Date().toISOString()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <View className="bg-primaryLighter p-6 rounded-md flex-1 my-space">
        <TextInput
          className="text-primary text-md leading-5"
          placeholder="Scrivi qui..."
          placeholderTextColor={"white"}
          value={inputValue}
          keyboardType="default"
          onChangeText={setInputValue}
          multiline
        />

        <Text className="absolute bottom-0 mb-2 right-6 text-secondary text-xs font-bold self-end">{currentTime}</Text>
      </View>
      <Button
        theme="modal"
        disabled={inputValue === ""}
        label="Aggiungi Nota"
        onPress={() => {
          onSave(inputValue);
          setInputValue("");
        }}
      />
    </>
  );
}
