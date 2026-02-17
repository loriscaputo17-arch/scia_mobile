import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import SciaModal from "../molecules/SciaModal";
import Button from "../atoms/Button";
import DropdownSelector from "../atoms/DropdownSelector";
import FieldSwitcher from "../atoms/FieldSwitcher";
import TextInputField from "../atoms/TextInputField";
import Field from "../atoms/Field";
import FieldDate from "../atoms/FieldDate";
import { validateName, validateCleanField, validateCustomField } from "@/utils/validationUtils";
import { selectUserOptions } from "@/features/users/usersSlice";
// import { connectedUserID } from "@/data/connectedUserID";
import { formatISODate } from "@/utils/utils";
import { severities, type SeverityId } from "@/data/severities";
import { type Malfunction } from "@/data/malfunctions";
import SystemsFilter from "../molecules/SystemsFilter";
import { addMalfunction } from "@/features/malfunctions/malfunctionsSlice";
import { addActivityToList } from "@/features/activityLists/activityListsSlice";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { addFailure } from "@/api/failures";
import { useFailuresSync } from "@/hooks/useFailuresSync";

export type ConfirmMalfunctionFormData = {
  id: string;
  name: string;
  systemName: string;
  systemId: string;
  iconPropsImpianto: {
    name: string;
    color: string;
  };
  date: string;
  user: string;
  severity: SeverityId;
  description?: string;
};

type MalfunctionFormProps = {
  // connectedUser: string; // Passiamo l'utente connesso come prop
  onConfirm: () => void;
};

/* const severityItems = [
  { label: "Gravita' alta", value: 'high' },
  { label: 'In banchina', value: 'In banchina' },
  { label: 'In bacino', value: 'In bacino' },
]; */

const reservedFieldNames = ["Titolo", "Impianto/Componente", "Descrizione", "Data", "Gravita", "Utente esecutore", "Tipologia utente esecutore"];

const userTypeItems = [
  { label: "Utente connesso", value: "Utente connesso" },
  { label: "Utente esterno", value: "Utente esterno" },
];

