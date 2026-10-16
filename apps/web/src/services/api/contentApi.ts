import { apiClient } from './client';

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  code?: string;
}

export interface PagedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

// ─── 1. Articles API ──────────────────────────────────────────────────────────
export interface ArticleRequest {
  title: string;
  content: string;
  summary?: string;
  coverImageUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  semanticTagIds?: number[];
}

export interface ArticleListItem {
  articleId: number;
  authorUserId?: number;
  authorStaffId?: number;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  version: number;
  semanticTagIds: number[];
  articleType: string;
}

export interface ArticleDetailDto {
  articleId: number;
  authorUserId?: number;
  authorStaffId?: number;
  title: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  status: string;
  areCommentsLocked: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  semanticTagIds: number[];
  articleType: string;
}

export const articleApi = {
  getArticles: async (params?: {
    search?: string;
    authorUserId?: number;
    semanticTagId?: number;
    mine?: boolean;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedList<ArticleListItem>> => {
    const res = await apiClient.get<ApiResponse<PagedList<ArticleListItem>>>('/api/content/articles', { params });
    return res.data.data;
  },

  getArticleById: async (id: number | string): Promise<ArticleDetailDto> => {
    const res = await apiClient.get<ApiResponse<ArticleDetailDto>>(`/api/content/articles/${id}`);
    return res.data.data;
  },

  createArticle: async (payload: ArticleRequest): Promise<ArticleDetailDto> => {
    const res = await apiClient.post<ApiResponse<ArticleDetailDto>>('/api/content/articles', payload);
    return res.data.data;
  },

  updateArticle: async (id: number | string, payload: ArticleRequest, version?: number): Promise<ArticleDetailDto> => {
    const headers: Record<string, string> = {};
    if (version !== undefined) {
      headers['If-Match'] = `"${version}"`;
    }
    const res = await apiClient.put<ApiResponse<ArticleDetailDto>>(`/api/content/articles/${id}`, payload, { headers });
    return res.data.data;
  },

  deleteArticle: async (id: number | string, version?: number): Promise<void> => {
    const headers: Record<string, string> = {};
    if (version !== undefined) {
      headers['If-Match'] = `"${version}"`;
    }
    await apiClient.delete(`/api/content/articles/${id}`, { headers });
  },
};

// ─── 2. Workflows API ─────────────────────────────────────────────────────────
export interface WorkflowStepItem {
  stepNumber: number;
  title: string;
  content: string;
  mediaUrl?: string;
}

export interface CreateWorkflowPayload {
  title: string;
  summary?: string;
  courseId?: number;
  steps: WorkflowStepItem[];
  semanticTagIds?: number[];
}

export interface UpdateWorkflowPayload {
  title: string;
  summary?: string;
  courseId?: number;
  status: string;
  steps: WorkflowStepItem[];
  semanticTagIds?: number[];
}

export interface WorkflowListItem {
  workflowId: number;
  authorUserId: number;
  courseId?: number;
  title: string;
  summary?: string;
  isPinned: boolean;
  areCommentsLocked: boolean;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  stepCount: number;
  semanticTagIds: number[];
}

export interface WorkflowDetail {
  workflowId: number;
  authorUserId: number;
  courseId?: number;
  title: string;
  summary?: string;
  isPinned: boolean;
  areCommentsLocked: boolean;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    content: string;
    mediaUrl?: string;
  }>;
  semanticTagIds: number[];
}

export const workflowApi = {
  getWorkflows: async (params?: {
    courseId?: number;
    tagId?: number;
    authorId?: number;
    status?: string;
    search?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedList<WorkflowListItem>> => {
    const res = await apiClient.get<ApiResponse<PagedList<WorkflowListItem>>>('/api/content/workflows', { params });
    return res.data.data;
  },

  getWorkflowById: async (id: number | string): Promise<WorkflowDetail> => {
    const res = await apiClient.get<ApiResponse<WorkflowDetail>>(`/api/content/workflows/${id}`);
    return res.data.data;
  },

  createWorkflow: async (payload: CreateWorkflowPayload): Promise<WorkflowDetail> => {
    const res = await apiClient.post<ApiResponse<WorkflowDetail>>('/api/content/workflows', payload);
    return res.data.data;
  },

  updateWorkflow: async (id: number | string, payload: UpdateWorkflowPayload): Promise<WorkflowDetail> => {
    const res = await apiClient.put<ApiResponse<WorkflowDetail>>(`/api/content/workflows/${id}`, payload);
    return res.data.data;
  },

  deleteWorkflow: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/workflows/${id}`);
  },
};

// ─── 3. Study Materials API ───────────────────────────────────────────────────
export interface StudyMaterialItem {
  studyMaterialId: number;
  uploaderUserId: number;
  courseId: number;
  title: string;
  description?: string;
  materialType: 'FILE' | 'LINK';
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  externalUrl?: string;
  isPinned: boolean;
  status: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  semanticTagIds: number[];
}

export const studyMaterialApi = {
  getMaterials: async (params?: {
    courseId?: number;
    search?: string;
    materialType?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedList<StudyMaterialItem>> => {
    const res = await apiClient.get<ApiResponse<PagedList<StudyMaterialItem>>>('/api/content/study-materials', { params });
    return res.data.data;
  },

  getMaterialById: async (id: number | string): Promise<StudyMaterialItem> => {
    const res = await apiClient.get<ApiResponse<StudyMaterialItem>>(`/api/content/study-materials/${id}`);
    return res.data.data;
  },

  uploadFile: async (formData: FormData): Promise<StudyMaterialItem> => {
    const res = await apiClient.post<ApiResponse<StudyMaterialItem>>('/api/content/study-materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  addExternalLink: async (payload: {
    courseId: number;
    title: string;
    externalUrl: string;
    description?: string;
    semanticTagIds?: number[];
  }): Promise<StudyMaterialItem> => {
    const res = await apiClient.post<ApiResponse<StudyMaterialItem>>('/api/content/study-materials/link', payload);
    return res.data.data;
  },

  updateMetadata: async (id: number | string, payload: {
    title: string;
    description?: string;
    externalUrl?: string;
    semanticTagIds?: number[];
  }): Promise<StudyMaterialItem> => {
    const res = await apiClient.put<ApiResponse<StudyMaterialItem>>(`/api/content/study-materials/${id}`, payload);
    return res.data.data;
  },

  deleteMaterial: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/study-materials/${id}`);
  },

  getDownloadUrl: (id: number | string): string => {
    return `/api/content/study-materials/${id}/download`;
  },
};

// ─── 4. News Management API (School Representative) ──────────────────────────
export const newsApi = {
  getNews: async (params?: {
    search?: string;
    semanticTagId?: number;
    mine?: boolean;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedList<ArticleListItem>> => {
    const res = await apiClient.get<ApiResponse<PagedList<ArticleListItem>>>('/api/content/news', { params });
    return res.data.data;
  },

  getNewsById: async (id: number | string): Promise<ArticleDetailDto> => {
    const res = await apiClient.get<ApiResponse<ArticleDetailDto>>(`/api/content/news/${id}`);
    return res.data.data;
  },

  createNews: async (payload: ArticleRequest): Promise<ArticleDetailDto> => {
    const res = await apiClient.post<ApiResponse<ArticleDetailDto>>('/api/content/news', payload);
    return res.data.data;
  },

  updateNews: async (id: number | string, payload: ArticleRequest, version?: number): Promise<ArticleDetailDto> => {
    const headers: Record<string, string> = {};
    if (version !== undefined) {
      headers['If-Match'] = `"${version}"`;
    }
    const res = await apiClient.put<ApiResponse<ArticleDetailDto>>(`/api/content/news/${id}`, payload, { headers });
    return res.data.data;
  },

  deleteNews: async (id: number | string, version?: number): Promise<void> => {
    const headers: Record<string, string> = {};
    if (version !== undefined) {
      headers['If-Match'] = `"${version}"`;
    }
    await apiClient.delete(`/api/content/news/${id}`, { headers });
  },
};
