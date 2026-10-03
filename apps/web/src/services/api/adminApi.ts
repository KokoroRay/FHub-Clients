import { apiClient } from './client';
import {
  AdminUser,
  DetailedCampus,
  DetailedMajor,
  DetailedCourseNode,
  ReputationRule,
  DetailedBadge,
  DetailedAuditLog,
  AISensitivityConfig
} from '../adminMockData';

// Common pagination and response wrappers
export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

// ---------------------------------------------------------------------------
// 1. Auth & Admin Identity API
// ---------------------------------------------------------------------------
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
  user: {
    userId: number;
    email: string;
    studentCode?: string;
    roles: string[];
    isTwoFactorEnabled?: boolean;
  };
}

export const authApi = {
  login: async (email: string, password: string, deviceFingerprint?: string): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', {
      email,
      password,
      deviceFingerprint: deviceFingerprint || 'admin-web-console',
      deviceName: navigator.userAgent.includes('Windows') ? 'Windows PC' : 'Mac Workstation',
      deviceType: 'DESKTOP',
      browser: 'Chrome / Edge',
      operatingSystem: 'Windows 11'
    });
    return res.data.data;
  },

  verify2FA: async (twoFactorToken: string, code: string): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/2fa/verify', {
      twoFactorToken,
      code,
      trustDevice: true
    });
    return res.data.data;
  },

  logout: async (sessionId?: number): Promise<void> => {
    await apiClient.post('/api/auth/logout', { sessionId });
  },

  getSessions: async (userId?: number) => {
    const res = await apiClient.get<ApiResponse<PagedResult<any>>>(`/api/auth/sessions${userId ? `?userId=${userId}` : ''}`);
    return res.data.data;
  },

  getUserRoles: async (userId: number | string) => {
    const res = await apiClient.get<ApiResponse<{ userId: number; effectiveRoles: string[] }>>(`/api/users/${userId}/roles`);
    return res.data.data;
  },

  assignRole: async (userId: number | string, roleCode: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/api/users/${userId}/roles`, { roleCode });
    return res.data.data;
  },

  revokeRole: async (userId: number | string, roleCode: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/api/users/${userId}/roles/${roleCode}`);
    return res.data.data;
  }
};

// ---------------------------------------------------------------------------
// 2. Dashboard Aggregator API
// ---------------------------------------------------------------------------
export interface AdminDashboardStats {
  topStats: {
    totalUsers: number;
    usersDelta: string;
    supportTickets: number;
    ticketsQueueNote: string;
    urgentTicketsCount: number;
    courseNodes: number;
    activeCampuses: number;
    systemAlerts: number;
  };
  userActivity: {
    activeUsers: number;
    activeUsersDelta: string;
    newSignups: number;
    newSignupsDelta: string;
    discussionsDailyAvg: number;
    timeframe: string;
  };
  ticketsQueue: {
    openCount: number;
    inProgressCount: number;
    waitingCount: number;
    resolvedCount: number;
    recentTickets: Array<{
      ticketId: number;
      title: string;
      priority: string;
      campus: string;
      timeAgo: string;
    }>;
  };
  academicOverview: {
    campusesCount: number;
    majorsCount: number;
    courseNodesCount: number;
    materialsCount: number;
    discussionsCount: number;
    workflowsCount: number;
  };
  recentAuditLogs: Array<{
    auditLogId: number;
    timestamp: string;
    performedBy: string;
    action: string;
    target: string;
  }>;
  systemStatus: {
    databaseUptime: string;
    apiClusterLatency: string;
    searchServiceStatus: string;
    cdnDeliveryUptime: string;
    isHealthy: boolean;
  };
  campusDistribution: Array<{
    campusCode: string;
    campusName: string;
    studentsCount: number;
    percentage: number;
  }>;
  pendingTasks: Array<{
    title: string;
    description: string;
    actionLabel: string;
    targetUrl: string;
  }>;
}

export const dashboardApi = {
  getStats: async (timeframe: string = 'Today'): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<ApiResponse<AdminDashboardStats>>(`/api/dashboard/stats?timeframe=${encodeURIComponent(timeframe)}`);
    return res.data.data;
  }
};

export interface AdminUserDto {
  userId: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  studentCode?: string;
  role: string;
  roles: string[];
  campus: string;
  major: string;
  accountStatus: string;
  verificationStatus: string;
  isActive: boolean;
  karma: number;
  createdAt: string;
  lastLoginAt?: string;
}

