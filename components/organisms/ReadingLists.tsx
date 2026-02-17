import { View, Text } from "react-native";
import React, { useMemo } from "react";
import CustomTable from "./CustomTable";
import { AntDesign } from "@expo/vector-icons";
import { formatISODate, getMaintenanceStatusAndTime } from "@/app/utils/utils";
import Button from "../atoms/Button";
import { Reading } from "@/data/readings";


type ReadingListSummary = {
  type_id: string;
  title: string;
  tasks: number;
  due_date: string;
  last_execution: string;
};

const summarizedReadingLists = (readings: Reading[]): ReadingListSummary[] => {
  const grouped = readings.reduce((acc, reading) => {
    const typeId = String(reading.reading_type);
    const dueDate = reading.due_date;

    if (!acc[typeId]) {
      acc[typeId] = {
        type_id: typeId,
        title: reading.type?.name || "",
        tasks: 1,
        due_date: dueDate,
      };
    } else {
      acc[typeId].tasks += 1;

      // aggiorna la data se più recente
      if (new Date(dueDate) > new Date(acc[typeId].due_date)) {
        acc[typeId].due_date = dueDate;
      }
    }

    return acc;
  }, {} as Record<string, Omit<ReadingListSummary, "last_execution">>);

  return Object.values(grouped).map((group) => ({
    ...group,
    last_execution: group.due_date, // per ora stesso valore
  }));
}


type ReadingListsProps = {
  onSelectType: (typeId: string, typeTitle: string ) => void;
  selectedTypeId: string | undefined;
  readings: Reading [];
};

const columns = [
  { content: <Text className="font-bold opacity-[0.6]">Titolo</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Task</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Scadenza</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Ultima Esecuzione</Text> },
];


export default function ReadingLists({ readings, selectedTypeId, onSelectType }: ReadingListsProps) {


  const data = summarizedReadingLists(readings)
    .map((summarizedListReading) => {
      const readingListTypeId = summarizedListReading.type_id;

      return [

      {
        content: (
          <Button
            label={summarizedListReading.title}
            theme="noBackground"
            onPress={() => onSelectType(readingListTypeId, summarizedListReading.title)}
            IconComponent={AntDesign}
            iconProps={{ name: selectedTypeId === readingListTypeId ? "checksquare" : "checksquareo", color: "white", size: 24 }}
          />
        ),
      },
      { content: <Text className="text-white">{summarizedListReading.tasks}</Text> },
      { content: <Text className="text-white">{formatISODate(summarizedListReading.due_date)}</Text> /* , style: statusStyleColor[status]  */ },
      { content: <Text className="text-white">{formatISODate(summarizedListReading.last_execution)}</Text> },
    ]});

  return (
    <View className="bg-primary">
      <CustomTable columns={columns} data={data} />
    </View>
  );
}
