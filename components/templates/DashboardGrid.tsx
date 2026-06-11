import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "@/app/i18n";
import { fetchDashboardSummary } from "@/api/summary";
import type { RootState } from "@/store/store";

export default function DashboardGrid({ availableHeight }: { availableHeight?: number }) {
  const { width } = useWindowDimensions();
  const GAP = 10;
  const cardWidth = (width - 32 - GAP) / 2;
  const cardHeight = availableHeight ? (availableHeight - GAP * 2) / 3 : cardWidth;
  const { t } = useTranslation("dashboard");

  // ⚠️ ADATTA: user dallo store Redux
  const user = useSelector((s: RootState) => s.auth.user);
  const [shipId, setShipId] = useState<number | null>(null);
  const [counters, setCounters] = useState<Record<string, number>>({});

  // shipId da AsyncStorage (salvato al login-pin)
  useEffect(() => {
    AsyncStorage.getItem("selectedShipId").then((v) => {
      if (v) setShipId(Number(v));
    });
  }, []);

  // fetch summary + refresh ogni 30s (come SWR sul web)
  useEffect(() => {
    if (!shipId || !user?.id) return;
    let active = true;

    const load = async () => {
      const data = await fetchDashboardSummary(shipId, Number(user.id));
      if (active) setCounters(data?.counters || {});
    };

    load();
    const interval = setInterval(load, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [shipId, user?.id]);

  // chiave del counter ↔ card (allineata al web: maintenance/checklist/readings/spares/files/failures)
  const categories = [
    { id: "maintenance", counterKey: "maintenance", label: t("maintenance"), icon: require("@/assets/icons/ico_dashboard_maintenance.png"), route: "/(app)/maintenance" },
    { id: "checklist",   counterKey: "checklist",   label: t("checklist"),   icon: require("@/assets/icons/dash_checklist.png"),           route: "/(app)/checklist" },
    { id: "readings",    counterKey: "readings",    label: t("readings"),    icon: require("@/assets/icons/time.png"),                     route: "/(app)/readings" },
    { id: "spare",       counterKey: "spares",      label: t("spare"),       icon: require("@/assets/icons/dash_corr.png"),                route: "/(app)/spare" },
    { id: "files",       counterKey: "files",       label: t("manuals"),     icon: require("@/assets/icons/ico_dashboard_manual.png"),     route: "/(app)/files" },
    { id: "failures",    counterKey: "failures",    label: t("failures"),    icon: require("@/assets/icons/dash_warning.png"),             route: "/(app)/failures" },
  ];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
      {categories.map((item) => {
        const count = counters[item.counterKey] ?? 0;
        return (
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
              padding: 12,
            }}
          >
            {/* BADGE numero in alto a destra */}
            {count > 0 && (
              <View style={{
                position: "absolute", top: 10, right: 10,
                backgroundColor: "#ff0000", borderRadius: 14,
                minWidth: 28, height: 28, paddingHorizontal: 6,
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                  {count > 999 ? "999+" : count}
                </Text>
              </View>
            )}

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
              {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}