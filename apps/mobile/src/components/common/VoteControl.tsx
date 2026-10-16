import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  return (
    <View
      style={[
        styles.container,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onVote('UP')}
        style={[styles.voteButton, isUpvoted && styles.upvotedActive]}
      >
        <Ionicons
          name="chevron-up"
          size={18}
          color={isUpvoted ? Colors.primary : Colors.textMuted}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.scoreText,
          isUpvoted && { color: Colors.primary },
          isDownvoted && { color: Colors.danger },
        ]}
      >
        {score}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onVote('DOWN')}
        style={[styles.voteButton, isDownvoted && styles.downvotedActive]}
      >
        <Ionicons
          name="chevron-down"
          size={18}
          color={isDownvoted ? Colors.danger : Colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vertical: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    width: 44,
  },
  horizontal: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  voteButton: {
    padding: 3,
    borderRadius: BorderRadius.sm,
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
    marginVertical: 2,
    marginHorizontal: 4,
  },
});
