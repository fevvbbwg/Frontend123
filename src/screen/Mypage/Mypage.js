import React, { useEffect, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";

export default function Mypage() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (!storedUserID) {
          setLoading(false);
          return;
        }

        const userRes = await axios.get("http://192.168.68.56:8080/api/mypage/me", {
          params: { userID: storedUserID },
        });
        setUser(userRes.data);

        const historyRes = await axios.get("http://192.168.68.56:8080/api/history", {
          params: { userID: storedUserID },
        });
        setHistory(historyRes.data);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userID");

      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }], // ✅ 실제 등록된 이름으로 수정
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profilePlaceholder} />
          <Text style={styles.profileName}>{user?.username || "이름 없음"}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <InfoRow label="성명" value={user?.username || "정보 없음"} />
        <InfoRow label="전화번호" value={user?.phone || "정보 없음"} />
        <InfoRow label="이메일" value={user?.email || "정보 없음"} />
        <InfoRow label="생년월일" value={user?.birthdate || "정보 없음"} />
      </View>

      {/* 설정/로그아웃/탈퇴 섹션 */}
      <View style={styles.menuCard}>
        <MenuButton label="정보 수정" onPress={() => Alert.alert("정보 수정 기능 준비 중")} />
        <MenuButton label="알림 설정" onPress={() => Alert.alert("알림 설정 기능 준비 중")} />
        <MenuButton label="로그아웃" onPress={handleLogout} />
        <MenuButton label="회원 탈퇴" onPress={() => Alert.alert("회원 탈퇴 기능 준비 중")} />
      </View>

      <View style={styles.recipeSection}>
        <Text style={styles.recipeTitle}>내가 본 레시피</Text>
        {history.length === 0 ? (
          <Text style={styles.noHistory}>기록된 레시피가 없습니다.</Text>
        ) : (
          <FlatList
            data={history}
            horizontal
            keyExtractor={(item, index) =>
              item.recipeId?.toString() || index.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recipeCard}
                onPress={() =>
                  navigation.navigate("RecipeDetail", { id: item.recipeId })
                }
              >
                <Image
                  source={{
                    uri: item.imageUrl || "https://via.placeholder.com/100",
                  }}
                  style={styles.recipeImage}
                />
                <Text style={styles.recipeText} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
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
  infoValue: {
    fontSize: 15,
    color: "#222",
  },
  menuCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  menuButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 16,
    color: "#222",
  },
  recipeSection: {
    marginTop: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  noHistory: {
    color: "gray",
  },
  recipeCard: {
    marginRight: 15,
    width: 110,
    alignItems: "center",
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  recipeText: {
    fontSize: 13,
    textAlign: "center",
  },
});
