import {  type System, systems } from '@/data/systems'; // Importa i sistemi mock o reali
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const systemSlice = createSlice({
    name: 'system',
    initialState: systems, // Dati mock per ora, da sostituire con dati reali in futuro
    reducers: {
        updateSystem: (state, action: PayloadAction<System>) => {
            const { id } = action.payload;
            if (state[id]) {
                state[id] = action.payload; // Aggiorna il sistema specificato
            }
        },
    },
});

export const { updateSystem } = systemSlice.actions;
export default systemSlice.reducer;
