import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  PermissionsAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import axios from "axios";

const CustomRecipeScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [category, setCategory] = useState("");
  const [servings, setServings] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [fridgeIngredients, setFridgeIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // -------------------------------------------------------
  // 📌 권한 요청 함수
  // -------------------------------------------------------
  const requestPermissions = async () => {
    if (Platform.OS !== "android") return true;

    try {
      // 🔹 Android 13 이상
      if (Platform.Version >= 33) {
        const camera = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        const readImages = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );

        if (
          camera !== PermissionsAndroid.RESULTS.GRANTED ||
          readImages !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert("권한 필요", "사진을 선택하려면 권한을 허용해야 합니다.");
          return false;
        }
        return true;
      }

      // 🔹 Android 12 이하
      const camera = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      const storage = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

      if (
        camera !== PermissionsAndroid.RESULTS.GRANTED ||
        storage !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert("권한 필요", "사진을 선택하려면 권한을 허용해야 합니다.");
        return false;
      }

      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // 앱 시작 시 권한 한 번 요청
  useEffect(() => {
    requestPermissions();
  }, []);

  // -------------------------------------------------------
  // 🔹 냉장고 재료 불러오기
  // -------------------------------------------------------
  useEffect(() => {
    const fetchIngredients = async () => {
      const userID = await AsyncStorage.getItem("userID");
      if (!userID) return;
      try {
        const res = await axios.get(`http://192.168.68.51:8080/api/ingredient/list`, {
          params: { userID },
        });
        setFridgeIngredients(res.data);
      } catch (error) {
        console.error(error);
        Alert.alert("오류", "냉장고 재료를 불러오지 못했습니다.");
      }
    };
    fetchIngredients();
  }, []);

  // 🔹 재료 선택
  const toggleIngredient = (name) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  // -------------------------------------------------------
  // 📸 카메라 촬영
  // -------------------------------------------------------
  const openCamera = async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    launchCamera(
      {
        mediaType: "photo",
        cameraType: "back",
        saveToPhotos: true,
      },
      (res) => {
        if (res.didCancel) return;
        if (res.errorMessage) {
          Alert.alert("오류", res.errorMessage);
          return;
        }

        const uri = res.assets?.[0]?.uri;
        if (uri) setImageUrl(uri);
      }
    );
  };

  // -------------------------------------------------------
  // 🖼 갤러리에서 선택
  // -------------------------------------------------------
  const openGallery = async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    launchImageLibrary(
      {
        mediaType: "photo",
      },
      (res) => {
        if (res.didCancel) return;
        if (res.errorMessage) {
          Alert.alert("오류", res.errorMessage);
          return;
        }

        const uri = res.assets?.[0]?.uri;
        if (uri) setImageUrl(uri);
      }
    );
  };

  // -------------------------------------------------------
  // 🔹 레시피 저장
  // -------------------------------------------------------
  const saveRecipe = async () => {
    if (!title || selectedIngredients.length === 0 || !steps) {
      Alert.alert("오류", "제목, 재료, 조리순서는 반드시 입력해야 합니다.");
      return;
    }

    try {
      const userID = await AsyncStorage.getItem("userID");

      const res = await axios.post("http://192.168.68.51:8080/api/user-recipes/create", {
        userId: userID,
        title,
        description,
        ingredients: selectedIngredients.join(", "),
        steps,
        category,
        servings,
        cookingTime,
        imageUrl,
      });

      Alert.alert("성공", "레시피가 저장되었습니다!");
      navigation.navigate("RecipeDetail", {
        id: res.data.id,
        type: "custom",
      });

    } catch (error) {
      console.error(error);
      Alert.alert("오류", "레시피 저장 실패");
    }
  };

  // -------------------------------------------------------
  // UI 렌더링
  // -------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>나만의 레시피 만들기</Text>

          <Text style={styles.label}>📌 제목</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>🧾 소개글</Text>
          <TextInput
            style={styles.textarea}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>🖼 이미지 선택</Text>

          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: 200, borderRadius: 10, marginBottom: 10 }}
            />
          ) : null}

          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <TouchableOpacity style={styles.imgButton} onPress={openCamera}>
              <Text style={styles.imgButtonText}>📷 카메라</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imgButton} onPress={openGallery}>
              <Text style={styles.imgButtonText}>🖼 갤러리</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>🧂 냉장고 재료 선택</Text>
          <View style={styles.ingredientContainer}>
            {fridgeIngredients.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleIngredient(item.name)}
                style={[
                  styles.ingredientBtn,
                  selectedIngredients.includes(item.name) && styles.selectedIngredient,
                ]}
              >
                <Text style={styles.ingredientText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>🍳 조리 순서</Text>
          <TextInput
            style={styles.textarea}
            value={steps}
            onChangeText={setSteps}
            multiline
          />

          <Text style={styles.label}>📂 카테고리</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} />

          <Text style={styles.label}>🍽 인분</Text>
          <TextInput style={styles.input} value={servings} onChangeText={setServings} />

          <Text style={styles.label}>🕒 조리 시간</Text>
          <TextInput style={styles.input} value={cookingTime} onChangeText={setCookingTime} />
        </ScrollView>

        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
            <Text style={styles.saveText}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomRecipeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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

  imgButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  imgButtonText: {
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
    margin: 4,
    padding: 8,
    borderRadius: 8,
  },
  selectedIngredient: { backgroundColor: "#4CAF50" },
  ingredientText: { color: "#fff", fontWeight: "bold" },

  bottomArea: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
