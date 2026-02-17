import { ImageSourcePropType } from "react-native"

export type User = {
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
}

export type Users = Record<string, User>

export const users: Users = {
    "Alessandro_Coscarelli_00": {
        name: 'Alessandro Coscarelli',
        firstName: 'Alessandro',
        lastName: 'Coscarelli',
        id: 'Alessandro_Coscarelli_00',
        rankID: "colonnello_t_st",
        role: "Operatore",
        team: "Comando",
        supervisor: "Enrico Credendino",
        subscription: "2024-02-01T02:36:00+02:00",
        profileImg: require('../assets/images/colonel.jpg'),
    },
    "Matteo_De_angelis": {
        name: 'Matteo De Angelis',
        firstName: 'Matteo',
        lastName: 'De Angelis',
        id: 'Matteo_De_angelis',
        role: "Operatore",
        subscription: "2023-01-01T02:36:00+02:00",
        profileImg: require('../assets/images/aduio-img.png'),
    },
    "Mario_Rossi": {
        name: 'Mario Rossi',
        firstName: 'Mario',
        lastName: 'Rossi',
        id: 'Mario_Rossi',
        role: "Operatore",
        subscription: "2022-01-01T02:36:00+02:00",
    },
    "Mario_Ross2i": {
        name: 'Carlo Rossi',
        firstName: 'Carlo',
        lastName: 'Rossi',
        id: 'Mar3333io_Rossi',
        role: "Operatore",
        subscription: "2022-01-01T02:36:00+02:00",
        profileImg: require('../assets/images/aduio-img.png'),
    },
    "Mario_R22ossi": {
        name: 'Fede Rossi',
        firstName: 'Fede',
        lastName: 'Rossi',
        id: 'Mario_Rossiaaaa',
        role: "Operatore",
        subscription: "2022-01-01T02:36:00+02:00",
        profileImg: require('../assets/images/aduio-img.png'),
    },
    "Mario_Ro222ssi": {
        name: 'aurelio Rossi',
        firstName: 'Aurelio',
        lastName: 'Rossi',
        id: 'Mario_Rossi1111',
        role: "Operatore",
        subscription: "2022-01-01T02:36:00+02:00",
        profileImg: require('../assets/images/aduio-img.png'),
    },

}

