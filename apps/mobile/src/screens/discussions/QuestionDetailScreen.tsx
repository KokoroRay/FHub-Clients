import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { VoteControl } from '../../components/common/VoteControl';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { mockQuestions } from '../../services/mockData';
import { useAuth } from '../../hooks/useAuth';

type RouteProps = RouteProp<RootStackParamList, 'QuestionDetail'>;

export const QuestionDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { id } = route.params;
  const { currentUser } = useAuth();

  const initialQuestion = mockQuestions.find((q) => q.id === id) || mockQuestions[0];
  const [question, setQuestion] = useState(initialQuestion);
  const [answers, setAnswers] = useState(initialQuestion.answers || []);
  const [replyText, setReplyText] = useState('');

  const handleVoteQuestion = (dir: 'UP' | 'DOWN') => {
    setQuestion((prev) => {
      const currentVote = prev.userVote;
      let newVote: 'UP' | 'DOWN' | null = dir;
      let newScore = prev.upvotes;

      if (currentVote === dir) {
        newVote = null;
        newScore += dir === 'UP' ? -1 : 1;
      } else if (currentVote === null) {
        newScore += dir === 'UP' ? 1 : -1;
      } else {
        newScore += dir === 'UP' ? 2 : -2;
      }
      return { ...prev, upvotes: newScore, userVote: newVote };
    });
  };

  const handleSendAnswer = () => {
    if (!replyText.trim()) return;
    const newAns = {
      id: `ans-${Date.now()}`,
      questionId: question.id,
      author: {
        id: currentUser?.id || 'usr-me',
        fullName: currentUser?.fullName || 'Tôi',
        avatarUrl: currentUser?.avatarUrl,
        role: 'Student' as any,
        karma: currentUser?.karma || 100,
      },
      content: replyText.trim(),
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      isAccepted: false,
      createdAt: 'Vừa xong',
    };
    setAnswers([newAns, ...answers]);
    setReplyText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <HeaderBar
        title="Chi tiết câu hỏi"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Question Card */}
        <Card style={styles.mainCard}>
          <View style={styles.metaRow}>
            {question.courseCode && <Badge label={question.courseCode} variant="primary" size="sm" />}
            {question.isSolved && <Badge label="Đã có lời giải" variant="success" size="sm" />}
            {question.isModVerified && <Badge label="Verified by Mod" variant="purple" size="sm" />}
          </View>

          <Text style={styles.title}>{question.title}</Text>

          {/* Author snippet */}
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {question.author.fullName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{question.author.fullName}</Text>
              <Text style={styles.authorMeta}>
                {question.author.campus} • {question.createdAt}
              </Text>
            </View>
          </View>

          <Text style={styles.content}>{question.content}</Text>

          <View style={styles.tagsContainer}>
            {question.tags.map((t) => (
              <Badge key={t} label={`#${t}`} variant="neutral" size="sm" />
            ))}
          </View>

          <View style={styles.voteBar}>
            <VoteControl
              score={question.upvotes}
              userVote={question.userVote}
              onVote={handleVoteQuestion}
              orientation="horizontal"
            />
            <View style={styles.statChip}>
              <Feather name="eye" size={14} color={Colors.textMuted} />
              <Text style={styles.statText}>{question.viewsCount} lượt xem</Text>
            </View>
          </View>
        </Card>

        {/* Answers Header */}
        <View style={styles.answersHeader}>
          <Text style={styles.answersCountText}>{answers.length} Câu trả lời</Text>
        </View>

        {/* Answer Cards */}
        {answers.map((ans) => (
          <Card key={ans.id} style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <View style={styles.authorRow}>
                <View style={[styles.avatar, { backgroundColor: Colors.purple }]}>
                  <Text style={styles.avatarText}>
                    {ans.author.fullName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{ans.author.fullName}</Text>
                  <Text style={styles.authorMeta}>{ans.createdAt}</Text>
                </View>
              </View>
              {ans.isAccepted && (
                <Badge label="Chấp nhận" variant="success" size="sm" />
              )}
            </View>

            <Text style={styles.answerContent}>{ans.content}</Text>
          </Card>
        ))}
      </ScrollView>

      {/* Answer Input Bar */}
      <View style={styles.replyBar}>
        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Viết câu trả lời của bạn..."
          placeholderTextColor={Colors.textMuted}
          style={styles.replyInput}
        />
        <TouchableOpacity
          onPress={handleSendAnswer}
          disabled={!replyText.trim()}
          style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 20,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  authorName: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.text,
  },
  authorMeta: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  content: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  voteBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: Spacing.md,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  answersHeader: {
    marginVertical: Spacing.sm,
  },
  answersCountText: {
    fontSize: FontSize.titleSm,
    fontWeight: '800',
    color: Colors.text,
  },
  answerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  answerContent: {
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: 22,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    fontSize: FontSize.bodySm,
    color: Colors.text,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
