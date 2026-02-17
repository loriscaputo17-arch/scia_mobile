import { View, Text } from "react-native";
import React, { useMemo } from "react";
import CustomTable from "./CustomTable";
import { AntDesign } from "@expo/vector-icons";
import { statusStyleColor, statusStyleWindColor } from "@/data/maintenences";
import { type Task } from "@/data/tasks";
import Button from "../atoms/Button";
import { type Reading } from "@/data/readings";
import { Malfunction } from "@/data/malfunctions";
import { Replacement } from "@/data/replacements";
import { type Job } from "@/data/jobs";
import { formatISODate } from "@/app/utils/utils";

type ChecklistSummary = {
  type_id: string;
  title: string;
  tasks: number;
  due_date: string;
  last_execution: string;
};

function summarizedChecklists(tasks: any[]): ChecklistSummary[] {
  const grouped = tasks.reduce((acc, task) => {
    const typeId = String(task.recurrency_type_id);
    const title = task.recurrencyType?.name || "";
    const dueDate = task.ending_date;
    const lastExecution = task.execution_date;

    if (!acc[typeId]) {
      acc[typeId] = {
        type_id: typeId,
        title,
        tasks: 1,
        due_date: dueDate,
        last_execution: lastExecution,
      };
    } else {
      acc[typeId].tasks += 1;

      // Se questa ending_date è più recente, aggiornala
      if (new Date(dueDate) > new Date(acc[typeId].due_date)) {
        acc[typeId].due_date = dueDate;
      }

      // Se questa execution_date è più recente, aggiornala
      if (new Date(lastExecution) > new Date(acc[typeId].last_execution)) {
        acc[typeId].last_execution = lastExecution;
      }
    }

    return acc;
  }, {} as Record<string, ChecklistSummary>);

  return Object.values(grouped);
}

type ChecklistsProps = {
  onSelectType: (typeId: string, typeTitle: string) => void;
  selectedTypeId: string | undefined;
  tasks: Job[];
};

const columns = [
  { content: <Text className="font-bold opacity-[0.6]">Titolo</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Task</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Scadenza</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Ultima Esecuzione</Text> },
];

export default function Checklists({ tasks, selectedTypeId, onSelectType }: ChecklistsProps) {
  const data = summarizedChecklists(tasks).map((summarizedChecklist) => {
    // const { status, expiryDate, lastExecution } = getChecklistsummary(activityList, activities);
    const checklistTypeId = summarizedChecklist.type_id;

    return [
      {
        content: (
          <Button
            label={summarizedChecklist.title}
            theme="noBackground"
            onPress={() => onSelectType(checklistTypeId, summarizedChecklist.title)}
            IconComponent={AntDesign}
            iconProps={{ name: selectedTypeId === checklistTypeId ? "checksquare" : "checksquareo", color: "white", size: 24 }}
          />
        ),
      },
      { content: <Text className="text-white">{summarizedChecklist.tasks}</Text> },
      { content: <Text className="text-white">{formatISODate(summarizedChecklist.due_date)}</Text> /* style: statusStyleColor[status] */ },
      { content: <Text className="text-white">{formatISODate(summarizedChecklist.last_execution)}</Text> },
    ];
  });

  return (
    <View className="bg-primary">
      <CustomTable columns={columns} data={data} />
    </View>
  );
}
