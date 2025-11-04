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
import Mypage from './src/screen/Mypage/Mypage'
import QRCodeScanner from './src/screen/Camera/QRCodeScanner';
import SearchResults from './src/screen/Main/SearchResults';
import IngredientRegister from './src/screen/Camera/IngredientRegister';
import MoreRecipesScreen from './src/screen/Main/MoreRecipesScreen';
import FridgeScreen from './src/screen/Main/FridgeScreen';
import IngredientEditScreen from './src/screen/Main/IngredientEditScreen';
import RecipeScreen from './src/screen/Recipe/RecipeScreen';

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
        <Stack.Screen
          name="Mypage"  // <- 새 화면 이름
          component={Mypage}
          options={{ title: '마이페이지' }}
        />
        <Stack.Screen
          name="QRCodeScanner"
          component={QRCodeScanner}
          options={{ title: '바코드 스캔' }}
        />
        <Stack.Screen
                 name="SearchResults"
                 component={SearchResults}
                 options={{ title: '검색 결과' }}
               />
        <Stack.Screen
          name="IngredientRegister"
          component={IngredientRegister}
          options={{ title: '바코드 스캔 이동' }}
        />
        <Stack.Screen
          name="MoreRecipesScreen"
          component={MoreRecipesScreen}
          options={{ title: '레시피 더보기' }}
        />
        <Stack.Screen
          name="FridgeScreen"
          component={FridgeScreen}
          options={{ title: '냉장고' }}
        />
        <Stack.Screen
        name="IngredientEditScreen"
        component={IngredientEditScreen}
        options={{ title: '식재료 정보 수정' }}
      />
        <Stack.Screen
          name="RecipeScreen"
          component={RecipeScreen}
          options={{ title: '레시피' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
