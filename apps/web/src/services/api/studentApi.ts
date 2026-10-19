import { apiClient } from './client';
import type { ApiResponse, PagedResult } from './adminApi';


// ─── 1. Bookmark API (Go Interaction Service) ─────────────────────────────────
export interface BookmarkItem {
  id: number | string;
  userId: number;
  targetType: 'QUESTION' | 'ARTICLE' | 'WORKFLOW' | 'STUDY_MATERIAL';
  targetId: number | string;
  createdAt: string;
  title?: string;
  summary?: string;
}

export const bookmarkApi = {
  getBookmarks: async (type?: string): Promise<BookmarkItem[]> => {
    const url = type && type !== 'ALL' ? `/api/bookmarks/filter?type=${type}` : '/api/bookmarks';
    const res = await apiClient.get<BookmarkItem[] | ApiResponse<BookmarkItem[]>>(url);
    const data = (res.data as any).data || res.data;
    return Array.isArray(data) ? data : [];
  },

  addBookmark: async (targetType: string, targetId: number | string): Promise<any> => {
    const res = await apiClient.post('/api/bookmarks', { targetType, targetId });
    return res.data;
  },

  removeBookmark: async (bookmarkId: number | string): Promise<void> => {
    await apiClient.delete(`/api/bookmarks/${bookmarkId}`);
  },
};

// ─── 2. Notifications API (Go Communication Service) ──────────────────────────
export interface NotificationItem {
  id: number | string;
  recipientId: number;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (params?: { pageNumber?: number; pageSize?: number }): Promise<NotificationItem[]> => {
    const res = await apiClient.get<NotificationItem[] | ApiResponse<NotificationItem[]>>('/api/communication/notifications', { params });
    const data = (res.data as any).data || res.data;
    return Array.isArray(data) ? data : [];
  },

  markAsRead: async (id: number | string): Promise<void> => {
    await apiClient.patch(`/api/communication/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/api/communication/notifications/read-all');
  },

  deleteNotification: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/communication/notifications/${id}`);
  },
};

// ─── 2.5 Broadcast Campaigns API (Go Communication Service) ───────────────────
export interface BroadcastCampaignDto {
  campaignId: number;
  ownerAccountId: number;
  title: string;
  body: string;
  audienceType: string;
  targetCampusId?: number;
  targetMajorId?: number;
  targetSpecializationId?: number;
  deliveryChannels: string;
  isMandatory: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBroadcastRequest {
  title: string;
  body: string;
  audienceType: 'ALL' | 'CAMPUS' | 'MAJOR' | 'SPECIALIZATION';
  targetCampusId?: number;
  targetMajorId?: number;
  targetSpecializationId?: number;
  deliveryChannels?: string;
  isMandatory?: boolean;
}

export const broadcastApi = {
  getBroadcasts: async (params?: { status?: string; search?: string; page?: number; page_size?: number }): Promise<{ items: BroadcastCampaignDto[]; total_count: number }> => {
    const res = await apiClient.get('/api/communication/broadcasts', { params });
    const data = (res.data as any).data || res.data;
    return data && data.items ? data : { items: Array.isArray(data) ? data : [], total_count: 0 };
  },

  getBroadcastById: async (id: number | string): Promise<BroadcastCampaignDto> => {
    const res = await apiClient.get(`/api/communication/broadcasts/${id}`);
    return (res.data as any).data || res.data;
  },

  createBroadcast: async (payload: CreateBroadcastRequest): Promise<BroadcastCampaignDto> => {
    const res = await apiClient.post('/api/communication/broadcasts', {
      title: payload.title,
      body: payload.body,
      audienceType: payload.audienceType,
      targetCampusId: payload.targetCampusId,
      targetMajorId: payload.targetMajorId,
      targetSpecializationId: payload.targetSpecializationId,
      deliveryChannels: payload.deliveryChannels || 'IN_APP',
      isMandatory: payload.isMandatory ?? true,
    });
    return (res.data as any).data || res.data;
  },

  deleteBroadcast: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/communication/broadcasts/${id}`);
  },
};

// ─── 3. Student Support Tickets API (Governance Service) ──────────────────────
export interface StudentTicketItem {
  ticketId: number;
  title: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  messagesCount?: number;
}

export interface StudentTicketDetail extends StudentTicketItem {
  description: string;
  attachments?: string[];
  messages: Array<{
    messageId: number;
    senderId: number;
    senderName: string;
    senderRole: string;
    content: string;
    createdAt: string;
  }>;
}

export const studentSupportTicketApi = {
  getMyTickets: async (params?: { status?: string; pageNumber?: number; pageSize?: number }): Promise<PagedResult<StudentTicketItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<StudentTicketItem>>>('/api/student/support-tickets', { params });
    return res.data.data;
  },

  getTicketById: async (id: number | string): Promise<StudentTicketDetail> => {
    const res = await apiClient.get<ApiResponse<StudentTicketDetail>>(`/api/student/support-tickets/${id}`);
    return res.data.data;
  },

  createTicket: async (payload: { title: string; category: string; description: string; priority?: string }): Promise<StudentTicketDetail> => {
    const res = await apiClient.post<ApiResponse<StudentTicketDetail>>('/api/student/support-tickets', {
      subject: payload.title,
      category: payload.category,
      description: payload.description,
      priority: (payload.priority || 'NORMAL').toUpperCase(),
    });
    return res.data.data;
  },

  addReply: async (id: number | string, message: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/api/student/support-tickets/${id}/replies`, {
      body: message,
    });
    return res.data.data;
  },

  updateStatus: async (id: number | string, status: string): Promise<any> => {
    const res = await apiClient.patch<ApiResponse<any>>(`/api/student/support-tickets/${id}/status`, {
      status: status.toUpperCase().replace(' ', '_'),
    });
    return res.data.data;
  },
};

