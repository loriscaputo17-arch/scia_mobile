// features/pendingActions/pendingActionsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PendingAction {
  id: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  payload: any;
  timestamp: number;
}

const pendingActionsSlice = createSlice({
  name: "pendingActions",
  initialState: { queue: [] as PendingAction[] },
  reducers: {
    enqueue: (state, action: PayloadAction<Omit<PendingAction, "id" | "timestamp">>) => {
      state.queue.push({
        ...action.payload,
        id: Math.random().toString(36).slice(2),
        timestamp: Date.now(),
      });
    },
    dequeue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((a) => a.id !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
  },
});

export const { enqueue, dequeue, clearQueue } = pendingActionsSlice.actions;
export default pendingActionsSlice.reducer;