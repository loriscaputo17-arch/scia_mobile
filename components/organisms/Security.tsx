import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import Button from "../atoms/Button";
import TextInputField from "../atoms/TextInputField";
import { AntDesign, FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";
import { validateConfirmPassword, validateConfirmPIN, validateOldPassword, validatePassword, validatePin } from "@/app/utils/validationUtils";

export default function Security({ onSave }: { onSave: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pinAccess, setPinAccess] = useState(false);
  const [biometricAccess, setBiometricAccess] = useState(false);
  const [confirmPin, setConfrmPin] = useState("");

  //retrieve old psw
  const oldPsw = "Ciao123@";

  const handleUpdateSecurity = () => {
    onSave();
  };

  const isValidUpdate = () => {
    return (
      validateOldPassword(oldPassword, oldPsw).isValid 
      && 
      (
        (validatePassword(newPassword).isValid && validateConfirmPassword(newPassword, confirmPassword).isValid) 
        ||
        (validatePin(pin).isValid && validateConfirmPIN(pin, confirmPin).isValid)
      )
    );
  };

  return (
    <>
      <ScrollView>
        <View className="flex-row flex-wrap w-full">
          <TextInputField
            styleContainer="w-1/2 p-space"
            label="Vecchia Password"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
            validateInput={validateOldPassword}
            compareValue={oldPsw}
            //   errorMessage="L'email inserita non e' valida"
          />
          <TextInputField styleContainer="w-1/2 p-space" label="Nuova Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} validateInput={validatePassword} />
          <TextInputField
            styleContainer="w-1/2 p-space"
            label="Conferma Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            validateInput={validateConfirmPassword}
            compareValue={newPassword}
          />
          <View className="w-1/2 p-space" />

          <Button
            label="Utilizza PIN di accesso rapido"
            onPress={() => setPinAccess(!pinAccess)}
            IconComponent={Ionicons}
            styleWindContainer="w-1/2 p-space justify-start"
            iconProps={{ name: pinAccess ? "checkbox" : "square-outline", color: "#789FD6", size: 24 }}
            theme="default"
            // disabled={disabled}
          />
          <Button
            label="Attiva riconoscimento biometrico"
            onPress={() => setBiometricAccess(!biometricAccess)}
            IconComponent={Ionicons}
            styleWindContainer="w-1/2 p-space justify-start"
            iconProps={{ name: biometricAccess ? "checkbox" : "square-outline", color: "#789FD6", size: 24 }}
            theme="default"
          />

          <TextInputField styleContainer="w-1/2 p-space" label="Imposta PIN" secureTextEntry value={pin} onChangeText={setPin} keyboardType="numeric" validateInput={validatePin} />
          <TextInputField
            styleContainer="w-1/2 p-space"
            label="Conferma PIN"
            secureTextEntry
            value={confirmPin}
            onChangeText={setConfrmPin}
            keyboardType="numeric"
            validateInput={validateConfirmPIN}
            compareValue={pin}
          />
        </View>
      </ScrollView>
      <Button theme="modal" label="Salva" disabled={!isValidUpdate()} onPress={handleUpdateSecurity} />
    </>
  );
}
