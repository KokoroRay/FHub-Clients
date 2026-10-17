import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { taxonomyApi } from '../../services/api/taxonomyApi';
import { mockCourses, mockQuestions, mockMaterials, mockWorkflows, mockCourseReviews } from '../../services/mockData';
import { CourseNode } from '../../types';

type DetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CourseDetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { code } = route.params;

  const [course, setCourse] = useState<CourseNode | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'discussions' | 'materials' | 'workflows' | 'reviews'>('overview');
  const [isFollowed, setIsFollowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const data = await taxonomyApi.getCourseByCode(code);
        setCourse(data);
        setIsFollowed(data.isFollowed || false);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [code]);

  if (isLoading || !course) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const courseQuestions = mockQuestions.filter((q) => q.courseCode === course.code);
  const courseMaterials = mockMaterials.filter((m) => m.courseCode === course.code);
  const courseWorkflows = mockWorkflows.filter((w) => w.courseCode === course.code);
  const courseReviews = mockCourseReviews.filter((r) => r.courseCode === course.code);

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'discussions', label: `Hỏi đáp (${courseQuestions.length})` },
    { id: 'materials', label: `Tài liệu (${courseMaterials.length})` },
    { id: 'workflows', label: `Workflows (${courseWorkflows.length})` },
    { id: 'reviews', label: `Đánh giá (${courseReviews.length})` },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        title={course.code}
        showBack
        onBackPress={() => navigation.goBack()}
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Course Header Banner */}
        <View style={styles.courseHeaderCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.badgeRow}>
              <View style={styles.codeTag}>
                <Text style={styles.codeTagText}>{course.code}</Text>
              </View>
              <Badge label={`${course.credits} Tín chỉ`} variant="neutral" size="sm" />
              <Badge label={`Học kỳ ${course.semester}`} variant="primary" size="sm" />
            </View>

            <TouchableOpacity
              onPress={() => setIsFollowed(!isFollowed)}
              style={[styles.followBtn, isFollowed && styles.followedBtn]}
            >
              <Feather
                name={isFollowed ? 'check' : 'plus'}
                size={14}
                color={isFollowed ? Colors.primary : '#FFF'}
              />
              <Text style={[styles.followText, isFollowed && styles.followedText]}>
                {isFollowed ? 'Đang theo dõi' : 'Theo dõi môn'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDesc}>{course.description}</Text>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.metricBold}>{course.averageRating.toFixed(1)}/5.0</Text>
              <Text style={styles.metricLabel}>Đánh giá</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Feather name="users" size={16} color={Colors.primary} />
              <Text style={styles.metricBold}>{course.followerCount}</Text>
              <Text style={styles.metricLabel}>Theo dõi</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Feather name="book-open" size={16} color={Colors.success} />
              <Text style={styles.metricBold}>{courseMaterials.length}</Text>
              <Text style={styles.metricLabel}>Tài liệu</Text>
            </View>
          </View>
        </View>

        {/* 5 Sub-tabs Scrollable */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tab Content Rendering */}
        <View style={styles.tabBody}>
          {activeTab === 'overview' && (
            <View style={styles.sectionWrap}>
              <Card>
                <Text style={styles.sectionHeading}>Môn học tiên quyết</Text>
                <View style={styles.prereqRow}>
                  {course.prerequisites && course.prerequisites.length > 0 ? (
                    course.prerequisites.map((p) => (
                      <Badge key={p} label={p} variant="purple" />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>Không có môn tiên quyết bắt buộc</Text>
                  )}
                </View>
              </Card>

              <Card>
                <Text style={styles.sectionHeading}>Thông tin giảng dạy tại các Campus</Text>
                <View style={styles.campusScheduleItem}>
                  <Text style={styles.campusScheduleName}>FU-HL (Hà Nội)</Text>
                  <Text style={styles.campusScheduleDetail}>Giảng viên: TS. Nguyễn Hoàng Nam • v2025.1</Text>
                </View>
                <View style={styles.campusScheduleItem}>
                  <Text style={styles.campusScheduleName}>FU-HCM (Hồ Chí Minh)</Text>
                  <Text style={styles.campusScheduleDetail}>Giảng viên: ThS. Trần Quốc Bảo • v2025.1</Text>
                </View>
                <View style={styles.campusScheduleItem}>
                  <Text style={styles.campusScheduleName}>FU-DN (Đà Nẵng)</Text>
                  <Text style={styles.campusScheduleDetail}>Giảng viên: TS. Lê Đức Thắng • v2025.1</Text>
                </View>
              </Card>
            </View>
          )}

          {activeTab === 'discussions' && (
            <View style={styles.sectionWrap}>
              <Button
                title="Đặt câu hỏi môn này"
                icon={<Feather name="plus" size={16} color="#FFF" />}
                onPress={() => navigation.navigate('AskQuestion')}
                style={styles.actionBtn}
              />
              {courseQuestions.map((q) => (
                <Card
                  key={q.id}
                  onPress={() => navigation.navigate('QuestionDetail', { id: q.id })}
                >
                  <Text style={styles.itemTitle}>{q.title}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemSub}>{q.upvotes} votes • {q.answersCount} câu trả lời</Text>
                    {q.isSolved && <Badge label="Đã giải quyết" variant="success" size="sm" />}
                  </View>
                </Card>
              ))}
            </View>
          )}

          {activeTab === 'materials' && (
            <View style={styles.sectionWrap}>
              {courseMaterials.map((m) => (
                <Card key={m.id}>
                  <View style={styles.matHeader}>
                    <Badge label={m.fileType} variant="primary" size="sm" />
                    <Text style={styles.matSize}>{m.fileSizeMb} MB</Text>
                  </View>
                  <Text style={styles.itemTitle}>{m.title}</Text>
                  <Text style={styles.itemDesc}>{m.description}</Text>
                  <View style={styles.matFooter}>
                    <Text style={styles.itemSub}>{m.downloadsCount} lượt tải</Text>
                    <TouchableOpacity style={styles.downloadIconBtn}>
                      <Feather name="download" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {activeTab === 'workflows' && (
            <View style={styles.sectionWrap}>
              {courseWorkflows.map((w) => (
                <Card
                  key={w.id}
                  onPress={() => navigation.navigate('WorkflowDetail', { id: w.id })}
                >
                  <Text style={styles.itemTitle}>{w.title}</Text>
                  <Text style={styles.itemDesc}>{w.description}</Text>
                  <View style={styles.wfMeta}>
                    <Badge label={w.technology} variant="purple" size="sm" />
                    <Text style={styles.itemSub}>{w.usageCount} lượt áp dụng</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.sectionWrap}>
              {courseReviews.map((r) => (
                <Card key={r.id}>
                  <View style={styles.revHeader}>
                    <Text style={styles.revAuthor}>{r.author.fullName}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratingText}>{r.rating}/5</Text>
                    </View>
                  </View>
                  <Text style={styles.revComment}>{r.comment}</Text>
                  <View style={styles.revTipsBox}>
                    <Text style={styles.revTipLabel}>💡 Lời khuyên qua môn:</Text>
                    <Text style={styles.revTipText}>{r.tips}</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  courseHeaderCard: {
    backgroundColor: '#FFF',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeTag: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  codeTagText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: FontSize.bodySm,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  followedBtn: {
    backgroundColor: Colors.primaryLight,
  },
  followText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: '#FFF',
  },
  followedText: {
    color: Colors.primary,
  },
  courseTitle: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: Colors.text,
    marginVertical: 6,
    lineHeight: 24,
  },
  courseDesc: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricBold: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  metricLabel: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  tabsScroll: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
    gap: 16,
  },
  tabButton: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabBody: {
    padding: Spacing.md,
  },
  sectionWrap: {
    gap: Spacing.sm,
  },
  sectionHeading: {
    fontSize: FontSize.titleSm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  prereqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
  },
  campusScheduleItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  campusScheduleName: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.text,
  },
  campusScheduleDetail: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    marginBottom: Spacing.sm,
  },
  itemTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemSub: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  matHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  matSize: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  matFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    marginTop: 6,
  },
  downloadIconBtn: {
    padding: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryLight,
  },
  wfMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  revAuthor: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.text,
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
  revComment: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  revTipsBox: {
    backgroundColor: '#FFFBEB',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  revTipLabel: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 2,
  },
  revTipText: {
    fontSize: FontSize.caption,
    color: '#92400E',
    lineHeight: 16,
  },
});
