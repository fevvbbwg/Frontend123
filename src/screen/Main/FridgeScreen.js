import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const FridgeScreen = ({ route, navigation }) => {
  const { userID } = route.params;
  const [sections, setSections] = useState([]);

  // 🍎 식자재 불러오기
  const fetchIngredients = useCallback(async () => {
    try {
      const response = await fetch(
        ``
      );
      const data = await response.json();

      const categories = {
        유통기한임박: [],
        채소: [],
        과일: [],
        유제품: [],
        육류: [],
        수산물: [],
        곡류: [],
        냉동식품: [],
        음료: [],
        조미료: [],
        기타: [],
      };

      const today = new Date();

      data.forEach((item) => {
        let daysLeft = null;
        if (item.expirationDate) {
          const exp = new Date(item.expirationDate);
          const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          daysLeft = diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
        }

        if (daysLeft && parseInt(daysLeft.replace('D-', '')) <= 5) {
          categories.유통기한임박.push({ ...item, expirationDisplay: daysLeft });
          return;
        }

        switch (item.category) {
          case '채소': categories.채소.push({ ...item, expirationDisplay: daysLeft }); break;
          case '과일': categories.과일.push({ ...item, expirationDisplay: daysLeft }); break;
          case '유제품': categories.유제품.push({ ...item, expirationDisplay: daysLeft }); break;
          case '육류': categories.육류.push({ ...item, expirationDisplay: daysLeft }); break;
          case '수산물': categories.수산물.push({ ...item, expirationDisplay: daysLeft }); break;
          case '곡류': categories.곡류.push({ ...item, expirationDisplay: daysLeft }); break;
          case '냉동식품': categories.냉동식품.push({ ...item, expirationDisplay: daysLeft }); break;
          case '음료': categories.음료.push({ ...item, expirationDisplay: daysLeft }); break;
          case '조미료': categories.조미료.push({ ...item, expirationDisplay: daysLeft }); break;
          default: categories.기타.push({ ...item, expirationDisplay: daysLeft }); break;
        }
      });

      const formattedSections = Object.entries(categories).map(([key, items]) => ({
        title: `${key} (${items.length})`,
        data: Array.isArray(items) ? items : [], // ✅ 문자열 방지
        expanded: true,
      }));

      console.log('✅ sections data:', formattedSections); // 디버깅용 로그
      setSections(formattedSections);
    } catch (error) {
      console.error('❌ fetchIngredients 오류:', error);
      Alert.alert('오류', '냉장고 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [userID]);

  useFocusEffect(
    useCallback(() => {
      fetchIngredients();
    }, [fetchIngredients])
  );

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const toggleSection = (title) => {
    setSections((prev) =>
      prev.map((section) =>
        section.title === title ? { ...section, expanded: !section.expanded } : section
      )
    );
  };

  const handleEdit = (item) => {
    navigation.navigate('IngredientEditScreen', { ingredient: item, userID });
  };

  const handleDelete = async (id) => {
    Alert.alert('삭제 확인', '정말 이 식자재를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(
              ``,
              { method: 'DELETE' }
            );

            if (response.ok) {
              Alert.alert('삭제 완료', '식자재가 삭제되었습니다.');
              fetchIngredients();
            } else {
              const errMsg = await response.text();
              console.error('삭제 실패:', errMsg);
              Alert.alert('오류', '식자재 삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('삭제 오류:', error);
            Alert.alert('오류', '서버 요청 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item, section }) =>
    section.expanded ? (
      <View style={styles.item}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name || '이름 없음'}</Text>
          <Text style={styles.itemExp}>{item.expirationDisplay || '유통기한 없음'}</Text>
          {item.note ? (
            <Text style={styles.itemNote}>{String(item.note)}</Text>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.buttonText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.buttonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : null;

  const renderSectionHeader = ({ section }) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section.title)}
    >
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionToggle}>{section.expanded ? '▲' : '▼'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : `${index}`
        } // ✅ 안전 처리
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            냉장고에 등록된 식자재가 없습니다.
          </Text>
        } // ✅ 빈 목록 처리
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  sectionToggle: { fontSize: 16, color: '#555' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  image: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: 'bold' },
  itemExp: { fontSize: 13, color: '#888' },
  itemNote: { fontSize: 12, color: '#555', marginTop: 2 },
  buttonContainer: { flexDirection: 'row', marginRight: 10 },
  smallButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 5,
  },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});

export default FridgeScreen;
