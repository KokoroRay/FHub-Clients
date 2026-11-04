import { apiClient } from './client';

export type SemanticEntityType = 'COURSE' | 'USER' | 'ARTICLE' | 'QUESTION' | 'STUDY_MATERIAL';

export interface SemanticSearchRequest {
  query: string;
  entity_types?: SemanticEntityType[];
  campus_id?: number;
  major_id?: number;
  course_id?: number;
  limit?: number;
  score_threshold?: number;
}

export interface UserSearchRequest {
  query: string;
  campus_id?: number;
  major_id?: number;
  limit?: number;
  score_threshold?: number;
}

export interface CourseSearchRequest {
  query: string;
  campus_id?: number;
  major_id?: number;
  limit?: number;
  score_threshold?: number;
}

export interface SemanticSearchResultItem {
  entity_type: SemanticEntityType | string;
  entity_id: number;
  title?: string;
  content_snippet?: string;
  score: number;
  point_id?: string;
  // Specific properties
  course_code?: string;
  course_name?: string;
  full_name?: string;
  display_name?: string;
  student_code?: string;
  avatar_url?: string;
  summary?: string;
  course_id?: number;
  author_user_id?: number;
  material_type?: string;
  file_name?: string;
  file_url?: string;
  campus_id?: number;
  major_id?: number;
  status?: string;
  created_at?: string;
}

export interface SemanticSearchResponse {
  query: string;
  total: number;
  results: SemanticSearchResultItem[];
}

export const searchApi = {
  /**
   * Unified global AI semantic search across Courses, Users, Articles, Questions, and Study Materials
   */
  search: async (req: SemanticSearchRequest): Promise<SemanticSearchResponse> => {
    const res = await apiClient.post<SemanticSearchResponse>('/api/ai/search', {
      query: req.query,
      entity_types: req.entity_types && req.entity_types.length > 0 ? req.entity_types : undefined,
      campus_id: req.campus_id,
      major_id: req.major_id,
      course_id: req.course_id,
      limit: req.limit ?? 15,
      score_threshold: req.score_threshold ?? 0.2,
    });
    return res.data;
  },

  /**
   * Specialized semantic & keyword search for Users / Students
   */
  searchUsers: async (req: UserSearchRequest): Promise<SemanticSearchResponse> => {
    const res = await apiClient.post<SemanticSearchResponse>('/api/ai/search/users', {
      query: req.query,
      campus_id: req.campus_id,
      major_id: req.major_id,
      limit: req.limit ?? 10,
      score_threshold: req.score_threshold ?? 0.2,
    });
    return res.data;
  },

  /**
   * Specialized semantic search for Courses
   */
  searchCourses: async (req: CourseSearchRequest): Promise<SemanticSearchResponse> => {
    const res = await apiClient.post<SemanticSearchResponse>('/api/ai/search/courses', {
      query: req.query,
      campus_id: req.campus_id,
      major_id: req.major_id,
      limit: req.limit ?? 10,
      score_threshold: req.score_threshold ?? 0.2,
    });
    return res.data;
  },

  /**
   * Healthcheck for AI Semantic service
   */
  checkHealth: async (): Promise<any> => {
    const res = await apiClient.get('/api/ai/health');
    return res.data;
  },
};
