import React, { ReactElement, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar, Dimensions, Platform, Linking, Pressable } from "react-native";
// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
import { AntDesign, MaterialCommunityIcons, FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";

import Button from "../atoms/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import PathNavigation from "../molecules/PathNavigation";
import Menu, { MenuAction } from "../molecules/Menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { connectedUserID } from "@/data/connectedUserID";
import UserSummary from "../molecules/UserSummary";
import { selectUserById } from "@/features/users/usersSlice";
import QRScanner from "../molecules/QRScanner";
import ScanSummary from "../molecules/ScanSummary";
import { type System } from "@/data/systems";
import { type Replacement } from "@/data/replacements";
import SciaModal from "../molecules/SciaModal";
import ScansHistory from "./ScansHistory";
import { addScan } from "@/features/scans/scansSlice";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { selectReplacementMap } from "@/features/replacements/replacementsSlice";

const Header = ({ navigation }: { navigation?: any }) => {
  
  if (!navigation) 
    return null; 

  const router = useRouter();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [openScan, setOpenScan] = useState(false);
  const [showScansHistory, setShowScansHistory] = useState(false);
  const scans = useSelector((state: RootState) => state.scans);
  const systems = useSelector((state: RootState) => state.systems);
  const replacements = useSelector(selectReplacementMap);
  const [lastScannedItem, setLastScannedItem] = useState<System | Replacement | null>(scans.length > 0 ? systems[scans[scans.length - 1]] || replacements[scans[scans.length - 1]] : null);
  const [isBigScreen, setIsBigScreen] = useState(Dimensions.get("window").width > 640);
  const insets = useSafeAreaInsets();
  // const userData = useSelector((state: RootState) => selectUserById(state, connectedUserID));
  const userData = useSelector(selectCurrentUser);

  const handleScanSuccess = (data: string) => {
    const url = new URL(data);
    const id = url.searchParams.get("id");
    if (id) {
      if (systems[id]) {
        setLastScannedItem(systems[id]);
        dispatch(addScan(id));
      } else if (replacements[id]) {
        setLastScannedItem(replacements[id]);
        dispatch(addScan(id));
      }
    } else alert("Il QR Code non sembra corrispondere a nessun impianto o ricambio");
  };

  useEffect(() => {
    const handleResize = () => {
      const { width } = Dimensions.get("window");
      setIsBigScreen(width > 640);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);

    return () => {
      subscription.remove();
    };
  }, []);

  const actions: MenuAction[] = [
    {
      label: "Dashboard",
      IconComponent: MaterialIcons,
      iconProps: { name: "home" },
      onClick: () => {
        setShowMenu(false);
        router.push("/dashboard");
      },
    },
    {
      label: "Impianti",
      IconComponent: MaterialIcons,
      iconProps: { name: "schema" },
      onClick: () => {
        setShowMenu(false);
        router.push("/dashboard/impianti");
      },
    },
    {
      label: "Carrello",
      IconComponent: MaterialIcons,
      iconProps: { name: "shopping-cart" },
      onClick: () => {
        setShowMenu(false);
        router.push("/dashboard/carrello");
      },
    },
    {
      label: "Assistenza remota",
      IconComponent: AntDesign,
      iconProps: { name: "customerservice" },
      onClick: () => {
        setShowMenu(false);
        router.push("/dashboard/assistenza_remota");
      },
    },
    {
      label: "Impostazioni",
      IconComponent: MaterialIcons,
      iconProps: { name: "settings" },
      onClick: () => {
        setShowMenu(false);
        router.push("/dashboard/impostazioni");
      },
    },
  ];

  return (
    <View className={`flex bg-primary`} style={{ paddingTop: insets.top }}>
      {/* StatusBar serve per colore e bg della barra di stato (orario, wifii, carica..) che di default e' bianca */}
      <StatusBar barStyle="light-content" backgroundColor="#001c38" />
      <View className="flex flex-row items-center p-space xxl:p-space-xxl">
        {navigation.canGoBack() && (
          <Button
            styleWindContainer="p-6 mr-space xxl:mr-space-xxl flex-2 ml-0 h-full"
            onPress={() => navigation.goBack()}
            IconComponent={AntDesign}
            iconProps={{ name: "arrowleft" }}
            theme="header"
          />
        )}

        {userData && <UserSummary userData={userData} />}

        <Button
          styleWindContainer="p-6 xxl:p-space-xxl ml-space xxl:ml-space-xxl h-full"
          onPress={() => setOpenScan(true)}
          IconComponent={MaterialCommunityIcons}
          iconProps={{ name: "qrcode-scan" }}
          theme="header"
        />
        <QRScanner
          visible={openScan}
          onClose={() => setOpenScan(false)} // Chiudi il QRScanner
          onScanSuccess={handleScanSuccess} // Gestisci i dati scansionati
        />

        {isBigScreen && <ScanSummary item={lastScannedItem} onShowScansHistory={() => setShowScansHistory(true)} />}

        <SciaModal visible={showScansHistory} onClose={() => setShowScansHistory(false)} buttonName="Chiudi" onCllickButton={() => setShowScansHistory(false)} title={"Ultime scansioni"}>
          <ScansHistory onSelect={() => setShowScansHistory(false)} />
        </SciaModal>

        <Button
          styleWindContainer="p-6 xxl:p-space-xxl ml-space xxl:ml-space-xxl h-full"
          onPress={() => setShowMenu(!showMenu)}
          IconComponent={FontAwesome}
          iconProps={{ name: "bars" }}
          theme="header"
        />
        <Menu
          visible={showMenu}
          actions={actions}
          onClose={() => setShowMenu(false)}
          styleWind="absolute top-28 right-2.5 bg-white rounded-md shadow-lg  pt-space xxl:pt-space-xxl px-space xxl:px-space-xxl"
        />
      </View>
      <PathNavigation />
    </View>
  );
};

export default Header;
