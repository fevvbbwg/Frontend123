import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 파일 경로 확인
import LoginScreen from 'src/screen/Login/LoginScreen';
import Signup from 'src/screen/Login/Signup';
import MainScreen from 'src/screen/Main/MainScreen';
import FindID from 'src/screen/Login/FindID';
import FindPW from 'src/screen/Login/FindPW';
import FindPWInfo from 'src/screen/Login/FindPWInfo';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="LoginScreen">
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={Signup} options={{ title: '회원가입' }} />
            <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FindID" component={FindID} options={{ title: '아이디 찾기' }} />
            <Stack.Screen name="FindPW" component={FindPW} options={{ title: '비밀번호 찾기' }} />
            <Stack.Screen name="FindPWInfo" component={FindPWInfo} options={{ title: '비밀번호 확인' }} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
