// @ts-ignore

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
enableScreens();
// 각 화면 컴포넌트 임포트
import RecipeDetailScreen from './src/screen/Recipe/RecipeDetailScreen';
import LoginScreen from './src/screen/Login/LoginScreen';
import Signup from './src/screen/Login/Signup';
import MainScreen from './src/screen/Main/MainScreen';
import FindID from './src/screen/Login/FindID';
import FindPW from './src/screen/Login/FindPW';
import FindPWInfo from './src/screen/Login/FindPWInfo';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
                <Stack.Screen
                    name="LoginScreen"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="RecipeDetail"
                    component={RecipeDetailScreen}
                    options={{ title: '레시피 상세' }}
                />

                <Stack.Screen
                    name="Signup"
                    component={Signup}
                    options={{ title: '회원가입' }}
                />
                <Stack.Screen
                    name="MainScreen"
                    component={MainScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="FindID"
                    component={FindID}
                    options={{ title: '아이디 찾기' }}
                />
                <Stack.Screen
                    name="FindPW"
                    component={FindPW}
                    options={{ title: '비밀번호 찾기' }}
                />
                <Stack.Screen
                    name="FindPWInfo"
                    component={FindPWInfo}
                    options={{ title: '비밀번호 확인' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
