// hooks/useShipFilesSync.ts
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { AxiosError } from "axios";
import { getFiles } from "@/api/shipFiles";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { selectFiles, setFiles } from "@/features/shipFiles/shipFilesSlice";

export function useShipFilesSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const files = useSelector(selectFiles);
  const userID = useSelector(selectCurrentUser)?.id;
  const ship_id = 1;

  const sync = async () => {
    try {
      if (userID) {
        const res = await getFiles(ship_id, userID);
        if (!isEqual(res, files)) {
          dispatch(setFiles(res));
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento dei manuali:", axiosError);
      setError("Impossibile caricare i manuali. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
