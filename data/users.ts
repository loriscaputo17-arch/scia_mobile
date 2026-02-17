import { ImageSourcePropType } from "react-native";

/* export type User = {
    name:string,
    firstName: string,
    lastName: string,
    email?: string,
    phone?: string,
    id: string,
    rankID?: string, // il grado e' presente solo per i militari
    profileImg?: ImageSourcePropType | string, // ImageSourcePropType -> per le immagini statiche (utile per il development), string per le immagini dinamiche.
    role: string,
    team?: string,
    supervisor?: string,
    subscription: string, //formato ISO 8601 (esempio "2024-04-10T11:30:00Z" // UTC ----- "2024-04-10T11:30:00+02:00" // Offset specifico del fuso orario (CEST))
} */

export type User = {
  id: string;
  userId?: string; //id = userId. Errore nelle API, duplicato.
  firstName: string;
  lastName: string;
  //name:string,
  //rankID?: string, // il grado e' presente solo per i militari
  rank: string; // il grado e' presente solo per i militari
  role?: string;
  type: string;
  // profileImg?: ImageSourcePropType | string, // ImageSourcePropType -> per le immagini statiche (utile per il development), string per le immagini dinamiche.
  profileImage?: ImageSourcePropType | string; // ImageSourcePropType -> per le immagini statiche (utile per il development), string per le immagini dinamiche.
  email: string;
  // phone?: string,
  phoneNumber: string;
  registrationDate: string; //formato ISO 8601 (esempio "2024-04-10T11:30:00Z" // UTC ----- "2024-04-10T11:30:00+02:00" // Offset specifico del fuso orario (CEST))
  // subscription: string,
  // team?: string,
  team?: {
    id: number;
    name: string;
  };
  // supervisor?: string,
  teamLeader?: {
    firstName: string;
    lastName: string;
  };
};

/* 
{
    "id": 3,
    "firstName": "Loris2",
    "lastName": "Caputo",
    "rank": "1",
    "type": "Operatore",
    "role": "",
    "profileImage": "https://scia-project-questit.s3.eu-central-1.amazonaws.com/profile_images/3.jpg",
    "email": "test@gmail.com",
    "phoneNumber": "+39 347 86 55415",
    "registrationDate": "2025-03-18T14:30:45.000Z",
    "team": {
        "id": 4,
        "name": "Comando"
    },
    "teamLeader": {
        "firstName": "Loris2",
        "lastName": "Caputo"
    }
}
 */

export type Users = Record<string, User>;

//USERS sara' da aggiornare con opportuno tipo "UserSummary" , visto che viene la lista users serve solo a rintracciare alcune info degli utenti che hanno svolto vechhie manutenzioni/ letture etcc..
export const users: Users = {
  "3": {
    id: "3",
    firstName: "Loris2",
    lastName: "Caputo",
    rank: "1",
    type: "Operatore",
    role: "",
    profileImage: "https://scia-project-questit.s3.eu-central-1.amazonaws.com/profile_images/3.jpg",
    email: "test@gmail.com",
    phoneNumber: "+39 347 86 55415",
    registrationDate: "2025-03-18T14:30:45.000Z",
    team: {
      id: 4,
      name: "Comando",

    },
    teamLeader: {
      firstName: "Loris2",
      lastName: "Caputo",
    },
  },
  "121": {
    id: "121",
    firstName: "Alessandro",
    lastName: "Coscarelli",
    rank: "2",
    type: "Operatore",
    profileImage: require("../assets/images/colonel.jpg"),
    email: "test@gmail.com",
    phoneNumber: "+39 347 86 55415",
    registrationDate: "2024-02-01T02:36:00+02:00",
    
    team: {
      id: 4,
      name: "Comando",
    },
    teamLeader: {
      firstName: "Enrico",
      lastName: "Credendino",
    },
  },
  "122": {
    id: "122",
    firstName: "Matteo",
    lastName: "De Angelis",
    rank: "3",
    type: "Operatore",
    profileImage: require('../assets/images/aduio-img.png'),
    email: "test@gmail.com",
    phoneNumber: "+39 347 86 55415",
    registrationDate: "2023-01-01T02:36:00+02:00",
    team: {
      id: 4,
      name: "Comando",
    },
    teamLeader: {
      firstName: "Enrico",
      lastName: "Credendino",
    },
  },
  // "Matteo_De_angelis": {
  //     name: 'Matteo De Angelis',
  //     firstName: 'Matteo',
  //     lastName: 'De Angelis',
  //     id: 'Matteo_De_angelis',
  //     role: "Operatore",
  //     subscription: "2023-01-01T02:36:00+02:00",
  //     profileImg: require('../assets/images/aduio-img.png'),
  // },
  // "Mario_Rossi": {
  //     name: 'Mario Rossi',
  //     firstName: 'Mario',
  //     lastName: 'Rossi',
  //     id: 'Mario_Rossi',
  //     role: "Operatore",
  //     subscription: "2022-01-01T02:36:00+02:00",
  // },
  // "Mario_Ross2i": {
  //     name: 'Carlo Rossi',
  //     firstName: 'Carlo',
  //     lastName: 'Rossi',
  //     id: 'Mar3333io_Rossi',
  //     role: "Operatore",
  //     subscription: "2022-01-01T02:36:00+02:00",
  //     profileImg: require('../assets/images/aduio-img.png'),
  // },
  // "Mario_R22ossi": {
  //     name: 'Fede Rossi',
  //     firstName: 'Fede',
  //     lastName: 'Rossi',
  //     id: 'Mario_Rossiaaaa',
  //     role: "Operatore",
  //     subscription: "2022-01-01T02:36:00+02:00",
  //     profileImg: require('../assets/images/aduio-img.png'),
  // },
  // "Mario_Ro222ssi": {
  //     name: 'aurelio Rossi',
  //     firstName: 'Aurelio',
  //     lastName: 'Rossi',
  //     id: 'Mario_Rossi1111',
  //     role: "Operatore",
  //     subscription: "2022-01-01T02:36:00+02:00",
  //     profileImg: require('../assets/images/aduio-img.png'),
  // },
};
