import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { PeekableCard } from '../../components/common/PeekableCard';
import { useQuickPeek, QuickPeekItem } from '../../context/QuickPeekContext';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { mockQuestions } from '../../services/mockData';
import { QuestionPost } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const QuestionListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isPeeking } = useQuickPeek();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'solved' | 'unanswered'>('all');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [questions, setQuestions] = useState<QuestionPost[]>(mockQuestions);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

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
      authorCampus: q.author.campus || 'FPTU',
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

  const allTags = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.tags.forEach((t) => set.add(t)));
    return ['ALL', ...Array.from(set)];
  }, [questions]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
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
        message: `Thảo luận FHub: "${title}"`,
      });
    } catch (e) {
      // Ignore
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusTab === 'all'
          ? true
          : statusTab === 'solved'
          ? q.isSolved
          : !q.isSolved && q.answersCount === 0;
      const matchTag = selectedTag === 'ALL' || q.tags.includes(selectedTag);
      return matchSearch && matchStatus && matchTag;
    });
  }, [questions, searchQuery, statusTab, selectedTag]);

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Hỏi đáp & Thảo luận"
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={17} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm câu hỏi, môn học, mã code..."
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

      {/* Status Segment Control */}
      <View style={styles.statusSegment}>
        <TouchableOpacity
          onPress={() => setStatusTab('all')}
          style={[styles.segmentBtn, statusTab === 'all' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, statusTab === 'all' && styles.segmentTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStatusTab('solved')}
          style={[styles.segmentBtn, statusTab === 'solved' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, statusTab === 'solved' && styles.segmentTextActive]}>
            Đã giải quyết
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStatusTab('unanswered')}
          style={[styles.segmentBtn, statusTab === 'unanswered' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, statusTab === 'unanswered' && styles.segmentTextActive]}>
            Chưa trả lời
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tag Filter Chips */}
      <View style={styles.tagFilterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={allTags}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tagList}
          renderItem={({ item }) => {
            const isSelected = selectedTag === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTag(item)}
                style={[styles.tagChip, isSelected && styles.tagChipActive]}
              >
                <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>
                  {item === 'ALL' ? 'Tất cả tags' : `#${item}`}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Questions List */}
      <FlatList
        scrollEnabled={!isPeeking}
        data={filteredQuestions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const isSaved = bookmarkedIds.has(item.id);
          const authorInitials = item.author.fullName.slice(0, 2).toUpperCase();

          return (
            <PeekableCard
              item={getQuestionPeekItem(item)}
              onPress={() => navigation.navigate('QuestionDetail', { id: item.id })}
              onVote={(id, dir) => handleVote(id, dir)}
              onOpenDetail={(it) => navigation.navigate('QuestionDetail', { id: it.id })}
              style={styles.questionCard}
            >
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.postAuthorGroup}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.postAvatarText}>{authorInitials}</Text>
                  </View>
                  <View style={styles.postAuthorMeta}>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.postAuthorName} numberOfLines={1}>
                        {item.author.fullName}
                      </Text>
                      {item.isModVerified && (
                        <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                      )}
                    </View>
                    <Text style={styles.postTimeText}>
                      {item.author.campus || 'FPT'} • {item.createdAt}
                    </Text>
                  </View>
                </View>

                <View style={styles.postHeaderRight}>
                  {item.courseCode && (
                    <View style={styles.courseTagPill}>
                      <Text style={styles.courseTagText}>{item.courseCode}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => toggleBookmark(item.id)}
                    style={styles.saveIconButton}
                  >
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={isSaved ? Colors.primary : Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title & Body */}
              <Text style={styles.titleText} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.snippetText} numberOfLines={3}>
                {item.content}
              </Text>

              {/* Tags & Solved */}
              <View style={styles.tagBadgesRow}>
                {item.tags.slice(0, 3).map((t) => (
                  <View key={t} style={styles.socialHashTag}>
                    <Text style={styles.socialHashTagText}>#{t}</Text>
                  </View>
                ))}
                {item.isSolved && (
                  <View style={styles.solvedPill}>
                    <Feather name="check" size={11} color={Colors.success} />
                    <Text style={styles.solvedPillText}>Đã có lời giải</Text>
                  </View>
                )}
              </View>

              {/* Social Footer */}
              <View style={styles.socialFooter}>
                <View style={styles.votePill}>
                  <TouchableOpacity
                    onPress={() => handleVote(item.id, 'UP')}
                    style={[styles.voteArrowBtn, item.userVote === 'UP' && styles.voteArrowUpActive]}
                  >
                    <Feather
                      name="arrow-up"
                      size={15}
                      color={item.userVote === 'UP' ? Colors.primary : Colors.textMuted}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.voteScoreNumber,
                      item.userVote === 'UP' && { color: Colors.primary },
                      item.userVote === 'DOWN' && { color: Colors.danger },
                    ]}
                  >
                    {item.upvotes}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleVote(item.id, 'DOWN')}
                    style={[styles.voteArrowBtn, item.userVote === 'DOWN' && styles.voteArrowDownActive]}
                  >
                    <Feather
                      name="arrow-down"
                      size={15}
                      color={item.userVote === 'DOWN' ? Colors.danger : Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.footerRightGroup}>
                  <View style={styles.metaChip}>
                    <Feather name="message-circle" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaChipText}>{item.answersCount}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Feather name="eye" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaChipText}>{item.viewsCount}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleShare(item.title)}
                    style={styles.shareBtn}
                  >
                    <Feather name="share-2" size={14} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </PeekableCard>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="help-circle"
            title="Không tìm thấy câu hỏi nào"
            description="Hãy thử đổi bộ lọc hoặc là người đầu tiên đặt câu hỏi!"
            actionTitle="Đặt câu hỏi mới"
            onActionPress={() => navigation.navigate('AskQuestion')}
          />
        }
      />

      {/* Floating Action Button (FAB) positioned neatly above slim tab bar */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => navigation.navigate('AskQuestion')}
        style={styles.fab}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchSection: {
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
  statusSegment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(226, 232, 240, 0.65)',
    borderRadius: BorderRadius.pill,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: BorderRadius.pill,
  },
  segmentBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  tagFilterRow: {
    paddingVertical: Spacing.xs,
    marginTop: 2,
  },
  tagList: {
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  },
  tagChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tagChipText: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tagChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 90,
  },
  questionCard: {
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
    gap: 8,
    flex: 1,
  },
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    padding: 2,
  },
  titleText: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  snippetText: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
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
  socialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  footerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaChipText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  shareBtn: {
    padding: 3,
  },
  fab: {
    position: 'absolute',
    bottom: 86,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
