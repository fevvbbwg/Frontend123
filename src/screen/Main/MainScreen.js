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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const TABS = [
  { label: '냉장고', icon: 'snow-outline', screen: 'FridgeScreen' },
  { label: '스캔 등록', icon: 'camera-outline', screen: 'QRCodeScanner' },
  { label: '레시피', icon: 'book-outline', screen: 'RecipeScreen' },
  { label: 'MY', icon: 'person-circle-outline', screen: 'Mypage' },
];

const MainScreen = () => {
  const navigation = useNavigation();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUserID, setCurrentUserID] = useState(null);

  const [recipes, setRecipes] = useState({
    today: [],
    popular: [],
    simple: [],
    noodle: [],
    soup: [],
    salad: [],
    side: [],
  });

  useEffect(() => {
    const loadUserID = async () => {
      const storedID = await AsyncStorage.getItem('userID');
      setCurrentUserID(storedID);
    };
    loadUserID();

    fetchSection('today', '/today');
    fetchSection('popular', '/popular');
    fetchSection('simple', '/simple');
    fetchSection('noodle', '/noodle');
    fetchSection('soup', '/soup');
    fetchSection('salad', '/salad');
    fetchSection('side', '/side');
  }, []);

  // 🔥 공통 fetch 함수
  const fetchSection = async (key, endpoint) => {
    try {
      const response = await fetch(``);
      const data = await response.json();
      setRecipes(prev => ({ ...prev, [key]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error(`${key} 레시피 로드 실패:`, err);
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

  const handleMore = (type) => {
    navigation.navigate('MoreRecipesScreen', { section: type, userID: currentUserID });
  };

  // 🔥 공통 렌더링 UI
  const renderRecipeRow = (title, dataKey) => (
    <View style={styles.cardWrapper}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => handleMore(dataKey)}>
            <Text style={styles.moreText}>더보기</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recipes[dataKey]}
          keyExtractor={(item) => item.rcpSno.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.horizontalCard}
              onPress={() => navigation.navigate('RecipeDetail', { id: item.rcpSno })}
            >
              <Image source={{ uri: item.rcpImgUrl }} style={styles.recipeImage} />
              <Text style={styles.recipeLabel} numberOfLines={1}>
                {item.rcpTtl}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="요리재료 검색"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
        <Text style={[styles.iconText, styles.bell]}>🔔</Text>
      </View>

      {/* 메인 컨텐츠 */}
      <ScrollView style={styles.content}>
        {renderRecipeRow("오늘의 레시피", "today")}
        {renderRecipeRow("추천수 많은 레시피", "popular")}
        {renderRecipeRow("간단요리", "simple")}
        {renderRecipeRow("면요리", "noodle")}
        {renderRecipeRow("국/찌개", "soup")}
        {renderRecipeRow("샐러드", "salad")}
        {renderRecipeRow("반찬 요리", "side")}
      </ScrollView>

      {/* 탭바 */}
      <SafeAreaView edges={['bottom']} style={styles.safeTab}>
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
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },

  input: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  iconText: { fontSize: 18, marginLeft: 10 },
  bell: { marginLeft: 8 },

  content: { paddingHorizontal: 10, paddingBottom: 20 },

  section: { marginBottom: 20 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  moreText: { fontSize: 14, color: '#007bff' },

  horizontalCard: {
    width: screenWidth / 2.3,
    marginRight: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },

  recipeImage: { width: '100%', height: 100 },
  recipeLabel: { padding: 8, fontSize: 14, textAlign: 'center' },

  safeTab: { backgroundColor: '#fff' },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },

  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 12, marginTop: 4 },

  cardWrapper: { marginBottom: 20 },
});

export default MainScreen;
