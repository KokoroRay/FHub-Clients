import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  pill = false,
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: Colors.primaryLight, borderWidth: 0 };
      case 'outline':
        return { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1.5, borderColor: Colors.primary };
      case 'ghost':
        return { backgroundColor: 'transparent', borderWidth: 0 };
      case 'danger':
        return { backgroundColor: Colors.danger, borderWidth: 0 };
      case 'primary':
      default:
        return {
          backgroundColor: Colors.primary,
          borderWidth: 0,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textMuted;
    switch (variant) {
      case 'secondary':
      case 'outline':
      case 'ghost':
        return Colors.primary;
      case 'danger':
      case 'primary':
      default:
        return Colors.textLight;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 7, paddingHorizontal: 14 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 26 };
      case 'md':
      default:
        return { paddingVertical: 11, paddingHorizontal: 18 };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        pill ? styles.pillRadius : styles.standardRadius,
        getContainerStyle(),
        getPadding(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? FontSize.bodySm : size === 'lg' ? FontSize.titleSm : FontSize.body,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardRadius: {
    borderRadius: BorderRadius.lg,
  },
  pillRadius: {
    borderRadius: BorderRadius.pill,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
