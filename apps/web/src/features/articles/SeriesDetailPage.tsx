import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, ArrowRight, Edit3, Trash2, Plus, BookOpen, CheckCircle2 } from 'lucide-react';
import { SeriesModal } from './SeriesModal';
import { Series } from '../../types';

export const SeriesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [series, setSeries] = useState<Series>({
    id: id || 'series-1',
    title: '.NET Microservices & Clean Architecture Playbook',
    description:
      'Tuyển tập chuỗi bài viết hướng dẫn xây dựng giải pháp Microservices hoàn chỉnh từ zero cho sinh viên ngành SE/SWP391. Bao gồm kiến trúc phân tầng Clean Architecture, Docker Compose, xác thực JWT và kết nối PostgreSQL.',
    author: {
      id: 'u-1',
      fullName: 'Le Quang Huy',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    itemCount: 4,
    items: [
      {
        id: 'item-1',
        type: 'ARTICLE',
        title: 'Phần 1: Khởi tạo Solution với Clean Architecture Template',
        orderIndex: 1,
        url: '/articles/art-1',
      },
      {
        id: 'item-2',
        type: 'WORKFLOW',
        title: 'Phần 2: Dockerize PostgreSQL & RabbitMQ local environment',
        orderIndex: 2,
        url: '/workflows/wf-1',
      },
      {
        id: 'item-3',
        type: 'ARTICLE',
        title: 'Phần 3: Triển khai Authentication Service với JWT & Refresh Token',
        orderIndex: 3,
        url: '/articles/art-2',
      },
      {
        id: 'item-4',
        type: 'QUESTION',
        title: 'Thảo luận giải đáp thắc mắc: Connection Pool & Entity Framework Core',
        orderIndex: 4,
        url: '/discussions/q-1',
      },
    ],
    createdAt: '2025-01-10T12:00:00Z',
    updatedAt: '2025-02-15T09:30:00Z',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDeleteSeries = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ Series này không?')) {
      navigate('/articles');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Articles & Series
        </Link>
      </div>

      {/* Series Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
              <Layers className="w-3.5 h-3.5" />
              <span>Curated Series • {series.items.length} Chuyên mục</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {series.title}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {series.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Sửa Series</span>
            </button>
            <button
              onClick={handleDeleteSeries}
              className="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xóa Series"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <img
            src={series.author.avatarUrl}
            alt={series.author.fullName}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div>
            <span className="font-bold text-slate-800 block">{series.author.fullName}</span>
            <span className="text-[10px] text-slate-400">Tác giả biên soạn</span>
          </div>
        </div>
      </div>

      {/* Series Content Roadmap / Chapters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
          MỤC LỤC SERIES ({series.items.length} BÀI HỌC)
        </h3>

        <div className="divide-y divide-slate-100">
          {series.items.map((item, idx) => (
            <div
              key={item.id}
              className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors px-2 rounded-xl group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0076D1] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-[#0076D1] group-hover:text-white transition-colors">
                  0{idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {item.type}
                    </span>
                  </div>
                  <Link
                    to={item.url}
                    className="font-bold text-xs text-slate-800 group-hover:text-[#0076D1] transition-colors leading-snug block"
                  >
                    {item.title}
                  </Link>
                </div>
              </div>

              <Link
                to={item.url}
                className="text-xs font-semibold text-[#0076D1] group-hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Học ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <SeriesModal
        isOpen={isEditModalOpen}
        initialSeries={series}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={(updated) => setSeries(updated)}
      />
    </div>
  );
};
