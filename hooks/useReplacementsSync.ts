import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { selectCurrentUser } from "@/features/auth/authSlice";
import isEqual from "lodash/isEqual";
import { getSpares } from "@/api/spare";
import { selectReplacements ,  setReplacements } from "@/features/replacements/replacementsSlice";

export function useReplacementsSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const ship_id = 1;

  const replacements = useSelector(selectReplacements);

  const sync = async () => {
    try {
        const data = await getSpares(ship_id);
          if (!isEqual(data, replacements)) {
            dispatch(setReplacements(data));
          }
    } catch (err) {
       const axiosError = err as AxiosError;
      console.error("Errore nel caricamento delle ubicazioni:", axiosError);
      setError("Impossibile caricare i dati delle ubicazioni. Riprova più tardi.");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
