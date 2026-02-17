import { useDispatch } from "react-redux";
import { addHistoryEntry } from "@/features/history/historySlice";
import { updateListExpiryDate, updateListLastExecutionDate } from "@/features/activityLists/activityListsSlice";
import { getNextExpiryDate } from "@/app/utils/utils";
import { AudioNote, ImageNote, TextNote, type ExecutionOutcome } from "@/data/history";
import { type Reading } from "@/data/readings";
import { updateReading } from "@/features/readings/readingsSlice";

type UseConfirmReadingProps = {
  readings: Reading[];
};

export const useConfirmReading = ({ readings }: UseConfirmReadingProps) => {
  const dispatch = useDispatch();

  const confirmReading = (
    reading: Reading,
    user: string,
    executionOutcome: ExecutionOutcome,
    imageNotes: ImageNote[],
    audioNotes: AudioNote[],
    textNotes: TextNote[],
    value: number,
    location?: string,
    executionTime?: number //tempo di esecuzione in minuti, campo non obbligatorio.
  ) => {
    const currentDate = new Date().toISOString();

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

    dispatch(addHistoryEntry({ maintenanceId: reading.id, entry: newHistoryEntry }));

    /*  Update reading */
    dispatch(updateReading({ ...reading, value }));

    /* Update ReadingList */
    //se la lettura confermata e' l'ultima della lista, quindi tutti le letture (gia' filtrate per la lista corrente) hanno value !== undefined

    if (readings.filter((reading) => reading.value === undefined).length === 1 && reading.value === undefined) {
      dispatch(updateListLastExecutionDate({ listId: reading.listId, newExecutionDate: currentDate }));
      dispatch(updateListExpiryDate({ listId: reading.listId, newExpiryDate: getNextExpiryDate(reading.recurrence) }));
    }

    
  };

  return { confirmReading };
};
