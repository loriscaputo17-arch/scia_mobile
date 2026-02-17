import { View, Text } from "react-native";
import { FontAwesome, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import IconComponent from "@/components/atoms/IconComponent";
import ActivityMenu from "@/components/organisms/ActivityMenu";
import { Link } from "expo-router";

import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { executionOutcomeColor } from "@/data/history";
import { getMaintenanceStatusAndTime, getNotesInfoFromLastExecution } from "./utils";
import { useDispatch } from "react-redux";
import { ExecutionOutcome } from "@/data/history";
import { ReadingList } from "@/data/activityLists";
import { useEffect, useState } from "react";
import { type Reading } from "@/data/readings";
// import { resetValueReadingsByListId, updateReading } from "@/features/readings/readingsSlice";
import { type MacroSystemId, macroSystems } from "@/data/macroSystems";

const tagColors = [
  "bg-[#d6b4fc]", // viola chiaro
  "bg-[#f4a4cc]", // rosa
  "bg-[#b2e0ff]", // azzurro
  "bg-[#c0f2c2]", // verde chiaro
  "bg-[#ffe6a7]", // giallo chiaro
  "bg-[#ffb8b8]", // rosso chiaro
];

const tags = ["Ore di moto", "Tag custom"];

export function generateDataForReadings(
  readings: Reading[],
  showActivityMenu: number | null,
  setShowActivityMenu: (index: number | null) => void
): { content: React.ReactNode; styleWind?: string }[][] {
  /* DA CAPIRE COME GESTIRE LO STORICO, FORSE NON SERVE PIU' E LEGGO BANALMENTE LE NOTE AUDIO VIDEO TESTUALI ASSOCIATE. */
  /* SE INVECE RIMANE LO STORICO, NECESSARIO DEFINIRE LA USESYNC IN FAILURESVIEW, E CHIAMRE LE USESELECTOR FUORI DA QUI. */

  // const history = useSelector((state: RootState) => state.history);
  // const systems = useSelector((state: RootState) => state.systems);

  // const readingList = useSelector((state: RootState) => state.activityLists)[listIdDefault];
  // const readingListExpiryDate = (readingList as ReadingList).listExpiryDate;
  // const readingListRecurrence = (readingList as ReadingList).recurrence;

  // const { status } = getMaintenanceStatusAndTime(new Date(), new Date(readingListExpiryDate), readingListRecurrence);
  // const [readingListCompleted, setReadingListCompleted] = useState(false);

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   //reset di tutti i valori quando la lista letture si riattiva.
  //   if (status !== "scheduled" && readingListCompleted) {
  //     dispatch(resetValueReadingsByListId(readingList.listId));
  //   }
  //   setReadingListCompleted(status === "scheduled");
  // }, [status]);

  return readings.map((reading, index) => {
    /* CON LO STORICO: */
    // const maintenanceHistory = history[reading.id];
    // const { hasImageNotes, hasAudioNotes, hasTextNotes } = getNotesInfoFromLastExecution(maintenanceHistory);

    /* SENZA LO STORICO: */
    const hasImageNotes = reading.photographicNotes?.length > 0;
    const hasAudioNotes = reading.vocalNotes?.length > 0;
    const hasTextNotes = reading.textNotes?.length > 0;

    //  const macroSystemId = systems[reading.systemId].macro;

    return [
      {
        content: (
          <View className="flex-row">
            <Link className="text-primary w-full" href={`./letture/${reading.id}`}>
              <View className="ml-6 w-full">
                {/* Riga con titolo + tag */}
                <View className="flex-row items-center mb-space">
                  <Text numberOfLines={1} className="text-primary font-bold mr-2">
                    {reading.task_name}
                  </Text>
                  {/* TAGS DINAMICI */}
                  {reading.tags?.map((tag, index) => {
                    const colorClass = tagColors[index % tagColors.length]; // ciclo

                    return (
                      <View key={index} className={`px-2 py-1 rounded-full mr-2 ${colorClass}`}>
                        <Text className="text-black text-xs font-semibold">{tag}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Riga con icona + fullName */}
                <View className="flex-row items-center">
                  {/* <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} /> */}
                  {/* <Text className="text-secondary ml-space">{systems[reading.systemId].fullName}</Text> */}
                  <Text className="text-secondary ml-space">{reading.element.name}</Text>
                </View>
              </View>
            </Link>
          </View>
        ),
        styleWind: "flex-[3]",
      },

      { content: <Text className="text-white">{`${reading.recurrence}gg`}</Text> },
      {
        content: (
          <View className="flex-row items-center justify-center gap-4">
            <FontAwesome name="camera" color={"#fff"} size={24} style={{ opacity: hasImageNotes ? 1 : 0.2 }} />
            <FontAwesome name="microphone" color={"#fff"} size={24} style={{ opacity: hasAudioNotes ? 1 : 0.2 }} />
            <MaterialCommunityIcons name="note-text" color={"#fff"} size={24} style={{ opacity: hasTextNotes ? 1 : 0.2 }} />
          </View>
        ),
      },
      {
        content: (
          <View className="flex-row items-center justify-between">
            <Text className="text-primary">Lt</Text>
            {/* <Text className="text-primary text-xl font-bold flex-1 text-center">{(reading.value ?? 0).toFixed(2)}</Text> */}
            <Text className="text-primary text-xl font-bold flex-1 text-center">{reading.value}</Text>
          </View>
        ),
        styleWind: `${!!reading.value && reading.value !== "0" && "bg-customGreen"}`,
      },
      {
        content: <ActivityMenu activityType={"reading"} isActive={showActivityMenu === index} activity={reading} onOpen={() => setShowActivityMenu(index)} onClose={() => setShowActivityMenu(null)} />,
        styleWind: "flex-[0.1]",
      },
    ];
  });
}
