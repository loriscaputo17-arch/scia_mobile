import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import SectionContainer from "../atoms/SectionContainer";
import SectionHeader from "../atoms/SectionHeader";
import Button from "../atoms/Button";
import { type Replacement } from "@/data/replacements";
import { MaterialIcons } from "@expo/vector-icons";
import SciaModal from "../molecules/SciaModal";
import { router } from "expo-router";
import AddToCart from "../molecules/AddToCart";
import SectionLayout from "../atoms/SectionLayout";
import Field from "../atoms/Field";
import { RenderSparePartStockInfo } from "../molecules/RenderSparePartStockInfo";
import { getImageSource } from "@/utils/getImageSource";
import IconComponent from "../atoms/IconComponent";
import { MacroSystemId, macroSystems } from "@/data/macroSystems";
import { systems } from "@/data/systems";
import { useDispatch, useSelector } from "react-redux";
import SpareWarehouseList from "../molecules/SpareWarehouseList";
import { addProduct, updateProduct } from "@/api/cart";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { selectCartQuantityBySpareId } from "@/features/cartItems/cartItemsSlice";
import { useCartSync } from "@/hooks/useCartSync";

type MalfunctionDetailsProps = {
  replacement: Replacement;
};

export default function ReplacementDetails({ replacement }: MalfunctionDetailsProps) {
  const [showAddToCart, setShowAddToCart] = useState(false);
  //da sostituire con dati veri:
  const replacementSystemID = "propulsione_diesel";
  const replacementImage = require("@/assets/images/propulsione_diesel.png");
  const ean13Image = require("@/assets/images/ean13Image.png");
  const manufacturerNCAGE = "F0781";
  const manufacturerPartNumber = "15013272Z";
  const supplierNCAGE = "AL492";
  const replacementSupplier = "My Company Srl";
  const replacementDescription = "Buon sostituto per guarnizione vecchia o danneggiata, guarnizio…";

  const macroSystemId = systems[replacementSystemID].macro;
  const [showDetails, setShowDetails] = useState(false);
  const userID = useSelector(selectCurrentUser)?.id;
  const quantity = useSelector(selectCartQuantityBySpareId(replacement.ID)); // → 3 (se presente)
  const { refresh } = useCartSync();

  const handleAddToCart = async () => {
    if (!userID) return;
    setShowAddToCart(true);
    try {
      const res = await addProduct({ spare_id: replacement.ID, user_id: userID, quantity: 1, status: "in_attesa" });

      if (res && res.message === "Prodotto aggiornato nel carrello") {
        refresh();
      }
    } catch (error) {
      Alert.alert("Errore", "Impossibile aggiornare la quantita'.");
      console.error("Errore aggiornamento quantita' prodotto nel carrello:", error);
    }
  };

  return (
    <SectionContainer>
      <SectionHeader
        leftContent={<Text className="text-primary text-xl font-bold">{replacement.Part_name}</Text>}
        rightContent={
          <>
            <Button
              label="Aggiungi"
              onPress={handleAddToCart}
              IconComponent={MaterialIcons}
              iconProps={{ name: "shopping-cart", color: "white", size: 24 }}
              styleWindContainer="bg-secondary mr-space"
              theme="default"
            />
            <Button
              label="Push&Buy"
              onPress={() => alert("Push And Buy")}
              IconComponent={MaterialIcons}
              iconProps={{ name: "bolt", color: "white", size: 24 }}
              styleWindContainer="bg-tertiary"
              theme="default"
            />
          </>
        }
      />

      <SciaModal visible={showAddToCart} onClose={() => setShowAddToCart(false)} sizeH="small" title={"Aggiunto al carrello"}>
        <AddToCart
          onAddOtherProducts={() => {
            router.push(`/dashboard/catalogo_ricambi`);
            setShowAddToCart(false);
          }}
          onAddToCart={() => {
            router.push(`/dashboard/carrello`);
            setShowAddToCart(false);
          }}
        />
      </SciaModal>

      <SectionLayout
        leftContent={
          <>
            <View className="flex-row mb-4 h-">
              <Field containerStyle="flex-1" label="Part Number" value={replacement.Serial_number} />
              <Field
                containerStyle="flex-1"
                label="Magazzino (ubicazioni)"
                child={
                  <>
                    <SpareWarehouseList spare={replacement} styleWind="mb-space xxl:mb-space-xxl" />
                    <Button label="Gestisci" onPress={() => router.push(`/dashboard/catalogo_ricambi`)} styleWindContainer="bg-quaternary" theme="default" />
                  </>
                }
              />
            </View>

            <View className="flex-row mb-4">
              <Field containerStyle="flex-1" label="Immagine" child={<Image source={getImageSource(replacementImage)} className="w-16 h-16 mt-2 rounded-md" />} />
              <Field containerStyle="flex-1" label="EAN13" child={<Image source={getImageSource(ean13Image)} className="w-28 h-16 mt-2 rounded-md" />} />
            </View>

            <View className="flex-row mb-4">
              <Field containerStyle="flex-1" label="Q.tà installata" value="2" />
              <Field
                containerStyle="flex-1"
                label="Ordini"
                child={
                  <TouchableOpacity className="flex-row justify-between" onPress={() => router.push(`/dashboard/carrello`)}>
                    <View className="flex-row items-center space-x-1">
                      <IconComponent iconCollection="MaterialIcons" iconProps={{ name: "shopping-cart", color: "#9ca3af" }} />
                      <Text className="text-primary font-bold ml-2">In ordine</Text>
                      <Text className="text-secondary">{`(${quantity})`}</Text>
                    </View>
                    <IconComponent iconCollection="MaterialIcons" iconProps={{ name: "navigate-next", size: 26, color: "#fff" }} />
                  </TouchableOpacity>
                }
              />
            </View>

            <View className="flex-row mb-4">
              <Field containerStyle="flex-1" label="Denominazione originale" value={replacement.Part_name} />
              <Field
                containerStyle="flex-1"
                label="Impianto/Componente"
                child={
                  <TouchableOpacity className="flex-row justify-between" onPress={() => router.push(`/dashboard/impianti/${replacementSystemID}`)}>
                    <View className="flex-row items-center">
                      <IconComponent {...macroSystems[macroSystemId as MacroSystemId].IconComponent} />
                      <Text className="text-primary font-bold ml-2">{systems[replacementSystemID].fullName}</Text>
                    </View>
                    <IconComponent iconCollection="MaterialIcons" iconProps={{ name: "navigate-next", size: 26, color: "#fff" }} />
                  </TouchableOpacity>
                }
              />
            </View>

            <View className="flex-row mb-4">
              <Field containerStyle="flex-1" label="NCAGE Costruttore" value={manufacturerNCAGE} />
              <Field containerStyle="flex-1" label="Part Number Costruttore" value={manufacturerPartNumber} />
            </View>
          </>
        }
        rightContent={
          <>
            <Field label="Descrizione" value={replacementDescription} child={<Button label="Dettagli" onPress={() => setShowDetails(true)} styleWindContainer="bg-quaternary" theme="default" />} />
            <Field label="Prezzo" value={`${Number(replacement.Unitary_price).toFixed(2)} €`} />
            <Field label="Lead time" value={`${replacement.Provisioning_Lead_Time_PLT}`} />
            <Field label="Fornitore" value={replacementSupplier} />
            <Field label="NCAGE Fornitore" value={supplierNCAGE} />
          </>
        }
      />

      <SciaModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        title={"Dettagli impianto"}
        onCllickButton={() => {
          setShowDetails(false);
        }}
        buttonName="Chiudi"
      >
        <ScrollView>
          <View className="bg-primaryLighter p-space xxl:p-space-xxl rounded-md mb-space">
            <Text className="text-primary">{replacementDescription}</Text>
          </View>
        </ScrollView>
      </SciaModal>

      {/* Modal Edit motionHours */}

      {/* <SciaModal visible={showEditHours} onClose={() => setShowEditHours(false)} title={"Inserisci valore (ore)"} buttonName="Conferma">
        <Calculator
          label={"h"}
          onConfirm={(value) => {
            setShowEditHours(false);
            handleUpdateMotionHours(value);
          }}
        />
      </SciaModal> */}

      {/* Modal: Note fotografiche  */}
      {/* <SciaModal
        visible={showImageNotesHistory || showImageNotes}
        onClose={() => {
          setShowImageNotesHistory(false);
          setShowImageNotes(false);
        }}
        title={"Storico note fotografiche"}
        onCllickButton={() => {
          setShowImageNotesHistory(false);
          setShowImageNotes(false);
        }}
        buttonName="Chiudi"
      >
        <ImageNotesHistory history={mergedHistory.slice().reverse()} historyEntry={showImageNotes ? lastNoteHistoryEntry : undefined} step={showImageNotes ? 1 : 0} users={users} />
      </SciaModal> */}

      {/* Modal: Note Vocali  */}
      {/* <SciaModal visible={showAudioNotes} onClose={() => setShowAudioNotes(false)} title={"Storico note vocali"} onCllickButton={() => setShowAudioNotes(false)} buttonName="Chiudi">
        <AudioNotesHistory history={mergedHistory.slice().reverse()} users={users} />
      </SciaModal> */}

      {/* Modal: Note testuali  */}
      {/* <SciaModal visible={showTextNotes} onClose={() => setShowTextNotes(false)} title={"Storico note testuali"} onCllickButton={() => setShowTextNotes(false)} buttonName="Chiudi">
        <TextNotesHistory history={mergedHistory.slice().reverse()} users={users} />
      </SciaModal> */}
    </SectionContainer>
  );
}
