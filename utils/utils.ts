import { ActivityLists } from "@/data/activityLists";
import { ClassificationID } from "@/data/classifications";
import { Failure } from "@/data/failures";
import { type AudioNote, type ImageNote, type TextNote, type HistoryEntry, type ExecutionOutcome, type History } from "@/data/history";
import { Job } from "@/data/jobs";
import { magazineFuncionality } from "@/data/magazineFuncionality";
import { type Maintenance, type MaintenanceStatus } from "@/data/maintenences";
import { type Reading } from "@/data/readings";
import { type Recurrence, recurrenceThresholds } from "@/data/recurrenceTresholds";
import { type Replacement } from "@/data/replacements";
import { type System } from "@/data/systems";
import { type Task } from "@/data/tasks";
import { updateStatus } from "../api/maintenance";
import { Alert } from "react-native";
import { getTotalQuantityFromString } from "./sparePartsUtils";

export const filterActivitiesByField = <T extends Task | Job | Reading | Failure>(activities: T[], field: keyof T, value: any): T[] => {
  return activities.filter((activity) => activity[field] === value);
};

export const filterActivitiesByNestedField = <T>(
  activities: T[],
  fieldPath: string, // es. "user.name"
  value: any
): T[] => {
  return activities.filter((activity) => {
    const fields = fieldPath.split(".");
    let current: any = activity;

    for (const field of fields) {
      if (current == null) return false;
      current = current[field];
    }

    return current === value;
  });
};

export const filterOutActivitiesByField = <T extends Task | Maintenance | Reading | Failure>(activities: T[], field: keyof T, value: any): T[] => {
  return activities.filter((activity) => activity[field] !== value);
};

export const getNotExecutedChecklistSummaryList = (activityLists: ActivityLists, tasks: Task[]): string[] => {
  return Object.values(activityLists)
    .map(({ listName, listId }) => {
      const nonExecutedTasks = filterActivitiesByField(
        tasks.filter((task) => task.listId === listId),
        "check",
        "nonEseguito"
      );
      return nonExecutedTasks.length > 0 ? `${listName} (${nonExecutedTasks.length})` : null;
    })
    .filter((item) => item !== null);
};

export const getNotExecutedReadingSummaryList = (activityLists: ActivityLists, readings: Reading[]): string[] => {
  return Object.values(activityLists)
    .map(({ listName, listId }) => {
      const nonExecutedReadings = readings.filter((reading) => reading.listId === listId).filter((reading) => reading.value === undefined);
      return nonExecutedReadings.length > 0 ? `${listName} (${nonExecutedReadings.length})` : null;
    })
    .filter((item): item is string => item !== null); // Rimuove null dal risultato
};

export const getExecutedTasks = (tasks: Job[]): Job[] => {
  /* da aggionrare appena sistemano le api */
  // return tasks.filter((task) => task["check"] !== "nonEseguito");
  return tasks.filter((task) => task["status"].name !== "active"); //NB: questo non ha senso, va cambiato, lo stato manutenzione e' differente dall'esecuzione
};

export function sortMaintenancesByExpiry(maintenances: Job[]): Job[] {
  return [...maintenances].sort((a, b) => {
    const now = new Date();

    const aExpiryDate = new Date(a.ending_date);
    const bExpiryDate = new Date(b.ending_date);

    // Calcoliamo il tempo trascorso dalla scadenza per entrambe le manutenzioni
    const aTimeDiff = now.getTime() - aExpiryDate.getTime(); // Tempo passato dalla scadenza di "a"
    const bTimeDiff = now.getTime() - bExpiryDate.getTime(); // Tempo passato dalla scadenza di "b"

    // Ordiniamo prima quella che è expired da più tempo (tempo più grande)
    return bTimeDiff - aTimeDiff;
  });
}

//NB: quando le api saranno popolate correttamente, si potra' rimuovere recurrence_type_id, cancellare recurrenceType eusare direttamente
// recurrence, passato come parametro.

