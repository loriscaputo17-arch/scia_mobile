// features/ranks/ranksSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rank } from "@/data/ranks";

/* Dati dal backend inconsistenti (in valore e naming), necessario rimapparli a mano in stringhe. */

interface RanksState {
  ranks: Rank[];
}

const initialState: RanksState = {
  ranks: [],
};

const ranksSlice = createSlice({
  name: "ranks",
  initialState,
  reducers: {
    /*  setRanks: (state, action: PayloadAction<Rank[]>) => {
      state.ranks = action.payload;
    }, */

    // Set dello stato ad esempio da API, convertendo potenziali campi number in stringa
    setRanks: (state, action: PayloadAction<Rank[]>) => {
      state.ranks = action.payload.map((rank) => ({
        ...rank,
        id: String(rank.id),
        grado: String(rank.grado),
      }));
    },
  },
});

export const { setRanks } = ranksSlice.actions;
export default ranksSlice.reducer;

// Selectors
export const selectRanks = (state: { ranks: RanksState }) => state.ranks.ranks;
export const selectRankById = (id: string) => (state: { ranks: RanksState }) => state.ranks.ranks.find((r) => r.id.toString() === id);
