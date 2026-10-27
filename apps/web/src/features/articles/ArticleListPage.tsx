import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Heart,
  Bookmark,
  Eye,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { SeriesModal } from './SeriesModal';
import { Article, Series } from '../../types';
import { articleApi, seriesApi } from '../../services/api/contentApi';
import { voteApi, bookmarkApi } from '../../services/api/studentApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';

export const ArticleListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'series'>('articles');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'views'>('newest');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkMap, setBookmarkMap] = useState<Map<string, number | string>>(new Map());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeScores, setLikeScores] = useState<Record<string, number>>({});
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [apiArticles, setApiArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const res = await articleApi.getArticles({
          search: searchQuery.trim() || undefined,
          pageSize: 20,
        });
        if (res && res.items) {
          const mapped: Article[] = res.items.map((item) => ({
            id: String(item.articleId),
            title: item.title,
            summary: item.summary || item.title,
            content: '',
            coverImage: item.coverImageUrl || '',
            category: 'Backend Development',
            tags: ['dotnet', 'csharp', 'architecture'],
            author: {
              id: String(item.authorUserId || item.authorStaffId || 1),
              fullName: item.authorStaffId ? 'FPT Faculty Staff' : 'Student Author',
              role: item.authorStaffId ? 'Staff' : 'Student',
              avatarUrl: '',
            },
            likesCount: 0,
            bookmarksCount: 0,
            viewsCount: 0,
            readTimeMinutes: 3,
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          setApiArticles(mapped);

          // Synchronize bookmarks and votes from interaction service
          try {
            const [bList, myVotes] = await Promise.all([
              bookmarkApi.getBookmarks('Article'),
              voteApi.getMyVotes(),
            ]);
            const bMap = new Map<string, number | string>();
            bList.forEach((b) => {
              bMap.set(String(b.targetId), b.id);
            });
            setBookmarkMap(bMap);
            setBookmarkedIds(new Set(Array.from(bMap.keys())));

            const liked = new Set<string>();
            myVotes.forEach((v) => {
              if (v.targetType === 'ARTICLE' && v.voteValue === 1) {
                liked.add(String(v.targetId));
              }
            });
            setLikedIds(liked);

            Promise.allSettled(
              res.items.map(async (art: any) => {
                const aId = String(art.articleId || art.id);
                const stats = await voteApi.getStats('ARTICLE', aId);
                return { aId, score: stats.score };
              })
            ).then((results) => {
              setLikeScores((prev) => {
                const next = { ...prev };
                results.forEach((r: any) => {
                  if (r.status === 'fulfilled' && r.value) {
                    next[r.value.aId] = r.value.score;
                  }
                });
                return next;
              });
            });
          } catch {}
        }
      } catch (err) {
        setApiArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [searchQuery]);

  const allArticles = apiArticles;

  const [seriesList, setSeriesList] = useState<Series[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchSeries = async () => {
      try {
        const res = await seriesApi.getSeriesList({
          search: searchQuery.trim() || undefined,
          pageSize: 20,
        });
        if (isMounted) {
          const items = res?.items || [];
          const mapped: Series[] = items.map((item) => ({
            id: String(item.seriesId),
            title: item.title,
            description: item.description || '',
            author: {
              id: String(item.authorUserId),
              fullName: `Author #${item.authorUserId}`,
              avatarUrl: '',
            },
            itemCount: item.itemCount || 0,
            items: [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
          setSeriesList(mapped);
        }
      } catch (err) {
        if (isMounted) setSeriesList([]);
      }
    };
    fetchSeries();
    return () => { isMounted = false; };
  }, [searchQuery]);

  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isBookmarked = bookmarkedIds.has(id);
    const existingBookmarkId = bookmarkMap.get(id);

    if (isBookmarked && existingBookmarkId) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      try {
        await bookmarkApi.removeBookmark(existingBookmarkId);
        setBookmarkMap((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      } catch (err) {
        console.warn('Failed to remove bookmark:', err);
      }
    } else {
      setBookmarkedIds((prev) => new Set(prev).add(id));
      const numId = Number(id.replace(/\D/g, '')) || 1;
      try {
        const res = await bookmarkApi.addBookmark('Article', numId);
        const bId = res?.bookmark_id ?? res?.data?.bookmark_id ?? res?.id ?? Date.now();
        setBookmarkMap((prev) => new Map(prev).set(id, bId));
      } catch (err) {
        console.warn('Failed to add bookmark:', err);
      }
    }
  };

  const toggleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isLiked = likedIds.has(id);
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(id);
      else next.add(id);
      return next;
    });
    setLikeScores((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (isLiked ? -1 : 1),
    }));

    try {
      await voteApi.vote({
        target_type: 'ARTICLE',
        target_id: numId,
        vote_value: isLiked ? -1 : 1,
      });
      const stats = await voteApi.getStats('ARTICLE', numId);
      setLikeScores((prev) => ({ ...prev, [id]: stats.score }));
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (stats.myVoteValue === 1) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch (err) {
      console.warn('Failed to vote article:', err);
    }
  };

  const categories = [
    'ALL',
    'Development',
    'UI/UX',
    'Database',
    'Career',
    'Backend Development',
    'Software Architecture',
  ];

  const filteredArticles = allArticles
    .filter((art: Article) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        (art.category && art.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.likesCount || 0) - (a.likesCount || 0);
      if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filteredSeries = seriesList.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Title Area (Figma #95:8171) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#181C22] tracking-tight">
              Articles
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
              {activeTab === 'articles' ? `${filteredArticles.length} Articles` : `${filteredSeries.length} Series`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#404753] mt-1">
            Explore practical knowledge and ideas from the community.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'series' ? (
            <button
              onClick={() => setIsSeriesModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Series</span>
            </button>
          ) : (
            <Link
              to="/articles/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Search & Filters Toolbar (Figma #95:7778) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
        {/* Top bar: Search input & Tab switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-[#F8F9FF] border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => setActiveTab('series')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'series'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Series Collections ({seriesList.length})
            </button>
          </div>
        </div>

        {/* Dropdowns row */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="views">Sort: Most Read</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Articles 2-Column Grid (Figma #95:7806) */}
      {activeTab === 'articles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              No articles found matching your criteria.
            </div>
          ) : (
            filteredArticles.map((art) => {
              const isBookmarked = bookmarkedIds.has(art.id) || art.isBookmarked;
              const isLiked = likedIds.has(art.id) || art.isLiked;

              return (
                <div
                  key={art.id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category pill & Date */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
                        {art.category || 'Development'}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(art.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <Link
                        to={`/articles/${art.id}`}
                        className="font-bold text-base text-[#181C22] hover:text-[#0076D1] transition-colors line-clamp-2 block leading-snug"
                      >
                        {art.title}
                      </Link>
                      <p className="text-xs text-[#404753] line-clamp-2 mt-1 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>
                  </div>

                  {/* Author Info & Card Footer */}
                  <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      {/* Author Info */}
                      <div className="flex items-center gap-2">
                        {art.author.avatarUrl ? (
                          <img
                            src={art.author.avatarUrl}
                            alt={art.author.fullName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {art.author.fullName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800 line-clamp-1">
                            {art.author.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {art.author.role || 'Student'}
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-3 text-slate-500 font-semibold">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{art.viewsCount || 0}</span>
                        </span>
                        <button
                          onClick={(e) => toggleLike(art.id, e)}
                          className={`flex items-center gap-1 transition-colors cursor-pointer ${
                            isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
                          }`}
                          title="Like"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                          />
                          <span>{likeScores[art.id] ?? (art.likesCount || 0)}</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <Link
                        to={`/articles/${art.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] hover:text-[#005DA7] transition-colors"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleBookmark(art.id, e)}
                          title={isBookmarked ? 'Unsave article' : 'Save article'}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked ? 'fill-[#0076D1] text-[#0076D1]' : ''
                            }`}
                          />
                        </button>
                        <ContentActionMenu
                          targetType="ARTICLE"
                          targetId={art.id}
                          targetTitle={art.title}
                          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/articles/${art.id}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Series Collections View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSeries.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Series Collection
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {s.itemCount} Articles
                  </span>
                </div>

                <div>
                  <Link
                    to={`/series/${s.id}`}
                    className="font-bold text-base text-[#181C22] hover:text-[#0076D1] transition-colors line-clamp-1 block leading-snug"
                  >
                    {s.title}
                  </Link>
                  <p className="text-xs text-[#404753] line-clamp-2 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={s.author.avatarUrl}
                    alt={s.author.fullName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="font-bold text-slate-800">{s.author.fullName}</span>
                </div>

                <Link
                  to={`/series/${s.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] hover:text-[#005DA7] transition-colors"
                >
                  <span>Explore Series</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Series Modal */}
      <SeriesModal
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
        onSaved={(newSeries: Series) => {
          setSeriesList([newSeries, ...seriesList]);
          setIsSeriesModalOpen(false);
        }}
      />
    </div>
  );
};