export function getMaintenanceStatusAndTime(
  targetDate: Date,
  dueDate: Date,
  recurrence: Recurrence,
  recurrence_type_id: string,
  pauseDate?: Date
): { status: MaintenanceStatus; statusDescription: string; formattedTime: string } {
  // Usa la soglia specificata oppure la prima disponibile come fallback

  const recurrenceType =
    recurrence.delay_threshold && recurrence.due_threshold && recurrence.early_threshold //se presenti da Database, uso quelli
      ? recurrence
      : recurrenceThresholds[recurrence_type_id] ?? Object.values(recurrenceThresholds)[0]; // altrimenti uso le soglie del mockup

  if (!recurrenceType) {
    throw new Error("Nessuna soglia di ricorrenza disponibile in recurrenceThresholds.");
  }

  // Calcola la differenza in ore tra la data di scadenza e la data target (di base quella attuale)
  const diffInMs = pauseDate ? new Date().getTime() - pauseDate.getTime() : dueDate.getTime() - targetDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60); // Conversione da millisecondi a ore

  // Ottieni i giorni e le ore rimanenti dalla differenza totale in ore
  const days = Math.floor(Math.abs(diffInHours) / 24);
  const hours = Math.floor(Math.abs(diffInHours) % 24);

  // Aggiungi segno "+" o "-" per formattedTime
  const sign = diffInHours <= 0 ? "+" : "-";
  const formattedTime = `${sign}${days}gg ${hours}hh`;

  let status: MaintenanceStatus = "scheduled";
  let statusDescription = "Programmata";
  const timeWithoutSign = `${days}gg ${hours}hh`; // formattedTime senza il segno per la descrizione

  if (pauseDate) {
    status = "inPause";
    statusDescription = `In Pausa da ${timeWithoutSign}`;
  } else if (diffInHours < -recurrenceType.delay_threshold) {
    // Superata la soglia di ritardo, la manutenzione è expired
    status = "expired";
    statusDescription = `Scaduta da ${timeWithoutSign}`;
  } else if (diffInHours < 0 && diffInHours >= -recurrenceType.delay_threshold) {
    // Scaduta da poco (all'interno della soglia di ritardo, ancora recuperabile)
    status = "recentlyExpired";
    statusDescription = `Scaduta da ${timeWithoutSign}`;
  } else if (diffInHours >= 0 && diffInHours <= recurrenceType.due_threshold) {
    // In scadenza (all'interno della soglia di scadenza)
    status = "expiring";
    statusDescription = `In scadenza fra ${timeWithoutSign}`;
  } else if (diffInHours > recurrenceType.due_threshold && diffInHours <= recurrenceType.early_threshold) {
    // Attiva (all'interno della soglia di anticipo)
    status = "active";
    statusDescription = `In anticipo di ${timeWithoutSign}`;
  }

  return { status, statusDescription, formattedTime };
}

/**
 * Dato in ingresso una lista di manutenzioni, una lista di stati ed un'eventuale data target di riferimento (a default quella attuale),
 * restituisce le manutenzioni che si trovano in almeno uno degli stati passati.
 * @param maintenances
 * @param statuses
 * @param targetDate
 * @returns
 */

export function filterMaintenancesByStatuses(maintenances: Job[], statuses: MaintenanceStatus[], targetDate?: Date): Job[] {
  return maintenances.filter((maintenance) => {
    const maintenanceStatus = getMaintenanceStatusAndTime(
      targetDate || new Date(),
      new Date(maintenance.ending_date),
      maintenance.recurrencyType,
      maintenance.recurrency_type_id,
      maintenance.pauseDate && maintenance.status.name === "inPause" ? new Date(maintenance.pauseDate) : undefined
    ).status;

    return statuses.includes(maintenanceStatus);
  });
}

