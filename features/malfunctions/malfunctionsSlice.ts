import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { malfunctions, type Malfunction } from "@/data/malfunctions"; // Mock data (puoi sostituire con API in futuro)

const malfunctionsSlice = createSlice({
  name: "malfunctions",
  initialState: malfunctions, // Dati mock per ora, da sostituire con dati reali in futuro
  reducers: {
    updateMalfunction: (state, action: PayloadAction<Malfunction>) => {
      const index = state.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    addMalfunction: (state, action: PayloadAction<Malfunction>) => {
      const alreadyExisting = state.find((m) => m.id === action.payload.id);
      if (!alreadyExisting) state.push(action.payload);
      else console.warn(`Malfunction with id ${action.payload.id} already exists.`);
      return;
    },
  },
});

export const { updateMalfunction, addMalfunction } = malfunctionsSlice.actions;
export default malfunctionsSlice.reducer;
