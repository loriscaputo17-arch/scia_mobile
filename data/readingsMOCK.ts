import { type IconCollection } from "@/components/atoms/IconComponent";
import { Recurrence } from "./recurrenceTresholds";
import { type TeamID } from "./teams";
import { type ExecutionOutcome } from "./history";



/* 

export type Reading = {
  id: number;
  user_id: number;
  ship_id: number;
  task_name: string;
  eswbs_id: string;
  recurrence: string;
  value: string;
  due_date: string; // puoi usare Date se viene già convertita
  description: string;
  tags: string;
  team: string;
  reading_type: number;
  type: {
    id: number;
    name: string;
  };
  element: {
    id: number;
    name: string;
    element_model_id: number;
    ship_id: number;
    serial_number: string;
    installation_date: string | null;
    progressive_code: string | null;
    element_model: {
      id: number;
      parent_element_model_id: number;
      ship_model_id: number;
      ESWBS_code: string;
      LCN_name: string;
      Supplier_Parts_ID: number;
      Installed_quantity_on_End_Item: number;
      Manufacturer_Parts_ID: number;
      Installed_Quantity_on_Ship: number;
      ContractualBreakdown_ID: number | null;
      LCNtype_ID: number;
      Heat_transfer_to_air: number | null;
      Heat_transfer_to_water: number | null;
      Power_supply: string | null;
      RatedPower: string | null;
      Shipyard_arrangement_drawing_link: string | null;
      Position_on_arrangement_drawing: string | null;
      Reference_Designator: string | null;
      Shock_mounts_Vibration_mounts: string | null;
      Ship_Area_Room_Code: string | null;
      ElementModel_installation_drawing_link: string | null;
      Yearly_Operating_Hours: string | null;
      Yearly_Operating_Hours_during_missions: string | null;
      Criticality_Code_CC: string | null;
      Repairability_Code_CR: string | null;
      Replaceability_Code_CS: string | null;
      Alternate_LCN_ALC: string | null;
      Level1: string | null;
      Level4: string | null;
      Level5: string | null;
      Level6: string | null;
      Level7: string | null;
      Level8: string | null;
      Level9: string | null;
      XG_Center_of_gravity: string | null;
      YG_Center_of_gravity: string | null;
      ZG_Center_of_gravity: string | null;
      Installed_quantity_on_next_higher_assy: string;
      Absorbed_current: string | null;
      Revolution_speed: string | null;
      Operating_pressure: string | null;
      Mass_flow: string | null;
      Delivery_Head: string | null;
      Test_pressure: string | null;
    };
  };
};
 */

export type Reading = {
  id: string;
  name: string;
  systemId: string;
  recurrence: Recurrence;
  recurrence2: string;
  listId: string;
  expiryDate: string;
  lastExecution: string;
  description?: string;
  team: TeamID;
  value?: number;
};

export const readings: Reading[] = [
  {
    id: "capacita_olio_motore_read",
    name: "Lettura capacita' olio motore",
    systemId: "propulsione_diesel",
    recurrence: "Giornaliera",
    listId: "lettura_vano_motore",
    recurrence2: "1gg",
    expiryDate: "10/04/2024",
    lastExecution: "09/05/2024",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    team: "manutentore",
  },
  {
    
    id: "accensione_luce_ingresso_read",
    name: "Lettura accensione luce ingresso",
    systemId: "propulsione_elettrica",
    recurrence: "Giornaliera",
    listId: "cabina_di_comando",
    recurrence2: "5gg",
    expiryDate: "10/04/2024",
    lastExecution: "09/05/2024",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    team: "manutentore",
  },
  {
    id: "chiusura_portellone_anteriore_read",
    name: "Lettura chiusura portellone anteriore",
    systemId: "propulsione_elettrica",
    recurrence: "Giornaliera",
    listId: "sala_macchine",
    recurrence2: "1gg",
    expiryDate: "24/05/2024",
    lastExecution: "22/04/2024",
    description: "Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    team: "manutentore",
    // value: 5.10,
  },
  {
    id: "controllo_presenza_foglie_nella_scatola_read",
    name: "Lettura controllo presenza foglie nella scatola",
    systemId: "propulsione_diesel",
    recurrence: "Giornaliera",
    listId: "sala_macchine",
    recurrence2: "1gg",
    expiryDate: "10/04/2024",
    lastExecution: "09/05/2024",
    description: "Lettura: Fare defluire acqua e sporcizia all’interno del serbatoio olio mot…",
    team: "manutentore",
  },
];