// Funzione generica per applicare filtri su un campo specifico
export function applyFilters<T extends Job | Task | Reading | Failure | Replacement>(
  activities: T[],
  filterGroup: string, // status
  selectedFilters: string[], // ES: ['expired','scadutaDapoco','active']
  targetDate: Date = new Date(),
  replacementsMap?: Record<string, Replacement>
): T[] {
  if (selectedFilters.length === 0) return activities;

  return activities.filter(
    (activity) => selectedFilters.some((selectedFilter) => matchesFilter(activity, filterGroup, selectedFilter, targetDate, replacementsMap)) //.some() controlla se almeno un elemento in un array soddisfa una certa condizione.
  );
}

// Funzione che verifica se un'attività corrisponde a un filtro specifico
export function matchesFilter<T extends Job | Task | Reading | Failure | Replacement>(
  activity: T,
  filterGroup: string, // status
  selectedFilter: string, // 'expired'
  targetDate: Date,
  replacementsMap?: Record<string, Replacement>
): boolean {
  const maintenance = activity as Job;
  const failure = activity as Failure;
  const reading = activity as Reading;
  const replacement = activity as Replacement;

  if (filterGroup === "status" && "ending_date" in activity) {
    const paused = maintenance.status.name === "inPause";
    const status = getMaintenanceStatusAndTime(
      targetDate,
      new Date(activity.ending_date),
      maintenance.recurrencyType,
      maintenance.recurrency_type_id,
      paused && maintenance.pauseDate ? new Date(activity.pauseDate) : undefined
    ).status;
    return status === selectedFilter;
  }

  if (filterGroup === "recurrence" && "recurrency_type_id" in activity) {
    return activity.recurrency_type_id === selectedFilter;
  }

  if (filterGroup === "levelId") {
    return maintenance.job?.maintenance_list.MaintenanceLevel_ID === selectedFilter;
  }
  if (filterGroup === "wharehouseId") {
    return replacement.warehouses.some((w) => w.id === selectedFilter);
  }

  if (filterGroup === "team" && "job" in activity) {
    return maintenance.job?.team_id === selectedFilter;
  }

  if (filterGroup === "team" && "userExecutionData" in activity && failure.userExecutionData) {
    return failure.userExecutionData.team_id === selectedFilter;
  }

  if (filterGroup === "severity" && "gravity" in activity) {
    return failure.gravity === selectedFilter;
  }
  if (filterGroup === "system") {
    return activity.systemId === selectedFilter;
  }

  if (filterGroup === "replacements" && replacementsMap !== undefined) {
    // capire col cliente come gestire il flag magazineFuncionality, che quando inattivo prevede solo ricambi richeisti, viceversa disponibili, in easaurimento o esauriti
    if (selectedFilter === "required") return (activity as Maintenance).replacements.length > 0;
    if (selectedFilter === "available") return areAllReplacementsAvailable((activity as Maintenance).replacements, replacementsMap);
    if (selectedFilter === "lowStock") return isAnyReplacementLowStock((activity as Maintenance).replacements, replacementsMap);
    if (selectedFilter === "notAvailable") return isAnyReplacementOutOfStock((activity as Maintenance).replacements, replacementsMap);
  }

  if (filterGroup === "check") {
    return (activity as Task).check === "nonEseguito";
  }

  if (filterGroup === "reading" && selectedFilter === "notExecuted") {
    return !reading.value || reading.value === "0";
  }

  if (filterGroup === "stock") {
    const quantity = getTotalQuantityFromString(replacement.quantity);
    if (selectedFilter === "available") return quantity > 0;
    if (selectedFilter === "notAvailable") return quantity === 0;
  }

  if (filterGroup === "supplierId") {
    return replacement.elementModel.Supplier_Parts_ID === selectedFilter;
  }

  return false;
}

/**
 * Dato un array di ID, che rappresentano i ricambi di una manutenzione, la funzione restituisce true se sono tutti disponibili in quantita' sufficiente
 * @param replacementIds
 * @returns
 */
export const areAllReplacementsAvailable = (replacementIds: string[], replacementsMap: Record<string, Replacement>): boolean => {
  if (replacementIds.length === 0) return false;
  return replacementIds.every((id) => {
    const replacement = replacementsMap[id];
    return replacement && replacement.quantity >= replacement.stockOutThresold;
  });
};

