import { View, Text, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getImageSource } from "./getImageSource";
import QuantitySelector from "@/components/atoms/QuantitySelector";
import Button from "@/components/atoms/Button";
import { type CartItem } from "@/data/cartItems";
import RemoteIcon from "@/components/atoms/RemoteIcon";

export function generateDataForCart(
  cartItems: CartItem[],
  onUpdateItemQuantity: (id: string, quantity: number) => void,
  onRemoveFromCart: (id: string) => void
): { content: React.ReactNode; styleWind?: string }[][] {
  return cartItems.map((cartItem) => {
    return [
      {
        content: (
          <View className="flex-row items-center">
             <RemoteIcon uri={cartItem.Spare.image as string || undefined} styleWind="w-14 h-14 rounded-md"/>
            {/* <Image source={getImageSource(cartItem.img)} className="w-14 h-14 rounded-md" /> */}
            <Text className="text-white font-bold ml-space xxl:ml-space-xxl">{cartItem.Spare.Part_name}</Text>
          </View>
        ),
        styleWind: `flex-[3]`,
      },
      {
        content: (
          <View className="flex-row items-center">
            <Text className="text-white font-bold">{cartItem.Spare.Serial_number}</Text>
          </View>
        ),
      },
      {
        content: (
          <View className="flex-row items-center">
            <Text className="text-white font-bold">{cartItem.Spare.supplier }</Text>
          </View>
        ),
      },
      {
        content: <QuantitySelector min={1} value={cartItem.quantity} onChange={(newValue) => onUpdateItemQuantity(cartItem.spare_id.toString(), newValue)} />,
      },
      {
        content: (
          <View className="flex-row items-center justify-center">
            <Button theme="noBackground" IconComponent={MaterialCommunityIcons} iconProps={{ name: "trash-can", size: 24, color: "white" }} onPress={()=>onRemoveFromCart(cartItem.spare_id.toString())}/>
          </View>
        ),
        styleWind: "flex-[0.5]",
      },
    ];
  });
}
