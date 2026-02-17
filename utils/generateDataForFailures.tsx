import { View, Text } from "react-native";
import { FontAwesome, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import IconComponent from "@/components/atoms/IconComponent";
import ActivityMenu from "@/components/organisms/ActivityMenu";
import { Link } from "expo-router";

import { executionOutcomeColor } from "@/data/history";
import { formatISODate, getMaintenanceStatusAndTime, getNotesInfoFromLastExecution } from "./utils";

import { type Failure } from "@/data/failures";
import { statusStyleColor } from "@/data/maintenences";
import { severities, SeverityId } from "@/data/severities";
import { type MacroSystemId, macroSystems } from "@/data/macroSystems";
// import {  resetValueReadingsByListId, updateReading } from "@/features/failures/readingsSlice";
// import { malfuctions } from "@/data/failures";

export function generateDataForFailures(
  failures: Failure[],
  showActivityMenu: number | null,
  setShowActivityMenu: (index: number | null) => void
): { content: React.ReactNode; styleWind?: string }[][] {
  /* DA CAPIRE COME GESTIRE LO STORICO, FORSE NON SERVE PIU' E LEGGO BANALMENTE LE NOTE AUDIO VIDEO TESTUALI ASSOCIATE. */
  /* SE INVECE RIMANE LO STORICO, NECESSARIO DEFINIRE LA USESYNC IN FAILURESVIEW, E CHIAMRE LE USESELECTOR FUORI DA QUI. */

  // const history = useSelector((state: RootState) => state.history);
  // const systems = useSelector((state: RootState) => state.systems);

  return failures.map((failure, index) => {
    /* CON LO STORICO: */
    // const maintenanceHistory = history[failure.id];
    // const { hasImageNotes, hasAudioNotes, hasTextNotes } = getNotesInfoFromLastExecution(maintenanceHistory);

    /* SENZA LO STORICO: */
    const hasImageNotes = failure.photographicNotes?.length > 0;
    const hasAudioNotes = failure.vocalNotes?.length > 0;
    const hasTextNotes = failure.textNotes?.length > 0;

    // const macroSystemId = systems[failure.systemId].macro;

    return [
      {
        content: (
          <View className="flex-row">
            <Link className="text-primary w-full" href={`./avarie/${failure.id}`}>
              <View className="flex-row mr-space">
                <View className={`w-2 -m-space`} style={severities[failure.gravity as SeverityId]?.styleColor ?? { backgroundColor: "#ccc" }}></View>
                <View className="ml-6 w-full">
                  <Text numberOfLines={1} className="text-primary font-bold mb-space">
                    {failure.title}
                  </Text>
                  <View className="flex-row items-center">
                    {/* <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} /> 
                    <Text className="text-secondary ml-space">{systems[failure.systemId].fullName}</Text> */}
                  </View>
                </View>
              </View>
            </Link>
          </View>
        ),
        styleWind: "flex-[3]",
      },
      {
        content: (
          <View className="flex-row items-center justify-center gap-4">
            <FontAwesome name="camera" color={"#fff"} size={24} style={{ opacity: hasImageNotes ? 1 : 0.2 }} />
            <FontAwesome name="microphone" color={"#fff"} size={24} style={{ opacity: hasAudioNotes ? 1 : 0.2 }} />
            <MaterialCommunityIcons name="note-text" color={"#fff"} size={24} style={{ opacity: hasTextNotes ? 1 : 0.2 }} />
          </View>
        ),
      },
      { content: <Text className="text-primary font-bold">{`${failure.userExecutionData ? failure.userExecutionData.first_name + ' ' + failure.userExecutionData?.last_name : ''}`}</Text> },
      {
        content: (
          <View className="flex" /*  style={{backgroundColor: statusStyleColor[status] }} */>
            <Text className="text-primary font-bold ">{formatISODate(failure.date, false)}</Text>
            {/* <Text className="text-secondary  ">{formattedTime}</Text> */}
          </View>
        ),
        // styleWind: statusStyleWindColor[status],
        style: severities[failure.gravity as SeverityId]?.styleColor ?? { backgroundColor: "#ccc" },
      },
      {
        content: <ActivityMenu activityType={"failure"} isActive={showActivityMenu === index} activity={failure} onOpen={() => setShowActivityMenu(index)} onClose={() => setShowActivityMenu(null)} />,
        styleWind: "flex-[0.1]",
      },
    ];
  });
}
