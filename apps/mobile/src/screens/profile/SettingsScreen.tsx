import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { FontSize, Spacing } from '../../constants/theme';
import { Config, DEFAULT_DEV_HOST } from '../../constants/config';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Feed preferences
  const [preferMajor, setPreferMajor] = useState(true);
  const [preferCampus, setPreferCampus] = useState(true);
  const [showHotQuestions, setShowHotQuestions] = useState(true);

  // Privacy
  const [showEmail, setShowEmail] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  // Backend Host Configuration
  const [customHost, setCustomHost] = useState(Config.services.host);

  const handleSaveSettings = () => {
    Config.services.host = customHost.trim() || DEFAULT_DEV_HOST;
    Alert.alert('Thành công', 'Đã lưu cấu hình tùy chọn và kết nối Backend!');
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Tùy chọn & Quyền riêng tư"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Feed Preferences */}
        <Text style={styles.sectionHeading}>CẤU HÌNH BẢNG TIN (FEED TUNING)</Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Ưu tiên bài viết chuyên ngành của tôi</Text>
              <Text style={styles.switchDesc}>Hiển thị nhiều hơn các môn học, Q&A thuộc ngành SE</Text>
            </View>
            <Switch
              value={preferMajor}
              onValueChange={setPreferMajor}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, styles.divider]}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Ưu tiên tin tức theo Campus</Text>
              <Text style={styles.switchDesc}>Nhận các thông báo từ phòng CTSV cơ sở hiện tại</Text>
            </View>
            <Switch
              value={preferCampus}
              onValueChange={setPreferCampus}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, styles.divider]}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Thảo luận nổi bật</Text>
              <Text style={styles.switchDesc}>Ghim các câu hỏi có lượt vote cao lên đầu trang chủ</Text>
            </View>
            <Switch
              value={showHotQuestions}
              onValueChange={setShowHotQuestions}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>
        </Card>

        {/* Privacy Settings */}
        <Text style={styles.sectionHeading}>QUYỀN RIÊNG TƯ & TÀI KHOẢN</Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Công khai email sinh viên</Text>
              <Text style={styles.switchDesc}>Cho phép sinh viên khác nhìn thấy email trên profile</Text>
            </View>
            <Switch
              value={showEmail}
              onValueChange={setShowEmail}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, styles.divider]}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Hiển thị lịch sử đóng góp</Text>
              <Text style={styles.switchDesc}>Cho phép xem số lượng bài viết và câu trả lời hữu ích</Text>
            </View>
            <Switch
              value={showActivity}
              onValueChange={setShowActivity}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
            />
          </View>
        </Card>

        {/* Backend Endpoint Host configuration */}
        <Text style={styles.sectionHeading}>KẾT NỐI BACKEND MICROSERVICES (DEV)</Text>
        <Card style={styles.card}>
          <Text style={styles.helpText}>
            Địa chỉ IP của máy chủ Backend (mặc định Android Emulator: 10.0.2.2, iOS Simulator: localhost, Thiết bị thật: IP mạng Wi-Fi LAN).
          </Text>
          <Input
            label="Backend Host IP"
            value={customHost}
            onChangeText={setCustomHost}
            placeholder="Ví dụ: 192.168.1.15 hoặc 10.0.2.2"
          />
        </Card>

        <Button
          title="Lưu tất cả cài đặt"
          onPress={handleSaveSettings}
          size="lg"
          style={styles.saveBtn}
        />
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
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  switchTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchTitle: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.text,
  },
  switchDesc: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  helpText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
