import { history, HistoryEntry } from '@/data/history'; // Importa i sistemi mock o reali
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const historySlice = createSlice({
    name: 'history',
    initialState: history, // Dati mock per ora, da sostituire con dati reali in futuro
    reducers: {
      // Action to add a new history entry for a given maintenance ID
      addHistoryEntry: (
        state, 
        action: PayloadAction<{ maintenanceId: string; entry: HistoryEntry }>
      ) => {
        const { maintenanceId, entry } = action.payload;
  
        // If the maintenance ID already exists, append the new entry to its history
        if (state[maintenanceId]) {
          state[maintenanceId].push(entry);
        } else {
          // If the maintenance ID doesn't exist, create a new array with the entry
          state[maintenanceId] = [entry];
        }
      },
    },
  });
  
  // Export actions
  export const { addHistoryEntry } = historySlice.actions;
  
  // Export the reducer
  export default historySlice.reducer;