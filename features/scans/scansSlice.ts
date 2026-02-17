import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { scans } from "@/data/scans";

const MAX_SCANS = 10; // Dimensione massima dello storico

const scansSlice = createSlice({
  name: "scans",
  initialState: scans,
  reducers: {
    addScan: (state, action: PayloadAction<string>) => {
      const newScan = action.payload;

      // Controlla se la stringa è già presente nello storico
      const existingIndex = state.indexOf(newScan);
      if (existingIndex !== -1) {
        // Rimuove la stringa già esistente
        state.splice(existingIndex, 1);
      } else if (state.length >= MAX_SCANS) {
        // Se l'array supera la dimensione massima, rimuove il più vecchio
        state.shift();
      }

      // Aggiunge la nuova stringa in coda
      state.push(newScan);
    },
  },
});
export const { addScan } = scansSlice.actions;
export default scansSlice.reducer;
