import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function Mypage() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------
      🔥 fetchData — useEffect 밖으로 이동
  ------------------------------------------- */
  const fetchData = async () => {
    try {
      const storedUserID = await AsyncStorage.getItem("userID");
      if (!storedUserID) {
        setLoading(false);
        return;
      }

      // 사용자 정보
      const userRes = await axios.get("", {
        params: { userID: storedUserID },
      });
      setUser(userRes.data);

      // 내가 본 레시피 기록
      const historyRes = await axios.get(
        "" + storedUserID
      );
      setHistory(historyRes.data || []);
    } catch (err) {
      console.log("데이터 불러오기 실패:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------
      최초 1회 로드
  ------------------------------------------- */
  useEffect(() => {
    fetchData();
  }, []);

  /* -------------------------------------------
      🔥 화면으로 돌아올 때 자동 새로고침
  ------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  /* -------------------------------------------
      로그아웃 기능
  ------------------------------------------- */
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userID");
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  /* -------------------------------------------
      🔥 회원 탈퇴 기능
  ------------------------------------------- */
  const confirmDelete = () => {
    Alert.alert(
      "정말 탈퇴하시겠습니까?",
      "탈퇴 후 모든 데이터는 복구가 불가능합니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "탈퇴", style: "destructive", onPress: deleteUser },
      ]
    );
  };

  const deleteUser = async () => {
    const storedUserID = await AsyncStorage.getItem("userID");
    if (!storedUserID) return;

    try {
      const res = await axios.delete(
        ``
      );

      if (res.data.success) {
        Alert.alert("탈퇴 완료", "그동안 이용해주셔서 감사합니다.");
        await AsyncStorage.removeItem("userID");

        navigation.reset({
          index: 0,
          routes: [{ name: "LoginScreen" }],
        });
      } else {
        Alert.alert("오류", "탈퇴 처리 중 문제가 발생했습니다.");
      }
    } catch (err) {
      Alert.alert("오류", "서버 오류로 탈퇴 실패.");
      console.log(err);
    }
  };

  /* -------------------------------------------
      화면 로딩 중
  ------------------------------------------- */
  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profilePlaceholder} />
          <Text style={styles.profileName}>{user?.username || "이름 없음"}</Text>
        </View>
      </View>

      {/* 사용자 정보 */}
      <View style={styles.infoCard}>
        <InfoRow label="성명" value={user?.username || "정보 없음"} />
        <InfoRow label="전화번호" value={user?.phone || "정보 없음"} />
        <InfoRow label="이메일" value={user?.email || "정보 없음"} />
        <InfoRow label="생년월일" value={user?.birthdate || "정보 없음"} />
      </View>

      {/* 내 활동 */}
      <View style={styles.menuGroupCard}>
        <Text style={styles.groupTitle}>내 활동</Text>

        <MenuButton
          label="내가 만든 레시피"
          onPress={() => navigation.navigate("MyRecipesScreen")}
        />
      </View>

      {/* 설정 */}
      <View style={styles.menuGroupCard}>
        <Text style={styles.groupTitle}>설정</Text>

        {/* 🔥 정보수정 화면 이동 */}
        <MenuButton
          label="정보 수정"
          onPress={() => navigation.navigate("UpdateUserScreen", { user })}
        />

        <MenuButton
          label="알림 설정"
          onPress={() => Alert.alert("알림 설정 기능 준비 중")}
        />

        <MenuButton label="로그아웃" onPress={handleLogout} />

        {/* 🔥 회원 탈퇴 */}
        <MenuButton label="회원 탈퇴" onPress={confirmDelete} />
      </View>

      {/* 내가 본 레시피 */}
      <View style={styles.recipeSection}>
        <Text style={styles.recipeTitle}>내가 본 레시피</Text>

        {history.length === 0 ? (
          <Text style={styles.noHistory}>기록된 레시피가 없습니다.</Text>
        ) : (
          <FlatList
            data={history}
            horizontal
            keyExtractor={(item, index) => `${item.recipeId}_${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recipeCard}
                onPress={() =>
                  navigation.navigate("RecipeDetail", {
                    id: item.recipeId,
                    type: "standard",
                  })
                }
              >
                <Image
                  source={{
                    uri: item.imageUrl || "https://via.placeholder.com/100",
                  }}
                  style={styles.recipeImage}
                />
                <Text style={styles.recipeText} numberOfLines={1}>
                  {item.title || "제목 없음"}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

/* -------------------------------------------
      공용 UI 컴포넌트
------------------------------------------- */
function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueBox}>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* -------------------------------------------
      스타일
------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  profileSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  profileName: { fontSize: 22, fontWeight: "600" },

  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoLabel: {
    width: 70,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  infoValueBox: {
    flex: 1,
    backgroundColor: "#d7e8fc",
    borderRadius: 6,
    padding: 6,
  },
  infoValue: { fontSize: 15, color: "#222" },

  menuGroupCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  groupTitle: {
    padding: 20,
    fontSize: 18,
    fontWeight: "700",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: { fontSize: 16, color: "#222" },

  recipeSection: { marginTop: 10 },
  recipeTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  noHistory: { color: "gray" },
  recipeCard: {
    marginRight: 15,
    width: 110,
    alignItems: "center",
    height: 150,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  recipeText: { fontSize: 13, textAlign: "center" },
});
