import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  TouchableOpacityProps,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface ScalePressableProps extends TouchableOpacityProps {
  scaleTo?: number;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ScalePressable: React.FC<ScalePressableProps> = ({
  scaleTo = 0.96,
  style,
  containerStyle,
  onPressIn,
  onPressOut,
  children,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 50,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};
