import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, StyleSheet,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const IngredientRegister = ({ route, navigation }) => {
  const { productData, userID } = route.params;

  const [name, setName] = useState(productData?.name || '');
  const [brand, setBrand] = useState(productData?.brand || '');
  const [category, setCategory] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [image, setImage] = useState(productData?.image || null);
  const [note, setNote] = useState(productData?.note || ''); // ✅ note 추가

  const categories = [
    '채소','과일','유제품','육류','수산물','곡류','냉동식품','음료','조미료','기타',
  ];

  const suggestCategory = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('우유') || lower.includes('치즈') || lower.includes('요거트')) return '유제품';
    if (lower.includes('소고기') || lower.includes('돼지고기') || lower.includes('닭')) return '육류';
    if (lower.includes('생선') || lower.includes('오징어') || lower.includes('새우')) return '수산물';
    if (lower.includes('사과') || lower.includes('바나나') || lower.includes('딸기')) return '과일';
    if (lower.includes('양파') || lower.includes('상추') || lower.includes('배추') || lower.includes('당근')) return '채소';
    if (lower.includes('쌀') || lower.includes('보리') || lower.includes('밀')) return '곡류';
    if (lower.includes('김치') || lower.includes('냉동')) return '냉동식품';
    if (lower.includes('콜라') || lower.includes('주스') || lower.includes('물')) return '음료';
    if (lower.includes('소금') || lower.includes('간장') || lower.includes('설탕') || lower.includes('고추장')) return '조미료';
    return '기타';
  };

  const formatDateInput = (text) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length === 8) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
    return text;
  };

  useEffect(() => {
    const combinedText = `${productData?.name || ''} ${productData?.category || ''}`;
    setCategory(suggestCategory(combinedText));
  }, [productData]);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '제품 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://192.168.68.53:8080/api/ingredient/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: productData.barcode,
          name,
          brand,
          category,
          expirationDate,
          image,
          userID,
          note, // ✅ note 포함
        }),
      });

      if (response.ok) {
        Alert.alert('등록 완료', `${name} 이(가) 냉장고에 추가되었습니다!`, [
          { text: '확인', onPress: () => navigation.navigate('FridgeScreen', { userID }) },
        ]);
      } else {
        Alert.alert('오류', '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('서버 오류', '서버와 통신 중 문제가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>식재료 등록</Text>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Text style={styles.label}>제품명</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={(text) => { setName(text); setCategory(suggestCategory(text)); }}
        placeholder="제품명을 입력하세요"
      />

      <Text style={styles.label}>브랜드</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="브랜드를 입력하세요" />

      <Text style={styles.label}>카테고리 (자동 추천됨, 수정 가능)</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={{ color: 'black' }}
          dropdownIconColor="black"
        >
          {categories.map((cat) => <Picker.Item key={cat} label={cat} value={cat} />)}
        </Picker>
      </View>

      <Text style={styles.label}>유통기한</Text>
      <TextInput
        style={styles.input}
        value={expirationDate}
        onChangeText={(text) => setExpirationDate(formatDateInput(text))}
        placeholder="YYYY-MM-DD 형식으로 입력"
      />

      <Text style={styles.label}>메모</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={note}
        onChangeText={setNote}
        placeholder="메모를 입력하세요"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>등록하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#555' }]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>뒤로가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  image: { width: 150, height: 150, borderRadius: 10, marginBottom: 20 },
  label: { alignSelf: 'flex-start', fontSize: 16, marginBottom: 5 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: 'white' },
  pickerWrapper: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, backgroundColor: 'white' },
  button: { backgroundColor: '#007bff', padding: 12, borderRadius: 10, marginTop: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default IngredientRegister;
