import { ImageSourcePropType } from "react-native";

export type ExecutionOutcome = 'esitoOk' | 'anomalia' | 'nonEseguito' | 'programmato';

export const executionOutcomeColor: Record<ExecutionOutcome, string> = {
    esitoOk: '#fff', 
    anomalia: '#FFBF26', 
    nonEseguito: '#D0021B', 
    programmato: '#022A52', 
};
export const executionOutcomeName: Record<ExecutionOutcome, string> = {
    esitoOk: 'Esito OK', 
    anomalia: 'Anomalia', 
    nonEseguito: 'Non Eseguito', 
    programmato: 'Programmato',
};

export type ImageNote = {
    date: string;
    imgSrc: ImageSourcePropType | string; // ImageSourcePropType -> per le immagini statiche (utile per il development), string per le immagini dinamiche.
};
export type AudioNote = {
    date: string;
    audioSrc: string; // da cambiare.
};
export type TextNote = {
    date: string;
    text: string;
};


export type HistoryEntry = {
    user: string;
    imageNotes?: ImageNote[];
    audioNotes?: AudioNote[];
    textNotes?: TextNote[];
    executionDate: string; 
    executionTime?: number; //tempo di esecuzione in minuti, campo non obbligatorio.
    location?: string;
    executionOutcome?: ExecutionOutcome;
};

export type History = Record<string, HistoryEntry[]>

// ogni entita' manutenzione, manitene uno storico di esecuzioni vecchie svolte, identificato dall'id della manutenzione stessa.
// per ogni manutenzione, mi aspetto che vecchie esecuzioni siano gia' ordinate dalla piu' vecchia cronologicamente alla piu' recente (ultima esecuzione di manutenzione aggiunta all'array)

