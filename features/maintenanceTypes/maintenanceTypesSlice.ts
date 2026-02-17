import { type MaintenanceType } from "@/data/maintenanceTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const maintenanceTypesSlice = createSlice({
  name: "maintenanceTypes",
  initialState: [] as MaintenanceType[], // Dati mock per ora, da sostituire con dati reali in futuro
  reducers: {
    // updateMaintenance: (state, action: PayloadAction<Maintenance>) => {
    //   const index = state.findIndex(m => m.id === action.payload.id);
    //   if (index !== -1) {
    //     state[index] = action.payload;
    //   }
    // },

    // Sostituisce tutte le manutenzioni (es: da API)
    setMaintenanceTypes: (_state, action: PayloadAction<MaintenanceType[]>) => {
      return action.payload;
    },
  },
});

export const {
  /* updateMaintenance */
  setMaintenanceTypes,
} = maintenanceTypesSlice.actions;
export default maintenanceTypesSlice.reducer;

/* Selectors */

export const selectMaintenanceTypes = (state: { maintenanceTypes: MaintenanceType[] }) => state.maintenanceTypes;
