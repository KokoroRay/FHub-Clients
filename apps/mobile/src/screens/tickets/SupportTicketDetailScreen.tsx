import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { mockSupportTickets } from '../../services/mockData';

type RouteProps = RouteProp<RootStackParamList, 'SupportTicketDetail'>;

interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  isStaff: boolean;
  content: string;
  time: string;
}

export const SupportTicketDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { id } = route.params;

  const ticket = mockSupportTickets.find((t) => t.id === id) || mockSupportTickets[0];

  const [messages, setMessages] = useState<TicketMessage[]>([
    {
      id: 'm-1',
      senderName: ticket.reporterName || 'Bảo Nguyễn',
      senderRole: 'Sinh viên',
      isStaff: false,
      content: ticket.description || 'Em đã nộp bản photo công chứng chứng chỉ IELTS 7.5 tại phòng CTSV cơ sở Hòa Lạc.',
      time: ticket.createdAt,
    },
    {
      id: 'm-2',
      senderName: 'Vũ Thị Mai Hương',
      senderRole: 'Cán bộ Phòng CTSV',
      isStaff: true,
      content: 'Chào em, phòng CTSV đã tiếp nhận hồ sơ photo của em và đang kiểm tra đối soát trên hệ thống FAP. Dự kiến hoàn tất cập nhật trong 24h làm việc.',
      time: '3 giờ trước',
    },
  ]);

  const [replyText, setReplyText] = useState('');

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const newMsg: TicketMessage = {
      id: `m-${Date.now()}`,
      senderName: 'Bảo Nguyễn',
      senderRole: 'Sinh viên',
      isStaff: false,
      content: replyText.trim(),
      time: 'Vừa xong',
    };
    setMessages([...messages, newMsg]);
    setReplyText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <HeaderBar
        title={ticket.ticketId}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ticket Overview Card */}
        <Card style={styles.ticketCard}>
          <View style={styles.topRow}>
            <Badge label={ticket.category} variant="primary" size="sm" />
            <Badge
              label={ticket.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang xử lý'}
              variant={ticket.status === 'RESOLVED' ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          <Text style={styles.title}>{ticket.title}</Text>
          <Text style={styles.metaText}>Khởi tạo lúc: {ticket.createdAt}</Text>
        </Card>

        {/* Message Thread */}
        <Text style={styles.threadHeading}>TRAO ĐỔI HỖ TRỢ</Text>

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgContainer,
              msg.isStaff ? styles.staffMsgContainer : styles.studentMsgContainer,
            ]}
          >
            <View style={styles.msgHeader}>
              <Text style={styles.msgSender}>{msg.senderName}</Text>
              <Badge
                label={msg.senderRole}
                variant={msg.isStaff ? 'purple' : 'neutral'}
                size="sm"
              />
            </View>
            <Text style={styles.msgContent}>{msg.content}</Text>
            <Text style={styles.msgTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Reply Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Phản hồi cán bộ hỗ trợ..."
          placeholderTextColor={Colors.textMuted}
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={handleSendReply}
          disabled={!replyText.trim()}
          style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 20,
  },
  ticketCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.titleSm,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 22,
    marginVertical: 4,
  },
  metaText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  threadHeading: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  msgContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  studentMsgContainer: {
    backgroundColor: '#FFF',
    borderColor: Colors.border,
  },
  staffMsgContainer: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  msgSender: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.text,
  },
  msgContent: {
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  msgTime: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.body,
    color: Colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