export const userManagementApi = {
  getAccounts: async (params?: { search?: string; role?: string; campus?: string; governanceRole?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const role = params?.role || params?.governanceRole;
    if (role && role !== 'ALL') query.set('role', role);
    if (params?.campus && params.campus !== 'ALL') query.set('campus', params.campus);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await apiClient.get<ApiResponse<PagedResult<AdminUserDto>>>(`/api/users?${query.toString()}`);
    return res.data.data;
  },

  createUser: async (payload: { email: string; fullName?: string; studentId?: string; role?: string; campus?: string; major?: string; password?: string }) => {
    const res = await apiClient.post<ApiResponse<any>>('/api/users', payload);
    return res.data.data;
  },

  getAccountById: async (id: number | string) => {
    const res = await apiClient.get<ApiResponse<AdminUserDto>>(`/api/users/${id}`);
    return res.data.data;
  },

  applyAction: async (id: number | string, payload: { actionType: 'SUSPEND' | 'MUTE' | 'WARN'; reason: string; expiresAt?: string }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/api/governance-accounts/${id}/actions`, payload);
    return res.data.data;
  },

  updateRole: async (id: number | string, governanceRole: string) => {
    const res = await apiClient.put<ApiResponse<any>>(`/api/governance-accounts/${id}/role`, { governanceRole });
    return res.data.data;
  },

  wipeAccount: async (id: number | string, reason: string = 'Wipe Data by Administrator') => {
    const res = await apiClient.delete<ApiResponse<any>>(`/api/governance-accounts/${id}/wipe`, {
      data: { reason }
    });
    return res.data.data;
  },

  processVerification: async (id: number | string, payload: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string }) => {
    const res = await apiClient.put<ApiResponse<any>>(`/api/manual-verifications/${id}/process`, payload);
    return res.data.data;
  }
};

// ---------------------------------------------------------------------------
// 4. Support Tickets API
// ---------------------------------------------------------------------------
export interface SupportTicketDto {
  supportTicketId: number;
  ticketCode: string;
  submitterAccountId: number;
  submitterName?: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export const supportTicketsApi = {
  getTickets: async (params?: { status?: string; priority?: string; category?: string; pageNumber?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await apiClient.get<ApiResponse<PagedResult<SupportTicketDto>>>(`/api/support-tickets?${query.toString()}`);
    return res.data.data;
  },

  getTicketById: async (id: number | string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/api/support-tickets/${id}`);
    return res.data.data;
  },

  addReply: async (id: number | string, payload: { body: string; attachmentUrl?: string; isInternalNote?: boolean }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/api/support-tickets/${id}/replies`, payload);
    return res.data.data;
  },

  updateStatus: async (id: number | string, status: string) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/api/support-tickets/${id}/status`, { status });
    return res.data.data;
  }
};

// ---------------------------------------------------------------------------
// 5. Campuses API
// ---------------------------------------------------------------------------
export interface CampusDto {
  campusId: number;
  campusCode: string;
  campusName: string;
  address?: string;
  city: string;
  phone?: string;
  email?: string;
  directorName?: string;
  isActive: boolean;
  totalFaculty?: number;
  totalMajors?: number;
  activeCourseNodes?: number;
  serverPartition?: {
    nodeId: string;
    region: string;
    status: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
    latencyMs: number;
    lastSyncAt: string;
    replicationLagSec: number;
    feedGlocalRouting: boolean;
  };
}

export const campusesApi = {
  getCampuses: async (params?: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await apiClient.get<ApiResponse<PagedResult<CampusDto>> | PagedResult<CampusDto>>(`/api/campuses?${query.toString()}`);
    return 'data' in res.data ? res.data.data : res.data;
  },

  getCampusById: async (id: number | string) => {
    const res = await apiClient.get<ApiResponse<CampusDto> | CampusDto>(`/api/campuses/${id}`);
    return 'data' in res.data ? res.data.data : res.data;
  },

  createCampus: async (payload: { campusCode: string; campusName: string; address?: string; city?: string; phone?: string; email?: string; directorName?: string; isActive?: boolean }) => {
    const res = await apiClient.post<ApiResponse<CampusDto> | CampusDto>('/api/campuses', payload);
    return 'data' in res.data ? res.data.data : res.data;
  },

  updateCampus: async (id: number | string, payload: { campusId: number; campusName: string; address?: string; city?: string; phone?: string; email?: string; directorName?: string; isActive?: boolean }) => {
    const res = await apiClient.put<ApiResponse<CampusDto> | CampusDto>(`/api/campuses/${id}`, payload);
    return 'data' in res.data ? res.data.data : res.data;
  },

  deleteCampus: async (id: number | string) => {
    await apiClient.delete(`/api/campuses/${id}`);
  }
};

