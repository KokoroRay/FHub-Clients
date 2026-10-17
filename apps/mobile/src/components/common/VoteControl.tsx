import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

interface VoteControlProps {
  score: number;
  userVote?: 'UP' | 'DOWN' | null;
  onVote: (direction: 'UP' | 'DOWN') => void;
  orientation?: 'vertical' | 'horizontal';
}

export const VoteControl: React.FC<VoteControlProps> = ({
  score,
  userVote = null,
  onVote,
  orientation = 'vertical',
}) => {
  const isUpvoted = userVote === 'UP';
  const isDownvoted = userVote === 'DOWN';

  const scoreScaleAnim = useRef(new Animated.Value(1)).current;
  const upScaleAnim = useRef(new Animated.Value(1)).current;
  const downScaleAnim = useRef(new Animated.Value(1)).current;

  const triggerVoteAnimation = (dir: 'UP' | 'DOWN') => {
    // Pop the score text
    Animated.sequence([
      Animated.timing(scoreScaleAnim, {
        toValue: 1.28,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scoreScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Pop the specific arrow
    const arrowAnim = dir === 'UP' ? upScaleAnim : downScaleAnim;
    Animated.sequence([
      Animated.timing(arrowAnim, {
        toValue: 1.35,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(arrowAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    onVote(dir);
  };

  return (
    <View
      style={[
        styles.container,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.65}
        onPress={() => triggerVoteAnimation('UP')}
        style={[styles.voteButton, isUpvoted && styles.upvotedActive]}
      >
        <Animated.View style={{ transform: [{ scale: upScaleAnim }] }}>
          <Ionicons
            name="chevron-up"
            size={18}
            color={isUpvoted ? Colors.primary : Colors.textMuted}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ transform: [{ scale: scoreScaleAnim }] }}>
        <Text
          style={[
            styles.scoreText,
            isUpvoted && { color: Colors.primary },
            isDownvoted && { color: Colors.danger },
          ]}
        >
          {score}
        </Text>
      </Animated.View>

      <TouchableOpacity
        activeOpacity={0.65}
        onPress={() => triggerVoteAnimation('DOWN')}
        style={[styles.voteButton, isDownvoted && styles.downvotedActive]}
      >
        <Animated.View style={{ transform: [{ scale: downScaleAnim }] }}>
          <Ionicons
            name="chevron-down"
            size={18}
            color={isDownvoted ? Colors.danger : Colors.textMuted}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertical: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    width: 42,
  },
  horizontal: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  voteButton: {
    padding: 3,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvotedActive: {
    backgroundColor: Colors.primaryLight,
  },
  downvotedActive: {
    backgroundColor: Colors.dangerLight,
  },
  scoreText: {
    fontSize: FontSize.bodySm,
    fontWeight: '800',
    color: Colors.text,
    marginVertical: 1,
    marginHorizontal: 3,
    textAlign: 'center',
  },
});
