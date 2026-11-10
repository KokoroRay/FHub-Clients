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

  UploadCloud,

  Plus,

  Globe,

  Loader2,

  FileCode,

} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import { apiClient } from '../../services/api/client';

import { useLanguage } from '../../context/LanguageContext';

import { courseNodesApi, semanticTagsApi } from '../../services/api/adminApi';

import { filterCompactCourses } from '../../utils/courseFilter';

import { QuestionPost } from '../../types';

import { Modal } from '../../components/common/Modal';

import { Button } from '../../components/common/Button';

import { Input, Select } from '../../components/common/Input';

import { CourseSelect } from '../../components/common/CourseSelect';

import { questionApi, contentMediaApi } from '../../services/api/contentApi';

import { MarkdownPreview } from '../../components/common/MarkdownPreview';

import { normalizeMediaUrl } from '../../utils/mediaUtils';

import { FALLBACK_ALL_TAGS } from '../../utils/tagUtils';
import { scanImageSkinTone } from '../../utils/imageModeration';

export interface AskQuestionModalProps {

  isOpen: boolean;

  onClose: () => void;

  onCreated: (question: QuestionPost) => void;

  initialTitle?: string;

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

interface AttachedMediaItem {

  id: string;

  name: string;

  url: string;

  type: 'image' | 'gif';

  sizeBytes?: number;

  file?: File;

  isPendingUpload?: boolean;

}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({

  isOpen,

  onClose,

  onCreated,

  initialTitle = '',

}) => {

  const navigate = useNavigate();

  const { currentUser, updateUser } = useAuth();

  const { t } = useLanguage();

  const [title, setTitle] = useState(initialTitle || '');

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for visual media & code snippet features

  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [showCodeModal, setShowCodeModal] = useState(false);

  const [snippetLanguage, setSnippetLanguage] = useState('csharp');

  const [snippetCode, setSnippetCode] = useState('');

  const [snippetFileName, setSnippetFileName] = useState('');

  const [attachedMedia, setAttachedMedia] = useState<AttachedMediaItem[]>([]);

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

            title: c.name || c.title || c.code || t("Môn học"),

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

    insertFormatting(`\`\`\`${lang}\n`, '\n```\n', t("// Nhập đoạn mã của bạn ở đây"));

  };

