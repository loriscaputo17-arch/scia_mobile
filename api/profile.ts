import { type User } from "@/data/users";
import api from "./axios";

type PayloadUpdateUser = {
    userId: string;
    firstName?: string;
    lastName?: string;
    rank?: string;
    // profileImage?: ImageSourcePropType | string;
    email?: string;
    phoneNumber?: string;
}


export const getProfile = async () => {
  return api.get("/profile/getProfile");
};


export const updateProfile = async (payload: PayloadUpdateUser) => {
  return api.post("/profile/updateProfile", payload);
};

export const getRanks = async () => {
  return api.get("/profile/getRanks");
};



/* funzione fake OFFLINE */
// export const getProfile = async () => {
//   // Simula ritardo rete
//   await new Promise(resolve => setTimeout(resolve, 500));

//   // Simula risposta positiva
//   return {
//     status: 200,
//     data: {
//       name: "Mario Rossi",
//       email: "test@gmail.com",
//       role: "Amministratore",
//     }
//   };
// };