// ─── 4. Profile & Preferences API (Profile Service) ───────────────────────────
export interface UserProfileDto {
  userId: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  campusCode?: string;
  majorCode?: string;
  specializationCode?: string;
  studentCode?: string;
  karma: number;
  status: string;
  mutedTags: Array<{ semanticTagId: number; tagName: string }>;
}

export interface UserPreferencesDto {
  feedTuning: {
    preferMyMajor: boolean;
    preferMyCampus: boolean;
    showHotDiscussions: boolean;
  };
  privacy: {
    showEmail: boolean;
    showActivity: boolean;
  };
}

export const profileApi = {
  getProfile: async (userId: number | string): Promise<UserProfileDto> => {
    const res = await apiClient.get<ApiResponse<UserProfileDto>>(`/api/profiles/${userId}`);
    return res.data.data;
  },

  getMyPreferences: async (): Promise<UserPreferencesDto> => {
    const res = await apiClient.get<ApiResponse<UserPreferencesDto>>('/api/profiles/me/preferences');
    return res.data.data;
  },

  updatePersonalInfo: async (payload: { displayName?: string; fullName?: string; bio?: string; avatarUrl?: string; links?: any[] }): Promise<any> => {
    const res = await apiClient.put<ApiResponse<any>>('/api/profiles/me/personal-info', {
      displayName: payload.displayName || payload.fullName,
      bio: payload.bio,
      avatarUrl: payload.avatarUrl,
      links: payload.links || []
    });
    return res.data.data;
  },

  updateAcademicInfo: async (payload: {
    campusId?: number;
    majorId?: number;
    specializationId?: number;
    currentSemester?: number;
    graduationYear?: number;
  }): Promise<any> => {
    const res = await apiClient.put<ApiResponse<any>>('/api/profiles/me/academic-info', payload);
    return res.data.data;
  },

  updatePrivacySettings: async (payload: {
    profileVisibility: string;
    allowSearchEngineIndexing?: boolean;
    showVoteHistory?: boolean;
    showContributionHistory?: boolean;
  }): Promise<any> => {
    const res = await apiClient.put<ApiResponse<any>>('/api/profiles/me/privacy-settings', {
      profileVisibility: payload.profileVisibility,
      allowSearchEngineIndexing: payload.allowSearchEngineIndexing ?? true,
      showVoteHistory: payload.showVoteHistory ?? true,
      showContributionHistory: payload.showContributionHistory ?? true,
    });
    return res.data.data;
  },

  updateFeedPreferences: async (feedPreferenceJson: string | object): Promise<any> => {
    const jsonStr = typeof feedPreferenceJson === 'string' ? feedPreferenceJson : JSON.stringify(feedPreferenceJson);
    const res = await apiClient.put<ApiResponse<any>>('/api/profiles/me/feed-preferences', { feedPreferenceJson: jsonStr });
    return res.data.data;
  },

  addMutedTag: async (semanticTagId: number): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/api/profiles/me/muted-tags', { semanticTagId });
    return res.data.data;
  },

  removeMutedTag: async (semanticTagId: number): Promise<void> => {
    await apiClient.delete(`/api/profiles/me/muted-tags/${semanticTagId}`);
  },

  exportData: async (exportFormat: string = 'JSON'): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/api/profiles/me/data-export', { exportFormat });
    return res.data.data;
  },
};

