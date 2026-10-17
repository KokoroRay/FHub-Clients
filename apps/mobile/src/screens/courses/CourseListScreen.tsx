import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { taxonomyApi } from '../../services/api/taxonomyApi';
import { mockCourses, mockMajors } from '../../services/mockData';
import { CourseNode } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CourseListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('ALL');
  const [courses, setCourses] = useState<CourseNode[]>(mockCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedCodes, setBookmarkedCodes] = useState<Set<string>>(new Set());

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await taxonomyApi.getCourses(searchQuery, selectedMajor === 'ALL' ? undefined : selectedMajor);
      setCourses(data);
    } catch (e) {
      console.warn('Error fetching courses:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedMajor]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const toggleBookmark = (code: string) => {
    setBookmarkedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMajor = selectedMajor === 'ALL' || c.majorCode === selectedMajor;
      return matchSearch && matchMajor;
    });
  }, [courses, searchQuery, selectedMajor]);

  const renderCourseItem = ({ item }: { item: CourseNode }) => {
    const isBookmarked = bookmarkedCodes.has(item.code);

    return (
      <Card
        onPress={() => navigation.navigate('CourseDetail', { code: item.code })}
        style={styles.courseCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.codeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
            <Badge label={`${item.credits} tín chỉ`} variant="neutral" size="sm" />
            <Badge label={`Kỳ ${item.semester}`} variant="primary" size="sm" />
          </View>

          <TouchableOpacity
            onPress={() => toggleBookmark(item.code)}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isBookmarked ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          <View style={styles.statsGroup}>
            <View style={styles.statChip}>
              <Feather name="help-circle" size={12} color={Colors.textMuted} />
              <Text style={styles.statCount}>{item.discussionCount}</Text>
            </View>
            <View style={styles.statChip}>
              <Feather name="download" size={12} color={Colors.textMuted} />
              <Text style={styles.statCount}>{item.materialCount}</Text>
            </View>
            <View style={styles.statChip}>
              <Feather name="code" size={12} color={Colors.textMuted} />
              <Text style={styles.statCount}>{item.workflowCount}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Course Hub"
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo mã (PRN211) hoặc tên môn..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Major Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ code: 'ALL', name: 'Tất cả ngành' }, ...mockMajors]}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedMajor === item.code;
            return (
              <TouchableOpacity
                onPress={() => setSelectedMajor(item.code)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {item.code} {item.code !== 'ALL' ? `(${item.name.slice(0, 15)})` : ''}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Course List */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.code}
        renderItem={renderCourseItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="book"
            title="Không tìm thấy môn học nào"
            description="Hãy thử đổi từ khóa tìm kiếm hoặc chọn chuyên ngành khác."
            actionTitle="Xóa bộ lọc"
            onActionPress={() => {
              setSearchQuery('');
              setSelectedMajor('ALL');
            }}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.bodySm,
    color: Colors.text,
  },
  filterSection: {
    paddingVertical: Spacing.xs,
    marginTop: 2,
  },
  filterList: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 90,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  codeText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: FontSize.micro,
    letterSpacing: 0.5,
  },
  bookmarkButton: {
    padding: 2,
  },
  courseTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  courseDescription: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statCount: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
