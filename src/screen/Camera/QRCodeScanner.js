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
  const { userID } = route.params;

  useEffect(() => {
    setScanned(false);
  }, []);

  const fetchFoodData = async (barcode) => {
    try {
      setLoading(true);
      const cleanBarcode = String(barcode).trim();

      // 1️⃣ Open Food Facts (글로벌)
      let response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
      let data = await response.json();

      // 2️⃣ 글로벌 실패 시 한국 DB 재시도
      if (data.status !== 1 || !data.product) {
        console.log('🌏 OFF 글로벌 실패 → 한국 DB 재시도');
        response = await fetch(`https://kr.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
        data = await response.json();
      }

      // 3️⃣ 한국 DB도 실패 시 UPCitemdb 보조 조회
      if (data.status !== 1 || !data.product) {
        console.log('🔄 OFF 실패 → UPCitemdb 시도');
        try {
          const upcResponse = await fetch(
            `https://api.upcitemdb.com/prod/trial/lookup?upc=${cleanBarcode}`
          );
          const upcData = await upcResponse.json();

          // UPCitemdb 응답 정상 처리
          if (upcData.items && upcData.items.length > 0) {
            const item = upcData.items[0];
            data = {
              status: 1,
              product: {
                product_name: item.title || '알 수 없는 제품',
                brands: item.brand || '정보 없음',
                categories: item.category || '분류 없음',
                image_front_small_url: item.images?.[0] || null,
              },
            };
          }
        } catch (upcError) {
          // ❌ 할당량 초과, 네트워크 오류 등 — 경고 없이 무시
          console.log('⚠️ UPCitemdb 요청 실패 또는 제한 초과 (무시)');
        }
      }

      setLoading(false);

      // ✅ 조회 성공 → 등록 화면 이동
      if (data.status === 1 && data.product) {
        const p = data.product;
        const productData = {
          barcode: cleanBarcode,
          name: p.product_name || '알 수 없는 제품',
          brand: p.brands || '정보 없음',
          category: p.categories || '분류 없음',
          image: p.image_front_small_url || null,
        };
        navigation.navigate('IngredientRegister', { productData, userID });
      } else {
        // ❌ 조회 실패 → 경고 후 직접입력 이동
        Alert.alert(
          '조회 실패',
          '해당 제품 정보를 찾을 수 없습니다.\n직접 입력 화면으로 이동합니다.',
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
      console.log('❌ Fetch Error:', error);
      Alert.alert('오류', '제품 정보를 불러오는 중 문제가 발생했습니다.');
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
