// hooks/useRanksSync.ts
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectRanks, setRanks } from "@/features/ranks/ranksSlice";
import { getRanks } from "@/api/profile";
import { isEqual } from "lodash";
import { AxiosError } from "axios";

export function useRanksSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const ranks = useSelector(selectRanks);

  const sync = async () => {
    try {
      const res = await getRanks();
      if (!isEqual(res, ranks)) {
        dispatch(setRanks(res.data));
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento dei gradi:", axiosError);
      setError("Impossibile caricare i gradi. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
