import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { warehouses , type Warehouse } from "@/data/warehouses";

type WarehouseState = {
  warehouses: Warehouse[];
};

const initialState: WarehouseState = {
  warehouses,
};

const warehousesSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {
    // Aggiunge un nuovo magazzino
    addWarehouse: (state, action: PayloadAction<Warehouse>) => {
      state.warehouses.push(action.payload);
    },

    // Sostituisce tutta la lista
    setWarehouses: (state, action: PayloadAction<Warehouse[]>) => {
      state.warehouses = action.payload;
    },
  },
});


export const { addWarehouse, setWarehouses } = warehousesSlice.actions;

// Reducer default
export default warehousesSlice.reducer;

// Selectors
export const selectWarehouses = (state: { warehouses: WarehouseState }) => state.warehouses.warehouses;

export const selectWarehouseById = (id: string) =>
  createSelector(
    selectWarehouses,
    (warehouses) => warehouses.find((w) => w.id === id)
  );
