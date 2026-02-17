//app/api/shipFiles.ts
import { ShipFile } from "@/data/shipFiles";
import api from "./axios";

export const getFiles = async (ship_id: string | number, user_id: string | number): Promise<ShipFile[]> => {
  const res = await api.get("shipFiles/getFiles", {
    params: {
      ship_id,
      user_id,
    },
  });
  return res.data.files;
};

