import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
} from "react-native";
import axios from "axios";

export default function RecipeScreen({ route, navigation }) {
  const { userID } = route.params;
  const [ingredients, setIngredients] = useState([]);
  const [seasonalRecipes, setSeasonalRecipes] = useState([]);
  const [categories, setCategories] = useState({
    fruit: [],
    meat: [],
    fish: [],
  });
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://192.168.68.58:8080/api";

  // 🧊 식자재 불러오기
  const fetchIngredients = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ingredient/list`, {
        params: { userID },
      });
      setIngredients(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "식자재를 불러오지 못했습니다.");
    }
  }, [userID]);

  // 🌿 제철 요리 (type = seasonal)
  const fetchSeasonal = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/recipes/all`, {
        params: { type: "seasonal" },
      });
      setSeasonalRecipes(res.data);
    } catch (error) {
      console.error("제철 레시피 불러오기 실패:", error);
    }
  }, []);

  // 🍖 카테고리별 요리
  const fetchCategory = useCallback(async (type) => {
    try {
      const res = await axios.get(`${BASE_URL}/recipes/all`, {
        params: { type },
      });
      setCategories((prev) => ({ ...prev, [type]: res.data }));
    } catch (error) {
      console.error(`${type} 레시피 불러오기 실패:`, error);
    }
  }, []);

  // 🔄 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      await fetchIngredients();
      await fetchSeasonal();

      // 순차 호출 (초기 렉 방지)
      setTimeout(() => fetchCategory("meat"), 300);
      setTimeout(() => fetchCategory("fish"), 600);
      setTimeout(() => fetchCategory("fruit"), 900);

      setLoading(false);
    };
    loadData();
  }, [fetchIngredients, fetchSeasonal, fetchCategory]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  // 🔹 카테고리 섹션 (FlatList)
  const renderCategorySection = (title, data, type) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.subtitle}>{title}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("MoreRecipesScreen", { type })}
        >
          <Text style={styles.moreText}>더보기 ▸</Text>
        </TouchableOpacity>
      </View>

      {data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const id = item.rcpSno || item.id;
            const title = item.rcpTtl || item.title || "제목 없음";
            const image = item.rcpImgUrl || item.imgUrl || item.imageUrl;

            return (
              <TouchableOpacity
                style={styles.recipeCard}
                onPress={() => navigation.navigate("RecipeDetail", { id })}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={styles.recipeImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImg}>
                    <Text style={styles.noImgText}>이미지 없음</Text>
                  </View>
                )}
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {title}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <Text style={styles.emptyText}>레시피가 없습니다.</Text>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🍽️ 나만의 레시피 추천</Text>

      {/* 🥕 내 식자재 목록 */}
      <Text style={styles.subtitle}>🥕 내 냉장고 속 식자재</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {ingredients.length > 0 ? (
          ingredients.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.ingredientBtn}
              onPress={() => Alert.alert(item.name)}
            >
              <Text style={styles.ingredientText}>{item.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>등록된 재료가 없습니다.</Text>
        )}
      </ScrollView>

      {/* 🤖 AI 추천 버튼 */}
      <TouchableOpacity
        style={styles.recommendBtn}
        onPress={() => Alert.alert("AI 추천 실행")}
      >
        <Text style={styles.recommendText}>🤖 내 식자재로 추천받기</Text>
      </TouchableOpacity>

      {/* 🌿 카테고리별 레시피 */}
      {renderCategorySection("🌿 제철 음식", seasonalRecipes, "seasonal")}
      {renderCategorySection("🍖 고기 요리", categories.meat, "meat")}
      {renderCategorySection("🐟 생선 요리", categories.fish, "fish")}
      {renderCategorySection("🍎 과일 요리", categories.fruit, "fruit")}

      {/* 🧂 직접 레시피 만들기 */}
      <TouchableOpacity
        style={styles.makeBtn}
        onPress={() => navigation.navigate("CustomRecipeScreen", { userID })}
      >
        <Text style={styles.makeText}>🧂 내 식자재로 직접 레시피 만들기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  moreText: { color: "#007AFF", fontWeight: "500", fontSize: 14 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ingredientBtn: {
    backgroundColor: "#f9b234",
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
  },
  ingredientText: { color: "#fff", fontWeight: "bold" },
  recommendBtn: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
    alignItems: "center",
  },
  recommendText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  makeBtn: {
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    padding: 12,
    marginTop: 30,
    alignItems: "center",
  },
  makeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  section: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  recipeCard: {
    width: 120,
    marginRight: 10,
    alignItems: "center",
  },
  recipeImg: {
    width: 110,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  noImg: {
    width: 110,
    height: 80,
    backgroundColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  noImgText: { color: "#888", fontSize: 12 },
  recipeTitle: { marginTop: 5, fontSize: 13, fontWeight: "500", textAlign: "center" },
  emptyText: { color: "#888", fontSize: 13 },
});
