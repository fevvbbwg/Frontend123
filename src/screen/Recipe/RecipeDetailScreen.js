import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Linking, FlatList
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { id, type } = route.params;
  const isUserRecipe = type === 'custom';

  const [recipe, setRecipe] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const API_KEY = "";

  // 🔥 히스토리 저장 함수
  const saveRecipeHistory = async (userID, title, recipeId, imageUrl) => {
    if (!userID) return;   // 제목 체크 제거 🔥

    try {
      await axios.post("", {
        userID,
        title: title || "제목 없음",   // 🔥 안전하게 제목 채워넣기
        recipeId: recipeId?.toString(),
        imageUrl: imageUrl || null,
      });
    } catch (e) {
      console.log("히스토리 저장 실패:", e?.message);
    }
  };


  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        let url = isUserRecipe
          ? ``
          : ``;

        const res = await fetch(url);
        const data = await res.json();

        // ---------------------------------------------------
        // 🔥 제목 보정
        // ---------------------------------------------------
        let title = isUserRecipe ? data.title : data.rcpTtl;
        if (!title || title.trim() === "") {
          title = data.rcpTtl || data.title || "제목 없음";
        }

        // ---------------------------------------------------
        // 🔥 이미지 보정 (null 방지)
        // ---------------------------------------------------
        let img = data.rcpImgUrl || data.imgUrl || null;

        if (isUserRecipe) {
          img = data.imageBase64
            ? `data:image/jpeg;base64,${data.imageBase64}`
            : data.imageUrl;
        }

        // ---------------------------------------------------
        // 🔥 recipe state 세팅
        // ---------------------------------------------------
        if (isUserRecipe) {
          setRecipe({
            rcpSno: data.id,
            rcpTtl: data.title,
            rcpImgUrl: img,
            ckgIpdc: data.description,
            ckgMtrlCn: data.ingredients,
            rgtrNm: data.userId,
            ckgTimeNm: data.cookingTime,
            ckgInbunNm: data.servings,
            ckgDodfNm: "정보 없음",
            ckgKndActoNm: data.category,
            steps: data.steps,
          });
        } else {
          setRecipe(data);
        }

        // ---------------------------------------------------
        // 🔥 유튜브 영상 검색
        // ---------------------------------------------------
        const query = encodeURIComponent(title + " 레시피");
        const ytRes = await fetch(
          ``
        );
        const ytData = await ytRes.json();
        if (ytData.items?.length) setVideoId(ytData.items[0].id.videoId);

        // ---------------------------------------------------
        // 🔥 히스토리 저장
        // ---------------------------------------------------
        const userID = await AsyncStorage.getItem("userID");
        const rid = isUserRecipe ? data.id : data.rcpSno;

        if (userID) {
          await saveRecipeHistory(userID, title, rid, img);
        }

      } catch (error) {
        console.log(error);
        Alert.alert("오류", "레시피 정보를 불러오지 못했습니다.");
      }
    };

    fetchRecipe();

    const fetchRecommended = async () => {
      try {
        const res = await fetch("");
        if (res.ok) setRecommendedRecipes(await res.json());
      } catch {}
    };
    fetchRecommended();
  }, [id, isUserRecipe]);


  if (!recipe)
    return (
      <Text style={{ padding: 20, textAlign: "center", marginTop: 50 }}>
        로딩 중...
      </Text>
    );

  const renderRecommendedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recommendedItem}
      onPress={() =>
        navigation.push("RecipeDetail", { id: item.rcpSno, type: "standard" })
      }
    >
      <Image source={{ uri: item.rcpImgUrl }} style={styles.recommendedImage} />
      <Text style={styles.recommendedTitle} numberOfLines={2}>
        {item.rcpTtl}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={{ fontSize: 16 }}>← 뒤로</Text>
      </TouchableOpacity>

      {recipe.rcpImgUrl ? (
        <Image source={{ uri: recipe.rcpImgUrl }} style={styles.mainImage} />
      ) : (
        <View style={[styles.mainImage, { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: "#888" }}>이미지 없음</Text>
        </View>
      )}

      <Text style={styles.title}>{recipe.rcpTtl}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statText}>💬 {recipe.commentCount || 0}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statText}>📌 {recipe.scrapCount || 0}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statText}>❤️ {recipe.likeCount || 0}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>👤 등록자: {recipe.rgtrNm || "익명"}</Text>
        <Text style={styles.infoText}>🕒 시간: {recipe.ckgTimeNm || "-"}</Text>
        <Text style={styles.infoText}>🍽 인분: {recipe.ckgInbunNm || "-"}</Text>
        <Text style={styles.infoText}>📂 종류: {recipe.ckgKndActoNm || "-"}</Text>
        {!isUserRecipe && (
          <Text style={styles.infoText}>⚙️ 난이도: {recipe.ckgDodfNm || "-"}</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>📖 요리 소개</Text>
      <Text style={styles.paragraph}>{recipe.ckgIpdc || "내용 없음"}</Text>

      <Text style={styles.sectionTitle}>🧂 사용 재료</Text>
      <Text style={styles.paragraph}>{recipe.ckgMtrlCn || "내용 없음"}</Text>

      {isUserRecipe && recipe.steps && (
        <>
          <Text style={styles.sectionTitle}>🍳 조리 순서</Text>
          <Text style={styles.paragraph}>{recipe.steps}</Text>
        </>
      )}

      <Text style={styles.sectionTitle}>🎥 관련 영상</Text>
      {videoId ? (
        <YoutubePlayer height={200} play={false} videoId={videoId} />
      ) : (
        <Text style={{ padding: 10, fontStyle: "italic", color: "#888" }}>
          관련 영상을 찾을 수 없습니다.
        </Text>
      )}

      <TouchableOpacity
        style={styles.youtubeButton}
        onPress={() =>
          Linking.openURL(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.rcpTtl + " 레시피")}`
          )
        }
      >
        <Text style={{ color: "white" }}>🔍 유튜브에서 더보기</Text>
      </TouchableOpacity>

      {recommendedRecipes.length > 0 && (
        <View style={styles.cardWrapper}>
          <Text style={styles.sectionTitle}>🍽 다른 추천 레시피</Text>
          <FlatList
            data={recommendedRecipes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.rcpSno.toString()}
            renderItem={renderRecommendedItem}
          />
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default RecipeDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  backButton: { marginVertical: 10 },
  mainImage: {
    width: "100%",
    height: 230,
    borderRadius: 10,
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  statBox: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  statText: { fontSize: 14, color: "#333" },
  infoCard: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoText: { fontSize: 14, color: "#444", marginVertical: 2 },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 6,
    marginTop: 15,
    color: "#222",
  },
  paragraph: { marginBottom: 12, fontSize: 14, color: "#333", lineHeight: 22 },
  youtubeButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FF0000",
    borderRadius: 8,
    alignItems: "center",
  },
  cardWrapper: { marginTop: 20, marginBottom: 20 },
  recommendedItem: {
    width: 140,
    marginRight: 12,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  recommendedTitle: {
    fontSize: 13,
    marginTop: 6,
    marginHorizontal: 6,
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
  },
});
