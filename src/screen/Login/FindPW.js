import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const FindPW = ({ navigation }) => {
    const [userID, setUserID] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const handleVerifyUser = async () => {
        if (!userID || !username || !email) {
            Alert.alert('입력 오류', '모든 정보를 입력해주세요.');
            return;
        }

        try {
            // 실제 IP 주소 확인 필요
            const response = await axios.post('http://192.168.68.51:8080/api/users/verify-user', {
                userID,
                username,
                email,
            });

            console.log('Server response:', response.data);  // 서버 응답 확인용

            // 서버 응답 형식에 따라 수정 필요
            if (response.data.success) {
                // 서버가 { success: true }로 응답하는 경우
                navigation.navigate('FindPWInfo', { userID });
            } else {
                Alert.alert('인증 실패', '일치하는 회원 정보가 없습니다.');
            }
        } catch (error) {
            console.error('Error during API call:', error);
            Alert.alert('에러', '서버 통신 중 문제가 발생했습니다. 인터넷 연결을 확인해주세요.');
        }
    };


    return (
        <View style={{ padding: 20 }}>
            <Text style={{ marginBottom: 5 }}>아이디</Text>
            <TextInput
                placeholder="아이디 입력"
                value={userID}
                onChangeText={setUserID}
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
            />

            <Text style={{ marginBottom: 5 }}>이름</Text>
            <TextInput
                placeholder="이름 입력"
                value={username}
                onChangeText={setUsername}
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
            />

            <Text style={{ marginBottom: 5 }}>이메일</Text>
            <TextInput
                placeholder="이메일 입력"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={{ borderBottomWidth: 1, marginBottom: 20 }}
            />

            <TouchableOpacity
                onPress={handleVerifyUser}
                style={{ backgroundColor: '#4CAF50', padding: 12, borderRadius: 8 }}
            >
                <Text style={{ color: 'white', textAlign: 'center' }}>비밀번호 찾기</Text>
            </TouchableOpacity>
        </View>
    );
};

export default FindPW;
