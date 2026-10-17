import { apiClient } from './client';
import { Article, SharedWorkflow, StudyMaterial } from '../../types';
import { mockArticles, mockWorkflows, mockMaterials } from '../mockData';

export const contentApi = {
  // Articles API
  getArticles: async (search?: string): Promise<Article[]> => {
    try {
      const res = await apiClient.get<any>('/api/content/articles', {
        params: { search, pageSize: 20 },
      });
      const items = res.data?.data?.items || res.data?.items || [];
      if (items.length > 0) {
        return items.map((item: any) => ({
          id: String(item.articleId),
          title: item.title,
          summary: item.summary || item.title,
          content: item.content || '',
          coverImage: item.coverImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
          category: 'Backend Development',
          tags: ['dotnet', 'csharp', 'architecture'],
          author: {
            id: String(item.authorUserId || 1),
            fullName: 'Sinh viên FHub',
            role: 'Student',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          },
          likesCount: 24,
          bookmarksCount: 6,
          viewsCount: 240,
          readTimeMinutes: 5,
          createdAt: item.createdAt || 'Hôm nay',
        }));
      }
      return mockArticles;
    } catch (e) {
      console.warn('[contentApi.getArticles] Fallback to mock:', e);
      return mockArticles;
    }
  },

  getArticleById: async (id: string): Promise<Article> => {
    try {
      const res = await apiClient.get<any>(`/api/content/articles/${id}`);
      const data = res.data?.data || res.data;
      if (data) {
        return {
          id: String(data.articleId),
          title: data.title,
          summary: data.summary || data.title,
          content: data.content || '',
          coverImage: data.coverImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
          category: 'Backend Development',
          tags: ['dotnet', 'csharp'],
          author: {
            id: String(data.authorUserId || 1),
            fullName: 'Sinh viên FHub',
            role: 'Student',
          },
          likesCount: 24,
          bookmarksCount: 6,
          viewsCount: 240,
          readTimeMinutes: 5,
          createdAt: data.createdAt || 'Hôm nay',
        };
      }
    } catch (e) {
      console.warn('[contentApi.getArticleById] Fallback to mock:', e);
    }
    return mockArticles.find((a) => a.id === id) || mockArticles[0];
  },

  // Workflows API
  getWorkflows: async (search?: string): Promise<SharedWorkflow[]> => {
    try {
      const res = await apiClient.get<any>('/api/content/workflows', {
        params: { search, pageSize: 20 },
      });
      const items = res.data?.data?.items || res.data?.items || [];
      if (items.length > 0) {
        return items.map((item: any) => ({
          id: String(item.workflowId),
          title: item.title,
          description: item.summary || item.title,
          courseCode: 'PRN211',
          technology: '.NET / C#',
          steps: item.steps || [
            { stepNumber: 1, title: 'Bước 1: Khởi tạo', instruction: 'Thực hiện cấu hình môi trường' }
          ],
          author: {
            id: String(item.authorUserId || 1),
            fullName: 'Sinh viên FHub',
            role: 'Student',
            campus: 'FU-HL',
          },
          viewsCount: 35,
          usageCount: 12,
          tags: ['dotnet', 'workflow'],
          createdAt: item.createdAt || 'Gần đây',
        }));
      }
      return mockWorkflows;
    } catch (e) {
      console.warn('[contentApi.getWorkflows] Fallback to mock:', e);
      return mockWorkflows;
    }
  },

  getWorkflowById: async (id: string): Promise<SharedWorkflow> => {
    try {
      const res = await apiClient.get<any>(`/api/content/workflows/${id}`);
      const data = res.data?.data || res.data;
      if (data) {
        return {
          id: String(data.workflowId),
          title: data.title,
          description: data.summary || data.title,
          courseCode: 'PRN211',
          technology: '.NET / C#',
          steps: data.steps || [],
          author: {
            id: String(data.authorUserId || 1),
            fullName: 'Sinh viên FHub',
            role: 'Student',
            campus: 'FU-HL',
          },
          viewsCount: 45,
          usageCount: 15,
          tags: ['workflow'],
          createdAt: data.createdAt || 'Gần đây',
        };
      }
    } catch (e) {
      console.warn('[contentApi.getWorkflowById] Fallback to mock:', e);
    }
    return mockWorkflows.find((w) => w.id === id) || mockWorkflows[0];
  },

  // Study Materials API
  getMaterials: async (courseId?: string, search?: string): Promise<StudyMaterial[]> => {
    try {
      const res = await apiClient.get<any>('/api/content/study-materials', {
        params: { courseId, search, pageSize: 20 },
      });
      const items = res.data?.data?.items || res.data?.items || [];
      if (items.length > 0) {
        return items.map((item: any) => ({
          id: String(item.studyMaterialId),
          title: item.title,
          description: item.description || '',
          courseCode: 'PRN211',
          fileType: item.materialType === 'LINK' ? 'LINK' : 'PDF',
          fileSizeMb: item.fileSizeBytes ? Number((item.fileSizeBytes / (1024 * 1024)).toFixed(1)) : 2.5,
          downloadsCount: item.downloadCount || 0,
          author: {
            id: String(item.uploaderUserId || 1),
            fullName: 'Sinh viên FHub',
          },
          semesterUploaded: 'Spring 2025',
          createdAt: item.createdAt || 'Gần đây',
        }));
      }
      return mockMaterials;
    } catch (e) {
      console.warn('[contentApi.getMaterials] Fallback to mock:', e);
      return mockMaterials;
    }
  },
};
