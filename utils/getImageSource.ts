import { ImageSourcePropType } from "react-native";

export const getImageSource = (imgSrc : ImageSourcePropType | string) => {
    if (typeof imgSrc === 'string') {
      return { uri: imgSrc };
    } else {
      return imgSrc;
    }
  };