import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { articleApi, alumniApi } from '../../services/api/contentApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadAllSemanticTags, FALLBACK_ALL_TAGS, SemanticTagItem } from '../../utils/tagUtils';

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Học thuật & Trải nghiệm sinh viên');
  const [isAlumniArticle, setIsAlumniArticle] = useState(currentUser?.role === 'Alumni');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('kinh-nghiem, hoc-tap, sinh-vien-fpt');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<SemanticTagItem[]>(FALLBACK_ALL_TAGS);

  useEffect(() => {
    loadAllSemanticTags().then((loaded) => {
      if (loaded && loaded.length > 0) setAllTags(loaded);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 10) {
      setErrorMessage(t('articleCreate.errorTitleMin', 'Tiêu đề bài viết cần ít nhất 10 ký tự.'));
      return;
    }
    if (summary.trim().length < 15) {
      setErrorMessage(t('articleCreate.errorSummaryMin', 'Tóm tắt ngắn bài viết cần ít nhất 15 ký tự.'));
      return;
    }
    if (content.trim().length < 30) {
      setErrorMessage(t('articleCreate.errorContentMin', 'Nội dung bài viết quá ngắn. Cần tối thiểu 30 ký tự.'));
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      // Resolve semanticTagIds from selected category and input tags
      const tagTokens = [category, ...tags.split(',').map((t) => t.trim().toLowerCase())].filter(Boolean);
      const matchedTagIds: number[] = [];
      allTags.forEach((t) => {
        const tLower = t.name.toLowerCase();
        if (tagTokens.some((tok) => tok.length > 2 && (tLower.includes(tok) || tok.includes(tLower)))) {
          matchedTagIds.push(t.id);
        }
      });
      // Fallback tag if empty (12: EduNext & Học tập hoặc 7: Survival Tips)
      if (matchedTagIds.length === 0) matchedTagIds.push(7);

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
          semanticTagIds: matchedTagIds,
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
        <ArrowLeft className="w-4 h-4" /> {t('articleCreate.backToList', 'Quay lại danh sách bài viết')}
      </Link>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0076D1]" />
            <span>{t('articleCreate.pageTitle', 'Viết bài viết & Chia sẻ kiến thức')}</span>
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
                {t('articleCreate.alumniCheckbox', 'Đăng dưới danh nghĩa Cựu sinh viên (Alumni Industry & Career Guidance)')}
              </label>
            </div>

            <Input
              label={t('articleCreate.titleLabel', 'Tiêu đề bài viết')}
              placeholder={t('articleCreate.titlePlaceholder', 'Ví dụ: Kinh nghiệm đạt điểm cao đồ án Capstone, Hướng dẫn xây dựng chiến dịch Digital Marketing...')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label={t('articleCreate.categoryLabel', 'Chuyên mục')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Học thuật & Trải nghiệm sinh viên', label: 'Học thuật & Trải nghiệm sinh viên (FPT Survival)' },
                  { value: 'Lập trình & Kỹ thuật phần mềm', label: 'Kỹ thuật phần mềm & Lập trình' },
                  { value: 'Thiết kế Đồ họa, 3D & UI/UX', label: 'Thiết kế Đồ họa, Mỹ thuật số & UI/UX' },
                  { value: 'Kinh doanh, Quản trị & Chuỗi cung ứng', label: 'Kinh doanh, Quản trị & Chuỗi cung ứng' },
                  { value: 'Digital Marketing & Truyền thông', label: 'Digital Marketing & Truyền thông' },
                  { value: 'Tài chính, Kế toán & Fintech', label: 'Tài chính, Kế toán & Fintech' },
                  { value: 'Du lịch, Khách sạn & Sự kiện', label: 'Du lịch, Khách sạn & Sự kiện' },
                  { value: 'Pháp luật & Luật kinh tế', label: 'Luật kinh tế & Pháp lý' },
                  { value: 'Ngoại ngữ (Anh - Nhật - Hàn - Trung)', label: 'Ngoại ngữ (Anh - Nhật - Hàn - Trung)' },
                  { value: 'Trí tuệ nhân tạo & Khoa học dữ liệu', label: 'Trí tuệ nhân tạo & Khoa học dữ liệu' },
                  { value: 'An toàn thông tin & Mạng máy tính', label: 'An toàn thông tin & Mạng' },
                  { value: 'Khởi nghiệp & Đổi mới sáng tạo', label: 'Khởi nghiệp & Đổi mới sáng tạo' },
                ]}
              />

              <Input
                label={t('articleCreate.tagsLabel', 'Tags (Cách nhau bằng dấu phẩy)')}
                placeholder="swp391, mkt101, figma, assignment, kinh-nghiem..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <Input
              label={t('articleCreate.coverLabel', 'Link ảnh bìa Cover Image (Tùy chọn)')}
              placeholder="https://images.unsplash.com/..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              leftIcon={<ImageIcon className="w-4 h-4" />}
            />

            <Textarea
              label={t('articleCreate.summaryLabel', 'Tóm tắt ngắn (1-2 câu)')}
              placeholder={t('articleCreate.summaryPlaceholder', 'Tóm tắt ngắn gọn nội dung bài viết để hiển thị trên danh sách...')}
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />

            <Textarea
              label={t('articleCreate.contentLabel', 'Nội dung bài viết (Hỗ trợ Markdown và Code snippet)')}
              placeholder={t('articleCreate.contentPlaceholder', 'Nhập nội dung bài viết chi tiết...')}
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/articles')}>{t('common.cancel', 'Hủy')}</Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                {t('articleCreate.publish', 'Đăng bài viết (+30 Karma)')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
