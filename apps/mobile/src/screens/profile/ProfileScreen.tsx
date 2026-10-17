import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, logout } = useAuth();

  const user = currentUser || {
    id: '1',
    fullName: 'Bảo Nguyễn',
    email: 'bao.nguyen@fpt.edu.vn',
    studentId: 'SE172481',
    major: 'Software Engineering',
    campus: 'HL',
    karma: 1250,
    role: 'Student',
    avatarUrl: undefined,
    badges: [],
  };

  const menuItems = [
    {
      id: 'bookmarks',
      title: 'Mục đã lưu (Bookmarks)',
      subtitle: 'Xem lại câu hỏi, bài viết và workflows đã bookmark',
      icon: 'bookmark',
      color: Colors.primary,
      onPress: () => navigation.navigate('Bookmarks'),
    },
    {
      id: 'tickets',
      title: 'Vé hỗ trợ học vụ & Kỹ thuật',
      subtitle: 'Theo dõi tiến độ giải quyết các yêu cầu hỗ trợ',
      icon: 'life-buoy',
      color: '#EC4899',
      onPress: () => navigation.navigate('SupportTickets'),
    },
    {
      id: 'notifications',
      title: 'Thông báo & Tin mới',
      subtitle: 'Cập nhật từ môn học, câu trả lời và huy hiệu',
      icon: 'bell',
      color: '#F59E0B',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'settings',
      title: 'Tùy chọn & Quyền riêng tư',
      subtitle: 'Cài đặt tài khoản, thông tin hiển thị và feed tuning',
      icon: 'settings',
      color: Colors.textSecondary,
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Trang cá nhân"
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{user.fullName.slice(0, 2).toUpperCase()}</Text>
              )}
            </View>

            <View style={styles.userInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Badge label="Sinh viên" variant="primary" size="sm" />
              </View>
              <Text style={styles.studentCode}>MSSV: {user.studentId || 'SE172481'}</Text>
              <Text style={styles.userSub}>{user.major || 'Kỹ thuật phần mềm'} • FU-{user.campus}</Text>
            </View>
          </View>

          {/* Karma & Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{user.karma?.toLocaleString() || 1250}</Text>
              <Text style={styles.statLabel}>Điểm Karma</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>12</Text>
              <Text style={styles.statLabel}>Câu hỏi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>38</Text>
              <Text style={styles.statLabel}>Câu trả lời</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>4</Text>
              <Text style={styles.statLabel}>Huy hiệu</Text>
            </View>
          </View>
        </Card>

        {/* Badges Carousel Preview */}
        <Text style={styles.sectionHeading}>HUY HIỆU & THÀNH TỰU</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgeScroll}
          contentContainerStyle={styles.badgeList}
        >
          <View style={styles.badgeCard}>
            <View style={[styles.badgeIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="trophy" size={20} color="#D97706" />
            </View>
            <Text style={styles.badgeName}>Code Champion</Text>
            <Text style={styles.badgeTier}>Vàng • 50+ lời giải</Text>
          </View>

          <View style={styles.badgeCard}>
            <View style={[styles.badgeIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Feather name="share-2" size={20} color="#64748B" />
            </View>
            <Text style={styles.badgeName}>Knowledge Sharer</Text>
            <Text style={styles.badgeTier}>Bạc • 10+ workflows</Text>
          </View>

          <View style={styles.badgeCard}>
            <View style={[styles.badgeIconCircle, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="star" size={20} color="#EA580C" />
            </View>
            <Text style={styles.badgeName}>Top Reviewer</Text>
            <Text style={styles.badgeTier}>Đồng • Review môn học</Text>
          </View>
        </ScrollView>

        {/* Utilities Menu */}
        <Text style={styles.sectionHeading}>DANH MỤC TIỆN ÍCH</Text>
        <Card style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={[
                styles.menuItem,
                idx < menuItems.length - 1 && styles.menuItemBorder,
              ]}
            >
              <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                <Feather name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => logout()}
          style={styles.logoutBtn}
        >
          <Feather name="log-out" size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Đăng xuất khỏi FHub</Text>
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
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 90,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  userInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: FontSize.titleSm,
    fontWeight: '900',
    color: Colors.text,
  },
  studentCode: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  userSub: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: FontSize.titleSm,
    fontWeight: '900',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.caption - 1,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  sectionHeading: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  badgeScroll: {
    marginBottom: Spacing.md,
  },
  badgeList: {
    gap: Spacing.sm,
  },
  badgeCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E8EEF6',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  badgeName: {
    fontSize: FontSize.bodySm,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeTier: {
    fontSize: FontSize.caption - 1,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.text,
  },
  menuItemSubtitle: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
    paddingVertical: 14,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.danger,
  },
});
