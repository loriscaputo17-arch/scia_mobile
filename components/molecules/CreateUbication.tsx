import { View, Text } from "react-native";
import React, { useState } from "react";
import DropdownSelector from "../atoms/DropdownSelector";
import TextInputField from "../atoms/TextInputField";
import Button from "../atoms/Button";
import { type Warehouse } from "@/data/warehouses";
import { selectWarehouses } from "@/features/warehouses/warehousesSlice";
import { useSelector } from "react-redux";

type CreateUbicationProps = {
  onConfirmUbication: (warehouseId: string, ubication: string) => void,
  warehouses: Warehouse[],
};

const mapWarehousesToItems = (warehouses: Warehouse[]) => {
  return warehouses.map((w) => ({
    value: w.id,
    label: w.name,
  }));
};

export default function CreateUbication({ onConfirmUbication , warehouses }: CreateUbicationProps) {
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [warehouseValue, setWarehouseValue] = useState<string | null>(null);
  const [ubication, setUbication] = useState("");
  // const warehouses = useSelector(selectWarehouses);

  const handleConfirmUbication = () => {
    if (warehouseValue) onConfirmUbication(warehouseValue, ubication);
  };
  return (
    <View className=" flex-1 ">
      <View className="flex-1">
        <DropdownSelector
          styleContainer={"mb-space z-[99]"}
          title={"Magazzino"}
          open={warehouseOpen}
          value={warehouseValue}
          items={mapWarehousesToItems(warehouses)}
          setOpen={setWarehouseOpen}
          setValue={setWarehouseValue}
          placeholder="Scegli"
        />

        <TextInputField styleContainer="" label="Ubicazione" value={ubication} onChangeText={setUbication} /* validateInput={validateName}  */ />
      </View>

      <Button theme="modal" label="Conferma" onPress={handleConfirmUbication} disabled={ !warehouseValue || !ubication}/>
    </View>
  );
}
