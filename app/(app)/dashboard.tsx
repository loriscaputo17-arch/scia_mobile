import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import DashboardGrid from "@/components/templates/DashboardGrid";

export default function DashboardPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />
        <ScrollView style={{ flex: 1, marginTop: 16 }} showsVerticalScrollIndicator={false}>
          <DashboardGrid />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}