import React, { useState } from "react";
import { type Task } from "@/data/tasks";
import Button from "../atoms/Button";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { statusStyleColor } from "@/data/maintenences";
import SciaModal from "../molecules/SciaModal";
import TextNotesHistory from "../organisms/TextNotesHistory";
import AudioNotesHistory from "../organisms/AudioNotesHistory";
import ImageNotesHistory from "../organisms/ImageNotesHistory";
import ActivityInstructions from "../organisms/ActivityInstructions";
import ConfirmExecution, { type ConfirmExecutionData } from "./ConfirmExecution";
import { AudioNote, ImageNote, TextNote, type ExecutionOutcome, type History } from "@/data/history";
import { instructions, type Instructions } from "@/data/instructions";
import { formatISODate, getLastNoteHistoryDetais, getMaintenanceStatusAndTime, getNextExpiryDate, getOutcomeTitle } from "@/app/utils/utils";
import { useDispatch, useSelector } from "react-redux";
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
import { useConfirmMaintenance } from "@/hooks/useConfirmMaintenance";
import Field from "../atoms/Field";
import { teams } from "@/data/teams";
import SectionHeader from "../atoms/SectionHeader";
import { MacroSystemId, macroSystems } from "@/data/macroSystems";
import IconComponent from "../atoms/IconComponent";
import AddNewReplacement from "../organisms/AddNewReplacement";
import ConfirmExecutionReplacements from "../organisms/ConfirmExecutionReplacements";
import { type Job } from "@/data/jobs";
import { breakpoints } from "@/constants/breakpoints";

type MaintenanceDetailsProps = {
  maintenance: Job;
  onPlayPause: (maintenance: Job) => Promise<void>;
};

