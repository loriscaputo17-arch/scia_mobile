import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type CartItem } from "@/data/cartItems";

/* Dati dal backend inconsistenti (in valore e naming), necessario rimapparli a mano in stringhe. */


export type AddProductPayload = {
  spare_id: string | number;
  user_id: string | number;
  quantity: number;
  status: string;
};

const cartItemsSlice = createSlice({
  name: "cart",
  initialState: [] as CartItem[],
  reducers: {
    /* 
    // Aggiunge un prodotto al carrello o incrementa la quantità se già presente
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const index = state.findIndex((item) => item.spare_id === action.payload.spare_id);
      if (index !== -1) {
        // Se già presente, aggiorna la quantità e lo status
        state[index].quantity = action.payload.quantity;
        state[index].status = action.payload.status;
      } else {
        // Altrimenti aggiungi nuovo item
        state.push(action.payload);
      }
    },

    // aggiorna la quantita' del prodotto nel carrello

    updateQuantity: (state, action: PayloadAction<{ spare_id: string; quantity: number }>) => {
      const item = state.find((item) => item.spare_id === action.payload.spare_id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    // Elimina un prodotto dal carrello
    removeFromCart: (state, action: PayloadAction<{ spare_id: string }>) => {
      return state.filter((item) => item.spare_id.toString() !== action.payload.spare_id);
    },
 */

    // setCartItems: (_state, action: PayloadAction<CartItem[]>) => {
    //   return action.payload;
    // },

    // Setta tutte gli item del carrello (es: da API) convertendo potenziali number in stringa
    setCartItems: (_state, action: PayloadAction<CartItem[]>) => {
      return action.payload.map((item) => ({
        ...item,
        id: String(item.id),
        spare_id: String(item.spare_id),
        user_id: String(item.user_id),
      }));
    },
  },
});

export const { /* addToCart, updateQuantity, removeFromCart, */ setCartItems } = cartItemsSlice.actions;
export default cartItemsSlice.reducer;

// Selectors
export const selectCartItems = (state: { cartItems: CartItem[] }) => state.cartItems;

// Selector per ottenere la quantità di uno specifico spare_id
export const selectCartQuantityBySpareId =
  (spare_id: number | string) =>
  (state: { cartItems: CartItem[] }): number | undefined => {
    const item = state.cartItems.find((item) => item.spare_id === spare_id);
    return item?.quantity;
  };
