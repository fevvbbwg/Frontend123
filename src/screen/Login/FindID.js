import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const FindID = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');

    // 전화번호 하이픈 자동 처리
    const formatPhone = (text) => {
        const numbersOnly = text.replace(/\D/g, '');
        if (numbersOnly.length <= 3) return numbersOnly;
        if (numbersOnly.length <= 7) return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
        return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`;
    };

    // 아이디 찾기 핸들러
    const handleFindID = async () => {
        if (!username || !phone) {
            Alert.alert('입력 오류', '이름과 전화번호를 모두 입력하세요.');
            return;
        }

        try {
            const response = await fetch('http://192.168.68.56:8080/api/users/find-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, phone }),
            });

            if (response.ok) {
                const data = await response.text();
                Alert.alert('아이디 찾기 결과', `당신의 아이디는: ${data}`, [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('LoginScreen'), // 로그인 화면으로 이동
                    },
                ]);
            } else {
                const errorData = await response.text();
                Alert.alert('아이디 찾기 실패', errorData);
            }
        } catch (error) {
            console.error('아이디 찾기 에러:', error);
            Alert.alert('네트워크 오류', '서버와의 연결에 문제가 발생했습니다.');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ marginBottom: 5 }}>이름</Text>
            <TextInput
                placeholder="이름 입력"
                value={username}
                onChangeText={setUsername}
                style={{
                    borderBottomWidth: 1,
                    marginBottom: 20,
                    paddingVertical: 8,
                }}
            />

            <Text style={{ marginBottom: 5 }}>전화번호</Text>
            <TextInput
                placeholder="010-1234-5678"
                keyboardType="numeric"
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                style={{
                    borderBottomWidth: 1,
                    marginBottom: 20,
                    paddingVertical: 8,
                }}
                maxLength={13}
            />

            <TouchableOpacity
                onPress={handleFindID}
                style={{
                    backgroundColor: '#4CAF50',
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 10,
                }}
            >
                <Text style={{ color: 'white', textAlign: 'center' }}>아이디 찾기</Text>
            </TouchableOpacity>
        </View>
    );
};

export default FindID;
