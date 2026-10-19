import { apiClient } from './client';
import type { ApiResponse } from './adminApi';


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

// ─── 5. Question Post & Answers API (Student, Alumni, Moderator) ──────────────
export interface CreateQuestionRequest {
  title: string;
  body: string;
  courseId?: number;
  isAnonymous?: boolean;
  semanticTagIds?: number[];
}

export interface UpdateQuestionRequest {
  title?: string;
  body?: string;
  courseId?: number;
  isAnonymous?: boolean;
  semanticTagIds?: number[];
}

export interface QuestionListItem {
  questionId: number;
  authorUserId?: number;
  authorDisplayName?: string;
  courseId?: number;
  title: string;
  body: string;
  isAnonymous: boolean;
  isPinned: boolean;
  areCommentsLocked: boolean;
  status: string;
  viewCount: number;
  answerCount: number;
  commentCount: number;
  hasBestAnswer: boolean;
  bestAnswerId?: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  semanticTagIds: number[];
}

export interface AnswerDto {
  answerId: number;
  questionId: number;
  authorUserId?: number;
  authorDisplayName?: string;
  body: string;
  isAnonymous: boolean;
  isModeratorVerified: boolean;
  verifiedByStaffId?: number;
  verifiedAt?: string;
  status: string;
  isBestAnswer: boolean;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  comments?: CommentDto[];
}

export interface CommentDto {
  commentId: number;
  questionId?: number;
  answerId?: number;
  authorUserId?: number;
  authorDisplayName?: string;
  parentCommentId?: number;
  body: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentDto[];
}

export interface QuestionDetailDto extends QuestionListItem {
  bestAnswer?: AnswerDto;
}

