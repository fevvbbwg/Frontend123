import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 40) / 2 - 10;

const TABS = [
  { label: '냉장고', icon: 'snow-outline', screen: 'FridgeScreen' },
  { label: '스캔 등록', icon: 'camera-outline', screen: 'QRCodeScanner' },
  { label: '레시피', icon: 'book-outline', screen: 'RecipeScreen' },
  { label: 'MY', icon: 'person-circle-outline', screen: 'Mypage' },
];

const MainScreen = () => {
  const navigation = useNavigation();

  const [recipes, setRecipes] = useState({ today: [], popular: [] });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUserID, setCurrentUserID] = useState(null);

  useEffect(() => {
    const loadUserID = async () => {
      const storedID = await AsyncStorage.getItem('userID');
      setCurrentUserID(storedID);
    };
    loadUserID();

    fetchTodayRecipes();
    fetchPopularRecipes();
  }, []);

  // 오늘의 레시피 불러오기
  const fetchTodayRecipes = async () => {
    try {
      const response = await fetch('http://192.168.68.51:8080/api/recipes/today');
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      setRecipes(prev => ({ ...prev, today: Array.isArray(data) ? data : [] }));
    } catch (error) {
      console.error('오늘의 레시피 가져오기 실패:', error.message);
      Alert.alert('네트워크 오류', '오늘의 레시피를 가져오는 데 실패했습니다.');
    }
  };

  // 추천 레시피 불러오기
  const fetchPopularRecipes = async () => {
    try {
      const response = await fetch('http://192.168.68.51:8080/api/recipes/popular');
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      setRecipes(prev => ({ ...prev, popular: Array.isArray(data) ? data : [] }));
    } catch (error) {
      console.error('추천 레시피 가져오기 실패:', error.message);
      Alert.alert('네트워크 오류', '추천 레시피를 가져오는 데 실패했습니다.');
    }
  };

  const handleSearch = () => {
    const trimmed = searchKeyword.trim();
    if (!trimmed) {
      Alert.alert('검색어를 입력하세요.');
      return;
    }
    navigation.navigate('SearchResults', { keyword: trimmed });
  };

  const handleTabPress = (screen) => {
    navigation.navigate(screen, { userID: currentUserID || '정보 없음' });
  };

  const handleMore = (sectionLabel) => {
    const section = sectionLabel === '오늘의 레시피' ? 'today' : 'popular';
    navigation.navigate('MoreRecipesScreen', { section, userID: currentUserID });
  };

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="요리재료 검색"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          style={styles.input}
          returnKeyType="done"
          blurOnSubmit={false}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
        <Text style={[styles.iconText, styles.bell]}>🔔</Text>
      </View>


      {/* 레시피 목록 */}
      <ScrollView style={styles.content}>
        {/* 오늘의 레시피 */}
        <View style={styles.cardWrapper}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>오늘의 레시피</Text>
              <TouchableOpacity onPress={() => handleMore('오늘의 레시피')}>
                <Text style={styles.moreText}>더보기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recipes.today}
              keyExtractor={(item) => item.rcpSno.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.horizontalCard}
                  onPress={() => navigation.navigate('RecipeDetail', { id: item.rcpSno })}
                >
                  <Image source={{ uri: item.rcpImgUrl }} style={styles.recipeImage} />
                  <Text style={styles.recipeLabel} numberOfLines={1} ellipsizeMode="tail">
                    {item.rcpTtl}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>

        {/* 추천수 많은 레시피 */}
        <View style={styles.cardWrapper}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>추천수 많은 레시피</Text>
              <TouchableOpacity onPress={() => handleMore('추천수 많은 레시피')}>
                <Text style={styles.moreText}>더보기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recipes.popular.slice(0, 4)}   // ✅ 여기서 상위 4개만 슬라이스해서 표시
              keyExtractor={(item) => item.rcpSno.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.horizontalCard}
                  onPress={() => navigation.navigate('RecipeDetail', { id: item.rcpSno })}
                >
                  <Image source={{ uri: item.rcpImgUrl }} style={styles.recipeImage} />
                  <Text style={styles.recipeLabel} numberOfLines={1} ellipsizeMode="tail">
                    {item.rcpTtl}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </ScrollView>

      {/* 하단 탭바 */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.label} onPress={() => handleTabPress(tab.screen)}>
            <View style={styles.tabItem}>
              <Ionicons name={tab.icon} size={24} color="#000" />
              <Text style={styles.tabLabel}>{tab.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', padding: 10, margin: 10, borderRadius: 8, backgroundColor: '#f0f0f0' },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  iconText: { fontSize: 18, marginLeft: 10 },
  bell: { marginLeft: 8 },
  content: { paddingHorizontal: 10, paddingBottom: 70 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  moreText: { fontSize: 14, color: '#007bff' },
  horizontalCard: {
    width: screenWidth / 2.3,
    marginRight: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  recipeImage: { width: '100%', height: 100 },
  recipeLabel: { padding: 8, fontSize: 14, textAlign: 'center' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 12, marginTop: 4 },
  cardWrapper: { marginBottom: 20 },
});

export default MainScreen;
