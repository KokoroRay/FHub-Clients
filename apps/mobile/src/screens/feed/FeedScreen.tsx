import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ScalePressable } from '../../components/common/ScalePressable';
import { PeekableCard } from '../../components/common/PeekableCard';
import { useQuickPeek, QuickPeekItem } from '../../context/QuickPeekContext';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing, CommonStyles } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { mockQuestions, mockWorkflows, mockArticles, mockCampuses } from '../../services/mockData';
import { QuestionPost } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FeedFilterType = 'interesting' | 'newest' | 'votes' | 'unanswered';

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, currentCampus } = useAuth();
  const { isPeeking } = useQuickPeek();
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FeedFilterType>('interesting');

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

  // Live questions state
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

  // Filtered & Sorted Questions matching Web FE
  const filteredQuestions = useMemo(() => {
    let list = [...questions];
    if (activeFilter === 'interesting') {
      // Dành cho bạn: priority to solved, most answers + views
      list.sort((a, b) => {
        const scoreA = (a.isSolved ? 10 : 0) + a.answersCount * 3 + a.viewsCount;
        const scoreB = (b.isSolved ? 10 : 0) + b.answersCount * 3 + b.viewsCount;
        return scoreB - scoreA;
      });
    } else if (activeFilter === 'newest') {
      // Mới nhất: reverse chronological order
      list.sort((a, b) => b.id.localeCompare(a.id));
    } else if (activeFilter === 'votes') {
      // Bình chọn nhiều: highest score
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeFilter === 'unanswered') {
      // Chưa trả lời: 0 answers
      list = list.filter((q) => q.answersCount === 0);
      if (list.length === 0) {
        list = questions.filter((q) => !q.isSolved).slice(0, 3);
      }
    }
    return list;
  }, [questions, activeFilter]);

  // 8 Core Academic Modules from Figma #86:137 (Matching Web FE Colors & Layout)
  const academicModules = [
    {
      id: 'workflows',
      title: 'Quy trình',
      icon: 'layers',
      color: Colors.moduleWorkflows,
      bg: Colors.moduleWorkflowsBg,
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'articles',
      title: 'Bài viết',
      icon: 'file-text',
      color: Colors.moduleArticles,
      bg: Colors.moduleArticlesBg,
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'materials',
      title: 'Tài liệu',
      icon: 'book-open',
      color: Colors.moduleMaterials,
      bg: Colors.moduleMaterialsBg,
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'ratings',
      title: 'Đánh giá',
      icon: 'star',
      color: Colors.moduleRatings,
      bg: Colors.moduleRatingsBg,
      onPress: () => navigation.navigate('Main', { screen: 'ResourcesTab' }),
    },
    {
      id: 'courses',
      title: 'Môn học',
      icon: 'award',
      color: Colors.moduleCourses,
      bg: Colors.moduleCoursesBg,
      onPress: () => navigation.navigate('Main', { screen: 'CoursesTab' }),
    },
    {
      id: 'discussions',
      title: 'Thảo luận',
      icon: 'help-circle',
      color: Colors.moduleDiscussions,
      bg: Colors.moduleDiscussionsBg,
      onPress: () => navigation.navigate('Main', { screen: 'DiscussionsTab' }),
    },
    {
      id: 'helpdesk',
      title: 'Hỗ trợ',
      icon: 'life-buoy',
      color: Colors.moduleHelpdesk,
      bg: Colors.moduleHelpdeskBg,
      onPress: () => navigation.navigate('SupportTickets'),
    },
    {
      id: 'reputation',
      title: 'Uy tín',
      icon: 'shield',
      color: Colors.moduleReputation,
      bg: Colors.moduleReputationBg,
      onPress: () => navigation.navigate('Main', { screen: 'ProfileTab' }),
    },
  ];

  const studentName = currentUser?.fullName || 'Bảo Nguyễn';
  const studentInitials = studentName.slice(0, 2).toUpperCase();
  const studentCode = currentUser?.studentId || 'SE172481';
  const studentMajor = currentUser?.major || 'Kỹ thuật phần mềm';
  const studentKarma = currentUser?.karma || 1250;

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
        {/* 1. Academic Profile Greeting Card (Figma #86:118) */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTopRow}>
            <View style={styles.campusTagPill}>
              <Animated.View style={[styles.campusDot, { transform: [{ scale: dotPulse }] }]} />
              <Text style={styles.campusTagText}>Campus: {campusObj.name}</Text>
            </View>
          </View>

          <Text style={styles.welcomeHeading}>Chào mừng trở lại FHub</Text>
          <Text style={styles.welcomeSubtext}>
            Học tập, cộng tác, chia sẻ kiến thức và cùng phát triển với cộng đồng học thuật FPT.
          </Text>

          {/* Student Identity Badge Row */}
          <View style={styles.studentBadgeCard}>
            <View style={styles.studentAvatarBox}>
              {currentUser?.avatarUrl ? (
                <Image source={{ uri: currentUser.avatarUrl }} style={styles.studentAvatarImg} />
              ) : (
                <Text style={styles.studentAvatarText}>{studentInitials}</Text>
              )}
            </View>

            <View style={styles.studentMetaCol}>
              <View style={styles.studentNameLine}>
                <Text style={styles.studentNameText} numberOfLines={1}>{studentName}</Text>
                <Ionicons name="checkmark-circle" size={15} color={Colors.primary} />
              </View>
              <View style={styles.studentSubInfoLine}>
                <Text style={styles.studentMajorText} numberOfLines={1}>{studentMajor}</Text>
                <Text style={styles.bulletSeparator}>•</Text>
                <Text style={styles.studentIdText}>{studentCode}</Text>
                <Text style={styles.bulletSeparator}>•</Text>
                <View style={styles.karmaBadge}>
                  <Text style={styles.karmaBadgeText}>{studentKarma} pts</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Quick Navigation Shortcuts: 8 Core Academic Modules (Figma #86:137) */}
        <View style={styles.moduleSection}>
          <View style={styles.moduleSectionHeader}>
            <Text style={styles.moduleSectionTitle}>PHÍM TẮT TRUY CẬP NHANH</Text>
            <Text style={styles.moduleSectionBadge}>8 phân hệ học tập</Text>
          </View>

          <View style={styles.moduleGrid}>
            {academicModules.map((item) => (
              <ScalePressable
                key={item.id}
                scaleTo={0.92}
                onPress={item.onPress}
                style={styles.moduleGridItem}
              >
                <View style={[styles.moduleIconBox, { backgroundColor: item.bg }]}>
                  <Feather name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.moduleTitleText} numberOfLines={1}>
                  {item.title}
                </Text>
              </ScalePressable>
            ))}
          </View>
        </View>

        {/* 3. Academic Resource Library Highlight Banner */}
        <View style={styles.libraryBannerCard}>
          <View style={styles.libraryBannerIcon}>
            <Feather name="book-open" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.libraryBannerTextCol}>
            <Text style={styles.libraryBannerTitle}>Kho lưu trữ tài liệu học tập FPT</Text>
            <Text style={styles.libraryBannerDesc}>
              Đóng góp slide, đề thi mẫu, đồ án và tài liệu học tập để tích lũy điểm uy tín và mở khóa huy hiệu.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Main', { screen: 'ResourcesTab' })}
              style={styles.libraryBannerButton}
            >
              <Text style={styles.libraryBannerButtonText}>Khám phá tài liệu</Text>
              <Feather name="arrow-right" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Questions & Academic Discussions Section */}
        <View style={styles.discussionsContainer}>
          {/* Section Header: Title & Ask Button */}
          <View style={styles.discussionsHeader}>
            <View style={styles.discussionsTitleRow}>
              <View style={styles.discussionsIconBox}>
                <Feather name="help-circle" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.discussionsTitle}>Hỏi đáp & Thảo luận</Text>
                <Text style={styles.discussionsSubtitle}>
                  Trao đổi kiến thức học thuật, đặt câu hỏi và cùng giải đáp thắc mắc.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AskQuestion')}
              style={styles.askButton}
            >
              <Feather name="plus" size={15} color="#FFFFFF" />
              <Text style={styles.askButtonText}>Đặt câu hỏi ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Pill Tabs Filter */}
          <View style={styles.filterPillsContainer}>
            <TouchableOpacity
              onPress={() => setActiveFilter('interesting')}
              style={[styles.filterPill, activeFilter === 'interesting' && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'interesting' && styles.filterPillTextActive,
                ]}
              >
                Dành cho bạn
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('newest')}
              style={[styles.filterPill, activeFilter === 'newest' && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'newest' && styles.filterPillTextActive,
                ]}
              >
                Mới nhất
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('votes')}
              style={[styles.filterPill, activeFilter === 'votes' && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'votes' && styles.filterPillTextActive,
                ]}
              >
                Bình chọn nhiều
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('unanswered')}
              style={[styles.filterPill, activeFilter === 'unanswered' && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'unanswered' && styles.filterPillTextActive,
                ]}
              >
                Chưa trả lời
              </Text>
            </TouchableOpacity>
          </View>

          {/* Question List Cards */}
          <View style={styles.questionsList}>
            {filteredQuestions.map((q) => {
              const isSaved = bookmarkedIds.has(q.id);
              const authorInitials = q.author.fullName.slice(0, 2).toUpperCase();

              return (
                <PeekableCard
                  key={q.id}
                  item={getQuestionPeekItem(q)}
                  onPress={() => navigation.navigate('QuestionDetail', { id: q.id })}
                  onVote={(id, dir) => handleVote(id, dir)}
                  onOpenDetail={(item) => navigation.navigate('QuestionDetail', { id: item.id })}
                  style={styles.questionCard}
                >
                  <View style={styles.questionInnerRow}>
                    {/* Left: Compact Upvote / Downvote Score Controller */}
                    <View style={styles.voteColumnBox}>
                      <TouchableOpacity
                        onPress={() => handleVote(q.id, 'UP')}
                        style={[styles.voteChevronBtn, q.userVote === 'UP' && styles.voteChevronActive]}
                      >
                        <Feather
                          name="chevron-up"
                          size={18}
                          color={q.userVote === 'UP' ? Colors.primary : Colors.textMuted}
                        />
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.voteScoreText,
                          q.userVote === 'UP' && { color: Colors.primary },
                          q.userVote === 'DOWN' && { color: Colors.danger },
                        ]}
                      >
                        {q.upvotes}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleVote(q.id, 'DOWN')}
                        style={[styles.voteChevronBtn, q.userVote === 'DOWN' && styles.voteChevronActive]}
                      >
                        <Feather
                          name="chevron-down"
                          size={18}
                          color={q.userVote === 'DOWN' ? Colors.danger : Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Right: Question Information */}
                    <View style={styles.questionMainCol}>
                      {/* Author Header */}
                      <View style={styles.questionAuthorRow}>
                        <View style={styles.questionAuthorLeft}>
                          <View style={styles.questionAvatar}>
                            <Text style={styles.questionAvatarText}>{authorInitials}</Text>
                          </View>
                          <View style={styles.questionAuthorMeta}>
                            <View style={styles.questionAuthorNameWrap}>
                              <Text style={styles.questionAuthorName} numberOfLines={1}>
                                {q.author.fullName}
                              </Text>
                              {q.isModVerified && (
                                <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                              )}
                            </View>
                            <Text style={styles.questionTimeText}>
                              {q.author.campus || campusObj.code} • {q.createdAt}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.questionHeaderActions}>
                          {q.courseCode && (
                            <View style={styles.courseBadgePill}>
                              <Text style={styles.courseBadgeText}>{q.courseCode}</Text>
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => toggleBookmark(q.id)}
                            style={styles.bookmarkIconButton}
                          >
                            <Ionicons
                              name={isSaved ? 'bookmark' : 'bookmark-outline'}
                              size={16}
                              color={isSaved ? Colors.primary : Colors.textMuted}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Question Title & Clean Snippet */}
                      <Text style={styles.questionTitle} numberOfLines={2}>
                        {q.title}
                      </Text>
                      <Text style={styles.questionSnippet} numberOfLines={2}>
                        {q.content}
                      </Text>

                      {/* Tags & Solved Badge */}
                      <View style={styles.questionTagsRow}>
                        {q.tags.slice(0, 3).map((tag) => (
                          <View key={tag} style={styles.tagChip}>
                            <Text style={styles.tagChipText}>#{tag}</Text>
                          </View>
                        ))}
                        {q.isSolved && (
                          <View style={styles.solvedBadge}>
                            <Feather name="check" size={11} color={Colors.success} />
                            <Text style={styles.solvedBadgeText}>Đã giải quyết</Text>
                          </View>
                        )}
                      </View>

                      {/* Footer Actions: Views, Answers, Share */}
                      <View style={styles.questionFooter}>
                        <View style={styles.metaStatsGroup}>
                          <View style={styles.metaStatItem}>
                            <Feather name="message-square" size={13} color={Colors.textSecondary} />
                            <Text style={styles.metaStatText}>{q.answersCount} câu trả lời</Text>
                          </View>
                          <View style={styles.metaStatItem}>
                            <Feather name="eye" size={13} color={Colors.textMuted} />
                            <Text style={styles.metaStatText}>{q.viewsCount} lượt xem</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleShare(q.title)}
                          style={styles.shareIconButton}
                        >
                          <Feather name="share-2" size={14} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </PeekableCard>
              );
            })}
          </View>
        </View>

        {/* 5. Shared Workflows Teaser */}
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

        {/* 6. Tech Articles Teaser */}
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

        {/* 7. Helpdesk Support Banner */}
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
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.md,
  },

  // 1. Welcome Header (Figma #86:118)
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.xs,
    ...CommonStyles.cardShadow,
  },
  welcomeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  campusTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  campusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  campusTagText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  welcomeHeading: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  welcomeSubtext: {
    fontSize: FontSize.caption,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  studentBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.md,
  },
  studentAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  studentAvatarImg: {
    width: '100%',
    height: '100%',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: '800',
  },
  studentMetaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  studentNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentNameText: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentSubInfoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  studentMajorText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bulletSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  studentIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: Colors.primary,
  },
  karmaBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  karmaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },

  // 2. 8 Academic Modules Grid (Figma #86:137)
  moduleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
    ...CommonStyles.cardShadow,
  },
  moduleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  moduleSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  moduleSectionBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleGridItem: {
    width: '23%',
    flexGrow: 1,
    height: 74,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 6,
  },
  moduleIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },

  // 3. Academic Resource Library Banner
  libraryBannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: Spacing.md,
  },
  libraryBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryBannerTextCol: {
    flex: 1,
    gap: 4,
  },
  libraryBannerTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: '#0F172A',
  },
  libraryBannerDesc: {
    fontSize: FontSize.caption,
    color: '#475569',
    lineHeight: 17,
  },
  libraryBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
    marginTop: 6,
  },
  libraryBannerButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },

  // 4. Questions & Discussions Feed Section
  discussionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...CommonStyles.cardShadow,
  },
  discussionsHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  discussionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  discussionsIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discussionsTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '900',
    color: '#0F172A',
  },
  discussionsSubtitle: {
    fontSize: FontSize.caption,
    color: '#64748B',
    marginTop: 1,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
    gap: 6,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.caption,
    fontWeight: '800',
  },
  filterPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  questionsList: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  questionInnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  voteColumnBox: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voteChevronBtn: {
    padding: 2,
  },
  voteChevronActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
  },
  voteScoreText: {
    fontSize: FontSize.caption,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#334155',
    marginVertical: 1,
  },
  questionMainCol: {
    flex: 1,
    gap: 4,
  },
  questionAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionAuthorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  questionAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  questionAuthorMeta: {
    flex: 1,
  },
  questionAuthorNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questionAuthorName: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: '#0F172A',
  },
  questionTimeText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  questionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  bookmarkIconButton: {
    padding: 2,
  },
  questionTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    marginTop: 2,
  },
  questionSnippet: {
    fontSize: FontSize.caption,
    color: '#64748B',
    lineHeight: 17,
  },
  questionTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
  },
  solvedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaStatsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaStatText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  shareIconButton: {
    padding: 4,
  },

  // 5. Workflows Teaser
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionHeaderSub: {
    fontSize: FontSize.caption,
    color: '#64748B',
  },
  seeAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllPillText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  workflowCard: {
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wfHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wfBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  wfCourseTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  wfCourseText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.primary,
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
    fontSize: FontSize.body,
    fontWeight: '800',
    color: '#0F172A',
  },
  wfDescription: {
    fontSize: FontSize.caption,
    color: '#64748B',
    lineHeight: 17,
  },
  wfFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  wfAuthorText: {
    fontSize: FontSize.caption,
    color: '#94A3B8',
  },
  wfUsageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wfUsageText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.success,
  },

  // 6. Tech Articles Teaser
  articleCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  articleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  articleThumb: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
  },
  articleBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleReadTime: {
    fontSize: FontSize.caption,
    color: '#94A3B8',
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

  // 7. Support Helpdesk Banner
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  supportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTextWrap: {
    flex: 1,
  },
  supportTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: '#0F172A',
  },
  supportSub: {
    fontSize: FontSize.caption,
    color: '#64748B',
    marginTop: 2,
  },
});
