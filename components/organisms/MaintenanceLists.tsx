import { View, Text } from "react-native";
import React, { useMemo } from "react";
import CustomTable from "./CustomTable";
import { AntDesign } from "@expo/vector-icons";
import { type ActivityList, type Checklist } from "@/data/activityLists";
import { formatISODate, getMaintenanceStatusAndTime } from "@/app/utils/utils";
import { type MaintenanceStatus, statusStyleColor } from "@/data/maintenences";
import Button from "../atoms/Button";
import { type Job } from "@/data/jobs";
import { useMaintenanceTypesSync } from "@/hooks/useMaintenanceTypesSync";
import { selectMaintenanceTypes } from "@/features/maintenanceTypes/maintenanceTypesSlice";
import { useSelector } from "react-redux";
import LoadingScreen from "../atoms/LoadingScreen";

type MaintenanceListsProps = {
  onSelectType: (typeId: string, typeTitle: string ) => void;
  selectedTypeId: string | undefined;
  // activities: Job[] ;
};

const columns = [
  { content: <Text className="font-bold opacity-[0.6]">Titolo</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Task</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Scadenza</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Ultima Esecuzione</Text> },
];

// const getActivityListSummary = (activities: Job[] ) => {

//       const maintenanceActivities = activities.filter(
//         (a) => "expiryDate" in a && a.listId === maintenanceList.listId
//       ) as Job[];

//       // Se non ci sono attività, restituiamo valori di default
//       if (maintenanceActivities.length === 0) {
//         return { status: "scheduled" as MaintenanceStatus, expiryDate: "N/A", lastExecution: "N/A" };
//       }

//       // per ogni elenco di MANUTENZIONI, devo prender lo stato della manutenzione piu' critica, scaduta da piu tempo
//       const longestExpiredActivity = maintenanceActivities.reduce((prev, curr) =>
//         new Date(prev.expiryDate) < new Date(curr.expiryDate) ? prev : curr
//       );

//       return {
//         status: getMaintenanceStatusAndTime(new Date(), new Date(longestExpiredActivity.expiryDate), longestExpiredActivity.recurrence).status,
//         expiryDate: longestExpiredActivity?.expiryDate ? formatISODate(longestExpiredActivity.expiryDate) : "N/A",
//         lastExecution: longestExpiredActivity?.lastExecution ? formatISODate(longestExpiredActivity.lastExecution) : "N/A",
//       };

// };

export default function MaintenanceLists({ selectedTypeId, onSelectType }: MaintenanceListsProps) {
  const { loading } = useMaintenanceTypesSync();
  const maintenanceTypes = useSelector(selectMaintenanceTypes);

  if (loading) return <LoadingScreen message="Caricamento delle liste di manutenzioni..." />;


  const data = maintenanceTypes
    .filter((type) => Number(type.tasks) > 0)
    .map((maintenanceList) => {
      const maintenanceListId = maintenanceList.id.toString();

      return [
      // const { status, expiryDate, lastExecution } = getActivityListSummary(maintenanceList, activities);

      {
        content: (
          <Button
            label={maintenanceList.title}
            theme="noBackground"
            onPress={() => onSelectType(maintenanceListId, maintenanceList.title)}
            IconComponent={AntDesign}
            iconProps={{ name: selectedTypeId === maintenanceListId ? "checksquare" : "checksquareo", color: "white", size: 24 }}
          />
        ),
      },
      { content: <Text className="text-white">{maintenanceList.tasks}</Text> },
      { content: <Text className="text-white">{formatISODate(maintenanceList.dueDate)}</Text> /* , style: statusStyleColor[status]  */ },
      { content: <Text className="text-white">{formatISODate(maintenanceList.lastExecution)}</Text> },
    ]});

  return (
    <View className="bg-primary">
      <CustomTable columns={columns} data={data} />
    </View>
  );
}
