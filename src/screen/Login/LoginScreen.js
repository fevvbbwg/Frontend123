import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const LoginScreen = ({ navigation }) => {
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!userID || !password) {
      Alert.alert('입력 오류', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://192.168.68.58:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('로그인 성공:', data);

        // ✅ 로그인 성공 시 userID 저장
        await AsyncStorage.setItem('userID', userID);

        navigation.replace('MainScreen'); // 뒤로가기 못 하게 replace
      } else {
        const errorData = await response.text();
        console.log('로그인 실패 응답:', errorData);
        Alert.alert('로그인 실패', '아이디나 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      Alert.alert('네트워크 오류', '서버와의 연결에 문제가 발생했습니다.');
    }
  };


  return (
        <View style={styles.container}>
            <Text style={styles.title}>Recipe Recommend</Text>

            <TextInput
                placeholder="아이디"
                value={userID}
                onChangeText={setUserID}
                style={styles.input}
            />

          <TextInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { color: 'black' }]} // ✅ 글자색 명시
          />


          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('FindID')}>
                    <Text style={styles.link}>아이디 찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('FindPW')}>
                    <Text style={styles.link}>비밀번호 찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.link}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#0099FF',
        marginBottom: 50,
        fontFamily: 'sans-serif-medium',
    },
    input: {
        height: 50,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#ccc',
        paddingVertical: 15,
        borderRadius: 30,
        marginBottom: 20,
    },
    loginButtonText: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    link: {
        fontSize: 14,
        color: '#000',
    },
});

export default LoginScreen;
