import { View, Text, Pressable } from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import CustomTable from "@/components/organisms/CustomTable";
import Button from "@/components/atoms/Button";
import { MaterialIcons } from "@expo/vector-icons";
import SciaModal from "@/components/molecules/SciaModal";
import ActivityLists from "@/components/organisms/ActivityLists";
import SectionContainer from "../atoms/SectionContainer";
import { useLocalSearchParams } from "expo-router";
import SectionHeader from "../atoms/SectionHeader";
import MalfunctionForm from "../organisms/MalfunctionForm";
import { useTasksSync } from "@/hooks/useTasksSync";
import { selectTasks } from "@/features/tasks/tasksSlice";
import { generateDataForTasks } from "@/app/utils/generateDataForTasks";
import LoadingScreen from "../atoms/LoadingScreen";
import Checklists from "../organisms/Checklists";
import ChecklistFilters from "../organisms/ChecklistFilters";
import { applyFilters } from "@/app/utils/utils";

type ChecklistViewProps = { columnsSetup: () => any[] };

export default function ChecklistView({ columnsSetup }: ChecklistViewProps) {
  const [showActivityLists, setShowActivityLists] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityMenu, setShowActivityMenu] = useState<number | null>(null);
  const [showAddMalfunction, setShowAddMalfunction] = useState(false);
  const { extraInfo } = useLocalSearchParams(); // ES: "status-expired;system-propulsione_diesel"
  const [filters, setFilters] = useState<string[]>([]);

  const [typeId, setTypeId] = useState<string | undefined>(undefined);
  const [typeTitle, setTypeTitle] = useState<string>("Tutti");

  const { loading, refresh } = useTasksSync();

  const tasks = useSelector(selectTasks);

  const selectedActivities = useMemo(() => {
    if (typeId === undefined) return tasks;
    return tasks.filter((t) => t.recurrency_type_id === typeId);
  }, [typeId, tasks]);

  const filteredActivities = useMemo(() => {
    let filtered = selectedActivities;

    // Raggruppa i filtri per tipo ES: { status: ["expired", "recentlyExpired"], recurrence: ["Settimanale"] }
    const groupedFilters = filters.reduce<Record<string, string[]>>((acc, filter) => {
      const [filterGroup, selectedFilter] = filter.split("-"); // ["status", 'expired'] , ["status", 'recentlyExpired']
      acc[filterGroup] = acc[filterGroup] ? [...acc[filterGroup], selectedFilter] : [selectedFilter];
      return acc;
    }, {});

    // Applica ogni gruppo di filtri in sequenza
    Object.keys(groupedFilters).forEach((filterGroup) => {
      filtered = applyFilters(filtered, filterGroup, groupedFilters[filterGroup], new Date());
    });

    return filtered;
  }, [typeId, selectedActivities, filters]);

  // Gestisce la selezione delle liste
  const handleSelectList = useCallback((typeId: string) => {
    setTypeId(typeId);
  }, []);

  // Configura le colonne della tabella
  const columns = useMemo(columnsSetup, []);

  const handleFilters = (filters: string[]) => {
    setFilters(filters);
    // alert(filters)
  };

  // Gestisce i filtri basati su extraInfo
  useEffect(() => {
    if (typeof extraInfo === "string" && extraInfo.trim() !== "") {
      const filtersArray = extraInfo.split(";").map((filter) => filter.trim());

      // Trova e rimuove il valore con "listId-" se presente
      const listIdFilter = filtersArray.find((filter) => filter.startsWith("listId-"));
      const newFilters = filtersArray.filter((filter) => !filter.startsWith("listId-"));

      if (listIdFilter) {
        const listIdValue = listIdFilter.split("-")[1]; // Prende solo il valore dopo "listId-"
        setTypeId(listIdValue);
        handleSelectList(listIdValue);
      }

      setFilters(newFilters); // Aggiorna i filtri escludendo "listId-..."
    }
  }, [extraInfo]);

  if (loading) return <LoadingScreen message="Caricamento della checklist..." />;

  return (
    <SectionContainer>
      {/* Header */}
      <SectionHeader
        leftContent={
          <Pressable className="flex-row" onPress={() => setShowActivityLists(true)}>
            <Text className={`text-primary text-xl underline font-bold mb-space xxl:mb-space-xxl`}>{`${typeTitle} (${selectedActivities.length})`}</Text>
            <MaterialIcons name="keyboard-arrow-down" color="#fff" size={26} />
          </Pressable>
        }
        rightContent={
          <>
            <Button
              label={`Filtri ${filters.length > 0 ? `(${filters.length})` : ""}`}
              onPress={() => setShowFilters(true)}
              IconComponent={MaterialIcons}
              iconProps={{ name: filters.length > 0 ? "filter-alt" : "filter-alt-off", color: "#fff" }}
              theme="default"
              styleWindContainer={`${filters.length > 0 ? "bg-tertiary" : ""} `}
            />
          </>
        }
      />

      {/* Table */}
      <CustomTable columns={columns} data={generateDataForTasks(filteredActivities, showActivityMenu, setShowActivityMenu)} refresh={refresh} />

      {/* Modals */}

      <SciaModal visible={showFilters} mode="panel-right" onClose={() => setShowFilters(false)} title={"Filtri"}>
        <ChecklistFilters
          filters={filters}
          activities={selectedActivities}
          onConfirm={(filters) => {
            setShowFilters(false);
            handleFilters(filters);
          }}
        />
      </SciaModal>

      <SciaModal visible={showActivityLists} onClose={() => setShowActivityLists(false)} title={"Seleziona Attività"} onCllickButton={() => setShowActivityLists(false)} buttonName="Conferma">
        <View className="flex-1">
          <Checklists
            tasks={tasks}
            onSelectType={(newTypeId, newTypeTitle) => {
              setTypeId(newTypeId);
              setTypeTitle(newTypeTitle);
            }}
            selectedTypeId={typeId}
          />
        </View>
      </SciaModal>

      <SciaModal visible={showAddMalfunction} onClose={() => setShowAddMalfunction(false)} title="Aggiungi Avaria" /* onCllickButton={() => { setConfirmExecution(null);  }} buttonName='Conferma' */>
        <MalfunctionForm onConfirm={() => setShowAddMalfunction(false)} />
      </SciaModal>
    </SectionContainer>
  );
}
