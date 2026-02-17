import {  Alert, Text } from "react-native";
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import CustomTable from "@/components/organisms/CustomTable";
import Button from "@/components/atoms/Button";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import SciaModal from "@/components/molecules/SciaModal";
import SectionContainer from "../atoms/SectionContainer";
import SectionHeader from "../atoms/SectionHeader";
import CreateUbication from "../molecules/CreateUbication";
import { generateDataForUbications } from "@/utils/generateDataForUbications";
import { selectLocations } from "@/features/locations/locationsSlice";
import { useLocationsSync } from "@/hooks/useLocationsSync";
import LoadingScreen from "../atoms/LoadingScreen";
import { type Warehouse } from "@/data/warehouses";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { addLocation, AddLocationPayload } from "@/api/locations";

type UbicationsViewProps = {
  onToggleSection: () => void;
};

const columnsSetup = [
  { content: <Text className="font-bold opacity-[0.6]">Magazzino</Text>, styleWind: "flex-[3]" },
  { content: <Text className="font-bold opacity-[0.6]">Ubicazioni</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Ricambi</Text> },
  { content: <Text className="font-bold opacity-[0.6]">Azioni</Text>, styleWind: "flex-[0.9]" },
];

export default function UbicationsView({ onToggleSection }: UbicationsViewProps) {
  const [showCreateUbication, setShowCreateUbication] = useState(false);

  const { loading,  refresh } = useLocationsSync();
  const locations = useSelector(selectLocations);
  const userID = useSelector(selectCurrentUser)?.id;

  /* Da sostituire quando verranno implementate le API per ottenere la lista di warehouses, anziche' prenderle da locations */
  //const warehouses = useSelector(selectWarehouses);

  const uniqueWarehouses = useMemo(() => {
    const seen = new Map<string, Warehouse>();

    for (const loc of locations) {
      const info = loc.warehouseInfo;
      if (info && !seen.has(info.id.toString())) {
        seen.set(info.id.toString(), {
          id: info.id.toString(),
          name: info.name,
          icon_url: info.icon_url,
        });
      }
    }

    return Array.from(seen.values());
  }, [locations]);

  const handleAddlocation = async (warehouseId: string, ubication: string) => {
    if (!userID) return;

    try {
      const payload: AddLocationPayload = {
        warehouse: warehouseId,
        ship_id: "1",
        user_id: userID,
        location: ubication,
      };

      const res = await addLocation(payload);

      if (res && res.message === "Ubicazione creata con successo") {
        refresh();
      }
    } catch (error) {
      Alert.alert("Errore", "Impossibile aggiornare il profilo.");
      console.error("Errore aggiornamento profilo:", error);
    }
  };

  if (loading) return <LoadingScreen message="Caricamento delle ubicazioni..." />;

  return (
    <SectionContainer>
      {/* Header */}
      <SectionHeader
        leftContent={<Text className={`text-primary text-xl font-bold mb-space xxl:mb-space-xxl`}>{`Ubicazioni`}</Text>}
        rightContent={
          <>
            <Button label="Ricambi" onPress={onToggleSection} IconComponent={FontAwesome6} iconProps={{ name: "plug", color: "#fff" }} theme="default" />

            <Button
              label="Crea ubicazione"
              onPress={() => setShowCreateUbication(true)}
              IconComponent={AntDesign}
              iconProps={{ name: "pluscircle", color: "#fff" }}
              theme="default"
              styleWindContainer="bg-tertiary ml-space xxl:ml-space-xxl"
            />
          </>
        }
      />

      {/* Table */}
      <CustomTable columns={columnsSetup} data={generateDataForUbications(locations)} refresh={refresh} />

      {/* Modals */}

      <SciaModal visible={showCreateUbication} onClose={() => setShowCreateUbication(false)} title={"Crea ubicazione"}>
        <CreateUbication
          onConfirmUbication={(warehouseId, ubication) => {
            handleAddlocation(warehouseId, ubication);
            setShowCreateUbication(false);
          }}
          warehouses={uniqueWarehouses}
        />
      </SciaModal>

      {/* <SciaModal visible={showFilters} mode="panel-right" onClose={() => setShowFilters(false)} title={"Filtri"}>
        <ReplacementFilters
          filters={filters}
          activities={replacements}
          onConfirm={(filters) => {
            setShowFilters(false);
            handleFilters(filters);
          }}
        />
      </SciaModal> */}
    </SectionContainer>
  );
}