/**
 * Dato un array di ID, che rappresentano i ricambi di una manutenzione, la funzione restituisce true se la quantita' di un ricambio sta per esaurirsi
 * @param replacementIds
 * @returns
 */
export const isAnyReplacementLowStock = (replacementIds: string[], replacementsMap: Record<string, Replacement>): boolean => {
  return replacementIds.some((id) => {
    const replacement = replacementsMap[id];
    return replacement && replacement.quantity < replacement.stockOutThresold && replacement.quantity > 0;
  });
};

/**
 * Dato un array di ID, che rappresentano i ricambi di una manutenzione, la funzione restituisce true se la quantita' di un ricambio e' esaurita
 * @param replacementIds
 * @returns
 */
export const isAnyReplacementOutOfStock = (replacementIds: string[], replacementsMap: Record<string, Replacement>): boolean => {
  return replacementIds.some((id) => {
    const replacement = replacementsMap[id];
    return replacement && replacement.quantity === 0;
  });
};

/**
 * Dato un array di ID, che rappresentano i ricambi di una manutenzione, la funzione restituisce null, se la lista e' vuota, quindi non sono previsti ricambi.
 * Se non e' attiva la funzionalita' di magazino, viene restituita la classificazione per manutenzione che prevede dei ricambi.
 * Se e' attiva la funzionalita' di magazzino, vengono controllati tutti i ricambi e, in ordine di priorita', se uno di loro non ha quantita' sufficiente,
 * sta per consumarsi oppure se sono tutti disponibili in quantita' sufficiente, viene restituita la classificazione corrispondente.
 * @param replacementIds - Lista di ricambi
 * @returns Null se la lista e' vuota, altrimenti la classificazione corretta
 */
export const checkReplacementsAvailability = (replacementIds: string[], replacementsMap: Record<string, Replacement>): ClassificationID | null => {
  if (replacementIds.length === 0) return null;

  if (!magazineFuncionality) return "ricambi_richiesti";

  if (isAnyReplacementOutOfStock(replacementIds, replacementsMap)) return "ricambi_richiesti_non_disponibili";
  if (isAnyReplacementLowStock(replacementIds, replacementsMap)) return "ricambi_richiesti_in_esaurimento";
  if (areAllReplacementsAvailable(replacementIds, replacementsMap)) return "ricambi_richiesti_disponibili";

  return null; // Caso di default, anche se non dovrebbe mai succedere
};

