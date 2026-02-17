import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";


export const downloadAndShareFile = async (fileUrl: string, fileName: string) => {
  try {
    // Determina il percorso di salvataggio
    const localPath = `${FileSystem.documentDirectory}${fileName}`;

    if (fileUrl.startsWith("http") || fileUrl.startsWith("https")) {
      const fileInfo = await FileSystem.getInfoAsync(localPath);

      if (fileInfo.exists) {
        // Chiede se si vuole riscaricare
        Alert.alert(
          "File già presente",
          "Il file è già disponibile localmente. Vuoi riscaricarlo?",
          [
            {
              text: "Annulla",
              style: "cancel",
              onPress: () => console.log("Download annullato"),
            },
            {
              text: "Riscarica",
              onPress: async () => {
                await downloadFileFromUrl(fileUrl, localPath);
              },
            },
          ]
        );
      } else {
        // Scarica direttamente se non esiste
        await downloadFileFromUrl(fileUrl, localPath);
      }
    } else {
      // Il file è locale, verifica se esiste
      const fileInfo = await FileSystem.getInfoAsync(fileUrl);

      if (fileInfo.exists) {
        console.log(`File locale trovato: ${fileUrl}`);
        alert(`File già disponibile localmente: ${fileUrl}`);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUrl);
        } else {
          alert("Condivisione non disponibile.");
        }
      } else {
        throw new Error("Il file locale specificato non esiste.");
      }
    }
  } catch (error) {
    console.error("Errore durante il download o la condivisione del file:", error);
    alert("Errore durante il download o la condivisione del file.");
  }
};

// Funzione per scaricare file da un URL
const downloadFileFromUrl = async (fileUrl: string, localPath: string) => {
  try {
    const downloadResumable = FileSystem.createDownloadResumable(fileUrl, localPath);
    const result = await downloadResumable.downloadAsync();

    if (result?.uri) {
      console.log(`File scaricato con successo: ${result.uri}`);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      } else {
        alert("Condivisione non disponibile. File salvato localmente.");
      }
    } else {
      throw new Error("Il download non è riuscito.");
    }
  } catch (error) {
    console.error("Errore durante il download del file:", error);
    alert("Errore durante il download del file.");
  }
};



/* 
export const downloadFile = async (fileUrl: string, fileName: string) => {
  try {
    const localPath = `${FileSystem.documentDirectory}${fileName}`;
    
    // Usa il downloadAsync per il file
    const result = await FileSystem.downloadAsync(fileUrl, localPath);

    if (result.status === 200) {
      console.log('File scaricato con successo: ', result.uri);
      alert('Download completato. File salvato in: ' + result.uri);
    } else {
      alert('Errore nel download del file');
    }
  } catch (error) {
    console.error('Errore durante il download:', error);
    alert('Errore durante il download del file');
  }
};
 */