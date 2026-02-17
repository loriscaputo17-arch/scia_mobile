import { useDispatch } from "react-redux";
import { addHistoryEntry } from "@/features/history/historySlice";
import { updateListLastExecutionDate } from "@/features/activityLists/activityListsSlice";
import { getNextExpiryDate } from "@/app/utils/utils";
import { AudioNote, ImageNote, TextNote, type ExecutionOutcome } from "@/data/history";
import { Maintenance } from "@/data/maintenences";
import { decrementReplacementsQuantity } from "@/features/replacements/replacementsSlice";
import { updateMaintenance } from "@/features/maintenances/maintenanceSlice";

export const useConfirmMaintenance = () => {
  const dispatch = useDispatch();

  const confirmMaintenance = (
    maintenance: Maintenance,
    replacementQuantityMap: { [replacementId: string]: number },
    user: string,
    executionOutcome: ExecutionOutcome,
    imageNotes: ImageNote[],
    audioNotes: AudioNote[],
    textNotes: TextNote[],
    location?: string,
    executionTime?: number //tempo di esecuzione in minuti, campo non obbligatorio.
  ) => {

    const currentDate = new Date().toISOString();
    const replacementsArray = Object.keys(replacementQuantityMap).map((replacementId) => ({
      replacementId,
      quantity: replacementQuantityMap[replacementId],
    }));

    dispatch(decrementReplacementsQuantity(replacementsArray));

    /* Update History */

    const newHistoryEntry = {
      user: user,
      imageNotes: imageNotes.length > 0 ? imageNotes : undefined,
      audioNotes: audioNotes.length > 0 ? audioNotes : undefined,
      textNotes: textNotes.length > 0 ? textNotes : undefined,
      executionDate: currentDate,
      executionOutcome: executionOutcome,
      executionTime: executionTime || undefined,
      location: location || undefined,
    };

    dispatch(addHistoryEntry({ maintenanceId: maintenance.id, entry: newHistoryEntry }));

    /* Update new Maintenance Expiry Date */

    const newExpiryDate = getNextExpiryDate(maintenance.recurrence);

    dispatch(
      updateMaintenance({
        ...maintenance,
        expiryDate: newExpiryDate,
        lastExecution: currentDate,
      })
    );

    /* Update list last execution date */

    dispatch(updateListLastExecutionDate({ listId: maintenance.listId, newExecutionDate: currentDate }));

  };

  return { confirmMaintenance };
};
