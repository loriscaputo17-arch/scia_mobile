import React, { useState } from "react";
import { type Task } from "@/data/tasks";
import Button from "../atoms/Button";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import SciaModal from "../molecules/SciaModal";
import TextNotesHistory from "../organisms/TextNotesHistory";
import AudioNotesHistory from "../organisms/AudioNotesHistory";
import ImageNotesHistory from "../organisms/ImageNotesHistory";
import ActivityInstructions from "../organisms/ActivityInstructions";
import ConfirmExecution, { ConfirmExecutionData } from "./ConfirmExecution";
import { AudioNote, ImageNote, TextNote, type ExecutionOutcome, type History } from "@/data/history";
import { instructions, type Instructions } from "@/data/instructions";
import { getLastNoteHistoryDetais, getOutcomeTitle } from "@/app/utils/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "expo-router";
import ActivityDetailsExButtons from "../organisms/ActivityDetailsExButtons";
import SectionContainer from "../atoms/SectionContainer";
import SectionLayout from "../atoms/SectionLayout";
import ActivityDetailsPhotoNotesInfo from "../organisms/ActivityDetailsPhotoNotesInfo";
import ActivityDetailsAudioNotesInfo from "../organisms/ActivityDetailsAudioNotesInfo";
import ActivityDetailsTextNotesInfo from "../organisms/ActivityDetailsTextNotesInfo";
import AddNotes from "../organisms/AddNotes";
import { showConfirmationAlert } from "@/app/utils/showConfirmationAlert";

import { useConfirmTask } from "@/hooks/useConfirmTask";
import Field from "../atoms/Field";
import { teams } from "@/data/teams";
import SectionHeader from "../atoms/SectionHeader";
import IconComponent from "../atoms/IconComponent";
import { MacroSystemId, macroSystems } from "@/data/macroSystems";
import { type Job } from "@/data/jobs";

type TaskDetailsProps = {
  task: Job;
  tasks: Job[];
};

