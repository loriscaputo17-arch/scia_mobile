import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import WebView from "react-native-webview";
import type { ShipFile } from "@/data/shipFiles";

type Props = {
  file: ShipFile | null;
  onLoadingChange?: (loading: boolean) => void;
};

export default function FilePreview({ file, onLoadingChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    onLoadingChange?.(true);
  }, [file?.id]);

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadingChange?.(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    onLoadingChange?.(false);
  };

  if (!file) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-secondary">Nessun file selezionato</Text>
      </View>
    );
  }

  const fileType = file.file_type.toLowerCase();
  const fileUrl = file.file_link;

  switch (fileType) {
    case "pdf":
      return (
        <>
          {loading && !error && (
            <View className="absolute inset-0 z-10 bg-background/80 justify-center items-center">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-secondary mt-2">Caricamento PDF…</Text>
            </View>
          )}
          {error ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-primary">Errore nel caricamento del PDF</Text>
            </View>
          ) : (
            <WebView
              key={file.id}
              source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}` }}
              originWhitelist={["*"]}
              style={{ flex: 1 }}
              onLoadStart={() => {
                setLoading(true);
                onLoadingChange?.(true);
              }}
              onLoadEnd={handleLoadEnd}
              onError={(e) => {
                console.error("WebView error:", e.nativeEvent);
                handleError();
              }}
            />
          )}
        </>
      );

    default:
      return (
        <View className="flex-1 justify-center items-center px-space">
          <Text className="text-secondary text-center">
            Anteprima non disponibile per il formato "{fileType}"
          </Text>
        </View>
      );
  }
}
