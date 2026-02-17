import { ImageSourcePropType } from "react-native";

// NB: Da aggiornare. Definire con cliente quali sono precisamente gli impianti.. sono invertiti 
// //(2.1.4 Propulsione Diesel e' la classificazione ESWBS, Propulsione Diesel nell'albero WSWBS e' il padre di Motore Centrale che e' invece il sistema/impianto )


export type System = {
  id: string;
  name: string;
  fullName: string;
  macro: string;
  manufacturer: string;
  img: ImageSourcePropType | string; // ImageSourcePropType -> per le immagini statiche (utile per il development), string per le immagini dinamiche.
  motionHours: number;
  lastUpdateMotionHours: string;
  automaticHoursUpdate: boolean;
  serialNumber: string;
  model3D: ImageSourcePropType | string;
  shortDescription: string;
  description: string;
  maintenences: string[];
  explodedView?: ImageSourcePropType | string;
};

export type Systems = {
  [key: string]: System;
};

export const systems: Systems = {
  propulsione_diesel: {
    id: "propulsione_diesel",
    name: "Propulsione Diesel",
    fullName: "2.1.4 Propulsione Diesel",
    macro: "motore_centrale",
    manufacturer: "New Wave Ltd",
    img: require("@/assets/images/propulsione_diesel.png"),
    motionHours: 1200,
    lastUpdateMotionHours: "2024-05-06T08:30:00Z",
    automaticHoursUpdate: false,
    serialNumber: "19028393028A",
    model3D: require("@/assets/images/propulsione_diesel_3D.png"),
    explodedView: require("@/assets/images/schema_tecnico.png"),
    shortDescription: "",
    description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
    maintenences: ["fare_defluire_acqua_e_sporcizia_dal_prefiltro", "filtro_indicatore_olio_controllo_e_pulizia_filtro"],
  },
  
  propulsione_elettrica: {
    id: "propulsione_elettrica",
    name: "Propulsione Elettrica",
    fullName: "2.1.5 Propulsione Elettrica",
    macro: "impianto_elettrico",
    manufacturer: "GreenTech Motors",
    img: require("@/assets/images/propulsione_diesel.png"),
    motionHours: 850,
    lastUpdateMotionHours: "2024-06-15T14:45:00Z",
    automaticHoursUpdate: true,
    serialNumber: "ELT2039485B",
    model3D: require("@/assets/images/propulsione_diesel_3D.png"),
    explodedView: require("@/assets/images/schema_tecnico.png"),
    shortDescription: "Motore elettrico ad alta efficienza per propulsione navale.",
    description:
      "Il sistema di propulsione elettrica offre un'alternativa ecologica ed efficiente ai motori a combustione. Grazie alla ridotta emissione di CO₂ e alla maggiore efficienza energetica, rappresenta una soluzione ideale per imbarcazioni moderne. Il motore richiede manutenzione minima e garantisce prestazioni elevate con una notevole riduzione del rumore e delle vibrazioni. La gestione intelligente della carica delle batterie e il raffreddamento ottimizzato contribuiscono a prolungarne la durata operativa e a ridurre i costi di gestione.",
    maintenences: ["manutenzione_di_qualcosa", "manutenzione_blabla", "manutenzione_blabla_2"],
  },

  testSystem: {
    id: "testSystem",
    name: "Test System",
    fullName: "3.3.3 Test System",
    macro: "scafo",
    manufacturer: "GreenTech Motors",
    img: require("@/assets/images/propulsione_diesel.png"),
    motionHours: 850,
    lastUpdateMotionHours: "2024-06-15T14:45:00Z",
    automaticHoursUpdate: true,
    serialNumber: "XXX123456789",
    model3D: require("@/assets/images/propulsione_diesel_3D.png"),
    explodedView: require("@/assets/images/schema_tecnico.png"),
    shortDescription: "Sistema di test, da sostituire con un dato vero.",
    description:
      "Descrizione blablabla.",
    maintenences: ["manutenzione_blabla_3", "manutenzione_per_qualcosa_di_tipo_annuali", "manutenzione_per_qualcosa_di_tipo_straordinari", "manutenzione_aa", "manutenzione_ab"],
  },

  quadro_elettrico: {
    id: "quadro_elettrico",
    name: "Quadro elettrico",
    fullName: "3.2.2 Quadro elettrico",
    macro: "impianto_elettrico",
    manufacturer: "GreenTech Motors",
    img: require("@/assets/images/propulsione_diesel.png"),
    motionHours: 850,
    lastUpdateMotionHours: "2024-06-15T14:45:00Z",
    automaticHoursUpdate: true,
    serialNumber: "XXS122256789",
    model3D: require("@/assets/images/propulsione_diesel_3D.png"),
    explodedView: require("@/assets/images/schema_tecnico.png"),
    shortDescription: "Sistema di test, da sostituire con un dato vero.",
    description:
      "Descrizione blablabla.",
    maintenences: ["manutenzione_blabla_3", "manutenzione_per_qualcosa_di_tipo_annuali", "manutenzione_per_qualcosa_di_tipo_straordinari", "manutenzione_aa", "manutenzione_ab"],
  },

  scafo_struttura: {
    id: "scafo_struttura",
    name: "Scafo e struttura",
    fullName: "1.2.1 Scafo e struttura",
    macro: "scafo",
    manufacturer: "GreenTech Motors",
    img: require("@/assets/images/propulsione_diesel.png"),
    motionHours: 850,
    lastUpdateMotionHours: "2024-06-15T14:45:00Z",
    automaticHoursUpdate: true,
    serialNumber: "EES122256789",
    model3D: require("@/assets/images/propulsione_diesel_3D.png"),
    explodedView: require("@/assets/images/schema_tecnico.png"),
    shortDescription: "Sistema di test, da sostituire con un dato vero.",
    description:
      "Descrizione blablabla.",
    maintenences: ["manutenzione_blabla_3", "manutenzione_per_qualcosa_di_tipo_annuali", "manutenzione_per_qualcosa_di_tipo_straordinari", "manutenzione_aa", "manutenzione_ab"],
  },
  controllo_sicurezza_entrata: {
    id: "controllo_sicurezza_entrata",
    name: "controllo di sicurezza entrata",
    fullName: "4.5.1 Controllo sicurezza entrata",
    macro: "comando_controllo_sorveglianza",
    manufacturer: "GreenTech Motors",
    img: require("@/assets/images/propulsione_diesel.png"),
    motionHours: 850,
    lastUpdateMotionHours: "2024-06-15T14:45:00Z",
    automaticHoursUpdate: true,
    serialNumber: "PPS122256789",
    model3D: require("@/assets/images/propulsione_diesel_3D.png"),
    explodedView: require("@/assets/images/schema_tecnico.png"),
    shortDescription: "Sistema di test, da sostituire con un dato vero.",
    description:
      "Descrizione blablabla.",
    maintenences: ["manutenzione_blabla_3", "manutenzione_per_qualcosa_di_tipo_annuali", "manutenzione_per_qualcosa_di_tipo_straordinari", "manutenzione_aa", "manutenzione_ab"],
  },
};