export default function TaskDetails({ task, tasks }: TaskDetailsProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showImageNotesHistory, setShowImageNotesHistory] = useState(false);
  const [showImageNotes, setShowImageNotes] = useState(false);
  const [showAudioNotes, setShowAudioNotes] = useState(false);
  const [showTextNotes, setShowTextNotes] = useState(false);
  const [showConfirmExecution, setShowConfirmExecution] = useState(false);
  const [confirmExecution, setConfirmExecution] = useState<ExecutionOutcome>("nonEseguito");

  const [imageNotes, setImageNotes] = useState<ImageNote[]>([]);
  const [textNotes, setTextNotes] = useState<TextNote[]>([]);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);

  const router = useRouter();
  const users = useSelector((state: RootState) => state.users.users);
  const systems = useSelector((state: RootState) => state.systems);
  // const macroSystemId = systems[task.systemId].macro;

  const history = useSelector((state: RootState) => state.history);

  // const { confirmTask } = useConfirmTask({ tasks });

  let activityInstructions: Instructions[keyof Instructions] = {
    text: "",
    images: [],
  };

  if (typeof task.id === "string" && instructions[task.id as keyof typeof instructions]) {
    activityInstructions = instructions[task.id as keyof typeof instructions];
  }

  let activityHistory: History[keyof History] = [];

  if (typeof task.id === "string" && history[task.id as keyof typeof history]) {
    activityHistory = history[task.id as keyof typeof history];
  }
  const { lastNote: lastImageNote, author: lastImageNoteUser, totalNotes: totalImageNotes, lastNoteHistoryEntry } = getLastNoteHistoryDetais("image", activityHistory);
  const { lastNote: lastAudioNote, author: lastAudioNoteUser } = getLastNoteHistoryDetais("audio", activityHistory);
  const { lastNote: lastTextNote, author: lastTextNoteUser } = getLastNoteHistoryDetais("text", activityHistory);

  const handleSaveNote = (type: string, value: string) => {
    switch (type) {
      case "text":
        setTextNotes((prevState) => [...prevState, { date: new Date().toISOString(), text: value }]);
        break;
      case "image":
        setImageNotes((prevState) => [...prevState, { date: new Date().toISOString(), imgSrc: value }]);
        break;
      case "audio":
        setAudioNotes((prevState) => [...prevState, { date: new Date().toISOString(), audioSrc: value }]);
        break;
      default:
        break;
    }
  };

  const handleConfirmExecution = (confirmData: ConfirmExecutionData) => {
    const proceedWithConfirmation = () => {
      // confirmTask(task, confirmData.user, confirmExecution, imageNotes, audioNotes, textNotes, confirmData.location, confirmData.executionTime);
      setImageNotes([]);
      setAudioNotes([]);
      setTextNotes([]);
      setShowConfirmExecution(false);
      router.push(`/dashboard/checklist?extraInfo=${encodeURIComponent(`listId-${task.recurrency_type_id}`)}`);
    };

    if (imageNotes.length === 0 && audioNotes.length === 0 && textNotes.length === 0) {
      showConfirmationAlert("Confermare esito?", "Non hai aggiunto nessuna nota.\nProcedere lo stesso? \nUna volta confermato non sara' piu' possibile allegare note.", proceedWithConfirmation);
    } else {
      showConfirmationAlert("Confermare esito?", "Una volta confermato non sara' piu' possibile modificare l'esito ne' allegare ulteriori note.", proceedWithConfirmation);
    }
  };

  //da sostituire con dati veri:
  const replacementSystemID = "propulsione_diesel";
  const macroSystemId = systems[replacementSystemID].macro;

  return (
    <SectionContainer>
      {/* Header Section */}
      <SectionHeader
        leftContent={<Text className="text-primary text-xl font-bold">{task.job?.name}</Text>}
        rightContent={
          <Button
            label="Aggiungi nota"
            onPress={() => setShowAddNote(true)}
            IconComponent={AntDesign}
            iconProps={{ name: "pluscircle", color: "#fff" }}
            theme="default"
            styleWindContainer="bg-tertiary"
          />
        }
      />

      <SectionLayout
        leftContent={
          <>
            {/* Photo Notes */}
            <ActivityDetailsPhotoNotesInfo
              onShowHistory={() => setShowImageNotesHistory(true)}
              onShowImageNotes={() => setShowImageNotes(true)}
              imageNote={lastImageNote as ImageNote}
              imageNoteUser={lastImageNoteUser}
              notesCounter={totalImageNotes}
              users={users}
            />

            {/* Audio Notes */}
            <ActivityDetailsAudioNotesInfo onShowHistory={() => setShowAudioNotes(true)} audioNote={lastAudioNote as AudioNote} audioNoteUser={lastAudioNoteUser} users={users} />

            {/* Text Notes */}

            <ActivityDetailsTextNotesInfo onShowHistory={() => setShowTextNotes(true)} textNote={lastTextNote as TextNote} textNoteUser={lastTextNoteUser} users={users} />

            {/* Execution Buttons */}
            <ActivityDetailsExButtons
              onPressEsitoOk={() => {
                setConfirmExecution("esitoOk");
                setShowConfirmExecution(true);
              }}
              onPressAnomalia={() => {
                setConfirmExecution("anomalia");
                setShowConfirmExecution(true);
              }}
              // disabled={task.check !== "nonEseguito"}
            />
          </>
        }
        rightContent={
          <>
            {/* Description Section */}
            <View className="mb-space xxl:mb-space-xxl">
              <Field label="Descrizione" value={task.job?.short_description || ""} />
              <Button
                label="Vedi istruzioni"
                onPress={() => setShowInstructions(activityInstructions.text || activityInstructions.images ? true : false)}
                styleWindContainer="bg-quaternary"
                theme="default"
              />
            </View>

            {/* Component Section */}
            {/* <Field
              label="Impianto/Componente"
              child={
                <TouchableOpacity className="flex-row justify-between" onPress={() => router.push(`/dashboard/impianti/${task.systemId}`)}>
                  <View className="flex-row items-center">
                    <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} />
                    <Text className="text-primary font-bold ml-2">{systems[task.systemId].fullName}</Text>
                  </View>
                  <IconComponent iconCollection="MaterialIcons" iconProps={{ name: "navigate-next", size: 26, color: "#fff" }} />
                </TouchableOpacity>
              }
            /> */}

            {/* Component Section */}
            <Field
              label="Impianto/Componente"
              child={
                <TouchableOpacity className="flex-row justify-between" onPress={() => router.push(`/dashboard/impianti/${replacementSystemID}`)}>
                  <View className="flex-row items-center">
                    <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} />
                    <Text className="text-primary font-bold ml-2">{systems[replacementSystemID].fullName}</Text>
                  </View>
                  <IconComponent iconCollection="MaterialIcons" iconProps={{ name: "navigate-next", size: 26, color: "#fff" }} />
                </TouchableOpacity>
              }
            />

            {/* Recurrence Section */}
            <Field label="Ricorrenza" value={task.recurrencyType.name} />

            {/* Team Section */}
            {/* <Field label="Squadra di assegnazione" value={teams.find((team) => team.id === task.team)?.label} /> */}
            <Field label="Squadra di assegnazione" value={teams.find((team) => team.id === task.job?.team_id)?.label} />

            {/* Execution Section */}
            <Field label="Esecuzione" value={task.job?.recurrency_days.toString()} />
          </>
        }
      />

      {/* ---- MODALS ----- */}

      {/*Conferma Esito  */}
      {/* <SciaModal
        visible={showConfirmExecution}
        onClose={() => setShowConfirmExecution(false)}
        title={getOutcomeTitle(confirmExecution)} 
        //onCllickButton={() => { setConfirmExecution(null);  }} buttonName='Conferma'
      >
        <ConfirmExecution
          activity={task}
          onConfirm={(confirmData) => {
            handleConfirmExecution(confirmData);
          }}
        />
      </SciaModal> */}

      {/* Modal: Aggiungi Nota  */}
      <SciaModal visible={showAddNote} onClose={() => setShowAddNote(false)} title={"Aggiungi Nota"} onCllickButton={() => setShowAddNote(false)} buttonName="Chiudi">
        <AddNotes onSave={(type, value) => handleSaveNote(type, value)} />
      </SciaModal>

      {/* Modal: Istruzioni  */}
      <SciaModal visible={showInstructions} onClose={() => setShowInstructions(false)} title={"Istruzioni"} onCllickButton={() => setShowInstructions(false)} buttonName="Chiudi">
        <ActivityInstructions text={activityInstructions.text} images={activityInstructions.images} />
      </SciaModal>

      {/* Modal: Note fotografiche  */}
      {/* reverse dell'array perche' mostro dall'ultimo(il piu' recente) al prima (il piu' vecchio) */}
      <SciaModal
        visible={showImageNotesHistory || showImageNotes}
        onClose={() => {
          setShowImageNotesHistory(false);
          setShowImageNotes(false);
        }}
        title={"Storico note fotografiche"}
        onCllickButton={() => {
          setShowImageNotesHistory(false);
          setShowImageNotes(false);
        }}
        buttonName="Chiudi"
      >
        <ImageNotesHistory history={activityHistory.slice().reverse()} historyEntry={showImageNotes ? lastNoteHistoryEntry : undefined} step={showImageNotes ? 1 : 0} users={users} />
      </SciaModal>

      {/* Modal: Note Vocali  */}
      <SciaModal visible={showAudioNotes} onClose={() => setShowAudioNotes(false)} title={"Storico note vocali"} onCllickButton={() => setShowAudioNotes(false)} buttonName="Chiudi">
        <AudioNotesHistory history={activityHistory.slice().reverse()} users={users} />
      </SciaModal>

      {/* Modal: Note testuali  */}
      <SciaModal visible={showTextNotes} onClose={() => setShowTextNotes(false)} title={"Storico note testuali"} onCllickButton={() => setShowTextNotes(false)} buttonName="Chiudi">
        <TextNotesHistory history={activityHistory.slice().reverse()} users={users} />
      </SciaModal>
    </SectionContainer>
  );
}
