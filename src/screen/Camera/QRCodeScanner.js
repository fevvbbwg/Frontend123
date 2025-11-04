import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Vibration,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useNavigation, useRoute } from '@react-navigation/native';

const QRCodeScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { userID } = route.params; // ✅ userID 받기

  useEffect(() => {
    setScanned(false);
  }, []);

  const fetchFoodData = async (barcode) => {
    try {
      setLoading(true);
      const cleanBarcode = String(barcode).trim();

      // 1️⃣ 우선 글로벌 DB 조회
      let response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
      let data = await response.json();

      // 2️⃣ 만약 조회 실패면 한국 DB로 재시도
      if (data.status !== 1 || !data.product) {
        console.log('🌏 글로벌 DB 조회 실패 → 한국 DB 재시도');
        response = await fetch(`https://kr.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
        data = await response.json();
      }

      setLoading(false);

      // 3️⃣ 두 번째 시도까지 실패 시 직접 입력 화면 이동
      if (data.status === 1 && data.product) {
        const product = data.product;
        const productData = {
          barcode: cleanBarcode,
          name: product.product_name || '알 수 없는 제품',
          brand: product.brands || '정보 없음',
          category: product.categories || '분류 없음',
          image: product.image_front_small_url || null,
        };
        navigation.navigate('IngredientRegister', { productData, userID });
      } else {
        Alert.alert(
          '조회 실패',
          '해당 바코드의 식품 정보를 찾을 수 없습니다.\n직접 입력 화면으로 이동합니다.',
          [
            {
              text: '확인',
              onPress: () =>
                navigation.navigate('IngredientRegister', {
                  productData: { barcode: cleanBarcode, name: '', brand: '', category: '', image: null },
                  userID,
                }),
            },
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Fetch Error:', error);
      Alert.alert('오류', '제품 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };


  const onBarCodeRead = (event) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(200);

    const codeValue = event.nativeEvent.codeStringValue;
    fetchFoodData(codeValue);
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={ref}
        style={styles.scanner}
        cameraType={CameraType.Back}
        scanBarcode={true}
        onReadCode={onBarCodeRead}
        showFrame={true}
        laserColor="red"
        frameColor="blue"
      />

      <View style={styles.overlay}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.text}>식품 정보를 불러오는 중...</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>QR 또는 바코드를 스캔하세요</Text>

            <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
              <Text style={styles.buttonText}>다시 스캔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { marginTop: 10, backgroundColor: '#555' }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>뒤로가기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanner: { flex: 1 },
  overlay: { position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' },
  text: { fontSize: 18, color: 'white', marginTop: 10, fontWeight: 'bold' },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default QRCodeScanner;
