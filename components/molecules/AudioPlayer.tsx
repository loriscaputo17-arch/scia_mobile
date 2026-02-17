import React, { useRef, useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import Button from "../atoms/Button";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider";
import { Asset } from "expo-asset"; // Importa expo-asset
import { formatISODate } from "@/app/utils/utils";

type AudioPlayerProps = {
  audioSrc: any;
  audioDate?: string;
};

const AudioPlayer = ({ audioSrc, audioDate }: AudioPlayerProps) => {
  const audio = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0); // Current time in seconds
  const [duration, setDuration] = useState<number | null>(0); // Total audio duration
  const [isSliding, setIsSliding] = useState<boolean>(false); // Whether the user is sliding
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // Timer for debounce

  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Carica il file come asset
        const asset = Asset.fromModule(audioSrc);
        await asset.downloadAsync(); // Assicura che il file sia scaricato
        const { sound, status } = await Audio.Sound.createAsync({ uri: asset.uri }, { shouldPlay: false }, onPlaybackStatusUpdate);
        audio.current = sound;

        if (status.isLoaded && "durationMillis" in status && status.durationMillis != null) {
          setDuration(status.durationMillis / 1000); // Imposta la durata in secondi
        } else {
          console.warn("Duration not available.");
          setDuration(null);
        }
      } catch (error) {
        console.error("Errore nel caricamento dell'audio:", error);
      }
    };

    loadAudio();

    return () => {
      if (audio.current) {
        audio.current.stopAsync(); // Ferma l'audio
        audio.current.unloadAsync(); // Scarica l'audio
      }
    };
  }, [audioSrc]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (isPlaybackStatusSuccess(status)) {
      setIsPlaying(status.isPlaying);

      // Controllo se l'audio è terminato
      if (status.didJustFinish) {
        setIsPlaying(false); // Imposta isPlaying su false
        setCurrentTime(0); // Resetta il tempo corrente a 0
        if (audio.current) {
          audio.current.stopAsync(); // Ferma l'audio per consentire una nuova riproduzione
        }
      }

      if (!isSliding && !status.didJustFinish) {
        setCurrentTime(status.positionMillis / 1000); // Update current time in seconds only if not sliding
      }
    }
  };

  const isPlaybackStatusSuccess = (status: AVPlaybackStatus): status is AVPlaybackStatusSuccess => {
    return (status as AVPlaybackStatusSuccess).isLoaded;
  };

  const togglePlay = async () => {
    if (audio.current) {
      if (isPlaying) {
        await audio.current.pauseAsync(); // Pause the audio
      } else {
        await audio.current.playAsync(); // Play the audio
      }
    }
  };

  const handleSliderValueChange = (value: number) => {
    setIsSliding(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setCurrentTime(value);
      setIsSliding(false);
    }, 50); // Aggiorna lo stato ogni 50ms
  };

  const handleSlidingComplete = async (value: number) => {
    if (audio.current) {
      await audio.current.setPositionAsync(value * 1000);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex flex-1">
      <View className="flex-row items-center justify-center">
        <Button
          theme="noBackground"
          IconComponent={MaterialIcons}
          iconProps={{
            name: isPlaying ? "pause" : "play-arrow",
            color: "#fff",
            size: 44,
          }}
          onPress={togglePlay}
        />
        <View className="flex-1 flex-row">
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={duration || 0}
            value={currentTime}
            onValueChange={handleSliderValueChange}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#D3D3D3"
            thumbTintColor="#1DB954"
          />
        </View>
      </View>
      <View className="flex-row justify-between ml-14">
        <Text className="text-secondary font-bold"> {formatTime(currentTime || 0)}</Text>
        <Text className="text-secondary font-bold">{`${audioDate ? formatISODate(audioDate) : ""}`}</Text>
      </View>
    </View>
  );
};

export default AudioPlayer;
