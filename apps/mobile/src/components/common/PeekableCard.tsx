import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  PanResponder,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, CommonStyles, Spacing } from '../../constants/theme';
import { useQuickPeek, QuickPeekItem } from '../../context/QuickPeekContext';

interface PeekableCardProps {
  item: QuickPeekItem;
  onPress: () => void;
  onVote?: (id: string, dir: 'UP' | 'DOWN') => void;
  onOpenDetail?: (item: QuickPeekItem) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  subtle?: boolean;
}

const HOLD_TRIGGER_MS = 200; // Ultra-snappy 200ms 1-handed thumb hold
const DRAG_CANCEL_PX = 8; // Pixels of movement before hold triggers to allow normal feed scrolling

export const PeekableCard: React.FC<PeekableCardProps> = ({
  item,
  onPress,
  onVote,
  onOpenDetail,
  children,
  style,
  subtle = false,
}) => {
  const quickPeek = useQuickPeek();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPeekingRef = useRef<boolean>(false);
  const isMovedRef = useRef<boolean>(false);

  // Keep latest props in refs to avoid stale closures in panResponder
  const itemRef = useRef(item);
  itemRef.current = item;
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const onVoteRef = useRef(onVote);
  onVoteRef.current = onVote;
  const onOpenDetailRef = useRef(onOpenDetail);
  onOpenDetailRef.current = onOpenDetail;

  const panResponder = useRef(
    PanResponder.create({
      // Bubble phase: children touchables (like bookmark / vote buttons) can claim touches if tapped directly
      onStartShouldSetPanResponderCapture: () => false,
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // If already peeking, we must track continuous moves
        if (isPeekingRef.current) return true;
        // Don't claim move if not peeking, so parent ScrollView can scroll
        return false;
      },

      onPanResponderGrant: () => {
        isPeekingRef.current = false;
        isMovedRef.current = false;

        // Tactile spring down feedback
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          speed: 60,
          bounciness: 4,
          useNativeDriver: true,
        }).start();

        // Start hold timer for Quick Peek preview
        holdTimerRef.current = setTimeout(() => {
          isPeekingRef.current = true;

          // Spring back card
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }).start();

          // Trigger in-tree Quick Peek overlay
          quickPeek.startPeek({
            item: itemRef.current,
            onVote: onVoteRef.current,
            onOpenDetail: onOpenDetailRef.current || ((it) => onPressRef.current()),
          });
        }, HOLD_TRIGGER_MS);
      },

      onPanResponderMove: (_, gestureState) => {
        if (!isPeekingRef.current) {
          // If finger moved noticeably before hold timer fires, user is scrolling the feed!
          if (
            Math.abs(gestureState.dx) > DRAG_CANCEL_PX ||
            Math.abs(gestureState.dy) > DRAG_CANCEL_PX
          ) {
            isMovedRef.current = true;
            if (holdTimerRef.current) {
              clearTimeout(holdTimerRef.current);
              holdTimerRef.current = null;
            }
            // Reset scale back to normal
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 5,
              tension: 50,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Is actively peeking! Feed live dx & dy into quick peek overlay
          quickPeek.updateMove(gestureState.dx, gestureState.dy);
        }
      },

      onPanResponderTerminationRequest: () => {
        // CRITICAL: Once peek is active, NEVER surrender touch to ScrollView!
        // This ensures the background feed NEVER scrolls when dragging up/down/right!
        return !isPeekingRef.current;
      },

      onPanResponderRelease: () => {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }).start();

        if (isPeekingRef.current) {
          // User lifted finger while peeking ("buông tay ra tự tắt")
          quickPeek.releasePeek();
          isPeekingRef.current = false;
        } else if (!isMovedRef.current) {
          // Fast tap (<220ms without moving) -> trigger normal press
          onPressRef.current();
        }
      },

      onPanResponderTerminate: () => {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }).start();

        if (isPeekingRef.current) {
          quickPeek.cancelPeek();
          isPeekingRef.current = false;
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
      ]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.card,
          subtle ? CommonStyles.cardShadowSubtle : CommonStyles.cardShadow,
          style,
        ]}
      >
        {children}
      </View>
    </Animated.View>
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
