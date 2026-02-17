import { type IconCollection } from "@/components/atoms/IconComponent";
import { Recurrence } from "./recurrenceTresholds";
import { ExecutionOutcome } from "./history";
import { type TeamID } from "./teams";

export type Task = {
  id: string;
  name: string;
  systemId: string;
 /*  iconComponentImpianto: IconCollection;
  iconPropsImpianto: {
    name: string;
    color: string;
  }; */
  recurrence: Recurrence;
  recurrence2: string;
  listId: string;
  expiryDate: string;
  lastExecution: string;
  description?: string;
  check: ExecutionOutcome;
  team: TeamID;
};

export const tasks: Task[] = [
  {
    id: "controllo_presenza_foglie_nella_scatola",
    name: "Controllo presenza foglie nella scatola",
    systemId: "propulsione_diesel",
    recurrence: "Giornaliera",
    listId: "daily_maintenance",
    recurrence2: "1gg",
    expiryDate: "10/04/2024",
    lastExecution: "09/05/2024",
    check: "nonEseguito",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    team: "manutentore",
  },
  {
    id: "chiusura_portellone_anteriore",
    name: "Chiusura portellone anteriore",
    systemId: "quadro_elettrico",
    recurrence2: "5gg",
    recurrence: "Giornaliera",
    listId: "daily_maintenance",
    expiryDate: "21/05/2024",
    lastExecution: "18/04/2024",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    check: "nonEseguito",
    team: "manutentore",
  },
  {
    id: "accensione_luce_ingresso",
    name: "Accensione luce ingresso",
    systemId: "quadro_elettrico",
    recurrence: "Giornaliera",
    listId: "daily_maintenance",
    recurrence2: "1gg",
    expiryDate: "24/05/2024",
    lastExecution: "22/04/2024",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    check: "nonEseguito",
    team: "manutentore",
  },
  {
    id: "dasdasdas__dasdasdsa",
    name: "dasdasdas  dasdasdsa",
    systemId: "controllo_sicurezza_entrata",
    recurrence: "Giornaliera",
    listId: "daily_maintenance",
    recurrence2: "1gg",
    expiryDate: "10/04/2024",
    lastExecution: "09/05/2024",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    check: "nonEseguito",
    team: "operatore",
  },
  {
    id: "dasdasdasdasdasore",
    name: "dasdasdasdasdasore",
    systemId: "scafo_struttura",
    recurrence2: "5gg",
    recurrence: "Giornaliera",
    listId: "daily_maintenance",
    expiryDate: "21/05/2024",
    lastExecution: "18/04/2024",
    check: "nonEseguito",
    team: "comando",
  },
  {
    id: "blablalba",
    name: "blablalba",
    systemId: "scafo_struttura",
    recurrence2: "1gg",
    recurrence: "Giornaliera",
    listId: "controlli_prepartenza",
    expiryDate: "24/05/2024",
    lastExecution: "22/04/2024",
    check: "nonEseguito",
    team: "manutentore",
  },
  {
    id: "blablasdasdasdasdo",
    name: "blablasdasdasdasdo",
    systemId: "controllo_sicurezza_entrata",
    recurrence2: "1gg",
    recurrence: "Giornaliera",
    listId: "controlli_prepartenza",
    expiryDate: "24/05/2024",
    lastExecution: "22/04/2024",
    check: "nonEseguito",
    team: "manutentore",
  },
  {
    id: "dasd_dasdsa_dasda",
    name: "dasd dasdsa dasda",
    systemId: "controllo_sicurezza_entrata",
    recurrence: "Giornaliera",
    listId: "daily_maintenance",
    recurrence2: "1gg",
    expiryDate: "24/05/2024",
    lastExecution: "22/04/2024",
    check: "nonEseguito",
    team: "operatore",
  },
  {
    id: "ultimo_checklist",
    name: "ultimo task",
    systemId: "controllo_sicurezza_entrata",
    recurrence: "Giornaliera",
    listId: "daily_maintenance",
    recurrence2: "1gg",
    expiryDate: "24/05/2024",
    lastExecution: "22/04/2024",
    check: "nonEseguito",
    team: "manutentore",
  },
];
