export type SeverityId = "critica" | "alta" | "media" | "bassa";
import { ViewStyle } from "react-native";

export type Severity = {
  id: SeverityId;
  label: string;
  styleWindColor: string;
  styleColor: ViewStyle;
};

export type SeverityLevel = Record<SeverityId, Severity>;

export const severities: SeverityLevel = {
  critica: {
    id: "critica",
    label: "Gravita' critica",
    styleWindColor: "bg-customRed", // Rosso
    styleColor: { backgroundColor: "#ff0000" }, // Rosso
  },
  alta: {
    id: "alta",
    label: "Gravita' alta",
    styleWindColor: "bg-customOrange", // Arancione
    styleColor: { backgroundColor: "#ffa000" }, // Arancione
  },
  media: {
    id: "media",
    label: "Gravita' media",
    styleWindColor: "bg-customYelmedia", // Giallo
    styleColor: { backgroundColor: "#fff000" }, // Giallo
  },
  bassa: {
    id: "bassa",
    label: "Gravita' bassa",
    styleWindColor: "bg-customGreen", // Verde
    styleColor: { backgroundColor: "#008000" }, // Verde
  },
};
