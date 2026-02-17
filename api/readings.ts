//app/api/readings.ts
import { type Reading } from "@/data/readings";
import api from "./axios";

export const getReadings = async (ship_id: string | number, user_id: string | number): Promise<Reading[]> => {
  const res = await api.get("/readings/getReadings", {
    params: {
      ship_id,
      user_id,
    },
  });
  return res.data;
};
