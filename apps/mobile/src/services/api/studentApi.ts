import { apiClient } from './client';
import { SupportTicketItem, NotificationItem, BookmarkItem, User } from '../../types';
import { mockSupportTickets, mockNotifications, mockBookmarks, mockCurrentUser } from '../mockData';

export const studentApi = {
  // Support Tickets API
  getMyTickets: async (): Promise<SupportTicketItem[]> => {
    try {
      const res = await apiClient.get<any>('/api/student/support-tickets');
      const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((t: any) => ({
          id: String(t.ticketId || t.id),
          ticketId: `TCK-${t.ticketId || t.id}`,
          title: t.title || t.subject || 'Vé hỗ trợ sinh viên',
          category: t.category || 'General',
          priority: t.priority || 'NORMAL',
          status: t.status || 'PENDING',
          createdAt: t.createdAt || 'Gần đây',
          updatedAt: t.updatedAt || 'Gần đây',
          messagesCount: t.messagesCount || 1,
          description: t.description || '',
        }));
      }
      return mockSupportTickets;
    } catch (e) {
      console.warn('[studentApi.getMyTickets] Fallback to mock:', e);
      return mockSupportTickets;
    }
  },

  createTicket: async (payload: { title: string; category: string; description: string; priority?: string }): Promise<any> => {
    try {
      const res = await apiClient.post<any>('/api/student/support-tickets', {
        subject: payload.title,
        category: payload.category,
        description: payload.description,
        priority: payload.priority || 'NORMAL',
      });
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('[studentApi.createTicket] Fallback local response:', e);
      return { success: true };
    }
  },

  // Profile API
  getProfile: async (userId: string): Promise<User> => {
    try {
      const res = await apiClient.get<any>(`/api/profiles/${userId}`);
      const data = res.data?.data || res.data;
      if (data) {
        return {
          ...mockCurrentUser,
          id: String(data.userId || userId),
          fullName: data.fullName || mockCurrentUser.fullName,
          email: data.email || mockCurrentUser.email,
          bio: data.bio || mockCurrentUser.bio,
          avatarUrl: data.avatarUrl || mockCurrentUser.avatarUrl,
          studentId: data.studentCode || mockCurrentUser.studentId,
          campus: data.campusCode || mockCurrentUser.campus,
          karma: data.karma || mockCurrentUser.karma,
        };
      }
      return mockCurrentUser;
    } catch (e) {
      console.warn('[studentApi.getProfile] Fallback to mock:', e);
      return mockCurrentUser;
    }
  },

  // Notifications API
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const res = await apiClient.get<any>('/api/communication/notifications');
      const items = res.data?.data || res.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((n: any) => ({
          id: String(n.id),
          type: n.type || 'SYSTEM',
          title: n.title,
          message: n.message,
          isRead: !!n.isRead,
          createdAt: n.createdAt || 'Gần đây',
        }));
      }
      return mockNotifications;
    } catch (e) {
      console.warn('[studentApi.getNotifications] Fallback to mock:', e);
      return mockNotifications;
    }
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/api/communication/notifications/${id}/read`);
    } catch (e) {
      console.warn('[studentApi.markNotificationAsRead] error:', e);
    }
  },

  // Bookmarks API
  getBookmarks: async (): Promise<BookmarkItem[]> => {
    try {
      const res = await apiClient.get<any>('/api/bookmarks');
      const items = res.data?.data || res.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((b: any) => ({
          id: String(b.id),
          userId: b.userId,
          targetType: b.targetType,
          targetId: String(b.targetId),
          title: b.title || 'Mục đã đánh dấu',
          summary: b.summary,
          createdAt: b.createdAt || 'Gần đây',
        }));
      }
      return mockBookmarks;
    } catch (e) {
      console.warn('[studentApi.getBookmarks] Fallback to mock:', e);
      return mockBookmarks;
    }
  },
};
