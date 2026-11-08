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
  ScrollView,
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
import { BorderRadius, FontSize, Spacing, CommonStyles } from '../../constants/theme';
import { contentApi } from '../../services/api/contentApi';
import { mockCourseReviews } from '../../services/mockData';
import { Article, SharedWorkflow, StudyMaterial, CourseReview } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ResourceSegment = 'articles' | 'workflows' | 'materials' | 'reviews';

export const ResourcesHubScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isPeeking } = useQuickPeek();
  const [activeSegment, setActiveSegment] = useState<ResourceSegment>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [workflows, setWorkflows] = useState<SharedWorkflow[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>(mockCourseReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});

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
      } else if (activeSegment === 'materials') {
        const res = await contentApi.getMaterials();
        setMaterials(res);
      } else {
        setReviews(mockCourseReviews);
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

  const toggleHelpfulReview = (revId: string) => {
    setHelpfulMap((prev) => {
      const isCurrently = !!prev[revId];
      const updated = { ...prev, [revId]: !isCurrently };
      setReviews((rList) =>
        rList.map((r) =>
          r.id === revId
            ? { ...r, helpfulCount: r.helpfulCount + (isCurrently ? -1 : 1) }
            : r
        )
      );
      return updated;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color={star <= rating ? '#F59E0B' : '#CBD5E1'}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Kho Tài Nguyên"
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      {/* 4-in-1 Segment Switcher (Web FE Aligned) */}
      <View style={styles.segmentContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentScroll}>
          <TouchableOpacity
            onPress={() => setActiveSegment('articles')}
            style={[styles.segmentBtn, activeSegment === 'articles' && styles.segmentBtnActive]}
          >
            <View style={[styles.segmentDot, { backgroundColor: Colors.moduleArticles }]} />
            <Text style={[styles.segmentText, activeSegment === 'articles' && styles.segmentTextActive]}>
              Bài viết ({articles.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSegment('workflows')}
            style={[styles.segmentBtn, activeSegment === 'workflows' && styles.segmentBtnActive]}
          >
            <View style={[styles.segmentDot, { backgroundColor: Colors.moduleWorkflows }]} />
            <Text style={[styles.segmentText, activeSegment === 'workflows' && styles.segmentTextActive]}>
              Workflows ({workflows.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSegment('materials')}
            style={[styles.segmentBtn, activeSegment === 'materials' && styles.segmentBtnActive]}
          >
            <View style={[styles.segmentDot, { backgroundColor: Colors.moduleMaterials }]} />
            <Text style={[styles.segmentText, activeSegment === 'materials' && styles.segmentTextActive]}>
              Tài liệu ({materials.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSegment('reviews')}
            style={[styles.segmentBtn, activeSegment === 'reviews' && styles.segmentBtnActive]}
          >
            <View style={[styles.segmentDot, { backgroundColor: Colors.moduleRatings }]} />
            <Text style={[styles.segmentText, activeSegment === 'reviews' && styles.segmentTextActive]}>
              Đánh giá ({reviews.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
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

          {activeSegment === 'reviews' && (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              renderItem={({ item }) => {
                const isHelpful = !!helpfulMap[item.id];
                return (
                  <Card style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewCourseRow}>
                        <View style={styles.reviewCourseTag}>
                          <Text style={styles.reviewCourseText}>{item.courseCode}</Text>
                        </View>
                        {renderStars(item.rating)}
                        <Text style={styles.reviewScoreText}>({item.rating}/5)</Text>
                      </View>
                      <Text style={styles.reviewDateText}>{item.createdAt}</Text>
                    </View>

                    {/* Author & Semester */}
                    <View style={styles.reviewAuthorRow}>
                      <Text style={styles.reviewAuthorName}>{item.author.fullName}</Text>
                      <Text style={styles.bulletSep}>•</Text>
                      <Text style={styles.reviewSemesterText}>Đã học: {item.semesterTaken}</Text>
                    </View>

                    {/* Workload & Practicality Badges */}
                    <View style={styles.reviewMetricsRow}>
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricLabel}>Khối lượng:</Text>
                        <Text style={styles.metricVal}>
                          {item.workload >= 4 ? 'Nặng 🔥' : item.workload === 3 ? 'Vừa phải' : 'Nhẹ nhàng'}
                        </Text>
                      </View>
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricLabel}>Tính thực tiễn:</Text>
                        <Text style={styles.metricVal}>
                          {item.practicality >= 4 ? 'Cao ⭐' : 'Trung bình'}
                        </Text>
                      </View>
                    </View>

                    {/* Comment */}
                    <Text style={styles.reviewComment}>{item.comment}</Text>

                    {/* Tips Box */}
                    {item.tips && (
                      <View style={styles.tipsBox}>
                        <Feather name="zap" size={13} color="#D97706" />
                        <Text style={styles.tipsText}>
                          <Text style={{ fontWeight: '800' }}>Tips qua môn: </Text>
                          {item.tips}
                        </Text>
                      </View>
                    )}

                    {/* Helpful Button */}
                    <View style={styles.reviewFooter}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleHelpfulReview(item.id)}
                        style={[styles.helpfulBtn, isHelpful && styles.helpfulBtnActive]}
                      >
                        <Feather
                          name="thumbs-up"
                          size={13}
                          color={isHelpful ? Colors.primary : Colors.textSecondary}
                        />
                        <Text style={[styles.helpfulBtnText, isHelpful && styles.helpfulBtnTextActive]}>
                          Hữu ích ({item.helpfulCount})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              }}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: Spacing.xs,
  },
  segmentScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  segmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  segmentText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: '#64748B',
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  card: {
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...CommonStyles.cardShadow,
  },
  articleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
  },
  articleBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  itemSnippet: {
    fontSize: FontSize.caption,
    color: '#64748B',
    lineHeight: 17,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaText: {
    fontSize: FontSize.caption,
    color: '#94A3B8',
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
    gap: Spacing.xs,
  },
  stepsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  stepsText: {
    fontSize: FontSize.caption,
    color: Colors.purple,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matSize: {
    fontSize: FontSize.caption,
    color: '#94A3B8',
    fontWeight: '600',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  downloadBtnText: {
    fontSize: FontSize.caption,
    color: Colors.primary,
    fontWeight: '800',
  },

  // Course Review Card Styles
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.xs,
    ...CommonStyles.cardShadow,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewCourseTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  reviewCourseText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.primary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  reviewDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewAuthorName: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: '#0F172A',
  },
  bulletSep: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  reviewSemesterText: {
    fontSize: 11,
    color: '#64748B',
  },
  reviewMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  metricVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewComment: {
    fontSize: FontSize.bodySm,
    color: '#334155',
    lineHeight: 19,
    marginTop: 2,
  },
  tipsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
    marginTop: 2,
  },
  tipsText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  helpfulBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  helpfulBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  helpfulBtnTextActive: {
    color: Colors.primary,
  },
});
