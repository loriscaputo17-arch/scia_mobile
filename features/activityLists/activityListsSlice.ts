import { activityLists } from "@/data/activityLists";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Creazione del slice Redux per activityLists
const activityListsSlice = createSlice({
  name: "activityList",
  initialState: activityLists, // Dati mock, eventualmente da sostituire con dati reali
  reducers: {
    // Aggiorna la data di scadenza di una lista di attività
    updateListExpiryDate: (state, action: PayloadAction<{ listId: string; newExpiryDate: string }>) => {
      const { listId, newExpiryDate } = action.payload;
      const list = state[listId];
      // Verifica se la lista esiste prima di aggiornare la data di scadenza
      if (list && (list.type === "checklist" || list.type === "reading" || list.type === "maintenance")) {
        list.listExpiryDate = newExpiryDate; // Aggiorna la data di scadenza
      }
    },

    // Aggiorna la data di esecuzione di una lista di attività
    updateListLastExecutionDate: (state, action: PayloadAction<{ listId: string; newExecutionDate: string }>) => {
      const { listId, newExecutionDate } = action.payload;
      // Verifica se la lista esiste prima di aggiornare la data di scadenza
      if (state[listId]) {
        state[listId].listLastExecutionDate = newExecutionDate;
      }
    },

    addActivityToList: (state, action: PayloadAction<{ listId: string; activityId: string }>) => {
      const { listId, activityId } = action.payload;
      if (state[listId] && !state[listId].activities.includes(activityId)) {
        state[listId].activities.push(activityId);
      }
    },
  },
});

// Esportazione delle azioni
export const { updateListExpiryDate, updateListLastExecutionDate, addActivityToList } = activityListsSlice.actions;

// Esportazione del reducer come default
export default activityListsSlice.reducer;
