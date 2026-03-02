import { useEffect } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useDispatch, useSelector } from "react-redux";
import { dequeue } from "@/features/pendingActions/pendingActionsSlice";
import { RootState, AppDispatch } from "@/store/store";
import axios from "axios";

export function usePendingActionsSync() {
  const dispatch = useDispatch<AppDispatch>();
  const queue = useSelector((state: RootState) => state.pendingActions.queue);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      if (state.isConnected && queue.length > 0) {
        for (const action of queue) {
          try {
            await axios({
              method: action.method,
              url: action.endpoint,
              data: action.payload,
            });
            dispatch(dequeue(action.id));
          } catch {
            // lascia in coda, riprova al prossimo reconnect
          }
        }
      }
    });
    return unsubscribe;
  }, [queue]);
}