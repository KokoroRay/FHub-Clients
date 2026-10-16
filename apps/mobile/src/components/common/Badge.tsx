import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize } from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return { bg: Colors.successLight, text: Colors.success, border: '#A7F3D0' };
      case 'warning':
        return { bg: Colors.warningLight, text: Colors.warning, border: '#FDE68A' };
      case 'danger':
        return { bg: Colors.dangerLight, text: Colors.danger, border: '#FECACA' };
      case 'purple':
        return { bg: Colors.purpleLight, text: Colors.purple, border: '#DDD6FE' };
      case 'neutral':
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
      case 'primary':
      default:
        return { bg: Colors.primaryLight, text: Colors.primary, border: '#BFDBFE' };
    }
  };

  const styleConfig = getBadgeStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 6 : 8,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: styleConfig.text,
            fontSize: size === 'sm' ? FontSize.caption - 1 : FontSize.caption,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
