import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { IconCollection } from "../atoms/IconComponent";
import FilterItem from "../molecules/FilterItem";
import { areAllReplacementsAvailable, filterActivitiesByField, filterActivitiesByNestedField, filterMaintenancesByStatuses, isAnyReplacementLowStock, isAnyReplacementOutOfStock } from "@/app/utils/utils";
import Button from "../atoms/Button";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { levels, MaintenanceLevelId } from "@/data/levels";
import Field from "../atoms/Field";
import SciaModal from "../molecules/SciaModal";
import SystemsFilter from "../molecules/SystemsFilter";
import { type ClassificationID, classifications } from "@/data/classifications";
import { magazineFuncionality } from "@/data/magazineFuncionality";
import { maintenanceStatuses, statusStyleColor, type Maintenance } from "@/data/maintenences";
import { teams } from "@/data/teams";
import { /* recurrences, */ recurrenceThresholds, showedRecurrences } from "@/data/recurrenceTresholds";
import { useSelector } from "react-redux";
import { selectReplacementMap } from "@/features/replacements/replacementsSlice";
import { type Job } from "@/data/jobs";

type MaintenanceFiltersProps = {
  filters: string[];
  activities: Job[];
  onConfirm: (filters: string[]) => void;
};

export default function MaintenanceFilters({ filters, activities, onConfirm }: MaintenanceFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(filters);
  const [openSystemsFilter, setOpenSystemsFilter] = useState(false);
  const replacementsMap = useSelector(selectReplacementMap);


  const toggleFilter = (filterId: string) => {

    setSelectedFilters((prevFilters) => (prevFilters.includes(filterId) ? prevFilters.filter((id) => id !== filterId) : [...prevFilters, filterId]));
  };

  const isChecked = (filterId: string) => selectedFilters.includes(filterId);

  const statusData = maintenanceStatuses.map((status) => ({
    filterId: `status-${status}`,
    label:
      status.charAt(0).toUpperCase() +
      status
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .trim(),
    count: filterMaintenancesByStatuses(activities, [status]).length,
    iconCollection: "Ionicons" as IconCollection,
    iconProps: {
      name: status === "scheduled" ? "square-outline" : "square",
      color: status === "scheduled" ? "#789FD6" : statusStyleColor[status]?.backgroundColor,
      size: 24,
    },
  }));

  // const recurrenceData = recurrences.map((recurrence) => ({
  const recurrenceData = Object.keys(showedRecurrences).map((recurrenceTypeId) => ({
    filterId: `recurrence-${recurrenceTypeId}`,
    label: showedRecurrences[recurrenceTypeId],
    count: filterActivitiesByField(activities, "recurrency_type_id", recurrenceTypeId).length,
  }));


  const levelData = Object.keys(levels).map((levelId) => ({
    filterId: `levelId-${levelId}`,
    label: levels[levelId as MaintenanceLevelId].label,
    count: filterActivitiesByNestedField(activities, "job.maintenance_list.MaintenanceLevel_ID", levelId).length,
    ...levels[levelId as MaintenanceLevelId].IconComponent,
  }));

  const activityTeamData = teams.map((team) => ({
    filterId: `team-${team.id}`,
    label: team.label,
    count: filterActivitiesByNestedField(activities, "job.team_id", team.id).length,
  }));

  // const replacementsData = [
  //   { filterId: "replacements-required", condition: (activity: any) => activity.replacements.length > 0, key: "ricambi_richiesti" },
  //   { filterId: "replacements-available", condition: (activity: any) => areAllReplacementsAvailable(activity.replacements, replacementsMap), key: "ricambi_richiesti_disponibili" },
  //   { filterId: "replacements-notAvailable", condition: (activity: any) => isAnyReplacementOutOfStock(activity.replacements, replacementsMap), key: "ricambi_richiesti_non_disponibili" },
  //   { filterId: "replacements-lowStock", condition: (activity: any) => isAnyReplacementLowStock(activity.replacements, replacementsMap), key: "ricambi_richiesti_in_esaurimento" },
  // ]
  //   .filter((item) => magazineFuncionality || item.filterId === "replacements-required")
  //   .map((item) => ({
  //     filterId: item.filterId,
  //     count: activities.filter(item.condition).length,
  //     ...classifications[item.key as ClassificationID],
  //   }));

  const renderFilterSection = (label: string, data: any[]) => (
    <>
      <Field label={label} />
      {data.map((item) => (
        <FilterItem key={item.filterId} {...item}>
          <Button
            onPress={() => toggleFilter(item.filterId)}
            IconComponent={Ionicons}
            iconProps={{ name: isChecked(item.filterId) ? "checkbox" : "square-outline", color: "#789FD6", size: 24 }}
            theme="checkbutton"
          />
        </FilterItem>
      ))}
    </>
  );

  return (
    <ScrollView>
      {renderFilterSection("Stato", statusData)}
      {renderFilterSection("Ricorrenza", recurrenceData)}
      {renderFilterSection("Livello", levelData)}
      {renderFilterSection("Squadra di assegnazione", activityTeamData)}
      <Field label="Impianti" />
      <FilterItem label="Seleziona Impianti">
        <View className="flex-row items-center">
          {selectedFilters.some((filter) => filter.includes("system")) && (
            <View className="bg-white rounded-full h-6 w-6 items-center justify-center mr-space">
              <Text className="text-quaternary font-bold">{selectedFilters.filter((filter) => filter.includes("system")).length}</Text>
            </View>
          )}
          <Button onPress={() => setOpenSystemsFilter(true)} IconComponent={MaterialIcons} iconProps={{ name: "navigate-next", size: 26, color: "#fff" }} theme="checkbutton" />
        </View>
      </FilterItem>
      <SciaModal visible={openSystemsFilter} onClose={() => setOpenSystemsFilter(false)} title="Filtro impianti">
        <SystemsFilter
          filters={filters}
          filterPrefix="system"
          onConfirm={(filters) => {
            setSelectedFilters(filters);
            setOpenSystemsFilter(false);
          }}
        />
      </SciaModal>
      {/* {renderFilterSection("Ricambi", replacementsData)} */}
      <Button theme="modal" label="Conferma" onPress={() => onConfirm(selectedFilters)} />
    </ScrollView>
  );
}
