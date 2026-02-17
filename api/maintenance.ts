//app/api/jobs.ts
import { type MaintenanceType } from "@/data/maintenanceTypes";
import api from "./axios";
import { type Job } from "@/data/jobs";
// import { Recurrence } from "@/data/recurrenceTresholds";


//  restituisce le manutenzioni (tutte se type_id = undefined) aventi un certo type_id (esempio della lista Annuali, Straordinari etcc..)
export const getJobs = async (type_id :  string | undefined, ship_id: string | number, user_id: string | number): Promise<Job[]> => {
  const res = await api.get(`/maintenance/jobs`, {
    params: {
      type_id: type_id ?? "undefined",
      ship_id,
      user_id,
    },
  });
  return res.data.jobs;
};

// restituisce tutti i tipi di manutenzioni (cioe' le liste di manutenzioni, come Annuali, Straordinari etcc..), con numero di task, ultima esecuzione e prossima scadenza
export const getMaintenaceTypes = async (/* type_id :  string | undefined, */ ship_id: string | number, user_id: string | number): Promise<MaintenanceType[]> => {
  const res = await api.get(`/maintenance/type`, {
    params: {
      // type_id,
      ship_id,
      user_id,
    },
  });
  return res.data.maintenanceTypes;
};

export const updateStatus = async (maintenance_id :  string | undefined, status_id: string | number) => {
  const res = await api.post( `/maintenance/updateStatus/${maintenance_id}`, { status_id});
  return res.data;
};

// restituisce tutte le ricorrenze con relative threshold ("Daily, Yearly..") 
// export const getGeneralTypes = async (): Promise<Recurrence[]> => {
//   const res = await api.get(`/maintenance/getGeneralTypes`);
//   return res.data;
// };

