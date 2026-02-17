import { stocks } from "@/data/AAAstocks";
import { locations } from "@/data/AAAlocations";
import { warehouses } from "@/data/AAAwarehouses";
import { Replacement } from "@/data/replacements";


type BreakdownEntry = {
  warehouseId: string;
  warehouseName: string;
  iconUrl: string;
  locationNames: string[];
  total: number;
};

/**
 * @param spare - Replacement
 * Dato come input un Replacement, costituito in particolare da:
 * location: string; // es. "6,2" che rappresenta due ubicazioni
 * quantity: string; // es. "10,10" che rappresenta la quantita' in ogni ubicazione
 * locations: { id: number; location: string; warehouse: string }[];
 * warehouses: { id: number; name: string; icon_url: string }[];
 * 
 * Restituisce un Record di magazzini
 * Ogni magazzino include:
 * - ID del magazzino
 * - Nome del magazzino
 * - Lista delle location
 * - Quantità totale del ricambio presente nel magazzino
 * 
 * 
 * 
 * Example Output:
 * {
  "10": {
    warehouseId: "10",
    warehouseName: "A bordo",
    locationNames: ["A12", "A13"],
    total: 10
  },
  ...
}
 */


export function getWarehouseBreakdownFromSpare(spare: Replacement): Record<string, BreakdownEntry> {
  const breakdown: Record<string, BreakdownEntry> = {};

  const locationIds = spare.location.split(",").map((id) => id.trim());
  const quantities = spare.quantity.split(",").map((q) => parseFloat(q.trim()));

  // Mappa ID → location info
  const locationMap = Object.fromEntries(spare.locations.map((l) => [String(l.id), l]));
  const warehouseMap = Object.fromEntries(spare.warehouses.map((w) => [String(w.id), w]));

  locationIds.forEach((locId, index) => {
    const locationInfo = locationMap[locId];
    const quantity = quantities[index] || 0;

    if (!locationInfo) return;
    const warehouseId = String(locationInfo.warehouse);
    const warehouse = warehouseMap[warehouseId];

    if (!warehouse) return;

    if (!breakdown[warehouseId]) {
      breakdown[warehouseId] = {
        warehouseId,
        warehouseName: warehouse.name,
        iconUrl: warehouse.icon_url as string,
        locationNames: [],
        total: 0,
      };
    }

    breakdown[warehouseId].locationNames.push(locationInfo.location);
    breakdown[warehouseId].total += quantity;
  });

  return breakdown;
}


/**
 * @param quantityStr - string
 * Una stringa contenente quantità numeriche separate da virgole.
 * Ogni valore rappresenta una quantità relativa a una ubicazione specifica.
 * 
 * La funzione analizza la stringa, estrae i valori numerici e restituisce la somma totale.
 * I valori non numerici vengono ignorati. Gli spazi vengono rimossi.
 * 
 * 
 * 📌 Esempi di input:
 * "10,5"       ➜ 15
 * " 3.5, 2 "   ➜ 5.5
 * ""           ➜ 0
 * "4,a,6"      ➜ 10 (la lettera viene ignorata)
 * 
 * @returns number
 * La somma totale delle quantità valide trovate nella stringa.
 */
export function getTotalQuantityFromString(quantityStr: string): number {
  if (!quantityStr) return 0;

  return quantityStr
    .split(",")
    .map(q => parseFloat(q.trim()))
    .filter(q => !isNaN(q))
    .reduce((acc, curr) => acc + curr, 0);
}





/**
 * Restituisce tutti i record di stock per un determinato ricambio.
 * Ogni record rappresenta la quantità disponibile in una location specifica.
 * @param sparePartId - ID del ricambio
 */
export function getStocksForSparePart(sparePartId: string) {
  return stocks.filter((s) => s.sparePartId === sparePartId);
}

/**
 * Restituisce tutte le location (ubicazioni) in cui è presente un certo ricambio.
 * Filtra le location in base agli stock disponibili.
 * @param sparePartId - ID del ricambio
 */
