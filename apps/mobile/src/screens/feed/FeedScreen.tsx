import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Share,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { VoteControl } from '../../components/common/VoteControl';
import { ScalePressable } from '../../components/common/ScalePressable';
import { PeekableCard } from '../../components/common/PeekableCard';
import { useQuickPeek, QuickPeekItem } from '../../context/QuickPeekContext';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { mockQuestions, mockWorkflows, mockArticles, mockCampuses } from '../../services/mockData';
import { QuestionPost } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, currentCampus } = useAuth();
  const { isPeeking } = useQuickPeek();
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.35, duration: 750, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const campusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  // Live vote state for questions in feed
  const [questions, setQuestions] = useState<QuestionPost[]>(mockQuestions);

  const getQuestionPeekItem = (q: QuestionPost): QuickPeekItem => {
    const featured =
      q.answers?.find((a) => a.isAccepted) ||
      (q.answers && q.answers.length > 0 ? q.answers[0] : null);

    return {
      id: q.id,
      title: q.title,
      content: q.content,
      authorName: q.author.fullName,
      authorAvatar: q.author.avatarUrl,
      authorCampus: q.author.campus || campusObj.code,
      authorRole: q.author.role,
      createdAt: q.createdAt,
      courseCode: q.courseCode,
      score: q.upvotes,
      tags: q.tags,
      type: 'question',
      isSolved: q.isSolved,
      isModVerified: q.isModVerified,
      featuredComments: featured
        ? [
            {
              id: featured.id,
              authorName: featured.author.fullName,
              authorAvatar: featured.author.avatarUrl,
              authorRole: featured.author.role,
              content: featured.content,
              upvotes: featured.upvotes,
              isAccepted: featured.isAccepted,
              createdAt: featured.createdAt,
            },
          ]
        : undefined,
    };
  };

  const getArticlePeekItem = (art: any): QuickPeekItem => {
    return {
      id: art.id,
      title: art.title,
      content:
        art.summary ||
        art.content ||
        'Bài viết chia sẻ kiến thức chuyên sâu và kinh nghiệm thực chiến từ cộng đồng FHub.',
      authorName: art.author?.fullName || 'FHub Community',
      authorAvatar: art.author?.avatarUrl,
      authorCampus: campusObj.code,
      createdAt: `${art.readTimeMinutes || 5} phút đọc`,
      courseCode: art.category,
      score: art.likesCount,
      tags: art.tags || [art.category],
      type: 'article',
      featuredComments: [
        {
          id: `comm-${art.id}`,
          authorName: 'Đặng Tuấn Kiệt',
          authorRole: 'Student',
          content:
            'Bài viết đúc kết rất thực tế! Phần cấu hình distroless container đã giúp giảm dung lượng image và tăng tốc CI/CD đáng kể.',
          upvotes: 42,
          isAccepted: true,
          createdAt: '1 ngày trước',
        },
      ],
    };
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const handleVote = (id: string, dir: 'UP' | 'DOWN') => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const currentVote = q.userVote;
        let newVote: 'UP' | 'DOWN' | null = dir;
        let newScore = q.upvotes;

        if (currentVote === dir) {
          newVote = null;
          newScore += dir === 'UP' ? -1 : 1;
        } else if (currentVote === null) {
          newScore += dir === 'UP' ? 1 : -1;
        } else {
          newScore += dir === 'UP' ? 2 : -2;
        }

        return { ...q, upvotes: newScore, userVote: newVote };
      })
    );
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `Xem thảo luận FHub: "${title}" trên ứng dụng FHub Sinh Viên!`,
      });
    } catch (e) {
      // Ignore
    }
  };

  // Modern Social Action Highlights (Story / Feature Hub)
  const socialActions = [
    {
      id: 'ask',
      title: 'Hỏi đáp',
      icon: 'message-circle',
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: () => navigation.navigate('AskQuestion'),
    },
    {
      id: 'courses',
      title: 'Môn học',
      icon: 'book-open',
      color: '#2563EB',
      bg: '#EFF6FF',
      onPress: () => navigation.navigate('Main', { screen: 'CoursesTab' }),
    },
    {
      id: 'workflow',
      title: 'Workflow',
      icon: 'git-pull-request',
      color: '#7C3AED',
      bg: '#F5F3FF',
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'article',
      title: 'Bài viết',
      icon: 'edit-3',
      color: '#059669',
      bg: '#ECFDF5',
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'eval',
      title: 'Đánh giá',
      icon: 'star',
      color: '#D97706',
      bg: '#FFFBEB',
      onPress: () => navigation.navigate('Main', { screen: 'CoursesTab' }),
    },
    {
      id: 'material',
      title: 'Tài liệu',
      icon: 'folder',
      color: '#0891B2',
      bg: '#ECFEFF',
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'tickets',
      title: 'Vé hỗ trợ',
      icon: 'life-buoy',
      color: '#DB2777',
      bg: '#FDF2F8',
      onPress: () => navigation.navigate('CreateTicket'),
    },
    {
      id: 'bookmarks',
      title: 'Đã lưu',
      icon: 'bookmark',
      color: '#4F46E5',
      bg: '#EEF2FF',
      onPress: () => navigation.navigate('Bookmarks'),
    },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onSearchPress={() => navigation.navigate('Main', { screen: 'CoursesTab' })}
      />

      <ScrollView
        scrollEnabled={!isPeeking}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 1. Modern Social Greeting & Status Pill */}
        <View style={styles.greetingHeader}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingTime}>Học kỳ Spring 2025</Text>
            <Text style={styles.greetingName}>
              Chào {currentUser?.fullName?.split(' ').pop() || 'bạn'} 👋
            </Text>
          </View>
          <View style={styles.campusPill}>
            <Animated.View style={[styles.onlineDot, { transform: [{ scale: dotPulse }] }]} />
            <Text style={styles.campusPillText}>{campusObj.code}</Text>
          </View>
        </View>

        {/* 2. Social Composer Card ("What's on your mind?") */}
        <ScalePressable
          scaleTo={0.97}
          onPress={() => navigation.navigate('AskQuestion')}
          style={styles.composerCard}
        >
          <View style={styles.composerHeader}>
            <View style={styles.composerAvatar}>
              <Text style={styles.composerAvatarText}>
                {(currentUser?.fullName || 'ME').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.composerInputBox}>
              <Text style={styles.composerPlaceholder}>
                Bạn có thắc mắc môn học hôm nay?...
              </Text>
            </View>
          </View>

          <View style={styles.composerActionsRow}>
            <View style={styles.composerQuickBtn}>
              <Feather name="help-circle" size={14} color={Colors.primary} />
              <Text style={styles.composerQuickText}>Đặt câu hỏi</Text>
            </View>
            <View style={styles.composerDivider} />
            <TouchableOpacity
              onPress={() => navigation.navigate('Main', { screen: 'ResourcesTab' })}
              style={styles.composerQuickBtn}
            >
              <Feather name="code" size={14} color={Colors.purple} />
              <Text style={styles.composerQuickText}>Chia sẻ Lab</Text>
            </TouchableOpacity>
            <View style={styles.composerDivider} />
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateTicket')}
              style={styles.composerQuickBtn}
            >
              <Feather name="life-buoy" size={14} color="#DB2777" />
              <Text style={styles.composerQuickText}>Trợ giúp</Text>
            </TouchableOpacity>
          </View>
        </ScalePressable>

        {/* 3. Modern Horizontal Quick Action Stories / Highlights */}
        <View style={styles.storiesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesScroll}
          >
            {socialActions.map((action) => (
              <ScalePressable
                key={action.id}
                scaleTo={0.92}
                onPress={action.onPress}
                style={styles.storyItem}
              >
                <View style={[styles.storyRing, { backgroundColor: action.bg }]}>
                  <Feather name={action.icon as any} size={18} color={action.color} />
                </View>
                <Text style={styles.storyTitle} numberOfLines={1}>
                  {action.title}
                </Text>
              </ScalePressable>
            ))}
          </ScrollView>
        </View>

        {/* 4. Social Feed Header: Community Q&A Discussions */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeaderTitle}>Thảo luận mới nhất</Text>
            <Text style={styles.sectionHeaderSub}>Từ cộng đồng sinh viên FPT</Text>
          </View>
          <ScalePressable
            scaleTo={0.95}
            onPress={() => navigation.navigate('Main', { screen: 'DiscussionsTab' })}
            style={styles.seeAllPill}
          >
            <Text style={styles.seeAllPillText}>Xem tất cả</Text>
            <Feather name="chevron-right" size={14} color={Colors.primary} />
          </ScalePressable>
        </View>

        {/* 5. Modern Social Posts */}
        {questions.slice(0, 3).map((q) => {
          const isSaved = bookmarkedIds.has(q.id);
          const authorInitials = q.author.fullName.slice(0, 2).toUpperCase();

          return (
            <PeekableCard
              key={q.id}
              item={getQuestionPeekItem(q)}
              onPress={() => navigation.navigate('QuestionDetail', { id: q.id })}
              onVote={(id, dir) => handleVote(id, dir)}
              onOpenDetail={(item) => navigation.navigate('QuestionDetail', { id: item.id })}
              style={styles.socialPostCard}
            >
              {/* Post Header: Avatar, Author, Badge, Save */}
              <View style={styles.postHeader}>
                <View style={styles.postAuthorGroup}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.postAvatarText}>{authorInitials}</Text>
                  </View>
                  <View style={styles.postAuthorMeta}>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.postAuthorName} numberOfLines={1}>
                        {q.author.fullName}
                      </Text>
                      {q.isModVerified && (
                        <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                      )}
                    </View>
                    <Text style={styles.postTimeText}>
                      {q.author.campus || campusObj.code} • {q.createdAt}
                    </Text>
                  </View>
                </View>

                <View style={styles.postHeaderRight}>
                  {q.courseCode && (
                    <View style={styles.courseTagPill}>
                      <Text style={styles.courseTagText}>{q.courseCode}</Text>
                    </View>
                  )}
                  <ScalePressable
                    scaleTo={0.85}
                    onPress={() => toggleBookmark(q.id)}
                    style={styles.saveIconButton}
                  >
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={isSaved ? Colors.primary : Colors.textMuted}
                    />
                  </ScalePressable>
                </View>
              </View>

              {/* Post Body: Title & Content */}
              <Text style={styles.postTitle} numberOfLines={2}>
                {q.title}
              </Text>
              <Text style={styles.postContent} numberOfLines={3}>
                {q.content}
              </Text>

              {/* Hashtags / Badges */}
              <View style={styles.postTagsRow}>
                {q.tags.slice(0, 3).map((t) => (
                  <View key={t} style={styles.socialHashTag}>
                    <Text style={styles.socialHashTagText}>#{t}</Text>
                  </View>
                ))}
                {q.isSolved && (
                  <View style={styles.solvedPill}>
                    <Feather name="check" size={11} color={Colors.success} />
                    <Text style={styles.solvedPillText}>Đã giải quyết</Text>
                  </View>
                )}
              </View>

              {/* Social Interaction Bar */}
              <View style={styles.socialActionFooter}>
                {/* Horizontal Vote Pill */}
                <View style={styles.votePill}>
                  <TouchableOpacity
                    onPress={() => handleVote(q.id, 'UP')}
                    style={[styles.voteArrowBtn, q.userVote === 'UP' && styles.voteArrowUpActive]}
                  >
                    <Feather
                      name="arrow-up"
                      size={15}
                      color={q.userVote === 'UP' ? Colors.primary : Colors.textMuted}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.voteScoreNumber,
                      q.userVote === 'UP' && { color: Colors.primary },
                      q.userVote === 'DOWN' && { color: Colors.danger },
                    ]}
                  >
                    {q.upvotes}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleVote(q.id, 'DOWN')}
                    style={[styles.voteArrowBtn, q.userVote === 'DOWN' && styles.voteArrowDownActive]}
                  >
                    <Feather
                      name="arrow-down"
                      size={15}
                      color={q.userVote === 'DOWN' ? Colors.danger : Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                {/* Comments Counter */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('QuestionDetail', { id: q.id })}
                  style={styles.socialMetaBtn}
                >
                  <Feather name="message-circle" size={15} color={Colors.textSecondary} />
                  <Text style={styles.socialMetaText}>{q.answersCount} trả lời</Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity
                  onPress={() => handleShare(q.title)}
                  style={styles.socialMetaBtn}
                >
                  <Feather name="share-2" size={14} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </PeekableCard>
          );
        })}

        {/* 6. Shared Workflows Teaser */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeaderTitle}>Quy trình & Đồ án mẫu</Text>
            <Text style={styles.sectionHeaderSub}>Các bước thực hành lab & project môn học</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'ResourcesTab' })}
            style={styles.seeAllPill}
          >
            <Text style={styles.seeAllPillText}>Xem thêm</Text>
            <Feather name="chevron-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {mockWorkflows.slice(0, 2).map((wf) => (
          <Card
            key={wf.id}
            onPress={() => navigation.navigate('WorkflowDetail', { id: wf.id })}
            style={styles.workflowCard}
          >
            <View style={styles.wfHeaderRow}>
              <View style={styles.wfBadgeRow}>
                <View style={styles.wfCourseTag}>
                  <Text style={styles.wfCourseText}>{wf.courseCode}</Text>
                </View>
                <Badge label={wf.technology} variant="neutral" size="sm" />
              </View>
              <View style={styles.wfStepsCount}>
                <Feather name="layers" size={12} color={Colors.purple} />
                <Text style={styles.wfStepsText}>{wf.steps.length} bước</Text>
              </View>
            </View>

            <Text style={styles.wfTitle} numberOfLines={2}>
              {wf.title}
            </Text>
            <Text style={styles.wfDescription} numberOfLines={2}>
              {wf.description}
            </Text>

            <View style={styles.wfFooterRow}>
              <Text style={styles.wfAuthorText}>Đăng bởi {wf.author.fullName}</Text>
              <View style={styles.wfUsageBadge}>
                <Feather name="check-circle" size={12} color={Colors.success} />
                <Text style={styles.wfUsageText}>{wf.usageCount} áp dụng</Text>
              </View>
            </View>
          </Card>
        ))}

        {/* 7. Tech Articles Teaser */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeaderTitle}>Bài viết công nghệ</Text>
            <Text style={styles.sectionHeaderSub}>Kinh nghiệm thực chiến & kiến thức IT</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'ResourcesTab' })}
            style={styles.seeAllPill}
          >
            <Text style={styles.seeAllPillText}>Xem tất cả</Text>
            <Feather name="chevron-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {mockArticles.slice(0, 2).map((art) => (
          <PeekableCard
            key={art.id}
            item={getArticlePeekItem(art)}
            onPress={() => navigation.navigate('ArticleDetail', { id: art.id })}
            onOpenDetail={(item) => navigation.navigate('ArticleDetail', { id: item.id })}
            style={styles.articleCard}
          >
            <View style={styles.articleRow}>
              {art.coverImage && (
                <Image source={{ uri: art.coverImage }} style={styles.articleThumb} />
              )}
              <View style={styles.articleBody}>
                <Badge label={art.category} variant="primary" size="sm" />
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {art.title}
                </Text>
                <View style={styles.articleFooter}>
                  <Text style={styles.articleReadTime}>{art.readTimeMinutes} phút đọc</Text>
                  <View style={styles.articleLikes}>
                    <Feather name="heart" size={12} color={Colors.danger} />
                    <Text style={styles.articleLikeText}>{art.likesCount}</Text>
                  </View>
                </View>
              </View>
            </View>
          </PeekableCard>
        ))}

        {/* 8. Helpdesk Support Banner */}
        <ScalePressable
          scaleTo={0.96}
          onPress={() => navigation.navigate('SupportTickets')}
          style={styles.supportBanner}
        >
          <View style={styles.supportIconWrap}>
            <Feather name="life-buoy" size={20} color={Colors.primary} />
          </View>
          <View style={styles.supportTextWrap}>
            <Text style={styles.supportTitle}>Cần hỗ trợ học vụ hoặc đồ án?</Text>
            <Text style={styles.supportSub}>Gửi vé yêu cầu để ban học vụ giải đáp nhanh nhất.</Text>
          </View>
          <Feather name="arrow-right" size={18} color={Colors.primary} />
        </ScalePressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 90,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: 2,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingTime: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingName: {
    fontSize: FontSize.titleLg,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  campusPillText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  // Social Composer
  composerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  composerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerAvatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  composerInputBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.pill,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  composerPlaceholder: {
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  composerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  composerQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  composerQuickText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  composerDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
  },
  // Modern Horizontal Stories
  storiesContainer: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.md,
  },
  storiesScroll: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 62,
  },
  storyRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  storyTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  sectionHeaderSub: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  seeAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    gap: 2,
  },
  seeAllPillText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.primary,
  },
  // Social Post Card
  socialPostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAuthorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  postAuthorMeta: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postAuthorName: {
    fontSize: FontSize.bodySm,
    fontWeight: '800',
    color: Colors.text,
  },
  postTimeText: {
    fontSize: FontSize.micro,
    color: Colors.textMuted,
    marginTop: 1,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseTagPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  courseTagText: {
    fontSize: FontSize.micro,
    fontWeight: '800',
    color: Colors.primary,
  },
  saveIconButton: {
    padding: 3,
  },
  postTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 21,
    marginBottom: 4,
  },
  postContent: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  postTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  socialHashTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  socialHashTagText: {
    fontSize: FontSize.micro,
    color: '#475569',
    fontWeight: '600',
  },
  solvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    gap: 3,
  },
  solvedPillText: {
    fontSize: FontSize.micro,
    color: Colors.success,
    fontWeight: '700',
  },
  // Social Action Footer
  socialActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  votePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 6,
  },
  voteArrowBtn: {
    padding: 2,
    borderRadius: BorderRadius.pill,
  },
  voteArrowUpActive: {
    backgroundColor: Colors.primaryLight,
  },
  voteArrowDownActive: {
    backgroundColor: Colors.dangerLight,
  },
  voteScoreNumber: {
    fontSize: FontSize.bodySm,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 16,
    textAlign: 'center',
  },
  socialMetaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  socialMetaText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  // Workflows
  workflowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  wfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  wfBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wfCourseTag: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  wfCourseText: {
    fontSize: FontSize.micro,
    fontWeight: '800',
    color: Colors.purple,
  },
  wfStepsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  wfStepsText: {
    fontSize: FontSize.caption,
    color: Colors.purple,
    fontWeight: '700',
  },
  wfTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  wfDescription: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  wfFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  wfAuthorText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  wfUsageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wfUsageText: {
    fontSize: FontSize.caption,
    color: Colors.success,
    fontWeight: '700',
  },
  // Articles
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  articleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  articleThumb: {
    width: 78,
    height: 78,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#E2E8F0',
  },
  articleBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.text,
    marginVertical: 4,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleReadTime: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  articleLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleLikeText: {
    fontSize: FontSize.caption,
    color: Colors.danger,
    fontWeight: '700',
  },
  // Support Banner
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#D8E6F8',
    marginTop: Spacing.xs,
    gap: Spacing.md,
  },
  supportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTextWrap: {
    flex: 1,
  },
  supportTitle: {
    fontSize: FontSize.bodySm,
    fontWeight: '800',
    color: Colors.text,
  },
  supportSub: {
    fontSize: FontSize.micro,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
});
