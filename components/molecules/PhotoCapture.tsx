import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import { Button, Text, TouchableOpacity, View, Image, Modal, Pressable, Animated, Alert } from "react-native";
import IconComponent from "../atoms/IconComponent";
import { MaterialIcons } from "@expo/vector-icons";

type PhotoCaptureProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
};

export default function PhotoCapture({ visible, onClose, onSave }: PhotoCaptureProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null); // Stato per memorizzare l'URI della foto
  const cameraRef = useRef<CameraView | null>(null); // Riferimento alla fotocamera
  const previewOpacity = useRef(new Animated.Value(0)).current; // Animazione per la preview

  useEffect(() => {
    if (!visible) {
      setPhotoUri(null); // Resetta photoUri quando il componente viene chiuso
    }
    if (visible && permission?.granted === false) {
      requestPermission();
    }
  }, [visible]);

  // Se i permessi non sono concessi, mostra un avviso
  useEffect(() => {
    if (permission?.granted === false && visible) {
      Alert.alert("Permission Denied", "Camera permission is required to take photos.", [{ text: "OK", onPress: onClose }]);
    }
  }, [permission]);

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setPhotoUri(photo.uri); // Salva l'URI della foto nello stato

        Animated.timing(previewOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(); // Mostra l'animazione di comparsa della preview
      }
    }
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <Modal transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1">
        <CameraView ref={cameraRef} className="flex-1" facing={facing}>
          <Pressable onPress={onClose} className="self-end p-8">
            <MaterialIcons name="close" color="#fff" size={44} />
          </Pressable>
          <View className="absolute bottom-8 left-0 right-0 flex-row justify-center space-x-4">
            <TouchableOpacity onPress={toggleCameraFacing} className="p-4 bg-white rounded-full">
              <IconComponent
                iconCollection="FontAwesome6"
                iconProps={{
                  name: "rotate",
                  color: "#000",
                  size: 32,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture} className="p-4 bg-white rounded-full">
              <IconComponent
                iconCollection="FontAwesome6"
                iconProps={{
                  name: "camera",
                  color: "#000",
                  size: 32,
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={photoUri === null}
              onPress={() => {
                if (photoUri) {
                  onSave(photoUri);
                  setPhotoUri(null);
                }
              }}
              className={`${photoUri ? "opacity-1" : "opacity-20"} p-4 bg-white rounded-full `}
            >
              <IconComponent
                iconCollection="FontAwesome6"
                iconProps={{
                  name: "save",
                  color: "#000",
                  size: 32,
                }}
              />
            </TouchableOpacity>
          </View>
        </CameraView>

        {/* Preview dell'immagine scattata */}
        {photoUri && (
          <Animated.View
            style={{
              position: "absolute",
              bottom: 32,
              left: 32,
              width: 150,
              height: 150,
              opacity: previewOpacity,
              borderRadius: 10,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "#fff",
            }}
          >
            <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}
