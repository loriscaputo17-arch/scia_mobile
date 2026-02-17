export type TeamID = "4" | "equipaggio" | "manutentore" | "comando";

export type Team = {
  id: TeamID;
  label: string;
};
export const teams: Team[] = [
  {
    id: "4",
    label: "Operatori",
  },
  {
    id: "equipaggio",
    label: "Equipaggio",
  },
  {
    id: "manutentore",
    label: "Manutentori",
  },
  {
    id: "comando",
    label: "Comando",
  },
];
