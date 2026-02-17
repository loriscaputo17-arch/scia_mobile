import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectReadings, setReadings } from "@/features/readings/readingsSlice";
import { getReadings } from "@/api/readings";
import { AxiosError } from "axios";
import { selectCurrentUser } from "@/features/auth/authSlice";
import isEqual from "lodash/isEqual";

export function useReadingsSync(autoLoad = true) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const readings = useSelector(selectReadings);
  const userID = useSelector(selectCurrentUser)?.id;
  const ship_id = 1;

  const sync = async () => {
    try {
      if (userID) {
        const data = await getReadings(ship_id, userID);
        if (!isEqual(data, readings)) {
          dispatch(setReadings(data));
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento delle letture:", axiosError);
      setError("Impossibile caricare i dati delle letture. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
