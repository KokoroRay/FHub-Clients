import { apiClient } from './client';
import type { ApiResponse, PagedResult } from './adminApi';


// ─── 1. Bookmark API (Go Interaction Service) ─────────────────────────────────
export interface BookmarkItem {
  id: number | string;
  bookmarkId?: number | string;
  userId?: number;
  targetType: 'QUESTION' | 'ARTICLE' | 'WORKFLOW' | 'STUDY_MATERIAL' | 'StudyMaterial' | string;
  targetId: number | string;
  externalTargetId?: number | string;
  createdAt: string;
  title?: string;
  summary?: string;
  note?: string;
}

export const bookmarkApi = {
  getBookmarks: async (type?: string): Promise<BookmarkItem[]> => {
    let normalizedType = type;
    if (type && type !== 'ALL') {
      const t = type.toUpperCase();
      if (t === 'MATERIAL' || t === 'STUDY_MATERIAL') normalizedType = 'StudyMaterial';
      else if (t === 'QUESTION') normalizedType = 'Question';
      else if (t === 'ARTICLE') normalizedType = 'Article';
      else if (t === 'WORKFLOW') normalizedType = 'Workflow';
      else if (t === 'ANSWER') normalizedType = 'Answer';
    }
    const url = normalizedType && normalizedType !== 'ALL' ? `/api/bookmarks/filter?type=${normalizedType}` : '/api/bookmarks';
    const res = await apiClient.get<any>(url);
    const data = (res.data as any)?.data || res.data || [];
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => ({
      id: b.bookmark_id ?? b.id ?? b.BookmarkId,
      bookmarkId: b.bookmark_id ?? b.id ?? b.BookmarkId,
      userId: b.engagement_account_id ?? b.user_id ?? b.userId,
      targetType: (b.target_type || b.targetType || '').toUpperCase(),
      targetId: b.external_target_id ?? b.target_id ?? b.targetId,
      externalTargetId: b.external_target_id ?? b.target_id ?? b.targetId,
      createdAt: b.created_at || b.createdAt || new Date().toISOString(),
      note: b.note || '',
    }));
  },

  addBookmark: async (targetType: string, targetId: number | string, note?: string): Promise<any> => {
    let normalizedType = targetType;
    const t = targetType.toUpperCase();
    if (t === 'MATERIAL' || t === 'STUDY_MATERIAL') normalizedType = 'StudyMaterial';
    else if (t === 'QUESTION') normalizedType = 'Question';
    else if (t === 'ARTICLE') normalizedType = 'Article';
    else if (t === 'WORKFLOW') normalizedType = 'Workflow';
    else if (t === 'ANSWER') normalizedType = 'Answer';

    const res = await apiClient.post('/api/bookmarks', {
      target_type: normalizedType,
      external_target_id: Number(targetId) || 1,
      note: note || '',
    });
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
    const res = await apiClient.get<any>('/api/communication/notifications', { params });
    const raw = res.data?.items || res.data?.data || res.data || [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((item: any) => ({
      id: item.notification_id ?? item.notificationId ?? item.id,
      recipientAccountId: item.recipient_account_id ?? item.recipientAccountId,
      recipientId: item.recipient_account_id ?? item.recipientAccountId ?? item.recipientId,
      type: item.notification_type ?? item.notificationType ?? item.type,
      title: item.title,
      message: item.body ?? item.message,
      actionUrl: item.action_url ?? item.actionUrl,
      isRead: item.is_read !== undefined ? item.is_read : (item.isRead || false),
      createdAt: item.created_at ?? item.createdAt,
    }));
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

const VALID_TICKET_CATEGORIES = new Set([
  'ACCOUNT',
  'ACADEMIC',
  'CONTENT',
  'TECHNICAL',
  'VERIFICATION',
  'REPORT',
  'FEEDBACK',
  'OTHER',
]);

function normalizeTicketCategory(raw: string): string {
  const upper = (raw || '').trim().toUpperCase();
  if (VALID_TICKET_CATEGORIES.has(upper)) return upper;
  if (upper.includes('MATERIAL') || upper.includes('CONTENT')) {
    return upper.includes('REPORT') ? 'REPORT' : 'CONTENT';
  }
  if (upper.includes('ACADEMIC') || upper.includes('CURRICULUM')) return 'ACADEMIC';
  if (upper.includes('ACCOUNT') || upper.includes('SSO') || upper.includes('AUTH')) return 'ACCOUNT';
  if (upper.includes('REVIEW') || upper.includes('FEEDBACK')) return 'FEEDBACK';
  if (upper.includes('TECH') || upper.includes('BUG')) return 'TECHNICAL';
  if (upper.includes('REPORT')) return 'REPORT';
  if (upper.includes('VERIF')) return 'VERIFICATION';
  return 'OTHER';
}

function normalizeStudentPriority(raw?: string): 'LOW' | 'NORMAL' | 'HIGH' {
  const upper = (raw || 'NORMAL').trim().toUpperCase();
  if (upper === 'LOW') return 'LOW';
  if (upper === 'HIGH' || upper === 'URGENT') return 'HIGH';
  return 'NORMAL';
}

function sanitizeTicketSubject(raw: string): string {
  const cleaned = (raw || '')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/&/g, 'va')
    .replace(/[^\p{L}\p{M}\p{N} .,\-_:()'"?!/]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const base = cleaned || 'Yeu cau ho tro sinh vien FHub';
  return base.length < 5 ? `${base} - FHub` : base.slice(0, 300);
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
    const cleanDesc = (payload.description || '').trim();
    const effectiveDescription =
      cleanDesc.length >= 20
        ? cleanDesc
        : `${cleanDesc} (Yêu cầu hỗ trợ từ sinh viên trên hệ thống FHub)`.trim();

    const res = await apiClient.post<ApiResponse<StudentTicketDetail>>('/api/student/support-tickets', {
      subject: sanitizeTicketSubject(payload.title),
      category: normalizeTicketCategory(payload.category),
      description: effectiveDescription,
      priority: normalizeStudentPriority(payload.priority),
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
    const raw = (status || '').trim().toUpperCase().replace(/\s+/g, '_');
    const normalizedStatus = raw === 'CLOSED' ? 'CLOSED' : 'OPEN';
    const res = await apiClient.patch<ApiResponse<any>>(`/api/student/support-tickets/${id}/status`, {
      status: normalizedStatus,
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
  feedTuning?: {
    preferMyMajor?: boolean;
    preferMyCampus?: boolean;
    showHotDiscussions?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showActivity?: boolean;
    profileVisibility?: string;
  };
  feedPreferenceJson?: string;
  [key: string]: any;
}

export const profileApi = {
  getProfile: async (userId: number | string): Promise<any> => {
    const res = await apiClient.get<any>(`/api/profiles/${userId}`);
    return res.data?.data ?? res.data;
  },

  getMyPreferences: async (): Promise<UserPreferencesDto> => {
    const res = await apiClient.get<any>('/api/profiles/me/preferences');
    return res.data?.data ?? res.data;
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
  target_type: 'ARTICLE' | 'QUESTION' | 'COMMENT' | 'WORKFLOW' | 'STUDY_MATERIAL' | 'ANSWER';
  target_id: number | string;
  vote_value: 1 | -1;
}

export interface VoteResponse {
  voteId: number;
  userId: number;
  targetType: string;
  targetId: number;
  voteValue: number;
  scoreDelta?: number;
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
  myVoteValue?: number | null;
}

export const voteApi = {
  vote: async (payload: VoteRequest): Promise<VoteResponse> => {
    const res = await apiClient.put<any>('/api/votes', {
      target_type: payload.target_type,
      target_id: Number(payload.target_id) || 1,
      vote_value: payload.vote_value,
    });
    const d = (res.data as any).data || res.data;
    return {
      voteId: d.vote_id ?? d.voteId,
      userId: d.user_id ?? d.userId,
      targetType: d.target_type ?? d.targetType,
      targetId: d.target_id ?? d.targetId,
      voteValue: d.vote_value ?? d.voteValue,
      scoreDelta: d.score_delta ?? d.scoreDelta ?? 0,
      revokedAt: d.revoked_at ?? d.revokedAt,
      createdAt: d.created_at ?? d.createdAt,
      updatedAt: d.updated_at ?? d.updatedAt,
    };
  },

  removeVote: async (targetType: string, targetId: number | string): Promise<void> => {
    await apiClient.delete(`/api/votes/${targetType}/${targetId}`);
  },

  getStats: async (targetType: string, targetId: number | string): Promise<VoteStats> => {
    const res = await apiClient.get<any>(`/api/votes/stats/${targetType}/${targetId}`);
    const data = (res.data as any)?.data || res.data || {};
    return {
      targetType: data.target_type || data.targetType || targetType,
      targetId: data.target_id || data.targetId || Number(targetId),
      upvotes: data.upvote_count ?? data.upvotes ?? 0,
      downvotes: data.downvote_count ?? data.downvotes ?? 0,
      score: data.net_score ?? data.score ?? 0,
      myVoteValue: data.my_vote_value ?? data.myVoteValue ?? null,
    };
  },

  getMyVotes: async (): Promise<VoteResponse[]> => {
    const res = await apiClient.get<any[]>('/api/interactions/me/votes');
    const items = (res.data as any)?.data || res.data || [];
    if (!Array.isArray(items)) return [];
    return items.map((d: any) => ({
      voteId: d.vote_id ?? d.voteId,
      userId: d.user_id ?? d.userId,
      targetType: d.target_type ?? d.targetType ?? d.engagement_target?.target_type,
      targetId: d.target_id ?? d.targetId ?? d.engagement_target?.external_target_id,
      voteValue: d.vote_value ?? d.voteValue,
      scoreDelta: d.score_delta ?? d.scoreDelta ?? 0,
      revokedAt: d.revoked_at ?? d.revokedAt,
      createdAt: d.created_at ?? d.createdAt,
      updatedAt: d.updated_at ?? d.updatedAt,
    }));
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
    const res = await apiClient.get('/api/reputation/rules');
    const data = (res.data as any).data || res.data;
    return Array.isArray(data) ? data.map(r => ({
      rule_id: r.rule_id,
      action_type: r.action_type || r.rule_code || r.event_type || '',
      karma_delta: r.karma_delta ?? r.points_delta ?? 0,
      daily_cap: r.daily_cap ?? r.daily_limit ?? 0,
      description: r.description || '',
      is_active: r.is_active ?? true,
    })) : [];
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

// ─── 8. Direct Messages & Communication API ────────────────────────────────────
export interface ConversationDto {
  conversationId: string | number;
  participantId: string | number;
  participantName: string;
  participantAvatar?: string;
  participantCode?: string;
  courseTag?: string;
  role?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  isBlocked?: boolean;
}

export interface DirectMessageDto {
  messageId: string | number;
  conversationId: string | number;
  senderId: string | number;
  senderName: string;
  content: string;
  createdAt: string;
  status?: string;
}

export const directMessageApi = {
  getConversations: async (): Promise<ConversationDto[]> => {
    try {
      const res = await apiClient.get<any>('/api/communication/conversations');
      const rawList = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return rawList.map((c: any) => {
        const pName = c.participantName ?? c.title ?? 'FHub Student';
        const codeMatch = String(pName).match(/\b(CE\d+|SE\d+)\b/i);
        return {
          conversationId: c.conversationId ?? c.conversation_id,
          participantId: c.participantId ?? c.other_participant?.user_id ?? c.other_participant?.communication_account_id ?? 1,
          participantName: pName,
          participantAvatar: c.participantAvatar ?? '',
          participantCode: c.participantCode ?? (codeMatch ? codeMatch[1].toUpperCase() : c.other_participant?.user_id ? `CE18012${c.other_participant.user_id}` : 'CE180121'),
          courseTag: c.courseTag ?? (c.conversation_type === 'GROUP' ? 'Group Project' : 'Direct Message'),
          role: c.role ?? 'Student',
          lastMessage: c.lastMessage ?? c.last_message_body ?? 'No messages yet',
          lastMessageAt: c.lastMessageAt ?? c.last_message_at ?? '',
          unreadCount: c.unreadCount ?? c.unread_count ?? 0,
          isBlocked: c.isBlocked ?? false,
        };
      });
    } catch {
      return [];
    }
  },

  getMessages: async (conversationId: string | number): Promise<DirectMessageDto[]> => {
    try {
      const res = await apiClient.get<any>(`/api/communication/conversations/${conversationId}/messages`);
      const rawList = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return rawList.map((m: any) => ({
        messageId: m.messageId ?? m.message_id,
        conversationId: m.conversationId ?? m.conversation_id,
        senderId: m.senderId ?? m.sender_account_id,
        senderName: m.senderName ?? (m.is_mine ? 'Bạn' : 'Thành viên FHub'),
        content: m.content ?? m.body ?? '',
        createdAt: m.createdAt ?? m.sent_at ?? '',
        status: m.status ?? 'read',
      }));
    } catch {
      return [];
    }
  },

  sendMessage: async (conversationId: string | number, content: string): Promise<DirectMessageDto> => {
    const res = await apiClient.post<any>(`/api/communication/conversations/${conversationId}/messages`, {
      content,
      body: content,
    });
    const d = res.data?.data || res.data;
    return {
      messageId: d?.message_id || d?.messageId || Date.now(),
      conversationId,
      senderId: d?.sender_account_id || d?.senderId || 1,
      senderName: 'Bạn',
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
  },

  createConversation: async (targetUserId: string | number, initialMessage?: string): Promise<any> => {
    try {
      const res = await apiClient.post<any>('/api/communication/conversations', {
        target_user_id: Number(targetUserId),
      });
      const conv = res.data?.data || res.data;
      if (initialMessage && conv?.conversation_id) {
        await directMessageApi.sendMessage(conv.conversation_id, initialMessage);
      }
      return conv;
    } catch (err) {
      console.warn('Failed to create conversation:', err);
      return null;
    }
  },

  deleteMessage: async (conversationId: string | number, messageId: string | number): Promise<void> => {
    try {
      await apiClient.delete(`/api/communication/conversations/${conversationId}/messages/${messageId}`);
    } catch {
      try {
        await apiClient.delete(`/api/communication/messages/${messageId}`);
      } catch {}
    }
  },

  getBlockedUsers: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get<any>('/api/communication/blocks');
      const data = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return data;
    } catch {
      return [];
    }
  },

  blockUser: async (targetUserId: string | number, reason?: string): Promise<void> => {
    try {
      await apiClient.post('/api/communication/blocks', {
        target_user_id: Number(targetUserId),
        reason: reason || 'Blocked by user',
      });
    } catch (err) {
      console.warn('Failed to block user:', err);
    }
  },

  unblockUser: async (blockId: string | number): Promise<void> => {
    try {
      await apiClient.delete(`/api/communication/blocks/${blockId}`);
    } catch (err) {
      console.warn('Failed to unblock user:', err);
    }
  },
};

