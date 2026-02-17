export type Stock = {
  sparePartId: string;
  locationId: string;
  quantity: number;
};

export const stocks: Stock[] = [
  { sparePartId: "ricambio_n_3", locationId: "a12", quantity: 7 },
  { sparePartId: "ricambio_n_3", locationId: "a13", quantity: 5 },
  { sparePartId: "ricambio_n_3", locationId: "b4", quantity: 5 },
  { sparePartId: "cinghia_di_distribuzione", locationId: "b4", quantity: 5 },
];
