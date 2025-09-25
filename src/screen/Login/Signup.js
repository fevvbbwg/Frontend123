import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
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
        confirmPassword: ''
    });

    const [birthdate, setBirthdate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [isUserIDAvailable, setIsUserIDAvailable] = useState(true);
    const [isCheckingUserID, setIsCheckingUserID] = useState(false);

    const handleChange = (name, value) => {
        if (name === 'username') {
            // username에 한글, 알파벳, 숫자만 허용
            value = value.replace(/[^가-힣a-zA-Z0-9]/g, '');
            // 필요시 username 길이 제한 추가 가능
            // 예: value = value.slice(0, 20); // 최대 20자
        }

        if (name === 'phone') {
            // 전화번호에서 숫자만 추출
            value = value.replace(/[^0-9]/g, '');

            // 전화번호 포맷팅 (010-XXXX-XXXX) 자동 생성
            if (value.length < 4) {
                value = value; // 앞자리가 010인 경우 자동 처리
            } else if (value.length < 7) {
                value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
            } else {
                value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
        }

        // 상태 업데이트
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
            const res = await fetch(`http://192.168.45.75:8080/api/users/check-userID`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: form.userID }),
            });

            const data = await res.json();

            if (res.ok && data.isAvailable) {
                setIsUserIDAvailable(true);
                Alert.alert('사용 가능한 아이디입니다.');
            } else {
                setIsUserIDAvailable(false);
                Alert.alert('이미 사용 중인 아이디입니다.');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('네트워크 오류', '아이디 중복 체크에 실패했습니다. 다시 시도해 주세요.');
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
            const response = await fetch("http://10.0.2.2:8080/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get("content-type");

            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text || '서버에서 잘못된 응답을 보냈습니다.');
            }

            if (response.ok) {
                if (data.success) {
                    // 회원가입 성공
                    Alert.alert('회원가입 성공!', '', [
                        { text: '확인', onPress: () => navigation.navigate('LoginScreen') },
                    ]);
                } else {
                    // 회원가입 실패
                    Alert.alert('회원가입 실패', data.message || '알 수 없는 오류');
                }
            } else {
                // 응답이 실패일 경우
                throw new Error(data.message || '회원가입 실패');
            }

        } catch (err) {
            console.error('회원가입 처리 중 오류:', err);

            // 네트워크 오류 처리
            if (err.message !== '회원가입 실패') {
                Alert.alert('네트워크 오류', '서버와의 연결에 실패했습니다. 네트워크 상태를 확인해 주세요.');
            } else {
                // 다른 오류 발생 시
                Alert.alert('오류 발생', err.message);
            }
        }
    };



    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>

            <TextInput
                style={styles.input}
                placeholder="아이디"
                value={form.userID}
                onChangeText={(text) => handleChange('userID', text)}
            />
            <TouchableOpacity style={styles.checkButton} onPress={checkUserIDAvailability}>
                <Text style={styles.checkButtonText}>아이디 중복 확인</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="이름"
                value={form.username}
                onChangeText={(text) => handleChange('username', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                secureTextEntry
                value={form.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="이메일"
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="전화번호"
                value={form.phone}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
            />
            <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowPicker(true)}
            >
                <Text style={styles.datePickerText}>
                    생년월일: {birthdate.toISOString().split('T')[0]}
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

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>회원가입</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    datePickerButton: {
        width: '100%',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 12,
        marginBottom: 12,
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginBottom: 20,
    },
    checkButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Signup;
