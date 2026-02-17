import { Text, View } from "react-native";
import IconComponent from "../atoms/IconComponent";
import { levels, MaintenanceLevelId } from "@/data/levels";
import { getWarehouseStockBreakdown } from "@/app/utils/sparePartsUtils";

// Importa la funzione util

type RenderSparePartStockInfoProps = {
  sparePartId: string;
  showQuantity?: boolean;
};

export function RenderSparePartStockInfo({ sparePartId, showQuantity = false }: RenderSparePartStockInfoProps) {
  const breakdown = getWarehouseStockBreakdown(sparePartId);

  return Object.values(breakdown).map((entry, index) => (
    <View key={index} className="mb-space xxl:mb-space-xxl">
      <View className="flex-row justify-between items-center">
        {/* Parte sinistra: icona + nome + locations */}
        <View className="flex-row items-center space-x-1">
          <IconComponent
            iconCollection={levels[entry.warehouseId as MaintenanceLevelId].IconComponent.iconCollection}
            iconProps={levels[entry.warehouseId as MaintenanceLevelId].IconComponent.iconProps}
          />
          <Text className="text-primary font-bold">{entry.warehouseName}</Text>
          <Text className="text-secondary">{`(${entry.locationNames.join(", ")})`}</Text>
        </View>

        {/* Parte destra: quantità */}
        {showQuantity && <Text className="text-primary font-bold">{`x${entry.total}`}</Text>}
      </View>
    </View>
  ));
}
