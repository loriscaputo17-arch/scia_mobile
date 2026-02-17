import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectLocations, setLocations } from "@/features/locations/locationsSlice";
import { getLocations } from "@/api/locations";
import { AxiosError } from "axios";
import { selectCurrentUser } from "@/features/auth/authSlice";
import isEqual from "lodash/isEqual";

export function useLocationsSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const locations = useSelector(selectLocations);
  const userID = useSelector(selectCurrentUser)?.id;
  const ship_id = 1;

  const sync = async () => {
    try {
      if (userID) {
        const data = await getLocations(ship_id, userID);
        if (!isEqual(data, locations)) {
          dispatch(setLocations(data));
        }
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
