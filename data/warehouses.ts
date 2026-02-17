import { ImageSourcePropType } from "react-native";

export type Warehouse = {
  id: string;
  name: string;
  icon_url: ImageSourcePropType | string; // ImageSourcePropType -> per le immagini statiche (utile per il development), string per le immagini dinamiche.
};

export const warehouses: Warehouse[] = [
  {
    id: "1",
    name: "A bordo",
    icon_url: "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png",
  },
  {
    id: "2",
    name: "In banchina",
    icon_url: "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png",
  },
  {
    id: "3",
    name: "In bacino",
    icon_url: "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png",
  },
  { id: "4", 
    name: "Fornitore esterno", 
    icon_url: "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png" 
  },
];
