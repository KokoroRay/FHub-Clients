import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { studentApi } from '../../services/api/studentApi';

export const CreateTicketScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic Records');
  const [priority, setPriority] = useState('NORMAL');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Academic Records',
    'Attendance Issue',
    'Technical Support',
    'Course Feedback',
    'Tuition & Fees',
  ];

  const priorities = [
    { id: 'LOW', label: 'Thấp' },
    { id: 'NORMAL', label: 'Bình thường' },
    { id: 'HIGH', label: 'Khẩn cấp' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề và nội dung cần hỗ trợ.');
      return;
    }

    setSubmitting(true);
    try {
      await studentApi.createTicket({
        title,
        category,
        description,
        priority,
      });

      Alert.alert('Thành công', 'Vé hỗ trợ của bạn đã được gửi tới cán bộ nhà trường.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Thông báo', 'Đã lưu yêu cầu của bạn.');
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Tạo vé hỗ trợ mới"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.helperBox}>
          Cán bộ hỗ trợ sinh viên sẽ tiếp nhận và xử lý vé trong vòng 24 giờ làm việc. Hãy mô tả chi tiết vấn đề kèm thông tin MSSV nếu cần.
        </Text>

        <Input
          label="Tiêu đề yêu cầu"
          placeholder="Ví dụ: Xin cập nhật kết quả chứng chỉ IELTS..."
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Picker */}
        <Text style={styles.fieldLabel}>DANH MỤC HỖ TRỢ</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.chipList}
        >
          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Priority Picker */}
        <Text style={styles.fieldLabel}>MỨC ĐỘ ƯU TIÊN</Text>
        <View style={styles.priorityRow}>
          {priorities.map((p) => {
            const isSelected = priority === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setPriority(p.id)}
                style={[styles.priorityBtn, isSelected && styles.priorityBtnActive]}
              >
                <Text style={[styles.priorityText, isSelected && styles.priorityTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Nội dung chi tiết yêu cầu"
          placeholder="Mô tả cụ thể thời gian, địa điểm, sự việc hoặc tài liệu cần kiểm tra..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          style={styles.textArea}
        />

        <Button
          title="Gửi vé hỗ trợ"
          loading={submitting}
          onPress={handleSubmit}
          size="lg"
          style={styles.submitBtn}
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
    padding: Spacing.lg,
  },
  helperBox: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    backgroundColor: '#EFF6FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    marginBottom: Spacing.md,
  },
  chipList: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.text,
  },
  chipTextActive: {
    color: '#FFF',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  priorityBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  priorityText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  priorityTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: Spacing.lg,
  },
});
