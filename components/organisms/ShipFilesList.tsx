import { View, Text } from "react-native";
import React from "react";
import CustomTable from "./CustomTable";
import {  MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../atoms/Button";
import { ShipFile } from "@/data/shipFiles";

type ShipFilesListProps = {
  onSelectFile: (shipFile: ShipFile) => void;
  selectedFileId: string | undefined;
  shipFiles: ShipFile[];
};

const columns = [
  { content: <Text className="font-bold opacity-[0.6]">Seleziona</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Denominazione</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Tipo</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Descrizione</Text> },
];

export default function ShipFilesList({ onSelectFile, selectedFileId, shipFiles }: ShipFilesListProps) {

  const data = shipFiles
    .map((shipFile) => {
      return [

        {
          content: (
            <Button
              theme="noBackground"
              onPress={() => onSelectFile(shipFile)}
              IconComponent={MaterialCommunityIcons}
              iconProps={{
                name: shipFile.id === selectedFileId ? "radiobox-marked" : "radiobox-blank",
                color: "white",
                size: 24,
              }}
            />
          ),
        },
        { content: <Text className="text-white">{shipFile.file_name}</Text> },
        { content: <Text className="text-white">{shipFile.file_type}</Text> },
        { content: <Text className="text-white">{shipFile.description}</Text> },
      ];
    });

  return (
    <View className="bg-primary">
      <CustomTable columns={columns} data={data} />
    </View>
  );
}
