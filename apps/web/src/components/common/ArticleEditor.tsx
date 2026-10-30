import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { Bold, Italic, Heading2, List, ListOrdered, Quote, Code2, ImagePlus, Undo2, Redo2, Loader2, Trash2 } from 'lucide-react';
import { contentMediaApi } from '../../services/api/contentApi';
import { IMAGE_ACCEPT, validateImage } from '../../utils/mediaUtils';
import { useLanguage } from '../../context/LanguageContext';
import './ArticleEditor.css';

export function ArticleEditor({ onChange, onUploadingChange, disabled = false }: {
  onChange: (markdown: string) => void;
  onUploadingChange: (uploading: boolean) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: t('Bắt đầu viết câu chuyện của bạn… Kéo thả hoặc dán ảnh vào đây.') }),
      Markdown,
    ],
    content: '',
    contentType: 'markdown',
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => onChange(current.getMarkdown()),
    editorProps: {
      attributes: { role: 'textbox', 'aria-label': t('Nội dung bài viết'), 'aria-multiline': 'true' },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []);
        if (!files.length) return false;
        event.preventDefault();
        void uploadImages(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = Array.from(event.dataTransfer?.files || []);
        if (moved || !files.length) return false;
        event.preventDefault();
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
        void uploadImages(files, position?.pos);
        return true;
      },
    },
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => { editor?.setEditable(!disabled && !uploading); }, [editor, disabled, uploading]);

  async function uploadImages(files: File[], position?: number) {
    if (!editor || editor.isDestroyed || disabled || busyRef.current) return;
    try {
      files.forEach((file) => validateImage(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('Ảnh không hợp lệ.'));
      return;
    }
    busyRef.current = true;
    setUploading(true);
    onUploadingChange(true);
    setError('');
    if (position !== undefined) editor.commands.setTextSelection(position);
    try {
      for (const file of files) {
        const result = await contentMediaApi.uploadMedia(file, 'article');
        if (!mountedRef.current || editor.isDestroyed) return;
        editor.chain().focus().insertContent([
          { type: 'image', attrs: { src: result.publicUrl, alt: file.name.replace(/\.[^.]+$/, '') } },
          { type: 'paragraph' },
        ]).run();
      }
    } catch (reason) {
      if (mountedRef.current) setError(reason instanceof Error ? reason.message : t('Không tải được ảnh. Vui lòng thử lại.'));
    } finally {
      busyRef.current = false;
      if (mountedRef.current) {
        setUploading(false);
        onUploadingChange(false);
      }
    }
  }

  const tools = [
    { label: t('In đậm'), icon: Bold, active: editor?.isActive('bold'), run: () => editor?.chain().focus().toggleBold().run() },
    { label: t('In nghiêng'), icon: Italic, active: editor?.isActive('italic'), run: () => editor?.chain().focus().toggleItalic().run() },
    { label: t('Tiêu đề'), icon: Heading2, active: editor?.isActive('heading', { level: 2 }), run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: t('Danh sách'), icon: List, active: editor?.isActive('bulletList'), run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: t('Danh sách đánh số'), icon: ListOrdered, active: editor?.isActive('orderedList'), run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: t('Trích dẫn'), icon: Quote, active: editor?.isActive('blockquote'), run: () => editor?.chain().focus().toggleBlockquote().run() },
    { label: t('Đoạn mã'), icon: Code2, active: editor?.isActive('codeBlock'), run: () => editor?.chain().focus().toggleCodeBlock().run() },
    { label: t('Hoàn tác'), icon: Undo2, run: () => editor?.chain().focus().undo().run() },
    { label: t('Làm lại'), icon: Redo2, run: () => editor?.chain().focus().redo().run() },
  ];

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('Nội dung bài viết')}</span>
      <div className="article-editor overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" aria-busy={uploading}>
        <div role="toolbar" aria-label={t('Định dạng bài viết')} className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-800">
          {tools.map(({ label, icon: Icon, active, run }) => (
            <button key={label} type="button" title={label} aria-label={label} aria-pressed={Boolean(active)} disabled={!editor || disabled || uploading} onClick={run}
              className={`rounded-lg p-2 transition-colors disabled:opacity-40 ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300'}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <button type="button" disabled={!editor || disabled || uploading} onClick={() => fileRef.current?.click()} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {t('Chèn ảnh')}
          </button>
          <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} multiple className="hidden" aria-label={t('Chọn ảnh chèn vào bài viết')} onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = '';
            if (files.length) void uploadImages(files);
          }} />
        </div>
        {editor?.isActive('image') && (
          <div className="flex items-center gap-3 border-b border-slate-100 bg-blue-50 p-3">
            <label className="flex flex-1 items-center gap-2 text-xs text-slate-600">{t('Mô tả ảnh')}
              <input className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2" value={editor.getAttributes('image').alt || ''} disabled={disabled || uploading}
                onChange={(event) => editor.commands.updateAttributes('image', { alt: event.target.value })} />
            </label>
            <button type="button" title={t('Xóa ảnh')} aria-label={t('Xóa ảnh')} disabled={disabled || uploading} onClick={() => editor.chain().focus().deleteSelection().run()} className="rounded-lg p-2 text-rose-600"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
        <EditorContent editor={editor} />
        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-400 dark:border-slate-700">
          <span role="status">{uploading ? t('Đang tải ảnh lên…') : t('Kéo thả, dán ảnh hoặc chọn Chèn ảnh · Tối đa 10MB/ảnh')}</span>
          <span>{editor?.getText().length || 0} {t('ký tự')}</span>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-rose-600">{t(error)}</p>}
    </div>
  );
}
