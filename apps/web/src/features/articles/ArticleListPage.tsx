import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Heart,
  Bookmark,
  Eye,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { mockArticles } from '../../services/mockData';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const ArticleListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categories = [
    'ALL',
    'Backend Development',
    'Software Architecture',
    'Frontend & Web',
    'DevOps & Cloud',
    'AI & Data Science',
  ];

  const filteredArticles = mockArticles.filter((art) => {
    const matchCat = selectedCategory === 'ALL' || art.category === selectedCategory;
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredArticle = filteredArticles[0] || mockArticles[0];
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="space-y-6">
      {/* Header (Figma Frame 6: FHub Tech Articles) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              FHub Tech Articles
            </h1>
            <Badge variant="purple" size="md">{filteredArticles.length} Bài viết</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bài viết học thuật, cẩm nang kiến trúc phần mềm & kinh nghiệm làm đồ án từ FPTers.
          </p>
        </div>

        <Link to="/articles/create">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} className="shadow-xs">
            Viết bài mới
          </Button>
        </Link>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả danh mục' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài viết, tác giả..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Featured Hero Article Banner (Figma Frame 6) */}
      {featuredArticle && (
        <Card hoverable className="overflow-hidden border-2 border-blue-500/30 dark:border-blue-800/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex flex-col lg:flex-row">
            {featuredArticle.coverImage && (
              <div className="lg:w-1/2 h-60 lg:h-auto shrink-0 bg-slate-100 overflow-hidden relative">
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="purple" size="md">
                    Featured
                  </Badge>
                  <Badge variant="primary" size="md">
                    {featuredArticle.category}
                  </Badge>
                </div>
              </div>
            )}
            <div className="p-6 lg:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> {featuredArticle.readTimeMinutes} phút đọc
                  </span>
                  {featuredArticle.isSeries && (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Series: {featuredArticle.seriesName}
                    </span>
                  )}
                  <span>• {new Date(featuredArticle.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <Link
                  to={`/articles/${featuredArticle.id}`}
                  className="font-black text-xl lg:text-2xl text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors leading-snug block"
                >
                  {featuredArticle.title}
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {featuredArticle.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredArticle.author.avatarUrl}
                    alt={featuredArticle.author.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {featuredArticle.author.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {featuredArticle.author.role} • {featuredArticle.author.campus || 'FU-HL'}
                    </div>
                  </div>
                </div>

                <Link to={`/articles/${featuredArticle.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Đọc bài viết
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Articles Grid (Figma Frame 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {gridArticles.map((art) => {
          const isLiked = likedIds.has(art.id);
          const isBookmarked = bookmarkedIds.has(art.id);
          return (
            <Card key={art.id} hoverable className="overflow-hidden flex flex-col justify-between">
              {art.coverImage && (
                <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="purple" size="sm">
                      {art.category}
                    </Badge>
                  </div>
                </div>
              )}
              <CardBody className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-blue-600" /> {art.readTimeMinutes} phút đọc
                    </span>
                    {art.isSeries && (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Series
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/articles/${art.id}`}
                    className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors line-clamp-2 leading-snug block"
                  >
                    {art.title}
                  </Link>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <img src={art.author.avatarUrl} alt={art.author.fullName} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{art.author.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(art.id)}
                      className={`flex items-center gap-1 font-semibold cursor-pointer ${
                        isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{art.likesCount + (isLiked ? 1 : 0)}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {art.viewsCount}
                    </span>
                    <button
                      onClick={() => toggleBookmark(art.id)}
                      className={`p-1 hover:text-blue-600 cursor-pointer ${
                        isBookmarked ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
