import { View, Text, ScrollView } from "react-native";
import React from "react";
import { type HistoryEntry } from "@/data/history";
import { formatISODate } from "@/app/utils/utils";
import { type Users } from "@/data/users";

type TextNotesHistoryProps = {
  history: HistoryEntry[];
  users: Users;
};

export default function TextNotesHistory({ history, users }: TextNotesHistoryProps) {
  return (
    <ScrollView>
      {history.map((h, index) => {
        const user = users[h.user];
        if (h.textNotes)
          return (
            <View key={user.id + index} className="mb-6">
              {h.textNotes.map((textNote, textIndex) => (
                <View className="bg-primaryLighter p-space xxl:p-space-xxl rounded-md mb-space" key={textIndex}>
                  <Text className="text-secondary mb-2 font-bold">{user ? `${user.firstName} ${user.lastName}` : "Utente Sconosciuto"}</Text>
                  <Text className="text-primary mb-2">{textNote.text}</Text>
                  <Text className="text-secondary text-xs mb-2 font-bold self-end">{formatISODate(textNote.date)}</Text>
                </View>
              ))}
            </View>
          );
      })}
    </ScrollView>
  );
}
