import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type Location } from "@/data/locations";

const locationsSlice = createSlice({
  name: "locations",
  initialState: [] as Location[],
  reducers: {
    // // Aggiunge una nuova location
    // addLocation: (state, action: PayloadAction<Location>) => {
    //   state.push(action.payload);
    // },

    // // Rimuove una location per ID
    // removeLocation: (state, action: PayloadAction<string>) => {
    //   return state.filter((loc) => loc.id !== action.payload);
    // },

    // Sostituisce tutte le location (es: da API)
    setLocations: (_state, action: PayloadAction<Location[]>) => {
      return action.payload;
    },
  },
});

// Export azioni
export const { /* addLocation, removeLocation, */ setLocations } = locationsSlice.actions;

// Export reducer
export default locationsSlice.reducer;

// Selectors
export const selectLocations = (state: { locations: Location[] }) => state.locations;

export const selectLocationById = (id: string) => (state: { locations: Location[] }) => state.locations.find((l) => l.id === id);