export default function MaintenanceDetails({ maintenance, onPlayPause }: MaintenanceDetailsProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.md;
  const [showAddNote, setShowAddNote] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showImageNotesHistory, setShowImageNotesHistory] = useState(false);
  const [showImageNotes, setShowImageNotes] = useState(false);
  const [showAudioNotes, setShowAudioNotes] = useState(false);
  const [showTextNotes, setShowTextNotes] = useState(false);
  const [showConfirmExecution, setShowConfirmExecution] = useState(false);
  const [showAddnewReplacement, setShowAddnewReplacement] = useState(false);
  const [confirmExecution, setConfirmExecution] = useState<ExecutionOutcome>("esitoOk");

  const [imageNotes, setImageNotes] = useState<ImageNote[]>([]);
  const [textNotes, setTextNotes] = useState<TextNote[]>([]);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);

  const router = useRouter();
  const users = useSelector((state: RootState) => state.users.users);
  const systems = useSelector((state: RootState) => state.systems);
  // const macroSystemId = systems[maintenance.systemId].macro;
  const history = useSelector((state: RootState) => state.history);
  const { confirmMaintenance } = useConfirmMaintenance();
  const [replacementQuantityMap, setReplacementQuantityMap] = useState<{ [replacementId: string]: number }>({});

  let activityInstructions: Instructions[keyof Instructions] = {
    text: "",
    images: [],
  };

  if (typeof maintenance.id === "string" && instructions[maintenance.id as keyof typeof instructions]) {
    activityInstructions = instructions[maintenance.id as keyof typeof instructions];
  }

  let activityHistory: History[keyof History] = [];

  if (typeof maintenance.id === "string" && history[maintenance.id as keyof typeof history]) {
    activityHistory = history[maintenance.id as keyof typeof history];
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
      // confirmMaintenance(maintenance, confirmData.replacementQuantityMap, confirmData.user, confirmExecution, imageNotes, audioNotes, textNotes, confirmData.location, confirmData.executionTime);
      setImageNotes([]);
      setAudioNotes([]);
      setTextNotes([]);
      setShowConfirmExecution(false);
      router.push(`/dashboard/manutenzioni?extraInfo=${encodeURIComponent(`listId-${maintenance.recurrency_type_id.toString()}`)}`);
    };

    if (imageNotes.length === 0 && audioNotes.length === 0 && textNotes.length === 0) {
      showConfirmationAlert("Confermare esito?", "Non hai aggiunto nessuna nota.\nProcedere lo stesso? \nUna volta confermato non sara' piu' possibile allegare note.", proceedWithConfirmation);
    } else {
      showConfirmationAlert("Confermare esito?", "Una volta confermato non sara' piu' possibile modificare l'esito ne' allegare ulteriori note.", proceedWithConfirmation);
    }
  };

  const paused = maintenance.status.name === "inPause";

  const { status, statusDescription } = getMaintenanceStatusAndTime(
    new Date(),
    new Date(maintenance.ending_date),
    maintenance.recurrencyType,
    maintenance.recurrency_type_id, //recurrency_type.id = 5 ->  'Yearly'
    paused && maintenance.pauseDate ? new Date(maintenance.pauseDate) : undefined
  );

  //da sostituire con dati veri:
  const maintenacneReplacements = ["cinghia_di_distribuzione", "ricambio_n_2", "ricambio_n_3", "ricambio_n_4", "ricambio_n_5", "ricambio_n_6", "ricambio_n_7", "ricambio_n_8", "ricambio_n_9"];
  const replacementSystemID = "propulsione_diesel";
  const macroSystemId = systems[replacementSystemID].macro;

  return (
    <SectionContainer>
      {/* Header Section */}
      <SectionHeader
        styleWindLeft={isMobile ? "flex-1" : ""}
        leftContent={
          <View className={"md:flex-row md:items-center "}>
            <Text className="text-primary text-xl font-bold" numberOfLines={2}>{maintenance.job?.name} </Text>
            <View style={statusStyleColor[status]} className="p-1 px-4 mt-space md:mt-0 md:ml-space xxl:ml-space-xxl rounded-full self-start">
              <Text className="text-primary text-xs md:text-sm">{statusDescription}</Text>
            </View>
          </View>
        }
        rightContent={
          <View className="flex-row">
            <Button
              label={isMobile ? "" : (paused ? "Play" : "Pause")}
              onPress={() => onPlayPause(maintenance)}
              IconComponent={MaterialIcons}
              iconProps={{ name: paused ? "play-arrow" : "pause", color: "#fff", size: 24 }}
              theme="default"
              styleWindContainer="bg-secondary mr-space"
            />
            <Button
              label={isMobile ? "" : "Aggiungi nota"}
              onPress={() => setShowAddNote(true)}
              IconComponent={AntDesign}
              iconProps={{ name: "pluscircle", color: "#fff" }}
              theme="default"
              styleWindContainer="bg-tertiary"
            />
          </View>
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
              onPressNonEseguito={() => {
                setConfirmExecution("nonEseguito");
                setShowConfirmExecution(true);
              }}
              disabled={status === "scheduled" || status === "inPause"}
            />
          </>
        }
        rightContent={
          <>
            {/* Description Section */}
            <View className="mb-space xxl:mb-space-xxl">
              <Field label="Descrizione" value={maintenance.job?.short_description || ""} />
              <Button
                label="Vedi istruzioni"
                onPress={() => setShowInstructions(activityInstructions.text || activityInstructions.images ? true : false)}
                styleWindContainer="bg-quaternary"
                theme="default"
              />
            </View>

            {/* Replacements */}
            {/* {"replacements" in maintenance && ( */}
            {maintenacneReplacements && (
              <View className="mb-space xxl:mb-space-xxl">
                {/* <Text className="text-tertiary">Ricambi</Text> */}

                {/* View dei Replacements da definire */}
                {/* <Field
                  label="Ricambi"
                  child={<ConfirmExecutionReplacements replacements={maintenance.replacements} replacementQuantityMap={replacementQuantityMap} setReplacementQuantityMap={setReplacementQuantityMap} />}
                /> */}
                <Field
                  label="Ricambi"
                  child={<ConfirmExecutionReplacements replacements={maintenacneReplacements} replacementQuantityMap={replacementQuantityMap} setReplacementQuantityMap={setReplacementQuantityMap} />}
                />

                <View className="flex-row my-space xxl:my-space-xxl">
                  <Button
                    label="Aggiungi"
                    onPress={() => setShowAddnewReplacement(true)}
                    IconComponent={AntDesign}
                    iconProps={{ name: "pluscircle", color: "white", size: 20 }}
                    styleWindContainer="bg-quaternary mr-space"
                    theme="default"
                  />
                  <Button
                    label="Push&Buy"
                    onPress={() => alert("Push And Buy")}
                    IconComponent={MaterialIcons}
                    iconProps={{ name: "shopping-cart", color: "white", size: 20 }}
                    styleWindContainer="bg-tertiary"
                    theme="default"
                  />
                </View>
              </View>
            )}

            {/* Component Section */}
            {/* <Field
              label="Impianto/Componente"
              child={
                <TouchableOpacity className="flex-row justify-between" onPress={() => router.push(`/dashboard/impianti/${maintenance.systemId}`)}>
                  <View className="flex-row items-center">
                    <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} />
                    <Text className="text-primary font-bold ml-2">{systems[maintenance.systemId].fullName}</Text>
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
            <Field label="Ricorrenza" value={maintenance.recurrencyType.name} />

            {/* Team Section */}
            {/* <Field label="Squadra di assegnazione" value={teams.find((team) => team.id === maintenance.team)?.label} /> */}
            <Field label="Squadra di assegnazione" value={teams.find((team) => team.id === maintenance.job?.team_id)?.label} />

            {/* Execution Section */}
            <Field label="Esecuzione" value={maintenance.job?.recurrency_days.toString()} />
          </>
        }
      />

      {/* ---- MODALS ----- */}

      {/*Conferma Esito  */}
      {/* <SciaModal
        visible={showConfirmExecution}
        onClose={() => setShowConfirmExecution(false)}
        title={getOutcomeTitle(confirmExecution)} 
       
      >
        <ConfirmExecution
          activity={maintenance}
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

      {/* Modal: Aggiungi Ricambio  */}
      <SciaModal visible={showAddnewReplacement} onClose={() => setShowAddnewReplacement(false)} title={"Aggiungi ricambio"} onCllickButton={() => alert("aggiungi ricambio")} buttonName="Salva">
        <AddNewReplacement />
      </SciaModal>
    </SectionContainer>
  );
}
