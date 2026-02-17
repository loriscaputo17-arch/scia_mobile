import React, { useState, useEffect } from "react";
import { View, Text, TextInput, type TextInputProps } from "react-native";

type TextInputFieldBaseProps = {
  label: string;
  labelColor?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  styleContainer?: string;
} & TextInputProps;

type ValidationWithSingleCompare = {
  validateInput?: (value: string, compareValue: string) => { isValid: boolean; message: string };
  compareValue: string;
  compareValues?: never;
};

type ValidationWithMultipleCompare = {
  validateInput?: (value: string, compareValues: string[]) => { isValid: boolean; message: string };
  compareValue?: never;
  compareValues: string[];
};

type ValidationWithoutCompare = {
  validateInput?: (value: string) => { isValid: boolean; message: string };
  compareValue?: never;
  compareValues?: never;
};

type TextInputFieldProps = TextInputFieldBaseProps &
  (ValidationWithoutCompare | ValidationWithSingleCompare | ValidationWithMultipleCompare);

export default function TextInputField({
  label,
  labelColor,
  value = "",
  onChangeText,
  validateInput,
  compareValue,
  compareValues,
  styleContainer,
  ...props
}: TextInputFieldProps) {
  const [validation, setValidation] = useState({ isValid: true, message: "" });
  const [focused, setFocused] = useState(false);

  const runValidation = () => {
    if (validateInput && value !== "") {
      const { isValid, message } =
        compareValue !== undefined
          ? validateInput(value, compareValue)
          : compareValues !== undefined
          ? validateInput(value, compareValues)
          : validateInput(value as string); // fallback per validazioni semplici
  
      setValidation({ isValid, message });
    } else {
      setValidation({ isValid: true, message: "" });
    }
  };
  

  const handleBlur = () => {
    setFocused(false);
    runValidation();
  };

  // Per aggiornare la validazione se compareValue cambia
  useEffect(() => {
    if (compareValue !== undefined || compareValues !== undefined) {
      runValidation();
    }
  }, [compareValue, compareValues]);
  
  return (
    <View className={`mb-space xxl:mb-space-xxl ${styleContainer}`}>
      <Text className='mb-2 text-tertiary' style={labelColor && {color: labelColor}}>{label} </Text>
      <TextInput
        className={`text-primary bg-quaternary font-semibold p-3 rounded-lg h-12 ${
          !validation.isValid && !focused && "border border-red-500"
        }`}
        placeholder="Scrivi qui..."
        placeholderTextColor="#9AAABA"
        value={value}
        onFocus={() => setFocused(true)}
        onChangeText={onChangeText}
        onBlur={handleBlur}
        {...props}
      />
      {!validation.isValid && !focused && (
        <Text className="text-red-500 font-semibold mt-1 ml-2">{validation.message}</Text>
      )}
    </View>
  );
}
