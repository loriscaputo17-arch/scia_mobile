import { View, Text } from "react-native";
import React, { useMemo } from "react";
import CustomTable from "./CustomTable";
import { AntDesign } from "@expo/vector-icons";
import { type ActivityList, type Checklist } from "@/data/activityLists";
import { formatISODate, getMaintenanceStatusAndTime } from "@/app/utils/utils";
import { type Maintenance, type MaintenanceStatus, statusStyleColor, statusStyleWindColor } from "@/data/maintenences";
import { type Task } from "@/data/tasks";
import Button from "../atoms/Button";
import { type Reading } from "@/data/readings";
import { Malfunction } from "@/data/malfunctions";
import { Replacement } from "@/data/replacements";

type ActivityListsProps = {
  activityLists: ActivityList[];
  onSelectList: (listId: string) => void;
  selectedList: ActivityList;
  activities: Task[] | Maintenance[] | Reading[] | Malfunction[] | Replacement[];
};

const columns = [
  { content: <Text className="font-bold opacity-[0.6]">Titolo</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Task</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Scadenza</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Ultima Esecuzione</Text> },
];

const getActivityListSummary = (activityList: ActivityList, activities: Maintenance[] | Task[] | Reading[] | Malfunction[] | Replacement[]) => {
  switch (activityList.type) {
    case "maintenance":
      
      const maintenanceActivities = activities.filter(
        (a) => "expiryDate" in a && a.listId === activityList.listId
      ) as Maintenance[];

      // Se non ci sono attività, restituiamo valori di default
      if (maintenanceActivities.length === 0) {
        return { status: "scheduled" as MaintenanceStatus, expiryDate: "N/A", lastExecution: "N/A" };
      }

      // per ogni elenco di MANUTENZIONI, devo prender lo stato della manutenzione piu' critica, scaduta da piu tempo
      const longestExpiredActivity = maintenanceActivities.reduce((prev, curr) =>
        new Date(prev.expiryDate) < new Date(curr.expiryDate) ? prev : curr
      );

      return {
        status: getMaintenanceStatusAndTime(new Date(), new Date(longestExpiredActivity.expiryDate), longestExpiredActivity.recurrence).status,
        expiryDate: longestExpiredActivity?.expiryDate ? formatISODate(longestExpiredActivity.expiryDate) : "N/A",
        lastExecution: longestExpiredActivity?.lastExecution ? formatISODate(longestExpiredActivity.lastExecution) : "N/A",
      };
    case "reading":
    case "checklist":
      return {
        status: getMaintenanceStatusAndTime(new Date(), new Date((activityList as Checklist).listExpiryDate), (activityList as Checklist).recurrence).status,
        expiryDate: activityList.listExpiryDate ? formatISODate(activityList.listExpiryDate) : "N/A",
        lastExecution: activityList.listLastExecutionDate ? formatISODate(activityList.listLastExecutionDate) : "N/A",
      };
    default:
      return { status: "scheduled" as MaintenanceStatus, expiryDate: "N/A", lastExecution: "N/A" };
  }
};

export default function ActivityLists({ activityLists, activities, selectedList, onSelectList }: ActivityListsProps) {
  const data = useMemo(
    () =>
      activityLists.map((activityList) => {
        const { status, expiryDate, lastExecution } = getActivityListSummary(activityList, activities);

        return [
          {
            content: (
              <Button
                label={activityList.listName}
                theme="noBackground"
                onPress={() => onSelectList(activityList.listId)}
                IconComponent={AntDesign}
                iconProps={{ name: selectedList.listId === activityList.listId ? "checksquare" : "checksquareo", color: "white", size: 24 }}
              />
            ),
          },
          { content: <Text className="text-white">{activityList.activities.length}</Text> },
          { content: <Text className="text-white">{expiryDate}</Text>, style: statusStyleColor[status] },
          { content: <Text className="text-white">{lastExecution}</Text> },
        ];
      }),
    [activityLists, selectedList]
  );

  return (
    <View className="bg-primary">
      <CustomTable columns={columns} data={data} />
    </View>
  );
}
