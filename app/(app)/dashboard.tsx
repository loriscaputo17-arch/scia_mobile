import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import DashboardGrid from "@/components/templates/DashboardGrid";
import { useDevice } from "@/hooks/useDevice";

export default function DashboardPage() {
  const { isTablet } = useDevice();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View
        style={{
          flex: 1,
          padding: isTablet ? 24 : 16,
          alignSelf: "center",
          width: "100%",
          maxWidth: isTablet ? 1200 : "100%",
        }}
      >
        <DashboardHeader />
        <ScrollView style={{ flex: 1, marginTop: 16 }} showsVerticalScrollIndicator={false}>
          <DashboardGrid />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}