import { View, Text, TouchableOpacity, ImageSourcePropType, Image, ScrollView } from "react-native";
import React, { useState } from "react";
import ImageViewer from "../atoms/ImageViewer";
import { getImageSource } from "@/app/utils/getImageSource";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import PhotoCapture from "../molecules/PhotoCapture";
import PhotoPreview from "../molecules/PhotoPreview";
import TextInputField from "../atoms/TextInputField";
import Button from "../atoms/Button";

export default function AddNewReplacement() {
  const [photoUri, setPhotoUri] = useState<ImageSourcePropType | string | null>(null);
  const [viewReplacementPhoto, setViewReplacementPhoto] = useState(false);
  const [openPhotoCapture, setOpenPhotoCapture] = useState(false);
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [description, setDescription] = useState("");

  return (
    <ScrollView>
      <View className="flex-row p-space">
        {!!photoUri && <ImageViewer visible={viewReplacementPhoto} imgSrc={photoUri} onClose={() => setViewReplacementPhoto(false)} />}

        <PhotoPreview
          photoUri={photoUri}
          onPress={() => setViewReplacementPhoto(true)}
          styleWindContainer="rounded-md"
          styleWindImage="rounded-md"
          iconCollectionPlaceholder="FontAwesome5"
          iconCollectionPlaceholderProps={{ name: "cogs", color: "white", size: 24 }}
        />

        <TouchableOpacity onPress={() => setOpenPhotoCapture(true)} className="m-space xxl:mb-space-xxl flex justify-center items-center">
          <FontAwesome name="camera" color={"#9ca3af"} size={22} />
        </TouchableOpacity>
      </View>

      <PhotoCapture visible={openPhotoCapture} onClose={() => setOpenPhotoCapture(false)} onSave={(photoUri) => setPhotoUri(photoUri)} />

      <View className="flex-row flex-wrap w-full">
        <TextInputField styleContainer="w-1/2 p-space" label="Marca" value={model} onChangeText={setModel} />
        <TextInputField styleContainer="w-1/2 p-space" label="Modello" value={brand} onChangeText={setBrand} />
        <TextInputField styleContainer="w-1/2 p-space" label="Part Number" value={partNumber} onChangeText={setPartNumber} />
        <TextInputField styleContainer="w-1/2 p-space" label="Descrizione" value={description} onChangeText={setDescription} />
      </View>

      {/* <Button theme="modal" label="Salva" onPress={() => alert("Aggiungi ricambio")} /> */}
    </ScrollView>
  );
}
