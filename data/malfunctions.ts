import { type IconCollection } from "@/components/atoms/IconComponent";
import { SeverityId } from "./severities";

export type Malfunction = {
  id: string;
  name: string;
  systemId: string;
  date: string;
  user: string;
  severity: SeverityId;
  description?: string;
  [key: string]: any; // per i custom fields
};

export const malfunctions: Malfunction[] = [
  {
    id: "malf_1744115234585",
    name: "Avaria Numero 1",
    systemId: "propulsione_diesel",
    date: "2024-09-24T20:50:00+02:00",
    user: 'Alessandro_Coscarelli_00',
    severity : 'alta',
    description: "Descrizione avaria grave al motore centrale inserita da Alessandro",
  },
];
