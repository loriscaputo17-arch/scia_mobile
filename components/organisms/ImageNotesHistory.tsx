import { View, Text, ScrollView, Image, TouchableOpacity, Modal, ImageSourcePropType } from "react-native";
import React, { useState } from "react";
import Button from "../atoms/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { type HistoryEntry } from "@/data/history";
import { formatISODate } from "@/app/utils/utils";
import { type Users } from "@/data/users";
import { getImageSource } from "@/app/utils/getImageSource";
import ImageViewer from "../atoms/ImageViewer";

type ImageNotesHistoryProps = {
  history: HistoryEntry[];
  historyEntry?: HistoryEntry;
  step? : number ;
  users: Users;
};

export default function ImageNotesHistory({ history, historyEntry, step, users }: ImageNotesHistoryProps) {
  const [currentStep, setCurrentStep] = useState<number>(step || 0); // 0: List, 1: Images, 2: Full Image
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | undefined>(historyEntry);
  const [selectedImage, setSelectedImage] = useState<string | ImageSourcePropType | null>(null);

  const handleNavigateToImages = (historyEntry: HistoryEntry) => {
    setSelectedHistory(historyEntry);
    setCurrentStep(1); // Vai al dettaglio
  };

  const handleNavigateToExtraInfo = (imageSrc: string | ImageSourcePropType) => {
    setSelectedImage(imageSrc);
    setCurrentStep(2); // Mostra immagine a schermo intero
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setSelectedImage(null); // Resetta l'immagine selezionata
    } else if (currentStep === 1) {
      setSelectedHistory(undefined); // Resetta l'elemento selezionato se si torna alla lista
    }
    setCurrentStep((prevStep) => Math.max(0, prevStep - 1)); // Torna indietro
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }} // Permette ai figli di espandersi
      >
        {/* Step 0: Lista delle history */}
        {currentStep === 0 && (
          <>
            {history.map((h, index) => {
              const user = users[h.user];
              if (h.imageNotes)
                return (
                  <View className="flex-row justify-between mb-space items-center" key={index}>
                    <View className="flex-row gap-space items-center">
                      <View className="relative">
                        <Image source={getImageSource(h.imageNotes[h.imageNotes.length - 1].imgSrc)} className="w-24 h-24 rounded-md" />
                        <View className="absolute top-1 right-1 bg-white rounded-full w-8 h-8 justify-center items-center">
                          <Text className="text-black text-lg font-bold">{h.imageNotes.length}</Text>
                        </View>
                      </View>
                      <View>
                        <Text className="text-primary text-lg font-bold">{user ? `${user.firstName} ${user.lastName}` : "Utente Sconosciuto"}</Text>
                        <Text className="text-secondary text-sm font-bold">{formatISODate(h.imageNotes[h.imageNotes.length - 1].date)}</Text>
                      </View>
                    </View>
                    <Button theme="noBackground" IconComponent={MaterialIcons} iconProps={{ name: "navigate-next", color: "white", size: 26 }} onPress={() => handleNavigateToImages(h)} />
                  </View>
                );
            })}
          </>
        )}

        {/* Step 1: Immagini della history */}
        {currentStep === 1 && selectedHistory && (
          <View className="flex-1">
            <View className="flex-row items-center mb-space">
              <Button theme="noBackground" IconComponent={MaterialIcons} iconProps={{ name: "navigate-before", color: "white", size: 26 }} onPress={handleBack} />
              <Text className="text-primary text-lg font-bold ml-space">{`${users[selectedHistory.user].firstName} ${users[selectedHistory.user].lastName}`}</Text>
            </View>
            <View className="flex-1">
              <ScrollView horizontal className="flex-row py-space" showsHorizontalScrollIndicator={false}>
                {selectedHistory.imageNotes?.map((note, index) => (
                  <TouchableOpacity key={index} className="mx-space flex-col items-center" onPress={() => handleNavigateToExtraInfo(note.imgSrc)}>
                    <View className="flex-1 justify-center">
                      <Image source={getImageSource(note.imgSrc)} className="rounded-md h-full aspect-square" />
                    </View>
                    <Text className="text-secondary text-lg font-bold mt-space">{formatISODate(note.date)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Step 2: Immagine a schermo intero in un Modal */}
      {!!selectedImage && <ImageViewer visible={currentStep === 2} imgSrc={selectedImage} onClose={handleBack}/>}

    </>
  );
}
