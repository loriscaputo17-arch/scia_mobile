import { useEffect, useRef, useCallback } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setSyncing, setSyncError } from "@/store/pendingActionsSlice";
import { executeAction } from "@/services/syncQueue";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

// ─── Hook (uso interno) ───────────────────────────────────────────────────────
// Non esportare questo hook da usare direttamente nel layout —
// usa invece il componente <NetworkSyncProvider> qui sotto.
function useNetworkSyncInternal() {
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

    for (const action of [...queue]) {
      if (!isOnlineRef.current) break;
      await executeAction(action, dispatch);
    }

    dispatch(setSyncing(false));
  }, [queue, isSyncing, dispatch]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !isOnlineRef.current;
      isOnlineRef.current = !!(state.isConnected && state.isInternetReachable);
      if (wasOffline && isOnlineRef.current) flush();
    });

    timerRef.current = setInterval(() => {
      if (isOnlineRef.current) flush();
    }, POLL_INTERVAL_MS);

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flush]);
}

// ─── Componente da usare nel layout ──────────────────────────────────────────
// Mettilo DENTRO <Provider> e <PersistGate>, non fuori.
// Renderizza null — esiste solo per avviare i listener di rete.
//
// Uso in app/_layout.tsx:
//
//   <Provider store={store}>
//     <PersistGate loading={<LoadingScreen />} persistor={persistor}>
//       <NetworkSyncProvider />     ← qui, DENTRO PersistGate
//       <OfflineBanner />
//       <Stack ... />
//     </PersistGate>
//   </Provider>
//
export function NetworkSyncProvider() {
  useNetworkSyncInternal();
  return null;
}

// ─── Hook pubblico per il flush manuale (es. da OfflineBanner) ───────────────
// Questo hook è safe da usare solo in componenti già dentro il Provider.
export function useFlushQueue() {
  const dispatch = useDispatch<AppDispatch>();
  const queue = useSelector((state: RootState) => state.pendingActions.queue);
  const isSyncing = useSelector((state: RootState) => state.pendingActions.isSyncing);

  const flush = useCallback(async () => {
    const netState = await NetInfo.fetch();
    const isOnline = !!(netState.isConnected && netState.isInternetReachable);
    if (!isOnline || isSyncing || queue.length === 0) return;

    dispatch(setSyncing(true));
    dispatch(setSyncError(undefined));

    for (const action of [...queue]) {
      await executeAction(action, dispatch);
    }

    dispatch(setSyncing(false));
  }, [queue, isSyncing, dispatch]);

  return { flush };
}