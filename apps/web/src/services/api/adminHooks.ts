import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dashboardApi,
  userManagementApi,
  supportTicketsApi,
  campusesApi,
  majorsApi,
  courseNodesApi,
  reputationApi,
  badgesApi,
  auditLogsApi,
  healthApi,
  authApi
} from './adminApi';

// ---------------------------------------------------------------------------
// 1. Dashboard Hook
// ---------------------------------------------------------------------------
export const useAdminDashboardStats = (timeframe: string = 'Today') => {
  return useQuery({
    queryKey: ['admin', 'dashboard', timeframe],
    queryFn: () => dashboardApi.getStats(timeframe),
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};

// ---------------------------------------------------------------------------
// 2. User & Governance Accounts Hooks
// ---------------------------------------------------------------------------
export const useGovernanceAccounts = (params?: { governanceRole?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['admin', 'governance-accounts', params],
    queryFn: () => userManagementApi.getAccounts(params),
    staleTime: 30000
  });
};

export const useGovernanceAccountDetail = (id?: number | string) => {
  return useQuery({
    queryKey: ['admin', 'governance-accounts', id],
    queryFn: () => userManagementApi.getAccountById(id!),
    enabled: !!id
  });
};

export const useApplyGovernanceAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: { actionType: 'SUSPEND' | 'MUTE' | 'WARN'; reason: string; expiresAt?: string } }) =>
      userManagementApi.applyAction(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'governance-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

export const useUpdateGovernanceRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number | string; role: string }) =>
      userManagementApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'governance-accounts'] });
    }
  });
};

export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleCode }: { userId: number | string; roleCode: string }) =>
      authApi.assignRole(userId, roleCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'governance-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-roles'] });
    }
  });
};

export const useRevokeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleCode }: { userId: number | string; roleCode: string }) =>
      authApi.revokeRole(userId, roleCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'governance-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-roles'] });
    }
  });
};

export const useWipeGovernanceAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason?: string }) =>
      userManagementApi.wipeAccount(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'governance-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

export const useProcessVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string } }) =>
      userManagementApi.processVerification(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'governance-accounts'] });
    }
  });
};

// ---------------------------------------------------------------------------
// 3. Support Tickets Hooks
// ---------------------------------------------------------------------------
export const useSupportTickets = (params?: { status?: string; priority?: string; category?: string; pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['admin', 'support-tickets', params],
    queryFn: () => supportTicketsApi.getTickets(params),
    staleTime: 20000
  });
};

export const useSupportTicketDetail = (id?: number | string) => {
  return useQuery({
    queryKey: ['admin', 'support-tickets', id],
    queryFn: () => supportTicketsApi.getTicketById(id!),
    enabled: !!id
  });
};

export const useAddTicketReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: { body: string; attachmentUrl?: string; isInternalNote?: boolean } }) =>
      supportTicketsApi.addReply(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] });
    }
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: string }) =>
      supportTicketsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

// ---------------------------------------------------------------------------
// 4. Campuses Hooks
// ---------------------------------------------------------------------------
export const useCampuses = (params?: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['admin', 'campuses', params],
    queryFn: () => campusesApi.getCampuses(params),
    staleTime: 60000
  });
};

export const useCampusDetail = (id?: number | string) => {
  return useQuery({
    queryKey: ['admin', 'campuses', id],
    queryFn: () => campusesApi.getCampusById(id!),
    enabled: !!id
  });
};

export const useCreateCampus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: campusesApi.createCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campuses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

export const useUpdateCampus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
      campusesApi.updateCampus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campuses'] });
    }
  });
};

export const useDeleteCampus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: campusesApi.deleteCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campuses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

// ---------------------------------------------------------------------------
// 5. Majors Hooks
// ---------------------------------------------------------------------------
export const useMajors = (params?: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['admin', 'majors', params],
    queryFn: () => majorsApi.getMajors(params),
    staleTime: 60000
  });
};

