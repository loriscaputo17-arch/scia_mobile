//app/api/cart.ts
import { type CartItem } from "@/data/cartItems";
import api from "./axios";

export type AddProductPayload = {
  spare_id: string;
  user_id: string;
  quantity: number;
  status: string;
};

export const getCart = async (ship_id: string | number, user_id: string | number): Promise<CartItem[]> => {
  const res = await api.get("/cart/getCart", {
    params: {
      ship_id,
      user_id,
    },
  });
  return res.data.cart;
};

export const addProduct = async (payload: AddProductPayload) => {
  const res = await api.post("/cart/addProduct", payload);
  return res.data;
};

export const updateProduct = async (spare_id: string | number, payload: { quantity: number; status: string }) => {
  const res = await api.put(`/cart/updateProduct/${spare_id}`, payload);
  return res.data;
};

export const removeProduct = async (spare_id: string | number) => {
  const res = await api.delete(`/cart/removeProduct/${spare_id}`);
  return res.data;
};