export const questionApi = {
  getQuestions: async (params?: {
    courseId?: number;
    status?: string;
    semanticTagId?: number;
    mine?: boolean;
    search?: string;
    sortBy?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedList<QuestionListItem>> => {
    const res = await apiClient.get<ApiResponse<PagedList<QuestionListItem>>>('/api/content/questions', { params });
    return res.data.data;
  },

  getQuestionById: async (id: number | string): Promise<QuestionDetailDto> => {
    const res = await apiClient.get<ApiResponse<QuestionDetailDto>>(`/api/content/questions/${id}`);
    return res.data.data;
  },

  createQuestion: async (payload: CreateQuestionRequest): Promise<QuestionDetailDto> => {
    const res = await apiClient.post<ApiResponse<QuestionDetailDto>>('/api/content/questions', payload);
    return res.data.data;
  },

  updateQuestion: async (id: number | string, payload: UpdateQuestionRequest): Promise<QuestionDetailDto> => {
    const res = await apiClient.put<ApiResponse<QuestionDetailDto>>(`/api/content/questions/${id}`, payload);
    return res.data.data;
  },

  deleteQuestion: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/questions/${id}`);
  },

  // Answers
  getAnswers: async (questionId: number | string): Promise<AnswerDto[]> => {
    const res = await apiClient.get<ApiResponse<AnswerDto[]>>(`/api/content/questions/${questionId}/answers`);
    return res.data.data;
  },

  createAnswer: async (questionId: number | string, payload: { body: string; isAnonymous?: boolean }): Promise<AnswerDto> => {
    const res = await apiClient.post<ApiResponse<AnswerDto>>(`/api/content/questions/${questionId}/answers`, payload);
    return res.data.data;
  },

  updateAnswer: async (questionId: number | string, answerId: number | string, payload: { body: string; isAnonymous?: boolean }): Promise<AnswerDto> => {
    const res = await apiClient.put<ApiResponse<AnswerDto>>(`/api/content/questions/${questionId}/answers/${answerId}`, payload);
    return res.data.data;
  },

  deleteAnswer: async (questionId: number | string, answerId: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/questions/${questionId}/answers/${answerId}`);
  },

  markBestAnswer: async (questionId: number | string, answerId: number | string): Promise<QuestionDetailDto> => {
    const res = await apiClient.put<ApiResponse<QuestionDetailDto>>(`/api/content/questions/${questionId}/best-answer/${answerId}`);
    return res.data.data;
  },

  unmarkBestAnswer: async (questionId: number | string): Promise<QuestionDetailDto> => {
    const res = await apiClient.delete<ApiResponse<QuestionDetailDto>>(`/api/content/questions/${questionId}/best-answer`);
    return res.data.data;
  },

  // Comments
  getQuestionComments: async (questionId: number | string): Promise<CommentDto[]> => {
    const res = await apiClient.get<ApiResponse<CommentDto[]>>(`/api/content/questions/${questionId}/comments`);
    return res.data.data;
  },

  createQuestionComment: async (questionId: number | string, payload: { body: string; isAnonymous?: boolean }): Promise<CommentDto> => {
    const res = await apiClient.post<ApiResponse<CommentDto>>(`/api/content/questions/${questionId}/comments`, payload);
    return res.data.data;
  },

  getAnswerComments: async (answerId: number | string): Promise<CommentDto[]> => {
    const res = await apiClient.get<ApiResponse<CommentDto[]>>(`/api/content/answers/${answerId}/comments`);
    return res.data.data;
  },

  createAnswerComment: async (answerId: number | string, payload: { body: string; isAnonymous?: boolean }): Promise<CommentDto> => {
    const res = await apiClient.post<ApiResponse<CommentDto>>(`/api/content/answers/${answerId}/comments`, payload);
    return res.data.data;
  },

  updateComment: async (commentId: number | string, payload: { body: string; isAnonymous?: boolean }): Promise<CommentDto> => {
    const res = await apiClient.put<ApiResponse<CommentDto>>(`/api/content/comments/${commentId}`, payload);
    return res.data.data;
  },

  deleteComment: async (commentId: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/comments/${commentId}`);
  },
};

// ─── 6. Course Evaluations API (Student) ──────────────────────────────────────
export interface CreateCourseReviewRequest {
  courseId: number;
  semesterCode: string;
  academicYear: number;
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
  workloadHoursPerWeek?: number;
  reviewContent?: string;
  survivalTips?: string;
  isAnonymous?: boolean;
  semanticTagIds?: number[];
}

export interface UpdateCourseReviewRequest {
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
  workloadHoursPerWeek?: number;
  reviewContent?: string;
  survivalTips?: string;
  isAnonymous?: boolean;
  semanticTagIds?: number[];
}

export interface CourseReviewListItem {
  courseReviewId: number;
  authorUserId?: number;
  courseId: number;
  semesterCode: string;
  academicYear: number;
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
  workloadHoursPerWeek?: number;
  reviewContent?: string;
  survivalTips?: string;
  isAnonymous: boolean;
  isPinned: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  semanticTagIds: number[];
}

export const courseReviewApi = {
  getReviews: async (params?: {
    courseId?: number;
    semesterCode?: string;
    academicYear?: number;
    minRating?: number;
    maxRating?: number;
    semanticTagId?: number;
    mine?: boolean;
    search?: string;
    sortBy?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedList<CourseReviewListItem>> => {
    const res = await apiClient.get<ApiResponse<PagedList<CourseReviewListItem>>>('/api/content/course-reviews', { params });
    return res.data.data;
  },

  getReviewById: async (id: number | string): Promise<CourseReviewListItem> => {
    const res = await apiClient.get<ApiResponse<CourseReviewListItem>>(`/api/content/course-reviews/${id}`);
    return res.data.data;
  },

  createReview: async (payload: CreateCourseReviewRequest): Promise<CourseReviewListItem> => {
    const res = await apiClient.post<ApiResponse<CourseReviewListItem>>('/api/content/course-reviews', payload);
    return res.data.data;
  },

  updateReview: async (id: number | string, payload: UpdateCourseReviewRequest): Promise<CourseReviewListItem> => {
    const res = await apiClient.put<ApiResponse<CourseReviewListItem>>(`/api/content/course-reviews/${id}`, payload);
    return res.data.data;
  },

  deleteReview: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/course-reviews/${id}`);
  },
};

