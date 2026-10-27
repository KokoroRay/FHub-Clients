import { User } from '../types';

export const HIDE_OUT_OF_MAJOR_STORAGE_KEY = 'fhub_hide_out_of_major_compact';

/**
 * Get the current user preference for hiding out-of-major courses in compact/small list views.
 * Default is true (enabled).
 */
export function getHideOutOfMajorCompactSetting(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(HIDE_OUT_OF_MAJOR_STORAGE_KEY);
  if (stored === null) return true; // Default enabled
  return stored === 'true';
}

/**
 * Update the user preference and notify listening components.
 */
export function setHideOutOfMajorCompactSetting(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HIDE_OUT_OF_MAJOR_STORAGE_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent('fhub_preferences_changed', { detail: { hideOutOfMajorCompact: enabled } }));
}

/**
 * Get user's major code from currentUser or localStorage or fallback to SE.
 */
export function resolveUserMajorCode(currentUser?: User | null | string): string {
  let raw = typeof currentUser === 'string' ? currentUser : currentUser?.major;
  if (!raw && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('fhub_user');
      if (stored) {
        const u = JSON.parse(stored);
        raw = u.major || u.specialization;
      }
    } catch {}
  }
  return getMajorCodeFromUser(raw || 'SE');
}

/**
 * Filter a compact list of courses (e.g. dropdown, widget, quick selector without filter toolbar)
 * according to user's major preference.
 */
export function filterCompactCourses<T>(
  courses: T[],
  currentUser?: User | null | string,
  forceFilter?: boolean
): T[] {
  if (!Array.isArray(courses) || courses.length === 0) return courses;
  
  // If forceFilter is not specified, respect user's preference in Preferences & Privacy
  const shouldFilter = forceFilter !== undefined ? forceFilter : getHideOutOfMajorCompactSetting();
  if (!shouldFilter) return courses;

  const majorPrefix = resolveUserMajorCode(currentUser);

  const filtered = courses.filter((c) => {
    const cAny = c as any;
    const cMajor = (cAny.majorCode || '').trim().toUpperCase();
    if (cMajor && (cMajor === 'GENERAL' || cMajor === 'COMMON' || cMajor === 'ALL')) {
      return true; // General university requirement
    }
    if (cMajor && (cMajor === majorPrefix || cMajor.includes(majorPrefix) || majorPrefix.includes(cMajor))) {
      return true;
    }

    const cCode = (cAny.code || cAny.courseCode || '').toUpperCase();
    const cTags: string[] = Array.isArray(cAny.tags) ? cAny.tags : [];

    // General university foundational requirements (VOV, SSL, LUK, OJT, soft skills)
    const isGeneralCourse =
      cTags.some((t) => [
        'Đại cương, Kỹ năng mềm & Thể chất',
        'Little UK (LUK)',
        'On the Job Training (OJT)',
        'Toán học & Tư duy logic',
      ].includes(t)) ||
      ['VOV', 'SSL', 'OJT', 'SKL'].some((p) => cCode.startsWith(p));

    if (majorPrefix === 'SE' || majorPrefix === 'IT') {
      const seTags = [
        'Lập trình & Kỹ thuật phần mềm',
        'Cấu trúc dữ liệu & Giải thuật',
        'Cơ sở dữ liệu & SQL',
        'Toán học & Tư duy logic',
      ];
      if (cTags.some((t) => seTags.includes(t))) return true;

      const sePrefixes = [
        'PRN', 'SWP', 'SWE', 'PRJ', 'PRM', 'PRO', 'CSD', 'DBI', 'LAB',
        'WED', 'FER', 'SAD', 'SDN', 'SEP', 'SET', 'SWC', 'SWD', 'SWR',
        'MMA', 'HCI', 'AAT', 'DWP', 'PWD', 'MAS', 'MAD', 'PRU', 'OAD',
        'ITE', 'AGU', 'FGU', 'GDC', 'GNS', 'HSF', 'MSS'
      ];
      if (sePrefixes.some((p) => cCode.startsWith(p))) return true;
      if (cTags.includes('Capstone Project (Đồ án tốt nghiệp)') && (cCode.startsWith('SEP') || cCode.startsWith('SWP') || cCode.startsWith('CAP'))) {
        return true;
      }
      return isGeneralCourse;
    }

    if (majorPrefix === 'IA') {
      const iaTags = ['An toàn thông tin & Mạng máy tính', 'Lập trình & Kỹ thuật phần mềm', 'Cơ sở dữ liệu & SQL'];
      if (cTags.some((t) => iaTags.includes(t))) return true;
      const iaPrefixes = ['IA', 'SEC', 'NW', 'OS', 'CSD', 'DBI', 'PRN', 'PRO', 'MAS', 'MAD'];
      if (iaPrefixes.some((p) => cCode.startsWith(p))) return true;
      return isGeneralCourse;
    }

    if (majorPrefix === 'AI') {
      const aiTags = ['Trí tuệ nhân tạo & Khoa học dữ liệu', 'Lập trình & Kỹ thuật phần mềm', 'Toán học & Tư duy logic'];
      if (cTags.some((t) => aiTags.includes(t))) return true;
      const aiPrefixes = ['AI', 'ML', 'AIP', 'PRN', 'CSD', 'DBI', 'MAS', 'MAD'];
      if (aiPrefixes.some((p) => cCode.startsWith(p))) return true;
      return isGeneralCourse;
    }

    if (majorPrefix === 'GD') {
      const gdTags = ['Thiết kế Đồ họa, 3D & UI/UX'];
      if (cTags.some((t) => gdTags.includes(t))) return true;
      const gdPrefixes = ['GD', '2DP', '3DP', 'DES', 'ART', 'DRW', 'ANI', 'MMA', 'HCI'];
      if (gdPrefixes.some((p) => cCode.startsWith(p))) return true;
      return isGeneralCourse;
    }

    if (majorPrefix === 'MKT' || majorPrefix === 'IB' || majorPrefix === 'BA') {
      const bizTags = [
        'Digital Marketing & Truyền thông',
        'Kinh doanh, Quản trị & Chuỗi cung ứng',
        'Tài chính, Kế toán & Fintech',
        'Khởi nghiệp (Entrepreneurship)',
      ];
      if (cTags.some((t) => bizTags.includes(t))) return true;
      const bizPrefixes = ['MKT', 'IB', 'ACC', 'FIN', 'MGT', 'ECO', 'BUS', 'OBM', 'HRM'];
      if (bizPrefixes.some((p) => cCode.startsWith(p))) return true;
      return isGeneralCourse;
    }

    if (majorPrefix === 'LAW') {
      const lawTags = ['Pháp luật & Luật kinh tế'];
      if (cTags.some((t) => lawTags.includes(t))) return true;
      if (['LAW', 'BLW', 'VNL'].some((p) => cCode.startsWith(p))) return true;
      return isGeneralCourse;
    }

    // Fallback prefix check
    if (isCourseRelevantToMajor(cCode, majorPrefix)) return true;
    return isGeneralCourse;
  });

  // If filter is too aggressive and yields 0 courses, return original to avoid empty dropdown
  return filtered.length > 0 ? filtered : courses;
}

