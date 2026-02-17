import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { selectCurrentUser } from "@/features/auth/authSlice";
import isEqual from "lodash/isEqual";
import { getJobs } from "@/api/maintenance";
import { selectMaintenances, setMaintenances } from "@/features/maintenances/maintenanceSlice";
import { selectTasks, setTasks } from "@/features/tasks/tasksSlice";
import { getTasks } from "@/api/checklist";

export function useTasksSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const tasks = useSelector(selectTasks);
  const userID = useSelector(selectCurrentUser)?.id;
  const ship_id = 1;

  const sync = async () => {
    try {
      if (userID) {
        const data = await getTasks( ship_id, userID);
        if (!isEqual(data, tasks)) {
          dispatch(setTasks(data));
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento dei task:", axiosError);
      setError("Impossibile caricare i dati dei task. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