  // Media attachment: Store locally as preview, defer R2 upload until user clicks Submit!
  const handleMediaUpload = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage(t('askModal.errorInvalidMedia', 'Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh hoặc GIF (PNG, JPG, WebP, GIF).'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(t('askModal.errorMediaSize', 'Dung lượng ảnh/GIF không được vượt quá 15MB.'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Always clear error message when user attaches or replaces an image
    setErrorMessage(null);

    try {
      const cleanName = (file.name || 'image').replace(/[\[\]()]/g, '');
      const isGif = file.type.toLowerCase().includes('gif') || cleanName.toLowerCase().endsWith('.gif');
      const previewUrl = URL.createObjectURL(file);
      const newMediaItem: AttachedMediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        url: previewUrl,
        type: isGif ? 'gif' : 'image',
        sizeBytes: file.size,
        file: file,
        isPendingUpload: true,
      };
      setAttachedMedia((prev) => [...prev, newMediaItem]);
    } catch (err: any) {
      console.error('Failed to attach media preview:', err);
      setErrorMessage(t('askModal.errorMediaUploadFailed', 'Chuẩn bị ảnh/GIF thất bại. Vui lòng thử lại.'));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachedMedia = (id: string) => {
    setAttachedMedia((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        if (target.isPendingUpload && target.url.startsWith('blob:')) {
          URL.revokeObjectURL(target.url);
        } else if (!target.isPendingUpload) {
          // If it was already uploaded to R2, delete from R2 directly!
          contentMediaApi.deleteMedia(target.url);
        }
      }
      return prev.filter((item) => item.id !== id);
    });
    // Clear moderation warning when user removes an attached image
    setErrorMessage(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {

    const items = e.clipboardData?.items;

    if (!items) return;

    for (let i = 0; i < items.length; i++) {

      const item = items[i];

      if (item.kind === 'file' && item.type.startsWith('image/')) {

        const file = item.getAsFile();

        if (file) {

          e.preventDefault();

          handleMediaUpload(file);

          return;

        }

      }

    }

  };

  const openCodeSnippetModal = () => {

    const textarea = textareaRef.current;

    if (textarea) {

      const selectedText = content.substring(textarea.selectionStart, textarea.selectionEnd);

      if (selectedText.trim()) {

        setSnippetCode(selectedText);

      }

    }

    setShowCodeModal(true);

  };

  const handleInsertSnippet = () => {

    if (!snippetCode.trim()) return;

    const formattedSnippet = snippetFileName.trim()

      ? `\n**\`${snippetFileName.trim()}\`**\n\`\`\`${snippetLanguage}\n${snippetCode}\n\`\`\`\n`

      : `\n\`\`\`${snippetLanguage}\n${snippetCode}\n\`\`\`\n`;

    insertFormatting(formattedSnippet, '');

    setShowCodeModal(false);

    setSnippetCode('');

    setSnippetFileName('');

  };

  const previewFullContent = useMemo(() => {

    const mediaMd = attachedMedia.map((m) => `![${m.name}](${m.url})`).join('\n\n');

    if (!content.trim()) {

      return mediaMd;

    }

    return mediaMd ? `${content.trim()}\n\n${mediaMd}` : content.trim();

  }, [content, attachedMedia]);

  const insertTable = () => {

    const tableTemplate = t("\n| Cột 1 | Cột 2 | Cột 3 |\n| :--- | :--- | :--- |\n| Dữ liệu A | Dữ liệu B | Dữ liệu C |\n| Dữ liệu D | Dữ liệu E | Dữ liệu F |\n");

    insertFormatting(tableTemplate, '');

  };

  // 5. Submit Handler

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (title.trim().length < 10) {

      setErrorMessage(t('askModal.errorTitleMin', 'Tiêu đề câu hỏi quá ngắn. Vui lòng nhập ít nhất 10 ký tự để người khác dễ hiểu vấn đề.'));

      return;

    }

    const hasEnoughContent = content.trim().length >= 20 || (content.trim().length >= 10 && attachedMedia.length > 0);

    if (!hasEnoughContent) {

      setErrorMessage(t('askModal.errorContentMin', 'Nội dung chi tiết câu hỏi cần tối thiểu 20 ký tự (hoặc 10 ký tự nếu đã đính kèm ảnh/GIF).'));

      return;

    }

    setErrorMessage(null);

    setIsSubmitting(true);

    const matchedCourse = courses.find((c) => c.code === courseCode);

    const numericCourseId = matchedCourse ? matchedCourse.id : undefined;

    const semanticTagIds = selectedTags.filter((t) => t.id > 0).map((t) => t.id);

    // 1. Scan image in local temporary environment (in-memory/blob) BEFORE uploading to R2!
    for (const media of attachedMedia) {
      if (media.isPendingUpload && media.file) {
        // Check filename for sensitive keywords
        const sensitiveFileWords = ['nude', 'sex', 'porn', 'anh-nong', 'anh_nong', 'clip-nong', '18plus', '18+', 'xxx', 'hentai', 'fuck', 'dick', 'pussy', 'boobs'];
        if (sensitiveFileWords.some((w) => media.file!.name.toLowerCase().includes(w))) {
          setAttachedMedia((prev) => prev.filter((m) => m.id !== media.id));
          if (media.url && media.url.startsWith('blob:')) {
            URL.revokeObjectURL(media.url);
          }
          setErrorMessage(t('askModal.errorSensitiveFile', 'Tên tệp hình ảnh vi phạm Tiêu chuẩn cộng đồng (chứa từ khóa nhạy cảm / 18+). Hình ảnh vi phạm đã bị gỡ bỏ, vui lòng chọn hình ảnh khác hợp lệ hoặc chỉnh sửa nội dung để tiếp tục đăng bài.'));
          setIsSubmitting(false);
          return;
        }

        try {
          const scan = await scanImageSkinTone(media.file);
          if (scan.action === 'AUTO_REJECT') {
            // Auto-reject: Do NOT upload to R2! Keep image in temporary memory and reject here!
            setAttachedMedia((prev) => prev.filter((m) => m.id !== media.id));
            if (media.url && media.url.startsWith('blob:')) {
              URL.revokeObjectURL(media.url);
            }
            setErrorMessage(
              scan.reason ||
              t('askModal.errorModeration', 'Hình ảnh hoặc nội dung vi phạm Tiêu chuẩn cộng đồng (Hình ảnh vi phạm nghiêm trọng chứa nội dung mang tính chất 18+, khiêu dâm hoặc khỏa thân). Hình ảnh vi phạm đã bị gỡ bỏ, bạn hãy chọn hình ảnh khác hợp lệ hoặc chỉnh sửa nội dung để tiếp tục đăng bài.')
            );
            setIsSubmitting(false);
            return; // Stay in modal!
          }
        } catch (e) {
          console.warn('Error during local image pre-scan:', e);
        }
      }
    }

    const uploadedMediaItems: AttachedMediaItem[] = [];

    try {
      // Upload pending local media to R2 now upon clicking publish
      for (const media of attachedMedia) {

        if (media.isPendingUpload && media.file) {

          try {

            const uploadRes = await contentMediaApi.uploadMedia(media.file, 'question');

            uploadedMediaItems.push({

              ...media,

              url: uploadRes.publicUrl,

              isPendingUpload: false,

              file: undefined,

            });

            if (media.url.startsWith('blob:')) {

              URL.revokeObjectURL(media.url);

            }

          } catch (uploadErr: any) {
            const serverCode = uploadErr?.response?.data?.code;
            const msg = uploadErr?.response?.data?.message || uploadErr?.message;

            // Remove this violating media item immediately so the user is not stuck with it!
            setAttachedMedia((prev) => prev.filter((m) => m.id !== media.id));
            if (media.url && media.url.startsWith('blob:')) {
              URL.revokeObjectURL(media.url);
            }

            // Also clean up any other media that were already uploaded during this submit
            for (const uploaded of uploadedMediaItems) {
              if (uploaded.url && !uploaded.url.startsWith('blob:')) {
                contentMediaApi.deleteMedia(uploaded.url).catch(() => {});
              }
            }

            const isSevere =
              serverCode === 'CONTENT_VIOLATION_SEVERE' ||
              serverCode === 'CONTENT_MODERATION_REJECTED' ||
              msg?.includes('18+') ||
              msg?.includes('nhạy cảm') ||
              msg?.includes('tiêu chuẩn');

            if (isSevere) {
              setErrorMessage(
                msg ||
                t('askModal.errorImageViolation', 'Hình ảnh có dấu hiệu vi phạm Tiêu chuẩn cộng đồng (18+ / nhạy cảm). Hình ảnh đã bị gỡ bỏ, bạn hãy chọn hình ảnh khác hợp lệ.')
              );
            } else {
              setErrorMessage(msg || t('Lỗi khi tải ảnh lên lưu trữ. Vui lòng thử lại.'));
            }
            setIsSubmitting(false);
            return;
          }

        } else {

          uploadedMediaItems.push(media);

        }

      }

      const res = await questionApi.createQuestion({

        title: title.trim(),

        body: uploadedMediaItems.length > 0

          ? `${content.trim()}\n\n${uploadedMediaItems.map((m) => `![${m.name}](${m.url})`).join('\n\n')}`

          : content.trim(),

        courseId: numericCourseId,

        isAnonymous,

        semanticTagIds: semanticTagIds.length > 0 ? semanticTagIds : undefined,

      });

      if (res.status === 'PENDING_REVIEW') {

        alert(t("Đăng bài thành công! Bài viết của bạn đang được Ban quản trị duyệt trước khi xuất bản. Bạn có thể theo dõi tại mục Tạm giữ & Kháng cáo trên trang cá nhân."));

        resetForm();

        onClose();

        navigate('/profile?tab=quarantine');

        return;

      }

      if (res.status === 'REJECTED' || res.status === 'REJECTED_QUARANTINED') {
        // Question is quarantined & hidden from public site: keep uploaded media intact in R2 so user and admin can review in appeal details!
        alert(t('askModal.quarantineSuccess', 'Đăng câu hỏi thành công! Bài viết của bạn đã được đưa vào danh sách tạm giữ do nghi vấn hình ảnh có nội dung nhạy cảm. Hệ thống đã gửi thông báo hướng dẫn giải trình kháng cáo trong vòng 3 ngày đến Trung tâm Thông báo của bạn.'));
        resetForm();
        onClose();
        return;
      }

      const newQuestion: QuestionPost = {

        id: String(res.questionId),

        title: res.title,

        content: res.body,

        courseCode: courseCode || undefined,

        author: {

          id: isAnonymous ? 'anon' : String(res.authorUserId || currentUser?.id || 'usr'),

          fullName: isAnonymous

            ? t("Ẩn danh FPTer")

            : res.authorDisplayName || currentUser?.fullName || t("Sinh viên FHub"),

          avatarUrl: isAnonymous ? undefined : currentUser?.avatarUrl,

          role: currentUser?.role || 'Student',

          karma: isAnonymous ? 0 : currentUser?.karma || 0,

          isAnonymous,

          campus: isAnonymous ? undefined : currentUser?.campus || undefined,

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

      try {

        await apiClient.post('/api/reputation/events', {

          user_id: Number(currentUser?.id),

          rule_code: 'QUESTION_CREATED',

          source_type: 'Question',

          source_id: Number(res.questionId),

        });

        updateUser?.({ karma: ((currentUser as any)?.karma || 0) + 2 });

      } catch (e) {}

      onCreated(newQuestion);

      resetForm();

      onClose();

    } catch (err: any) {

      const serverMessage = err?.response?.data?.message || err?.message;

      const isModerationRejection =

        err?.response?.data?.code === 'CONTENT_MODERATION_REJECTED' ||

        err?.response?.data?.code === 'CONTENT_VIOLATION_SEVERE' ||

        serverMessage?.includes('tiêu chuẩn cộng đồng') ||

        serverMessage?.includes('tạm giữ') ||

        serverMessage?.includes('vi phạm');

      // Purge uploaded media from R2 and clear modal state so user isn't stuck with old violating image
      for (const item of uploadedMediaItems) {
        if (item.url && !item.url.startsWith('blob:')) {
          contentMediaApi.deleteMedia(item.url).catch(() => {});
        }
      }
      for (const item of attachedMedia) {
        if (item.url && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      }
      setAttachedMedia([]);

      if (isModerationRejection) {

        setErrorMessage(serverMessage || t('askModal.errorModeration', 'Hình ảnh hoặc nội dung vi phạm Tiêu chuẩn cộng đồng. Hình ảnh vi phạm đã bị gỡ bỏ, bạn hãy chọn hình ảnh khác hoặc chỉnh sửa lại nội dung để tiếp tục.'));

        setIsSubmitting(false);

        return;

      }

      console.warn('Failed to create question via API:', err);

      setErrorMessage(serverMessage || t('askModal.errorCreate', 'Không thể đăng câu hỏi. Vui lòng kiểm tra lại nội dung.'));

      setIsSubmitting(false);

    } finally {

      setIsSubmitting(false);

    }

  };

  const resetForm = () => {

    attachedMedia.forEach((m) => {

      if (m.isPendingUpload && m.url.startsWith('blob:')) {

        URL.revokeObjectURL(m.url);

      }

    });

    setTitle('');

    setContent('');

    setCourseCode('');

    setSelectedTags([]);

    setTagInput('');

    setIsAnonymous(false);

    setAttachedMedia([]);

    setErrorMessage(null);

    setViewMode('write');

  };

  const charCount = content.trim().length;

  const isContentValid = charCount >= 20;

  return (

    <>

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

{/* Facebook Style Author & Audience Header */}

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">

              {isAnonymous ? (

                <EyeOff className="w-5 h-5 text-purple-600" />

              ) : currentUser?.avatarUrl ? (

                <img src={normalizeMediaUrl(currentUser.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />

              ) : (

                <span>{(currentUser?.fullName || 'U').charAt(0).toUpperCase()}</span>

              )}

            </div>

            <div>

              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">

                {isAnonymous ? t('askModal.anonymousAuthor', 'Sinh viên FPT (Ẩn danh)') : (currentUser?.fullName || t('askModal.student', 'Sinh viên FPT'))}

              </p>

              <div className="flex items-center gap-1.5 mt-1">

                {/* Facebook style Audience selector pill */}

                <button

                  type="button"

                  onClick={() => setIsAnonymous((prev) => !prev)}

                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${

                    isAnonymous

                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'

                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'

                  }`}

                  title={t('askModal.toggleAudience', 'Thay đổi chế độ hiển thị danh tính')}

                >

                  {isAnonymous ? (

                    <>

                      <EyeOff className="w-3 h-3 text-purple-600" />

                      <span>{t('askModal.audienceAnonymous', 'Ẩn danh')}</span>

                    </>

                  ) : (

                    <>

                      <Globe className="w-3 h-3 text-slate-500" />

                      <span>{t('askModal.audiencePublic', 'Công khai')}</span>

                    </>

                  )}

                  <ChevronDown className="w-3 h-3 opacity-60" />

                </button>

                {!isAnonymous && currentUser?.campus && (

                  <span className="text-[11px] text-slate-400 font-medium">

                    • {currentUser.campus}

                  </span>

                )}

              </div>

            </div>

          </div>

        </div>

        {errorMessage && (

          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">

            <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />

            <span>{t(errorMessage)}</span>

          </div>

        )}

        {/* 1. Title */}

        <Input

          label={t('askModal.titleLabel', 'Tiêu đề câu hỏi (Ngắn gọn, trọng tâm vấn đề)')}

          placeholder={t('askModal.titlePlaceholder', 'Ví dụ: Làm sao để xử lý lỗi connection pool timeout trong EF Core?')}

          value={title}

          onChange={(e) => { setTitle(e.target.value); if (errorMessage) setErrorMessage(null); }}

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

                {selectedTags.map((tag) => (

                  <span

                    key={tag.name}

                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800"

                  >

                    #{tag.name}

                    <button

                      type="button"

                      onClick={() => removeTag(tag.name)}

                      className="hover:text-rose-500 transition-colors cursor-pointer"

                      title={t("Xóa tag")}

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

                      {t("Nhấn")} <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border text-[10px]">{t("Enter")}</kbd>  {t("để thêm")} <strong>#{tagInput.trim().toLowerCase()}</strong>

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

                title={t("Chế độ soạn thảo")}

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

                title={t("Chế độ chia đôi")}

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

                title={t("Xem trước kết quả")}

              >

                <Eye className="w-3 h-3" />

                <span>{t('askModal.modePreview', 'Xem trước')}</span>

              </button>

            </div>

          </div>

          {/* StackOverflow Formatting Toolbar with Drag & Drop */}

          <div

            onDragOver={(e) => {

              e.preventDefault();

              setIsDraggingFile(true);

            }}

            onDragLeave={() => setIsDraggingFile(false)}

            onDrop={(e) => {

              e.preventDefault();

              setIsDraggingFile(false);

              const files = e.dataTransfer.files;

              if (files && files.length > 0 && files[0].type.startsWith('image/')) {

                handleMediaUpload(files[0]);

              }

            }}

            className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"

          >

            {/* Hidden File Input for images and animated GIFs */}

            <input

              type="file"

              ref={fileInputRef}

              onChange={(e) => {

                const file = e.target.files?.[0];

                if (file) handleMediaUpload(file);

              }}

              accept="image/png,image/jpeg,image/webp,image/gif"

              className="hidden"

            />

            {/* Drag & Drop Visual Overlay */}

            {isDraggingFile && (

              <div className="absolute inset-0 bg-blue-50/95 dark:bg-slate-900/95 backdrop-blur-xs border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center z-20 p-4 text-center pointer-events-none animate-in fade-in">

                <UploadCloud className="w-10 h-10 text-blue-600 animate-bounce mb-2" />

                <p className="font-bold text-sm text-blue-700 dark:text-blue-300">

                  {t('askModal.dropImageTitle', 'Thả tệp ảnh hoặc GIF vào đây')}

                </p>

                <p className="text-xs text-blue-600/80 mt-1">

                  {t('askModal.dropImageSub', 'Tệp sẽ tự động được tải lên Cloudflare R2')}

                </p>

              </div>

            )}

            {/* Uploading Progress Banner */}

            {isUploadingMedia && (

              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/60 border-b border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs animate-in fade-in">

                <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />

                <span className="font-semibold">{t('askModal.uploadingMediaBanner', 'Đang tải ảnh/GIF trực tiếp lên Cloudflare R2, vui lòng đợi...')}</span>

              </div>

            )}

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

                onClick={() => insertFormatting('**', '**', t("in đậm"))}

                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"

                title={t('askModal.toolbarBold', 'In đậm (Bold)')}

              >

                <Bold className="w-3.5 h-3.5" />

              </button>

              <button

                type="button"

                onClick={() => insertFormatting('*', '*', t("in nghiêng"))}

                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"

                title={t('askModal.toolbarItalic', 'In nghiêng (Italic)')}

              >

                <Italic className="w-3.5 h-3.5" />

              </button>

              <button

                type="button"

                onClick={() => insertFormatting('~~', '~~', t("gạch ngang"))}

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

                onClick={openCodeSnippetModal}

                className="inline-flex items-center gap-1 px-2 py-1 hover:bg-blue-100/70 dark:hover:bg-blue-950/60 rounded font-semibold text-[11px] text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"

                title={t('askModal.toolbarCodeSnippet', 'Chèn đoạn mã trực quan (Code Snippet)')}

              >

                <Code className="w-3.5 h-3.5" />

                <span>{t('askModal.codeSnippetBtn', 'Chèn Code')}</span>

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

                onClick={() => insertFormatting('[', '](https://example.com)', t("Tiêu đề link"))}

                className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded"

                title={t('askModal.toolbarLink', 'Chèn liên kết (Link)')}

              >

                <LinkIcon className="w-3.5 h-3.5" />

              </button>

              <button

                type="button"

                onClick={() => fileInputRef.current?.click()}

                disabled={isUploadingMedia}

                className={`inline-flex items-center gap-1 px-2 py-1 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 rounded font-semibold text-[11px] text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer ${

                  isUploadingMedia ? 'opacity-50 cursor-not-allowed' : ''

                }`}

                title={t('askModal.toolbarUploadImage', 'Tải ảnh hoặc GIF từ máy tính lên Cloudflare R2')}

              >

                {isUploadingMedia ? (

                  <Loader2 className="w-3.5 h-3.5 animate-spin" />

                ) : (

                  <ImageIcon className="w-3.5 h-3.5" />

                )}

                <span>{isUploadingMedia ? t('askModal.uploadingMedia', 'Đang tải...') : t('askModal.imageBtn', 'Tải ảnh / GIF')}</span>

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

                <div><code>{t("**in đậm**")}</code></div>

                <div><code>{t("*in nghiêng*")}</code></div>

                <div><code>{t("`code nội dòng`")}</code></div>

                <div><code>{t("```csharp ... ```")}</code></div>

                <div><code>{t("&gt; trích dẫn")}</code></div>

                <div><code>{t("- danh sách")}</code></div>

                <div><code>{t("[Tiêu đề](link)")}</code></div>

                <div><code>{t("| Cột 1 | Cột 2 |")}</code></div>

              </div>

            )}

            {/* Editor Input: Write / Split / Preview */}

            {viewMode === 'write' && (

              <textarea

                ref={textareaRef}

                value={content}

                onChange={(e) => { setContent(e.target.value); if (errorMessage) setErrorMessage(null); }}

                onPaste={handlePaste}

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

                  onChange={(e) => { setContent(e.target.value); if (errorMessage) setErrorMessage(null); }}

                  onPaste={handlePaste}

                  placeholder={t('askModal.placeholderSplit', 'Gõ nội dung markdown bên trái, xem kết quả bên phải...')}

                  rows={7}

                  className="w-full p-3 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-900 focus:outline-none resize-none"

                  required

                />

                <div className="p-3 bg-slate-50/50 dark:bg-slate-950/40 overflow-y-auto max-h-[300px] space-y-2">

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-slate-200 dark:border-slate-800">

                    <Eye className="w-3.5 h-3.5 text-blue-600" />

                    <span>{t('askModal.previewTitle', 'Bản xem trước')}</span>

                  </div>

                  <MarkdownPreview content={previewFullContent} />

                </div>

              </div>

            )}

            {viewMode === 'preview' && (

              <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 min-h-[190px] max-h-[320px] overflow-y-auto space-y-2">

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-slate-200 dark:border-slate-800">

                  <Eye className="w-3.5 h-3.5 text-blue-600" />

                  <span>{t('askModal.previewTitle', 'Bản xem trước')}</span>

                </div>

                <MarkdownPreview content={previewFullContent} />

              </div>

            )}

            

          {/* Facebook-style Attached Media Section */}

          {attachedMedia.length === 0 ? (

            <div

              onClick={() => fileInputRef.current?.click()}

              className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"

            >

              <div className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 transition-colors">

                <UploadCloud className="w-5 h-5" />

              </div>

              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">

                {t('askModal.addMediaTitle', 'Thêm ảnh hoặc video / GIF')}

              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">

                {t('askModal.addMediaSub', 'hoặc kéo và thả tệp từ máy tính, dán (Ctrl+V)')}

              </p>

            </div>

          ) : (

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 animate-in fade-in">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">

                    {t('askModal.mediaUploadedTitle', 'File phương tiện đã tải lên')}

                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">

                    {attachedMedia.length}

                  </span>

                </div>

                <button

                  type="button"

                  onClick={() => fileInputRef.current?.click()}

                  disabled={isUploadingMedia}

                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"

                >

                  <Plus className="w-3.5 h-3.5" />

                  <span>{t('askModal.addMoreMedia', 'Thêm file khác')}</span>

                </button>

              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                {attachedMedia.map((item) => (

                  <div

                    key={item.id}

                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 aspect-video flex items-center justify-center shadow-xs"

                  >

                    <img

                      src={normalizeMediaUrl(item.url)}

                      alt={item.name}

                      className="w-full h-full object-cover transition-transform group-hover:scale-105"

                    />

                    {item.type === 'gif' && (

                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] font-bold tracking-wider backdrop-blur-xs">

                        GIF

                      </span>

                    )}

                    {/* Remove button like Facebook */}

                    <button

                      type="button"

                      onClick={() => removeAttachedMedia(item.id)}

                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/85 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"

                      title={t('askModal.removeMedia', 'Gỡ tệp này')}

                    >

                      <X className="w-3.5 h-3.5" />

                    </button>

                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-[10px] text-white truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">

                      {item.name}

                    </div>

                  </div>

                ))}

                {isUploadingMedia && (

                  <div className="rounded-xl border border-dashed border-blue-400 bg-blue-50/60 dark:bg-blue-950/40 aspect-video flex flex-col items-center justify-center text-center p-2 text-blue-600 animate-pulse">

                    <Loader2 className="w-5 h-5 animate-spin mb-1" />

                    <span className="text-[10px] font-semibold">{t('askModal.uploadingStatus', 'Đang tải lên...')}</span>

                  </div>

                )}

              </div>

            </div>

          )}

            {/* Character count bar */}

            <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">

              <div className="flex items-center gap-1.5 text-slate-400">

                <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" />

                <span className="hidden sm:inline">{t('askModal.pasteTip', 'Mẹo: Dán trực tiếp (Ctrl+V) ảnh/GIF hoặc kéo thả từ máy tính để lưu vào Cloudflare R2')}</span>

                <span className="sm:hidden">{t('askModal.pasteTipShort', 'Ctrl+V hoặc kéo thả ảnh/GIF')}</span>

              </div>

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

    {/* Visual Code Snippet Inserter Modal */}

    {showCodeModal && (

      <Modal

        isOpen={showCodeModal}

        onClose={() => setShowCodeModal(false)}

        title={t('askModal.snippetModalTitle', 'Chèn khối mã nguồn trực quan (Code Snippet)')}

        size="lg"

        footer={

          <div className="flex items-center justify-end gap-2 w-full">

            <Button variant="secondary" onClick={() => setShowCodeModal(false)}>

              {t('common.cancel', 'Hủy')}

            </Button>

            <Button

              variant="primary"

              onClick={handleInsertSnippet}

              disabled={!snippetCode.trim()}

              className="bg-blue-600 hover:bg-blue-700 text-white"

            >

              <Code className="w-4 h-4 mr-1.5" />

              {t('askModal.insertCodeBtn', 'Chèn mã vào câu hỏi')}

            </Button>

          </div>

        }

      >

        <div className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>

              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">

                {t('askModal.snippetLang', 'Ngôn ngữ lập trình')} <span className="text-rose-500">*</span>

              </label>

              <select

                value={snippetLanguage}

                onChange={(e) => setSnippetLanguage(e.target.value)}

                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"

              >

                <option value="csharp">C# (.NET / CSharp)</option>

                <option value="java">Java (Spring Boot / Android)</option>

                <option value="javascript">JavaScript / TypeScript (React, Node.js)</option>

                <option value="python">Python</option>

                <option value="sql">SQL (PostgreSQL, MySQL, SQL Server)</option>

                <option value="cpp">C / C++</option>

                <option value="go">Go (Golang)</option>

                <option value="html">HTML / CSS / Web</option>

                <option value="bash">Shell / Bash / Terminal</option>

                <option value="json">JSON / YAML</option>

                <option value="text">{t('askModal.snippetPlainText', 'Khác / Văn bản thuần')}</option>

              </select>

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">

                {t('askModal.snippetFileName', 'Tên tệp / Chú thích')} <span className="text-slate-400 font-normal">({t('tùy chọn')})</span>

              </label>

              <input

                type="text"

                value={snippetFileName}

                onChange={(e) => setSnippetFileName(e.target.value)}

                placeholder={t('askModal.snippetFileNamePlaceholder', 'Ví dụ: Program.cs, Query.sql, App.tsx')}

                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"

              />

            </div>

          </div>

          <div>

            <div className="flex items-center justify-between mb-1">

              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">

                {t('askModal.snippetCodeLabel', 'Nội dung mã nguồn')} <span className="text-rose-500">*</span>

              </label>

              <span className="text-[11px] text-slate-400">{t('askModal.snippetPasteHelp', 'Dán hoặc viết code tại đây')}</span>

            </div>

            <textarea

              value={snippetCode}

              onChange={(e) => setSnippetCode(e.target.value)}

              rows={8}

              placeholder={t('askModal.snippetPlaceholder', 'Dán hoặc gõ đoạn mã lỗi, hàm xử lý hoặc cấu trúc dữ liệu của bạn vào đây...')}

              className="w-full p-3 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

            />

          </div>

          {/* Visual Live Preview with Syntax Highlighting */}

          {snippetCode.trim() && (

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">

                <Sparkles className="w-3.5 h-3.5 text-blue-600" />

                <span>{t('askModal.snippetPreview', 'Xem trước hiển thị trực quan (Syntax Highlighting)')}:</span>

              </div>

              <div className="max-h-[220px] overflow-y-auto">

                <MarkdownPreview

                  content={

                    snippetFileName.trim()

                      ? `**\`${snippetFileName.trim()}\`**\n\`\`\`${snippetLanguage}\n${snippetCode}\n\`\`\``

                      : `\`\`\`${snippetLanguage}\n${snippetCode}\n\`\`\``

                  }

                />

              </div>

            </div>

          )}

        </div>

      </Modal>

    )}

    </>

  );

};

