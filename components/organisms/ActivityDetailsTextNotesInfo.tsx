import { View, Text, ScrollView } from "react-native";
import React from "react";
import Button from "../atoms/Button";
import { type TextNote } from "@/data/history";
import { formatISODate } from "@/app/utils/utils";
import { type Users } from "@/data/users";

type ActivityDetailsTextNotesInfoProps = {
  onShowHistory: () => void;
  textNote: TextNote | null;
  textNoteUser: string | null;
  users: Users;
};

export default function ActivityDetailsTextNotesInfo({ onShowHistory, textNote, textNoteUser, users }: ActivityDetailsTextNotesInfoProps) {
  const user = textNoteUser && users[textNoteUser];

  return (
    <View className="mb-space flex-1">
      <View className="flex-row justify-between mb-space">
        <Text className="text-tertiary">Note testuali</Text>
        <Button theme="noBackground" label="Vedi storico" onPress={onShowHistory} disabled={textNote === null} />
      </View>
      <View className="bg-primaryLighter p-space xxl:p-space-xxl rounded-md flex-1 my-space">
        <Text className="text-secondary mb-2 font-bold">{user ? `${user.firstName} ${user.lastName}` : "Nessuna nota testuale"} </Text>
        <ScrollView>
          <Text className="text-primary flex-1">{textNote && "text" in textNote && textNote.text}</Text>
        </ScrollView>
        <Text className="text-secondary text-xs mb-2 font-bold self-end">{`${textNote ? formatISODate(textNote.date) : formatISODate(new Date().toISOString())}`}</Text>
      </View>
    </View>
  );
}
