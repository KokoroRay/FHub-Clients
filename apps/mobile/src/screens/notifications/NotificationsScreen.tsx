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
import { Feather, Ionicons } from '@expo/vector-icons';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { studentApi } from '../../services/api/studentApi';
import { NotificationItem } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await studentApi.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifs();
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await studentApi.markNotificationAsRead(id);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ANSWER':
        return <Feather name="message-square" size={18} color={Colors.primary} />;
      case 'BADGE':
        return <Ionicons name="trophy" size={18} color="#D97706" />;
      case 'TICKET':
        return <Feather name="life-buoy" size={18} color="#EC4899" />;
      default:
        return <Feather name="bell" size={18} color={Colors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Thông báo"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card
              onPress={() => markAsRead(item.id)}
              style={[styles.card, !item.isRead ? styles.unreadCard : undefined]}
            >
              <View style={styles.row}>
                <View style={styles.iconCircle}>{getIconForType(item.type)}</View>

                <View style={styles.textCol}>
                  <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.timeText}>{item.createdAt}</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="bell"
              title="Không có thông báo mới"
              description="Bạn đã đọc hết tất cả thông báo học tập gần đây."
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
  unreadCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.xs,
  },
  message: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginVertical: 4,
  },
  timeText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
});
