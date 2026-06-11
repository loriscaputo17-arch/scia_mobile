import { useEffect, useRef, useCallback } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setSyncing, setSyncError } from "@/store/pendingActionsSlice";
import { executeAction } from "@/services/syncQueue";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // flush ogni 5 min se online

export function useNetworkSync() {
  const dispatch = useDispatch<AppDispatch>();
  const queue = useSelector((state: RootState) => state.pendingActions.queue);
  const isSyncing = useSelector((state: RootState) => state.pendingActions.isSyncing);
  const isOnlineRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flush = useCallback(async () => {
    if (!isOnlineRef.current) return;
    if (isSyncing) return;
    if (queue.length === 0) return;

    dispatch(setSyncing(true));
    dispatch(setSyncError(undefined));

    // Esegui in sequenza (ordine FIFO garantisce consistenza)
    for (const action of [...queue]) {
      if (!isOnlineRef.current) break; // interrompi se perdiamo connessione
      await executeAction(action, dispatch);
    }

    dispatch(setSyncing(false));
  }, [queue, isSyncing, dispatch]);

  // Listener connettività
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !isOnlineRef.current;
      isOnlineRef.current = !!(state.isConnected && state.isInternetReachable);

      // Flush immediato quando torniamo online
      if (wasOffline && isOnlineRef.current) {
        flush();
      }
    });

    // Polling ogni 5 minuti quando siamo online (retry azioni fallite)
    timerRef.current = setInterval(() => {
      if (isOnlineRef.current) flush();
    }, POLL_INTERVAL_MS);

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flush]);

  return { flush, isOnline: isOnlineRef.current };
}