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
import { type Failure } from "@/data/failures";
import { severities } from "@/data/severities";

type FailuresFiltersProps = {
  filters: string[];
  activities: Failure[];
  onConfirm: (filters: string[]) => void;
};

export default function FailuresFilters({ filters, activities, onConfirm }: FailuresFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(filters);


  const toggleFilter = (filterId: string) => {

    setSelectedFilters((prevFilters) => (prevFilters.includes(filterId) ? prevFilters.filter((id) => id !== filterId) : [...prevFilters, filterId]));
  };

  const isChecked = (filterId: string) => selectedFilters.includes(filterId);

  const severityData = Object.values(severities).map((severity) => ({
    filterId: `severity-${severity.id}`,
    label:
      severity.id.charAt(0).toUpperCase() +
      severity.id
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .trim(),
    count: filterActivitiesByField(activities, 'gravity', severity.id).length, //filterMaintenancesByStatuses(activities, [severity]).length,
    iconCollection: "Ionicons" as IconCollection,
    iconProps: {
      name: "square",
      color:  severities[severity.id].styleColor.backgroundColor,
      size: 24,
    },
  }));


  const activityTeamData = teams.map((team) => ({
    filterId: `team-${team.id}`,
    label: team.label,
    count: filterActivitiesByNestedField(activities, "userExecutionData.team_id", team.id).length,
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
      {renderFilterSection("Stato", severityData)}
      {renderFilterSection("Squadra di assegnazione", activityTeamData)}
      <View className="h-48"></View>
      <Button theme="modal" label="Conferma" onPress={() => onConfirm(selectedFilters)} />
    </ScrollView>
  );
}
