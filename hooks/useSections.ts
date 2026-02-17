import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { AntDesign, FontAwesome, FontAwesome5, Octicons, SimpleLineIcons } from "@expo/vector-icons";
import {
  filterActivitiesByField,
  filterMaintenancesByStatuses,
  filterOutActivitiesByField,
  getNotExecutedChecklistSummaryList,
  getNotExecutedReadingSummaryList,
  sortMaintenancesByExpiry,
} from "@/app/utils/utils";
import { selectMaintenances } from "@/features/maintenances/maintenanceSlice";
import { selectFailures } from "@/features/failures/failuresSlice";
import { selectReadings } from "@/features/readings/readingsSlice";
import { selectTasks } from "@/features/tasks/tasksSlice";

export default function useSections() {
  const activityLists = useSelector((state: RootState) => state.activityLists);
  
  const maintenances = useSelector(selectMaintenances);
  const failures = useSelector(selectFailures);
  const readings = useSelector(selectReadings);
  const tasks = useSelector(selectTasks);

  return useMemo(() => {
    const filteredMaintenances = filterMaintenancesByStatuses(maintenances, ["active", "expiring", "expired", "recentlyExpired"]);
    const sortedMaintenances = sortMaintenancesByExpiry(filteredMaintenances);

    return [
      {
        IconComponent: FontAwesome5,
        iconProps: { name: "wrench" },
        title: "Manutenzioni",
        listTitle: "Task",
        counter: filteredMaintenances.length,
        list: sortedMaintenances.map((maintenance) => maintenance.job?.name || ""),
        href: "manutenzioni",
      },
      {
        IconComponent: Octicons,
        iconProps: { name: "checklist" },
        title: "Checklist",
        listTitle: "Checklist",
        // counter: filterActivitiesByField(tasks, "check", "nonEseguito").length,
        // list: getNotExecutedChecklistSummaryList(activityLists, tasks),
        counter: 0,
        list: tasks.map((task)=> task.job?.name || ""),
        href: "checklist",
      },
      {
        IconComponent: SimpleLineIcons,
        iconProps: { name: "speedometer" },
        title: "Letture",
        listTitle: "Letture",
        // counter: filterActivitiesByField(readings, "value", 'undefined').length,
        // list: getNotExecutedReadingSummaryList(activityLists, readings),
        counter: filterActivitiesByField(readings, "value", "0").length,
        list: filterActivitiesByField(readings, "value", "0").map((reading)=> reading.task_name),
        href: "letture",
      },
      {
        IconComponent: FontAwesome,
        iconProps: { name: "plug" },
        title: "Catalogo Ricambi",
        listTitle: "",
        counter: 0,
        list: [],
        href: "catalogo_ricambi",
      },
      {
        IconComponent: AntDesign,
        iconProps: { name: "book" },
        title: "Manuale Integrato",
        listTitle: "",
        counter: 0,
        list: [],
        href: "manuale_integrato",
      },
      {
        IconComponent: AntDesign,
        iconProps: { name: "warning" },
        title: "Avarie",
        listTitle: "Avarie non risolte",
        counter: filterOutActivitiesByField(failures, "gravity", "bassa").length,
        list: filterOutActivitiesByField(failures, "gravity", "bassa").map((fail) => fail.title),
        href: "avarie",
      },
    ];
  }, [tasks, maintenances]);
}
