import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Download,
  Search,
  Plus,
  FileDown,
  FileText,
  Archive,
  Presentation,
  Code2,
  FileSpreadsheet,
} from 'lucide-react';
import { mockMaterials, mockCourses } from '../../services/mockData';
import { StudyMaterial } from '../../types';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';

export const StudyMaterialListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shouldOpenUpload = searchParams.get('action') === 'upload';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(shouldOpenUpload);
  const [materials, setMaterials] = useState<StudyMaterial[]>(mockMaterials);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCourse, setNewCourse] = useState('PRN211');
  const [newType, setNewType] = useState<'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE'>('PDF');

  const fileTypes = ['ALL', 'PDF', 'ZIP', 'DOCX', 'PPTX', 'CODE'];

  const filteredMaterials = materials.filter((m) => {
    const matchType = selectedType === 'ALL' || m.fileType === selectedType;
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      courseCode: newCourse,
      fileType: newType,
      fileSizeMb: 5.2,
      downloadUrl: '#',
      downloadsCount: 1,
      author: {
        id: 'usr-1',
        fullName: 'Nguyễn Văn A',
      },
      semesterUploaded: 'Spring 2026',
      createdAt: new Date().toISOString(),
    };

    setMaterials([newMat, ...materials]);
    setIsUploadOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'ZIP':
        return <Archive className="w-5 h-5 text-amber-500" />;
      case 'PPTX':
        return <Presentation className="w-5 h-5 text-orange-500" />;
      case 'CODE':
        return <Code2 className="w-5 h-5 text-purple-500" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Study Materials & Exam Bank
            </h1>
            <Badge variant="primary" size="md">{filteredMaterials.length} Tài liệu</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đề thi thử Practical Exam (PE), bài tập Assignment mẫu và slide bài giảng tổng hợp.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsUploadOpen(true)} leftIcon={<Plus className="w-4 h-4" />} className="shadow-xs">
          Tải lên tài liệu
        </Button>
      </div>

      {/* Type Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {fileTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {t === 'ALL' ? 'Tất cả định dạng' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo môn (PRN211), tên file..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        {filteredMaterials.map((mat) => (
          <Card key={mat.id} hoverable>
            <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                  {getFileIcon(mat.fileType)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{mat.courseCode}</Badge>
                    <span className="text-[11px] font-mono text-slate-400">{mat.fileSizeMb} MB</span>
                    <span className="text-[11px] text-slate-400">• HK {mat.semesterUploaded}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {mat.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 sm:text-right block">
                  Đăng bởi <span className="font-semibold text-slate-700 dark:text-slate-300">{mat.author.fullName}</span>
                </span>
                <Button variant="outline" size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
                  Tải về ({mat.downloadsCount})
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Upload Material Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Tải lên tài liệu học tập mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleUpload}>Tải lên hệ thống (+20 Karma)</Button>
          </>
        }
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <Input
            label="Tiêu đề tài liệu"
            placeholder="Ví dụ: Đề cương trắc nghiệm Final Exam PRN211 có lời giải"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Môn học áp dụng"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              options={mockCourses.map((c) => ({ value: c.code, label: `${c.code} - ${c.title}` }))}
            />
            <Select
              label="Định dạng tệp"
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              options={[
                { value: 'PDF', label: 'PDF Document (.pdf)' },
                { value: 'ZIP', label: 'Mã nguồn / Project Archive (.zip)' },
                { value: 'DOCX', label: 'Word Document (.docx)' },
                { value: 'PPTX', label: 'Slide thuyết trình (.pptx)' },
                { value: 'CODE', label: 'Code File (.cs, .java, .sql)' },
              ]}
            />
          </div>

          <Textarea
            label="Mô tả nội dung tài liệu"
            placeholder="Mô tả chi tiết nội dung tệp..."
            rows={3}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />

          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2 bg-slate-50 dark:bg-slate-900/40">
            <Download className="w-8 h-8 mx-auto text-blue-600" />
            <p className="font-bold text-xs">Kéo thả tệp vào đây hoặc nhấn để chọn tệp</p>
            <p className="text-[11px] text-slate-400">Dung lượng tối đa: 50MB (PDF, DOCX, ZIP, PPTX)</p>
          </div>
        </form>
      </Modal>
    </div>
  );
};
