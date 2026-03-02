import { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, Pressable,
} from "react-native";
import { router, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useLogout } from "@/hooks/useLogout";
import { Ionicons } from "@expo/vector-icons";

function DropdownMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { logout } = useLogout();

  const items = [
    { label: "Dashboard",         icon: "home-outline",        route: "/(app)/dashboard" },
    { label: "Impianti",          icon: "layers-outline",      route: "/(app)/impianti" },
    { label: "Carrello",          icon: "cart-outline",        route: "/(app)/cart" },
    { label: "Assistenza remota", icon: "headset-outline",     route: "/(app)/remoteAssistance" },
    { label: "Impostazioni",      icon: "settings-outline",    route: "/(app)/settings" },
    { label: "Overview",          icon: "speedometer-outline", route: "/(app)/overview" },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View style={{
          position: "absolute", right: 16, top: 90,
          backgroundColor: "#fff", borderRadius: 12,
          paddingVertical: 8, width: 220,
          shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10,
        }}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => { onClose(); router.push(item.route as any); }}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Ionicons name={item.icon as any} size={16} color="#001c38" style={{ marginRight: 10 }} />
              <Text style={{ color: "#001c38", fontSize: 14 }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 4 }} />
          <TouchableOpacity
            onPress={() => { onClose(); logout(); }}
            style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}
          >
            <Ionicons name="log-out-outline" size={16} color="#ef4444" style={{ marginRight: 10 }} />
            <Text style={{ color: "#ef4444", fontSize: 14 }}>Logout</Text>
          </TouchableOpacity>
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={{ color: "#aaa", fontSize: 11 }}>FE: 1.0.0</Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

function LastScanPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24,
        }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
            Ultime scansioni
          </Text>
          <Text style={{ color: "#789fd6", fontSize: 14 }}>Central engine</Text>
          <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 4 }}>
            2.1.4 Diesel propulsion - S/N 19028393028A
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function DashboardHeader() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname === "/(app)/dashboard";
  const user = useSelector((state: RootState) => state.auth?.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastScanOpen, setLastScanOpen] = useState(false);

  return (
    <>
      <View style={{ flexDirection: "row", height: 64, gap: 10 }}>
        {!isDashboard && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 56, backgroundColor: "#022a52", borderRadius: 12, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          //onPress={() => setLastScanOpen(true)}
          onPress={() => router.push("/(app)/profile" as any)}
          style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" }}
        >
          <Text style={{ color: "#789fd6", fontSize: 11 }}>Benvenuto</Text>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }} numberOfLines={1}>
            {user ? `${user.firstName} ${user.lastName}` : "Utente"}
          </Text>
          <Text style={{ color: "#ffffff60", fontSize: 11 }} numberOfLines={1}>
            Ultima scansione: Central engine
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(app)/scan" as any)}
          style={{ width: 56, backgroundColor: "#022a52", borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="qr-code-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          style={{ width: 56, backgroundColor: "#022a52", borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="menu" size={28} color="#789fd6" />
        </TouchableOpacity>
      </View>

      <DropdownMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <LastScanPanel isOpen={lastScanOpen} onClose={() => setLastScanOpen(false)} />
    </>
  );
}