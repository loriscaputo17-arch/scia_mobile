import { ImageSourcePropType } from "react-native";

type WarehouseInfo = {
  id: string;
  name: string;
  icon_url: string;
  user_id: string;
};

export type Location = {
  id: string;
  location: string;
  warehouse: string;
  user_id: string;
  ship_id: string;
  warehouseInfo: WarehouseInfo;
  spare_count: number;
};

export const locations: Location[] = [
  // {
  //   id: "1",
  //   warehouse: "1",
  //   location: "A12",
  //   user_id: "3",
  //   ship_id: "1",
  //   warehouseInfo: {
  //     id: "1",
  //     name: "A bordo",
  //     icon_url: "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png",
  //     user_id: "3",
  //   },
  //   spare_count: 0,
  // },
  // {
  //   id: "2",
  //   warehouse: "1",
  //   location: "A13",
  //   user_id: "3",
  //   ship_id: "1",
  //   warehouseInfo: {
  //     id: "1",
  //     name: "A bordo",
  //     icon_url: "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png",
  //     user_id: "3",
  //   },
  //   spare_count: 0,
  // },
  // {
  //   id: "3",
  //   warehouse: "2",
  //   location: "B4",
  //   user_id: "3",
  //   ship_id: "1",
  //   warehouseInfo: {
  //     id: "2",
  //     name: "In banchina",
  //     icon_url: "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png",
  //     user_id: "3",
  //   },
  //   spare_count: 0,
  // },
];
