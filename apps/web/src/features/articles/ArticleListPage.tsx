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
} from 'lucide-react';
import { mockArticles } from '../../services/mockData';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const ArticleListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Header (Figma 47:5265) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Tech Articles & Knowledge Base</span>
            <Badge variant="purple" size="md">{filteredArticles.length} Bài viết</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Các bài viết chuyên sâu về kiến trúc phần mềm, kinh nghiệm làm đồ án và công nghệ mới.
          </p>
        </div>

        <Link to="/articles/create">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Viết bài mới
          </Button>
        </Link>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#005da7] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả danh mục' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài viết..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#005da7]"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredArticles.map((art) => (
          <Card key={art.id} hoverable className="overflow-hidden flex flex-col justify-between">
            {art.coverImage && (
              <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
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
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {art.readTimeMinutes} phút đọc
                  </span>
                  {art.isSeries && (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Series
                    </span>
                  )}
                </div>

                <Link
                  to={`/articles/${art.id}`}
                  className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-[#005da7] transition-colors line-clamp-2 leading-snug block"
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
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {art.viewsCount}
                  </span>
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" /> {art.likesCount}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
