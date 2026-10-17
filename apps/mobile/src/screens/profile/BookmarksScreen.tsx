import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
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
import { studentApi } from '../../services/api/studentApi';
import { BookmarkItem } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const data = await studentApi.getBookmarks();
      setBookmarks(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookmarks();
  };

  const handleOpenTarget = (item: BookmarkItem) => {
    if (item.targetType === 'QUESTION') {
      navigation.navigate('QuestionDetail', { id: item.targetId });
    } else if (item.targetType === 'ARTICLE') {
      navigation.navigate('ArticleDetail', { id: item.targetId });
    } else if (item.targetType === 'WORKFLOW') {
      navigation.navigate('WorkflowDetail', { id: item.targetId });
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'QUESTION':
        return 'primary';
      case 'ARTICLE':
        return 'success';
      case 'WORKFLOW':
        return 'purple';
      default:
        return 'neutral';
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Mục đã lưu (Bookmarks)"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card
              onPress={() => handleOpenTarget(item)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <Badge
                  label={item.targetType}
                  variant={getTypeVariant(item.targetType) as any}
                  size="sm"
                />
                <Text style={styles.dateText}>{item.createdAt}</Text>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>

              {item.summary && (
                <Text style={styles.summary} numberOfLines={2}>
                  {item.summary}
                </Text>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.readLink}>Chạm để xem chi tiết</Text>
                <Feather name="arrow-right" size={14} color={Colors.primary} />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="bookmark"
              title="Chưa có mục nào được lưu"
              description="Bạn có thể đánh dấu lại các câu hỏi, bài viết hay workflows quan trọng để xem lại khi cần."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  title: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  summary: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
  },
  readLink: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
});
