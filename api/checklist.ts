//app/api/checklist.ts
import api from "./axios";
import { type Job } from "@/data/jobs";
// import { Recurrence } from "@/data/recurrenceTresholds";

//  restituisce le manutenzioni (tutte se type_id = undefined) aventi un certo type_id (esempio della lista Annuali, Straordinari etcc..)
export const getTasks = async (ship_id: string | number, userId: string | number): Promise<Job[]> => {
  const res = await api.get(`/checklist/getTasks`, {
    params: {
      ship_id,
      userId,
    },
  });
  return res.data.tasks;
};
