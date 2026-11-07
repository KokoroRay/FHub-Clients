/**
 * FHub Master Taxonomy Constants & Utilities
 * Provides canonical mapping for Campuses, Majors, and Specializations across FPT University.
 */

export const FPT_MAJORS: Record<number | string, { code: string; name: string }> = {
  1: { code: 'IT', name: 'Công nghệ thông tin' },
  2: { code: 'CS', name: 'Khoa học máy tính' },
  3: { code: 'BA', name: 'Quản trị kinh doanh' },
  4: { code: 'MC', name: 'Công nghệ truyền thông' },
  5: { code: 'LAW', name: 'Luật kinh tế' },
  6: { code: 'EN', name: 'Ngôn ngữ Anh' },
  7: { code: 'JP', name: 'Ngôn ngữ Nhật' },
  8: { code: 'KR', name: 'Ngôn ngữ Hàn Quốc' },
  9: { code: 'CN', name: 'Ngôn ngữ Trung Quốc' },
  IT: { code: 'IT', name: 'Công nghệ thông tin' },
  CS: { code: 'CS', name: 'Khoa học máy tính' },
  BA: { code: 'BA', name: 'Quản trị kinh doanh' },
  MC: { code: 'MC', name: 'Công nghệ truyền thông' },
  LAW: { code: 'LAW', name: 'Luật kinh tế' },
  EN: { code: 'EN', name: 'Ngôn ngữ Anh' },
  JP: { code: 'JP', name: 'Ngôn ngữ Nhật' },
  KR: { code: 'KR', name: 'Ngôn ngữ Hàn Quốc' },
  CN: { code: 'CN', name: 'Ngôn ngữ Trung Quốc' },
};

export const FPT_SPECIALIZATIONS: Record<number | string, { code: string; name: string }> = {
  1: { code: 'SE', name: 'Kỹ thuật phần mềm' },
  2: { code: 'AI', name: 'Trí tuệ nhân tạo' },
  3: { code: 'IA', name: 'An toàn thông tin' },
  4: { code: 'IS', name: 'Hệ thống thông tin' },
  5: { code: 'IC', name: 'Thiết kế vi mạch' },
  6: { code: 'AS', name: 'Công nghệ ô tô số' },
  7: { code: 'DS', name: 'Khoa học dữ liệu ứng dụng' },
  8: { code: 'GD', name: 'Thiết kế đồ họa & Mỹ thuật số' },
  9: { code: 'RA', name: 'Robot & Trí tuệ nhân tạo' },
  10: { code: 'IT', name: 'Công nghệ thông tin' },
  11: { code: 'CS-AI', name: 'Trí tuệ nhân tạo & Khoa học dữ liệu' },
  12: { code: 'CS-SEC', name: 'An ninh mạng & An toàn số' },
  13: { code: 'DM', name: 'Digital Marketing' },
  14: { code: 'IB', name: 'Kinh doanh quốc tế' },
  15: { code: 'EC', name: 'Thương mại điện tử' },
  16: { code: 'BBA', name: 'Quản trị kinh doanh' },
  17: { code: 'HM', name: 'Quản trị khách sạn' },
  18: { code: 'TM', name: 'Quản trị dịch vụ du lịch & lữ hành' },
  19: { code: 'SCM', name: 'Logistics & Quản lý chuỗi cung ứng' },
  20: { code: 'BA-DA', name: 'Phân tích kinh doanh' },
  21: { code: 'FIN', name: 'Fintech (Công nghệ tài chính)' },
  22: { code: 'CF', name: 'Tài chính doanh nghiệp' },
  23: { code: 'SF', name: 'Tài chính thông minh' },
  24: { code: 'BF', name: 'Tài chính ngân hàng' },
  25: { code: 'EEM', name: 'Quản trị giải trí & sự kiện' },
  26: { code: 'CXM', name: 'Quản trị trải nghiệm khách hàng' },
  27: { code: 'PM', name: 'Quản trị thu mua' },
  28: { code: 'MMC', name: 'Truyền thông đa phương tiện' },
  29: { code: 'PR', name: 'Quan hệ công chúng' },
  30: { code: 'IMC', name: 'Truyền thông Marketing tích hợp' },
  31: { code: 'BC', name: 'Truyền thông thương hiệu' },
  32: { code: 'EL', name: 'Luật kinh tế' },
  33: { code: 'ITL', name: 'Luật thương mại quốc tế' },
  34: { code: 'EN-GEN', name: 'Ngôn ngữ Anh' },
  35: { code: 'EN-BUS', name: 'Tiếng Anh thương mại' },
  36: { code: 'JP-GEN', name: 'Ngôn ngữ Nhật' },
  37: { code: 'JP-BUS', name: 'Tiếng Nhật thương mại' },
  38: { code: 'KR-GEN', name: 'Ngôn ngữ Hàn Quốc' },
  39: { code: 'KR-BUS', name: 'Tiếng Hàn thương mại' },
  40: { code: 'CN-GEN', name: 'Ngôn ngữ Trung Quốc' },
  41: { code: 'CN-BUS', name: 'Tiếng Trung thương mại' },
  SE: { code: 'SE', name: 'Kỹ thuật phần mềm' },
  AI: { code: 'AI', name: 'Trí tuệ nhân tạo' },
  IA: { code: 'IA', name: 'An toàn thông tin' },
  IS: { code: 'IS', name: 'Hệ thống thông tin' },
  IC: { code: 'IC', name: 'Thiết kế vi mạch' },
  AS: { code: 'AS', name: 'Công nghệ ô tô số' },
  DS: { code: 'DS', name: 'Khoa học dữ liệu ứng dụng' },
  GD: { code: 'GD', name: 'Thiết kế đồ họa & Mỹ thuật số' },
  RA: { code: 'RA', name: 'Robot & Trí tuệ nhân tạo' },
  DM: { code: 'DM', name: 'Digital Marketing' },
  IB: { code: 'IB', name: 'Kinh doanh quốc tế' },
  EC: { code: 'EC', name: 'Thương mại điện tử' },
  BBA: { code: 'BBA', name: 'Quản trị kinh doanh' },
  HM: { code: 'HM', name: 'Quản trị khách sạn' },
  TM: { code: 'TM', name: 'Quản trị dịch vụ du lịch & lữ hành' },
  SCM: { code: 'SCM', name: 'Logistics & Quản lý chuỗi cung ứng' },
  FIN: { code: 'FIN', name: 'Fintech (Công nghệ tài chính)' },
  PR: { code: 'PR', name: 'Quan hệ công chúng' },
  EL: { code: 'EL', name: 'Luật kinh tế' },
};

