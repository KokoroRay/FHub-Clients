/**
 * FPT Education Email Validation & Metadata Extractor Utility
 * 
 * Chính sách cấp phát Email Trường Đại học FPT:
 * 1. Khóa K18 trở về trước:
 *    - Bắt buộc dùng email giáo dục định dạng @fpt.edu.vn (hoặc @fe.edu.vn đối với Cán bộ / Giảng viên).
 * 
 * 2. Khóa K19 trở đi:
 *    - Sử dụng hòm thư Gmail theo cấu trúc chuẩn của trường:
 *      [Tên][HọLótViếtTắt].[MãSinhViên]@gmail.com
 *      Ví dụ: TanLT.CE190370@gmail.com
 *      Trong đó:
 *        - "Tan": Tên người dùng
 *        - "LT": Họ và chữ lót viết tắt (viết hoa)
 *        - ".": Dấu chấm ngăn cách
 *        - "CE190370": Mã số sinh viên
 *            + "C": Campus (C = Cần Thơ, H = Hà Nội, S = TP.HCM, D = Đà Nẵng, Q = Quy Nhơn)
 *            + "E": Khối ngành (E = Kỹ thuật phần mềm / SE, S = ATTT, B = QTKD, A = AI, C = TTĐPT, D = Đồ họa, L = Ngôn ngữ...)
 *            + "19": Khóa học (>= 19)
 *            + "0370": Số định danh sinh viên
 */

export interface FptEmailValidationResult {
  isValid: boolean;
  type?: 'EDU' | 'GMAIL_K19_PLUS';
  isCohort18OrEarlier?: boolean;
  cohort?: number;
  studentCode?: string;
  campusCode?: string;     // Mã chuẩn trong DB: 'CT', 'HN', 'HCM', 'DN', 'QN'
  campusName?: string;     // Tên tiếng Việt hiển thị
  campusLetter?: string;   // Ký tự đầu của MSSV: 'C', 'H', 'S', 'D', 'Q'
  majorLetter?: string;    // Ký tự thứ 2 của MSSV: 'E', 'B', 'S', etc.
  namePart?: string;       // Phần tên và họ lót trước dấu chấm
  email?: string;
  error?: string;
}

export const CAMPUS_CODE_MAP: Record<string, { code: string; name: string }> = {
  C: { code: 'CT', name: 'Phân hiệu Cần Thơ (CT)' },
  H: { code: 'HN', name: 'Phân hiệu Hà Nội (HN)' },
  S: { code: 'HCM', name: 'Phân hiệu TP. Hồ Chí Minh (HCM)' },
  D: { code: 'DN', name: 'Phân hiệu Đà Nẵng (DN)' },
  Q: { code: 'QN', name: 'Phân hiệu Quy Nhơn (QN)' },
};

export const MAJOR_LETTER_MAP: Record<string, string> = {
  E: 'Kỹ thuật phần mềm (Software Engineering)',
  S: 'An toàn thông tin / Khoa học máy tính',
  A: 'Trí tuệ nhân tạo (AI)',
  B: 'Quản trị kinh doanh & Tài chính',
  C: 'Truyền thông đa phương tiện',
  D: 'Thiết kế mỹ thuật số (Graphic Design)',
  L: 'Ngôn ngữ (Anh / Nhật / Hàn)',
  T: 'Công nghệ thông tin ứng dụng',
};

/**
 * Validate email và trích xuất thông tin sinh viên FPT
 */
export function validateFptEmail(rawEmail: string): FptEmailValidationResult {
  const email = (rawEmail || '').trim();
  if (!email) {
    return {
      isValid: false,
      error: 'Vui lòng nhập địa chỉ email hợp lệ.',
    };
  }

  // 1. Kiểm tra Email Edu (K18 trở về trước hoặc Cán bộ/Giảng viên/Alumni)
  if (email.endsWith('@fpt.edu.vn') || email.endsWith('@fe.edu.vn')) {
    return {
      isValid: true,
      type: 'EDU',
      isCohort18OrEarlier: true,
      email,
    };
  }

  // 2. Kiểm tra Email Gmail K19+ theo cấu trúc:
  // [TênHoLot].[CampusChar][MajorChar][Cohort>=19][Order4digits]@gmail.com
  // Ví dụ: TanLT.CE190370@gmail.com
  const k19Regex = /^([A-Za-z0-9_-]+)\.([CHSDQchsdq])([A-Za-z])(\d{2})(\d{4})@gmail\.com$/i;
  const match = email.match(k19Regex);

  if (match) {
    const [, namePart, campusCharRaw, majorCharRaw, cohortStr, orderStr] = match;
    const cohort = parseInt(cohortStr, 10);
    const campusChar = campusCharRaw.toUpperCase();
    const majorChar = majorCharRaw.toUpperCase();
    const studentCode = `${campusChar}${majorChar}${cohortStr}${orderStr}`;

    // Kiểm tra khóa: từ K19 trở đi mới được dùng Gmail này
    if (cohort < 19) {
      return {
        isValid: false,
        error: `Khóa K${cohort} (trước K19) bắt buộc phải sử dụng email trường định dạng @fpt.edu.vn theo quy định.`,
      };
    }

    const campusInfo = CAMPUS_CODE_MAP[campusChar] || { code: 'HN', name: 'Phân hiệu Hà Nội (HN)' };

    return {
      isValid: true,
      type: 'GMAIL_K19_PLUS',
      cohort,
      studentCode,
      campusCode: campusInfo.code,
      campusName: campusInfo.name,
      campusLetter: campusChar,
      majorLetter: majorChar,
      namePart,
      email,
    };
  }

  // Nếu là tài khoản Gmail nhưng sai cấu trúc sinh viên K19
  if (email.endsWith('@gmail.com')) {
    return {
      isValid: false,
      error: 'Sinh viên từ K19 trở đi dùng Gmail theo định dạng chuẩn của trường: [Tên][HọLót].[MãSV]@gmail.com (Ví dụ: TanLT.CE190370@gmail.com).',
    };
  }

  return {
    isValid: false,
    error: 'Email không thuộc hệ thống FPT. Vui lòng dùng email @fpt.edu.vn (K18 trở về trước) hoặc mẫu [Ten][HoLot].[MSSV]@gmail.com (K19 trở đi).',
  };
}