// ─── 7. Series Management API (Student) ───────────────────────────────────────
export interface CreateSeriesRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
}

export interface UpdateSeriesRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  status: string;
}

export interface AddSeriesItemRequest {
  contentType: 'ARTICLE' | 'WORKFLOW';
  contentId: number;
}

export interface SeriesItemDto {
  seriesItemId: number;
  seriesId: number;
  contentType: string;
  contentId: number;
  position: number;
  addedAt: string;
}

export interface SeriesDetailDto {
  seriesId: number;
  authorUserId: number;
  title: string;
  description?: string;
  coverImageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: SeriesItemDto[];
}

export interface SeriesListItem {
  seriesId: number;
  authorUserId: number;
  title: string;
  description?: string;
  coverImageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export const seriesApi = {
  getSeriesList: async (params?: {
    mine?: boolean;
    search?: string;
    sortBy?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PagedList<SeriesListItem>> => {
    const res = await apiClient.get<ApiResponse<PagedList<SeriesListItem>>>('/api/content/series', { params });
    return res.data.data;
  },

  getSeriesById: async (id: number | string): Promise<SeriesDetailDto> => {
    const res = await apiClient.get<ApiResponse<SeriesDetailDto>>(`/api/content/series/${id}`);
    return res.data.data;
  },

  createSeries: async (payload: CreateSeriesRequest): Promise<SeriesDetailDto> => {
    const res = await apiClient.post<ApiResponse<SeriesDetailDto>>('/api/content/series', payload);
    return res.data.data;
  },

  updateSeries: async (id: number | string, payload: UpdateSeriesRequest): Promise<SeriesDetailDto> => {
    const res = await apiClient.put<ApiResponse<SeriesDetailDto>>(`/api/content/series/${id}`, payload);
    return res.data.data;
  },

  addItem: async (seriesId: number | string, payload: AddSeriesItemRequest): Promise<SeriesDetailDto> => {
    const res = await apiClient.post<ApiResponse<SeriesDetailDto>>(`/api/content/series/${seriesId}/items`, payload);
    return res.data.data;
  },

  removeItem: async (seriesId: number | string, itemId: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/series/${seriesId}/items/${itemId}`);
  },

  reorderItems: async (seriesId: number | string, items: Array<{ seriesItemId: number; newPosition: number }>): Promise<SeriesDetailDto> => {
    const res = await apiClient.put<ApiResponse<SeriesDetailDto>>(`/api/content/series/${seriesId}/items/reorder`, { items });
    return res.data.data;
  },

  deleteSeries: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/content/series/${id}`);
  },
};

// ─── 8. Alumni Knowledge API (Alumni Role) ────────────────────────────────────
export const alumniApi = {
  createIndustryWorkflow: async (payload: any) => {
    const res = await apiClient.post<ApiResponse<any>>('/api/content/alumni/workflows', payload);
    return res.data.data;
  },

  listIndustryWorkflows: async (params?: any) => {
    const res = await apiClient.get<ApiResponse<any>>('/api/content/alumni/workflows', { params });
    return res.data.data;
  },

  createCareerArticle: async (payload: ArticleRequest) => {
    const res = await apiClient.post<ApiResponse<ArticleDetailDto>>('/api/content/alumni/articles', payload);
    return res.data.data;
  },

  listCareerArticles: async (params?: any) => {
    const res = await apiClient.get<ApiResponse<PagedList<ArticleListItem>>>('/api/content/alumni/articles', { params });
    return res.data.data;
  },

  createExpertAnswer: async (questionId: number | string, payload: { body: string; industryContext?: string }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/api/content/alumni/questions/${questionId}/answers`, payload);
    return res.data.data;
  },
};

