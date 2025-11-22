import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 40) / 2 - 10;
const PAGE_SIZE = 10;

const MoreRecipesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { section } = route.params; // 'today' 또는 'popular'

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const sectionTitle = section === 'today' ? '오늘의 레시피' : '추천수 많은 레시피';

  const fetchRecipes = useCallback(async (pageNum = 1) => {
    if (!hasMore && pageNum !== 1) return;

    try {
      setIsFetching(true);
      const url =
        section === 'today'
          ? `http://192.168.68.54:8080/api/recipes/today-more?page=${pageNum}&size=${PAGE_SIZE}`
          : `http://192.168.68.54:8080/api/recipes/popular-more?page=${pageNum}&size=${PAGE_SIZE}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();

      if (data.length < PAGE_SIZE) setHasMore(false);

      setRecipes(prev => [...prev, ...data.filter(item => !prev.some(r => r.rcpSno === item.rcpSno))]);
    } catch (error) {
      console.error('레시피 가져오기 실패:', error.message);
      Alert.alert('오류', '레시피를 가져오는 데 실패했습니다.');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [section, hasMore]);

  useEffect(() => { fetchRecipes(1); }, [fetchRecipes]);

  const handleLoadMore = () => { if (!isFetching && hasMore) setPage(prev => prev + 1); };
  useEffect(() => { if (page > 1) fetchRecipes(page); }, [page, fetchRecipes]);

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.rcpSno.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RecipeDetail', { id: item.rcpSno })}
          >
            <Image source={{ uri: item.rcpImgUrl }} style={styles.image} />
            <Text style={styles.title}>{item.rcpTtl}</Text>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => isFetching && (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text>불러오는 중...</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: 10 },
  card: { width: cardWidth, margin: 5, borderRadius: 10, backgroundColor: '#fafafa', elevation: 2, overflow: 'hidden' },
  image: { width: '100%', height: 100 },
  title: { padding: 8, fontSize: 14, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MoreRecipesScreen;
