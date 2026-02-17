import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import IconComponent from "@/components/atoms/IconComponent";
import ActivityMenu from "@/components/organisms/ActivityMenu";
import { Maintenance, statusStyleWindColor, statusStyleColor, maintenanceStatusIds } from "@/data/maintenences";
import { Link } from "expo-router";
import { checkReplacementsAvailability, formatISODate, getMaintenanceStatusAndTime, getNotesInfoFromLastExecution } from "./utils";
import { executionOutcomeColor } from "@/data/history";
import { levels } from "@/data/levels";

import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { classifications } from "@/data/classifications";
import { MacroSystemId, macroSystems } from "@/data/macroSystems";
import { selectReplacementMap } from "@/features/replacements/replacementsSlice";
import { Job } from "@/data/jobs";

export function generateDataForMaintenances(
  maintenances: Job[],
  showActivityMenu: string | null,
  setShowActivityMenu: (id: string | null) => void,
  onPlayPause : (maintenance : Job) => void,
): { content: React.ReactNode; styleWind?: string }[][] {
  const extraInfo = ""; // Parametro nascosto


  /* DA CAPIRE COME GESTIRE LO STORICO, FORSE NON SERVE PIU' E LEGGO BANALMENTE LE NOTE AUDIO VIDEO TESTUALI ASSOCIATE. */
  /* SE INVECE RIMANE LO STORICO, NECESSARIO DEFINIRE LA USESYNC IN MAINTENANCESVIEW, E CHIAMRE LE USESELECTOR FUORI DA QUI. */


  // const history = useSelector((state: RootState) => state.history);
  // const systems = useSelector((state: RootState) => state.systems);
  // const replacementsMap = useSelector(selectReplacementMap);

  return maintenances.map((maintenance) => {

    const paused = maintenance.status.name === "inPause";
    
    /* CON LO STORICO: */
    // const maintenanceHistory = history[maintenance.id];
    // const { hasImageNotes, hasAudioNotes, hasTextNotes, executionOutcome } = getNotesInfoFromLastExecution(maintenanceHistory);

    /* SENZA LO STORICO: */
    const hasImageNotes = maintenance.photographicNotes?.length > 0;
    const hasAudioNotes = maintenance.vocalNotes?.length > 0;
    const hasTextNotes = maintenance.textNotes?.length > 0;
    const executionOutcome = 'esitoOk';


    // const replacementsClassification = checkReplacementsAvailability(maintenance.replacements, replacementsMap);
    // const macroSystemId = systems[maintenance.systemId].macro;

    const { status, formattedTime } =
    
    getMaintenanceStatusAndTime(
      new Date(),
      new Date(maintenance.ending_date),
      maintenance.recurrencyType,
      maintenance.recurrency_type_id,  //recurrency_type.id = 5 ->  'Yearly' 
      paused && maintenance.pauseDate ? new Date(maintenance.pauseDate) : undefined  
    );

    // console.log(status)

    return [
      {
        content: (
          <View className="flex-row">
            <Link className="text-primary w-full" href={`./manutenzioni/${maintenance.id}?extraInfo=${encodeURIComponent(extraInfo)}`}>
              <View className="flex-row mr-space">
                <View className={`w-2 ${statusStyleWindColor[status]} -m-space`} style={statusStyleColor[status]}></View>
                <View className="ml-6 w-full">
                  <Text numberOfLines={1} className="text-primary font-bold mb-space">
                    {maintenance.job?.name}
                  </Text>
                  <View className="flex-row items-center">
                    {/* <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} /> */}
                    {/* <Text className="text-secondary ml-space">{systems[maintenance.systemId].fullName}</Text> */}
                    <Text className="text-secondary ml-space">{maintenance.Element.name}</Text>
                  </View>
                </View>
              </View>
            </Link>
          </View>
        ),
        styleWind: `flex-[3] ${paused ?  statusStyleWindColor["inPause"] : ""}`,
      },
      {
        content: (
          <View>
            <Text className="text-white font-bold mb-space">{maintenance.recurrencyType.name}</Text>
            <View className="flex-row items-center">
              {/* <IconComponent IconComponent={maintenance.IconComponentLevel} iconProps={maintenance.iconPropsLevel} /> */}
              {/* <IconComponent iconCollection={levels[maintenance.levelId].IconComponent.iconCollection} iconProps={levels[maintenance.levelId].IconComponent.iconProps} /> */}
              <IconComponent iconCollection={levels['1'].IconComponent.iconCollection} iconProps={levels['1'].IconComponent.iconProps} />
              {/* <Text className="text-[#67c2ae] ml-space">{levels[maintenance.levelId].label}</Text> */}
              <Text className="text-[#67c2ae] ml-space">{maintenance.job?.maintenance_list.maintenance_level.Level_MMI}</Text>
            </View>
          </View>
        ),
        styleWind: paused ? statusStyleWindColor["inPause"] : "",
      },
      {
        content: (
          <View className="flex-row items-center justify-center gap-4">
            <FontAwesome name="camera" color={hasImageNotes && executionOutcome ? executionOutcomeColor[executionOutcome] : "#fff"} size={24} style={{ opacity: hasImageNotes ? 1 : 0.2 }} />
            <FontAwesome name="microphone" color={hasAudioNotes && executionOutcome ? executionOutcomeColor[executionOutcome] : "#fff"} size={24} style={{ opacity: hasAudioNotes ? 1 : 0.2 }} />
            <MaterialCommunityIcons
              name="note-text"
              color={hasTextNotes && executionOutcome ? executionOutcomeColor[executionOutcome] : "#fff"}
              size={24}
              style={{ opacity: hasTextNotes ? 1 : 0.2 }}
            />
          </View>
        ),
        styleWind: paused ? statusStyleWindColor["inPause"] : "",
      },
      {
        content: (
          <View className="flex-row items-center">
            {executionOutcome && executionOutcome !== "esitoOk" && (
              <IconComponent iconCollection={classifications["ultimo_esito_negativo"].iconCollection} iconProps={classifications["ultimo_esito_negativo"].iconProps} />
            )}
            {/* {replacementsClassification && (
              <IconComponent iconCollection={classifications[replacementsClassification].iconCollection} iconProps={classifications[replacementsClassification].iconProps} />
            )} */}
          </View>
        ),
        styleWind: paused ? statusStyleWindColor["inPause"] : "",
      },
      {
        content: (
          <View className="flex" /*  style={{backgroundColor: statusStyleColor[status] }} */>
            <Text className="text-primary font-bold ">{formatISODate(maintenance.ending_date)}</Text>
            <Text className="text-secondary  ">{formattedTime}</Text>
          </View>
        ),
        // styleWind: statusStyleWindColor[status],
        style: statusStyleColor[status],
      },
      {
        content: (
          <ActivityMenu
            isActive={showActivityMenu === maintenance.id.toString()}
            activity={maintenance}
            activityType={"maintenance"}
            onPlayPause={() => onPlayPause(maintenance)}
            onOpen={() => setShowActivityMenu(maintenance.id.toString())}
            onClose={() => setShowActivityMenu(null)}
          />
        ),
        styleWind: `flex-[0.1] ${paused ? statusStyleWindColor["inPause"] : ""}`,
      },
    ];
  });
}
