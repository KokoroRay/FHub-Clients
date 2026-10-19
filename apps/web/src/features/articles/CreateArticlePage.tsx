import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { articleApi, alumniApi } from '../../services/api/contentApi';
import { useAuth } from '../../context/AuthContext';

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Backend Development');
  const [isAlumniArticle, setIsAlumniArticle] = useState(currentUser?.role === 'Alumni');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('dotnet, architecture, clean-code');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 10) {
      setErrorMessage('Tiêu đề bài viết cần ít nhất 10 ký tự.');
      return;
    }
    if (summary.trim().length < 15) {
      setErrorMessage('Tóm tắt ngắn bài viết cần ít nhất 15 ký tự.');
      return;
    }
    if (content.trim().length < 30) {
      setErrorMessage('Nội dung bài viết quá ngắn. Cần tối thiểu 30 ký tự.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (isAlumniArticle || currentUser?.role === 'Alumni') {
        await alumniApi.createCareerArticle({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim(),
          coverImageUrl: coverUrl.trim() || undefined,
          status: 'PUBLISHED',
        });
      } else {
        await articleApi.createArticle({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim(),
          coverImageUrl: coverUrl.trim() || undefined,
          status: 'PUBLISHED',
        });
      }
      navigate('/articles');
    } catch (err: any) {
      console.warn('Backend article create notice:', err);
      // If backend throws an error or requires specific role, show feedback
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo bài viết.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6 w-full">
      <Link to="/articles" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
      </Link>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0076D1]" />
            <span>Viết bài viết công nghệ mới</span>
          </h1>
        </CardHeader>
        <CardBody className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <input
                type="checkbox"
                id="alumniCheckbox"
                checked={isAlumniArticle}
                onChange={(e) => setIsAlumniArticle(e.target.checked)}
                className="w-4 h-4 text-[#0076D1] rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="alumniCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                Đăng dưới danh nghĩa Cựu sinh viên (Alumni Industry & Career Guidance)
              </label>
            </div>

            <Input
              label="Tiêu đề bài viết"
              placeholder="Ví dụ: Hướng dẫn Clean Architecture với CQRS trong ASP.NET Core"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Chuyên mục"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Backend Development', label: 'Backend Development' },
                  { value: 'Software Architecture', label: 'Software Architecture' },
                  { value: 'Frontend & Web', label: 'Frontend & Web' },
                  { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
                  { value: 'AI & Data Science', label: 'AI & Data Science' },
                ]}
              />

              <Input
                label="Tags (Cách nhau bằng dấu phẩy)"
                placeholder="csharp, mediatr, architecture"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <Input
              label="Link ảnh bìa Cover Image (Tùy chọn)"
              placeholder="https://images.unsplash.com/..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              leftIcon={<ImageIcon className="w-4 h-4" />}
            />

            <Textarea
              label="Tóm tắt ngắn (1-2 câu)"
              placeholder="Tóm tắt ngắn gọn nội dung bài viết để hiển thị trên danh sách..."
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />

            <Textarea
              label="Nội dung bài viết (Hỗ trợ Markdown và Code snippet)"
              placeholder="Nhập nội dung bài viết chi tiết..."
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/articles')}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                Đăng bài viết (+30 Karma)
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
