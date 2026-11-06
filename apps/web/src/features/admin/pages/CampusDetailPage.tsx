import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Calendar,
  Info,
} from 'lucide-react';
import { DetailedCampus } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { useCampuses, useMajors } from '../../../services/api';

export const CampusDetailPage: React.FC = () => {
  const { locale, t } = useLanguage();
  const { code } = useParams<{ code: string }>();
  const { data: campusesData, isLoading } = useCampuses();
  const { data: majorsData } = useMajors();

  const [campuses, setCampuses] = useState<DetailedCampus[]>([]);

  useEffect(() => {
    if (campusesData?.items) {
      const mapped: DetailedCampus[] = campusesData.items.map((c: any) => ({
        id: String(c.campusId),
        code: (c.campusCode || '') as any,
        name: c.campusName || 'FPT University Campus',
        location: c.address || c.city || 'N/A',
        isActive: c.isActive ?? true,
        studentCount: c.studentsCount || 0,
        regionalDirector: c.directorName || '—',
        contactEmail: c.email || '—',
        contactPhone: c.phone || '—',
        totalFaculty: c.totalFaculty || 0,
        totalMajors: c.totalMajors || 0,
        activeCourseNodes: c.activeCourseNodes || 0,
        serverPartition: {
          nodeId: c.campusCode || '',
          region: c.city || '',
          status: c.isActive ? 'OPTIMAL' : 'MAINTENANCE',
          latencyMs: 0,
          lastSyncAt: c.updatedAt || c.createdAt || new Date().toISOString(),
          replicationLagSec: 0,
          feedGlocalRouting: false,
        },
      }));
      setCampuses(mapped);
    }
  }, [campusesData]);

  const targetCode = (code || '').toUpperCase();
  const rawItem = campusesData?.items?.find((c: any) => (c?.campusCode || '').toUpperCase() === targetCode);
  const found = campuses.find((c) => (c?.code || '').toUpperCase() === targetCode);

  const displayMajors = majorsData?.items
    ? majorsData.items.map((m: any) => ({
        id: String(m.majorId),
        code: m.majorCode,
        vietnameseName: m.vietnameseName || m.majorName,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
        {t('Loading campus details...')}
      </div>
    );
  }

  if (!found) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto p-6 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500">{t('Campus not found.')}</p>
        <Link to="/campuses" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          ← {t('Back to Campuses')}
        </Link>
      </div>
    );
  }

  const campus = found;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/campuses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back to Campuses')}
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          {t('Code:')} {campus.code}
        </span>
      </div>

      {/* Campus Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-2xs shrink-0">
              {campus.code}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-slate-900">{campus.name}</h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    campus.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {campus.isActive ? t('Active') : t('Inactive')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {campus.location}
                </span>
                {campus.contactEmail !== '—' && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {campus.contactEmail}
                    </span>
                  </>
                )}
                {campus.contactPhone !== '—' && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {campus.contactPhone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('City / Region')}</span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {(rawItem as any)?.city || campus.location}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('Director')}</span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {campus.regionalDirector}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('Total Academic Majors')}</span>
            <p className="text-sm font-bold text-blue-600 mt-0.5">
              {displayMajors.length} {t('Majors')}
            </p>
          </div>
        </div>
      </div>

      {/* Description & Overview */}
      {(rawItem as any)?.description && (
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">{t('Description')}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {(rawItem as any).description}
          </p>
        </div>
      )}

      {/* Majors Active at this Campus */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              {t('Campus Majors & Curriculums')}
            </h3>
          </div>
          <Link to="/majors" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            {t('View All Majors')}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {displayMajors.length === 0 ? (
            <div className="col-span-full p-4 text-center text-xs text-slate-400">
              {t('0 majors registered in the system.')}
            </div>
          ) : (
            displayMajors.map((m: any) => (
              <div
                key={m.id || m.majorId}
                className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-xs text-blue-600">
                    {m.code || m.majorCode}
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {m.vietnameseName || m.majorName}
                  </p>
                </div>
                <Link to={`/majors/${m.code}`} className="text-xs text-slate-400 hover:text-blue-600">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
