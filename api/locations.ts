//app/api/locations.ts
import api from "./axios";
import { type Location } from "@/data/locations";

// POST location
export type AddLocationPayload = {
  warehouse: string;
  ship_id: string;
  user_id: string | number;
  location: string;
};

export const getLocations = async (ship_id: string | number, user_id: string | number): Promise<Location[]> => {
  const res = await api.get("/locations/getLocations", {
    params: {
      ship_id,
      user_id,
    },
  });
  return res.data.locations;
};


export const addLocation = async (payload: AddLocationPayload) => {
  const res = await api.post("/locations/addLocation", payload);
  return res.data;
};