import { View, Text, Image } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { getImageSource } from "./getImageSource";
import QuantitySelector from "@/components/atoms/QuantitySelector";
import Button from "@/components/atoms/Button";
import { type Location } from "@/data/locations";
import RemoteIcon from "@/components/atoms/RemoteIcon";

export function generateDataForUbications(
  locations: Location[],
): { content: React.ReactNode; styleWind?: string }[][] {
  return locations.map((location) => {
    return [
      {
        content: (
          <View className="flex-row items-center m-space xxl:m-space-xxl ">
            <RemoteIcon uri={location.warehouseInfo?.icon_url}/>
            <Text className="text-white font-bold ml-space xxl:ml-space-xxl">{location.warehouseInfo?.name}</Text>
          </View>
        ),
        styleWind: `flex-[3]`,
      },
      {
        content: (
          <View className="flex-row items-center">
            <Text className="text-white font-bold">{location.location}</Text>
          </View>
        ),
      },
      {
        content: (
          <View className="flex-row items-center">
            <Text className="text-white font-bold">{location.spare_count}</Text>
          </View>
        ),
      },
      {
        content: (
          <View className="flex-row items-center justify-center">
            <Button theme="noBackground" IconComponent={MaterialIcons} iconProps={{ name: "print", size: 24, color: "white" }} />
          </View>
        ),
        styleWind: "flex-[0.9]",
      },
    ];
  });
}
