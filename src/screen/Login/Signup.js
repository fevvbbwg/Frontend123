import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const Signup = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    userID: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    birthdate: '',
    confirmPassword: '',
  });

  const [birthdate, setBirthdate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isUserIDAvailable, setIsUserIDAvailable] = useState(true);
  const [isCheckingUserID, setIsCheckingUserID] = useState(false);

  const handleChange = (name, value) => {
    if (name === 'username') {
      value = value.replace(/[^가-힣a-zA-Z0-9]/g, '');
    }
    if (name === 'phone') {
      value = value.replace(/[^0-9]/g, '');
      if (value.length < 4) {
        value = value;
      } else if (value.length < 7) {
        value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
      } else {
        value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      }
    }
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setBirthdate(selectedDate);
  };

  const checkUserIDAvailability = async () => {
    if (isCheckingUserID) return;
    setIsCheckingUserID(true);
    try {
      const res = await fetch(`http://192.168.68.56:8080/api/users/check-userID`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: form.userID }),
      });

      const data = await res.json();

      if (res.ok && data.isAvailable) {
        setIsUserIDAvailable(true);
        Alert.alert('✅ 사용 가능한 아이디입니다.');
      } else {
        setIsUserIDAvailable(false);
        Alert.alert('❌ 이미 사용 중인 아이디입니다.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('⚠️ 네트워크 오류', '아이디 중복 체크에 실패했습니다.');
    } finally {
      setIsCheckingUserID(false);
    }
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('유효하지 않은 이메일 주소입니다.');
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(form.phone.replace(/[^0-9]/g, ''))) {
      Alert.alert('유효하지 않은 전화번호입니다.');
      return;
    }

    if (!isUserIDAvailable) {
      Alert.alert('아이디 중복을 먼저 확인해주세요.');
      return;
    }

    const payload = {
      username: form.username,
      userID: form.userID,
      email: form.email,
      password: form.password,
      phone: form.phone,
      birthdate: birthdate.toISOString().split('T')[0],
    };

    try {
      const response = await fetch('http://192.168.68.56:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('🎉 회원가입 성공!', '', [
          { text: '확인', onPress: () => navigation.navigate('LoginScreen') },
        ]);
      } else {
        Alert.alert('회원가입 실패', data.message || '알 수 없는 오류');
      }
    } catch (err) {
      console.error('회원가입 처리 중 오류:', err);
      Alert.alert('⚠️ 네트워크 오류', '서버 연결 실패. 네트워크를 확인해주세요.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      {/* 아이디 */}
      <TextInput
        style={styles.input}
        placeholder="아이디를 입력하세요"
        placeholderTextColor="#999"
        value={form.userID}
        onChangeText={(text) => handleChange('userID', text)}
      />
      <TouchableOpacity style={styles.checkButton} onPress={checkUserIDAvailability}>
        <Text style={styles.checkButtonText}>아이디 중복 확인</Text>
      </TouchableOpacity>

      {/* 이름 */}
      <TextInput
        style={styles.input}
        placeholder="이름을 입력하세요"
        placeholderTextColor="#999"
        value={form.username}
        onChangeText={(text) => handleChange('username', text)}
      />

      {/* 비밀번호 */}
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력하세요"
        placeholderTextColor="#999"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 다시 입력하세요"
        placeholderTextColor="#999"
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(text) => handleChange('confirmPassword', text)}
      />

      {/* 이메일 */}
      <TextInput
        style={styles.input}
        placeholder="이메일을 입력하세요"
        placeholderTextColor="#999"
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
      />

      {/* 전화번호 */}
      <TextInput
        style={styles.input}
        placeholder="전화번호를 입력하세요 (010-XXXX-XXXX)"
        placeholderTextColor="#999"
        value={form.phone}
        onChangeText={(text) => handleChange('phone', text)}
        keyboardType="phone-pad"
      />

      {/* 생년월일 */}
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.datePickerText}>
          📅 생년월일: {birthdate.toISOString().split('T')[0]}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={birthdate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* 회원가입 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#c8e6c9',
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 16,
  },
  datePickerButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#c8e6c9',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#43a047',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkButton: {
    backgroundColor: '#66bb6a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Signup;
