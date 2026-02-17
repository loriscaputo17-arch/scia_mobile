import { MaterialIcons, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Recurrence } from "./recurrenceTresholds";
import { IconCollection, IconComponentProps } from "@/components/atoms/IconComponent";
import { type MaintenanceLevelId } from "./levels";
import { type TeamID } from "./teams";
import { ViewStyle } from "react-native";

export type MaintenanceStatus = "expired" | "inPause" | "recentlyExpired" | "expiring" | "active" | "scheduled";
export const maintenanceStatuses: MaintenanceStatus[] = ["expired", "recentlyExpired", "expiring", "active", "inPause", "scheduled"];

// Oggetto di mapping per i colori di classe
export const statusStyleWindColor: Record<MaintenanceStatus, string> = {
  expired: "bg-customRed", // Rosso
  recentlyExpired: "bg-customOrange", // Arancione
  expiring: "bg-customYellow", // Giallo
  active: "bg-customGreen", // Verde
  inPause: "bg-white opacity-20", //Grey
  scheduled: "bg-secondary",
};

// Oggetto di mapping per i colori esadecimali
export const statusStyleColor: Record<MaintenanceStatus, ViewStyle> = {
  expired: { backgroundColor: "#ff0000" }, // Rosso
  recentlyExpired: { backgroundColor: "#ffa000" }, // Arancione
  expiring: { backgroundColor: "#fff000" }, // Giallo
  active: { backgroundColor: "#008000" }, // Verde
  inPause: { backgroundColor: "#fff", opacity: 0.2 },
  scheduled: { backgroundColor: "#022a52" },
};

export const maintenanceStatusIds: Record<MaintenanceStatus, number> = {
  active: 1,
  expired: 2, 
  inPause: 3, 
  recentlyExpired: 4, 
  expiring: 5, 
  scheduled: 6, 
};

// Esempi di utilizzo
//const isoString1 = "2024-04-10T11:30:00Z"; // UTC
//const isoString2 = "2024-04-10T11:30:00+02:00"; // Offset specifico del fuso orario

export type Maintenance = {
  id: string;
  name: string;
  // systemName: string;
  systemId: string;
  /* iconComponentImpianto: IconCollection;
  iconPropsImpianto: {
    name: string;
    color: string;
  }; */
  listId: string;
  expiryDate: string; //formato ISO 8601 (esempio "2024-04-10T11:30:00Z" // UTC ----- "2024-04-10T11:30:00+02:00" // Offset specifico del fuso orario (CEST))
  lastExecution?: string;
  recurrence: Recurrence;
  description?: string;
  levelId: MaintenanceLevelId;
  team: TeamID;
  pause: boolean;
  pauseDate?: string; // la data di pausa (se e' stata messa in pausa) della mansione
  classification: string[];
  replacements: string[];
};

export const maintenances: Maintenance[] = [
  {
    id: "fare_defluire_acqua_e_sporcizia_dal_prefiltro",
    name: "Fare defluire acqua e sporcizia dal prefiltro",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "propulsione_diesel",
    listId: "manutenzioni_ordinarie",
    expiryDate: "2024-09-24T20:50:00+02:00",
    recurrence: "Settimanale",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    levelId: "aBordo",
    team: "manutentore",
    pause: false,
    // pauseDate: "2024-09-22T18:10:00",
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: ["cinghia_di_distribuzione", "ricambio_n_2", "ricambio_n_3", "ricambio_n_4", "ricambio_n_5", "ricambio_n_6", "ricambio_n_7", "ricambio_n_8", "ricambio_n_9"],
  },
  {
    id: "filtro_indicatore_olio_controllo_e_pulizia_filtro",
    name: "Filtro indicatore olio, controllo e pulizia filtro idraulico. ",
    // systemName: "3.2.1 Scafo e struttura",
    systemId: "propulsione_diesel",
    listId: "manutenzioni_ordinarie",
    expiryDate: "2024-05-14T15:30:00+02:00",
    recurrence: "Settimanale",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    levelId: "inBanchina",
    team: "operatore",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: ["ricambio_n_2"],
  },
  {
    id: "manutenzione_di_qualcosa",
    name: "medio",
    // systemName: "2.1.4 Motore centrale",
    systemId: "propulsione_elettrica",
    listId: "manutenzioni_ordinarie",
    expiryDate: "2024-05-14T15:30:00+02:00",
    recurrence: "Bisettimanale",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    levelId: "inBanchina",
    team: "operatore",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: [],
  },
  {
    id: "manutenzione_blabla",
    name: "manutenzione blabla",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "propulsione_elettrica",
    listId: "manutenzioni_ordinarie",
    expiryDate: "2024-04-10T11:30:00Z",
    recurrence: "Bisettimanale",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    levelId: "fornitoreEsterno",
    team: "comando",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: ["ricambio_n_2", "ricambio_n_3"],
  },
  {
    id: "manutenzione_blabla_2",
    name: "manutenzione blabla 2",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "propulsione_elettrica",
    listId: "manutenzioni_ordinarie",
    expiryDate: "2024-04-10T11:30:00Z",
    recurrence: "Bisettimanale",
    levelId: "inBacino",
    team: "comando",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: [],
  },
  {
    id: "manutenzione_blabla_3",
    name: "manutenzione blabla 3",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "testSystem",
    listId: "manutenzioni_ordinarie",
    expiryDate: "2025-04-10T11:30:00Z",
    recurrence: "Bisettimanale",
    levelId: "inBanchina",
    team: "operatore",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: [],
  },
  {
    id: "manutenzione_per_qualcosa_di_tipo_annuali",
    name: "manutenzione per qualcosa di tipo annuali",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "testSystem",
    listId: "manutenzioni_annuali",
    expiryDate: "2024-05-14T15:30:00+02:00",
    recurrence: "Bisettimanale",
    levelId: "inBacino",
    team: "operatore",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: [],
  },
  {
    id: "manutenzione_per_qualcosa_di_tipo_straordinari",
    name: "manutenzione per qualcosa straordinaria",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "testSystem",
    listId: "manutenzioni_straordinarie",
    expiryDate: "2024-05-14T15:30:00+02:00",
    recurrence: "Bisettimanale",
    levelId: "fornitoreEsterno",
    team: "operatore",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: [],
  },
  {
    id: "manutenzione_aa",
    name: "manutenzione aa",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "testSystem",
    listId: "manutenzioni_aa",
    expiryDate: "2024-05-14T15:30:00+02:00",
    recurrence: "Bisettimanale",
    levelId: "fornitoreEsterno",
    team: "operatore",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: [],
  },
  {
    id: "manutenzione_ab",
    name: "manutenzione ab",
    // systemName: "2.1.4 Propulsione Diesel",
    systemId: "testSystem",
    listId: "manutenzioni_ab",
    expiryDate: "2024-05-14T15:30:00+02:00",
    recurrence: "Bisettimanale",
    levelId: "inBanchina",
    team: "comando",
    pause: false,
    classification: ["Scadenza temporale", "Job bloccante", "Ricambi richiesti"],
    replacements: [],
  },
];
