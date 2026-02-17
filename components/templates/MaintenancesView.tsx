import { View, Text, Pressable, Alert } from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { applyFilters, sortMaintenancesByExpiry, updateJobPlayPause } from "@/utils/utils";
import CustomTable from "@/components/organisms/CustomTable";
import Button from "@/components/atoms/Button";
import { MaterialIcons } from "@expo/vector-icons";
import SciaModal from "@/components/molecules/SciaModal";
// import ActivityLists from "@/components/organisms/ActivityLists";
import SectionContainer from "../atoms/SectionContainer";
import { useLocalSearchParams } from "expo-router";
import MaintenanceFilters from "../organisms/MaintenanceFilters";
// import { type ActivityType } from "@/data/activityLists";
import SectionHeader from "../atoms/SectionHeader";
import MalfunctionForm from "../organisms/MalfunctionForm";
import { selectReplacementMap } from "@/features/replacements/replacementsSlice";
import { Job } from "@/data/jobs";
import { useMaintenancesSync } from "@/hooks/useMaintenancesSync";
import { selectMaintenances } from "@/features/maintenances/maintenanceSlice";
import { selectCurrentUser } from "@/features/auth/authSlice";
import LoadingScreen from "../atoms/LoadingScreen";
import MaintenanceLists from "../organisms/MaintenanceLists";
import { generateDataForMaintenances } from "@/utils/generateDataForMaintenances";
import { updateStatus } from "@/api/maintenance";

type MaintenancesViewProps = {
  // listIdDefault: string;
  // activityType: ActivityType;
  // generateDataFunction: (data: any[], showActivityMenu: any, setShowActivityMenu: any) => any;
  columnsSetup: () => any[];
};

export default function MaintenancesView({ /* listIdDefault, activityType, generateDataFunction,  */ columnsSetup }: MaintenancesViewProps) {
  const [showActivityLists, setShowActivityLists] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityMenu, setShowActivityMenu] = useState<string | null>(null);
  const { extraInfo } = useLocalSearchParams(); // ES: "status-expired;system-propulsione_diesel"
  const [filters, setFilters] = useState<string[]>([]);

  const replacementsMap = useSelector(selectReplacementMap);
  const [typeId, setTypeId] = useState<string | undefined>(undefined);
  const [typeTitle, setTypeTitle] = useState<string>("Tutti");
  const { loading, refresh } = useMaintenancesSync(typeId);
  const maintenances = useSelector(selectMaintenances);

  const sortedMaintenances = sortMaintenancesByExpiry(maintenances);

  const filteredMaintenances = useMemo(() => {
    let filtered = sortedMaintenances;

    // // Raggruppa i filtri per tipo ES: { status: ["expired", "recentlyExpired"], recurrence: ["Settimanale"] }
    const groupedFilters = filters.reduce<Record<string, string[]>>((acc, filter) => {
      const [filterGroup, selectedFilter] = filter.split("-"); // ["status", 'expired'] , ["status", 'recentlyExpired']
      acc[filterGroup] = acc[filterGroup] ? [...acc[filterGroup], selectedFilter] : [selectedFilter];
      return acc;
    }, {});

    // Applica ogni gruppo di filtri in sequenza
    Object.keys(groupedFilters).forEach((filterGroup) => {
      filtered = applyFilters(filtered, filterGroup, groupedFilters[filterGroup], new Date(), replacementsMap);
    });

    return filtered;
  }, [typeId, sortedMaintenances, filters]);

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

  const handlePlayPause = async (maintenance: Job) => {
    updateJobPlayPause(maintenance, refresh);
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
        // handleSelectList(listIdValue);
      }

      setFilters(newFilters); // Aggiorna i filtri escludendo "listId-..."
    }
  }, [extraInfo]);

  if (loading) return <LoadingScreen message="Caricamento delle manutenzioni..." />;

  return (
    <SectionContainer>
      {/* Header */}
      <SectionHeader
        leftContent={
          <Pressable className="flex-row" onPress={() => setShowActivityLists(true)}>
            <Text className={`text-primary text-xl underline font-bold mb-space xxl:mb-space-xxl`}>{`${typeTitle} (${sortedMaintenances.length})`}</Text>
            <MaterialIcons name="keyboard-arrow-down" color="#fff" size={26} />
          </Pressable>
        }
        rightContent={
          <Button
            label={`Filtri ${filters.length > 0 ? `(${filters.length})` : ""}`}
            onPress={() => setShowFilters(true)}
            IconComponent={MaterialIcons}
            iconProps={{ name: filters.length > 0 ? "filter-alt" : "filter-alt-off", color: "#fff" }}
            theme="default"
            styleWindContainer={`${filters.length > 0 ? "bg-tertiary" : ""}`}
          />
        }
      />

      {/* Table */}
      <CustomTable columns={columns} data={generateDataForMaintenances(filteredMaintenances, showActivityMenu, setShowActivityMenu, handlePlayPause)} refresh={refresh} />

      {/* Modals */}

      <SciaModal visible={showFilters} mode="panel-right" onClose={() => setShowFilters(false)} title={"Filtri"}>
        <MaintenanceFilters
          filters={filters}
          activities={sortedMaintenances}
          onConfirm={(filters) => {
            setShowFilters(false);
            handleFilters(filters);
          }}
        />
      </SciaModal>

      <SciaModal visible={showActivityLists} onClose={() => setShowActivityLists(false)} title={"Seleziona Attività"} onCllickButton={() => setShowActivityLists(false)} buttonName="Conferma">
        <View className="flex-1">
          <MaintenanceLists
            selectedTypeId={typeId}
            onSelectType={(newTypeId, newTypeTitle) => {
              setTypeId(newTypeId);
              setTypeTitle(newTypeTitle);
            }}
          />
        </View>
      </SciaModal>
    </SectionContainer>
  );
}
