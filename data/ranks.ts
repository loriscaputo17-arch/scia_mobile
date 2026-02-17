import { ImageSourcePropType } from "react-native";

export type Rank = {
  id: string;
  grado: string;
  distintivo_controspallina: ImageSourcePropType | string; // ImageSourcePropType -> per le immagini statiche (utile per il development), string per le immagini dinamiche.
  codice_nato: string;
};

export const ranks: Rank[] = [
  {
    id: "1",
    grado: "Ammiraglio",
    distintivo_controspallina: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Shoulder_rank_insignia_of_ammiraglio_of_the_Italian_Navy.svg/100px-Shoulder_rank_insignia_of_ammiraglio_of_the_Italian_Navy.svg.png",
    codice_nato: "OF-10",
  },
  {
    id: "2",
    grado: "Ammiraglio di squadra con incarichi speciali",
    distintivo_controspallina:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Shoulder_rank_insignia_of_ammiraglio_di_squadra_con_incarichi_speciali_of_the_Italian_Navy.svg/100px-Shoulder_rank_insignia_of_ammiraglio_di_squadra_con_incarichi_speciali_of_the_Italian_Navy.svg.png",
    codice_nato: "OF-9",
  },
  {
    id: "3",
    grado: "Ammiraglio di squadra",
    distintivo_controspallina:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Shoulder_rank_insignia_of_ammiraglio_di_squadra_of_the_Italian_Navy.svg/100px-Shoulder_rank_insignia_of_ammiraglio_di_squadra_of_the_Italian_Navy.svg.png",
    codice_nato: "OF-8",
  },
  {
    id: "4",
    grado: "Ammiraglio ispettore capo",
    distintivo_controspallina:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Shoulder_rank_insignia_of_ammiraglio_ispettore_comandante_of_the_Italian_Navy.svg/120px-Shoulder_rank_insignia_of_ammiraglio_ispettore_comandante_of_the_Italian_Navy.svg.png",
    codice_nato: "OF-8",
  },
];