export const FPT_CAMPUSES: Record<number | string, string> = {
  1: 'FPT University - Hòa Lạc (Hà Nội)',
  2: 'FPT University - TP. Hồ Chí Minh',
  3: 'FPT University - Đà Nẵng',
  4: 'FPT University - Cần Thơ',
  5: 'FPT University - Quy Nhơn',
  HL: 'FPT University - Hòa Lạc (Hà Nội)',
  HN: 'FPT University - Hòa Lạc (Hà Nội)',
  HCM: 'FPT University - TP. Hồ Chí Minh',
  DN: 'FPT University - Đà Nẵng',
  CT: 'FPT University - Cần Thơ',
  QN: 'FPT University - Quy Nhơn',
};

export const CAMPUS_ID_TO_CODE: Record<number | string, string> = {
  1: 'FU-HL',
  2: 'FU-HCM',
  3: 'FU-DN',
  4: 'FU-CT',
  5: 'FU-QN',
  '1': 'FU-HL',
  '2': 'FU-HCM',
  '3': 'FU-DN',
  '4': 'FU-CT',
  '5': 'FU-QN',
  HL: 'FU-HL',
  HN: 'FU-HL',
  HCM: 'FU-HCM',
  DN: 'FU-DN',
  CT: 'FU-CT',
  QN: 'FU-QN',
  'FU-HL': 'FU-HL',
  'FU-HCM': 'FU-HCM',
  'FU-DN': 'FU-DN',
  'FU-CT': 'FU-CT',
  'FU-QN': 'FU-QN',
};

/**
 * Resolves user/profile campus code accurately (e.g. FU-HL, FU-HCM, FU-DN, FU-CT, FU-QN)
 */
export function resolveUserCampus(data: any): string {
  if (!data) return '';
  const raw = data.campusCode || data.campus_code || data.campus || data.campusId || data.CampusId || data.campus_id;
  if (!raw) return '';
  if (CAMPUS_ID_TO_CODE[raw]) return CAMPUS_ID_TO_CODE[raw];
  const s = String(raw).trim();
  if (!s || s === 'null' || s === 'undefined') return '';
  if (s.startsWith('FU-')) return s;
  return `FU-${s.toUpperCase()}`;
}

/**
 * Resolves user/profile academic major and specialization name accurately
 */
export function resolveUserMajorName(data: any): string {
  if (!data) return 'Công nghệ thông tin';

  // 1. Direct specialization check
  const specId = data.specializationId || data.specialization_id;
  if (specId && FPT_SPECIALIZATIONS[specId]) {
    return `${FPT_SPECIALIZATIONS[specId].name} (${FPT_SPECIALIZATIONS[specId].code})`;
  }

  const specCode = data.specializationCode || data.specialization_code || data.specialization;
  if (specCode && FPT_SPECIALIZATIONS[specCode]) {
    return `${FPT_SPECIALIZATIONS[specCode].name} (${FPT_SPECIALIZATIONS[specCode].code})`;
  }

  if (data.specializationName && data.specializationName.trim()) {
    return data.specializationName.trim();
  }

  // 2. Direct major check
  const majorId = data.majorId || data.major_id;
  if (majorId && FPT_MAJORS[majorId]) {
    return `${FPT_MAJORS[majorId].name} (${FPT_MAJORS[majorId].code})`;
  }

  const majorCode = data.majorCode || data.major_code;
  if (majorCode && FPT_MAJORS[majorCode]) {
    return `${FPT_MAJORS[majorCode].name} (${FPT_MAJORS[majorCode].code})`;
  }

  if (data.majorName && data.majorName.trim()) {
    return data.majorName.trim();
  }

  // 3. String value in .major
  const rawMajor = data.major;
  if (typeof rawMajor === 'string' && rawMajor.trim()) {
    const trimmed = rawMajor.trim();
    if (FPT_SPECIALIZATIONS[trimmed]) {
      return `${FPT_SPECIALIZATIONS[trimmed].name} (${FPT_SPECIALIZATIONS[trimmed].code})`;
    }
    if (FPT_MAJORS[trimmed]) {
      return `${FPT_MAJORS[trimmed].name} (${FPT_MAJORS[trimmed].code})`;
    }
    // Filter out previous broken mock string
    if (trimmed.includes('K18 - DevOps')) {
      return 'Kỹ thuật phần mềm (SE)';
    }
    return trimmed;
  }

  return 'Công nghệ thông tin';
}
