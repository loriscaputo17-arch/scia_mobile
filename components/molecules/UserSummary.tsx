import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { getImageSource } from "@/app/utils/getImageSource";
import { type User } from "@/data/users";
import { useRouter, usePathname } from "expo-router";
// import { ranks } from "@/data/ranks";
import { useSelector } from "react-redux";
import { selectRankById, selectRanks } from "@/features/ranks/ranksSlice";

type UserSummaryProps = {
  userData: User;
};

export default function UserSummary({ userData }: UserSummaryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const ranks = useSelector(selectRanks);

  // const rank = ranks.find((r) => r.id.toString() === userData.rank);
  const rank = userData.rank && useSelector(selectRankById(userData.rank));
  const rankImage = rank && rank.distintivo_controspallina;
  const rankName = rank && rank.grado;


  return (
    <TouchableOpacity
      className="flex-1 flex-row items-center bg-secondary p-4 rounded-md"
      onPress={() => {
        if (pathname !== `/dashboard/profilo`) {
          router.push("/dashboard/profilo");
        }
      }}
    >
      {/* NB: Se e' disponibile il rank/grado, l'immagine sull'header dovrebbe esser quella del grado "rankImage", non della foto profilo */}
      {/* <Image
        source={getImageSource(rankImage ? rankImage : userData.profileImage || require("@/assets/images/icon.png"))}
        className="w-8 sm:w-12 h-8 sm:h-12  rounded-full mr-space xxl:mr-space-xxl"
      /> */}
      <Image
        source={getImageSource(userData.profileImage ? userData.profileImage :  require("@/assets/images/icon.png"))}
        className="w-8 sm:w-12 h-8 sm:h-12  rounded-full mr-space xxl:mr-space-xxl"
      />
      <View className="flex-1">
        <Text className="text-tertiary" numberOfLines={1}>{rankName ? rankName : "Utente"}</Text>
        <Text className="text-primary xs:text-lg" numberOfLines={1}>{userData.firstName + ' ' + userData.lastName}</Text>
        <Text className="text-secondary" numberOfLines={1}>{userData.type}</Text>
      </View>
    </TouchableOpacity>
  );
}
