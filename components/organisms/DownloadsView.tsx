import { View, Text, useWindowDimensions, ScrollView } from "react-native";
import React, { useMemo } from "react";
import { type Document } from "@/data/documents";
import CustomTable from "./CustomTable";
import Button from "../atoms/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { formatISODate } from "@/app/utils/utils";
import { downloadAndShareFile } from "@/app/utils/downloadUtils";
import { breakpoints } from "@/constants/breakpoints";

type DownloadsViewProps = {
  documents: Document[];
};

const columns = [
  { content: <Text className="font-bold opacity-[0.6]">Titolo</Text>, styleWind: "flex-[3]" },
  { content: <Text className="font-bold opacity-[0.6]">Peso</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Ultimo Aggiornamento</Text> },
];

export default function DownloadsView({ documents }: DownloadsViewProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.md;

  const handleDownload = (fileUrl: string, fileName: string) => {
    downloadAndShareFile(fileUrl, fileName);
  };

  const data = useMemo(
    () =>
      documents.map((document) => [
        {
          content: (
            <Button
              label={document.name}
              theme="noBackground"
              onPress={() => handleDownload(document.url, document.name)}
              IconComponent={MaterialIcons}
              iconProps={{ name: "file-download", color: "#9AAABA", size: 24 }}
            />
          ),
          styleWind: "flex-[3]",
        },
        { content: <Text className="text-white">{document.size}</Text> },
        { content: <Text className="text-white">{formatISODate(document.lastUpdate)}</Text> },
      ]),
    [documents]
  );

  if (!documents?.length) return null;

  return (
    <View className="flex-1 ">
      <View className="md:bg-primary">
        {/* --- VERSIONE MOBILE --- */}
        {isMobile ? (
          <ScrollView>
            <View className="bg-primary">
              {documents.map((document, idx) => (
                <View key={idx} className="flex-row items-center bg-secondary mb-1 py-3 ">
                  {/* Icona a sinistra */}
                  <Button
                    theme="noBackground"
                    onPress={() => handleDownload(document.url, document.name)}
                    IconComponent={MaterialIcons}
                    iconProps={{ name: "file-download", color: "#9AAABA", size: 28 }}
                  />

                  {/* Testi a destra */}
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-bold">{document.name}</Text>
                    <Text className="text-secondary text-sm">
                      {document.size} • {formatISODate(document.lastUpdate)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          /* --- VERSIONE TABLET / DESKTOP --- */
          <CustomTable columns={columns} data={data} />
        )}
      </View>
    </View>
  );
}
