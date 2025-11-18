import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyRecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        const userID = await AsyncStorage.getItem("userID");

        if (!userID) {
          setRecipes([]);
          return;
        }

        const res = await axios.get(
          `http://192.168.68.51:8080/api/user-recipes/list/${userID}`
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
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("RecipeDetail", {
                  id: item.id,
                  type: "custom", // ⭐ 커스텀 레시피임을 명확히 전달
                })
              }
            >
              <Image
                source={{
                  uri: item.imageUrl || "https://via.placeholder.com/120",
                }}
                style={styles.image}
              />
              <Text style={styles.name} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
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
});