// ─── 5. Vote API (Go Interaction Service) ─────────────────────────────────────
export interface VoteRequest {
  target_type: 'ARTICLE' | 'QUESTION' | 'COMMENT' | 'WORKFLOW' | 'STUDY_MATERIAL';
  target_id: number | string;
  vote_value: 1 | -1;
}

export interface VoteResponse {
  voteId: number;
  userId: number;
  targetType: string;
  targetId: number;
  voteValue: number;
  scoreDelta: number;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoteStats {
  targetType: string;
  targetId: number;
  upvotes: number;
  downvotes: number;
  score: number;
}

export const voteApi = {
  vote: async (payload: VoteRequest): Promise<VoteResponse> => {
    const res = await apiClient.put<VoteResponse>('/api/votes', {
      target_type: payload.target_type,
      target_id: Number(payload.target_id) || 1,
      vote_value: payload.vote_value,
    });
    return (res.data as any).data || res.data;
  },

  removeVote: async (targetType: string, targetId: number | string): Promise<void> => {
    await apiClient.delete(`/api/votes/${targetType}/${targetId}`);
  },

  getStats: async (targetType: string, targetId: number | string): Promise<VoteStats> => {
    const res = await apiClient.get<VoteStats>(`/api/votes/stats/${targetType}/${targetId}`);
    return (res.data as any).data || res.data;
  },

  getMyVotes: async (): Promise<VoteResponse[]> => {
    const res = await apiClient.get<VoteResponse[]>('/api/interactions/me/votes');
    return (res.data as any).data || res.data || [];
  },
};

// ─── 6. Reputation & Rules API (Go Interaction Service) ───────────────────────
export interface ReputationRuleDto {
  rule_id: number;
  action_type: string;
  karma_delta: number;
  daily_cap: number;
  description: string;
  is_active: boolean;
}

export const studentReputationApi = {
  getRules: async (): Promise<ReputationRuleDto[]> => {
    const res = await apiClient.get<ReputationRuleDto[] | ApiResponse<ReputationRuleDto[]>>('/api/interactions/rules');
    const data = (res.data as any).data || res.data;
    return Array.isArray(data) ? data : [];
  },

  getUserHistory: async (userId: number | string): Promise<any> => {
    const res = await apiClient.get(`/api/reputation/history/${userId}`);
    return (res.data as any).data || res.data;
  },

  getAccount: async (userId: number | string): Promise<any> => {
    const res = await apiClient.get(`/api/reputation/accounts/${userId}`);
    return (res.data as any).data || res.data;
  },
};

// ─── 7. Badges API (Go Interaction Service) ───────────────────────────────────
export interface BadgeDto {
  badge_id: number;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  tier: string;
  criteria_type: string;
  threshold_value: number;
  is_active: boolean;
}

export interface UserBadgeDto {
  user_badge_id: number;
  user_id: number;
  badge_id: number;
  badge: BadgeDto;
  awarded_at: string;
  is_pinned: boolean;
}

export const badgeApi = {
  getMyBadges: async (): Promise<UserBadgeDto[]> => {
    const res = await apiClient.get<UserBadgeDto[] | ApiResponse<UserBadgeDto[]>>('/api/interactions/me/badges');
    const data = (res.data as any).data || res.data;
    return Array.isArray(data) ? data : [];
  },

  getUserBadges: async (userId: number | string): Promise<UserBadgeDto[]> => {
    const res = await apiClient.get<UserBadgeDto[] | ApiResponse<UserBadgeDto[]>>(`/api/users/${userId}/badges`);
    const data = (res.data as any).data || res.data;
    return Array.isArray(data) ? data : [];
  },

  getAllBadges: async (): Promise<BadgeDto[]> => {
    const res = await apiClient.get<BadgeDto[] | ApiResponse<BadgeDto[]>>('/api/badges');
    const data = (res.data as any).data || res.data;
    return Array.isArray(data) ? data : [];
  },
};

