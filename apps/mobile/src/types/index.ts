export type UserRole =
  | 'Admin'
  | 'Staff'
  | 'Student'
  | 'Community Moderator'
  | 'School Representative'
  | 'Alumni'
  | 'Guest';

export type CampusCode = 'HL' | 'HCM' | 'DN' | 'CT' | 'QN';

export interface Campus {
  id: string;
  code: CampusCode;
  name: string;
  location: string;
  isActive: boolean;
  studentCount: number;
}

export interface Major {
  id: string;
  code: string;
  name: string;
  description: string;
  campusId?: string;
  totalCourses: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  campus: CampusCode;
  major?: string;
  studentId?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  karma: number;
  status: 'ACTIVE' | 'MUTED' | 'SUSPENDED' | 'LOCKED' | 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'DELETED';
  verifiedAt?: string;
  badges: BadgeItem[];
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  category: 'CONTRIBUTOR' | 'EXPERT' | 'MODERATOR' | 'ALUMNI' | 'COMMUNITY';
  earnedAt?: string;
  karmaReward?: number;
}

export interface CourseNode {
  id: string;
  code: string;
  title: string;
  description: string;
  majorCode: string;
  semester: number;
  credits: number;
  followerCount: number;
  isFollowed?: boolean;
  discussionCount: number;
  materialCount: number;
  workflowCount: number;
  reviewCount: number;
  averageRating: number;
  prerequisites?: string[];
}

export interface QuestionPost {
  id: string;
  title: string;
  content: string;
  courseCode?: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: UserRole;
    karma: number;
    campus?: string;
    isAnonymous?: boolean;
  };
  tags: string[];
  upvotes: number;
  downvotes: number;
  userVote?: 'UP' | 'DOWN' | null;
  answersCount: number;
  viewsCount: number;
  isSolved: boolean;
  isModVerified?: boolean;
  isLocked?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
  answers?: AnswerItem[];
}

export interface AnswerItem {
  id: string;
  questionId: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: UserRole;
    karma: number;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'UP' | 'DOWN' | null;
  isAccepted: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
  };
  likesCount: number;
  bookmarksCount: number;
  viewsCount: number;
  readTimeMinutes: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  instruction: string;
  codeSnippet?: string;
  language?: string;
  mediaUrl?: string;
}

export interface SharedWorkflow {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  technology: string;
  steps: WorkflowStep[];
  author: {
    id: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
    campus?: string;
  };
  viewsCount: number;
  usageCount: number;
  tags: string[];
  createdAt: string;
  isBookmarked?: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'ZIP' | 'CODE' | 'LINK';
  fileSizeMb?: number;
  downloadUrl?: string;
  externalUrl?: string;
  downloadsCount: number;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  semesterUploaded: string;
  createdAt: string;
  isBookmarked?: boolean;
}

export interface CourseReview {
  id: string;
  courseCode: string;
  author: {
    id: string;
    fullName: string;
    studentId?: string;
  };
  rating: number; // 1-5
  workload: number; // 1-5 (1: very light, 5: very heavy)
  practicality: number; // 1-5
  comment: string;
  tips: string;
  semesterTaken: string;
  createdAt: string;
  helpfulCount: number;
}

export interface SupportTicketItem {
  id: string;
  ticketId: string;
  title: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  messagesCount?: number;
  reporterName?: string;
  description?: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface BookmarkItem {
  id: string;
  userId: number | string;
  targetType: 'QUESTION' | 'ARTICLE' | 'WORKFLOW' | 'STUDY_MATERIAL' | 'COURSE';
  targetId: string;
  title: string;
  summary?: string;
  createdAt: string;
  url?: string;
}
