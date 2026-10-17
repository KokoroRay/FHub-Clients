import React, { useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Animated, GestureResponderEvent } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, CommonStyles, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  subtle?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  onLongPress,
  subtle = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (onPress || onLongPress) {
    const handlePressIn = (e: GestureResponderEvent) => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    };

    const handlePressOut = (e: GestureResponderEvent) => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 50,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={320}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.card,
            subtle ? CommonStyles.cardShadowSubtle : CommonStyles.cardShadow,
            style,
          ]}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        subtle ? CommonStyles.cardShadowSubtle : CommonStyles.cardShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glassCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(230, 236, 245, 0.85)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
});
