import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Audio } from "expo-av";
import AudioPlayer from "./AudioPlayer"; 
import IconComponent from "../atoms/IconComponent";
import Button from "../atoms/Button";

type AudioNoteRecorderProps = {
  onSave: (note: string) => void;
};

export default function AudioNoteRecorder({ onSave }: AudioNoteRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // Stato per il tempo di registrazione
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Animazione pulsante
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Timer per il tempo di registrazione
      intervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      // Interrompe animazione e timer
      pulseAnim.setValue(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording]);

  const startRecording = async () => {

    if(audioUri)
      setAudioUri(null);

    if (recording) {
      console.warn("A recording is already in progress!");
      return;
    }

    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert("Microphone permission is required!");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0); // Reset tempo di registrazione
    } catch (err) {
      console.error("Failed to start recording:", err);
      stopRecording(); // Cleanup in caso di errore
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  };

  return (
    <>
      <View className="flex-1 items-center p-10">
        <View className="items-center">
          <Text className="text-lg text-primary mb-8">{!audioUri ? "Avvia registrazione" : "Registra di nuovo"}</Text>
          <TouchableOpacity
            className="w-20 h-20 bg-red-500 rounded-full justify-center items-center"
            onPress={()=> isRecording ? stopRecording() : startRecording()}
          >
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                backgroundColor: "red",
                width: 60,
                height: 60,
                borderRadius: 30,
                position: "absolute",
              }}
            >
              <View className="flex justify-center items-center ml-[0.2] mt-2">
                <IconComponent
                  iconCollection="MaterialIcons"
                  iconProps={{
                    name: isRecording ? "pause" : "play-arrow",
                    color: "#fff",
                    size: 44,
                  }}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>
          {isRecording && <Text className="text-red-500 mt-4 text-lg">{`${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, "0")}`} sec</Text>}

          {audioUri && (
            <View className="mt-8 h-32 bg-primaryLighter p-space xxl:p-space-xxl rounded-md ">
              <Text className="text-secondary mb-2 font-bold">Riascolta il tuo vocale</Text>
              <AudioPlayer audioSrc={{ uri: audioUri }} />
            </View>
          )}
        </View>
      </View>

      <Button
        theme="modal"
        label="Aggiungi Nota"
        disabled={audioUri === null}
        onPress={() => {
          if (audioUri) {
            onSave(audioUri);
            setAudioUri(null);
          }
        }}
      />
    </>
  );
}
