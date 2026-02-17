import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import isEqual from "lodash/isEqual";
import { selectFailures, setFailures } from "@/features/failures/failuresSlice";
import { getFailures } from "@/api/failures";

export function useFailuresSync(autoLoad = true) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const failures = useSelector(selectFailures);

  const sync = async () => {
    try {
      const data = await getFailures();
      if (!isEqual(data, failures)) {
        dispatch(setFailures(data));
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento delle avarie:", axiosError);
      setError("Impossibile caricare i dati delle avarie. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
