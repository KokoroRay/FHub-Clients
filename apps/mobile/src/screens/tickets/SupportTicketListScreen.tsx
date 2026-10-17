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
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { studentApi } from '../../services/api/studentApi';
import { SupportTicketItem } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SupportTicketListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await studentApi.getMyTickets();
      setTickets(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RESOLVED':
        return <Badge label="Đã giải quyết" variant="success" size="sm" />;
      case 'IN_PROGRESS':
        return <Badge label="Đang xử lý" variant="warning" size="sm" />;
      case 'CLOSED':
        return <Badge label="Đã đóng" variant="neutral" size="sm" />;
      case 'PENDING':
      default:
        return <Badge label="Chờ tiếp nhận" variant="primary" size="sm" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'URGENT':
      case 'HIGH':
        return <Badge label="Ưu tiên cao" variant="danger" size="sm" />;
      case 'LOW':
        return <Badge label="Thấp" variant="neutral" size="sm" />;
      case 'NORMAL':
      default:
        return <Badge label="Bình thường" variant="primary" size="sm" />;
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Vé hỗ trợ sinh viên"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.headerActionRow}>
        <View>
          <Text style={styles.subHeading}>Danh sách yêu cầu hỗ trợ</Text>
          <Text style={styles.subDetail}>Cán bộ CTSV & Đào tạo tiếp nhận và phản hồi</Text>
        </View>
        <Button
          title="Tạo vé mới"
          icon={<Feather name="plus" size={14} color="#FFF" />}
          size="sm"
          onPress={() => navigation.navigate('CreateTicket')}
        />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card
              onPress={() => navigation.navigate('SupportTicketDetail', { id: item.id })}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <Text style={styles.ticketId}>{item.ticketId}</Text>
                <View style={styles.badgesRow}>
                  {getPriorityBadge(item.priority)}
                  {getStatusBadge(item.status)}
                </View>
              </View>

              <Text style={styles.ticketTitle} numberOfLines={2}>
                {item.title}
              </Text>

              {item.description ? (
                <Text style={styles.ticketSnippet} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.cardBottom}>
                <Badge label={item.category} variant="neutral" size="sm" />
                <View style={styles.dateGroup}>
                  <Feather name="clock" size={12} color={Colors.textMuted} />
                  <Text style={styles.dateText}>{item.updatedAt || item.createdAt}</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="life-buoy"
              title="Chưa có vé hỗ trợ nào"
              description="Bạn chưa gửi yêu cầu hỗ trợ nào. Khi gặp sự cố học tập, bạn có thể tạo vé để nhận hỗ trợ."
              actionTitle="Tạo vé hỗ trợ đầu tiên"
              onActionPress={() => navigation.navigate('CreateTicket')}
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
  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subHeading: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.text,
  },
  subDetail: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 2,
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
  ticketId: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ticketTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  ticketSnippet: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
});
