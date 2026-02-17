import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { IconCollection } from "../atoms/IconComponent";
import FilterItem from "../molecules/FilterItem";
import {
  areAllReplacementsAvailable,
  filterActivitiesByField,
  filterActivitiesByNestedField,
  filterMaintenancesByStatuses,
  isAnyReplacementLowStock,
  isAnyReplacementOutOfStock,
} from "@/app/utils/utils";
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
// import { recurrences } from "@/data/recurrenceTresholds";
import { useSelector } from "react-redux";
import { selectReplacementMap } from "@/features/replacements/replacementsSlice";
import { Replacement } from "@/data/replacements";
import { getTotalQuantityFromString } from "@/app/utils/sparePartsUtils";

type ReplacementFiltersProps = {
  filters: string[];
  activities: Replacement[];
  onConfirm: (filters: string[]) => void;
};

export default function ReplacementFilters({ filters, activities, onConfirm }: ReplacementFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(filters);
  const replacementsMap = useSelector(selectReplacementMap);

  const replacementSuppliers = ["My Company Srl", "IJES ltd"];

  const { available, notAvailable } = activities.reduce(
    (acc, activity) => {
      const quantity = getTotalQuantityFromString(activity.quantity);
      if (quantity > 0) {
        acc.available += 1;
      } else {
        acc.notAvailable += 1;
      }
      return acc;
    },
    { available: 0, notAvailable: 0 }
  );

  const stockData = [
    { filterId: "stock-available", label: "In giacenza", count: available },
    { filterId: "stock-notAvailable", label: "Non disponibile", count: notAvailable },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prevFilters) => (prevFilters.includes(filterId) ? prevFilters.filter((id) => id !== filterId) : [...prevFilters, filterId]));
  };

  const isChecked = (filterId: string) => selectedFilters.includes(filterId);

  const supplierData = [
    { filterId: "supplierId-1", label: "My Company Srl", count: filterActivitiesByNestedField(activities, "elementModel.Supplier_Parts_ID", 1).length }, // 1 da aggionrare con l'ID giusto del supplier
    { filterId: "suupplierId-2", label: "IJES ltd", count: filterActivitiesByNestedField(activities, "elementModel.Supplier_Parts_ID", 2).length },
  ];

 
  const levelData = Object.keys(levels).map((levelId) => ({
    filterId: `wharehouseId-${levelId}`,
    label: levels[levelId as MaintenanceLevelId].label,
    count: activities.filter((replacement)=> replacement.warehouses.some((w) => w.id === levelId)).length,
    ...levels[levelId as MaintenanceLevelId].IconComponent,
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
      {renderFilterSection("Giacenza", stockData)}
      {renderFilterSection("Fornitore", supplierData)}
      {renderFilterSection("Magazzino", levelData)}
      <View className="h-40"></View>

      <Button theme="modal" label="Conferma" onPress={() => onConfirm(selectedFilters)} />
    </ScrollView>
  );
}