const MalfunctionForm = ({ /* connectedUser, */ onConfirm }: MalfunctionFormProps) => {
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [openSystemsFilter, setOpenSystemsFilter] = useState(false);
  const [severityValue, setSeverityValue] = useState<SeverityId | null>(null);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString());
  const [description, setDecription] = useState("");
  const userNames = useSelector(selectUserOptions);
  const [userTypeOpen, setUserTypeOpen] = useState(false);
  const [userTypeValue, setUserTypeValue] = useState("Utente connesso");
  const userID = useSelector(selectCurrentUser)?.id;
  const { refresh } = useFailuresSync(false);

  if (!userID) return;
  const [userValue, setUserValue] = useState<string>(userID);

  // Custom Fields State
  const [customFields, setCustomFields] = useState<{ id: number; name: string; value: string }[]>([]);

  useEffect(() => {
    if (userTypeValue === "Utente connesso") {
      setUserValue(userID);
    }
  }, [userTypeValue, userID]);

  const handleAddCustomField = () => {
    setCustomFields((prev) => [...prev, { id: Date.now(), name: "", value: "" }]);
  };

  const handleRemoveCustomField = (id: number) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleChangeCustomField = (id: number, key: "name" | "value", text: string) => {
    setCustomFields((prev) => prev.map((field) => (field.id === id ? { ...field, [key]: text } : field)));
  };

  const isValidUpdate = () => {
    const validCustomFields = customFields.every((field, _, array) => {
      const otherFieldNames = array.filter((f) => f.id !== field.id).map((f) => f.name);

      const compareValues = [...reservedFieldNames, ...otherFieldNames];

      const isValidName = validateCustomField(field.name, compareValues).isValid;
      const isValidValue = validateCleanField(field.value).isValid;

      return isValidName && isValidValue;
    });

    return selectedSystems.length === 1 && severityValue && validateCleanField(title).isValid && validCustomFields;
  };

  const handleConfirmExecution = async () => {
    if (!userValue || selectedSystems.length === 0 || !severityValue) {
      console.error("Dati mancanti. Controlla user, impianto o gravità.");
      return;
    }

    const payload = {
      title,
      description,
      date: date.split("T")[0], // API si aspetta solo la parte "YYYY-MM-DD"
      gravity: severityValue,
      executionUserType: userTypeValue === "Utente connesso" ? "connected_user" : "external_user",
      userExecution: userValue, // assicurati sia un numero se l'API lo vuole come tale
      partNumber: "",
      customFields: customFields.map(({ name, value }) => ({ name, value })),
    };

    try {
      const response = await addFailure(payload);

      if (response?.failure) {
        refresh(); // sincronizza lista
        onConfirm(); // chiudi modale
      } else {
        console.error("Errore durante la creazione della failure:", response?.message || "Errore sconosciuto");
      }
    } catch (error) {
      console.error("Errore durante la richiesta addFailure:", error);
    }
  };

  // const handleConfirmExecution = () => {
  //   // const proceedWithConfirmation = () => {
  //   // confirmMaintenance(maintenance, confirmData.replacementQuantityMap, confirmData.user, confirmExecution, imageNotes, audioNotes, textNotes, confirmData.location, confirmData.executionTime);

  //   // Crea base malfunction
  //   const malfunctionData: Malfunction = {
  //     id: `malf_${Date.now()}`,
  //     name: title,
  //     systemId: selectedSystems[0],
  //     /* systemName: "", // da selezione
  //     iconComponentImpianto: "MaterialIcons",
  //     iconPropsImpianto: { name: "warning", color: "#000" }, */
  //     date,
  //     user: userValue,
  //     severity: severityValue ?? "none",
  //     description: description ?? undefined,
  //   };

  //   // Aggiungi i custom field come nuove proprietà
  //   customFields.forEach((field) => {
  //     if (field.name && field.value) {
  //       malfunctionData[field.name] = field.value;
  //     }
  //   });
  //   dispatch(addMalfunction(malfunctionData));
  //   dispatch(addActivityToList({ listId: "avarie", activityId: malfunctionData.id }));

  //   onConfirm();
  //   // };

  //   /* if () {
  //     showConfirmationAlert("Confermare esito?", "Non hai aggiunto nessuna nota.\nProcedere lo stesso? \nUna volta confermato non sara' piu' possibile allegare note.", proceedWithConfirmation);
  //   } else {
  //     showConfirmationAlert("Confermare esito?", "Una volta confermato non sara' piu' possibile modificare l'esito ne' allegare ulteriori note.", proceedWithConfirmation);
  //   } */
  // };

  return (
    <ScrollView>
      <View className="flex-1 mb-space xxl:mb-space-xxl ">
        <View className="flex-row justify-between mb-4 ">
          <TextInputField styleContainer="flex-1 mr-2" label="Titolo" value={title} onChangeText={setTitle} validateInput={validateCleanField} />
          <Field
            label="Impianto/Componente"
            containerStyle="flex-1 ml-2"
            child={
              <Button
                theme={"justifyBetween"}
                styleWindContainer="mt-2"
                IconComponent={MaterialIcons}
                iconProps={{ name: "navigate-next", color: "white", size: 26 }}
                label="Scegli"
                onPress={() => setOpenSystemsFilter(true)}
              />
            }
          />
        </View>

        <View className="flex-row mb-4 h-28">
          <TextInputField
            style={{ minHeight: 80, textAlignVertical: "top" }} // Imposta una altezza minima
            styleContainer="flex-1"
            label="Descrizione"
            value={description}
            onChangeText={setDecription}
            validateInput={validateCleanField}
            numberOfLines={3}
            multiline
          />
        </View>

        {/* **************** */}

        <View className="flex-row justify-between mb-4">
          <FieldDate title="Data" date={date} setDate={setDate} styleContainer="flex-1 mr-2" />

          <DropdownSelector
            styleContainer={"flex-1 ml-2 z-[99]"}
            title={"Gravita"}
            open={severityOpen}
            value={severityValue}
            items={Object.values(severities).map((s) => ({ label: s.label, value: s.id }))}
            setOpen={setSeverityOpen}
            setValue={setSeverityValue}
            placeholder="Scegli"
          />
        </View>

        {/* ****************** */}

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

          <FieldSwitcher title="Utente esecutore" value={userValue} items={userNames} setValue={setUserValue} styleContainer="flex-1 ml-2 z-[97]" disabled={userTypeValue === "Utente connesso"} />
        </View>

        {/* Custom Fields */}
        {customFields.map((field) => (
          <View key={field.id} className="flex-row justify-between mb-4">
            <TextInputField
              labelColor="#ED81E5"
              styleContainer="flex-1 mr-2"
              label="Nome"
              value={field.name}
              onChangeText={(text) => handleChangeCustomField(field.id, "name", text)}
              validateInput={validateCustomField}
              compareValues={[...reservedFieldNames, ...customFields.filter((f) => f.id !== field.id).map((f) => f.name)]}
            />
            <View className="flex-1 flex-row ml-2 mr-2">
              <TextInputField
                labelColor="#ED81E5"
                styleContainer="flex-1 mr-2"
                label="Valore"
                value={field.value}
                onChangeText={(text) => handleChangeCustomField(field.id, "value", text)}
                validateInput={validateCleanField}
              />
              <TouchableOpacity className="ml-2 mt-9" onPress={() => handleRemoveCustomField(field.id)}>
                <AntDesign name="minuscircle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Aggiungi Campo */}
        <View className="flex-row justify-center mb-4">
          <Button label="Aggiungi campo custom" onPress={handleAddCustomField} IconComponent={AntDesign} iconProps={{ name: "pluscircle", color: "#fff" }} theme="noBackground" />
        </View>
      </View>

      <SciaModal visible={openSystemsFilter} onClose={() => setOpenSystemsFilter(false)} title="Filtro impianti">
        <SystemsFilter
          filters={selectedSystems}
          onConfirm={(filters) => {
            setSelectedSystems(filters);
            setOpenSystemsFilter(false);
          }}
          multiple={false}
        />
      </SciaModal>

      <Button theme="modal" label="Conferma" onPress={handleConfirmExecution} disabled={!isValidUpdate()} />
    </ScrollView>
  );
};

export default MalfunctionForm;
