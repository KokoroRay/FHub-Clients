import { useState, useEffect } from 'react';
import { campusesApi } from '../services/api/adminApi';

export interface CampusDetailInfo {
  code: string;
  name: string;
  fullName: string;
  shortName: string;
  address?: string;
  city?: string;
  description?: string;
  isLoading: boolean;
}

// Canonical database definitions from Taxonomy.Campuses table
const FALLBACK_CAMPUSES: Record<
  string,
  { name: string; fullName: string; shortName: string; address: string; city: string; description: string }
> = {
  HL: {
    name: 'Trường Đại học FPT Phân hiệu Hà Nội',
    fullName: 'Trường Đại học FPT Phân hiệu Hà Nội (Hòa Lạc)',
    shortName: 'FPT University Hòa Lạc',
    address: 'Khu Giáo dục và Đào tạo – Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long, Xã Hòa Lạc, TP. Hà Nội',
    city: 'Hà Nội',
    description: 'Cơ sở đào tạo Trường Đại học FPT tại Khu Công nghệ cao Hòa Lạc, Hà Nội.',
  },
  HN: {
    name: 'Trường Đại học FPT Phân hiệu Hà Nội',
    fullName: 'Trường Đại học FPT Phân hiệu Hà Nội (Hòa Lạc)',
    shortName: 'FPT University Hòa Lạc',
    address: 'Khu Giáo dục và Đào tạo – Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long, Xã Hòa Lạc, TP. Hà Nội',
    city: 'Hà Nội',
    description: 'Cơ sở đào tạo Trường Đại học FPT tại Khu Công nghệ cao Hòa Lạc, Hà Nội.',
  },
  HCM: {
    name: 'Trường Đại học FPT Phân hiệu TP. Hồ Chí Minh',
    fullName: 'Trường Đại học FPT Phân hiệu TP. Hồ Chí Minh (HCM)',
    shortName: 'FPT University HCM',
    address: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    description: 'Cơ sở đào tạo Trường Đại học FPT tại Khu Công nghệ cao TP. Hồ Chí Minh.',
  },
  DN: {
    name: 'Trường Đại học FPT Phân hiệu Đà Nẵng',
    fullName: 'Trường Đại học FPT Phân hiệu Đà Nẵng (DN)',
    shortName: 'FPT University Đà Nẵng',
    address: 'Khu đô thị công nghệ FPT Đà Nẵng, Phường Ngũ Hành Sơn, TP. Đà Nẵng',
    city: 'Đà Nẵng',
    description: 'Cơ sở đào tạo Trường Đại học FPT tại Khu đô thị công nghệ FPT Đà Nẵng.',
  },
  CT: {
    name: 'Trường Đại học FPT Phân hiệu Cần Thơ',
    fullName: 'Trường Đại học FPT Phân hiệu Cần Thơ (CT)',
    shortName: 'FPT University Cần Thơ',
    address: 'Số 600, Đường Nguyễn Văn Cừ (nối dài), Phường An Bình, TP. Cần Thơ',
    city: 'Cần Thơ',
    description: 'Cơ sở đào tạo Trường Đại học FPT tại khu vực Đồng bằng sông Cửu Long (TP. Cần Thơ).',
  },
  QN: {
    name: 'Trường Đại học FPT Phân hiệu Quy Nhơn',
    fullName: 'Trường Đại học FPT Phân hiệu Quy Nhơn (QN)',
    shortName: 'FPT University Quy Nhơn',
    address: 'Khu đô thị mới An Phú Thịnh, Phường Quy Nhơn Đông, Tỉnh Bình Định',
    city: 'Quy Nhơn',
    description: 'Cơ sở đào tạo Trường Đại học FPT tại Khu đô thị mới An Phú Thịnh, Quy Nhơn.',
  },
};

/**
 * Format a campus short name following Figma standard (e.g. "FPT University Hòa Lạc", "FPT University HCM")
 */
function getCampusShortName(code: string, dbName?: string, city?: string): string {
  const c = code.toUpperCase();
  if (c === 'HL' || c === 'HN') return 'FPT University Hòa Lạc';
  if (c === 'HCM') return 'FPT University HCM';
  if (c === 'DN') return 'FPT University Đà Nẵng';
  if (c === 'CT') return 'FPT University Cần Thơ';
  if (c === 'QN') return 'FPT University Quy Nhơn';

  if (city) return `FPT University ${city}`;
  if (dbName) {
    const simplified = dbName
      .replace(/Trường\s+Đại\s+học\s+FPT\s+(Phân\s+hiệu\s+)?/gi, '')
      .replace(/Cơ\s+sở\s+/gi, '')
      .trim();
    if (simplified) return `FPT University ${simplified}`;
  }
  return `FPT University ${code}`;
}

/**
 * Hook to retrieve campus information from the Taxonomy database
 * Returns both compact short name (for compact cards/badges) and full details.
 */
export function useCampusDetails(campusCodeInput?: string): CampusDetailInfo {
  const rawCode = (campusCodeInput || 'HL').trim().toUpperCase();
  const normalizedKey = (rawCode === 'HN' || rawCode === 'HL') ? 'HL' : rawCode;
  const initialFallback = FALLBACK_CAMPUSES[normalizedKey] || FALLBACK_CAMPUSES['HL'];

  const [campusInfo, setCampusInfo] = useState<CampusDetailInfo>({
    code: rawCode,
    name: initialFallback.name,
    fullName: initialFallback.fullName,
    shortName: initialFallback.shortName,
    address: initialFallback.address,
    city: initialFallback.city,
    description: initialFallback.description,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const loadFromDatabase = async () => {
      try {
        const res = await campusesApi.getCampuses({ pageSize: 50 });
        const items = (res as any)?.items || res || [];

        if (isMounted && Array.isArray(items) && items.length > 0) {
          // Find matching campus in database list
          const matched = items.find((c: any) => {
            const code = (c.campusCode || c.code || '').trim().toUpperCase();
            if (code === rawCode) return true;
            if ((rawCode === 'HL' || rawCode === 'HN') && (code === 'HL' || code === 'HN')) return true;
            return false;
          });

          if (matched) {
            const dbName = matched.campusName || matched.name || initialFallback.name;
            const dbAddress = matched.address || matched.location || initialFallback.address;
            const dbCity = matched.city || initialFallback.city;
            const dbDesc = matched.description || initialFallback.description;
            const shortName = getCampusShortName(matched.campusCode || rawCode, dbName, dbCity);

            let formattedFullName = dbName;
            if (rawCode === 'HL' && !formattedFullName.includes('Hòa Lạc')) {
              formattedFullName = `${dbName} (Hòa Lạc)`;
            } else if (!formattedFullName.includes('(') && matched.campusCode) {
              formattedFullName = `${dbName} (${matched.campusCode})`;
            }

            setCampusInfo({
              code: matched.campusCode || rawCode,
              name: dbName,
              fullName: formattedFullName,
              shortName,
              address: dbAddress,
              city: dbCity,
              description: dbDesc,
              isLoading: false,
            });
            return;
          }
        }

        if (isMounted) {
          setCampusInfo((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        if (isMounted) {
          setCampusInfo((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    loadFromDatabase();

    return () => {
      isMounted = false;
    };
  }, [rawCode]);

  return campusInfo;
}