export const formatISODate = (isoString: string, includeTime: boolean = true): string => {
  // Converti la stringa ISO in un oggetto Date
  const date = new Date(isoString);

  // Controlla se la data è valida
  if (isNaN(date.getTime())) {
    return "N/A";
  }

  // Ottieni i componenti della data
  const day = String(date.getDate()).padStart(2, "0"); // Giorno
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mese (i mesi sono indicizzati da 0)
  const year = date.getFullYear(); // Anno

  // Se includeTime è false, restituisci solo la data
  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  // Ottieni l'ora e i minuti
  const hours = String(date.getHours()).padStart(2, "0"); // Ore
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Minuti

  // Restituisci la data formattata con l'ora
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

/**
 * Specificando come input, 'image'| 'audio' | 'text', Ritorna (se presente) l'ultima nota (immagine, audio o testuale) della piu' recente esecuzione.
 */
export const getLastNoteHistoryDetais = (
  note: "image" | "audio" | "text",
  historyEntry: HistoryEntry[]
): { lastNote: ImageNote | AudioNote | TextNote | null; author: string | null; totalNotes: number; lastNoteHistoryEntry: HistoryEntry | undefined } => {
  let lastNote = null;
  let author = null;
  let lastNoteHistoryEntry = undefined;
  let totalNotes = 0;

  for (const entry of historyEntry.slice().reverse()) {
    if (note === "image" && entry.imageNotes && entry.imageNotes.length > 0) {
      lastNote = entry.imageNotes[entry.imageNotes.length - 1];
      author = entry.user;
      totalNotes = entry.imageNotes.length;
      lastNoteHistoryEntry = entry;
      break; // Esci dal ciclo dopo aver trovato l'ultima nota
    } else if (note === "audio" && entry.audioNotes && entry.audioNotes.length > 0) {
      lastNote = entry.audioNotes[entry.audioNotes.length - 1];
      author = entry.user;
      totalNotes = entry.audioNotes.length;
      lastNoteHistoryEntry = entry;
      break;
    } else if (note === "text" && entry.textNotes && entry.textNotes.length > 0) {
      lastNote = entry.textNotes[entry.textNotes.length - 1];
      author = entry.user;
      totalNotes = entry.textNotes.length;
      lastNoteHistoryEntry = entry;
      break;
    }
  }

  return { lastNote, author, totalNotes, lastNoteHistoryEntry };
};

export const mergeHistoryEntries = (
  keys: string[], // List of keys to merge from the history object
  history: History // The entire history object
): HistoryEntry[] => {
  let mergedEntries: HistoryEntry[] = [];

  // Collect and merge all the entries from the provided keys
  keys.forEach((key) => {
    const historyEntries = history[key];
    if (historyEntries) {
      mergedEntries = mergedEntries.concat(historyEntries);
    }
  });

  // Sort the merged entries by executionDate (newest first)
  mergedEntries.sort((a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime());

  // Return the merged result with the ID 'merge'
  return mergedEntries;
};

/**
 * Dato un array di chiavi di history, ritorna l'ultima nota (immagine, audio o testuale) della più recente esecuzione.
 * @param note - Il tipo di nota da cercare ('image' | 'audio' | 'text')
 * @param keys - Un array di chiavi che rappresentano le history da analizzare.
 * @param history - L'oggetto che contiene tutte le history (id -> HistoryEntry[]).
 * @returns L'ultima nota della più recente esecuzione tra le history specificate.
 */

export const getLastNoteFromHistoryIds = (
  note: "image" | "audio" | "text",
  keys: string[],
  history: History
): { lastNote: ImageNote | AudioNote | TextNote | null; author: string | null; totalNotes: number } => {
  let lastNote = null;
  let author = null;
  let totalNotes = 0;
  let mostRecentDate: string | null = null;

  // Iteriamo su ogni chiave della lista
  for (const key of keys) {
    const historyEntries = history[key as keyof typeof history] || []; // Recupera le history associate a questa chiave

    // Iteriamo sulle entry della history corrente
    for (const entry of historyEntries) {
      // Se è la più recente esecuzione o la prima trovata, aggiorna il lastNote
      if (!mostRecentDate || new Date(entry.executionDate) > new Date(mostRecentDate)) {
        mostRecentDate = entry.executionDate;

        // Verifica se ha una nota del tipo richiesto
        if (note === "image" && entry.imageNotes && entry.imageNotes.length > 0) {
          lastNote = entry.imageNotes[entry.imageNotes.length - 1];
          author = entry.user;
          totalNotes = entry.imageNotes.length;
        } else if (note === "audio" && entry.audioNotes && entry.audioNotes.length > 0) {
          lastNote = entry.audioNotes[entry.audioNotes.length - 1];
          author = entry.user;
          totalNotes = entry.audioNotes.length;
        } else if (note === "text" && entry.textNotes && entry.textNotes.length > 0) {
          lastNote = entry.textNotes[entry.textNotes.length - 1];
          author = entry.user;
          totalNotes = entry.textNotes.length;
        }
      }
    }
  }

  return { lastNote, author, totalNotes };
};

/**
 * Ritorna (se presenti) 3 booleani per le note ed il colore dell'ultima esecuzione di manutenzione (giallo se anomalo, rosso se noneseguito, bianco se esitoOK).
 */
export const getNotesInfoFromLastExecution = (history: HistoryEntry[]): { hasImageNotes: boolean; hasAudioNotes: boolean; hasTextNotes: boolean; executionOutcome: ExecutionOutcome | undefined } => {
  // Controllo se history non è vuoto e prendo il primo elemento, altrimenti un oggetto vuoto
  const lastExecution = history?.length > 0 ? history[history.length - 1] : null;

  const hasImageNotes = lastExecution?.imageNotes && lastExecution.imageNotes.length > 0 ? true : false;
  const hasAudioNotes = lastExecution?.audioNotes && lastExecution.audioNotes.length > 0 ? true : false;
  const hasTextNotes = lastExecution?.textNotes && lastExecution.textNotes.length > 0 ? true : false;

  // const executionColor = lastExecution?.executionOutcome ? executionOutcomeColor[lastExecution.executionOutcome] : '#fff';
  const executionOutcome = lastExecution?.executionOutcome;

  return { hasImageNotes, hasAudioNotes, hasTextNotes, executionOutcome };
};

export const getOutcomeTitle = (outcome: ExecutionOutcome) => {
  switch (outcome) {
    case "esitoOk":
      return "Conferma ESITO POSITIVO";
    case "anomalia":
      return "Conferma ANOMALIA";
    case "nonEseguito":
      return "Segnala NON ESEGUITA";
    case "nonEseguito":
      return "Segnala NON ESEGUITA";
    default:
      return "";
  }
};

export function getNextExpiryDate(recurrence: Recurrence): string {
  const currentDate = new Date();
  let daysToAdd: number;

  switch (recurrence) {
    case "Giornaliera":
      daysToAdd = 1;
      break;
    case "Settimanale":
      daysToAdd = 7;
      break;
    case "Bisettimanale":
      daysToAdd = 14;
      break;
    case "Mensile":
      daysToAdd = 30;
      break;
    case "Trimestrale":
      daysToAdd = 90;
      break;
    case "Semestrale":
      daysToAdd = 182;
      break;
    case "Annuale":
      daysToAdd = 365;
      break;
    default:
      throw new Error(`Ricorrenza non valida: ${recurrence}`);
  }

  currentDate.setDate(currentDate.getDate() + daysToAdd);

  return currentDate.toISOString();
}

export const handlePlayPauseMaintenance = (maintenance: Maintenance): Maintenance => {
  if (maintenance.pause && maintenance.pauseDate) {
    // Se è in pausa, ripristina lo stato attivo e aggiorna expiryDate
    const pauseDate = new Date(maintenance.pauseDate);
    const expiryDate = new Date(maintenance.expiryDate);
    const currentDate = new Date();

    // Calcola il tempo trascorso dalla messa in pausa
    const timePaused = currentDate.getTime() - pauseDate.getTime();

    // Aggiorna la nuova data di scadenza
    const newExpiryDate = new Date(expiryDate.getTime() + timePaused).toISOString();

    // Ritorna la manutenzione aggiornata con la pausa rimossa e la nuova data di scadenza
    return {
      ...maintenance,
      pause: false,
      pauseDate: undefined, // Rimuovi la pausa
      expiryDate: newExpiryDate, // Aggiorna la data di scadenza
    };
  } else {
    // Se non è in pausa, metti in pausa impostando la data corrente come pauseDate
    return {
      ...maintenance,
      pause: true,
      pauseDate: new Date().toISOString(), // Imposta la data corrente come pausa
    };
  }
};

export function isSystem(item: System | Replacement): item is System {
  return (item as System).motionHours !== undefined;
}

export const updateJobPlayPause = async (maintenance: Job, refresh: () => Promise<void>) => {
  const isPaused = maintenance.status.name === "inPause";
  try {
    const res = await updateStatus(maintenance.id, isPaused ? 1 : 3);
    if (res && res.message === "Status updated successfully") {
      refresh();
    }
  } catch (error) {
    Alert.alert("Errore", "Impossibile aggiornare lo stato di pausa.");
    console.error("Errore aggiornamento stato pausa:", error);
  }
};
