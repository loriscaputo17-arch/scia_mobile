import { View, Text, Image } from "react-native";
import React from "react";
import Button from "../atoms/Button";
import { type AudioNote } from "@/data/history";
import { formatISODate } from "@/app/utils/utils";
import { type Users } from "@/data/users";
import { MaterialIcons } from "@expo/vector-icons";
import AudioPlayer from "../molecules/AudioPlayer";
import { getImageSource } from "@/app/utils/getImageSource";
import { ranks } from "@/data/ranks";
import { useSelector } from "react-redux";
import { selectRankById, selectRanks } from "@/features/ranks/ranksSlice";

type ActivityDetailsAudioNotesInfoProps = {
  onShowHistory: () => void;
  audioNote: AudioNote | null;
  audioNoteUser: string | null;
  users: Users;
};

export default function ActivityDetailsAudioNotesInfo({ onShowHistory, audioNote, audioNoteUser, users }: ActivityDetailsAudioNotesInfoProps) {

  const user = audioNoteUser && users[audioNoteUser];
  const userRank = user && user.rank && useSelector(selectRankById(user.rank));
  const imageSrc = userRank ? userRank.distintivo_controspallina : user ? user.profileImage : require("@/assets/images/icon.png");
  
  // const userData = audioNoteUser ? users[audioNoteUser] : null;
  // const imageSrc = userData?.rank ? ranks[userData.rankID].image : userData?.profileImg || require("@/assets/images/icon.png");

  return (
    <View className="mb-space">
      <View className="flex-row justify-between">
        <Text className="text-tertiary">Note vocali</Text>
        <Button theme="noBackground" label="Vedi storico" onPress={onShowHistory} disabled={audioNote === null} />
      </View>
      <View className="flex-row items-center my-space">
        <Image source={getImageSource(imageSrc)} className="w-16 h-16 rounded-full" />
        

        {/* <AudioPlayer audioUri="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" /> */}

        {audioNote ? (
          <AudioPlayer audioSrc={audioNote.audioSrc} audioDate={audioNote ? audioNote.date : undefined} />
        ) : (
          <View className="ml-space">
            <Text className="text-primary text-base font-bold">Nessuna nota audio</Text>
            <Text className="text-secondary font-bold">{formatISODate(new Date().toISOString())}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
