//app/api/failures.ts
import api from "./axios";
// import { type Location } from "@/data/failures";

export type AddFailurePayload = {
  title: string;
  description: string;
  date: string; // ISO string, es: "2025-06-06"
  gravity: string; // se i valori sono predefiniti
  executionUserType: string;
  userExecution: string;
  partNumber: string;
  customFields: { name: string; value: string }[];
};

export const getFailures = async (): Promise<any[]> => {
  const res = await api.get("/failures/getFailures");
  return res.data.failures;
};

export const addFailure = async (payload: AddFailurePayload) => {
  const res = await api.post("/failures/addFailure", payload);
  return res.data;
};
