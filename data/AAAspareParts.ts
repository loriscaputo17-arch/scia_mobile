import { ImageSourcePropType } from "react-native";

export type SparePart = {
  name: string;
  id: string;
  img: ImageSourcePropType;
  stockOutThresold: number;
  partNumber: string;
  supplier: string;
  description: string;
  price: number;
  systemId: string;
};

export const spareParts: SparePart[] = [
  {
    id: "ricambio_n_3",
    name: "Ricambio numero 3",
    img: require("@/assets/images/propulsione_diesel.png"),
    stockOutThresold: 5, // da aggiornare
    price: 190,
    partNumber: "SIMB15013272Z",
    systemId: "propulsione_elettrica",
    description: "",
    supplier: "My Company Srl",
  },
  {
    id: "cinghia_di_distribuzione",
    name: "Cinghia di distribuzione",
    img: require("@/assets/images/propulsione_diesel.png"),
    stockOutThresold: 7, // da aggiornare
    price: 150,
    partNumber: "AAMB15013272Z",
    systemId: "propulsione_elettrica",
    description: "",
    supplier: "IJES ltd",
  },
];
