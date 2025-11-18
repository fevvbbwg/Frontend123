import React, { useState } from 'react';
import { TextInput, Button, Text, View, StyleSheet, Alert } from 'react-native';

const PasswordChange = ({ navigation, route }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const userID = route.params?.userID;

    console.log('Received userID:', userID);

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            setMessage('새 비밀번호와 비밀번호 확인을 입력해주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch('http://192.168.68.51:8080/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userID,
                    newPassword: newPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage('비밀번호가 성공적으로 변경되었습니다.');
                Alert.alert(
                    '변경 완료',
                    '비밀번호가 성공적으로 변경되었습니다.',
                    [
                        {
                            text: '확인',
                            onPress: () => navigation.navigate('LoginScreen'),
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                setMessage(result.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('API 오류:', error);
            setMessage('서버 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>새 비밀번호 입력</Text>

            <TextInput
                style={styles.input}
                placeholder="새 비밀번호"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <Button title="비밀번호 변경" onPress={handleChangePassword} />

            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
    },
    message: {
        marginTop: 15,
        textAlign: 'center',
        color: 'red',
    },
});

export default PasswordChange;
