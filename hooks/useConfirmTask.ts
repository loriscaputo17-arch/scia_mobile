import { useDispatch } from "react-redux";
import { addHistoryEntry } from "@/features/history/historySlice";
import { updateTask } from "@/features/tasks/tasksSlice";
import { updateListExpiryDate, updateListLastExecutionDate } from "@/features/activityLists/activityListsSlice";
import { getNextExpiryDate } from "@/app/utils/utils";
import { type Task } from "@/data/tasks";
import { AudioNote, ImageNote, TextNote, type ExecutionOutcome } from "@/data/history";

type UseConfirmTaskProps = {
    tasks: Task[];
}

export const useConfirmTask = ({tasks}: UseConfirmTaskProps) => {
  const dispatch = useDispatch();

  const confirmTask = (
    task: Task,
    user: string,
    executionOutcome: ExecutionOutcome,
    imageNotes: ImageNote[],
    audioNotes: AudioNote[],
    textNotes: TextNote[],
    location?: string,
    executionTime?: number, //tempo di esecuzione in minuti, campo non obbligatorio.
  ) => {

    const currentDate = new Date().toISOString();

    /* Update History */
    // if (task.check === "nonEseguito") {
      const newHistoryEntry = {
        user: user,
        imageNotes: imageNotes.length > 0 ? imageNotes : undefined,
        audioNotes: audioNotes.length > 0 ? audioNotes : undefined,
        textNotes: textNotes.length > 0 ? textNotes : undefined,
        executionDate: currentDate,
        executionOutcome: executionOutcome,
        executionTime: executionTime || undefined,
        location: location || undefined ,
      };

      dispatch(addHistoryEntry({ maintenanceId: task.id, entry: newHistoryEntry }));
    // }

    // Update task
    dispatch(
        
      updateTask({
        ...(task as Task),
        check: task.check === executionOutcome ? "nonEseguito" : executionOutcome,
      })
    );

    /* Update Checklist */

    //se il task checkato e' l'ultimo della lista, quindi tutti i task (gia' filtrati per la checklist corrente) hanno check !== 'nonEseguito'

    if (
      tasks.filter((task) => task.check === "nonEseguito").length === 1 &&
      task.check === "nonEseguito"
    ) {
      dispatch(updateListLastExecutionDate({ listId: task.listId, newExecutionDate: currentDate }));
      dispatch(updateListExpiryDate({ listId: task.listId, newExpiryDate: getNextExpiryDate(task.recurrence) }));
    }

  };

  return { confirmTask };
};
