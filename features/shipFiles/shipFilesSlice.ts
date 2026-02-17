import { ShipFile } from "@/data/shipFiles";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const shipFilesSlice = createSlice({
  name: "shipFiles",
  initialState: [] as ShipFile[],
  reducers: {

    setFiles: (_state, action: PayloadAction<ShipFile[]>) => {
      return action.payload.map((file) => ({
        ...file,
        id: String(file.id),
        ship_id: String(file.ship_id),
        user_id: String(file.user_id),
      }));
    },
  },
});

// Export azioni
export const { setFiles } = shipFilesSlice.actions;

// Export reducer
export default shipFilesSlice.reducer;

// Selectors
export const selectFiles = (state: { shipFiles: ShipFile[] }) => state.shipFiles;

export const selectFileById = (id: string) => (state: { shipFiles: ShipFile[] }) => state.shipFiles.find((s) => s.id === id);
