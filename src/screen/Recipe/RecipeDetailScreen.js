import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Linking, FlatList
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const API_KEY = "AIzaSyBO5YIQ30W4hOrhQPsTW_peEfpAbG52sbg";

  // ✅ 레시피 히스토리 저장 (오류 시 알림 제거)
  const saveRecipeHistory = async (userID, title, recipeId, imageUrl) => {
    if (!userID || !title) return;
    try {
      await axios.post("http://192.168.68.56:8080/api/recipe-history/save", {
        userID,
        title,
        recipeId: recipeId?.toString(),
        imageUrl: imageUrl || null,
      });
    } catch {
      // 오류 발생 시 조용히 무시
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://192.168.68.56:8080/api/recipes/${id}`);
        if (!res.ok) throw new Error('네트워크 오류');
        const data = await res.json();
        setRecipe(data);

        // 유튜브 영상 검색
        if (data.rcpTtl) {
          const query = encodeURIComponent(data.rcpTtl + " 레시피");
          const ytRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${API_KEY}`
          );
          const ytData = await ytRes.json();
          if (ytData.items?.length) setVideoId(ytData.items[0].id.videoId);
        }

        // 히스토리 저장
        const userID = await AsyncStorage.getItem("userID");
        if (userID) await saveRecipeHistory(userID, data.rcpTtl, data.rcpSno, data.rcpImgUrl);

      } catch (error) {
        console.error("레시피 불러오기 실패:", error);
        Alert.alert('오류', '레시피 정보를 불러오지 못했습니다.');
      }
    };

    // 오늘의 레시피 랜덤 4개 가져오기
    const fetchTodayRecipes = async () => {
      try {
        const todayRes = await fetch("http://192.168.68.56:8080/api/recipes/today");
        if (todayRes.ok) {
          const todayData = await todayRes.json();
          setRecommendedRecipes(todayData);
        }
      } catch (err) {
        console.error("오늘의 레시피 불러오기 실패:", err);
      }
    };

    fetchRecipe();
    fetchTodayRecipes();
  }, [id]);

  if (!recipe) return <Text style={{ padding: 20 }}>로딩 중...</Text>;

  // 추천 레시피 눌렀을 때 이동
  const renderRecommendedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recommendedItem}
      onPress={() => navigation.push('RecipeDetail', { id: item.rcpSno })}
    >
      <Image source={{ uri: item.rcpImgUrl }} style={styles.recommendedImage} />
      <Text style={styles.recommendedTitle} numberOfLines={2}>{item.rcpTtl}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={{ fontSize: 16 }}>← 뒤로</Text>
      </TouchableOpacity>

      <Image source={{ uri: recipe.rcpImgUrl }} style={styles.mainImage} />
      <Text style={styles.title}>{recipe.rcpTtl}</Text>

      {/* 댓글/스크랩/좋아요 */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}><Text style={styles.statText}>💬 {recipe.commentCount || 0}</Text></View>
        <View style={styles.statBox}><Text style={styles.statText}>📌 {recipe.scrapCount || 0}</Text></View>
        <View style={styles.statBox}><Text style={styles.statText}>❤️ {recipe.likeCount || 0}</Text></View>
      </View>

      {/* 요약 정보 */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>👤 {recipe.rgtrNm || '등록자 없음'}</Text>
        <Text style={styles.infoText}>🕒 {recipe.ckgTimeNm || '시간 정보 없음'}</Text>
        <Text style={styles.infoText}>⚙️ 난이도: {recipe.ckgDodfNm || '정보 없음'}</Text>
        <Text style={styles.infoText}>🍽 인분: {recipe.ckgInbunNm || '정보 없음'}</Text>
        <Text style={styles.infoText}>📂 상황: {recipe.ckgStaActoNm || '정보 없음'}</Text>
        <Text style={styles.infoText}>📖 종류: {recipe.ckgKndActoNm || '정보 없음'}</Text>
        <Text style={styles.infoText}>🧾 재료기반: {recipe.ckgMtrlActoNm || '정보 없음'}</Text>
      </View>

      <Text style={styles.sectionTitle}>📖 요리 소개</Text>
      <Text style={styles.paragraph}>{recipe.ckgIpdc || '정보 없음'}</Text>

      <Text style={styles.sectionTitle}>🧂 사용 재료</Text>
      <Text style={styles.paragraph}>{recipe.ckgMtrlCn || '정보 없음'}</Text>

      <Text style={styles.sectionTitle}>🍳 조리 영상</Text>
      {videoId ? (
        <YoutubePlayer height={200} play={false} videoId={videoId} />
      ) : (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>영상 정보를 불러오는 중...</Text>
      )}

      <TouchableOpacity
        style={styles.youtubeButton}
        onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.rcpTtl + ' 레시피')}`)}
      >
        <Text style={{ color: 'white' }}>🔍 유튜브에서 검색하기</Text>
      </TouchableOpacity>

      {/* 추천 레시피 */}
      {recommendedRecipes.length > 0 && (
        <View style={styles.cardWrapper}>
          <Text style={styles.sectionTitle}>🍽 이런 레시피는 어떠신가요?</Text>
          <FlatList
            data={recommendedRecipes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.rcpSno.toString()}
            renderItem={renderRecommendedItem}
          />
        </View>
      )}

      <Text style={styles.noticeText}>※ 실제 요리와 다를 수 있습니다.</Text>
    </ScrollView>
  );
};

export default RecipeDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  backButton: { marginVertical: 10 },
  mainImage: { width: '100%', height: 230, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 10, textAlign: 'center', color: '#333' },

  statsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  statBox: { backgroundColor: '#f4f4f4', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, marginHorizontal: 6, borderWidth: 1, borderColor: '#ddd' },
  statText: { fontSize: 14, color: '#333' },

  infoCard: { backgroundColor: '#f8f8f8', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  infoText: { fontSize: 14, color: '#444', marginVertical: 2 },

  sectionTitle: { fontWeight: 'bold', fontSize: 17, marginBottom: 6, marginTop: 10, color: '#222' },
  paragraph: { marginBottom: 12, fontSize: 14, color: '#333', lineHeight: 20 },

  youtubeButton: { marginTop: 12, padding: 12, backgroundColor: '#FF0000', borderRadius: 8, alignItems: 'center' },
  noticeText: { fontSize: 12, color: 'gray', marginTop: 10, textAlign: 'center', marginBottom: 20 },

  cardWrapper: { marginTop: 20, marginBottom: 20 },
  recommendedItem: { width: 140, marginRight: 12, backgroundColor: '#fafafa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  recommendedImage: { width: '100%', height: 100, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  recommendedTitle: { fontSize: 13, marginTop: 6, marginHorizontal: 6, textAlign: 'center', color: '#333' },
});
