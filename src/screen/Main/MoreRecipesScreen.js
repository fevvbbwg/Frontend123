import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 40) / 2 - 10;

const MoreRecipesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { section } = route.params;

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 카테고리명 매핑
  const sectionTitleMap = {
    today: "오늘의 레시피",
    popular: "추천수 많은 레시피",
    simple: "간단요리",
    noodle: "면요리",
    soup: "국/찌개",
    salad: "샐러드",
    side: "반찬 요리",
  };

  const sectionTitle = sectionTitleMap[section] || "레시피";

  // 🔥 URL 생성 (today/popular는 pagination)
  const getApiUrl = useCallback(() => {

    if (section === "today") {
      return ``;
    }

    if (section === "popular") {
      return ``;
    }

    // 🔥 카테고리별 전체 리스트
    switch (section) {
      case "simple":
        return ``;
      case "noodle":
        return ``;
      case "soup":
        return ``;
      case "salad":
        return ``;
      case "side":
        return ``;
      default:
        return ``;
    }

  }, [section]);

  const fetchRecipes = useCallback(async () => {
    try {
      const url = getApiUrl();
      const response = await fetch(url);
      const data = await response.json();

      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("오류", "레시피를 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // 안전한 id 처리
  const getRecipeId = (item) =>
    item.rcpSno ?? item.id ?? item.recipeId ?? item.recipe_id;

  const getImage = (item) =>
    item.rcpImgUrl ?? item.imgUrl ?? item.imageUrl ?? item.image ?? null;

  const getKey = (item) =>
    (item.rcpSno ?? item.id ?? Math.random().toString(36)).toString();

  // 로딩 화면
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 레시피 리스트 */}
      <FlatList
        data={recipes}
        keyExtractor={getKey}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const img = getImage(item);
          const title = item.rcpTtl || item.title;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("RecipeDetail", { id: getRecipeId(item) })
              }
            >
              {img ? (
                <Image source={{ uri: img }} style={styles.image} />
              ) : (
                <View style={styles.center}>
                  <Text>이미지 없음</Text>
                </View>
              )}
              <Text style={styles.title}>{title}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  list: { padding: 10 },
  card: {
    width: cardWidth,
    margin: 5,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    elevation: 2,
    overflow: "hidden",
  },
  image: { width: "100%", height: 100 },
  title: { padding: 8, fontSize: 14, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default MoreRecipesScreen;
