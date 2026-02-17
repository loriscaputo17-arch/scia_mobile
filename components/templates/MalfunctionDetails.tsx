import React, { useEffect, useState } from "react";
import Button from "../atoms/Button";
import { TouchableOpacity, View, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import SciaModal from "../molecules/SciaModal";
import TextNotesHistory from "../organisms/TextNotesHistory";
import AudioNotesHistory from "../organisms/AudioNotesHistory";
import ImageNotesHistory from "../organisms/ImageNotesHistory";
import ActivityInstructions from "../organisms/ActivityInstructions";
import { AudioNote, ImageNote, TextNote, type History } from "@/data/history";
import { instructions, type Instructions } from "@/data/instructions";
import { formatISODate, getLastNoteHistoryDetais } from "@/app/utils/utils";
import { useDispatch, useSelector } from "react-redux";
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
import { type Malfunction } from "@/data/malfunctions";
import { severities, SeverityId } from "@/data/severities";
import { addHistoryEntry } from "@/features/history/historySlice";
import { connectedUserID } from "@/data/connectedUserID";
import SectionHeader from "../atoms/SectionHeader";
import IconComponent from "../atoms/IconComponent";
import { MacroSystemId, macroSystems } from "@/data/macroSystems";
import { type Failure } from "@/data/failures";

type MalfunctionDetailsProps = {
  malfunction: Failure;
  // malfunctions: Malfunction[];
};

const knownFields = ["id", "name", "systemId", "date", "user", "severity", "description"];

export default function MalfunctionDetails({ malfunction }: MalfunctionDetailsProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showImageNotesHistory, setShowImageNotesHistory] = useState(false);
  const [showImageNotes, setShowImageNotes] = useState(false);
  const [showAudioNotes, setShowAudioNotes] = useState(false);
  const [showTextNotes, setShowTextNotes] = useState(false);

  const [imageNotes, setImageNotes] = useState<ImageNote[]>([]);
  const [textNotes, setTextNotes] = useState<TextNote[]>([]);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);

  const router = useRouter();
  const users = useSelector((state: RootState) => state.users.users);
  const history = useSelector((state: RootState) => state.history);
  const systems = useSelector((state: RootState) => state.systems);
  // const macroSystemId = systems[malfunction.systemId].macro;

  const dispatch = useDispatch();

  let activityInstructions: Instructions[keyof Instructions] = {
    text: "",
    images: [],
  };

  if (typeof malfunction.id === "string" && instructions[malfunction.id as keyof typeof instructions]) {
    activityInstructions = instructions[malfunction.id as keyof typeof instructions];
  }

  let activityHistory: History[keyof History] = [];

  if (typeof malfunction.id === "string" && history[malfunction.id as keyof typeof history]) {
    activityHistory = history[malfunction.id as keyof typeof history];
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
      /* Update History */
      const newHistoryEntry = {
        user: connectedUserID,
        imageNotes: imageNotes.length > 0 ? imageNotes : undefined,
        audioNotes: audioNotes.length > 0 ? audioNotes : undefined,
        textNotes: textNotes.length > 0 ? textNotes : undefined,
        executionDate: new Date().toISOString(),
      };

      dispatch(addHistoryEntry({ maintenanceId: malfunction.id, entry: newHistoryEntry }));

      setImageNotes([]);
      setAudioNotes([]);
      setTextNotes([]);
      router.push(`/dashboard/avarie?extraInfo=${encodeURIComponent("listId-avarie")}`);
    };

    showConfirmationAlert("Salvare le note?", "Una volta confermato, lo storico verra' aggiornato con le ultime note aggiunte.", proceedWithConfirmation);
  };

  const severity = severities[malfunction.gravity as SeverityId] ?? {
  label: "Gravità sconosciuta",
  styleColor: { backgroundColor: "#999" }, // Grigio neutro
};


  //da sostituire con dati veri:
  const replacementSystemID = "propulsione_diesel";
  const macroSystemId = systems[replacementSystemID].macro;

  return (
    <SectionContainer>
      {/* Header Section */}

      <SectionHeader
        leftContent={
          <>
            <Text className="text-primary text-xl font-bold">{malfunction.name}</Text>
            <View style={severity.styleColor} className="p-1 px-4 ml-space xxl:ml-space-xxl rounded-full">
              <Text className="text-primary">{severity.label}</Text>
            </View>
          </>
        }
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

            {/* <Button label="Torna alla lista" onPress={() => handleConfirmExecution()} styleWindContainer="bg-quaternary" theme="modal" /> */}
            <Button
              label="Salva Note"
              onPress={() => handleConfirmExecution()}
              styleWindContainer="bg-quaternary"
              theme="modal"
              disabled={imageNotes.length === 0 && audioNotes.length === 0 && textNotes.length === 0}
            />
          </>
        }
        rightContent={
          <>
            {/* Description Section */}
            <View className="mb-space xxl:mb-space-xxl">
              <Field label="Descrizione" value={malfunction.description || ""} />
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
                <TouchableOpacity className="flex-row justify-between" onPress={() => router.push(`/dashboard/impianti/${malfunction.systemId}`)}>
                  <View className="flex-row items-center">
                    <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} />
                    <Text className="text-primary font-bold ml-2">{systems[malfunction.systemId].fullName}</Text>
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

            {/* Date Section */}
            <Field label="Data di inserimento" value={formatISODate(malfunction.date, false)} />

            {/* Custom Fields */}

            {/*  {Object.entries(malfunction)
              .filter(([key]) => !knownFields.includes(key))
              .map(([key, value]) => (
                <Field key={key} label={key} value={value} />
              ))} */}

            {(() => {
              try {
                const customFields = JSON.parse(malfunction.customFields || "[]");

                return customFields.map((field: { name: string; value: string }) => <Field key={field.name} label={field.name} value={field.value} />);
              } catch (error) {
                console.error("Errore parsing customFields", error);
                return null;
              }
            })()}
          </>
        }
      />

      {/* ---- MODALS ----- */}

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
