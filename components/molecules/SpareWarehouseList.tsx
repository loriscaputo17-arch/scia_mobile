import { View, Text } from "react-native";
import RemoteIcon from "@/components/atoms/RemoteIcon";
import { getWarehouseBreakdownFromSpare } from "@/app/utils/sparePartsUtils";
import { Replacement } from "@/data/replacements";

type SpareWarehouseListProps = {
  spare: Replacement;
  showQuantity?: boolean;
  styleWind?: string;
};

export default function SpareWarehouseList({ spare, showQuantity = true, styleWind }: SpareWarehouseListProps) {
  const breakdown = getWarehouseBreakdownFromSpare(spare);

  return Object.values(breakdown).map((entry, index) => (
    <View key={index} className={styleWind}/* className="mb-space xxl:mb-space-xxl" */>
      <View className="flex-row justify-between items-center">
        {/* Parte sinistra: icona + nome + ubicazioni */}
        <View className="flex-row items-center space-x-1">
          <RemoteIcon uri={entry.iconUrl} />
          <Text className="text-primary font-bold">{entry.warehouseName}</Text>
          <Text className="text-secondary">{`(${entry.locationNames.join(", ")})`}</Text>
        </View>

        {/* Parte destra: quantità */}
        {showQuantity && <Text className="text-primary font-bold">{`x${entry.total}`}</Text>}
      </View>
    </View>
  ));
}
