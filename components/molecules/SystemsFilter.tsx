import { View, Text } from "react-native";
import React, { useState } from "react";
import Button from "../atoms/Button";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type SystemFiltersProps = {
  filters: string[]; // ['system-propulsione_diesel', 'system-propulsione_elettrica']
  onConfirm: (filter: string[]) => void;
  filterPrefix?: string;
  multiple?: boolean; // se false, permette solo la selezione singola
};

export default function SystemsFilter({ filterPrefix, filters, onConfirm, multiple = true }: SystemFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(filters);
  const systems = useSelector((state: RootState) => state.systems);

  const isChecked = (filterId: string) => selectedFilters.includes(filterId);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prevFilters) => {
      if (multiple) {
        return prevFilters.includes(filterId)
          ? prevFilters.filter((id) => id !== filterId) // Rimuove se già presente
          : [...prevFilters, filterId]; // Aggiunge se non presente
      } else {
        return prevFilters.includes(filterId) ? [] : [filterId]; // Se già selezionato lo deseleziona, altrimenti lo seleziona e deseleziona gli altri
      }
    });
  };

  return (
    <>
      <View className="flex-1">
        {Object.values(systems).map((system, index) => {
          const filterId = filterPrefix ? `${filterPrefix}-${system.id}` : `${system.id}`;
          return (
            <Button
              key={index}
              label={system.name}
              onPress={() => toggleFilter(filterId)}
              IconComponent={Ionicons}
              iconProps={{
                name: isChecked(filterId) ? "checkbox" : "square-outline",
                color: "#789FD6",
                size: 24,
              }}
              theme="justifyBetween"
            />
          );
        })}
      </View>
      <Button theme="modal" label="Conferma" onPress={() => onConfirm(selectedFilters)} />
    </>
  );
}
