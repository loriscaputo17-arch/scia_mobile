import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import TextInputField from "@/components/atoms/TextInputField";
import Button from "@/components/atoms/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DividerWithText from "../atoms/DividerWithText";
import QRScanner from "../molecules/QRScanner";

type MoveOrAddReplacementSearchProps = {
  onSearchESWBS: () => void;
  onSearchReplacement: (id: string |null) => void;
};
export default function MoveOrAddReplacementSearch({ onSearchESWBS, onSearchReplacement }: MoveOrAddReplacementSearchProps) {
  const [ean13, setEan13] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [eswbs, setEswbs] = useState("");
  const [openScan, setOpenScan] = useState(false);

  const handleSearch = () => {
   alert(`Ricerca in corso con:,  ${ean13}, ${partNumber}, ${eswbs} `);
   // ricerca il ricambio usanto ean13, o partnumber o eswbs -> return id replacement oppure null
  //  const foundReplacement = 'cinghia_di_distribuzione' ;
   const foundReplacement = null ; // null
   onSearchReplacement(foundReplacement)
  };

  const handleScanSuccess = (data: string) => {
    const url = new URL(data);
    const id = url.searchParams.get("id");
    if (id) {
      // replacement = getReplacement(id)
      const scannedReplacement = { ean13: "123456789", partNumber: "SIMB15013272Z", eswbs: "1234" };
      setEan13(scannedReplacement.ean13);
      setPartNumber(scannedReplacement.partNumber);
      setEswbs(scannedReplacement.eswbs);
    } else alert("Il QR Code non sembra corrispondere a nessun impianto o ricambio");
  };

  return (
    <>
      <View className="flex-1 my-space xxl:my-space-xxl">
        {/* Scansione */}
        <Button
          label="Scansiona il barcode del ricambio"
          theme="modal"
          IconComponent={MaterialCommunityIcons}
          iconProps={{ name: "barcode-scan", color: "#5A6E42" }}
          styleWindContainer="bg-[#FFEB3B] mb-space xxl:mb-space-xxl justify-start"
          styleWindtext="text-quaternary"
          onPress={() => setOpenScan(true)}
        />

        <QRScanner
          visible={openScan}
          onClose={() => setOpenScan(false)} // Chiudi il QRScanner
          onScanSuccess={handleScanSuccess} // Gestisci i dati scansionati
        />

        <DividerWithText text={"Oppure ricerca per codice"} />

        <View className="flex-row ">
          {/* <TextInputField label="Ricerca ESWBS" value={eswbs} onChangeText={setEswbs} placeholder="Scegli" /> */}

          <TextInputField label="EAN13" value={ean13} onChangeText={setEan13} styleContainer="w-1/2" />
          <TextInputField label="Part Number" value={partNumber} onChangeText={setPartNumber} styleContainer="w-1/2 pl-space xxl:pl-space-xxl" />
        </View>

        <DividerWithText text={"Oppure scegli da ESWBS"} />

        {/* ESWBS */}
        <Text className="text-tertiary mb-2">Ricerca ESWBS</Text>
        <TouchableOpacity onPress={onSearchESWBS} className="bg-quaternary font-semibold p-3 rounded-md h-12">
          <Text className={`${eswbs ? "text-primary" : "text-secondary"} font-medium`}>{eswbs || "Scegli"}</Text>
        </TouchableOpacity>
      </View>
      <Button theme="modal" label="Avvia ricerca" onPress={handleSearch} styleWindContainer="mt-space xxl:mt-space-xxl" />
    </>
  );
}
