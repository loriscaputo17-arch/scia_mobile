import React, { useState, useEffect, useRef } from "react";
import { Modal, View, StyleSheet, Alert, Pressable } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

type QRScannerProps = {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
};

const QRScanner: React.FC<QRScannerProps> = ({ visible, onClose, onScanSuccess }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    if (visible && permission?.granted === false) {
      requestPermission();
    }
    
  }, [visible]);

  useEffect(() => {
    if (permission?.granted === false && visible) {
      Alert.alert("Permission Denied", "Camera permission is required to scan QR codes.", [{ text: "OK", onPress: onClose }]);
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
      onScanSuccess(data); 
      onClose();
  };

  return (
    <Modal transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing={"back"} onBarcodeScanned={handleBarCodeScanned}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" color="#fff" size={44} />
            </Pressable>
          </CameraView>
        ) : (
          <View style={styles.permissionDenied}>{/* Alert is no longer used as a JSX component */}</View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    padding: 10,
  },
  permissionDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default QRScanner;
