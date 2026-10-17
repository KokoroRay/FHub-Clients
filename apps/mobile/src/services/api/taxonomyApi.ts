import { apiClient } from './client';
import { CourseNode, Campus, Major } from '../../types';
import { mockCourses, mockCampuses, mockMajors } from '../mockData';

export const taxonomyApi = {
  getCourses: async (search?: string, majorCode?: string): Promise<CourseNode[]> => {
    try {
      const res = await apiClient.get<any>('/api/courses', {
        params: { search, majorCode, pageSize: 50 },
      });
      const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((c: any) => ({
          id: String(c.id || c.courseNodeId),
          code: c.code,
          title: c.name || c.title,
          description: c.description || '',
          majorCode: c.majorCode || 'SE',
          semester: c.semester || 1,
          credits: c.credits || 3,
          followerCount: c.followerCount || 100,
          discussionCount: c.discussionCount || 10,
          materialCount: c.materialCount || 5,
          workflowCount: c.workflowCount || 2,
          reviewCount: c.reviewCount || 8,
          averageRating: c.averageRating || 4.5,
          isFollowed: false,
        }));
      }
      return mockCourses;
    } catch (e) {
      console.warn('[taxonomyApi.getCourses] Fallback to mock:', e);
      return mockCourses;
    }
  },

  getCourseByCode: async (code: string): Promise<CourseNode> => {
    try {
      const res = await apiClient.get<any>(`/api/courses/${code}`);
      const data = res.data?.data || res.data;
      if (data) {
        return {
          id: String(data.id || data.courseNodeId),
          code: data.code,
          title: data.name || data.title,
          description: data.description || '',
          majorCode: data.majorCode || 'SE',
          semester: data.semester || 1,
          credits: data.credits || 3,
          followerCount: data.followerCount || 150,
          discussionCount: data.discussionCount || 12,
          materialCount: data.materialCount || 6,
          workflowCount: data.workflowCount || 3,
          reviewCount: data.reviewCount || 10,
          averageRating: data.averageRating || 4.5,
          isFollowed: false,
        };
      }
    } catch (e) {
      console.warn('[taxonomyApi.getCourseByCode] Fallback to mock:', e);
    }
    return mockCourses.find((c) => c.code.toLowerCase() === code.toLowerCase()) || mockCourses[0];
  },

  getCampuses: async (): Promise<Campus[]> => {
    try {
      const res = await apiClient.get<any>('/api/campuses');
      const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((c: any) => ({
          id: String(c.id || c.campusId),
          code: c.code,
          name: c.name,
          location: c.location || '',
          isActive: true,
          studentCount: c.studentCount || 10000,
        }));
      }
      return mockCampuses;
    } catch (e) {
      console.warn('[taxonomyApi.getCampuses] Fallback to mock:', e);
      return mockCampuses;
    }
  },

  getMajors: async (): Promise<Major[]> => {
    try {
      const res = await apiClient.get<any>('/api/majors');
      const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((m: any) => ({
          id: String(m.id || m.majorId),
          code: m.code,
          name: m.name,
          description: m.description || '',
          totalCourses: m.totalCourses || 40,
        }));
      }
      return mockMajors;
    } catch (e) {
      console.warn('[taxonomyApi.getMajors] Fallback to mock:', e);
      return mockMajors;
    }
  },
};
