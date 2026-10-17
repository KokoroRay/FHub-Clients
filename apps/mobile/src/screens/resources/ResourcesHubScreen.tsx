import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
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
import { PeekableCard } from '../../components/common/PeekableCard';
import { useQuickPeek, QuickPeekItem } from '../../context/QuickPeekContext';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { contentApi } from '../../services/api/contentApi';
import { Article, SharedWorkflow, StudyMaterial } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ResourcesHubScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isPeeking } = useQuickPeek();
  const [activeSegment, setActiveSegment] = useState<'articles' | 'workflows' | 'materials'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [workflows, setWorkflows] = useState<SharedWorkflow[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getArticlePeekItem = (art: Article): QuickPeekItem => ({
    id: art.id,
    title: art.title,
    content: art.summary || art.content,
    authorName: art.author.fullName,
    authorAvatar: art.author.avatarUrl,
    authorCampus: 'FPTU',
    authorRole: art.author.role,
    createdAt: `${art.readTimeMinutes} phút đọc`,
    courseCode: art.category,
    score: art.likesCount,
    tags: art.tags,
    type: 'article',
    featuredComments: [
      {
        id: `comm-${art.id}`,
        authorName: 'Đặng Tuấn Kiệt',
        authorRole: 'Student',
        content: 'Bài viết chia sẻ rất chi tiết và dễ áp dụng vào đồ án thực tế.',
        upvotes: 38,
        isAccepted: true,
        createdAt: '2 ngày trước',
      },
    ],
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeSegment === 'articles') {
        const res = await contentApi.getArticles();
        setArticles(res);
      } else if (activeSegment === 'workflows') {
        const res = await contentApi.getWorkflows();
        setWorkflows(res);
      } else {
        const res = await contentApi.getMaterials();
        setMaterials(res);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSegment]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Kho Tài Nguyên"
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      {/* Segment Switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => setActiveSegment('articles')}
          style={[styles.segmentBtn, activeSegment === 'articles' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeSegment === 'articles' && styles.segmentTextActive]}>
            Bài viết ({articles.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment('workflows')}
          style={[styles.segmentBtn, activeSegment === 'workflows' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeSegment === 'workflows' && styles.segmentTextActive]}>
            Workflows ({workflows.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment('materials')}
          style={[styles.segmentBtn, activeSegment === 'materials' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeSegment === 'materials' && styles.segmentTextActive]}>
            Tài liệu ({materials.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          {activeSegment === 'articles' && (
            <FlatList
              scrollEnabled={!isPeeking}
              data={articles}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              renderItem={({ item }) => (
                <PeekableCard
                  item={getArticlePeekItem(item)}
                  onPress={() => navigation.navigate('ArticleDetail', { id: item.id })}
                  onOpenDetail={(it) => navigation.navigate('ArticleDetail', { id: it.id })}
                  style={styles.card}
                >
                  <View style={styles.articleRow}>
                    {item.coverImage && (
                      <Image source={{ uri: item.coverImage }} style={styles.articleImage} />
                    )}
                    <View style={styles.articleBody}>
                      <Badge label={item.category} variant="primary" size="sm" />
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemSnippet} numberOfLines={2}>
                        {item.summary}
                      </Text>
                      <View style={styles.articleFooter}>
                        <Text style={styles.metaText}>{item.readTimeMinutes} phút đọc • {item.createdAt}</Text>
                        <View style={styles.likesRow}>
                          <Feather name="heart" size={13} color={Colors.danger} />
                          <Text style={styles.likesText}>{item.likesCount}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </PeekableCard>
              )}
            />
          )}

          {activeSegment === 'workflows' && (
            <FlatList
              data={workflows}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              renderItem={({ item }) => (
                <Card
                  onPress={() => navigation.navigate('WorkflowDetail', { id: item.id })}
                  style={styles.card}
                >
                  <View style={styles.wfHeader}>
                    <Badge label={item.courseCode} variant="purple" size="sm" />
                    <Badge label={item.technology} variant="neutral" size="sm" />
                    <View style={styles.stepsBadge}>
                      <Feather name="layers" size={12} color={Colors.purple} />
                      <Text style={styles.stepsText}>{item.steps.length} bước</Text>
                    </View>
                  </View>

                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSnippet} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.metaText}>Đăng bởi {item.author.fullName}</Text>
                    <View style={styles.usageChip}>
                      <Feather name="check-circle" size={12} color={Colors.success} />
                      <Text style={styles.usageText}>{item.usageCount} áp dụng</Text>
                    </View>
                  </View>
                </Card>
              )}
            />
          )}

          {activeSegment === 'materials' && (
            <FlatList
              data={materials}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <View style={styles.matHeader}>
                    <Badge label={item.fileType} variant="primary" size="sm" />
                    {item.fileSizeMb && <Text style={styles.matSize}>{item.fileSizeMb} MB</Text>}
                  </View>

                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSnippet} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.metaText}>
                      {item.downloadsCount} lượt tải • Kỳ {item.semesterUploaded}
                    </Text>
                    <TouchableOpacity style={styles.downloadBtn}>
                      <Feather name="download" size={14} color={Colors.primary} />
                      <Text style={styles.downloadBtnText}>Tải về</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(226, 232, 240, 0.7)',
    borderRadius: BorderRadius.pill,
    margin: Spacing.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: BorderRadius.pill,
  },
  segmentBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  articleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  articleImage: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#E2E8F0',
  },
  articleBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    marginVertical: 4,
  },
  itemSnippet: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: FontSize.caption,
    color: Colors.danger,
    fontWeight: '700',
  },
  wfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  stepsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  stepsText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.purple,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  usageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  usageText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.success,
  },
  matHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  matSize: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  downloadBtnText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
});
