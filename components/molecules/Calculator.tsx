import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { FontAwesome6 } from '@expo/vector-icons';
import Button from '../atoms/Button';
import NumericKeypad from '../atoms/NumericKeypad';

type CalculatorProps = {
  onConfirm: (value: number) => void;
  label?: string;
}

const Calculator = ({ label, onConfirm }: CalculatorProps) => {
  const [inputValue, setInputValue] = useState('0.00');

  const handlePress = (value: string) => {
    if (value === 'CANC') {
      // Rimuove l'ultimo carattere
      setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0.00'));
    } else {
      setInputValue((prev) => {
        // Concatenazione del nuovo valore all'input corrente
        const newValue = prev === '0.00' ? value : prev + value;

        // Controllo di validità numerica
        if (!isNaN(Number(newValue))) {
          return newValue; // Aggiorna solo se è un numero valido
        }
        return prev; // Altrimenti, non aggiornare l'input
      });
    }
  };

  return (
    <>
      <View className="flex-1 items-center justify-center md:p-4">
        {/* Campo di Input */}
        <View className="flex-row items-center px-8 md:px-28 py-4 mb-6">
          {label && <Text className="text-primary text-2xl font-bold">{label}</Text>}
          <TextInput
            className="w-full text-2xl text-right font-bold rounded text-secondary"
            value={inputValue}
            editable={false}
          />
        </View>

        {/* Tastierino Numerico */}
        <NumericKeypad keys={["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "CANC"]} onKeyPress={(key) => handlePress(key)}/>
        
      </View>
      <Button theme='modal' label="Conferma" onPress={() => onConfirm(parseFloat(inputValue))} />
    </>

  );
};

export default Calculator;
