import { View, Text, ImageSourcePropType } from "react-native";
import React, { useState } from "react";
import Button from "../atoms/Button";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import SciaModal from "../molecules/SciaModal";
import AudioNoteRecorder from "../molecules/AudioNoteRecorder";
import PhotoCapture from "../molecules/PhotoCapture";
import TextNoteInsert from "../molecules/TextNoteInsert";

type AddNotesProps = {
  onSave: (type: string, value: string) => void;
};
export default function AddNotes({ onSave }: AddNotesProps) {
  const notes = [
    { name: "camera", IconComponent: FontAwesome, iconProps: { name: "camera" }, label: "Nota fotografica" },
    { name: "audio", IconComponent: FontAwesome, iconProps: { name: "microphone" }, label: "Nota vocale" },
    { name: "text", IconComponent: MaterialCommunityIcons, iconProps: { name: "note-text" }, label: "Nota testuale" },
  ];
  const [note, setNote] = useState<string | null>(null);

  return (
    <View className="flex-1 w-full justify-center">
      <View className="flex flex-wrap flex-row justify-between ml-space xxl:ml-space-xxl">
        {/* Definizione dei tipi di nota in un array e mappatura per generare il contenuto */}
        {notes.map((note, index) => (
          <Button
            key={index}
            theme="defaultVertical"
            IconComponent={note.IconComponent}
            iconProps={note.iconProps}
            label={note.label}
            styleWindContainer="mr-space xxl:mr-space-xxl flex-1"
            onPress={() => setNote(note.name)}
          />
        ))}
      </View>

      <SciaModal visible={note === "audio"} onClose={() => setNote(null)} title={"Registra Nota Vocale"}>
        <AudioNoteRecorder
          onSave={(note) => {
            onSave("audio", note);
          }}
        />
      </SciaModal>

      <PhotoCapture visible={note === "camera"} onClose={() => setNote(null)} onSave={(photoUri) => onSave("image", photoUri)} />

      <SciaModal visible={note === "text"} onClose={() => setNote(null)} title={"Inserisci Nota Testuale"}>
        <TextNoteInsert
          onSave={(note) => {
            onSave("text", note);
          }}
        />
      </SciaModal>
    </View>
  );
}
