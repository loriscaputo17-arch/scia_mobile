// export type Recurrence = "Giornaliera" | "Settimanale" | "Bisettimanale" | "Mensile" | "Bimestrale" | "Trimestrale" | "Semestrale" | "Annuale" | "Biennale" | "Triennale";
// export const recurrences : Recurrence[] = ["Settimanale", "Bisettimanale", "Mensile", "Bimestrale", "Trimestrale", "Semestrale", "Annuale", "Biennale", "Triennale"];

export interface Thresholds {
  ritardo: number; // Ore dopo la scadenza
  scadenza: number; // Ore prima della scadenza
  anticipo: number; // Ore prima dell'anticipo
}

export type Recurrence = {
  id: string;
  name: string; // es. "Daily", "Weekly", ecc.
  delay_threshold: number; //soglia ore di ritardo
  due_threshold: number; // soglia ore di scadenza
  early_threshold: number; // soglia ore di anticipo
  RecurrencyType_Frequency? : number | null;
  from_days? : number | null;
  to_days?: number | null;
};

/* 
  Vengono qui definite le soglie di ritardo, scadenza e anticipo di default.
  Qualora servisse aggiornare tali soglie per ciascuna ricorrenza (ES: un produttore potrebbe dire che 24 ore son troppo poche come soglia di ritardo settimanale),
  introdurre un sistema di sovrascizione delle seguenti soglie di default.
  Per esempio, si potrebbero definire le tre soglie su ogni manutenzione, ed utilizzare quelle anziche' quelle globali di default. 
*/

// export const recurrenceThresholds: Record<Recurrence, Thresholds> = {
//   Giornaliera: { ritardo: 4, scadenza: 8, anticipo: 12 },
//   Settimanale: { ritardo: 24, scadenza: 48, anticipo: 72 },
//   Bisettimanale: { ritardo: 48, scadenza: 72, anticipo: 96 },
//   Mensile: { ritardo: 72, scadenza: 96, anticipo: 120 },
//   Bimestrale: { ritardo: 96, scadenza: 120, anticipo: 144 },
//   Trimestrale: { ritardo: 120, scadenza: 144, anticipo: 168 },
//   Semestrale: { ritardo: 144, scadenza: 168, anticipo: 192 },
//   Annuale: { ritardo: 168, scadenza: 192, anticipo: 216 },
//   Biennale: { ritardo: 192, scadenza: 216, anticipo: 240 },
//   Triennale: { ritardo: 216, scadenza: 240, anticipo: 264 }
// };

export const showedRecurrences: Record<string, string> = {
  "2": "Settimanale",
  "7": "Bisettimanale",
  "3": "Mensile",
  "99999": "Bimestrale",
  "4": "Trimestrale",
  "999999": "Semestrale",
  "5": "Annuale",
  "9": "Biennale",
  "10": "Triennale",
  // "1": "Giornaliera",
  // "6": "A condizione",
  // "8": "Quadrimestrale",
  // "11": "Quinquennale",
  // "12": "Ogni 10 anni",
  // "30": "Ogni 6 mesi",
  // "31": "Ogni 2.5 anni",
  // "32": "Ogni 4 anni",
};

export const recurrenceThresholds: Record<string, Recurrence> = {
  "1": {
    id: "1",
    name: "Daily", // 24h ciclo
    // name2: "Giornaliera",
    delay_threshold: 4, // soglia ore di ritardo
    due_threshold: 8, // soglia ore di scadenza
    early_threshold: 12, // soglia ore di anticipo
  },
  "2": {
    id: "2",
    name: "Weekly", // 168h ciclo
    // name2: "Settimanale",
    delay_threshold: 24, // 1 giorno
    due_threshold: 48, // 2 giorni
    early_threshold: 72, // 3 giorni
  },
  "3": {
    id: "3",
    name: "Monthly", // ~720h
    // name2: "Mensile",
    delay_threshold: 72, // 3 giorni
    due_threshold: 144, // 6 giorni
    early_threshold: 216, // 9 giorni
  },
  "4": {
    id: "4",
    name: "Quarterly", // ~2160h
    // name2: "Trimestrale",
    delay_threshold: 216, // 9 giorni
    due_threshold: 432, // 18 giorni
    early_threshold: 648, // 27 giorni
  },
  "5": {
    id: "5",
    name: "Yearly", // ~8760h
    // name2: "Annuale",
    delay_threshold: 720, // 30 giorni
    due_threshold: 1440, // 60 giorni
    early_threshold: 2160, // 90 giorni
  },
  "6": {
    id: "6",
    name: "On condition", // ~8760h
    // name2: "A condizione",
    delay_threshold: 288, // 12 giorni
    due_threshold: 576, // 24 giorni
    early_threshold: 864, // 36 giorni
  },
  "7": {
    id: "7",
    name: "Every 2 weeks", // Biweekly = 336h
    // name2: "Bisettimanale",
    delay_threshold: 36, // 1.5 giorni
    due_threshold: 72, // 3 giorni
    early_threshold: 108, // 4.5 giorni
  },
  "8": {
    id: "8",
    name: "Every 4 months", // ~2880h
    // name2: "Ogni 4 mesi",
    delay_threshold: 288, // 12 giorni
    due_threshold: 576, // 24 giorni
    early_threshold: 864, // 36 giorni
  },
  "9": {
    id: "9",
    name: "Every 2 years", // ~17,520h
    // name2: "Ogni 2 anni",
    delay_threshold: 1000, // ~41.7 giorni
    due_threshold: 2000, // ~83.3 giorni
    early_threshold: 3000, // ~125 giorni
  },
  "10": {
    id: "10",
    name: "Every 3 years", // ~26,280h
    // name2: "Ogni 3 anni",
    delay_threshold: 1300, // ~54.2 giorni
    due_threshold: 2600, // ~108.3 giorni
    early_threshold: 3900, // ~162.5 giorni
  },
  "11": {
    id: "11",
    name: "Every 5 years", // ~43,800h
    // name2: "Ogni 5 anni",
    delay_threshold: 1750, // ~72.9 giorni
    due_threshold: 3500, // ~145.8 giorni
    early_threshold: 5250, // ~218.8 giorni
  },
  "12": {
    id: "12",
    name: "Every 10 years", // ~87,600h
    // name2: "Ogni 10 anni",
    delay_threshold: 3000, // ~125 giorni
    due_threshold: 6000, // ~250 giorni
    early_threshold: 9000, // ~375 giorni
  },
  "30": {
    id: "30",
    name: "Every 6 months", // ~4320h
    // name2: "Ogni 6 mesi",
    delay_threshold: 432, // 18 giorni
    due_threshold: 864, // 36 giorni
    early_threshold: 1296, // 54 giorni
  },
  "31": {
    id: "31",
    name: "Every 2.5 years", // ~21,900h
    // name2: "Ogni 2,5 anni",
    delay_threshold: 1100, // ~45.8 giorni
    due_threshold: 2200, // ~91.7 giorni
    early_threshold: 3300, // ~137.5 giorni
  },
  "32": {
    id: "32",
    name: "Every 4 years", // ~35,040h
    // name2: "Ogni 4 anni",
    delay_threshold: 1400, // ~58.3 giorni
    due_threshold: 2800, // ~116.7 giorni
    early_threshold: 4200, // ~175 giorni
  },
};
