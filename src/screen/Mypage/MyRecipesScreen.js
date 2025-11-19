import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyRecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://192.168.68.53:8080";

  // 이미지 처리 함수 (Base64 + URL 호환)
  const getRecipeImage = (item) => {
    if (item.imageBase64) {
      return `data:image/jpeg;base64,${item.imageBase64}`;
    }
    if (item.imageUrl) {
      return item.imageUrl;
    }
    return "https://via.placeholder.com/120";
  };

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        const userID = await AsyncStorage.getItem("userID");

        if (!userID) {
          setRecipes([]);
          return;
        }

        const res = await axios.get(
          `${BASE_URL}/api/user-recipes/list/${userID}`
        );

        setRecipes(res.data);
      } catch (err) {
        console.error("내 레시피 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecipes();
  }, []);

  // ⭐ 레시피 삭제 함수
  const deleteRecipe = async (id) => {
    Alert.alert(
      "삭제 확인",
      "정말 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/user-recipes/delete/${id}`);
              setRecipes((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
              console.error("삭제 실패:", err);
              Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내가 만든 레시피</Text>

      {recipes.length === 0 ? (
        <Text style={styles.noData}>등록된 레시피가 없습니다.</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={{ flexDirection: "row", flex: 1 }}
                onPress={() =>
                  navigation.navigate("RecipeDetail", {
                    id: item.id,
                    type: "custom",
                  })
                }
              >
                <Image
                  source={{ uri: getRecipeImage(item) }}
                  style={styles.image}
                />
                <Text style={styles.name} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>

              {/* ⭐ 수정 버튼 */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate("EditCustomRecipe", {
                    recipe: item, // 수정 화면에 전체 데이터 전달
                  })
                }
              >
                <Text style={styles.editText}>수정</Text>
              </TouchableOpacity>

              {/* ⭐ 삭제 버튼 */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteRecipe(item.id)}
              >
                <Text style={styles.deleteText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  noData: {
    color: "gray",
    marginTop: 20,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  // 수정 버튼 스타일
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    marginRight: 6,
  },
  editText: {
    color: "white",
    fontWeight: "600",
  },

  // 삭제 버튼 스타일
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#e53935",
    borderRadius: 6,
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
  },
});
