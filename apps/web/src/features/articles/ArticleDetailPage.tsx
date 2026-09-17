import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Heart,
  Bookmark,
  Share2,
  Clock,
  Eye,
  ArrowLeft,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { mockArticles } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = mockArticles.find((a) => a.id === id) || mockArticles[0];

  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [likesCount, setLikesCount] = useState(article.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((c) => (isLiked ? c - 1 : c + 1));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link to="/articles" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#005da7] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
      </Link>

      {/* Article Container (Figma 47:6212) */}
      <Card className="overflow-hidden">
        {article.coverImage && (
          <div className="h-72 w-full bg-slate-100 overflow-hidden relative">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <CardBody className="p-8 space-y-6">
          {/* Header Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="md">
                {article.category}
              </Badge>
              {article.isSeries && (
                <Badge variant="warning" size="sm" icon={<Layers className="w-3 h-3" />}>
                  {article.seriesName}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {article.title}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {article.summary}
            </p>

            {/* Author bar & Interactions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={article.author.avatarUrl} alt={article.author.fullName} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{article.author.fullName}</span>
                    <Badge variant="neutral" size="sm">{article.author.role}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span>• {article.readTimeMinutes} phút đọc</span>
                    <span>• {article.viewsCount} lượt xem</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isLiked ? 'primary' : 'outline'}
                  size="sm"
                  onClick={toggleLike}
                  leftIcon={<Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />}
                >
                  {likesCount}
                </Button>
                <Button
                  variant={isBookmarked ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  leftIcon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#005da7]' : ''}`} />}
                >
                  {isBookmarked ? 'Đã lưu' : 'Lưu bài'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Rich Content Article Body */}
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="whitespace-pre-line font-mono bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              {article.content}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            {article.tags.map((t) => (
              <span key={t} className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                #{t}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
