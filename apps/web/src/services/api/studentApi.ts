import { apiClient } from './client';

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

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
