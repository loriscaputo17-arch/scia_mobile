import { Recurrence } from "./recurrenceTresholds";

type BaseActivityList = {
  listName: string;
  listId: string;
  activities: string[];
  listLastExecutionDate?: string;
};

export type MaintenanceList = BaseActivityList & {
  type: "maintenance";
  listExpiryDate?: string;
};

export type MalfunctionList = BaseActivityList & {
  type: "malfunction";
};

export type Checklist = BaseActivityList & {
  type: "checklist";
  recurrence: Recurrence; // mandatory for checklist
  listExpiryDate: string; // 'mandatory for 'checklist'
};

export type ReadingList = BaseActivityList & {
  type: "reading";
  recurrence: Recurrence; // mandatory for readinglist
  listExpiryDate: string; // 'mandatory for 'readinglist'
};

export type ReplacementList = BaseActivityList & {
  type: "replacement";
};

export type ActivityList = MaintenanceList | Checklist | ReadingList | MalfunctionList | ReplacementList;

export type ActivityType = "checklist" | "maintenance" | "reading" | "malfunction" | "replacement";

export type ActivityLists = {
  [listId: string]: ActivityList;
};

// NB: per ora ActivityLists e' la struttura per il checklist, ma potrei generalizzarlo anche a maintenances,
// visto che anch'esse son raggruppate per elenchi. l'unica differenza e' che per le manutenzioni non c'e' la data di scadenza a livello di elenco.

export const activityLists: ActivityLists = {
  // Checklist Daily Maintenance
  daily_maintenance: {
    listName: "Daily maintenance",
    listId: "daily_maintenance",
    type: "checklist",
    recurrence: "Giornaliera",
    listExpiryDate: "2024-10-10T02:36:00+02:00",
    activities: [
      "controllo_presenza_foglie_nella_scatola",
      "chiusura_portellone_anteriore",
      "accensione_luce_ingresso",
      "dasdasdas__dasdasdsa",
      "dasdasdasdasdasore",
      "dasd_dasdsa_dasda",
      "ultimo_checklist",
    ],
  },

  // Checklist Controlli Prepartenza
  controlli_prepartenza: {
    listName: "Controlli prepartenza",
    listId: "controlli_prepartenza",
    type: "checklist",
    recurrence: "Giornaliera",
    listExpiryDate: "2024-10-09T20:50:00+02:00",
    activities: ["blablalba", "blablasdasdasdasdo"],
  },

  // Letture Lettura Vano Motore
  lettura_vano_motore: {
    listName: "Lettura vano motore",
    listId: "lettura_vano_motore",
    type: "reading",
    recurrence: "Giornaliera",
    listExpiryDate: "2024-10-09T20:50:00+02:00",
    activities: ["capacita_olio_motore_read"],
  },

  // Letture Cabina di comando
  cabina_di_comando: {
    listName: "Cabina di comando",
    listId: "cabina_di_comando",
    type: "reading",
    recurrence: "Giornaliera",
    listExpiryDate: "2024-10-09T20:50:00+02:00",
    activities: ["accensione_luce_ingresso_read"],
  },

  // Letture Sala macchine
  sala_macchine: {
    listName: "Sala macchine",
    listId: "sala_macchine",
    type: "reading",
    recurrence: "Giornaliera",
    listExpiryDate: "2024-10-09T20:50:00+02:00",
    activities: ["chiusura_portellone_anteriore_read", "controllo_presenza_foglie_nella_scatola_read"],
  },

  // Manutenzioni Ordinarie
  manutenzioni_ordinarie: {
    listName: "Manutenzioni ordinarie",
    listId: "manutenzioni_ordinarie",
    type: "maintenance",
    activities: [
      "fare_defluire_acqua_e_sporcizia_dal_prefiltro",
      "filtro_indicatore_olio_controllo_e_pulizia_filtro",
      "manutenzione_di_qualcosa",
      "manutenzione_blabla",
      "manutenzione_blabla_2",
      "manutenzione_blabla_3",
    ],
  },
  // Manutenzioni Staordinarie
  manutenzioni_straordinarie: {
    listName: "Manutenzioni Straordinarie",
    listId: "manutenzioni_straordinarie",
    type: "maintenance",
    activities: ["manutenzione_per_qualcosa_di_tipo_straordinari"],
  },

  // Manutenzioni annuali
  manutenzioni_annuali: {
    listName: "Manutenzioni annuali",
    listId: "manutenzioni_annuali",
    type: "maintenance",
    activities: ["manutenzione_per_qualcosa_di_tipo_annuali"],
  },

  // Manutenzioni
  manutenzioni_aa: {
    listName: "Manutenzioni aa",
    listId: "manutenzioni_aa",
    type: "maintenance",
    activities: ["manutenzione_aa"],
  },

  // Manutenzioni
  manutenzioni_ab: {
    listName: "Manutenzioni ab",
    listId: "manutenzioni_ab",
    type: "maintenance",
    activities: ["manutenzione_ab"],
  },

  // Avarie (unica lista)

  avarie: {
    listName: "Avarie",
    listId: "avarie",
    type: "malfunction",
    activities: ["malf_1744115234585"],
  },

  // Ricambi (unica lista)

  ricambi: {
    listName: "Catalogo ricambi",
    listId: "ricambi",
    type: "replacement",
    activities: [
      "cinghia_di_distribuzione",
      "ricambio_n_2",
      "ricambio_n_3",
      "ricambio_n_4",
      "ricambio_n_5",
      "ricambio_n_6",
      "ricambio_n_7",
      "ricambio_n_8",
      "ricambio_n_9",
    ],
  },
};
