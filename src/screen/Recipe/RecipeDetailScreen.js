import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const RecipeDetailScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [recipe, setRecipe] = useState(null);
    const [steps, setSteps] = useState([]);
    const [videoId, setVideoId] = useState(null);

    const API_KEY = "AIzaSyBO5YIQ30W4hOrhQPsTW_peEfpAbG52sbg";

    useEffect(() => {
        const fetchRecipeDetail = async () => {
            try {
                const recipeId = Number(id);
                const res = await fetch(`http://10.0.2.2:8080/api/recipes/${recipeId}`);
                if (!res.ok) throw new Error('네트워크 응답 오류');

                const data = await res.json();
                setRecipe(data);

                // 조리 방법
                if (data.ckgMthActoNm) {
                    const stepsArray = data.ckgMthActoNm
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .map((desc, idx) => ({ description: desc, key: idx.toString() }));
                    setSteps(stepsArray);
                } else {
                    setSteps([]);
                }

                // 유튜브 검색 API 호출
                if (data.rcpTtl) {
                    const query = encodeURIComponent(data.rcpTtl + " 레시피");
                    const ytRes = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${API_KEY}`
                    );
                    const ytData = await ytRes.json();
                    if (ytData.items && ytData.items.length > 0) {
                        setVideoId(ytData.items[0].id.videoId);
                    }
                }

            } catch (error) {
                console.error(error);
                Alert.alert('오류', '레시피 정보를 불러오지 못했습니다.');
            }
        };

        fetchRecipeDetail();
    }, [id]);

    if (!recipe) return <Text style={{ padding: 20 }}>로딩 중...</Text>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={{ fontSize: 16 }}>← 뒤로</Text>
            </TouchableOpacity>

            <Image source={{ uri: recipe.rcpImgUrl }} style={styles.mainImage} />
            <Text style={styles.title} numberOfLines={2}>{recipe.rcpTtl}</Text>

            <View style={styles.metaInfoRow}>
                <Text>👤 {recipe.rgtrNm || '정보 없음'}</Text>
                <Text>⏱ {recipe.ckgTimeNm || '정보 없음'}</Text>
                <Text>🧰 {recipe.ckgDodfNm || '정보 없음'}</Text>
            </View>

            <Text style={styles.sectionTitle}>📖 요리 소개</Text>
            <Text style={styles.paragraph}>{recipe.ckgIpdc || '정보 없음'}</Text>

            <Text style={styles.sectionTitle}>🧂 사용 재료</Text>
            <Text style={styles.paragraph}>{recipe.ckgMtrlCn || '정보 없음'}</Text>

            <Text style={styles.sectionTitle}>🍳 조리 방법</Text>

            {videoId ? (
                <YoutubePlayer height={200} play={false} videoId={videoId} />
            ) : (
                <Text style={{ padding: 10, fontStyle: 'italic' }}>영상 정보를 불러오는 중...</Text>
            )}

            <View style={{ marginTop: 12 }}>
                <TouchableOpacity
                    style={styles.youtubeButton}
                    onPress={() => {
                        const keyword = encodeURIComponent(recipe.rcpTtl + ' 레시피');
                        const url = `https://www.youtube.com/results?search_query=${keyword}`;
                        Linking.openURL(url);
                    }}
                >
                    <Text style={{ color: 'white' }}>🔍 유튜브에서 영상 검색</Text>
                </TouchableOpacity>

                <Text style={styles.noticeText}>
                    ※ 실제 요리와 다를 수 있습니다.
                </Text>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button}>
                    <Text>❤️ 추천 {recipe.rcmmCnt || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text>📌 스크랩 {recipe.srapCnt || 0}</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📎 관련 레시피</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedList}>
                {recipe.related && recipe.related.length > 0 ? (
                    recipe.related.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.relatedCard}
                            onPress={() => navigation.replace('RecipeDetail', { id: item.id })}
                        >
                            <Image source={{ uri: item.image }} style={styles.relatedImage} />
                            <Text style={styles.relatedLabel} numberOfLines={1}>{item.title}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.paragraph}>관련 레시피 정보가 없습니다.</Text>
                )}
            </ScrollView>
        </ScrollView>
    );
};

export default RecipeDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
    backButton: { marginVertical: 10 },
    mainImage: { width: '100%', height: 200, borderRadius: 8 },
    title: { fontSize: 20, fontWeight: 'bold', marginVertical: 8, textAlign: 'center' },
    metaInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
    paragraph: { marginBottom: 12, fontSize: 14 },
    stepText: { marginBottom: 8, fontSize: 14, lineHeight: 20 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
    button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
    relatedList: { marginTop: 8, minHeight: 110 },
    relatedCard: { marginRight: 15, width: 100, alignItems: 'center' },
    relatedImage: { width: 100, height: 80, borderRadius: 10 },
    relatedLabel: { marginTop: 6, fontSize: 12, textAlign: 'center' },
    youtubeButton: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#FF0000', borderRadius: 8, alignItems: 'center' },
    noticeText: { fontSize: 12, color: 'gray', marginTop: 6, textAlign: 'center' },
});
