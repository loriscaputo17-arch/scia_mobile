import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { selectCurrentUser } from "@/features/auth/authSlice";
import isEqual from "lodash/isEqual";
import {getMaintenaceTypes } from "@/api/maintenance";
import { selectMaintenanceTypes, setMaintenanceTypes } from "@/features/maintenanceTypes/maintenanceTypesSlice";

export function useMaintenanceTypesSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const maintenanceTypes = useSelector(selectMaintenanceTypes);
  const userID = useSelector(selectCurrentUser)?.id;
  const ship_id = 1;

  const sync = async () => {
    try {
      if (userID) {
        const data = await getMaintenaceTypes(ship_id, userID);
        if (!isEqual(data, maintenanceTypes)) {
          dispatch(setMaintenanceTypes(data));
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error("Errore nel caricamento delle liste di manutenzioni:", axiosError);
      setError("Impossibile caricare le liste di manutenzioni. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
