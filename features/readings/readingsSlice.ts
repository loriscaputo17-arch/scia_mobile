import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type Reading } from "@/data/readings";

const readingsSlice = createSlice({
  name: "readings",
  initialState: [] as Reading[],
  reducers: {
    setReadings: (_state, action: PayloadAction<Reading[]>) => {
      return action.payload.map((item) => ({
        ...item,
        id: String(item.id),
        user_id: String(item.user_id),
        ship_id: String(item.ship_id),
        task_name: item.task_name,
        eswbs_id: String(item.eswbs_id),
        recurrence: String(item.recurrence),
        value: String(item.value),
        due_date: item.due_date,
        description: item.description,

        tags: Array.isArray(item.tags)
          ? item.tags
          : String(item.tags)
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
        team: item.team,
        reading_type: String(item.reading_type),
        type: {
          id: String(item.type?.id ?? ""),
          name: item.type?.name ?? "",
        },
        element: {
          id: String(item.element?.id ?? ""),
          name: item.element?.name ?? "",
          element_model_id: String(item.element?.element_model_id ?? ""),
          ship_id: String(item.element?.ship_id ?? ""),
          serial_number: item.element?.serial_number ?? "",
          installation_date: item.element?.installation_date ?? null,
          progressive_code: item.element?.progressive_code ?? null,
        },
        vocalNotes:
          item.vocalNotes?.map((note) => ({
            ...note,
            id: String(note.id),
            failure_id: note.failure_id !== null ? String(note.failure_id) : null,
          })) ?? [],

        textNotes:
          item.textNotes?.map((note) => ({
            ...note,
            id: String(note.id),
            failure_id: note.failure_id !== null ? String(note.failure_id) : null,
          })) ?? [],

        photographicNotes:
          item.photographicNotes?.map((note) => ({
            ...note,
            id: String(note.id),
            failure_id: note.failure_id !== null ? String(note.failure_id) : null,
          })) ?? [],
      }));
    },

    //  updateReading: (state, action: PayloadAction<Reading>) => {
    //   const index = state.findIndex(t => t.id === action.payload.id);
    //   if (index !== -1) {
    //     state[index] = action.payload;
    //   }
    // },
    // resetValueReadingsByListId: (state, action: PayloadAction<string>) => {
    //   // Aggiorna tutti i reading con il listId specificato
    //   state.forEach((reading) => {
    //     if (reading.listId === action.payload) {
    //       reading.value = undefined;
    //     }
    //   });
    // },
  },
});

export const { setReadings /*  updateReading, resetValueReadingsByListId */ } = readingsSlice.actions;

export default readingsSlice.reducer;

// Selector
export const selectReadings = (state: { readings: Reading[] }) => state.readings;
export const selectReadingById = (id: string) => (state: { readings: Reading[] }) => state.readings.find((r) => r.id === id);
export const selectReadingsByTypeId = (typeId: string) => (state: { readings: Reading[] }) => state.readings.filter((t) => t.reading_type === typeId);