export const useMajorDetail = (codeOrId?: string | number) => {
  return useQuery({
    queryKey: ['admin', 'majors', codeOrId],
    queryFn: () => {
      if (!codeOrId) return null;
      if (typeof codeOrId === 'number' || /^\d+$/.test(String(codeOrId))) {
        return majorsApi.getMajorById(codeOrId);
      }
      return majorsApi.getMajorByCode(String(codeOrId));
    },
    enabled: !!codeOrId
  });
};

export const useCreateMajor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: majorsApi.createMajor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'majors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

export const useUpdateMajor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
      majorsApi.updateMajor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'majors'] });
    }
  });
};

export const useDeleteMajor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: majorsApi.deleteMajor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'majors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

export const useAddCourseToSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ majorId, payload }: { majorId: number | string; payload: any }) =>
      majorsApi.addCourseToSemester(majorId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'majors', variables.majorId] });
    }
  });
};

export const useRemoveCourseFromSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ majorId, courseCode, semester }: { majorId: number | string; courseCode: string; semester?: number }) =>
      majorsApi.removeCourseFromSemester(majorId, courseCode, semester),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'majors', variables.majorId] });
    }
  });
};

// ---------------------------------------------------------------------------
// 6. Course Nodes Hooks
// ---------------------------------------------------------------------------
export const useCourseNodes = (params?: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['admin', 'course-nodes', params],
    queryFn: () => courseNodesApi.getCourseNodes(params),
    staleTime: 60000
  });
};

export const useCourseNodeDetail = (id?: number | string) => {
  return useQuery({
    queryKey: ['admin', 'course-nodes', id],
    queryFn: () => courseNodesApi.getCourseNodeById(id!),
    enabled: !!id
  });
};

export const useCreateCourseNode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseNodesApi.createCourseNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

export const useUpdateCourseNode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
      courseNodesApi.updateCourseNode(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-nodes'] });
    }
  });
};

export const useDeleteCourseNode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseNodesApi.deleteCourseNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    }
  });
};

// ---------------------------------------------------------------------------
// 7. Reputation Rules Hooks
// ---------------------------------------------------------------------------
export const useReputationRules = () => {
  return useQuery({
    queryKey: ['admin', 'reputation-rules'],
    queryFn: () => reputationApi.getRules(),
    staleTime: 60000
  });
};

export const useCreateReputationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reputationApi.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reputation-rules'] });
    }
  });
};

export const useUpdateReputationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
      reputationApi.updateRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reputation-rules'] });
    }
  });
};

// ---------------------------------------------------------------------------
// 8. Achievement Badges Hooks
// ---------------------------------------------------------------------------
export const useBadges = () => {
  return useQuery({
    queryKey: ['admin', 'badges'],
    queryFn: () => badgesApi.getBadges(),
    staleTime: 60000
  });
};

export const useCreateBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: badgesApi.createBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] });
    }
  });
};

export const useUpdateBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
      badgesApi.updateBadge(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] });
    }
  });
};

export const useDeleteBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: badgesApi.deleteBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] });
    }
  });
};

export const useAwardBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: badgesApi.awardBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] });
    }
  });
};

export const useRevokeBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userBadgeId, reason }: { userBadgeId: number | string; reason?: string }) =>
      badgesApi.revokeBadge(userBadgeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'badges'] });
    }
  });
};

// ---------------------------------------------------------------------------
// 9. Audit Logs Hooks
// ---------------------------------------------------------------------------
export const useAuditLogs = (params?: { actionType?: string; entityType?: string; actorAccountId?: number; fromUtc?: string; toUtc?: string; searchTerm?: string; pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => auditLogsApi.getLogs(params),
    staleTime: 30000
  });
};

export const useAuditLogDetail = (id?: number | string) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', id],
    queryFn: () => auditLogsApi.getLogDetail(id!),
    enabled: !!id
  });
};

// ---------------------------------------------------------------------------
// 10. Health Telemetry Hook
// ---------------------------------------------------------------------------
export const useSystemHealthStatus = () => {
  return useQuery({
    queryKey: ['admin', 'health'],
    queryFn: () => healthApi.checkAllServices(),
    refetchInterval: 15000,
    staleTime: 10000
  });
};
