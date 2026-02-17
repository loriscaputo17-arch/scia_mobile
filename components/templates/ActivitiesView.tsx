import { View, Text, Pressable } from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { applyFilters, sortMaintenancesByExpiry } from "@/utils/utils";
import CustomTable from "@/components/organisms/CustomTable";
import Button from "@/components/atoms/Button";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SciaModal from "@/components/molecules/SciaModal";
import ActivityLists from "@/components/organisms/ActivityLists";
import SectionContainer from "../atoms/SectionContainer";
import { useLocalSearchParams } from "expo-router";
import { type Maintenance } from "@/data/maintenences";
import { type Task } from "@/data/tasks";
import MaintenanceFilters from "../organisms/MaintenanceFilters";
import ChecklistFilters from "../organisms/ChecklistFilters";
import { type ActivityType } from "@/data/activityLists";
import SectionHeader from "../atoms/SectionHeader";
import MalfunctionForm from "../organisms/MalfunctionForm";
import { selectReplacementMap } from "@/features/replacements/replacementsSlice";


type ActivitiesViewProps = {
  listIdDefault: string;
  activityType: ActivityType;
  generateDataFunction: (data: any[], showActivityMenu: any, setShowActivityMenu: any) => any;
  columnsSetup: () => any[];
};

export default function ActivitiesView({ listIdDefault, activityType, generateDataFunction, columnsSetup }: ActivitiesViewProps) {
  const [showActivityLists, setShowActivityLists] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityMenu, setShowActivityMenu] = useState<number | null>(null);
  const [showAddMalfunction, setShowAddMalfunction] = useState(false);
  const { extraInfo } = useLocalSearchParams(); // ES: "status-expired;system-propulsione_diesel"
  const [listId, setListId] = useState<string>(listIdDefault);
  const [filters, setFilters] = useState<string[]>([]);
  const activityLists = useSelector((state: RootState) => state.activityLists);
  const selectedActivityIds = activityLists[listId]?.activities ?? [];
  const replacementsMap = activityType === "maintenance" ? useSelector(selectReplacementMap) : undefined;
  
  const activities = useSelector((state: RootState) => {
    if (activityType === "checklist") return state.tasks;
    else if (activityType === "maintenance") return sortMaintenancesByExpiry(state.maintenances);
    else if (activityType === "reading") return state.readings;
    else if (activityType === "malfunction") return state.malfunctions; // if (activityType === "malfunction")
    else return state.replacements; // if (activityType === "replacement")
  });

  // Filtra le attività (Task[] , Maintenance[] ..) per la lista selezionata
  // activities sono tutte le attivita' esistenti di un certo tipo (manutenzione, task, reading)
  // vengono qui filtrate in base alla lista selezionata (es. ordinarie, annuali, straordinare..).
  // in particolare selectedActivityIds sono gli id delle attivita' che fanno parte della lista selezionata.

  const selectedActivities = useMemo(() => {
    return activities.filter((a) => selectedActivityIds.includes(a.id));
  }, [listId, activities, selectedActivityIds]);

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
      filtered = applyFilters(filtered, filterGroup, groupedFilters[filterGroup], new Date(),  replacementsMap );
    });

    return filtered;
  }, [listId, selectedActivityIds, selectedActivities, filters]);

  // Filtra le liste in base al tipo di attività
  const filteredLists = useMemo(() => {
    return Object.values(activityLists).filter((activityList) => activityList.type === activityType);
  }, [activityLists, activityType]);

  // Per sapere se la lista e' unica (es: avarie) o e' possibile selezionarne molteplici
  const isSingleListForType = useMemo(() => {
    return Object.values(activityLists).filter((list) => list.type === activityType).length === 1;
  }, [activityLists, activityType]);

  // Gestisce la selezione delle liste
  const handleSelectList = useCallback((listId: string) => {
    setListId(listId);
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
        setListId(listIdValue);
        handleSelectList(listIdValue);
      }

      setFilters(newFilters); // Aggiorna i filtri escludendo "listId-..."
    }
  }, [extraInfo]);


  return (
    <SectionContainer>
      {/* Header */}
      <SectionHeader
        leftContent={
          <Pressable className="flex-row" onPress={() => setShowActivityLists(true)} disabled={isSingleListForType}>
            <Text
              className={`text-primary text-xl ${activityType !== "malfunction" && "underline"} font-bold mb-space xxl:mb-space-xxl`}
            >{`${activityLists[listId]?.listName} (${selectedActivities.length})`}</Text>
            {!isSingleListForType && <MaterialIcons name="keyboard-arrow-down" color="#fff" size={26} />}
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
              disabled={activityType !== "maintenance" && activityType !== "checklist"}
              styleWindContainer={`${filters.length > 0 ? "bg-tertiary" : ""} ${activityType === "malfunction" && "mr-space"} `}
            />
            {activityType === "malfunction" && (
              <Button
                label="Aggiungi avaria"
                onPress={() => setShowAddMalfunction(true)}
                IconComponent={AntDesign}
                iconProps={{ name: "pluscircle", color: "#fff" }}
                theme="default"
                styleWindContainer="bg-tertiary"
              />
            )}
          </>
        }
      />

      {/* Table */}
      <CustomTable columns={columns} data={generateDataFunction(filteredActivities, showActivityMenu, setShowActivityMenu)} />

      {/* Modals */}

      <SciaModal visible={showFilters} mode="panel-right" onClose={() => setShowFilters(false)} title={"Filtri"}>
        {activityType === "maintenance" ? (
          <MaintenanceFilters
            filters={filters}
            activities={selectedActivities as Maintenance[]}
            onConfirm={(filters) => {
              setShowFilters(false);
              handleFilters(filters);
            }}
          />
        ) : (
          <ChecklistFilters
            filters={filters}
            activities={selectedActivities as Task[]}
            onConfirm={(filters) => {
              setShowFilters(false);
              handleFilters(filters);
            }}
          />
        )}
      </SciaModal>

      <SciaModal visible={showActivityLists} onClose={() => setShowActivityLists(false)} title={"Seleziona Attività"} onCllickButton={() => setShowActivityLists(false)} buttonName="Conferma">
        <View className="flex-1">
          <ActivityLists activityLists={filteredLists} onSelectList={handleSelectList} selectedList={activityLists[listId]} activities={activities} />
        </View>
      </SciaModal>

      <SciaModal visible={showAddMalfunction} onClose={() => setShowAddMalfunction(false)} title="Aggiungi Avaria" /* onCllickButton={() => { setConfirmExecution(null);  }} buttonName='Conferma' */>
        <MalfunctionForm onConfirm={() => setShowAddMalfunction(false)} />
      </SciaModal>
    </SectionContainer>
  );
}
