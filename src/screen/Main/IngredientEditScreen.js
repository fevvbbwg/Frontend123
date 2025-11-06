import React, { useState } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const IngredientEditScreen = ({ route, navigation }) => {
  const { ingredient, userID, refresh } = route.params;

  const [name, setName] = useState(ingredient.name);
  const [brand, setBrand] = useState(ingredient.brand);
  const [category, setCategory] = useState(ingredient.category);
  const [expirationDate, setExpirationDate] = useState(ingredient.expirationDate);
  const [image, setImage] = useState(ingredient.image);
  const [note, setNote] = useState(ingredient.note || ''); // ✅ note 추가

  const categoryOptions = [
    { label: '채소', value: '채소' },
    { label: '과일', value: '과일' },
    { label: '유제품', value: '유제품' },
    { label: '육류', value: '육류' },
    { label: '수산물', value: '수산물' },
    { label: '곡류', value: '곡류' },
    { label: '냉동식품', value: '냉동식품' },
    { label: '음료', value: '음료' },
    { label: '조미료', value: '조미료' },
    { label: '기타', value: '기타' },
  ];

  const formatDateInput = (text) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length === 8) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
    return text;
  };

  const handleUpdate = async () => {
    if (!name || !category) {
      Alert.alert('입력 오류', '제품명과 카테고리를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.68.58:8080/api/ingredient/update/${ingredient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ingredient.id,
          barcode: ingredient.barcode,
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
        Alert.alert('수정 완료', '식자재 정보가 성공적으로 업데이트되었습니다.', [
          { text: '확인', onPress: () => { if(refresh) refresh(); navigation.goBack(); } },
        ]);
      } else {
        const text = await response.text();
        console.log('수정 실패:', text);
        Alert.alert('수정 실패', `식자재 정보 수정에 실패했습니다.\n서버 메시지: ${text}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('서버 오류', '서버와 통신 중 문제가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Text style={styles.label}>제품명</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="제품명을 입력하세요" />

      <Text style={styles.label}>브랜드</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="브랜드명을 입력하세요" />

      <Text style={styles.label}>카테고리</Text>
      <View style={styles.pickerWrapper}>
        <RNPickerSelect
          onValueChange={setCategory}
          items={categoryOptions}
          value={category}
          placeholder={{ label: '카테고리를 선택하세요', value: null }}
          style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput }}
        />
      </View>

      <Text style={styles.label}>유통기한</Text>
      <TextInput style={styles.input} value={expirationDate} onChangeText={(text) => setExpirationDate(formatDateInput(text))} placeholder="YYYY-MM-DD 형식으로 입력" />

      <Text style={styles.label}>메모</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={note} onChangeText={setNote} placeholder="메모를 입력하세요" multiline />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>수정 완료</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f9f9f9' },
  image: { width: 150, height: 150, borderRadius: 10, marginBottom: 20, alignSelf: 'center' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: 'white', color: '#000' },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: 'white', marginBottom: 15 },
  pickerInput: { fontSize: 16, padding: 10, color: '#000' },
  button: { backgroundColor: '#007bff', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default IngredientEditScreen;
