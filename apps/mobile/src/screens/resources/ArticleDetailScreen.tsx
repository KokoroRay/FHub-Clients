import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Badge } from '../../components/common/Badge';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { contentApi } from '../../services/api/contentApi';
import { Article } from '../../types';

type RouteProps = RouteProp<RootStackParamList, 'ArticleDetail'>;

export const ArticleDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [article, setArticle] = useState<Article | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const data = await contentApi.getArticleById(id);
        setArticle(data);
        setLikes(data.likesCount);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (isLoading || !article) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Bài viết công nghệ"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {article.coverImage && (
          <Image source={{ uri: article.coverImage }} style={styles.coverImage} />
        )}

        <View style={styles.bodyWrap}>
          <Badge label={article.category} variant="primary" />

          <Text style={styles.title}>{article.title}</Text>

          {/* Author Row */}
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{article.author.fullName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{article.author.fullName}</Text>
              <Text style={styles.authorMeta}>
                {article.readTimeMinutes} phút đọc • {article.createdAt}
              </Text>
            </View>
          </View>

          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{article.summary}</Text>
          </View>

          {/* Main Content */}
          <Text style={styles.articleBodyText}>
            {article.content ||
              `Trong bối cảnh phát triển phần mềm ngày nay, việc áp dụng đúng kiến trúc và công cụ hỗ trợ đóng vai trò then chốt giúp sinh viên tự tin hoàn thành các đồ án chuyên ngành như PRN211 và SWP391.\n\n1. Xác định rõ ranh giới các module (Bounded Context).\n2. Quản lý trạng thái và dữ liệu nhất quán giữa Backend và Client.\n3. Viết unit test và thiết lập pipeline CI/CD để đảm bảo chất lượng mã nguồn.`}
          </Text>

          {/* Tags */}
          <View style={styles.tagRow}>
            {article.tags.map((t) => (
              <Badge key={t} label={`#${t}`} variant="neutral" size="sm" />
            ))}
          </View>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? Colors.danger : Colors.textSecondary}
              />
              <Text style={[styles.actionBtnText, isLiked && { color: Colors.danger }]}>
                {likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)} style={styles.actionBtn}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.actionBtnText, isBookmarked && { color: Colors.primary }]}>
                {isBookmarked ? 'Đã lưu' : 'Lưu bài'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 40,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#CBD5E1',
  },
  bodyWrap: {
    padding: Spacing.lg,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: FontSize.header,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 30,
    marginVertical: Spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  authorName: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.text,
  },
  authorMeta: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  summaryText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  articleBodyText: {
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: FontSize.bodySm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
