import { useCallback } from "react";
import { useDispatch } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import RNBlobUtil from "react-native-blob-util";
import { v4 as uuidv4 } from "uuid";
import { AppDispatch } from "@/store/store";
import { enqueue, PendingActionType } from "@/store/pendingActionsSlice";
import { executeAction } from "@/services/syncQueue";

const PENDING_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/pending`;

async function ensurePendingDir() {
  const exists = await RNBlobUtil.fs.isDir(PENDING_DIR).catch(() => false);
  if (!exists) {
    await RNBlobUtil.fs.mkdir(PENDING_DIR).catch(() => {});
  }
}

async function copyFileToPending(srcUri: string, actionId: string, ext: string): Promise<string> {
  await ensurePendingDir();
  const dest = `${PENDING_DIR}/${actionId}.${ext}`;
  const src = srcUri.startsWith("file://") ? srcUri.replace("file://", "") : srcUri;
  await RNBlobUtil.fs.cp(src, dest);
  return dest;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface OfflineActionParams {
  type: PendingActionType;
  payload: Record<string, any>;
  optimistic?: () => void;
  localFileUri?: string;
  localFileName?: string;
}

export function useOfflineAction() {
  const dispatch = useDispatch<AppDispatch>();

  const execute = useCallback(
    async (params: OfflineActionParams): Promise<void> => {
      const { type, payload, optimistic, localFileUri, localFileName } = params;

      optimistic?.();

      const netState = await NetInfo.fetch();

      const isOnline =
        !!netState.isConnected && netState.isInternetReachable !== false;

      const actionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      let persistedUri = localFileUri;
      if (localFileUri) {
        try {
          const ext = localFileName?.split(".").pop() || "bin";
          persistedUri = await copyFileToPending(localFileUri, actionId, ext);
        } catch (e) {
          console.warn("[useOfflineAction] Failed to persist file locally:", e);
          persistedUri = localFileUri;
        }
      }

      const pendingAction = {
        id: actionId,
        type,
        payload,
        localFileUri: persistedUri,
        localFileName,
      };

      if (isOnline) {
        const success = await executeAction(
          { ...pendingAction, retryCount: 0, createdAt: Date.now() },
          dispatch
        );
        if (!success) {
          dispatch(enqueue(pendingAction));
        }
      } else {
        dispatch(enqueue(pendingAction));
      }
    },
    [dispatch]
  );

  return { execute };
}