export function getMajorCodeFromUser(majorStr: string): string {
  const m = majorStr.toUpperCase();
  if (m === 'SE' || m.includes('SOFTWARE') || m.includes('PHẦN MỀM')) return 'SE';
  if (m === 'IA' || m.includes('AN TOÀN') || m.includes('SECURITY')) return 'IA';
  if (m === 'AI' || m.includes('TRÍ TUỆ') || m.includes('ARTIFICIAL')) return 'AI';
  if (m === 'IS' || m.includes('HỆ THỐNG THÔNG TIN') || m.includes('INFORMATION SYSTEM')) return 'IS';
  if (m === 'GD' || m.includes('ĐỒ HỌA') || m.includes('GRAPHIC')) return 'GD';
  if (m === 'MKT' || m.includes('MARKETING')) return 'MKT';
  if (m === 'IB' || m.includes('KINH DOANH QUỐC TẾ') || m.includes('INTERNATIONAL BUSINESS')) return 'IB';
  if (m === 'MC' || m.includes('TRUYỀN THÔNG') || m.includes('COMMUNICATION')) return 'MC';
  if (m === 'BA' || m.includes('BUSINESS') || m.includes('KINH DOANH')) return 'BA';
  if (m === 'LAW' || m.includes('LUẬT')) return 'LAW';
  return m;
}

function isCourseRelevantToMajor(courseCode: string, majorPrefix: string): boolean {
  if (majorPrefix === 'SE') {
    return ['PRN', 'SWP', 'SWE', 'PRJ', 'PRM', 'PRO', 'CSD', 'DBI', 'LAB', 'WED', 'MAS', 'MAD'].some((p) => courseCode.startsWith(p));
  }
  if (majorPrefix === 'IA') {
    return ['IA', 'SEC', 'NW', 'OS', 'CSD', 'DBI', 'PRN', 'PRO'].some((p) => courseCode.startsWith(p));
  }
  if (majorPrefix === 'AI') {
    return ['AI', 'ML', 'PRN', 'CSD', 'DBI', 'MAS', 'MAD', 'MAT'].some((p) => courseCode.startsWith(p));
  }
  if (majorPrefix === 'GD') {
    return ['GD', '2DP', '3DP', 'DES', 'ART', 'DRW', 'ANI'].some((p) => courseCode.startsWith(p));
  }
  if (majorPrefix === 'MKT' || majorPrefix === 'IB' || majorPrefix === 'BA') {
    return ['MKT', 'IB', 'ACC', 'FIN', 'MGT', 'ECO', 'BUS'].some((p) => courseCode.startsWith(p));
  }
  return false;
}
