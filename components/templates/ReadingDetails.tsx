import React, { useEffect, useState } from "react";
import Button from "../atoms/Button";
import { TouchableOpacity, View, Text } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SciaModal from "../molecules/SciaModal";
import TextNotesHistory from "../organisms/TextNotesHistory";
import AudioNotesHistory from "../organisms/AudioNotesHistory";
import ImageNotesHistory from "../organisms/ImageNotesHistory";
import ActivityInstructions from "../organisms/ActivityInstructions";
import { AudioNote, ImageNote, TextNote, type History } from "@/data/history";
import { instructions, type Instructions } from "@/data/instructions";
import { getLastNoteHistoryDetais } from "@/app/utils/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "expo-router";
import SectionContainer from "../atoms/SectionContainer";
import SectionLayout from "../atoms/SectionLayout";
import ActivityDetailsPhotoNotesInfo from "../organisms/ActivityDetailsPhotoNotesInfo";
import ActivityDetailsAudioNotesInfo from "../organisms/ActivityDetailsAudioNotesInfo";
import ActivityDetailsTextNotesInfo from "../organisms/ActivityDetailsTextNotesInfo";
import AddNotes from "../organisms/AddNotes";
import { showConfirmationAlert } from "@/app/utils/showConfirmationAlert";
import Field from "../atoms/Field";
import { type Reading } from "@/data/readings";
import Calculator from "../molecules/Calculator";
import TextInputField from "../atoms/TextInputField";
import { connectedUserID } from "@/data/connectedUserID";
import { useConfirmReading } from "@/hooks/useConfirmReading";
import { teams } from "@/data/teams";
import SectionHeader from "../atoms/SectionHeader";
import { MacroSystemId, macroSystems } from "@/data/macroSystems";
import IconComponent from "../atoms/IconComponent";

type ReadingDetailsProps = {
  reading: Reading;
  readings: Reading[];
};

export default function ReadingDetails({ reading, readings }: ReadingDetailsProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [showEditLtValue, setShowEditLtValue] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showImageNotesHistory, setShowImageNotesHistory] = useState(false);
  const [showImageNotes, setShowImageNotes] = useState(false);
  const [showAudioNotes, setShowAudioNotes] = useState(false);
  const [showTextNotes, setShowTextNotes] = useState(false);

  const [ltValue, setLtValue] = useState<number | undefined>(undefined);
  const [imageNotes, setImageNotes] = useState<ImageNote[]>([]);
  const [textNotes, setTextNotes] = useState<TextNote[]>([]);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);

  const router = useRouter();
  const users = useSelector((state: RootState) => state.users.users);
  const history = useSelector((state: RootState) => state.history);
  const systems = useSelector((state: RootState) => state.systems);
  // const macroSystemId = systems[reading.systemId].macro;

  const { confirmReading } = useConfirmReading({ readings });

  useEffect(() => {
    setLtValue(Number(reading.value));
  }, []);

  let activityInstructions: Instructions[keyof Instructions] = {
    text: "",
    images: [],
  };

  if (typeof reading.id === "string" && instructions[reading.id as keyof typeof instructions]) {
    activityInstructions = instructions[reading.id as keyof typeof instructions];
  }

  let activityHistory: History[keyof History] = [];

  if (typeof reading.id === "string" && history[reading.id as keyof typeof history]) {
    activityHistory = history[reading.id as keyof typeof history];
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

  const handleConfirmExecution = () => {
    const proceedWithConfirmation = () => {
      if (ltValue) {
        confirmReading(reading, connectedUserID, "esitoOk", imageNotes, audioNotes, textNotes, ltValue);
        setImageNotes([]);
        setAudioNotes([]);
        setTextNotes([]);
        router.push(`/dashboard/letture?extraInfo=${encodeURIComponent(`listId-${reading.reading_type}`)}`);
      }
    };

    if (imageNotes.length === 0 && audioNotes.length === 0 && textNotes.length === 0) {
      showConfirmationAlert("Confermare lettura?", "Non hai aggiunto nessuna nota.\nProcedere lo stesso? \nUna volta confermato non sara' piu' possibile allegare note.", proceedWithConfirmation);
    } else {
      showConfirmationAlert("Confermare lettura?", "Una volta confermato non sara' piu' possibile modificare l'esito ne' allegare ulteriori note.", proceedWithConfirmation);
    }
  };

    //da sostituire con dati veri:
  const maintenacneReplacements = ["cinghia_di_distribuzione", "ricambio_n_2", "ricambio_n_3", "ricambio_n_4", "ricambio_n_5", "ricambio_n_6", "ricambio_n_7", "ricambio_n_8", "ricambio_n_9"];
  const replacementSystemID = "propulsione_diesel";
  const macroSystemId = systems[replacementSystemID].macro;

  return (
    <SectionContainer>
      {/* Header Section */}

      <SectionHeader
        leftContent={<Text className="text-primary text-xl font-bold">{reading.task_name}</Text>}
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
            <TouchableOpacity onPress={() => setShowEditLtValue(true)} /* disabled={reading.check === 'programmato'} */>
              <TextInputField
                label="Valore"
                // value={reading.value?.toString() || undefined} // Mostra il valore attuale
                value={ltValue?.toString()} // Mostra il valore attuale
                editable={false} // Disabilita la tastiera
                pointerEvents="none"
              />
            </TouchableOpacity>

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

            {/* <Button label="Torna alla lista" onPress={() => handleConfirmExecution()} styleWindContainer="bg-quaternary" theme="modal" /> */}
            <Button
              label="Conferma lettura"
              onPress={() => handleConfirmExecution()}
              styleWindContainer="bg-quaternary"
              theme="modal"
              disabled={ltValue === undefined || ltValue === Number(reading.value)}
            />
          </>
        }
        rightContent={
          <>
            {/* Description Section */}
            <View className="mb-space xxl:mb-space-xxl">
              <Field label="Descrizione" value={reading.description || ""} />
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
                <TouchableOpacity className="flex-row justify-between" onPress={() => router.push(`/dashboard/impianti/${reading.systemId}`)}>
                  <View className="flex-row items-center">
                    <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} />
                    <Text className="text-primary font-bold ml-2">{systems[reading.systemId].fullName}</Text>
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
            <Field label="Ricorrenza" value={reading.recurrence} />

            {/* Team Section */}
            <Field label="Squadra di assegnazione" value={teams.find((team) => team.id === reading.team)?.label} />

            {/* Execution Section */}
            <Field label="Esecuzione" value={reading.recurrence} />
          </>
        }
      />

      {/* ---- MODALS ----- */}

      {/* Modal Edit Lt Value */}

      <SciaModal visible={showEditLtValue} onClose={() => setShowEditLtValue(false)} title={"Inserisci valore"} buttonName="Conferma">
        <Calculator
          label={"Lt"}
          onConfirm={(value) => {
            setShowEditLtValue(false);
            setLtValue(value);
            // handleUpdateLtValue(value);
          }}
        />
      </SciaModal>

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
