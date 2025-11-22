import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ActivityIndicator, FlatList,
  Image, TouchableOpacity, StyleSheet
} from "react-native";
import axios from "axios";

export default function RecommendScreen({ route, navigation }) {
  const { userID } = route.params;

  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]);   // ⭐ 사용자가 선택한 식재료
  const [recipes, setRecipes] = useState([]);

  const BASE_URL = "http://192.168.68.54:8080/api";

  // 🟦 내 식재료 조회
  const fetchIngredients = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ingredient/list`, {
        params: { userID },
      });
      setIngredients(res.data);
    } catch (e) {
      console.log("식자재 불러오기 실패", e);
    }
  }, [userID]);

  // 🟦 선택한 재료로 추천 API 호출
  const fetchRecommend = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/recommend?userID=${userID}`,
        selected   // ⭐ JSON 배열로 보냄
      );
      setRecipes(res.data);
    } catch (e) {
      console.log("추천 실패:", e);
    }
    setLoading(false);
  };


  // 🟦 식재료 선택 토글
  const toggleSelect = (item) => {
    if (selected.includes(item.name)) {
      setSelected(selected.filter((i) => i !== item.name));
    } else {
      setSelected([...selected, item.name]);
    }
  };

  // 🟦 최초 1회 식재료 불러오기
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>🥕 사용할 식재료를 선택하세요</Text>

          {/* ⭐ 식재료 목록 */}
          <View style={styles.ingBox}>
            {ingredients.map((item, idx) => {
              const isSelected = selected.includes(item.name);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.ingBtn, isSelected && styles.ingSelected]}
                  onPress={() => toggleSelect(item)}
                >
                  <Text style={styles.ingText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ⭐ 추천받기 버튼 */}
          <TouchableOpacity
            style={styles.recommendBtn}
            onPress={fetchRecommend}
          >
            <Text style={styles.recommendText}>🤖 선택한 재료로 추천받기</Text>
          </TouchableOpacity>

          {loading && (
            <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
          )}

          {!loading && recipes.length > 0 && (
            <Text style={[styles.title, { marginTop: 20 }]}>🔍 추천 레시피</Text>
          )}
        </View>
      }
      renderItem={({ item }) =>
        !loading && recipes.length > 0 ? (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("RecipeDetail", { id: item.id, type: item.type })
            }
          >
            <Image
              source={{
                uri:
                  item.type === "user"
                    ? "data:image/jpeg;base64," + item.image
                    : item.image,
              }}
              style={styles.img}
            />
            <Text style={styles.label}>{item.title}</Text>
          </TouchableOpacity>
        ) : null
      }
      contentContainerStyle={{ padding: 15, backgroundColor: "#fff" }}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },

  ingBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  ingBtn: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  ingSelected: {
    backgroundColor: "#6B8EFF",
  },
  ingText: {
    color: "#333",
    fontWeight: "bold",
  },

  recommendBtn: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  recommendText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  card: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  img: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  label: { fontSize: 16, fontWeight: "500" },
});
