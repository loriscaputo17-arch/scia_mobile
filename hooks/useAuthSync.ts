// hooks/useAuthSync.ts
import { useEffect, useState } from "react";
import { getProfile } from "@/api/profile";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, setUser } from "@/features/auth/authSlice";
import { isEqual } from "lodash";
import { AxiosError } from "axios";

export function useAuthSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const user = useSelector(selectCurrentUser);

  const sync = async () => {
    try {
      const res = await getProfile();
      if (!isEqual(res.data, user)) {
        dispatch(setUser(res.data));
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento del profilo:", axiosError);
      setError("Impossibile caricare i dati del profilo. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      sync();
    } else {
      setLoading(false);
    }
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
