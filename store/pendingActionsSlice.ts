import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PendingActionType =
  | "MARK_MAINTENANCE_OK"
  | "MARK_MAINTENANCE_ANOMALY"
  | "MARK_MAINTENANCE_NOT_PERFORMED"
  | "UPDATE_READING_VALUE"
  | "UPDATE_READING_TAGS"
  | "UPLOAD_NOTE_PHOTO"
  | "UPLOAD_NOTE_AUDIO"
  | "UPLOAD_NOTE_TEXT"
  | "PAUSE_MAINTENANCE"
  | "RESUME_MAINTENANCE"
  | "ADD_TO_CART"
  | "ADD_FAILURE";

export interface PendingAction {
  id: string;                   // uuid generato al momento della creazione
  type: PendingActionType;
  payload: Record<string, any>; // dati necessari per rifare la chiamata API
  createdAt: number;            // timestamp ms
  retryCount: number;
  lastAttemptAt?: number;
  // Per note con file locali
  localFileUri?: string;        // uri locale del file (foto/audio)
  localFileName?: string;
}

export interface PendingActionsState {
  queue: PendingAction[];
  isSyncing: boolean;
  lastSyncAt?: number;
  syncError?: string;
}

const initialState: PendingActionsState = {
  queue: [],
  isSyncing: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const pendingActionsSlice = createSlice({
  name: "pendingActions",
  initialState,
  reducers: {
    enqueue(state, action: PayloadAction<Omit<PendingAction, "retryCount" | "createdAt">>) {
      // Deduplication: se esiste già un'azione dello stesso tipo sullo stesso entity, sostituisce
      // (last-write-wins per letture e manutenzioni)
      const dedupTypes: PendingActionType[] = [
        "MARK_MAINTENANCE_OK",
        "MARK_MAINTENANCE_ANOMALY",
        "MARK_MAINTENANCE_NOT_PERFORMED",
        "UPDATE_READING_VALUE",
        "UPDATE_READING_TAGS",
        "PAUSE_MAINTENANCE",
        "RESUME_MAINTENANCE",
      ];

      if (dedupTypes.includes(action.payload.type)) {
        // Rimuovi eventuali azioni precedenti dello stesso tipo + stesso id entità
        const entityId = action.payload.payload?.taskId
          || action.payload.payload?.readingId
          || action.payload.payload?.id;

        state.queue = state.queue.filter((a) => {
          if (a.type !== action.payload.type) return true;
          const aEntityId = a.payload?.taskId || a.payload?.readingId || a.payload?.id;
          return aEntityId !== entityId;
        });
      }

      state.queue.push({
        ...action.payload,
        retryCount: 0,
        createdAt: Date.now(),
      });
    },

    dequeue(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter((a) => a.id !== action.payload);
    },

    incrementRetry(state, action: PayloadAction<string>) {
      const item = state.queue.find((a) => a.id === action.payload);
      if (item) {
        item.retryCount += 1;
        item.lastAttemptAt = Date.now();
      }
    },

    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
      if (!action.payload) state.lastSyncAt = Date.now();
    },

    setSyncError(state, action: PayloadAction<string | undefined>) {
      state.syncError = action.payload;
    },

    clearQueue(state) {
      state.queue = [];
    },
  },
});

export const {
  enqueue,
  dequeue,
  incrementRetry,
  setSyncing,
  setSyncError,
  clearQueue,
} = pendingActionsSlice.actions;

export default pendingActionsSlice.reducer;