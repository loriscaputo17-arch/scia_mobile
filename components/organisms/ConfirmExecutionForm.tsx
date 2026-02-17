import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SciaModal from "../molecules/SciaModal";
import Calculator from "../molecules/Calculator";
import Button from "../atoms/Button";
import DropdownSelector from "../atoms/DropdownSelector";
import FieldSwitcher from "../atoms/FieldSwitcher";

export type ConfirmExecutionFormData = {
  executionTime: number;
  location: string | undefined;
  userType: string;
  user: string;
};

type ConfirmExecutionFormProps = {
  locationItems: { label: string; value: string }[];
  userTypeItems: { label: string; value: string }[];
  userItems: { label: string; value: string }[];
  connectedUser: string; // Passiamo l'utente connesso come prop
  onConfirm: (data: ConfirmExecutionFormData) => void;
};

const ConfirmExecutionForm = ({ locationItems, userTypeItems, userItems, connectedUser, onConfirm }: ConfirmExecutionFormProps) => {
  const [showInsertTime, setShowInsertTime] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationValue, setLocationValue] = useState<string | null>(null);
  const [userTypeOpen, setUserTypeOpen] = useState(false);
  const [userTypeValue, setUserTypeValue] = useState("Utente connesso");
  const [userValue, setUserValue] = useState<string>(connectedUser);
  

  // Quando cambia il tipo di utente, aggiorniamo il valore di user
  useEffect(() => {
    if (userTypeValue === "Utente connesso") {
      setUserValue(connectedUser);
    }
  }, [userTypeValue, connectedUser]);

  return (
    <View className=" flex-1 ">
      <View className="flex-1 justify-between">
        <View>
          <View className="flex-row justify-between mb-4 ">
           
            <View className="flex-1 mr-2">
              <Text className="text-tertiary mb-2">Tempo impiegato</Text>
              <TouchableOpacity onPress={() => setShowInsertTime(true)} className="bg-quaternary font-semibold p-3 rounded-md h-12">
                <Text className={`${executionTime ? "text-primary" : "text-secondary"} font-medium`}>{executionTime || "Digita qui..."}</Text>
              </TouchableOpacity>
            </View>

            <DropdownSelector
              styleContainer={"flex-1 ml-2 z-[99]"}
              title={"Location"}
              open={locationOpen}
              value={locationValue}
              items={locationItems}
              setOpen={setLocationOpen}
              setValue={setLocationValue}
              placeholder="Scegli"
            />
          </View>

          <View className="flex-row justify-between mb-4 z-[98]">
            <DropdownSelector
              styleContainer="flex-1 mr-2"
              title={"Tipologia utente esecutore"}
              open={userTypeOpen}
              value={userTypeValue}
              items={userTypeItems}
              setOpen={setUserTypeOpen}
              setValue={setUserTypeValue}
              placeholder="Scegli"
            />

            {/* <DropdownSelector
              title="Utente esecutore"
              styleContainer="flex-1 ml-2 z-[97]"
              open={userOpen}
              value={userValue}
              items={userItems}
              setOpen={setUserOpen}
              setValue={setUserValue}
              placeholder="Seleziona utente"
              disabled={userTypeValue === "Utente connesso"}
            /> */}

            <FieldSwitcher
                  title="Utente esecutore"
                  value={userValue}
                  items={userItems}
                  setValue={setUserValue}
                  styleContainer="flex-1 ml-2 z-[97]"
                  disabled={userTypeValue === "Utente connesso"}
                />
          </View>
        </View>

        <SciaModal visible={showInsertTime} onClose={() => setShowInsertTime(false)} title="Inserisci valore (minuti)" buttonName="Conferma">
          <Calculator
            label="m"
            onConfirm={(value) => {
              setShowInsertTime(false);
              setExecutionTime(value);
            }}
          />
        </SciaModal>

        <Button
          theme="modal"
          label="Conferma"
          onPress={() =>
            onConfirm({
              executionTime: executionTime || 0,
              location: locationValue ? locationValue : undefined,
              userType: userTypeValue,
              user: userValue,
            })
          }
        />
      </View>
    </View>
  );
};

export default ConfirmExecutionForm;