export const history: History = {

    //Manutenzione
    'fare_defluire_acqua_e_sporcizia_dal_prefiltro': [
        {
            user: 'Alessandro_Coscarelli_00',
            imageNotes: [
                { date: '2024-04-10T11:10:00', imgSrc: require('@/assets/images/note_fotografiche.png') }, // immagine statica (utile per il development)
                // { date: '2024-04-10T11:10:00', imgSrc: file:///path/to/generated/image.jpg }, //immagine dinamica 
                { date: '2024-04-10T11:11:00', imgSrc: require('@/assets/images/note_fotografiche2.png') },
                { date: '2024-04-10T11:12:00', imgSrc: require('@/assets/images/note_fotografiche3.png') },
            ],
            audioNotes: [
                { date: '2024-04-10T11:13:00', audioSrc: require('@/assets/audio/test_audio.mp3') },
                { date: '2024-04-10T11:14:00', audioSrc: require('@/assets/audio/test_audio_1.mp3') },
            ],
            textNotes: [
                { date: '2024-04-10T11:15:00', text: 'Erano presenti numerose foglie nella scatola elettrica, dovute probabilmente al vento forte della scorsa settimana. Sono state tutte rimosse' },
                { date: '2024-04-10T11:16:00', text: 'Nessun foglia presente, ho notato un cavo staccato e l ho ripristinato' },
            ],
            executionDate: '2024-04-10T11:30:00',
            executionTime: 23,
            executionOutcome: 'anomalia',
        },
        {
            user: 'Matteo_De_angelis',
            imageNotes: [
                { date: '2024-04-17T11:08:00', imgSrc: require('@/assets/images/note_fotografiche3.png') },
                { date: '2024-04-17T11:09:00', imgSrc: require('@/assets/images/note_fotografiche.png') },
            ],
            audioNotes: [
                { date: '2024-04-17T11:10:00', audioSrc: require('@/assets/audio/test_audio_2.mp3') },
            ],
            executionDate: '2024-04-17T11:45:00',
            executionOutcome: 'esitoOk',

        },
        {
            user: 'Alessandro_Coscarelli_00',
            imageNotes: [
                { date: '2024-04-24T11:18:00', imgSrc: require('@/assets/images/note_fotografiche2.png') },
                { date: '2024-04-24T11:19:00', imgSrc: require('@/assets/images/note_fotografiche.png') },
                { date: '2024-04-24T11:20:00', imgSrc: require('@/assets/images/note_fotografiche.png') },
                { date: '2024-04-24T11:21:00', imgSrc: require('@/assets/images/note_fotografiche3.png') },
            ],
            textNotes: [
                { date: '2024-04-24T11:22:00', 
                    text: 
                    `Manutenzione eseguita come di consueto. Presenti pezzi metallici non identificati.
                    ` 
            },

            ],
            executionDate: '2024-04-24T11:55:00',
            executionOutcome: 'esitoOk',

        },
    ],

    // Manutenzione

    'filtro_indicatore_olio_controllo_e_pulizia_filtro': [
        {
            user: 'Alessandro_Coscarelli_00',
            imageNotes: [
                { date: '2023-01-01T11:10:00', imgSrc: require('@/assets/images/note_fotografiche4.png') },
            ],
            textNotes: [
                { date: '2023-01-01T11:15:00', text: 'controllato olio e pulito il filtro. Erano presenti residui di materiale plastico.' },
            ],
            executionDate: '2023-01-01T11:30:00',
            executionOutcome: 'esitoOk',

        },
        {
            user: 'Matteo_De_angelis',
            audioNotes: [
                { date: '2023-01-15T11:10:00', audioSrc: require('@/assets/audio/test_audio_3.mp3') },
            ],
            executionDate: '2023-01-15T11:45:00',
            executionOutcome: 'nonEseguito',

        },

    ],

    // Checklist

    'controllo_presenza_foglie_nella_scatola': [
        {
            user: 'Alessandro_Coscarelli_00',
            imageNotes: [
                { date: '2023-01-01T11:10:00', imgSrc: require('@/assets/images/note_fotografiche4.png') },
            ],
            textNotes: [
                { date: '2023-01-01T11:15:00', text: 'controllato olio e pulito il filtro. Erano presenti residui di materiale plastico.' },
            ],
            executionDate: '2023-01-01T11:30:00',
            executionOutcome: 'esitoOk',

        },
        {
            user: 'Matteo_De_angelis',
            audioNotes: [
                { date: '2023-01-15T11:10:00', audioSrc: require('@/assets/audio/test_audio_3.mp3') },
            ],
            executionDate: '2023-01-15T11:45:00',
            executionOutcome: 'anomalia',

        },

    ],

    // Checklist

    'accensione_luce_ingresso': [
        {
            user: 'Mario_Rossi',
            imageNotes: [
                { date: '2023-01-01T11:10:00', imgSrc: require('@/assets/images/note_fotografiche3.png') },
            ],
            textNotes: [
                { date: '2023-01-01T11:15:00', text: 'controllato olio e pulito il filtro. Erano presenti residui di materiale plastico.' },
            ],
            executionDate: '2023-01-01T11:30:00',
            executionOutcome: 'esitoOk',

        },
    ],

    // Reading

    'controllo_presenza_foglie_nella_scatola_read': [
        {
            user: 'Alessandro_Coscarelli_00',
            imageNotes: [
                { date: '2023-01-01T11:10:00', imgSrc: require('@/assets/images/note_fotografiche4.png') },
            ],
            textNotes: [
                { date: '2023-01-01T11:15:00', text: 'controllato olio e pulito il filtro. Erano presenti residui di materiale plastico.' },
            ],
            executionDate: '2023-01-01T11:30:00',

        },
        {
            user: 'Matteo_De_angelis',
            audioNotes: [
                { date: '2023-01-15T11:10:00', audioSrc: require('@/assets/audio/test_audio_3.mp3') },
            ],
            executionDate: '2023-01-15T11:45:00',
        },

    ],

    // Reading

    'accensione_luce_ingresso_read': [
        {
            user: 'Mario_Rossi',
            imageNotes: [
                { date: '2023-01-01T11:10:00', imgSrc: require('@/assets/images/note_fotografiche3.png') },
            ],
            textNotes: [
                { date: '2023-01-01T11:15:00', text: 'controllato olio e pulito il filtro. Erano presenti residui di materiale plastico.' },
            ],
            executionDate: '2023-01-01T11:30:00',

        },
    ],
}