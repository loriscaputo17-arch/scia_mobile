import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import CustomTable from "./CustomTable";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { isSystem } from "@/app/utils/utils";
import { usePathname, useRouter } from "expo-router";
import { selectReplacementMap } from "@/features/replacements/replacementsSlice";

const columns = [{ content: <Text className="font-bold opacity-[0.6]">Impianto/Ricambio</Text> }];

export default function ScansHistory({ onSelect }: { onSelect: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const scans = useSelector((state: RootState) => state.scans);
  const systems = useSelector((state: RootState) => state.systems);
   const replacements = useSelector(selectReplacementMap);

  const data = scans.slice().reverse().map((scan) => {
    const item = systems[scan] ? systems[scan] : replacements[scan];
    return [
      {
        content: (
          // <Link className="text-primary" href={`./impianti/${id}`} ></Link>
          <TouchableOpacity
            className="flex-1 flex-col bg-secondary ml-space xxl:ml-space-xxl rounded-md"
            onPress={() => {
              if (pathname !== `/dashboard/impianti/${scan}`) {
                router.push(`/dashboard/impianti/${scan}`);
              }
              onSelect();
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-primary text-lg">Motore centrale</Text>
                <View className="flex flex-row items-center">
                  <MaterialCommunityIcons name="engine" color={"#9ca3af"} size={16} />
                  <Text className="text-secondary ml-2" numberOfLines={1}>
                    {isSystem(item) ? `${item.fullName} - S/N ${item.serialNumber} - Ore moto: ${item.motionHours}` : `${item.name} - P/N ${item.partNumber} - ${item.magazine} (${item.location})`}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="navigate-next" color="#fff" size={24} />
            </View>
          </TouchableOpacity>
        ),
      },
    ];
  });

  return (
    <View className="flex-1">
      <View className="bg-primary">
        <CustomTable columns={columns} data={data} />
      </View>
    </View>
  );
}
