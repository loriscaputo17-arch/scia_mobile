import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import IconComponent from "@/components/atoms/IconComponent";
import ActivityMenu from "@/components/organisms/ActivityMenu";
import { Link } from "expo-router";
import { type Replacement } from "@/data/replacements";
import { type MacroSystemId, macroSystems } from "@/data/macroSystems";
// import { levels } from "@/data/levels";
import Button from "@/components/atoms/Button";
import SpareWarehouseList from "@/components/molecules/SpareWarehouseList";
import { getTotalQuantityFromString } from "./sparePartsUtils";
import { Systems } from "@/data/systems";

export function generateDataForReplacements(
  replacements: Replacement[],
  showActivityMenu: number | null,
  systems: Systems,
  onAddToCart: (replacementId: string) => void,
  setShowActivityMenu: (index: number | null) => void
  // cercaPerDenominazioneOPartNumber? : () => void,
): { content: React.ReactNode; styleWind?: string }[][] {

  const replacementSupplier = "My Company Srl"

  return replacements.map((replacement, index) => {
    const replacementSystemID = "propulsione_diesel"
    const macroSystemId = systems[replacementSystemID].macro;

    return [
      {
        content: (
          <View className="flex-row">
            <Link className="text-primary w-full" href={`./catalogo_ricambi/${replacement.ID}`}>
              <View className="flex-row mr-space">
                {/* <View className={`w-2 -m-space`} style={severities[replacement.severity].styleColor}></View> */}
                <View className="w-full">
                  <Text numberOfLines={1} className="text-primary font-bold mb-space">
                    {replacement.Part_name}
                  </Text>
                  <View className="flex-row items-center">
                    <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} />
                    <Text className="text-secondary ml-space">{systems[replacementSystemID].fullName}</Text>
                  </View>
                </View>
              </View>
            </Link>
          </View>
        ),
        styleWind: "flex-[2.5]",
      },
      {
        content: (
          <View className="flex-row items-center justify-center gap-4">
            <Text className="text-primary font-bold">{getTotalQuantityFromString(replacement.quantity)}</Text>
          </View>
        ),
        styleWind: "flex-[0.5]",
      },
      {
        content: (
          <View>
            <SpareWarehouseList spare={replacement} showQuantity={false}/>
            {/* <IconComponent iconCollection={levels[maintenance.levelId].IconComponent.iconCollection} iconProps={levels[maintenance.levelId].IconComponent.iconProps} />
              <Text className="text-[#67c2ae] ml-space">{levels[maintenance.levelId].label}</Text> */}
          </View>
        ),
        styleWind: "flex-[1.5]",
      },
      {
        content: (
          <View className="flex" /*  style={{backgroundColor: statusStyleColor[status] }} */>
            <Text className="text-primary font-bold ">{replacement.Serial_number}</Text>
            {/* replacement supplier */}
            <Text className="text-secondary">{replacementSupplier}</Text> 
          </View>
        ),
        styleWind: "flex-[1.5]",
      },

      {
        content: (
          <View>
            <View className="flex-row items-center">
              <Button
                theme="checkbutton"
                onPress={()=>onAddToCart(replacement.ID)}
                IconComponent={MaterialIcons}
                iconProps={{ name: "shopping-cart", color: "white", size: 28 }}
              />

              <Button theme="checkbutton" IconComponent={MaterialIcons} iconProps={{ name: "bolt", color: "white", size: 28 }} />
            </View>
          </View>
        ),
        styleWind: "flex-[0.9]",
      },

      {
        content: (
          <ActivityMenu activityType={"replacement"} isActive={showActivityMenu === index} activity={replacement} onOpen={() => setShowActivityMenu(index)} onClose={() => setShowActivityMenu(null)} />
        ),
        styleWind: "flex-[0.1]",
      },
    ];
  });
}
