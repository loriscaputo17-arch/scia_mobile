// hooks/useDevice.ts
import { useWindowDimensions } from "react-native";

export function useDevice() {
  const { width } = useWindowDimensions();
  return {
    isTablet: width >= 768
  };
}