export function getLocationsForSparePart(sparePartId: string) {
  const spareStocks = getStocksForSparePart(sparePartId);
  const locationIds = spareStocks.map((s) => s.locationId);
  return locations.filter((l) => locationIds.includes(l.id));
}

/**
 * Restituisce tutti i magazzini in cui è presente un certo ricambio.
 * Deriva i magazzini dalle location dove il ricambio ha stock disponibile.
 * @param sparePartId - ID del ricambio
 */
export function getWarehousesForSparePart(sparePartId: string) {
  const relevantLocations = getLocationsForSparePart(sparePartId);
  const warehouseIds = Array.from(new Set(relevantLocations.map((l) => l.warehouseId)));
  return warehouses.filter((w) => warehouseIds.includes(w.id));
}


/**
 * Restituisce un oggetto con la suddivisione dello stock per magazzino.
 * Ogni magazzino include:
 * - ID del magazzino
 * - Nome del magazzino
 * - Lista delle location
 * - Quantità totale del ricambio presente nel magazzino
 * @param sparePartId - ID del ricambio
 * 
 * Example Output:
 * {
  "10": {
    warehouseId: "10",
    warehouseName: "A bordo",
    locationNames: ["A12", "A13"],
    total: 10
  },
  ...
}
 */
export function getWarehouseStockBreakdown(sparePartId: string) {
  const breakdown: Record<
    string,
    {
      warehouseId: string;
      warehouseName: string;
      locationNames: string[];
      total: number;
    }
  > = {};

  const locationMap = Object.fromEntries(locations.map((l) => [l.id, l]));
  const warehouseMap = Object.fromEntries(warehouses.map((w) => [w.id, w.name]));

  const spareStocks = getStocksForSparePart(sparePartId);

  for (const stock of spareStocks) {
    const loc = locationMap[stock.locationId];
    if (!loc) continue;

    const warehouseId = loc.warehouseId;
    const warehouseName = warehouseMap[warehouseId];

    if (!breakdown[warehouseId]) {
      breakdown[warehouseId] = {
        warehouseId,
        warehouseName,
        locationNames: [],
        total: 0,
      };
    }

    breakdown[warehouseId].locationNames.push(loc.name);
    breakdown[warehouseId].total += stock.quantity;
  }

  return breakdown;
}

/**
 * Restituisce un oggetto con la suddivisione dello stock per location.
 * Ogni location include:
 * - ID della location
 * - Nome della location
 * - Quantità totale del ricambio in quella location
 * - Nome del magazzino a cui appartiene la location
 * - ID del magazzino
 * @param sparePartId - ID del ricambio
 * 
 * Example Output:
 * {
  "10": {
    locationId: "10",
    locationName: "A12",
    quantity: 5,
    warehouseId: "10",
    warehouseName: "A bordo"
  },
  ...
 */
export function getLocationStockBreakdown(sparePartId: string) {
  const breakdown: Record<
    string,
    {
      locationId: string;
      locationName: string;
      quantity: number;
      warehouseId: string;
      warehouseName: string;
    }
  > = {};

  const locationMap = Object.fromEntries(locations.map((l) => [l.id, l]));
  const warehouseMap = Object.fromEntries(warehouses.map((w) => [w.id, w.name]));

  const spareStocks = getStocksForSparePart(sparePartId);

  for (const stock of spareStocks) {
    const loc = locationMap[stock.locationId];
    if (!loc) continue;

    const locationId = loc.id;
    const locationName = loc.name;
    const warehouseId = loc.warehouseId;
    const warehouseName = warehouseMap[warehouseId];

    breakdown[locationId] = {
      locationId,
      locationName,
      quantity: stock.quantity,
      warehouseId,
      warehouseName,
    };
  }

  return breakdown;
}



/**
 * Restituisce la quantità totale disponibile per un certo ricambio,
 * sommando tutti i record di stock indipendentemente dal magazzino o location.
 * @param sparePartId - ID del ricambio
 */
export function getTotalQuantityForSparePart(sparePartId: string): number {
  return getStocksForSparePart(sparePartId).reduce((sum, s) => sum + s.quantity, 0);
}
