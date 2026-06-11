import "../global.css";
import "@/app/i18n";
import OfflineBanner from "@/components/organisms/OfflineBanner";
import { NetworkSyncProvider } from "@/hooks/NetworkSyncProvider";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, backgroundColor: "#001c38", alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        }
        persistor={persistor}
      >
        <NetworkSyncProvider /> 
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }} />
      </PersistGate>
    </Provider>
  );
}