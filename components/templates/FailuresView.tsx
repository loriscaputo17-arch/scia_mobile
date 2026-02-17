import { View, Text } from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import CustomTable from "@/components/organisms/CustomTable";
import Button from "@/components/atoms/Button";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SciaModal from "@/components/molecules/SciaModal";
import SectionContainer from "../atoms/SectionContainer";
import { useLocalSearchParams } from "expo-router";
import SectionHeader from "../atoms/SectionHeader";
import MalfunctionForm from "../organisms/MalfunctionForm";
import { selectFailures } from "@/features/failures/failuresSlice";
import { useFailuresSync } from "@/hooks/useFailuresSync";
import LoadingScreen from "../atoms/LoadingScreen";
import { generateDataForFailures } from "@/app/utils/generateDataForFailures";
import FailuresFilters from "../organisms/FailuresFilters";
import { applyFilters } from "@/app/utils/utils";

type FailuresViewProps = {
  columnsSetup: () => any[];
};

export default function FailuresView({columnsSetup }: FailuresViewProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityMenu, setShowActivityMenu] = useState<number | null>(null);
  const [showAddMalfunction, setShowAddMalfunction] = useState(false);
  const { extraInfo } = useLocalSearchParams(); // ES: "status-expired;system-propulsione_diesel"
  const [filters, setFilters] = useState<string[]>([]);

  const { loading, refresh } = useFailuresSync();
  const failures = useSelector(selectFailures);

  const filteredFailures = useMemo(() => {
    let filtered = failures;

    // Raggruppa i filtri per tipo ES: { status: ["expired", "recentlyExpired"], recurrence: ["Settimanale"] }
    const groupedFilters = filters.reduce<Record<string, string[]>>((acc, filter) => {
      const [filterGroup, selectedFilter] = filter.split("-"); // ["status", 'expired'] , ["status", 'recentlyExpired']
      acc[filterGroup] = acc[filterGroup] ? [...acc[filterGroup], selectedFilter] : [selectedFilter];
      return acc;
    }, {});

    // Applica ogni gruppo di filtri in sequenza
    Object.keys(groupedFilters).forEach((filterGroup) => {
      filtered = applyFilters(filtered, filterGroup, groupedFilters[filterGroup], new Date() );
    });

    return filtered;
  }, [failures, filters]);

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
      const newFilters = filtersArray.filter((filter) => !filter.startsWith("listId-"));
      setFilters(newFilters); // Aggiorna i filtri escludendo "listId-..."
    }
  }, [extraInfo]);

  if (loading) return <LoadingScreen message="Caricamento delle avarie..." />;

  return (
    <SectionContainer>
      {/* Header */}
      <SectionHeader
        leftContent={
          <View className="flex-row">
            <Text className="text-primary text-xl font-bold mb-space xxl:mb-space-xxl">{`Avarie (${failures.length})`}</Text>
          </View>
        }
        rightContent={
          <>
            <Button
              label={`Filtri ${filters.length > 0 ? `(${filters.length})` : ""}`}
              onPress={() => setShowFilters(true)}
              IconComponent={MaterialIcons}
              iconProps={{ name: filters.length > 0 ? "filter-alt" : "filter-alt-off", color: "#fff" }}
              theme="default"
              styleWindContainer={`mr-space ${filters.length > 0 ? "bg-tertiary" : ""}`}
            />
            <Button
              label="Aggiungi avaria"
              onPress={() => setShowAddMalfunction(true)}
              IconComponent={AntDesign}
              iconProps={{ name: "pluscircle", color: "#fff" }}
              theme="default"
              styleWindContainer="bg-tertiary"
            />
          </>
        }
      />

      {/* Table */}
      <CustomTable columns={columns} data={generateDataForFailures(filteredFailures, showActivityMenu, setShowActivityMenu)} refresh={refresh}/>

      {/* Modals */}

      <SciaModal visible={showFilters} mode="panel-right" onClose={() => setShowFilters(false)} title={"Filtri"}>
          <FailuresFilters
            filters={filters}
            activities={failures}
            onConfirm={(filters) => {
              setShowFilters(false);
              handleFilters(filters);
            }}
          />
      </SciaModal>

      <SciaModal visible={showAddMalfunction} onClose={() => setShowAddMalfunction(false)} title="Aggiungi Avaria" /* onCllickButton={() => { setConfirmExecution(null);  }} buttonName='Conferma' */>
        <MalfunctionForm onConfirm={() => setShowAddMalfunction(false)} />
      </SciaModal>
    </SectionContainer>
  );
}
