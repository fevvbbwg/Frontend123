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

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 40) / 2 - 10;

const TABS = [
    { label: '냉장고', icon: 'snow-outline', screen: 'FridgeScreen' },
    { label: '스캔 등록', icon: 'barcode-outline', screen: 'ScanRegisterScreen' },
    { label: '레시피', icon: 'restaurant-outline', screen: 'MainScreen' },
    { label: 'MY', icon: 'person-outline', screen: 'MyPage' },
];

const MainScreen = () => {
    const navigation = useNavigation();

    const [recipes, setRecipes] = useState({ today: [], popular: [] });
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchTodayRecipes = async () => {
        try {
            const response = await fetch('http://10.0.2.2:8080/api/recipes/today');
            if (!response.ok) throw new Error(`HTTP status ${response.status}`);
            const data = await response.json();
            setRecipes(prev => ({ ...prev, today: Array.isArray(data) ? data : [] }));
        } catch (error) {
            console.error('오늘의 레시피 가져오기 실패:', error.message);
            Alert.alert('네트워크 오류', '오늘의 레시피를 가져오는 데 실패했습니다.');
        }
    };

    const fetchPopularRecipes = async () => {
        try {
            const response = await fetch('http://10.0.2.2:8080/api/recipes/popular');
            if (!response.ok) throw new Error(`HTTP status ${response.status}`);
            const data = await response.json();
            setRecipes(prev => ({ ...prev, popular: Array.isArray(data) ? data : [] }));
        } catch (error) {
            console.error('추천 레시피 가져오기 실패:', error.message);
            Alert.alert('네트워크 오류', '추천 레시피를 가져오는 데 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchTodayRecipes();
        fetchPopularRecipes();
    }, []);

    const handleSearch = () => {
        if (!searchKeyword.trim()) return;
        navigation.navigate('SearchResults', { keyword: searchKeyword });
    };

    const handleMore = (section) => Alert.alert(`${section} - 더보기 클릭됨!`);
    const handleTabPress = (screen) => navigation.navigate(screen);

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

            {/* 레시피 목록 */}
            <ScrollView style={styles.content}>
                {/* 오늘의 레시피 - 가로 스크롤 */}
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
                                    <Text style={styles.recipeLabel}>{item.rcpTtl}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>

                {/* 추천수 많은 레시피 - 그대로 세로 정렬 */}
                <View style={styles.cardWrapper}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>추천수 많은 레시피</Text>
                            <TouchableOpacity onPress={() => handleMore('추천수 많은 레시피')}>
                                <Text style={styles.moreText}>더보기</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.recipeRow}>
                            {recipes.popular.map(recipe => (
                                <TouchableOpacity
                                    key={recipe.rcpSno}
                                    style={styles.recipeCard}
                                    onPress={() => navigation.navigate('RecipeDetail', { id: recipe.rcpSno })}
                                >
                                    <Image source={{ uri: recipe.rcpImgUrl }} style={styles.recipeImage} />
                                    <Text style={styles.recipeLabel}>{recipe.rcpTtl}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        margin: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    iconText: {
        fontSize: 18,
        marginLeft: 10,
    },
    bell: {
        marginLeft: 8,
    },
    content: {
        paddingHorizontal: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    moreText: {
        fontSize: 14,
        color: '#007bff',
    },
    recipeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    recipeCard: {
        width: cardWidth,
        marginBottom: 16,
        backgroundColor: '#fafafa',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
    },
    horizontalCard: {
        width: screenWidth / 2 - 20,
        marginRight: 10,
        backgroundColor: '#fafafa',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
    },
    recipeImage: {
        width: '100%',
        height: 100,
    },
    recipeLabel: {
        padding: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    tabItem: {
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    cardWrapper: {
        marginBottom: 20,
    },
});

export default MainScreen;
