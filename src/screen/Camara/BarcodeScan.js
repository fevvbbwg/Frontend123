/**import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useCameraDevices, Camera } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';

const BarcodeScan = () => {
    const devices = useCameraDevices();
    const device = devices.back;

    const [hasPermission, setHasPermission] = useState(false);
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS]);

    // 카메라 권한 요청
    useEffect(() => {
        const getPermission = async () => {
            const status = await Camera.requestCameraPermission();
            if (status === 'authorized') {
                setHasPermission(true);
            } else {
                Alert.alert('카메라 권한 필요', '설정에서 카메라 권한을 허용해주세요.');
            }
        };
        getPermission();
    }, []);

    return (
        <View style={styles.container}>
            {device != null && hasPermission ? (
                <>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        frameProcessor={frameProcessor}
                    />
                    {barcodes.map((barcode, idx) => (
                        <Text key={idx} style={styles.text}>
                            📌 바코드 값: {barcode.displayValue}
                        </Text>
                    ))}
                </>
            ) : (
                <Text>카메라를 불러오는 중...</Text>
            )}
        </View>
    );
};

export default BarcodeScan;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: {
        backgroundColor: 'white',
        padding: 10,
        marginTop: 20,
        borderRadius: 5,
    },
});**/
