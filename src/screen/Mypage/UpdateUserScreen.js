import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function UpdateUserScreen({ navigation }) {
  const [userID, setUserID] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    birthdate: "",
  });

  // 🔎 유저 정보 불러오기
  useEffect(() => {
    const loadUser = async () => {
      const storedID = await AsyncStorage.getItem("userID");
      if (!storedID) {
        Alert.alert("오류", "로그인 정보가 없습니다.");
        return;
      }
      setUserID(storedID);

      try {
        const res = await axios.get("", {
          params: { userID: storedID },
        });

        setForm({
          username: res.data.username || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          birthdate: res.data.birthdate || "",
        });
      } catch (e) {
        console.log("유저 정보 불러오기 실패", e);
      }
    };

    loadUser();
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  // 🔥 정보 수정 요청
  const updateUser = async () => {
    try {
      const res = await axios.put("", {
        userID,
        ...form,
      });

      if (res.data.success) {
        Alert.alert("완료", "정보가 수정되었습니다.", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("오류", "정보 수정 실패");
      }
    } catch (e) {
      console.log("정보 수정 실패:", e);
      Alert.alert("오류", "서버 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>정보 수정</Text>

      <TextInput
        style={styles.input}
        placeholder="이름"
        value={form.username}
        onChangeText={(v) => handleChange("username", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={form.email}
        onChangeText={(v) => handleChange("email", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="전화번호"
        value={form.phone}
        onChangeText={(v) => handleChange("phone", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="생년월일 (YYYY-MM-DD)"
        value={form.birthdate}
        onChangeText={(v) => handleChange("birthdate", v)}
      />

      <TouchableOpacity style={styles.button} onPress={updateUser}>
        <Text style={styles.buttonText}>수정하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#6B8EFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
