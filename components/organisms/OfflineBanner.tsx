import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useNetworkSync } from "@/hooks/useNetworkSync";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [visible, setVisible] = useState(false);
  const queue = useSelector((state: RootState) => state.pendingActions.queue);
  const isSyncing = useSelector((state: RootState) => state.pendingActions.isSyncing);
  const syncError = useSelector((state: RootState) => state.pendingActions.syncError);
  const { flush } = useNetworkSync();

  const pendingCount = queue.length;
  const slideAnim = new Animated.Value(visible ? 0 : -60);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
    });
    return () => unsub();
  }, []);

  // Mostra banner se: offline OPPURE ci sono azioni pendenti
  useEffect(() => {
    const shouldShow = !isOnline || pendingCount > 0 || isSyncing;
    setVisible(shouldShow);
  }, [isOnline, pendingCount, isSyncing]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -60,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  // ── Stato: syncing ─────────────────────────────────────────────────────────
  if (isSyncing) {
    return (
      <View style={{
        backgroundColor: "#789fd6",
        paddingHorizontal: 16, paddingVertical: 10,
        flexDirection: "row", alignItems: "center", gap: 10,
      }}>
        <Ionicons name="sync-outline" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>
          Sincronizzazione in corso... ({pendingCount} azioni)
        </Text>
      </View>
    );
  }

  // ── Stato: offline con azioni pendenti ────────────────────────────────────
  if (!isOnline && pendingCount > 0) {
    return (
      <View style={{
        backgroundColor: "#F47216",
        paddingHorizontal: 16, paddingVertical: 10,
        flexDirection: "row", alignItems: "center", gap: 10,
      }}>
        <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>
          Offline · {pendingCount} {pendingCount === 1 ? "azione in attesa" : "azioni in attesa"}
        </Text>
        <View style={{
          backgroundColor: "#fff", borderRadius: 12,
          paddingHorizontal: 8, paddingVertical: 2,
        }}>
          <Text style={{ color: "#F47216", fontSize: 12, fontWeight: "700" }}>{pendingCount}</Text>
        </View>
      </View>
    );
  }

  // ── Stato: offline senza azioni pendenti ──────────────────────────────────
  if (!isOnline) {
    return (
      <View style={{
        backgroundColor: "#6b7280",
        paddingHorizontal: 16, paddingVertical: 10,
        flexDirection: "row", alignItems: "center", gap: 10,
      }}>
        <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
          Modalità offline
        </Text>
      </View>
    );
  }

  // ── Stato: online con azioni pendenti (pronto a sincronizzare) ────────────
  if (isOnline && pendingCount > 0) {
    return (
      <TouchableOpacity
        onPress={flush}
        style={{
          backgroundColor: "#2DB647",
          paddingHorizontal: 16, paddingVertical: 10,
          flexDirection: "row", alignItems: "center", gap: 10,
        }}>
        <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>
          {pendingCount} {pendingCount === 1 ? "azione" : "azioni"} da sincronizzare
        </Text>
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Sync ora →</Text>
      </TouchableOpacity>
    );
  }

  // ── Stato: sync error ─────────────────────────────────────────────────────
  if (syncError) {
    return (
      <TouchableOpacity
        onPress={flush}
        style={{
          backgroundColor: "#D0021B",
          paddingHorizontal: 16, paddingVertical: 10,
          flexDirection: "row", alignItems: "center", gap: 10,
        }}>
        <Ionicons name="warning-outline" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 }}>
          Errore sync · Riprova
        </Text>
        <Ionicons name="refresh-outline" size={16} color="#fff" />
      </TouchableOpacity>
    );
  }

  return null;
}