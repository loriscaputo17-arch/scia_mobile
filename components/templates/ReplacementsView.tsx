import { Alert, Text } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { applyFilters } from "@/app/utils/utils";
import CustomTable from "@/components/organisms/CustomTable";
import Button from "@/components/atoms/Button";
import { AntDesign, FontAwesome5, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import SciaModal from "@/components/molecules/SciaModal";
import SectionContainer from "../atoms/SectionContainer";
import { router, useLocalSearchParams } from "expo-router";
import SectionHeader from "../atoms/SectionHeader";
import ReplacementFilters from "../organisms/ReplacementFilters";
import MoveOrAddReplacementSearch from "../organisms/MoveOrAddReplacement";
import QRScanner from "../molecules/QRScanner";
import InsertNewReplacement from "../organisms/InsertNewReplacement";
import MoveOrRestockReplacement from "../organisms/MoveOrRestockReplacement";
import { useReplacementsSync } from "@/hooks/useReplacementsSync";
import { generateDataForReplacements } from "@/utils/generateDataForReplacements";
import LoadingScreen from "../atoms/LoadingScreen";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { addProduct } from "@/api/cart";

type ReplacementsViewProps = {
  onToggleSection: () => void;
};

const columnsSetup = [
  { content: <Text className="font-bold opacity-[0.6]">Denominazione / ESWBS</Text>, styleWind: "flex-[2.5]" },
  { content: <Text className="font-bold opacity-[0.6]">Giacenza</Text>, styleWind: "flex-[0.5]" },
  { content: <Text className="font-bold opacity-[0.6]">Ubicazione</Text>, styleWind: "flex-[1.5]" },
  { content: <Text className="font-bold opacity-[0.6]">Part Number</Text>, styleWind: "flex-[1.5]" },
  { content: <Text className="font-bold opacity-[0.6]">Azioni</Text>, styleWind: "flex-[0.9]" },
  { content: <></>, styleWind: "flex-[0.1]" },
];

export default function ReplacementsView({ onToggleSection }: ReplacementsViewProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showMoveOrAddReplacement, setShowMoveOrAddReplacement] = useState(false);
  const [showMoveOrRestockReplacement, setShowMoveOrRestockReplacement] = useState(false);
  const [showInsertNewReplacement, setShowInsertNewReplacement] = useState(false);
  const [showActivityMenu, setShowActivityMenu] = useState<number | null>(null);
  const { extraInfo } = useLocalSearchParams();
  const [filters, setFilters] = useState<string[]>([]);

    const userID = useSelector(selectCurrentUser)?.id;
  const { loading, refresh } = useReplacementsSync();
  const systems = useSelector((state: RootState) => state.systems);

  const replacements = useSelector((state: RootState) => state.replacements);

  const filteredActivities = useMemo(() => {
    let filtered = replacements;

    // Raggruppa i filtri per tipo ES: { status: ["expired", "recentlyExpired"], recurrence: ["Settimanale"] }
    const groupedFilters = filters.reduce<Record<string, string[]>>((acc, filter) => {
      const [filterGroup, selectedFilter] = filter.split("-"); // ["status", 'expired'] , ["status", 'recentlyExpired']
      acc[filterGroup] = acc[filterGroup] ? [...acc[filterGroup], selectedFilter] : [selectedFilter];
      return acc;
    }, {});

    // Applica ogni gruppo di filtri in sequenza
    Object.keys(groupedFilters).forEach((filterGroup) => {
      filtered = applyFilters(filtered, filterGroup, groupedFilters[filterGroup], new Date(), undefined);
    });

    return filtered;
  }, [replacements, filters]);

  const handleFilters = (filters: string[]) => {
    setFilters(filters);
    alert(filters)
  };

  // const handleAddToCart = (replacement: Replacement, quantity: number) => {
  //   dispatch(addToCart({ replacement, cartQuantity: quantity }));
  //   router.push(`/dashboard/carrello`);
  // };

   const handleAddToCart = async (replacementId:string) => {
      if (!userID) return;
      try {
        const res = await addProduct({ spare_id: replacementId, user_id: userID, quantity: 1, status: "in_attesa" });
  
        if (res && res.message === "Prodotto aggiornato nel carrello") {
          router.push(`/dashboard/carrello`);
        }
      } catch (error) {
        Alert.alert("Errore", "Impossibile aggiornare la quantita'.");
        console.error("Errore aggiornamento quantita' prodotto nel carrello:", error);
      }
    };



  // Gestisce i filtri basati su extraInfo
  useEffect(() => {
    if (typeof extraInfo === "string" && extraInfo.trim() !== "") {
      const filtersArray = extraInfo.split(";").map((filter) => filter.trim());
      const newFilters = filtersArray.filter((filter) => !filter.startsWith("listId-"));
      setFilters(newFilters); // Aggiorna i filtri escludendo "listId-..."
    }
  }, [extraInfo]);

  if (loading) return <LoadingScreen message="Caricamento dei pezzi di ricambio..." />;

  return (
    <SectionContainer>
      {/* Header */}
      <SectionHeader
        leftContent={<Text className={`text-primary text-xl font-bold mb-space xxl:mb-space-xxl`}>{`Catalogo Ricambi (${replacements.length})`}</Text>}
        rightContent={
          <>
            <Button
              label="Sposta/Aggiungi"
              onPress={() => setShowMoveOrAddReplacement(true)}
              IconComponent={AntDesign} //
              iconProps={{ name: "plus", color: "#fff" }}
              theme="default"
            />

            <Button
              label="Ubicazioni"
              onPress={onToggleSection}
              IconComponent={MaterialIcons}
              iconProps={{ name: "flag", color: "#fff" }}
              theme="default"
              styleWindContainer="ml-space xxl:ml-space-xxl"
            />

            <Button
              label="ESWBS"
              onPress={() => console.log("ESWBS")}
              IconComponent={MaterialIcons}
              iconProps={{ name: "schema", color: "#fff" }}
              theme="default"
              styleWindContainer="bg-tertiary ml-space xxl:ml-space-xxl"
            />

            <Button
              label={`Filtri ${filters.length > 0 ? `(${filters.length})` : ""}`}
              onPress={() => setShowFilters(true)}
              IconComponent={MaterialIcons}
              iconProps={{ name: filters.length > 0 ? "filter-alt" : "filter-alt-off", color: "#fff" }}
              theme="default"
              styleWindContainer={`${filters.length > 0 ? "bg-tertiary" : ""} ml-space xxl:ml-space-xxl`}
            />
          </>
        }
      />

      {/* Table */}
      <CustomTable columns={columnsSetup} data={generateDataForReplacements(filteredActivities, showActivityMenu, systems, handleAddToCart, setShowActivityMenu)} refresh={refresh} />

      {/* Modals */}

      <SciaModal visible={showFilters} mode="panel-right" onClose={() => setShowFilters(false)} title={"Filtri"}>
        <ReplacementFilters
          filters={filters}
          activities={replacements}
          onConfirm={(filters) => {
            setShowFilters(false);
            handleFilters(filters);
          }}
        />
      </SciaModal>

      <SciaModal visible={showMoveOrAddReplacement} onClose={() => setShowMoveOrAddReplacement(false)} title={"Sposta o aggiungi ricambio"}>
        <MoveOrAddReplacementSearch
          onSearchESWBS={() => alert("search")}
          onSearchReplacement={(replacementId) => (replacementId ? setShowMoveOrRestockReplacement(true) : setShowInsertNewReplacement(true))}
        />
      </SciaModal>

      <SciaModal visible={showInsertNewReplacement} onClose={() => setShowInsertNewReplacement(false)} title={"Sposta o aggiungi ricambio"}>
        <InsertNewReplacement />
      </SciaModal>

      <SciaModal visible={showMoveOrRestockReplacement} onClose={() => setShowMoveOrRestockReplacement(false)} title={"Sposta o aggiungi ricambio"}>
        <MoveOrRestockReplacement />
      </SciaModal>
    </SectionContainer>
  );
}
