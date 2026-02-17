import { Alert } from 'react-native';

export function showConfirmationAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: "No",
        onPress: onCancel /* || (() => console.log("Azione annullata")) */,
        style: "cancel",
      },
      {
        text: "Ok",
        onPress: onConfirm,
      },
    ],
    { cancelable: false }
  );
}
