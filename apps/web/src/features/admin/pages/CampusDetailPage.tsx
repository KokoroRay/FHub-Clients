import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Server,
  MapPin,
  Mail,
  Phone,
  Users,
  Network,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { DetailedCampus } from '../../../services/adminMockData';
import { useCampuses, useMajors } from '../../../services/api';

export const CampusDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { data: campusesData, refetch } = useCampuses();
  const { data: majorsData } = useMajors();

  const [campuses, setCampuses] = useState<DetailedCampus[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (campusesData?.items) {
      const mapped: DetailedCampus[] = campusesData.items.map((c: any) => ({
        id: String(c.campusId),
        code: (c.campusCode || 'HL') as any,
        name: c.campusName || 'FPT University Campus',
        location: c.address || c.city || 'FPT University Campus',
        isActive: c.isActive ?? true,
        studentCount: c.studentsCount || 0,
        regionalDirector: c.directorName || 'Chưa chỉ định',
        contactEmail: c.email || 'N/A',
        contactPhone: c.phone || 'N/A',
        totalFaculty: c.totalFaculty || 0,
        totalMajors: c.totalMajors || 0,
        activeCourseNodes: c.activeCourseNodes || 0,
        serverPartition: c.serverPartition || {
          nodeId: `node-${(c.campusCode || 'node').toLowerCase()}-primary-01`,
          region: c.city || 'Vietnam',
          status: 'OPTIMAL',
          latencyMs: 18,
          lastSyncAt: new Date().toISOString(),
          replicationLagSec: 0.18,
          feedGlocalRouting: true,
        },
      }));
      setCampuses(mapped);
    }
  }, [campusesData]);

  const targetCode = (code || 'HL').toUpperCase();
  const found = campuses.find((c) => (c?.code || '').toUpperCase() === targetCode);
  const campus: DetailedCampus = found || {
    id: '0',
    code: targetCode as any,
    name: `FPT University ${targetCode}`,
    location: 'N/A',
    isActive: false,
    studentCount: 0,
    regionalDirector: 'Chưa chỉ định',
    contactEmail: 'N/A',
    contactPhone: 'N/A',
    totalFaculty: 0,
    totalMajors: 0,
    activeCourseNodes: 0,
    serverPartition: {
      nodeId: `node-${targetCode.toLowerCase()}-01`,
      region: 'N/A',
      status: 'MAINTENANCE',
      latencyMs: 0,
      lastSyncAt: new Date().toISOString(),
      replicationLagSec: 0,
      feedGlocalRouting: false,
    },
  };

  const [glocalRouting, setGlocalRouting] = useState(campus?.serverPartition?.feedGlocalRouting ?? true);

  const displayMajors = majorsData?.items
    ? majorsData.items.map((m: any) => ({
        id: String(m.majorId),
        code: m.majorCode,
        vietnameseName: m.vietnameseName || m.majorName,
      }))
    : [];

  const handleSyncPartition = async () => {
    setIsSyncing(true);
    await refetch();
    setTimeout(() => {
      setIsSyncing(false);
      setSuccessMessage(`Synchronized partition node ${campus.serverPartition.nodeId} with Taxonomy Microservice`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 600);
  };

  const handleToggleGlocalRouting = () => {
    const next = !glocalRouting;
    setGlocalRouting(next);
    setSuccessMessage(`Glocal Cross-Campus Feed Routing ${next ? 'ENABLED' : 'DISABLED'} for campus ${campus.code}`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/campuses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campuses
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Partition: {campus.serverPartition.nodeId}</span>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Campus Header Card (Figma 58:8220) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-2xs shrink-0">
              {campus.code}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-slate-900">{campus.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OPTIMAL 99.9%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {campus.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {campus.contactEmail}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {campus.contactPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncPartition}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Partition</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Students</span>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{campus.studentCount.toLocaleString()} SV</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty & Staff</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{campus.totalFaculty} Lecturers</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Majors</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{campus.totalMajors} Majors</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Course Nodes</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{campus.activeCourseNodes} Courses</p>
          </div>
        </div>
      </div>

      {/* 2-Column: Partition Server Infrastructure + Glocal Feed Policy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edge DC Server Telemetry */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Edge Partition Node Telemetry</h3>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="pt-2 first:pt-0 flex justify-between">
              <span className="text-slate-500">Node Identifier:</span>
              <span className="font-mono font-bold text-slate-800">{campus.serverPartition.nodeId}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Region DC:</span>
              <span className="font-semibold text-slate-800">{campus.serverPartition.region}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Latency (RTT):</span>
              <span className="font-mono font-bold text-emerald-600">{campus.serverPartition.latencyMs} ms</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Replication Lag:</span>
              <span className="font-mono font-bold text-emerald-600">{campus.serverPartition.replicationLagSec}s</span>
            </div>
          </div>
        </div>

        {/* Glocal Routing Feed Configuration */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Glocal Routing Policy</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${glocalRouting ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {glocalRouting ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Prioritizes local campus feed items for students at {campus.name} while continuing seamless cross-campus federation.
          </p>

          <div className="pt-2">
            <button
              onClick={handleToggleGlocalRouting}
              className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                glocalRouting
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {glocalRouting ? 'Disable Glocal Sync (Campus Isolate)' : 'Enable Glocal Sync'}
            </button>
          </div>
        </div>
      </div>

      {/* Majors Active at this Campus */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Campus Majors & Curriculums</h3>
          <Link to="/majors" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All Majors
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {displayMajors.length === 0 ? (
            <div className="col-span-full p-4 text-center text-xs text-slate-400">
              0 majors registered for this campus.
            </div>
          ) : (
            displayMajors.map((m: any) => (
              <div key={m.id || m.majorId} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-blue-600">{m.code || m.majorCode}</span>
                  <p className="text-xs font-semibold text-slate-800">{m.vietnameseName || m.majorName}</p>
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
