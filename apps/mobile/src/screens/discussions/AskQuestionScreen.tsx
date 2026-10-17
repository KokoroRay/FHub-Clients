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
import { mockCourses } from '../../services/mockData';

export const AskQuestionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('PRN211');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('csharp, winforms');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tiêu đề và nội dung câu hỏi.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Thành công', 'Câu hỏi của bạn đã được đăng tải lên FHub!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Đặt câu hỏi Q&A"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.helperText}>
          Đặt câu hỏi rõ ràng, ngắn gọn và mô tả cụ thể lỗi hoặc vấn đề bạn gặp phải để nhận được lời giải đáp nhanh nhất từ giảng viên và cộng đồng.
        </Text>

        <Input
          label="Tiêu đề câu hỏi"
          placeholder="Ví dụ: Làm thế nào để xử lý async/await trong WinForms?"
          value={title}
          onChangeText={setTitle}
        />

        {/* Course Code Selector */}
        <Text style={styles.fieldLabel}>MÔN HỌC LIÊN QUAN</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.courseScroll}
          contentContainerStyle={styles.courseList}
        >
          {mockCourses.map((c) => {
            const isSelected = courseCode === c.code;
            return (
              <TouchableOpacity
                key={c.code}
                onPress={() => setCourseCode(c.code)}
                style={[styles.courseChip, isSelected && styles.courseChipActive]}
              >
                <Text style={[styles.courseChipText, isSelected && styles.courseChipTextActive]}>
                  {c.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input
          label="Chi tiết vấn đề / Code snippets"
          placeholder="Mô tả các bước tái hiện lỗi, đính kèm đoạn code hoặc thông báo exception..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          style={styles.textArea}
        />

        <Input
          label="Tags (Phân cách bởi dấu phẩy)"
          placeholder="csharp, ef-core, async-await"
          value={tags}
          onChangeText={setTags}
        />

        <Button
          title="Đăng câu hỏi"
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
  helperText: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
    backgroundColor: '#EFF6FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  fieldLabel: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  courseScroll: {
    marginBottom: Spacing.md,
  },
  courseList: {
    gap: 8,
  },
  courseChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  courseChipText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.text,
  },
  courseChipTextActive: {
    color: '#FFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: Spacing.lg,
  },
});
