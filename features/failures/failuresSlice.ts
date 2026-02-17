import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type Failure } from "@/data/failures";

const failuresSlice = createSlice({
  name: "failures",
  initialState: [] as Failure[],
  reducers: {
    setFailures: (_state, action: PayloadAction<Failure[]>) => {
      return action.payload.map((item) => {
        const parsedFields: { name: string; value: string }[] = item.customFields ? JSON.parse(item.customFields) : [];

        const customFieldObject = parsedFields.reduce((acc, curr) => {
          acc[curr.name] = curr.value;
          return acc;
        }, {} as Record<string, any>);

        return {
          ...item,
          id: String(item.id),
          userExecution: String(item.userExecution),
          ship_id: String(item.ship_id),
          userExecutionData: item.userExecutionData
            ? {
                ...item.userExecutionData,
                id: String(item.userExecutionData.id),
                team_id: String(item.userExecutionData.team_id),
              }
            : null,
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
          ...customFieldObject,
        };
      });
    },
  },
});

export const { setFailures } = failuresSlice.actions;
export default failuresSlice.reducer;

// Selectors
export const selectFailures = (state: { failures: Failure[] }) => state.failures;
export const selectFailureById = (id: string) => (state: { failures: Failure[] }) => state.failures.find((f) => f.id === id);
