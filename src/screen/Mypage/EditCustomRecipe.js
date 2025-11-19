import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditCustomRecipeScreen = ({ route, navigation }) => {
  const { recipe } = route.params;

  // ⭐ 기본정보
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [steps, setSteps] = useState(recipe.steps);
  const [category, setCategory] = useState(recipe.category);
  const [servings, setServings] = useState(recipe.servings);
  const [cookingTime, setCookingTime] = useState(recipe.cookingTime);

  // ⭐ 이미지 처리
  const initialImage =
    recipe.imageBase64
      ? recipe.imageBase64
      : recipe.imageUrl
        ? null
        : "";

  const [imageBase64, setImageBase64] = useState(initialImage);
  const [originalImageBase64, setOriginalImageBase64] = useState(initialImage);

  // ⭐ 식재료
  const [fridgeIngredients, setFridgeIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState(
    recipe.ingredients ? recipe.ingredients.split(", ").map(i => i.trim()) : []
  );

  // ---------------------------------------------------
  // 🔹 냉장고 재료 불러오기
  // ---------------------------------------------------
  useEffect(() => {
    const loadIngredients = async () => {
      const userID = await AsyncStorage.getItem("userID");
      if (!userID) return;

      try {
        const res = await axios.get("http://192.168.68.53:8080/api/ingredient/list", {
          params: { userID }
        });
        setFridgeIngredients(res.data);
      } catch {
        Alert.alert("오류", "냉장고 재료를 불러오지 못했습니다.");
      }
    };

    loadIngredients();
  }, []);

  // ---------------------------------------------------
  // 🔹 재료 선택 토글
  // ---------------------------------------------------
  const toggleIngredient = (name) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  // ---------------------------------------------------
  // 🖼 이미지 선택
  // ---------------------------------------------------
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: "photo", includeBase64: true },
      (res) => {
        if (res.didCancel) return;
        const base64 = res.assets?.[0]?.base64;
        if (base64) setImageBase64(base64);
      }
    );
  };

  // ---------------------------------------------------
  // ✔ 수정 저장
  // ---------------------------------------------------
  const updateRecipe = async () => {
    if (!title || !steps) {
      Alert.alert("오류", "제목과 조리순서는 필수입니다.");
      return;
    }

    try {
      await axios.put(
        `http://192.168.68.53:8080/api/user-recipes/update/${recipe.id}`,
        {
          title,
          description,
          steps,
          category,
          servings,
          cookingTime,
          ingredients: selectedIngredients.join(", "),
          imageBase64:
            imageBase64 !== originalImageBase64
              ? imageBase64
              : originalImageBase64,
        }
      );

      Alert.alert("성공", "레시피가 수정되었습니다!");

      // ⭐ 수정 후 메인 화면으로 이동
      navigation.navigate("MainScreen");

    } catch (err) {
      Alert.alert("오류", "레시피 수정 실패");
    }
  };

  // ---------------------------------------------------
  // 화면 렌더링
  // ---------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
          <Text style={styles.header}>레시피 수정하기</Text>

          {/* 제목 */}
          <Text style={styles.label}>📌 제목</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          {/* 소개 */}
          <Text style={styles.label}>🧾 소개글</Text>
          <TextInput
            style={styles.textarea}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* 이미지 */}
          <Text style={styles.label}>🖼 기존 이미지</Text>
          {imageBase64 ? (
            <Image
              source={{ uri: "data:image/jpeg;base64," + imageBase64 }}
              style={styles.image}
            />
          ) : recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
          ) : (
            <Text style={{ color: "#888" }}>이미지가 없습니다.</Text>
          )}

          <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
            <Text style={styles.imgBtnText}>🖼 새 이미지 선택</Text>
          </TouchableOpacity>

          {/* 🔥 식재료 수정 */}
          <Text style={styles.label}>🧂 사용 재료</Text>
          <View style={styles.ingredientContainer}>
            {fridgeIngredients.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.ingredientBtn,
                  selectedIngredients.includes(item.name) &&
                  styles.selectedIngredient,
                ]}
                onPress={() => toggleIngredient(item.name)}
              >
                <Text style={styles.ingredientText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 조리순서 */}
          <Text style={styles.label}>🍳 조리 순서</Text>
          <TextInput
            style={styles.textarea}
            value={steps}
            onChangeText={setSteps}
            multiline
          />

          {/* 카테고리 */}
          <Text style={styles.label}>📂 카테고리</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} />

          {/* 인분 */}
          <Text style={styles.label}>🍽 인분</Text>
          <TextInput style={styles.input} value={servings} onChangeText={setServings} />

          {/* 시간 */}
          <Text style={styles.label}>🕒 조리 시간</Text>
          <TextInput
            style={styles.input}
            value={cookingTime}
            onChangeText={setCookingTime}
          />

          {/* 저장 */}
          <TouchableOpacity style={styles.saveBtn} onPress={updateRecipe}>
            <Text style={styles.saveText}>수정 완료</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditCustomRecipeScreen;

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { marginTop: 14, fontWeight: "bold", fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    height: 120,
    marginTop: 6,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 6,
  },
  imgBtn: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  imgBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  ingredientContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  ingredientBtn: {
    backgroundColor: "#ccc",
    padding: 8,
    margin: 4,
    borderRadius: 8,
  },
  selectedIngredient: {
    backgroundColor: "#4CAF50",
  },
  ingredientText: {
    color: "white",
    fontWeight: "bold",
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
