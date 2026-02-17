import { IconComponentProps, type IconCollection } from "@/components/atoms/IconComponent";

export type ClassificationID =
  | "scadenza_temporale"
  | "scadenza_per_ore_di_moto"
  | "job_bloccante"
  | "fermo_previsto"
  | "ultimo_esito_negativo"
  | "ricambi_richiesti"
  | "ricambi_richiesti_disponibili"
  | "ricambi_richiesti_non_disponibili"
  | "ricambi_richiesti_in_esaurimento";

export type Classification = {
  id: ClassificationID;
  label: string;
} & IconComponentProps;

export type Classifications = Record<ClassificationID, Classification>;

export const classifications: Classifications = {
  scadenza_temporale: {
    id: "scadenza_temporale",
    label: "Scadenza temporale",
    iconCollection: "FontAwesome5",
    iconProps: { name: "calendar-alt", color: "#789FD6", size: 28 },
  },
  scadenza_per_ore_di_moto: {
    id: "scadenza_per_ore_di_moto",
    label: "Scadenza per ore di moto",
    iconCollection: "FontAwesome5",
    iconProps: { name: "clock", color: "#789FD6", size: 28 },
  },
  job_bloccante: {
    id: "job_bloccante",
    label: "Job bloccante",
    iconCollection: "MaterialIcons",
    iconProps: { name: "block", color: "red", size: 28 },
  },
  fermo_previsto: {
    id: "fermo_previsto",
    label: "Fermo previsto",
    iconCollection: "Ionicons",
    iconProps: { name: "hand-right-sharp", color: "pink", size: 28 },
  },
  ultimo_esito_negativo: {
    id: "ultimo_esito_negativo",
    label: "Ultimo esito negativo",
    iconCollection: "Ionicons",
    iconProps: { name: "warning", color: "#F47217", size: 28 },
  },

  ricambi_richiesti: {
    id: "ricambi_richiesti",
    label: "Ricambi richiesti",
    iconCollection: "FontAwesome6",
    iconProps: { name: "plug", color: "#9B9B9B", size: 28 },
  },
  ricambi_richiesti_disponibili: {
    id: "ricambi_richiesti_disponibili",
    label: "Ricambi richiesti disponibili",
    iconCollection: "FontAwesome6",
    iconProps: { name: "plug-circle-check", color: "green", size: 28 },
  },
  ricambi_richiesti_non_disponibili: {
    id: "ricambi_richiesti_non_disponibili",
    label: "Ricambi richiesti non disponibili",
    iconCollection: "FontAwesome6",
    iconProps: { name: "plug-circle-xmark", color: "red", size: 28 },
  },
  ricambi_richiesti_in_esaurimento: {
    id: "ricambi_richiesti_in_esaurimento",
    label: "Ricambi richiesti in esaurimento",
    iconCollection: "FontAwesome6",
    iconProps: { name: "plug-circle-exclamation", color: "#F47217", size: 28 },
  },
};
