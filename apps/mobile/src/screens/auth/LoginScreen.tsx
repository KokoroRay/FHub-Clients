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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState('bao.nguyen@fpt.edu.vn');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);

    if (success) {
      navigation.navigate('Main', { screen: 'FeedTab' });
    } else {
      Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không chính xác.');
    }
  };

  const fillDemoStudent = () => {
    setEmail('bao.nguyen@fpt.edu.vn');
    setPassword('123456');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/fhub-remove-background.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.logoTitleRow}>
            <Text style={styles.appName}>FHub</Text>
            <View style={styles.eduTag}>
              <Text style={styles.eduText}>EDU</Text>
            </View>
          </View>
          <Text style={styles.appSubtitle}>FPT University Academic Network</Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Đăng nhập Sinh viên</Text>
          <Text style={styles.formDesc}>Sử dụng tài khoản @fpt.edu.vn để truy cập tài liệu và thảo luận môn học.</Text>

          <Input
            label="Email sinh viên (@fpt.edu.vn)"
            placeholder="nguyenvana.se@fpt.edu.vn"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Feather name="mail" size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Feather name="lock" size={18} color={Colors.textMuted} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            }
          />

          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            pill
            style={styles.loginBtn}
          />

          {/* Quick demo filler button */}
          <TouchableOpacity onPress={fillDemoStudent} style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>Điền tài khoản mẫu (Bảo Nguyễn - SE)</Text>
          </TouchableOpacity>
        </View>

        {/* Register footer link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoImage: {
    width: 68,
    height: 68,
    marginBottom: Spacing.xs,
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  eduTag: {
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  eduText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  appSubtitle: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: '#E8EFF8',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  formTitle: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  formDesc: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  demoBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: 6,
  },
  demoBtnText: {
    fontSize: FontSize.caption,
    color: Colors.primary,
    fontWeight: '700',
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
  registerLink: {
    fontSize: FontSize.bodySm,
    fontWeight: '800',
    color: Colors.primary,
  },
});
