import { type IconComponentProps } from "@/components/atoms/IconComponent";

export type MacroSystemId = "scafo" | "propulsioni_motori" | "impianto_elettrico" | "comando_controllo_sorveglianza" | "impianti_ausiliari" | "motore_centrale";

export type MacroSystemDetails = {
  id: MacroSystemId;
  name: string;
  IconComponent: IconComponentProps;
};

export type MacroSystem = Record<MacroSystemId, MacroSystemDetails>;

export const macroSystems: MacroSystem = {
  scafo: {
    id: "scafo",
    name: "Scafo",
    IconComponent: {
      iconCollection: "MaterialIcons",
      iconProps: { name: "directions-boat", color: "#9ca3af" },
    },
  },
  propulsioni_motori: {
    id: "propulsioni_motori",
    name: "Propulsioni/Motori",
    IconComponent: {
      iconCollection: "MaterialCommunityIcons",
      iconProps: { name: "engine", color: "#9ca3af" },
    },
  },
  motore_centrale: {
    id: "motore_centrale",
    name: "Motore Centrale",
    IconComponent: {
      iconCollection: "MaterialCommunityIcons",
      iconProps: { name: "engine", color: "#9ca3af" },
    },
  },
  impianto_elettrico: {
    id: "impianto_elettrico",
    name: "Impianto elettrico",
    IconComponent: {
      iconCollection: "MaterialIcons",
      iconProps: { name: "electrical-services", color: "#9ca3af" },
    },
  },
  comando_controllo_sorveglianza: {
    id: "comando_controllo_sorveglianza",
    name: "Comando, controllo e sorveglianza",
    IconComponent: {
      iconCollection: "Ionicons",
      iconProps: { name: "speedometer", color: "#9ca3af" },
    },
  },
  impianti_ausiliari: {
    id: "impianti_ausiliari",
    name: "Impianti ausiliari",
    IconComponent: {
      iconCollection: "MaterialCommunityIcons",
      iconProps: { name: "alert-rhombus", color: "#9ca3af" },
    },
  },
};
