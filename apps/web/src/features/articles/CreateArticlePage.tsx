import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { FileText, ArrowLeft, ImagePlus, AlertCircle, AlertTriangle, Loader2, X, Award } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { articleApi, alumniApi, contentMediaApi } from '../../services/api/contentApi';
import { apiClient } from '../../services/api/client';
import { IMAGE_ACCEPT, validateImage } from '../../utils/mediaUtils';
import { isUserAlumni } from '../../utils/fptEmailValidator';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadAllSemanticTags, FALLBACK_ALL_TAGS, SemanticTagItem } from '../../utils/tagUtils';
import { ArticleEditor, finalizeContentImages } from '../../components/common/ArticleEditor';

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { t } = useLanguage();
  const isAlumni = isUserAlumni(currentUser);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Học thuật & Trải nghiệm sinh viên');
  const [summary, setSummary] = useState('');

  const [content, setContent] = useState('');

  const [tags, setTags] = useState('kinh-nghiem, hoc-tap, sinh-vien-fpt');

  const [coverUrl, setCoverUrl] = useState('');

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [isUploadingContent, setIsUploadingContent] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const coverBusyRef = useRef(false);

  const pendingCoverFile = useRef<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorBannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorMessage) {
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errorMessage]);

  const [allTags, setAllTags] = useState<SemanticTagItem[]>(FALLBACK_ALL_TAGS);

  useEffect(() => {

    loadAllSemanticTags().then((loaded) => {

      if (loaded && loaded.length > 0) setAllTags(loaded);

    });

  }, []);

  const uploadCover = (file?: File) => {

    if (!file || coverBusyRef.current || isSubmitting) return;

    try {

      validateImage(file);

      setErrorMessage(null);

      if (coverUrl && coverUrl.startsWith('blob:')) {

        URL.revokeObjectURL(coverUrl);

      }

      pendingCoverFile.current = file;

      const preview = URL.createObjectURL(file);

      setCoverUrl(preview);

    } catch (error) {

      setErrorMessage(error instanceof Error ? error.message : t('Không tải được ảnh bìa. Vui lòng thử lại.'));

    }

  };

  const removeCover = () => {

    if (coverUrl) {

      if (coverUrl.startsWith('blob:')) {

        URL.revokeObjectURL(coverUrl);

      } else {

        contentMediaApi.deleteMedia(coverUrl);

      }

    }

    pendingCoverFile.current = null;

    setCoverUrl('');

  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (isSubmitting || isUploadingCover || isUploadingContent) return;

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

    let finalCoverUrl = coverUrl;
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

      // Upload cover image to R2 only when user actually submits

      if (pendingCoverFile.current) {

        setIsUploadingCover(true);

        try {

          const result = await contentMediaApi.uploadMedia(pendingCoverFile.current, 'article');

          finalCoverUrl = result.publicUrl;

          if (coverUrl.startsWith('blob:')) {

            URL.revokeObjectURL(coverUrl);

          }

        } catch (err: any) {
          setIsUploadingCover(false);
          setIsSubmitting(false);
          if (coverUrl.startsWith('blob:')) {
            URL.revokeObjectURL(coverUrl);
          }
          pendingCoverFile.current = null;
          setCoverUrl('');
          const serverCode = err?.response?.data?.code;
          const msg = err?.response?.data?.message || err?.message;
          const isSevere =
            serverCode === 'CONTENT_VIOLATION_SEVERE' ||
            serverCode === 'CONTENT_MODERATION_REJECTED' ||
            msg?.includes('18+') ||
            msg?.includes('nhạy cảm') ||
            msg?.includes('tiêu chuẩn');

          setErrorMessage(
            isSevere
              ? t('articleCreate.errorCoverViolation', 'Ảnh bìa có dấu hiệu vi phạm Tiêu chuẩn cộng đồng (18+ / nhạy cảm). Ảnh đã bị gỡ bỏ, bạn hãy chọn ảnh bìa khác hợp lệ.')
              : (msg || t('Không tải được ảnh bìa lên hệ thống.'))
          );
          return;
        } finally {

          setIsUploadingCover(false);

        }

      }

      // Finalize all deferred images inside the article content

      const finalContent = await finalizeContentImages(content.trim(), 'article');

      let createdResult: any = null;
      if (isAlumni) {
        createdResult = await alumniApi.createCareerArticle({

          title: title.trim(),

          content: finalContent,

          summary: summary.trim(),

          coverImageUrl: finalCoverUrl.trim() || undefined,

          status: 'PUBLISHED',

        });

      } else {

        createdResult = await articleApi.createArticle({

          title: title.trim(),

          content: finalContent,

          summary: summary.trim(),

          coverImageUrl: finalCoverUrl.trim() || undefined,

          status: 'PUBLISHED',

          semanticTagIds: matchedTagIds,

        });

      }

      if (createdResult?.status === 'PENDING_REVIEW') {

        alert(t("Đăng bài thành công! Bài viết của bạn đang được Ban quản trị duyệt trước khi xuất bản. Bạn có thể theo dõi tại mục Tạm giữ & Kháng cáo trên trang cá nhân."));

        navigate('/profile?tab=quarantine');

        return;

      }

      // Award +10 Karma points for publishing an academic article

      try {

        const articleId = createdResult?.articleId || createdResult?.id;

        if (currentUser?.id) {

          await apiClient.post('/api/reputation/events', {

            user_id: Number(currentUser.id),

            rule_code: 'ARTICLE_PUBLISHED',

            source_type: 'Article',

            source_id: articleId ? Number(articleId) : undefined,

          });

          updateUser?.({ karma: ((currentUser as any)?.karma || 0) + 10 });

        }

      } catch (repErr) {

        console.warn('Could not award article publication karma:', repErr);

      }

      navigate('/articles');

    } catch (err: any) {

      console.warn('Backend article create notice:', err);

      if (finalCoverUrl && !finalCoverUrl.startsWith('blob:')) {

        contentMediaApi.deleteMedia(finalCoverUrl).catch(() => {});

      }

      pendingCoverFile.current = null;

      setCoverUrl('');

      // If backend throws an error or requires specific role, show feedback

      const msg = err.response?.data?.message || err.message || t("Lỗi khi tạo bài viết.");

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
            <div
              ref={errorBannerRef}
              role="alert"
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 dark:from-rose-950/60 dark:via-red-950/40 dark:to-orange-950/30 border-2 border-rose-400 dark:border-rose-600 text-rose-900 dark:text-rose-200 shadow-lg shadow-rose-500/10 flex items-start justify-between gap-3 transition-all duration-300 ring-4 ring-rose-500/10 animate-[bounce_0.5s_ease-in-out]"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 shadow-sm animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                      {t('Cảnh báo vi phạm')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-rose-800 dark:text-rose-200">
                    {t(errorMessage)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shrink-0"
                aria-label={t('common.close', 'Đóng')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {isAlumni && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('articleCreate.alumniAutoBadge', 'Tài khoản Cựu sinh viên (K17 trở về trước). Bài viết sẽ tự động mang huy hiệu Cựu sinh viên & Hướng nghiệp (Alumni Career).')}</span>
              </div>
            )}

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

                  { value: 'Học thuật & Trải nghiệm sinh viên', label: t("Học thuật & Trải nghiệm sinh viên (FPT Survival)") },

                  { value: 'Lập trình & Kỹ thuật phần mềm', label: t("Kỹ thuật phần mềm & Lập trình") },

                  { value: 'Thiết kế Đồ họa, 3D & UI/UX', label: t("Thiết kế Đồ họa, Mỹ thuật số & UI/UX") },

                  { value: 'Kinh doanh, Quản trị & Chuỗi cung ứng', label: t("Kinh doanh, Quản trị & Chuỗi cung ứng") },

                  { value: 'Digital Marketing & Truyền thông', label: t("Digital Marketing & Truyền thông") },

                  { value: 'Tài chính, Kế toán & Fintech', label: t("Tài chính, Kế toán & Fintech") },

                  { value: 'Du lịch, Khách sạn & Sự kiện', label: t("Du lịch, Khách sạn & Sự kiện") },

                  { value: 'Pháp luật & Luật kinh tế', label: t("Luật kinh tế & Pháp lý") },

                  { value: 'Ngoại ngữ (Anh - Nhật - Hàn - Trung)', label: t("Ngoại ngữ (Anh - Nhật - Hàn - Trung)") },

                  { value: 'Trí tuệ nhân tạo & Khoa học dữ liệu', label: t("Trí tuệ nhân tạo & Khoa học dữ liệu") },

                  { value: 'An toàn thông tin & Mạng máy tính', label: t("An toàn thông tin & Mạng") },

                  { value: 'Khởi nghiệp & Đổi mới sáng tạo', label: t("Khởi nghiệp & Đổi mới sáng tạo") },

                ]}

              />

              <Input

                label={t('articleCreate.tagsLabel', 'Tags (Cách nhau bằng dấu phẩy)')}

                placeholder={t("swp391, mkt101, figma, assignment, kinh-nghiem...")}

                value={tags}

                onChange={(e) => setTags(e.target.value)}

              />

            </div>

            <div className="space-y-2">

              <span className="block text-sm font-semibold text-slate-700">{t('Ảnh bìa (tùy chọn)')}</span>

              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-blue-300"

                onDragOver={(event) => event.preventDefault()}

                onDrop={(event) => { event.preventDefault(); void uploadCover(event.dataTransfer.files[0]); }} aria-busy={isUploadingCover}>

                {coverUrl ? (

                  <>

                    <img src={coverUrl} alt={t('Ảnh bìa bài viết')} className="max-h-72 w-full object-cover" />

                    <div className="absolute right-3 top-3 flex gap-2">

                      <button type="button" disabled={isUploadingCover || isSubmitting} onClick={() => coverInputRef.current?.click()} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold shadow">{t('Thay ảnh')}</button>

                      <button type="button" aria-label={t('Xóa ảnh bìa')} disabled={isUploadingCover || isSubmitting} onClick={removeCover} className="rounded-lg bg-white p-2 text-rose-600 shadow"><X className="h-4 w-4" /></button>

                    </div>

                  </>

                ) : (

                  <button type="button" disabled={isUploadingCover || isSubmitting} onClick={() => coverInputRef.current?.click()} className="flex w-full flex-col items-center gap-2 p-8 text-slate-500 disabled:opacity-50">

                    <ImagePlus className="h-7 w-7 text-blue-500" />

                    <span className="text-sm font-semibold text-slate-700">{t('Chọn hoặc kéo thả ảnh bìa vào đây')}</span>

                    <span className="text-xs">{t('PNG, JPG, WebP hoặc GIF · Tối đa 10MB')}</span>

                  </button>

                )}

                {isUploadingCover && <div role="status" className="absolute inset-0 flex items-center justify-center gap-2 bg-white/85 text-sm text-blue-700"><Loader2 className="h-5 w-5 animate-spin" />{t('Đang tải ảnh bìa…')}</div>}

              </div>

              <input ref={coverInputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" aria-label={t('Chọn ảnh bìa')} onChange={(event) => { void uploadCover(event.target.files?.[0]); event.target.value = ''; }} />

            </div>

            <Textarea

              label={t('articleCreate.summaryLabel', 'Tóm tắt ngắn (1-2 câu)')}

              placeholder={t('articleCreate.summaryPlaceholder', 'Tóm tắt ngắn gọn nội dung bài viết để hiển thị trên danh sách...')}

              rows={2}

              value={summary}

              onChange={(e) => setSummary(e.target.value)}

              required

            />

            <Suspense fallback={<p role="status" className="py-8 text-center text-sm text-slate-400">{t('Đang tải trình soạn thảo…')}</p>}>

              <ArticleEditor onChange={setContent} onUploadingChange={setIsUploadingContent} disabled={isSubmitting} />

            </Suspense>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">

              <Button variant="outline" type="button" onClick={() => navigate('/articles')}>{t('common.cancel', 'Hủy')}</Button>

              <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={isUploadingCover || isUploadingContent}>

                {t('articleCreate.publish', 'Đăng bài viết (+30 Karma)')}

              </Button>

            </div>

          </form>

        </CardBody>

      </Card>

    </div>

  );

};

