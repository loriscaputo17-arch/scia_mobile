import { ScrollView, View, Text } from "react-native";
import React, { useState } from "react";
import FilterItem from "../molecules/FilterItem";
import { filterActivitiesByField, filterActivitiesByNestedField, getExecutedTasks } from "@/app/utils/utils";
import Button from "../atoms/Button";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Field from "../atoms/Field";
import { teams } from "@/data/teams";
import { type Task } from "@/data/tasks";
import SciaModal from "../molecules/SciaModal";
import SystemsFilter from "../molecules/SystemsFilter";
import { type Job } from "@/data/jobs";

type ChecklistFiltersProps = {
  filters: string[];
  activities: Job[];
  onConfirm: (filters: string[]) => void;
};

export default function ChecklistFilters({ filters, activities, onConfirm }: ChecklistFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(filters);
  const [openSystemsFilter, setOpenSystemsFilter] = useState(false);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prevFilters) => (prevFilters.includes(filterId) ? prevFilters.filter((id) => id !== filterId) : [...prevFilters, filterId]));
  };

  const isChecked = (filterId: string) => selectedFilters.includes(filterId);

  const activityTeamData = teams.map((team) => ({
    filterId: `team-${team.id}`,
    label: team.label,
    count: filterActivitiesByNestedField(activities, "job.team_id", team.id).length,
  }));

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
      <Field label="Nascondi task eseguiti" />
      <FilterItem label="Nascondi task eseguiti" count={getExecutedTasks(activities).length}>
        <Button
          onPress={() => toggleFilter("check-nonEseguito")}
          IconComponent={Ionicons}
          iconProps={{ name: isChecked("check-nonEseguito") ? "checkbox" : "square-outline", color: "#789FD6", size: 24 }}
          theme="checkbutton"
        />
      </FilterItem>

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
      <View className="h-60"></View>
      <Button theme="modal" label="Conferma" onPress={() => onConfirm(selectedFilters)} />
    </ScrollView>
  );
}
