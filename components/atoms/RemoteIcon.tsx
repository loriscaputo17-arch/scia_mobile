import React, { useState } from "react";
import { Image, ImageStyle, StyleProp, View, ActivityIndicator } from "react-native";

type RemoteIconProps = {
  uri?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  styleWind?: string;
};

export default function RemoteIcon({ uri, size = 24, style, styleWind }: RemoteIconProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const validUri = uri && !hasError;

  const defaultIcon = require("@/assets/images/icon.png"); 

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      {loading && <ActivityIndicator size="small" />}
      <Image
        source={validUri ? { uri } : defaultIcon}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setHasError(true);
          setLoading(false);
        }}
        className={styleWind}
        style={[
          {
            width: size,
            height: size,
            resizeMode: "contain",
          },
          style,
        ]}
      />
    </View>
  );
}
