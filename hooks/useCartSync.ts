import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "@/api/cart";
import { AxiosError } from "axios";
import { selectCurrentUser } from "@/features/auth/authSlice";
import isEqual from "lodash/isEqual";
import { selectCartItems, setCartItems } from "@/features/cartItems/cartItemsSlice";

export function useCartSync(autoLoad = true) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const cartItems = useSelector(selectCartItems);
  const userID = useSelector(selectCurrentUser)?.id
   const ship_id = 1;

  const sync = async () => {
    try {
      if (userID) {
        const data = await getCart(ship_id, userID);
          if (!isEqual(data, cartItems)) {
            dispatch(setCartItems(data));
          }
      }
    } catch (err) {
       const axiosError = err as AxiosError;
      console.error("Errore nel caricamento del carrello:", axiosError);
      setError("Impossibile caricare i dati del carrello. Riprova più tardi.");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) sync();
  }, [autoLoad]);

  return { loading, error, refresh: sync };
}
