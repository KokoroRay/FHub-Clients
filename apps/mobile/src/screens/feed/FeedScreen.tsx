import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { VoteControl } from '../../components/common/VoteControl';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { mockQuestions, mockWorkflows, mockArticles, mockMaterials, mockCampuses } from '../../services/mockData';
import { QuestionPost } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, currentCampus } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const campusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  // Live vote state for questions in feed
  const [questions, setQuestions] = useState<QuestionPost[]>(mockQuestions);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
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

  // 8 Quick Actions (matching Web Figma #86:137)
  const quickActions = [
    {
      id: 'ask',
      title: 'Đặt câu hỏi',
      icon: 'help-circle',
      color: '#3B82F6',
      bg: '#EFF6FF',
      onPress: () => navigation.navigate('AskQuestion'),
    },
    {
      id: 'workflow',
      title: 'Workflow mới',
      icon: 'code',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'article',
      title: 'Viết bài viết',
      icon: 'file-text',
      color: '#10B981',
      bg: '#ECFDF5',
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'eval',
      title: 'Đánh giá môn',
      icon: 'star',
      color: '#F59E0B',
      bg: '#FFFBEB',
      onPress: () => navigation.navigate('Main', { screen: 'CoursesTab' }),
    },
    {
      id: 'material',
      title: 'Tải tài liệu',
      icon: 'upload',
      color: '#06B6D4',
      bg: '#ECFEFF',
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'tickets',
      title: 'Tạo vé hỗ trợ',
      icon: 'life-buoy',
      color: '#EC4899',
      bg: '#FDF2F8',
      onPress: () => navigation.navigate('CreateTicket'),
    },
    {
      id: 'bookmarks',
      title: 'Đã lưu',
      icon: 'bookmark',
      color: '#6366F1',
      bg: '#EEF2FF',
      onPress: () => navigation.navigate('Bookmarks'),
    },
    {
      id: 'courses',
      title: 'Course Hub',
      icon: 'book-open',
      color: Colors.primary,
      bg: Colors.primaryLight,
      onPress: () => navigation.navigate('Main', { screen: 'CoursesTab' }),
    },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onSearchPress={() => navigation.navigate('Main', { screen: 'CoursesTab' })}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 3.A Welcome Card (Figma #86:118) */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View style={styles.termBadge}>
              <View style={styles.termDot} />
              <Text style={styles.termText}>Spring 2025 • {campusObj.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Main', { screen: 'ProfileTab' })}
              style={styles.karmaBadge}
            >
              <Feather name="award" size={13} color={Colors.primary} />
              <Text style={styles.karmaText}>{currentUser?.karma.toLocaleString()} pts</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.welcomeTitle}>
            Chào mừng trở lại, {currentUser?.fullName || 'Sinh viên FPT'}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Học tập, chia sẻ kiến thức và thảo luận cùng cộng đồng FHub.
          </Text>
        </View>

        {/* 3.B Quick Actions Grid (Figma #86:137) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tác vụ nhanh</Text>
          <Text style={styles.sectionHint}>8 hành động phổ biến</Text>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.7}
              onPress={action.onPress}
              style={styles.quickActionItem}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: action.bg }]}>
                <Feather name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text style={styles.quickActionText} numberOfLines={1}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3.C Top Discussions (Primary Feed Section - Figma #86:196) */}
        <View style={styles.sectionHeaderWithAction}>
          <View>
            <Text style={styles.sectionTitle}>Hỏi đáp & Thảo luận sôi nổi</Text>
            <Text style={styles.sectionSubtitle}>Các câu hỏi được sinh viên quan tâm nhất</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'DiscussionsTab' })}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {questions.slice(0, 3).map((q) => (
          <Card
            key={q.id}
            onPress={() => navigation.navigate('QuestionDetail', { id: q.id })}
            style={styles.questionCard}
          >
            <View style={styles.questionRow}>
              {/* Vote Controller */}
              <View style={styles.voteCol}>
                <VoteControl
                  score={q.upvotes}
                  userVote={q.userVote}
                  onVote={(dir) => handleVote(q.id, dir)}
                />
              </View>

              {/* Question Body */}
              <View style={styles.questionBody}>
                <View style={styles.metaRow}>
                  {q.courseCode && <Badge label={q.courseCode} variant="primary" size="sm" />}
                  {q.isSolved && (
                    <Badge label="Đã giải quyết" variant="success" size="sm" />
                  )}
                  {q.isModVerified && (
                    <Badge label="Verified" variant="purple" size="sm" />
                  )}
                </View>

                <Text style={styles.questionTitle} numberOfLines={2}>
                  {q.title}
                </Text>

                <Text style={styles.questionSnippet} numberOfLines={2}>
                  {q.content}
                </Text>

                {/* Author & Stats footer */}
                <View style={styles.questionFooter}>
                  <View style={styles.authorRow}>
                    <View style={styles.authorAvatar}>
                      <Text style={styles.authorInitials}>
                        {q.author.fullName.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.authorName} numberOfLines={1}>
                      {q.author.fullName}
                    </Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Feather name="message-square" size={13} color={Colors.textMuted} />
                      <Text style={styles.statText}>{q.answersCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Feather name="eye" size={13} color={Colors.textMuted} />
                      <Text style={styles.statText}>{q.viewsCount}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}

        {/* 3.D Mid-Feed: Workflows & Articles Teaser */}
        <View style={styles.sectionHeaderWithAction}>
          <View>
            <Text style={styles.sectionTitle}>Shared Workflows nổi bật</Text>
            <Text style={styles.sectionSubtitle}>Quy trình thực hành đồ án & lab môn học</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'ResourcesTab' })}
          >
            <Text style={styles.seeAllText}>Xem thêm</Text>
          </TouchableOpacity>
        </View>

        {mockWorkflows.slice(0, 2).map((wf) => (
          <Card
            key={wf.id}
            onPress={() => navigation.navigate('WorkflowDetail', { id: wf.id })}
            style={styles.workflowCard}
          >
            <View style={styles.wfHeader}>
              <View style={styles.wfMetaRow}>
                <Badge label={wf.courseCode} variant="purple" size="sm" />
                <Badge label={wf.technology} variant="neutral" size="sm" />
              </View>
              <View style={styles.wfStepsCount}>
                <Feather name="layers" size={13} color={Colors.purple} />
                <Text style={styles.wfStepsText}>{wf.steps.length} bước</Text>
              </View>
            </View>

            <Text style={styles.wfTitle} numberOfLines={2}>
              {wf.title}
            </Text>
            <Text style={styles.wfDescription} numberOfLines={2}>
              {wf.description}
            </Text>

            <View style={styles.wfFooter}>
              <Text style={styles.wfAuthor}>Bởi {wf.author.fullName}</Text>
              <View style={styles.wfStats}>
                <Feather name="check-circle" size={13} color={Colors.success} />
                <Text style={styles.wfUsageText}>{wf.usageCount} áp dụng</Text>
              </View>
            </View>
          </Card>
        ))}

        {/* 3.E Recent Tech Articles */}
        <View style={styles.sectionHeaderWithAction}>
          <View>
            <Text style={styles.sectionTitle}>Bài viết công nghệ</Text>
            <Text style={styles.sectionSubtitle}>Kiến thức chuyên sâu từ giảng viên & sinh viên</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'ResourcesTab' })}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {mockArticles.slice(0, 2).map((art) => (
          <Card
            key={art.id}
            onPress={() => navigation.navigate('ArticleDetail', { id: art.id })}
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
          </Card>
        ))}

        {/* Support Helpdesk Shortcut */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SupportTickets')}
          style={styles.supportBanner}
        >
          <View style={styles.supportIconCircle}>
            <Feather name="life-buoy" size={24} color="#FFF" />
          </View>
          <View style={styles.supportTextCol}>
            <Text style={styles.supportTitle}>Cần hỗ trợ học vụ hoặc kỹ thuật?</Text>
            <Text style={styles.supportSub}>Gửi vé yêu cầu để cán bộ nhà trường hỗ trợ bạn nhanh chóng.</Text>
          </View>
          <Feather name="arrow-right" size={20} color={Colors.primary} />
        </TouchableOpacity>
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
    padding: Spacing.md,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#DCE8F6',
    marginBottom: Spacing.lg,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  termBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  termDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  termText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  karmaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  karmaText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.primary,
  },
  welcomeTitle: {
    fontSize: FontSize.titleLg,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionHint: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  sectionSubtitle: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  seeAllText: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.primary,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  quickActionItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  questionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  questionRow: {
    flexDirection: 'row',
  },
  voteCol: {
    marginRight: Spacing.md,
  },
  questionBody: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  questionTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  questionSnippet: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitials: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  authorName: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    maxWidth: 120,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  workflowCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  wfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  wfMetaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  wfStepsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  wfFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
  },
  wfAuthor: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  wfStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wfUsageText: {
    fontSize: FontSize.caption,
    color: Colors.success,
    fontWeight: '700',
  },
  articleCard: {
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  articleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  articleThumb: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
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
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  supportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTextCol: {
    flex: 1,
  },
  supportTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.text,
  },
  supportSub: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
