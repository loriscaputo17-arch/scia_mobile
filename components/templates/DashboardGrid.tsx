import { View, Text, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { router } from "expo-router";

const categories = [
  { id: "maintenance", label: "Manutenzione", icon: require("@/assets/icons/ico_dashboard_maintenance.png"), route: "/(app)/maintenance" },
  { id: "checklist",   label: "Checklist",    icon: require("@/assets/icons/dash_checklist.png"),           route: "/(app)/checklist" },
  { id: "readings",    label: "Letture",      icon: require("@/assets/icons/time.png"),                     route: "/(app)/readings" },
  { id: "spare",       label: "Ricambi",      icon: require("@/assets/icons/dash_corr.png"),                route: "/(app)/spare" },
  { id: "files",       label: "Manuali",      icon: require("@/assets/icons/ico_dashboard_manual.png"),     route: "/(app)/files" },
  { id: "failures",    label: "Guasti",       icon: require("@/assets/icons/dash_warning.png"),             route: "/(app)/failures" },
];

export default function DashboardGrid({ availableHeight }: { availableHeight?: number }) {
  const { width, height } = useWindowDimensions();
  const GAP = 10;
  const cardWidth = (width - 32 - GAP) / 2; // 32 = padding orizzontale dashboard
  const cardHeight = availableHeight ? (availableHeight - GAP * 2) / 3 : cardWidth;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
      {categories.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => router.push(item.route as any)}
          style={{
            width: cardWidth,
            height: cardHeight,
            backgroundColor: "#022a52",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{
            width: 60, height: 60,
            backgroundColor: "#001c38",
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}>
            <Image source={item.icon} style={{ width: 34, height: 34 }} resizeMode="contain" />
          </View>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", textAlign: "center" }}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}