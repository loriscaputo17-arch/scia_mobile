import { View, Text, Image } from "react-native";
import React from "react";
import Button from "../atoms/Button";
import { type ImageNote } from "@/data/history";
import { formatISODate } from "@/app/utils/utils";
import { type Users } from "@/data/users";
import { MaterialIcons } from "@expo/vector-icons";
import { getImageSource } from "@/app/utils/getImageSource";

type ActivityDetailsPhotoNotesInfoProps = {
  onShowHistory: () => void;
  onShowImageNotes: () => void;
  imageNote: ImageNote | null;
  notesCounter: number;
  imageNoteUser: string | null;
  users: Users;
};

export default function ActivityDetailsPhotoNotesInfo({ onShowHistory, onShowImageNotes, imageNote, notesCounter, imageNoteUser, users }: ActivityDetailsPhotoNotesInfoProps) {
  const user = imageNoteUser && users[imageNoteUser];
  return (
    <View className="mb-space xxl:mb-space-xxl">
      <View className="flex-row justify-between">
        <Text className="text-tertiary">Note fotografiche</Text>
        <Button theme="noBackground" label="Vedi storico" onPress={onShowHistory} disabled={imageNote === null} />
      </View>
      <View className="flex-row items-center justify-between my-space">
        <View className="flex-row items-center">
          <View className="relative">
            <Image source={getImageSource(imageNote && "imgSrc" in imageNote ? imageNote.imgSrc : require("@/assets/images/icon.png"))} className="w-16 h-16 rounded-md" />
            <View className="absolute top-1 right-1 bg-white rounded-full w-8 h-8 justify-center items-center">
              <Text className="text-black text-lg font-bold">{notesCounter}</Text>
            </View>
          </View>
          <View className="ml-2">
            <Text className="text-primary text-base font-bold">{user ? `${user.firstName} ${user.lastName}` : "Nessuna nota fotografica"} </Text>
            <Text className="text-secondary font-bold">{`${imageNote ? formatISODate(imageNote.date) : formatISODate(new Date().toISOString())}`}</Text>
          </View>
        </View>
        <Button theme="noBackground" IconComponent={MaterialIcons} iconProps={{ name: "navigate-next", color: "white", size: 26 }} onPress={onShowImageNotes} disabled={imageNote === null} />
      </View>
    </View>
  );
}
