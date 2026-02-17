import React from "react";
import { View, Text } from "react-native";
import DropDownPicker, { DropDownPickerProps } from "react-native-dropdown-picker";

type DropdownSelectorProps = {
  title?: string;
  open: boolean;
  value: string | null;
  items: { label: string; value: string }[];
  setOpen: (open: any) => void;
  setValue: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  styleContainer?: string;
} 

const DropdownSelector = ({ title, open, value, items, setOpen, setValue, placeholder, disabled = false, styleContainer }: DropdownSelectorProps) => {
  const dropdownStyle = {
    backgroundColor: "#1c4064",
    borderColor: "#1c4064",
  };

  return (
    <View className={styleContainer}>
      {title && <Text className="text-tertiary mb-2">{title}</Text>}
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}

        dropDownDirection="BOTTOM"  // Forza il dropdown a espandersi verso il basso

        setValue={setValue}
        placeholder={placeholder}
        placeholderStyle={{ color: "#9AAABA", fontWeight: "500" }}
        dropDownContainerStyle={dropdownStyle}
        style={{
          ...dropdownStyle,
          opacity: disabled ? 0.5 : 1,
        }}
        listItemLabelStyle={{ color: "#9AAABA", fontWeight: "500" }}
        selectedItemLabelStyle={{ color: "#fff" }}
        // @ts-ignore
        tickIconStyle={{ tintColor: "white" }}
        // @ts-ignore
        arrowIconStyle={{ tintColor: "#fff", opacity: disabled ? 0.5 : 1 }}
        textStyle={{ color: "white", fontWeight: "500" }}
        disabled={disabled}
        listMode="SCROLLVIEW"
      />
    </View>
  );
};

export default DropdownSelector;
