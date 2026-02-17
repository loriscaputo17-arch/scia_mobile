import { ImageSourcePropType } from "react-native"

export type Instructions = {
    [id: string]: {
        text: string,
        images: ImageSourcePropType[],
    }
}

export const instructions = {

    'fare_defluire_acqua_e_sporcizia_dal_prefiltro': {

        text: `Rimuovere periodicamente questi tipi di sporco e contaminanti dai quadri elettrici per garantire il corretto funzionamento delle apparecchiature elettriche e mantenere un ambiente pulito e sicuro. Molte volte infatti, non si ha la consapevolezza del rischio che determina la mancata #manutenzione di questa parte di impianto industriale.
        Uno dei metodi usati e spesso poco conosciuto è la pulizia con ghiaccio secco, nota anche come "ghiaccio secco #blasting" o "blasting criogenico".
        E' un metodo di pulizia non abrasivo che utilizza ghiaccio secco (anidride carbonica solida) per rimuovere sporco, residui, #vernici, #oli e altre contaminazioni da diverse superfici.`,
        images: [
            require('@/assets/images/note_fotografiche.png'),
            require('@/assets/images/note_fotografiche2.png'),
            require('@/assets/images/note_fotografiche3.png'),
            require('@/assets/images/note_fotografiche4.png'),
            require('@/assets/images/note_fotografiche.png'),
            require('@/assets/images/note_fotografiche2.png'),
            require('@/assets/images/note_fotografiche4.png'),
            require('@/assets/images/note_fotografiche3.png'),
            require('@/assets/images/note_fotografiche.png'),
            require('@/assets/images/note_fotografiche2.png'),
        ]

    },





}
