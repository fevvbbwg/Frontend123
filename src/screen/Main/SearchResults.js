import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const SearchResults = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { keyword: initialKeyword } = route.params;

  const [keyword, setKeyword] = useState(initialKeyword);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSearchResults = async (term) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.68.51:8080/api/recipes/search?keyword=${term}`
      );
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('검색 실패:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(initialKeyword);
  }, [initialKeyword]);

  const handleSearch = () => {
    if (keyword.trim()) {
      fetchSearchResults(keyword.trim());
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="레시피 검색"
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 결과 표시 */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>검색 중...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text>검색 결과가 없습니다 😥</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.rcpSno.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('RecipeDetail', { id: item.rcpSno })}
            >
              <Image source={{ uri: item.rcpImgUrl }} style={styles.image} />
              <Text style={styles.title}>{item.rcpTtl}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fafafa',
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  title: {
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchResults;
