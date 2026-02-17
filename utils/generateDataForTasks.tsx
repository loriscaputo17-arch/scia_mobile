import { View, Text } from "react-native";
import { FontAwesome, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import IconComponent from "@/components/atoms/IconComponent";
import ActivityMenu from "@/components/organisms/ActivityMenu";
import { type Task } from "@/data/tasks";
import { Link } from "expo-router";

import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { executionOutcomeColor } from "@/data/history";
import { getMaintenanceStatusAndTime, getNotesInfoFromLastExecution } from "./utils";
import { connectedUserID } from "@/data/connectedUserID";
import { useDispatch } from "react-redux";
// import { resetCheckTasksByListId } from "@/features/tasks/tasksSlice";
import { ExecutionOutcome } from "@/data/history";
import Button from "@/components/atoms/Button";
import { Checklist } from "@/data/activityLists";
import { useEffect, useState } from "react";
import { showConfirmationAlert } from "./showConfirmationAlert";
import { useConfirmTask } from "@/hooks/useConfirmTask";
import { type MacroSystemId, macroSystems } from "@/data/macroSystems";
import { type Job } from "@/data/jobs";

export function generateDataForTasks(
  tasks: Job[], //
  showActivityMenu: number | null, //
  setShowActivityMenu: (index: number | null) => void
): { content: React.ReactNode; styleWind?: string }[][] {
  const extraInfo = ""; // Parametro nascosto

  /* DA CAPIRE COME GESTIRE LO STORICO, FORSE NON SERVE PIU' E LEGGO BANALMENTE LE NOTE AUDIO VIDEO TESTUALI ASSOCIATE. */
  /* SE INVECE RIMANE LO STORICO, NECESSARIO DEFINIRE LA USESYNC IN MAINTENANCESVIEW, E CHIAMRE LE USESELECTOR FUORI DA QUI. */

  // const history = useSelector((state: RootState) => state.history);
  // const systems = useSelector((state: RootState) => state.systems);

  // const listIdDefault = "daily_maintenance";
  // const checkList = useSelector((state: RootState) => state.activityLists)[listIdDefault];
  // const checklistExpiryDate = (checkList as Checklist).listExpiryDate;
  // const checklistRecurrence = (checkList as Checklist).recurrence;

  // const { status } = getMaintenanceStatusAndTime(new Date(), new Date(checklistExpiryDate), checklistRecurrence);
  // const [checkListCompleted, setCheckListCompleted] = useState(false);
  // const { confirmTask } = useConfirmTask({ tasks });

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   //reset di tutti i check quando la checklist si riattiva.
  //   if (status !== "scheduled" && checkListCompleted) {
  //     dispatch(resetCheckTasksByListId(checkList.listId));
  //   }
  //   setCheckListCompleted(status === "scheduled");
  // }, [status]);

  const handleConfirmExecution = (task: Job, executionOutcome: ExecutionOutcome) => {
    // showConfirmationAlert("Confermare esito?", "Confermando l'esito, non verra' aggiunta alcuna nota o dettaglio relativo all'esecuzione di questo task.", () => {
    //   confirmTask(task, connectedUserID, executionOutcome, [], [], []);
    // });
  };

  /* status della checklist -> programmato, nonEseguito .. */
  const status = "scheduled";

  return tasks.map((task, index) => {
    /* CON LO STORICO: */
    // const maintenanceHistory = history[task.id];
    // const { hasImageNotes, hasAudioNotes, hasTextNotes, executionOutcome } = getNotesInfoFromLastExecution(maintenanceHistory);

    /* SENZA LO STORICO: */
    const hasImageNotes = task.photographicNotes?.length > 0;
    const hasAudioNotes = task.vocalNotes?.length > 0;
    const hasTextNotes = task.textNotes?.length > 0;
    const executionOutcome = "esitoOk";
    const taskCheck: ExecutionOutcome = "esitoOk";

    // const macroSystemId = systems[task.systemId].macro;

    return [
      {
        content: (
          <View className="flex-row">
            <Link className="text-primary w-full" href={`./checklist/${task.id}?extraInfo=${encodeURIComponent(extraInfo)}`}>
              <View className="ml-6 w-full">
                <Text numberOfLines={1} className="text-primary font-bold mb-space">
                  {task.job.name}
                </Text>
                <View className="flex-row items-center">
                  {/* <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} /> */}
                  {/* <Text className="text-secondary ml-space">{systems[task.systemId].fullName}</Text> */}
                  <Text className="text-secondary">{task.Element.name}</Text>
                </View>
              </View>
            </Link>
          </View>
        ),
        styleWind: "flex-[3]",
      },
      // { content: <Text className="text-white">{task.recurrence2}</Text> },
      { content: <Text className="text-white">{task.recurrencyType.name}</Text> },
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
      },
      {
        content: (
          <Button
            theme="checkbutton"
            onPress={() => handleConfirmExecution(task, "anomalia")}
            IconComponent={AntDesign}
            // iconProps={{ name: task.check === "anomalia" ? "closesquare" : "closesquareo", color: "white", size: 28 }}
            // disabled={task.check !== "nonEseguito" || status === "scheduled"}
            // @ts-ignore

            iconProps={{ name: taskCheck === "anomalia" ? "closesquare" : "closesquareo", color: "white", size: 28 }}
            // @ts-ignore
            disabled={taskCheck !== "nonEseguito" || status === "scheduled"}
          />
        ),
        // styleWind: `items-center  ${task.check === "anomalia" ? "bg-customOrange" : "bg-secondary"}`,
        // @ts-ignore
        styleWind: `items-center  ${taskCheck === "anomalia" ? "bg-customOrange" : "bg-secondary"}`,
      },
      {
        content: (
          <Button
            theme="checkbutton"
            onPress={() => handleConfirmExecution(task, "esitoOk")}
            IconComponent={AntDesign}
            // iconProps={{ name: task.check === "esitoOk" ? "checksquare" : "checksquareo", color: "white", size: 28 }}
            // disabled={task.check !== "nonEseguito" || status === "scheduled"}
            // @ts-ignore
            iconProps={{ name: taskCheck === "esitoOk" ? "checksquare" : "checksquareo", color: "white", size: 28 }}
            // @ts-ignore

            disabled={taskCheck !== "nonEseguito" || status === "scheduled"}
          />
        ),
        // styleWind: `items-center ${task.check === "esitoOk" ? "bg-customGreen" : "bg-secondary"}`,

        // @ts-ignore

        styleWind: `items-center ${taskCheck === "esitoOk" ? "bg-customGreen" : "bg-secondary"}`,
      },
      {
        content: <ActivityMenu activityType={"task"} isActive={showActivityMenu === index} activity={task} onOpen={() => setShowActivityMenu(index)} onClose={() => setShowActivityMenu(null)} />,
        styleWind: "flex-[0.1]",
      },
    ];
  });
}
