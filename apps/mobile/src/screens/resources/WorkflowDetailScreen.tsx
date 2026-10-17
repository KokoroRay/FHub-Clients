import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { contentApi } from '../../services/api/contentApi';
import { SharedWorkflow } from '../../types';

type RouteProps = RouteProp<RootStackParamList, 'WorkflowDetail'>;

export const WorkflowDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [workflow, setWorkflow] = useState<SharedWorkflow | null>(null);
  const [applied, setApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWf = async () => {
      setIsLoading(true);
      try {
        const data = await contentApi.getWorkflowById(id);
        setWorkflow(data);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWf();
  }, [id]);

  if (isLoading || !workflow) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Chi tiết Workflow"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Workflow Info Header */}
        <Card style={styles.headerCard}>
          <View style={styles.metaRow}>
            <Badge label={workflow.courseCode} variant="purple" />
            <Badge label={workflow.technology} variant="neutral" />
          </View>

          <Text style={styles.title}>{workflow.title}</Text>
          <Text style={styles.desc}>{workflow.description}</Text>

          <View style={styles.footerRow}>
            <Text style={styles.authorText}>Tác giả: {workflow.author.fullName} ({workflow.author.campus || 'FU'})</Text>
            <View style={styles.usageChip}>
              <Feather name="check-circle" size={13} color={Colors.success} />
              <Text style={styles.usageText}>
                {workflow.usageCount + (applied ? 1 : 0)} áp dụng
              </Text>
            </View>
          </View>
        </Card>

        {/* Steps List */}
        <Text style={styles.stepsHeading}>CÁC BƯỚC THỰC HIỆN ({workflow.steps.length})</Text>

        {workflow.steps.map((step, idx) => (
          <Card key={idx} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{step.stepNumber || idx + 1}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>

            <Text style={styles.stepInstruction}>{step.instruction}</Text>

            {step.codeSnippet && (
              <View style={styles.codeBox}>
                <View style={styles.codeBar}>
                  <Text style={styles.codeLang}>{step.language || 'Code'}</Text>
                </View>
                <Text style={styles.codeText}>{step.codeSnippet}</Text>
              </View>
            )}
          </Card>
        ))}

        <Button
          title={applied ? 'Đã lưu vào danh sách thực hành' : 'Áp dụng Workflow này vào đồ án'}
          variant={applied ? 'secondary' : 'primary'}
          icon={<Feather name={applied ? 'check' : 'download-cloud'} size={18} color={applied ? Colors.primary : '#FFF'} />}
          onPress={() => setApplied(true)}
          size="lg"
          style={styles.applyBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  headerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  desc: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  authorText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  usageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  usageText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.success,
  },
  stepsHeading: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  stepCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  stepNumberText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.purple,
  },
  stepTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  stepInstruction: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  codeBox: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  codeBar: {
    backgroundColor: '#1E293B',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  codeLang: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: FontSize.caption + 1,
    color: '#38BDF8',
    padding: Spacing.md,
    lineHeight: 18,
  },
  applyBtn: {
    marginTop: Spacing.md,
  },
});
