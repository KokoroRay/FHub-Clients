import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HelpCircle,
  EyeOff,
  Tag,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Quote,
  Image as ImageIcon,
  Table as TableIcon,
  List,
  ListOrdered,
  Minus,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { courseNodesApi, semanticTagsApi } from '../../services/api/adminApi';
import { filterCompactCourses } from '../../utils/courseFilter';
import { QuestionPost } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { CourseSelect } from '../../components/common/CourseSelect';
import { questionApi } from '../../services/api/contentApi';
import { MarkdownPreview } from '../../components/common/MarkdownPreview';
import { FALLBACK_ALL_TAGS } from '../../utils/tagUtils';

export interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (question: QuestionPost) => void;
}

interface TagItem {
  id: number;
  name: string;
  count?: number;
}

interface CourseItem {
  id: number;
  code: string;
  title: string;
}

// Fallback tags if API is temporarily unavailable
const DEFAULT_FALLBACK_TAGS: TagItem[] = FALLBACK_ALL_TAGS.map((t) => ({ id: t.id, name: t.name, count: 10 }));
const OLD_UNUSED_TAGS = [
  { id: 101, name: 'csharp', count: 42 },
  { id: 102, name: 'dotnet', count: 38 },
  { id: 103, name: 'efcore', count: 29 },
  { id: 104, name: 'aspnetcore', count: 25 },
  { id: 105, name: 'react', count: 50 },
  { id: 106, name: 'typescript', count: 34 },
  { id: 107, name: 'javascript', count: 45 },
  { id: 108, name: 'java', count: 40 },
  { id: 109, name: 'spring-boot', count: 28 },
  { id: 110, name: 'sql-server', count: 31 },
  { id: 111, name: 'postgresql', count: 22 },
  { id: 112, name: 'docker', count: 18 },
  { id: 113, name: 'git', count: 19 },
  { id: 114, name: 'algorithms', count: 27 },
  { id: 115, name: 'oop', count: 24 },
  { id: 116, name: 'clean-architecture', count: 15 },
  { id: 117, name: 'authentication', count: 16 },
  { id: 118, name: 'jwt', count: 14 },
  { id: 119, name: 'database', count: 33 },
  { id: 120, name: 'winforms', count: 12 },
];

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [availableTags, setAvailableTags] = useState<TagItem[]>(DEFAULT_FALLBACK_TAGS);
  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>('write');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [showAllTagsCloud, setShowAllTagsCloud] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // 1. Load courses & tags on open
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await courseNodesApi.getCourseNodes({ pageSize: 2000 });
        const items = (res as any)?.items || res || [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const filtered = filterCompactCourses(items, currentUser);
          const mapped: CourseItem[] = filtered.map((c: any, index: number) => ({
            id: Number(c.id || c.courseNodeId || index + 1),
            code: c.code || c.courseCode || 'COURSE',
            title: c.name || c.title || c.code || 'Môn học',
          }));
          setCourses(mapped);
          // courseCode remains '' by default so choosing a course is optional!
        }
      } catch (err) {
        console.warn('Failed to load courses in modal:', err);
      }

      try {
        const res = await semanticTagsApi.getTags({ pageSize: 100 });
        const items = (res as any)?.items || (res as any)?.data?.items || res || [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const mapped: TagItem[] = items
            .map((t: any) => ({
              id: Number(t.semanticTagId || t.id),
              name: (t.tagName || t.name || '').toLowerCase().trim(),
              count: t.usageCount || 0,
            }))
            .filter((t: TagItem) => t.name.length > 0);
          if (mapped.length > 0) {
            setAvailableTags(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to load semantic tags:', err);
      }
    };

    if (isOpen) {
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 2. Smart tag suggestions based on title & selected course
  const smartSuggestedTags = useMemo(() => {
    const titleLower = title.toLowerCase();
    const suggestions = new Set<string>();

    const keywordRules: Record<string, string[]> = {
      'c#': ['csharp', 'dotnet'],
      csharp: ['csharp', 'dotnet'],
      dotnet: ['dotnet', 'csharp'],
      '.net': ['dotnet', 'csharp'],
      ef: ['efcore', 'database'],
      efcore: ['efcore', 'dotnet', 'database'],
      linq: ['linq', 'csharp'],
      react: ['react', 'typescript'],
      typescript: ['typescript', 'react'],
      javascript: ['javascript', 'react'],
      java: ['java', 'oop'],
      spring: ['java', 'spring-boot'],
      springboot: ['spring-boot', 'java'],
      sql: ['sql-server', 'database'],
      postgres: ['postgresql', 'database'],
      mysql: ['database'],
      docker: ['docker'],
      git: ['git'],
      github: ['git'],
      auth: ['authentication', 'security'],
      jwt: ['jwt', 'authentication'],
      api: ['api-design'],
      algorithm: ['algorithms'],
      winforms: ['winforms', 'csharp'],
      wpf: ['dotnet', 'csharp'],
      pe: ['Practical Exam (PE)', 'pe'],
      fe: ['Final Exam (FE)', 'fe'],
      pt: ['Progress Test (PT)'],
      assignment: ['Assignment & Project'],
      capstone: ['Capstone Project'],
      ojt: ['On the Job Training (OJT)'],
      figma: ['Thiết kế Đồ họa, 3D & UI/UX', 'ui/ux'],
      ui: ['Thiết kế Đồ họa, 3D & UI/UX'],
      ux: ['Thiết kế Đồ họa, 3D & UI/UX'],
      marketing: ['Digital Marketing & Truyền thông'],
      seo: ['Digital Marketing & Truyền thông'],
      business: ['Kinh doanh, Quản trị & Chuỗi cung ứng'],
      fintech: ['Tài chính, Kế toán & Fintech'],
      law: ['Pháp luật & Luật kinh tế'],
      english: ['Ngoại ngữ (Anh - Nhật - Hàn - Trung)'],
      japanese: ['Ngoại ngữ (Anh - Nhật - Hàn - Trung)'],
    };

    Object.entries(keywordRules).forEach(([keyword, tags]) => {
      if (titleLower.includes(keyword)) {
        tags.forEach((t) => suggestions.add(t));
      }
    });

    if (courseCode) {
      const code = courseCode.toUpperCase();
      if (code.includes('PRN211') || code.includes('PRN221')) {
        ['csharp', 'dotnet', 'efcore', 'winforms'].forEach((t) => suggestions.add(t));
      } else if (code.includes('SWP391')) {
        ['react', 'dotnet', 'teamwork'].forEach((t) => suggestions.add(t));
      } else if (code.includes('DBI202')) {
        ['sql-server', 'database'].forEach((t) => suggestions.add(t));
      } else if (code.includes('PRM392')) {
        ['mobile-app', 'react'].forEach((t) => suggestions.add(t));
      } else if (code.includes('PRO192') || code.includes('PRF192')) {
        ['java', 'oop', 'algorithms'].forEach((t) => suggestions.add(t));
      } else if (code.includes('MKT')) {
        ['Digital Marketing & Truyền thông', 'marketing'].forEach((t) => suggestions.add(t));
      } else if (code.includes('GRA') || code.includes('GD')) {
        ['Thiết kế Đồ họa, 3D & UI/UX', 'figma'].forEach((t) => suggestions.add(t));
      } else if (code.includes('FIN') || code.includes('ACC')) {
        ['Tài chính, Kế toán & Fintech'].forEach((t) => suggestions.add(t));
      } else if (code.includes('BUS') || code.includes('MGT')) {
        ['Kinh doanh, Quản trị & Chuỗi cung ứng'].forEach((t) => suggestions.add(t));
      } else if (code.includes('LAW')) {
        ['Pháp luật & Luật kinh tế'].forEach((t) => suggestions.add(t));
      } else if (code.includes('ENG') || code.includes('JPN') || code.includes('KOR')) {
        ['Ngoại ngữ (Anh - Nhật - Hàn - Trung)'].forEach((t) => suggestions.add(t));
      }
    }

    return Array.from(suggestions)
      .filter((tagName) => !selectedTags.some((st) => st.name.toLowerCase() === tagName.toLowerCase()))
      .slice(0, 6);
  }, [title, courseCode, selectedTags]);

  // 3. Realtime autocomplete tags matching current tag input
  const filteredTags = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    if (!q) return [];
    return availableTags
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) &&
          !selectedTags.some((st) => st.name.toLowerCase() === t.name.toLowerCase())
      )
      .slice(0, 8);
  }, [tagInput, availableTags, selectedTags]);

  // Tag helper actions
  const addTag = (tagOrName: TagItem | string) => {
    if (selectedTags.length >= 5) {
      setErrorMessage(t('askModal.errorTooManyTags', 'Bạn chỉ có thể chọn tối đa 5 thẻ cho một câu hỏi.'));
      return;
    }

    const tagName =
      typeof tagOrName === 'string'
        ? tagOrName.trim().toLowerCase()
        : tagOrName.name.trim().toLowerCase();
    if (!tagName) return;

    if (selectedTags.some((t) => t.name.toLowerCase() === tagName)) {
      setTagInput('');
      return;
    }

    const existing = availableTags.find((t) => t.name.toLowerCase() === tagName);
    const newTag: TagItem = existing || {
      id: typeof tagOrName === 'object' ? tagOrName.id : 0,
      name: tagName,
      count: 1,
    };

    setSelectedTags((prev) => [...prev, newTag]);
    setTagInput('');
    setIsTagDropdownOpen(false);
    setErrorMessage(null);
  };

  const removeTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.name !== tagName));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        addTag(filteredTags[0]);
      } else if (tagInput.trim()) {
        addTag(tagInput.trim());
      }
    } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].name);
    }
  };

  // 4. Markdown Toolbar actions
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const replacement = selectedText
      ? `${prefix}${selectedText}${suffix}`
      : `${prefix}${placeholder}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
      }
    }, 10);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      const newContent = content.substring(0, start) + `\n${prefix}` + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length + 1, start + prefix.length + 1);
      }, 10);
      return;
    }

    const modified = selectedText
      .split('\n')
      .map((line) => `${prefix}${line}`)
      .join('\n');

    setContent(content.substring(0, start) + modified + content.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + modified.length);
    }, 10);
  };

  const insertCodeBlock = (lang: string = 'csharp') => {
    insertFormatting(`\`\`\`${lang}\n`, '\n```\n', '// Nhập đoạn mã của bạn ở đây');
  };

  const insertTable = () => {
    const tableTemplate = `\n| Cột 1 | Cột 2 | Cột 3 |\n| :--- | :--- | :--- |\n| Dữ liệu A | Dữ liệu B | Dữ liệu C |\n| Dữ liệu D | Dữ liệu E | Dữ liệu F |\n`;
    insertFormatting(tableTemplate, '');
  };

  // 5. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 10) {
      setErrorMessage(t('askModal.errorTitleMin', 'Tiêu đề câu hỏi quá ngắn. Vui lòng nhập ít nhất 10 ký tự để người khác dễ hiểu vấn đề.'));
      return;
    }
    if (content.trim().length < 20) {
      setErrorMessage(t('askModal.errorContentMin', 'Nội dung chi tiết câu hỏi cần tối thiểu 20 ký tự.'));
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const matchedCourse = courses.find((c) => c.code === courseCode);
    const numericCourseId = matchedCourse ? matchedCourse.id : undefined;
    const semanticTagIds = selectedTags.filter((t) => t.id > 0).map((t) => t.id);

    try {
      const res = await questionApi.createQuestion({
        title: title.trim(),
        body: content.trim(),
        courseId: numericCourseId,
        isAnonymous,
        semanticTagIds: semanticTagIds.length > 0 ? semanticTagIds : undefined,
      });

      const newQuestion: QuestionPost = {
        id: String(res.questionId),
        title: res.title,
        content: res.body,
        courseCode: courseCode || undefined,
        author: {
          id: isAnonymous ? 'anon' : String(res.authorUserId || currentUser?.id || 'usr'),
          fullName: isAnonymous
            ? 'Ẩn danh FPTer'
            : res.authorDisplayName || currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: isAnonymous ? undefined : currentUser?.avatarUrl,
          role: currentUser?.role || 'Student',
          karma: isAnonymous ? 0 : currentUser?.karma || 0,
          isAnonymous,
          campus: isAnonymous ? undefined : currentUser?.campus || 'FU-HL',
        },
        tags: selectedTags.map((t) => t.name),
        upvotes: 1,
        downvotes: 0,
        userVote: 'UP',
        answersCount: 0,
        viewsCount: 1,
        isSolved: false,
        createdAt: res.createdAt || new Date().toISOString(),
      };

      onCreated(newQuestion);
      resetForm();
      onClose();
    } catch (err: any) {
      console.warn('Failed to create question via API, falling back locally:', err);
      const fallbackQuestion: QuestionPost = {
        id: `q-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        courseCode: courseCode || undefined,
        author: {
          id: isAnonymous ? 'anon' : currentUser?.id || 'usr',
          fullName: isAnonymous ? 'Ẩn danh FPTer' : currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: isAnonymous ? undefined : currentUser?.avatarUrl,
          role: currentUser?.role || 'Student',
          karma: isAnonymous ? 0 : currentUser?.karma || 0,
          isAnonymous,
          campus: isAnonymous ? undefined : currentUser?.campus || 'FU-HL',
        },
        tags: selectedTags.map((t) => t.name),
        upvotes: 1,
        downvotes: 0,
        userVote: 'UP',
        answersCount: 0,
        viewsCount: 1,
        isSolved: false,
        createdAt: new Date().toISOString(),
      };
      onCreated(fallbackQuestion);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCourseCode('');
    setSelectedTags([]);
    setTagInput('');
    setIsAnonymous(false);
    setErrorMessage(null);
    setViewMode('write');
  };

  const charCount = content.trim().length;
  const isContentValid = charCount >= 20;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('askModal.title', 'Đặt câu hỏi thảo luận mới')}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common.cancel', 'Hủy')}</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>{t('askModal.submit', 'Đăng câu hỏi')}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Title */}
        <Input
          label={t('askModal.titleLabel', 'Tiêu đề câu hỏi (Ngắn gọn, trọng tâm vấn đề)')}
          placeholder={t('askModal.titlePlaceholder', 'Ví dụ: Làm sao để xử lý lỗi connection pool timeout trong EF Core?')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* 2. Môn học liên quan (Tùy chọn) & Thẻ phân loại (Tags) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CourseSelect
            label={t('askModal.courseLabel', 'Môn học liên quan')}
            value={courseCode}
            onChange={(code: string) => setCourseCode(code)}
            allowEmpty
            emptyLabel={t('askModal.courseEmpty', '-- Không chọn môn học (Tùy chọn) --')}
          />

          {/* Tags with real-time suggestion & all tags list */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('askModal.tagsLabel', 'Tags (Tự động đề xuất khi điền)')}
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {selectedTags.length}/5 {t('askModal.tagsLimit', 'thẻ')}
              </span>
            </div>

            <div className="relative">
              <div className="flex items-center flex-wrap gap-1 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 min-h-[42px]">
                {selectedTags.map((t) => (
                  <span
                    key={t.name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800"
                  >
                    #{t.name}
                    <button
                      type="button"
                      onClick={() => removeTag(t.name)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                      title="Xóa tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedTags.length < 5 && (
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setIsTagDropdownOpen(true);
                    }}
                    onFocus={() => setIsTagDropdownOpen(true)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={
                      selectedTags.length === 0 ? t('askModal.tagPlaceholderEmpty', 'Nhập tag (dotnet, efcore, react...)') : t('askModal.tagPlaceholderMore', 'Thêm thẻ...')
                    }
                    className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none py-1 px-1"
                  />
                )}
              </div>

              {/* Autocomplete Dropdown when typing */}
              {isTagDropdownOpen && tagInput.trim() && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto p-1 animate-in fade-in">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tagItem) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => addTag(tagItem)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>#{tagItem.name}</span>
                        </span>
                        {tagItem.count ? (
                          <span className="text-[10px] text-slate-400">{tagItem.count} {t('askModal.tagQuestionsSuffix', 'câu hỏi')}</span>
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-slate-500">
                      Nhấn <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border text-[10px]">Enter</kbd> để thêm <strong>#{tagInput.trim().toLowerCase()}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Smart Suggestions & Toggle All Tags */}
            <div className="flex items-center justify-between pt-0.5 text-[11px]">
              {smartSuggestedTags.length > 0 && selectedTags.length < 5 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> {t('askModal.suggestions', 'Gợi ý:')}
                  </span>
                  {smartSuggestedTags.slice(0, 3).map((tagName) => (
                    <button
                      key={tagName}
                      type="button"
                      onClick={() => addTag(tagName)}
                      className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      + #{tagName}
                    </button>
                  ))}
                </div>
              ) : <div />}

              <button
                type="button"
                onClick={() => setShowAllTagsCloud((prev) => !prev)}
                className="text-blue-600 hover:underline cursor-pointer font-semibold ml-auto"
              >
                {showAllTagsCloud ? t('askModal.hideAllTags', 'Ẩn tất cả tag') : t('askModal.showAllTags', 'Tất cả thẻ có sẵn')}
              </button>
            </div>

            {/* Full Tags Cloud */}
            {showAllTagsCloud && (
              <div className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl max-h-32 overflow-y-auto flex items-center flex-wrap gap-1 animate-in fade-in">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.name.toLowerCase() === tag.name.toLowerCase());
                  return (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => (isSelected ? removeTag(tag.name) : addTag(tag))}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-600'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Body Section (StackOverflow Style Rich Editor) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('askModal.contentLabel', 'Chi tiết câu hỏi & Code snippet (Markdown hỗ trợ)')}
            </label>

            {/* View Mode Switcher: Viết / Chia đôi / Xem trước */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('write')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'write'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Chế độ soạn thảo"
              >
                <Edit3 className="w-3 h-3" />
                <span>{t('askModal.modeWrite', 'Viết')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Chế độ chia đôi"
              >
                <Columns className="w-3 h-3" />
                <span>{t('askModal.modeSplit', 'Chia đôi')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Xem trước kết quả"
              >
                <Eye className="w-3 h-3" />
                <span>{t('askModal.modePreview', 'Xem trước')}</span>
              </button>
            </div>
          </div>

          {/* StackOverflow Formatting Toolbar */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center gap-0.5 p-1 bg-[#F8F9FF] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex-wrap text-slate-600 dark:text-slate-400 text-xs">
              <button
                type="button"
                onClick={() => insertLinePrefix('### ')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded font-bold"
                title={t('askModal.toolbarH', 'Tiêu đề (Heading)')}
              >
                H
              </button>
              <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('**', '**', 'in đậm')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarBold', 'In đậm (Bold)')}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*', 'in nghiêng')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarItalic', 'In nghiêng (Italic)')}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('~~', '~~', 'gạch ngang')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarStrike', 'Gạch ngang (Strikethrough)')}
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('`', '`', 'code')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded font-mono"
                title={t('askModal.toolbarInlineCode', 'Mã nội dòng (Inline Code)')}
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertCodeBlock('csharp')}
                className="px-1.5 py-1 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded font-mono font-bold text-[11px] text-blue-600"
                title={t('askModal.toolbarCodeBlock', 'Khối mã nguồn (Code Block)')}
              >
                &lt;/&gt;
              </button>

              <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => insertLinePrefix('> ')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarQuote', 'Trích dẫn (Quote)')}
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://example.com)', 'Tiêu đề link')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarLink', 'Chèn liên kết (Link)')}
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('![Mô tả ảnh](', ')', 'https://')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarImage', 'Chèn ảnh (Image)')}
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarTable', 'Tạo bảng (Table)')}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => insertLinePrefix('- ')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarBulletList', 'Danh sách gạch đầu dòng')}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertLinePrefix('1. ')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarNumberList', 'Danh sách số')}
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n---\n')}
                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"
                title={t('askModal.toolbarDivider', 'Đường kẻ ngang')}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowMarkdownHelp((prev) => !prev)}
                className={`ml-auto p-1.5 rounded transition-colors text-xs font-semibold flex items-center gap-1 ${
                  showMarkdownHelp ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200/70'
                }`}
                title={t('askModal.toolbarSyntax', 'Cú pháp')}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">{t('askModal.toolbarSyntax', 'Cú pháp')}</span>
              </button>
            </div>

            {/* Markdown Cheat Sheet Help */}
            {showMarkdownHelp && (
              <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-slate-700 dark:text-slate-300 animate-in fade-in">
                <div><code>**in đậm**</code></div>
                <div><code>*in nghiêng*</code></div>
                <div><code>`code nội dòng`</code></div>
                <div><code>```csharp ... ```</code></div>
                <div><code>&gt; trích dẫn</code></div>
                <div><code>- danh sách</code></div>
                <div><code>[Tiêu đề](link)</code></div>
                <div><code>| Cột 1 | Cột 2 |</code></div>
              </div>
            )}

            {/* Editor Input: Write / Split / Preview */}
            {viewMode === 'write' && (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('askModal.placeholderWrite', 'Mô tả hoàn cảnh gặp lỗi, các bước đã thử và mong muốn được hỗ trợ...')}
                rows={7}
                className="w-full p-3 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-900 focus:outline-none resize-y"
                required
              />
            )}

            {viewMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[190px]">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('askModal.placeholderSplit', 'Gõ nội dung markdown bên trái, xem kết quả bên phải...')}
                  rows={7}
                  className="w-full p-3 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-900 focus:outline-none resize-none"
                  required
                />
                <div className="p-3 bg-slate-50/50 dark:bg-slate-950/40 overflow-y-auto max-h-[260px]">
                  <MarkdownPreview content={content} />
                </div>
              </div>
            )}

            {viewMode === 'preview' && (
              <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 min-h-[190px] max-h-[300px] overflow-y-auto">
                <MarkdownPreview content={content} />
              </div>
            )}

            {/* Character count bar */}
            <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{t('askModal.charCountHelper', 'Hỗ trợ Markdown & Code highlighting')}</span>
              <div className="flex items-center gap-1">
                <span
                  className={`font-semibold ${
                    isContentValid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {charCount} / 20 {t('askModal.charCountMin', 'ký tự tối thiểu')}
                </span>
                {isContentValid && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Anonymity Checkbox (Giữ nguyên giao diện thành phần cũ) */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-4 h-4 text-purple-600" />
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {t('askModal.anonymousTitle', 'Đăng ẩn danh (Anonymous Post)')}
              </span>
              <p className="text-[11px] text-slate-400">
                {t('askModal.anonymousDesc', 'Tên và mã sinh viên của bạn sẽ được ẩn hoàn toàn đối với cộng đồng.')}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </form>
    </Modal>
  );
};
