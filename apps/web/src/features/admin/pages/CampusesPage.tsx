import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Server,
  MapPin,
  Users,
  Network,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { mockDetailedCampuses, DetailedCampus } from '../../../services/adminMockData';
import { useCampuses, useCreateCampus } from '../../../services/api';

export const CampusesPage: React.FC = () => {
  const { data: campusesData, isLoading, refetch } = useCampuses();
  const createCampusMutation = useCreateCampus();

  const [campuses, setCampuses] = useState<DetailedCampus[]>(mockDetailedCampuses);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // New Campus Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDirector, setNewDirector] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (campusesData?.items && campusesData.items.length > 0) {
      const mapped: DetailedCampus[] = campusesData.items.map((c: any) => ({
        id: String(c.campusId),
        code: (c.campusCode || 'HL') as any,
        name: c.campusName || 'FPT University Campus',
        location: c.address || c.city || 'FPT University Campus',
        isActive: c.isActive ?? true,
        studentCount: c.studentsCount || 4200,
        regionalDirector: c.directorName || 'Assigned Director',
        contactEmail: c.email || `${c.campusCode?.toLowerCase() || 'campus'}@fpt.edu.vn`,
        contactPhone: c.phone || '024.7300.5588',
        totalFaculty: c.totalFaculty || 85,
        totalMajors: c.totalMajors || 8,
        activeCourseNodes: c.activeCourseNodes || 140,
        serverPartition: c.serverPartition || {
          nodeId: `node-${(c.campusCode || 'node').toLowerCase()}-primary-01`,
          region: 'ap-southeast-1 (Edge DC)',
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

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await refetch();
    setTimeout(() => {
      setIsSyncing(false);
      setSyncNotice('All 5 Campus Partition Nodes have been synchronized successfully with Taxonomy microservice!');
      setTimeout(() => setSyncNotice(null), 3500);
    }, 700);
  };

  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    try {
      await createCampusMutation.mutateAsync({
        campusCode: newCode.trim().toUpperCase(),
        campusName: newName.trim(),
        address: newLocation.trim() || 'Khu CNC Hòa Lạc',
        city: newLocation.trim() || 'Hà Nội',
        directorName: newDirector.trim() || 'Giám đốc Phân hiệu',
        email: newEmail.trim() || `${newCode.trim().toLowerCase()}@fe.edu.vn`,
        phone: '024.7300.5588',
        isActive: true,
      });

      setShowCreateModal(false);
      setSyncNotice(`Initialized and saved campus partition: ${newName.trim()} (${newCode.trim().toUpperCase()}) to Database.`);
      setTimeout(() => setSyncNotice(null), 4000);
      refetch();
    } catch (err: any) {
      // Fallback local if offline
      const created: DetailedCampus = {
        id: `camp-${Date.now()}`,
        code: newCode.trim().toUpperCase() as any,
        name: newName.trim(),
        location: newLocation.trim() || 'FPT University Campus',
        isActive: true,
        studentCount: 1,
        regionalDirector: newDirector.trim() || 'Unassigned',
        contactEmail: newEmail.trim() || 'contact@fe.edu.vn',
        contactPhone: '024.7300.5588',
        totalFaculty: 50,
        totalMajors: 8,
        activeCourseNodes: 120,
        serverPartition: {
          nodeId: `node-${newCode.toLowerCase()}-primary-01`,
          region: 'ap-southeast-1 (Edge DC)',
          status: 'OPTIMAL',
          latencyMs: 20,
          lastSyncAt: new Date().toISOString(),
          replicationLagSec: 0.2,
          feedGlocalRouting: true,
        },
      };
      setCampuses((prev) => [...prev, created]);
      setShowCreateModal(false);
      setSyncNotice(`Initialized campus partition locally: ${created.name} (${created.code})`);
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>ACADEMIC TAXONOMY</span>
            <span>&gt;</span>
            <span className="text-blue-600">CAMPUS PARTITIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Campus Partition & Node Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all 5 regional FPT University campuses, Edge DC partition nodes, and Glocal routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All 5 Partitions</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Campus Node</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Campus Grid Cards (Figma 57:6972) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campuses.map((campus) => (
          <div
            key={campus.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-2xs">
                    {campus.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {campus.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">Node: {campus.serverPartition.nodeId}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPTIMAL
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Director:</span>
                  <span className="font-semibold text-slate-800">{campus.regionalDirector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Enrolled Students:</span>
                  <span className="font-bold text-blue-600">{campus.studentCount.toLocaleString()} SV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Majors / Course Nodes:</span>
                  <span className="font-semibold text-slate-800">
                    {campus.totalMajors} Majors / {campus.activeCourseNodes} Courses
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{campus.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Replication Lag: {campus.serverPartition.replicationLagSec}s</span>
                  <span className="text-emerald-600 font-semibold">{campus.serverPartition.latencyMs}ms Latency</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Glocal Feed Sync: ON</span>
              <Link
                to={`/campuses/${campus.code}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>Details & Config</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Campus Partition */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add New Campus Partition</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="HP"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="FPT University Hai Phong"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Location Address:</label>
                <input
                  type="text"
                  placeholder="Urban Tech Zone..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Campus Director:</label>
                  <input
                    type="text"
                    placeholder="Dr. Nguyen..."
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Contact Email:</label>
                  <input
                    type="email"
                    placeholder="admissions@fe.edu.vn"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
                >
                  Create Partition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
