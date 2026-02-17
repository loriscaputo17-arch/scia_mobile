
import { type Replacement } from "@/data/replacements";
import api from "./axios";

export const getSpares = async (ship_id: string | number): Promise<Replacement[]> => {
  const res = await api.get("/spare/getSpares", {
    params: {
      ship_id,
    },
  });
  return res.data.spares;
};

// export const getSpare = async (serial_number: string ): Promise<Replacement[]> => {
//   const res = await api.get("/locations/getSpares", {
//     params: {
//       serial_number,
//     },
//   });
//   return res.data.spares;
// };


