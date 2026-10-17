import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!fullName.trim() || !studentCode.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường thông tin.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản của bạn đã được khởi tạo. Vui lòng đăng nhập để bắt đầu trải nghiệm.',
        [{ text: 'Đăng nhập ngay', onPress: () => navigation.goBack() }]
      );
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản FHub</Text>
          <Text style={styles.subtitle}>Kết nối và trao đổi kiến thức cùng sinh viên FPT University.</Text>
        </View>

        <View style={styles.formCard}>
          <Input
            label="Họ và tên sinh viên"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<Feather name="user" size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Mã số sinh viên (MSSV)"
            placeholder="SE172481"
            value={studentCode}
            onChangeText={setStudentCode}
            autoCapitalize="characters"
            leftIcon={<Feather name="credit-card" size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Email FPT (@fpt.edu.vn)"
            placeholder="anv.se172481@fpt.edu.vn"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Feather name="mail" size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Feather name="lock" size={18} color={Colors.textMuted} />}
          />

          <Button
            title="Đăng ký tài khoản"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.header,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.bodySm,
    fontWeight: '800',
    color: Colors.primary,
  },
});
