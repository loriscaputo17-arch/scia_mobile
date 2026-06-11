import api from "@/api/axios";
import RNBlobUtil from "react-native-blob-util";
import { AppDispatch } from "@/store/store";
import {
  PendingAction,
  dequeue,
  incrementRetry,
  setSyncError,
} from "@/store/pendingActionsSlice";

// ─── Retry config ─────────────────────────────────────────────────────────────
const RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minuti tra un retry e l'altro

// ─── Main executor ────────────────────────────────────────────────────────────
export async function executeAction(
  action: PendingAction,
  dispatch: AppDispatch
): Promise<boolean> {
  // Non ritentare se è passato meno di RETRY_INTERVAL dalla ultima attempt
  if (action.lastAttemptAt) {
    const elapsed = Date.now() - action.lastAttemptAt;
    if (elapsed < RETRY_INTERVAL_MS) return false;
  }

  try {
    await dispatchApiCall(action);
    dispatch(dequeue(action.id));

    // Pulizia file locali dopo upload riuscito
    if (action.localFileUri) {
      try {
        const path = action.localFileUri.startsWith("file://")
          ? action.localFileUri.replace("file://", "")
          : action.localFileUri;
        await RNBlobUtil.fs.unlink(path);
      } catch {}
    }

    return true;
  } catch (err: any) {
    dispatch(incrementRetry(action.id));
    const msg = err?.response?.data?.message || err?.message || "Sync error";
    dispatch(setSyncError(msg));
    return false;
  }
}

// ─── API calls per tipo ───────────────────────────────────────────────────────
async function dispatchApiCall(action: PendingAction): Promise<void> {
  const p = action.payload;

  switch (action.type) {

  case "MARK_MAINTENANCE_OK": {
    const qs = p.shipId ? `?shipId=${p.shipId}` : "";
    // markAsOk sul web è PATCH multipart su markAsOk/:id?shipId=
    const form = new FormData();
    if (p.spares?.length) form.append("spareIds", JSON.stringify(p.spares));
    if (p.time)    form.append("timeTaken", String(p.time));
    if (p.levelId) form.append("levelId", String(p.levelId));
    if (p.userId)  form.append("userId", String(p.userId));
    await api.patch(`/maintenance/markAsOk/${p.taskId}${qs}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    break;
  }

  case "MARK_MAINTENANCE_ANOMALY": {
    const qs = p.shipId ? `?shipId=${p.shipId}` : "";
    // web: markAs(taskId, 2) → reportAnomaly con { mark }
    await api.patch(`/maintenance/reportAnomaly/${p.taskId}${qs}`, { mark: p.mark ?? 2 });
    break;
  }

  case "MARK_MAINTENANCE_NOT_PERFORMED": {
    const qs = p.shipId ? `?shipId=${p.shipId}` : "";
    // web: markAs(taskId, 3) → STESSO endpoint reportAnomaly con mark: 3
    await api.patch(`/maintenance/reportAnomaly/${p.taskId}${qs}`, { mark: p.mark ?? 3 });
    break;
  }

  case "PAUSE_MAINTENANCE": {
    const qs = p.shipId ? `?shipId=${p.shipId}` : "";
    // backend updateStatus vuole { status_id }; 2 = in pausa
    await api.post(`/maintenance/updateStatus/${p.taskId}${qs}`, {
      status_id: p.new_status_id ?? 2,
    });
    // se ci sono dati commento, salvali (come il web saveStatusComment)
    if (p.reason || p.date || p.only_this || p.all_from_this_product) {
      await api.post(`/maintenance/saveStatusComment/${p.taskId}${qs}`, {
        date: p.date,
        date_flag: p.date_flag,
        reason: p.reason,
        only_this: p.only_this,
        all_from_this_product: p.all_from_this_product,
        old_status_id: p.old_status_id,
        new_status_id: p.new_status_id ?? 2,
      });
    }
    break;
  }

  case "RESUME_MAINTENANCE": {
    const qs = p.shipId ? `?shipId=${p.shipId}` : "";
    // riprendi = status_id 1 (attivo)
    await api.post(`/maintenance/updateStatus/${p.taskId}${qs}`, {
      status_id: p.status_id ?? 1,
    });
    break;
  }

    // ── Letture ───────────────────────────────────────────────────────────────
    case "UPDATE_READING_VALUE": {
      await api.put(`/readings/${p.readingId}`, { value: p.value });
      break;
    }

    case "UPDATE_READING_TAGS": {
      await api.put(`/readings/${p.readingId}`, { tags: p.tags });
      break;
    }

    // ── Note fotografiche ─────────────────────────────────────────────────────
    case "UPLOAD_NOTE_PHOTO": {
      if (!action.localFileUri) throw new Error("Missing local file URI");

      const form = new FormData();
      form.append("entityId", String(p.entityId));
      form.append("entityType", p.entityType);
      form.append("authorId", String(p.authorId));
      form.append("photo", {
        uri: action.localFileUri,
        name: action.localFileName || "photo.jpg",
        type: "image/jpeg",
      } as any);

      await api.post("/uploadFiles/uploadPhoto", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      break;
    }

    // ── Note audio ────────────────────────────────────────────────────────────
    case "UPLOAD_NOTE_AUDIO": {
      if (!action.localFileUri) throw new Error("Missing local file URI");

      const form = new FormData();
      form.append("entityId", String(p.entityId));
      form.append("entityType", p.entityType);
      form.append("authorId", String(p.authorId));
      form.append("audio", {
        uri: action.localFileUri,
        name: action.localFileName || "audio.m4a",
        type: "audio/m4a",
      } as any);

      await api.post("/uploadFiles/uploadAudio", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      break;
    }

    // ── Note testuali ─────────────────────────────────────────────────────────
    case "UPLOAD_NOTE_TEXT": {
      await api.post("/uploadFiles/uploadText", {
        entityId: p.entityId,
        entityType: p.entityType,
        authorId: p.authorId,
        text: p.text,
      });
      break;
    }

    // ── Carrello ──────────────────────────────────────────────────────────────
    case "ADD_TO_CART": {
      await api.post("/cart/addProduct", {
        spareId: p.spareId,
        quantity: p.quantity,
        userId: p.userId,
      });
      break;
    }

    // ── Avarie ────────────────────────────────────────────────────────────────
    case "ADD_FAILURE": {
      await api.post("/failures/addFailure", p);
      break;
    }

    default:
      throw new Error(`Unknown action type: ${(action as any).type}`);
  }
}