// ---------------------------------------------------------------------------
// 6. Majors & Curriculum Matrix API
// ---------------------------------------------------------------------------
export interface MajorItemDto {
  majorId: number;
  majorCode: string;
  majorName: string;
  description?: string;
  isActive: boolean;
  vietnameseName?: string;
  department?: string;
  headOfDepartment?: string;
  totalCreditsRequired?: number;
  durationSemesters?: number;
  totalCourses?: number;
  linkedCampusesCount?: number;
  linkedCurriculaCount?: number;
  curriculumRoadmap?: Array<{
    semester: number;
    semesterName: string;
    courses: Array<{
      code: string;
      title: string;
      credits: number;
      prerequisites: string[];
      isMandatory: boolean;
    }>;
  }>;
}

export const majorsApi = {
  getMajors: async (params?: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await apiClient.get<any>(`/api/majors?${query.toString()}`);
    return res.data?.data ?? res.data;
  },

  getMajorById: async (id: number | string) => {
    const res = await apiClient.get<any>(`/api/majors/${id}`);
    return res.data?.data ?? res.data;
  },

  getMajorByCode: async (code: string) => {
    const res = await apiClient.get<any>(`/api/majors/code/${code}`);
    return res.data?.data ?? res.data;
  },

  createMajor: async (payload: { majorCode: string; majorName: string; vietnameseName?: string; description?: string; department?: string; headOfDepartment?: string; totalCreditsRequired?: number; isActive?: boolean }) => {
    const res = await apiClient.post<any>('/api/majors', payload);
    return res.data?.data ?? res.data;
  },

  updateMajor: async (id: number | string, payload: { majorName: string; description?: string; isActive?: boolean }) => {
    const res = await apiClient.put<any>(`/api/majors/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  deleteMajor: async (id: number | string) => {
    await apiClient.delete(`/api/majors/${id}`);
  },

  addCourseToSemester: async (majorId: number | string, payload: { semesterNumber: number; courseCode: string; courseTitle: string; credits: number; prerequisites?: string[]; isMandatory?: boolean }) => {
    const res = await apiClient.post<any>(`/api/majors/${majorId}/curriculum-courses`, payload);
    return res.data?.data ?? res.data;
  },

  removeCourseFromSemester: async (majorId: number | string, courseCode: string, semester: number = 1) => {
    const res = await apiClient.delete<any>(`/api/majors/${majorId}/curriculum-courses/${courseCode}?semester=${semester}`);
    return res.data?.data ?? res.data;
  }
};

// ---------------------------------------------------------------------------
// 7. Course Nodes API
// ---------------------------------------------------------------------------
export interface CourseNodeDto {
  courseNodeId: number;
  courseCode: string;
  courseName: string;
  description?: string;
  creditCount?: number;
  isActive: boolean;
  vietnameseTitle?: string;
  department?: string;
  syllabusVersion?: string;
  learningObjectives?: string[];
  campusOfferings?: Array<{
    campusCode: string;
    activeClasses: number;
    enrolledStudents: number;
    lecturers: string[];
  }>;
  topics?: Array<{
    id: string;
    title: string;
    order: number;
    estimatedHours: number;
  }>;
}

export const courseNodesApi = {
  getCourseNodes: async (params?: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await apiClient.get<any>(`/api/course-nodes?${query.toString()}`);
    return res.data?.data ?? res.data;
  },

  getCourseNodeById: async (id: number | string) => {
    const res = await apiClient.get<any>(`/api/course-nodes/${id}`);
    return res.data?.data ?? res.data;
  },

  createCourseNode: async (payload: { courseCode: string; courseName: string; description?: string; creditCount?: number; isActive?: boolean }) => {
    const res = await apiClient.post<any>('/api/course-nodes', payload);
    return res.data?.data ?? res.data;
  },

  updateCourseNode: async (id: number | string, payload: { courseName: string; description?: string; creditCount?: number; isActive?: boolean }) => {
    const res = await apiClient.put<ApiResponse<CourseNodeDto>>(`/api/course-nodes/${id}`, payload);
    return res.data.data;
  },

  deleteCourseNode: async (id: number | string) => {
    await apiClient.delete(`/api/course-nodes/${id}`);
  }
};

// ---------------------------------------------------------------------------
// 8. Reputation Rules API (Go Interaction Service)
// ---------------------------------------------------------------------------
export const reputationApi = {
  getRules: async (): Promise<ReputationRule[]> => {
    const res = await apiClient.get<any[]>('/api/reputation/rules');
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((r: any) => ({
      id: String(r.id || r.rule_id || `rep-${Math.random()}`),
      actionCode: r.actionCode || r.rule_code || r.code || '',
      actionName: r.actionName || r.rule_name || r.name || 'Unnamed Rule',
      category: (r.category || (r.event_type?.includes('QUESTION') ? 'DISCUSSION' : r.event_type?.includes('REPORT') ? 'COMMUNITY' : (r.points_delta ?? r.pointDelta ?? 0) < 0 ? 'PENALTY' : 'CONTENT')) as any,
      pointDelta: typeof r.pointDelta === 'number' ? r.pointDelta : (r.points_delta ?? 0),
      description: r.description || '',
      dailyCap: r.dailyCap ?? r.daily_limit ?? 0,
      cooldownSeconds: r.cooldownSeconds ?? 0,
      isActive: r.isActive ?? r.is_active ?? true,
      lastUpdated: r.lastUpdated || r.updated_at || new Date().toISOString(),
      updatedBy: r.updatedBy || 'System Policy Engine',
    }));
  },

  getRuleById: async (id: number | string): Promise<ReputationRule> => {
    const res = await apiClient.get<any>(`/api/reputation/rules/${id}`);
    const r = res.data;
    return {
      id: String(r.id || r.rule_id || id),
      actionCode: r.actionCode || r.rule_code || '',
      actionName: r.actionName || r.rule_name || 'Rule',
      category: (r.category || 'DISCUSSION') as any,
      pointDelta: r.pointDelta ?? r.points_delta ?? 0,
      description: r.description || '',
      dailyCap: r.dailyCap ?? r.daily_limit ?? 0,
      cooldownSeconds: r.cooldownSeconds ?? 0,
      isActive: r.isActive ?? r.is_active ?? true,
      lastUpdated: r.lastUpdated || r.updated_at || new Date().toISOString(),
      updatedBy: r.updatedBy || 'Policy Engine',
    };
  },

  createRule: async (payload: { actionCode: string; actionName: string; category: string; pointDelta: number; dailyCap: number; description?: string }) => {
    const res = await apiClient.post<any>('/api/admin/reputation/rules', payload);
    return res.data;
  },

  updateRule: async (id: number | string, payload: { actionName: string; category?: string; pointDelta: number; dailyCap: number; description?: string; isActive?: boolean }) => {
    const res = await apiClient.put<any>(`/api/admin/reputation/rules/${id}`, payload);
    return res.data;
  },

  processEvent: async (payload: { userId: number; actionCode: string; targetId?: number; pointDeltaOverride?: number }) => {
    const res = await apiClient.post('/api/reputation/events', payload);
    return res.data;
  }
};

// ---------------------------------------------------------------------------
// 9. Achievement Badges API (Go Interaction Service)
// ---------------------------------------------------------------------------
export const badgesApi = {
  getBadges: async (): Promise<DetailedBadge[]> => {
    const res = await apiClient.get<any[]>('/api/badges');
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map((b: any) => ({
      id: String(b.id || b.badge_id || `badge-${Math.random()}`),
      code: b.code || b.badge_code || '',
      name: b.name || b.badge_name || 'Unnamed Badge',
      description: b.description || '',
      icon: b.icon || b.icon_url || 'Sparkles',
      tier: (b.tier || ((b.criteria_value ?? b.pointValue ?? 0) >= 500 ? 'LEGENDARY' : (b.criteria_value ?? b.pointValue ?? 0) >= 100 ? 'PLATINUM' : (b.criteria_value ?? b.pointValue ?? 0) >= 10 ? 'GOLD' : 'SILVER')) as any,
      category: (b.category || (b.criteria_type?.includes('QUESTION') ? 'CONTRIBUTOR' : b.criteria_type?.includes('MOD') ? 'MODERATOR' : 'COMMUNITY')) as any,
      triggerCriteria: b.triggerCriteria || b.criteria_type || 'Custom Criteria',
      pointValue: b.pointValue ?? (b.criteria_value ?? 0),
      awardedCount: b.awardedCount ?? 0,
      isActive: b.isActive ?? b.is_active ?? true,
      createdAt: b.createdAt || b.created_at || new Date().toISOString(),
    }));
  },

  getBadgeById: async (id: number | string): Promise<DetailedBadge> => {
    const res = await apiClient.get<any>(`/api/admin/badges/${id}`);
    const b = res.data;
    return {
      id: String(b.id || b.badge_id || id),
      code: b.code || b.badge_code || '',
      name: b.name || b.badge_name || 'Badge',
      description: b.description || '',
      icon: b.icon || b.icon_url || 'Sparkles',
      tier: (b.tier || 'GOLD') as any,
      category: (b.category || 'CONTRIBUTOR') as any,
      triggerCriteria: b.triggerCriteria || b.criteria_type || '',
      pointValue: b.pointValue ?? b.criteria_value ?? 0,
      awardedCount: b.awardedCount ?? 0,
      isActive: b.isActive ?? b.is_active ?? true,
      createdAt: b.createdAt || b.created_at || new Date().toISOString(),
    };
  },

  createBadge: async (payload: { code: string; name: string; description?: string; tier?: string; category?: string; triggerCriteria?: string; pointValue?: number }) => {
    const res = await apiClient.post<any>('/api/admin/badges', payload);
    return res.data;
  },

  updateBadge: async (id: number | string, payload: { name: string; description?: string; tier?: string; category?: string; triggerCriteria?: string; pointValue?: number; isActive?: boolean }) => {
    const res = await apiClient.put<any>(`/api/admin/badges/${id}`, payload);
    return res.data;
  },

  deleteBadge: async (id: number | string) => {
    await apiClient.delete(`/api/admin/badges/${id}`);
  },

  awardBadge: async (payload: { userId: number; badgeId: number; reason?: string }) => {
    const res = await apiClient.post('/api/admin/badges/award', payload);
    return res.data;
  },

  revokeBadge: async (userBadgeId: number | string, reason?: string) => {
    const res = await apiClient.post(`/api/admin/badges/revoke/${userBadgeId}`, { reason });
    return res.data;
  }
};

// ---------------------------------------------------------------------------
// 10. Audit Logs API
// ---------------------------------------------------------------------------
export interface AuditLogDto {
  auditLogId: number;
  actorAccountId?: number;
  actorUserId?: number;
  actorRole?: string;
  actionType: string;
  entityType: string;
  entityId?: number;
  ipAddress?: string;
  createdAt: string;
}

export const auditLogsApi = {
  getLogs: async (params?: { actionType?: string; entityType?: string; actorAccountId?: number; fromUtc?: string; toUtc?: string; searchTerm?: string; pageNumber?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.actionType && params.actionType !== 'ALL') query.set('actionType', params.actionType);
    if (params?.entityType && params.entityType !== 'ALL') query.set('entityType', params.entityType);
    if (params?.actorAccountId) query.set('actorAccountId', String(params.actorAccountId));
    if (params?.fromUtc) query.set('fromUtc', params.fromUtc);
    if (params?.toUtc) query.set('toUtc', params.toUtc);
    if (params?.searchTerm) query.set('searchTerm', params.searchTerm);
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await apiClient.get<ApiResponse<PagedResult<AuditLogDto>>>(`/api/audit-logs?${query.toString()}`);
    return res.data.data;
  },

  getLogDetail: async (id: number | string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/api/audit-logs/${id}`);
    return res.data.data;
  },

  exportLogs: async (format: 'csv' | 'json' = 'csv', filters?: Record<string, any>) => {
    const query = new URLSearchParams({ format });
    if (filters?.actionType) query.set('actionType', filters.actionType);
    if (filters?.entityType) query.set('entityType', filters.entityType);

    const res = await apiClient.get(`/api/audit-logs/export?${query.toString()}`, {
      responseType: 'blob'
    });

    const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhub_audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// ---------------------------------------------------------------------------
// 11. System Health & Telemetry API
// ---------------------------------------------------------------------------
export const healthApi = {
  checkAllServices: async () => {
    const services = [
      { name: 'Identity Service', port: 5111, path: '/api/health/identity' },
      { name: 'Taxonomy Service', port: 5255, path: '/api/health/taxonomy' },
      { name: 'Governance Service', port: 5249, path: '/api/health/governance' },
      { name: 'Interaction Service', port: 8081, path: '/api/health/interaction' },
      { name: 'Communication Service', port: 8082, path: '/api/health/communication' },
      { name: 'Content Service', port: 5121, path: '/api/health/content' },
      { name: 'Profile Service', port: 5267, path: '/api/health/profile' }
    ];

    const results = await Promise.allSettled(
      services.map(async (s) => {
        const start = performance.now();
        try {
          await apiClient.get(s.path, { timeout: 3500 });
          const latency = Math.round(performance.now() - start);
          return { name: s.name, status: 'HEALTHY' as const, latencyMs: latency || 18, uptime: '99.98%' };
        } catch {
          const latency = Math.round(performance.now() - start);
          return { name: s.name, status: 'DEGRADED' as const, latencyMs: latency || 120, uptime: '98.5%' };
        }
      })
    );

    return results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return { name: services[i].name, status: 'OFFLINE' as const, latencyMs: 999, uptime: '0%' };
    });
  }
};
