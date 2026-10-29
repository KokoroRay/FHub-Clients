import { semanticTagsApi } from '../services/api/adminApi';

export interface SemanticTagItem {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

// Fallback list of all 28 canonical tags seeded in PostgreSQL Taxonomy DB
export const FALLBACK_ALL_TAGS: SemanticTagItem[] = [
  { id: 1, name: 'Practical Exam (PE)', description: 'Đề thi, kinh nghiệm và bài giải thi thực hành (PE) tại Đại học FPT.' },
  { id: 2, name: 'Final Exam (FE)', description: 'Tài liệu ôn tập và câu hỏi trắc nghiệm/tự luận kỳ thi cuối kỳ (FE).' },
  { id: 3, name: 'Progress Test (PT)', description: 'Tài liệu ôn tập các bài kiểm tra định kỳ (Progress Test).' },
  { id: 4, name: 'Assignment & Project', description: 'Hướng dẫn làm bài tập lớn (Assignment) và đồ án môn học.' },
  { id: 5, name: 'Lab & Thực hành', description: 'Hướng dẫn giải bài tập thực hành Lab trên lớp.' },
  { id: 6, name: 'Syllabus & Đề cương', description: 'Đề cương môn học, tiêu chí chấm điểm và tài liệu gốc trên FLM.' },
  { id: 7, name: 'Survival Tips (Bí kíp qua môn)', description: 'Kinh nghiệm học tập, lưu ý quan trọng để đạt điểm cao và tránh học lại.' },
  { id: 8, name: 'Little UK (LUK)', description: 'Chương trình tiếng Anh nền tảng Little UK cho tân sinh viên.' },
  { id: 9, name: 'On the Job Training (OJT)', description: 'Kinh nghiệm thực tập doanh nghiệp học kỳ 6 (OJT).' },
  { id: 10, name: 'Capstone Project (Đồ án tốt nghiệp)', description: 'Kinh nghiệm làm đồ án / khóa luận tốt nghiệp học kỳ 9.' },
  { id: 11, name: 'Coursera & MOOC', description: 'Các học phần học trực tuyến kết hợp trên nền tảng Coursera.' },
  { id: 12, name: 'EduNext & Constructivism', description: 'Thảo luận nhóm theo phương pháp kiến tạo trên nền tảng EduNext.' },
  { id: 13, name: 'Khởi nghiệp (Entrepreneurship)', description: 'Trải nghiệm khởi nghiệp (EXE101, EXE201) và dự án Startup.' },
  { id: 14, name: 'Lập trình & Kỹ thuật phần mềm', description: 'Chủ đề lập trình, kiến trúc phần mềm, Web, Mobile, .NET, Java, React, Spring.' },
  { id: 15, name: 'Cấu trúc dữ liệu & Giải thuật', description: 'Cấu trúc dữ liệu, giải thuật và tư duy lập trình.' },
  { id: 16, name: 'Cơ sở dữ liệu & SQL', description: 'Thiết kế cơ sở dữ liệu, truy vấn SQL và quản trị hệ thống dữ liệu.' },
  { id: 17, name: 'Trí tuệ nhân tạo & Khoa học dữ liệu', description: 'Machine Learning, Deep Learning, Computer Vision, NLP và Phân tích dữ liệu.' },
  { id: 18, name: 'An toàn thông tin & Mạng máy tính', description: 'Bảo mật hệ thống, mạng máy tính, mật mã học, DevSecOps và Pentest.' },
  { id: 19, name: 'Vi mạch, Nhúng, IoT & Ô tô số', description: 'Hệ thống nhúng, IoT, Robotics, Thiết kế vi mạch bán dẫn và Công nghệ ô tô số.' },
  { id: 20, name: 'Thiết kế Đồ họa, 3D & UI/UX', description: 'Thiết kế mỹ thuật số, UI/UX, hoạt hình 2D/3D và dựng hình kỹ thuật số.' },
  { id: 21, name: 'Kinh doanh, Quản trị & Chuỗi cung ứng', description: 'Quản trị doanh nghiệp, Kinh doanh quốc tế, Thương mại điện tử và Logistics.' },
  { id: 22, name: 'Digital Marketing & Truyền thông', description: 'Digital Marketing, SEO, PR, Truyền thông đa phương tiện và Xây dựng thương hiệu.' },
  { id: 23, name: 'Tài chính, Kế toán & Fintech', description: 'Tài chính doanh nghiệp, Ngân hàng số, Kế toán, Phân tích đầu tư và Fintech.' },
  { id: 24, name: 'Du lịch, Khách sạn & Sự kiện', description: 'Quản trị khách sạn, dịch vụ nhà hàng, lữ hành và tổ chức sự kiện.' },
  { id: 25, name: 'Pháp luật & Luật kinh tế', description: 'Pháp luật đại cương, Luật kinh doanh, Luật thương mại quốc tế và Sở hữu trí tuệ.' },
  { id: 26, name: 'Ngoại ngữ (Anh - Nhật - Hàn - Trung)', description: 'Học tập và luyện thi chứng chỉ ngoại ngữ IELTS, JLPT, TOPIK, HSK.' },
  { id: 27, name: 'Toán học & Tư duy logic', description: 'Toán kỹ thuật, Toán rời rạc, Đại số tuyến tính và Xác suất thống kê.' },
  { id: 28, name: 'Đại cương, Kỹ năng mềm & Thể chất', description: 'Lý luận chính trị, Vovinam, Nhạc cụ dân tộc và Kỹ năng mềm đại học.' },
];

let cachedTagMap: Record<number, string> | null = null;
let cachedTagList: SemanticTagItem[] | null = null;
let fetchPromise: Promise<SemanticTagItem[]> | null = null;

/**
 * Fetch all semantic tags from Taxonomy service with caching.
 * Falls back to canonical 28 tags if offline or unauthenticated.
 */
export async function loadAllSemanticTags(): Promise<SemanticTagItem[]> {
  if (cachedTagList && cachedTagList.length > 0) {
    return cachedTagList;
  }

  if (!fetchPromise) {
    fetchPromise = semanticTagsApi
      .getTags({ pageSize: 100 })
      .then((res: any) => {
        const items = res?.items || res?.data?.items || (Array.isArray(res) ? res : []);
        if (Array.isArray(items) && items.length > 0) {
          const mapped: SemanticTagItem[] = items.map((t: any) => ({
            id: Number(t.semanticTagId || t.id),
            name: t.name || t.tagName || `Tag #${t.semanticTagId || t.id}`,
            category: t.category,
            description: t.description,
          }));
          cachedTagList = mapped;
          return mapped;
        }
        cachedTagList = FALLBACK_ALL_TAGS;
        return FALLBACK_ALL_TAGS;
      })
      .catch((err) => {
        console.warn('Failed to load semantic tags from API, using fallback tags:', err);
        cachedTagList = FALLBACK_ALL_TAGS;
        return FALLBACK_ALL_TAGS;
      });
  }

  return fetchPromise;
}

/**
 * Get tag map (id -> name) synchronously or initialized with fallback.
 */
export function getSemanticTagMap(tagsList?: SemanticTagItem[]): Record<number, string> {
  if (cachedTagMap && Object.keys(cachedTagMap).length > 0) {
    return cachedTagMap;
  }

  const list = tagsList || cachedTagList || FALLBACK_ALL_TAGS;
  const map: Record<number, string> = {};
  list.forEach((t) => {
    map[t.id] = t.name;
  });
  cachedTagMap = map;
  return map;
}

/**
 * Resolve an array of tag IDs to an array of tag names.
 */
export function resolveTagNames(tagIds?: number[], tagMap?: Record<number, string>): string[] {
  if (!tagIds || tagIds.length === 0) return [];
  const map = tagMap || getSemanticTagMap();
  return tagIds.map((id) => map[id] || `Thẻ #${id}`);
}

/**
 * Resolve primary category from semantic tags or fallback.
 */
export function resolveCategoryFromTags(tagIds?: number[], tagMap?: Record<number, string>, fallback = 'Học thuật & Đời sống'): string {
  if (!tagIds || tagIds.length === 0) return fallback;
  const map = tagMap || getSemanticTagMap();
  const firstId = tagIds[0];
  return map[firstId] || fallback;
}
