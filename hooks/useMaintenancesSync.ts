import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { selectCurrentUser } from "@/features/auth/authSlice";
import isEqual from "lodash/isEqual";
import { getJobs } from "@/api/maintenance";
import { selectMaintenances, setMaintenances } from "@/features/maintenances/maintenanceSlice";

export function useMaintenancesSync(type_id: string | undefined, autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const maintenances = useSelector(selectMaintenances);
  const userID = useSelector(selectCurrentUser)?.id;
  const ship_id = 1;

  const sync = async () => {
    try {
      if (userID) {
        const data = await getJobs(type_id, ship_id, userID);
        if (!isEqual(data, maintenances)) {
          dispatch(setMaintenances(data));
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento delle manutenzioni:", axiosError);
      setError("Impossibile caricare i dati delle manutenzioni. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad, type_id, userID]);

  return { loading, error, refresh: sync };
}
