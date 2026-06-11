import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Linking, Image } from "react-native";
import { router, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useLogout } from "@/hooks/useLogout";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/app/i18n";

function DropdownMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { logout } = useLogout();
  const { t } = useTranslation("header");
  const user = useSelector((s: RootState) => s.auth?.user);
  const isComando = user?.type === "Comando";   // ⚠️ adatta se il campo ha un altro nome

  const items = [
    { label: t("dashboard"),          icon: "home-outline",     route: "/(app)/dashboard" },
    { label: t("facilities"),         icon: "layers-outline",   route: "/(app)/impianti" },
    { label: t("cart"),               icon: "cart-outline",     route: "/(app)/cart" },
    { label: t("remote_assistance"),  icon: "headset-outline",  route: "/(app)/remoteAssistance" },
    { label: t("settings"),           icon: "settings-outline", route: "/(app)/settings" },
    ...(isComando
      ? [{ label: t("overview"), icon: "analytics-outline", route: "/(app)/overview" }]
      : []),
  ];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={onClose}>
        <View
          style={{
            position: "absolute", right: 16, top: 90,
            backgroundColor: "#fff", borderRadius: 16,
            width: 260, overflow: "hidden",
            shadowColor: "#022a52", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}          
        >
          {/* HEADER con badge Comando */}
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            backgroundColor: "#022a52", paddingHorizontal: 16, paddingVertical: 12,
          }}>
            <Text style={{ color: "#ffffffcc", fontSize: 11, fontWeight: "600", letterSpacing: 1.5, textTransform: "uppercase" }}>
              {t("menu")}
            </Text>
            {isComando && (
              <View style={{ backgroundColor: "#ffffff26", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>{t("command")}</Text>
              </View>
            )}
          </View>

          {/* VOCI */}
          <View style={{ paddingVertical: 6 }}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.route}
                onPress={() => { onClose(); router.push(item.route as any); }}
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <View style={{
                  width: 32, height: 32, borderRadius: 8, backgroundColor: "#022a520d",
                  alignItems: "center", justifyContent: "center", marginRight: 12,
                }}>
                  <Ionicons name={item.icon as any} size={16} color="#022a52" />
                </View>
                <Text style={{ color: "#022a52", fontSize: 14, fontWeight: "500" }}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            {/* LOGOUT */}
            <TouchableOpacity
              onPress={() => { onClose(); logout(); }}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 8, backgroundColor: "#ef444415",
                alignItems: "center", justifyContent: "center", marginRight: 12,
              }}>
                <Ionicons name="log-out-outline" size={16} color="#ef4444" />
              </View>
              <Text style={{ color: "#ef4444", fontSize: 14, fontWeight: "500" }}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* CERTIFICAZIONI */}
          <View style={{ borderTopWidth: 1, borderTopColor: "#022a521a", backgroundColor: "#f6f8fb", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: "#022a5266", fontSize: 10, fontWeight: "600", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
              {t("certifications")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Image source={require("@/assets/logos/rina_logo.png")} style={{ width: 70, height: 36 }} resizeMode="contain" />
                <Text style={{ color: "#022a5280", fontSize: 9 }}>Type Approval</Text>
              </View>
              <View style={{ width: 1, height: 28, backgroundColor: "#022a521a" }} />
              <View style={{ alignItems: "center", gap: 4 }}>
                <Image source={require("@/assets/logos/abs.png")} style={{ width: 60, height: 28 }} resizeMode="contain" />
                <Text style={{ color: "#022a5280", fontSize: 9 }}>PDA</Text>
              </View>
            </View>
          </View>

          {/* VERSIONE + LOG */}
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            borderTopWidth: 1, borderTopColor: "#022a521a", paddingHorizontal: 16, paddingVertical: 10,
          }}>
            <Text style={{ color: "#022a5266", fontSize: 11 }}>FE 1.0.0 · BE 1.0.0</Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://scia-frontend.vercel.app/logpage")}>
              <Text style={{ color: "#789fd6", fontSize: 11, textDecorationLine: "underline" }}>{t("log")}</Text>
            </TouchableOpacity>
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