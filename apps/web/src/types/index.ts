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
  status: 'ACTIVE' | 'MUTED' | 'SUSPENDED' | 'UNVERIFIED';
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
}

export interface Answer {
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
  isBestAnswer: boolean;
  isModVerified: boolean;
  comments: CommentItem[];
  createdAt: string;
}

export interface CommentItem {
  id: string;
  parentId: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export interface TechArticle {
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
    avatarUrl?: string;
    role: UserRole;
  };
  readTimeMinutes: number;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
  isSeries?: boolean;
  seriesName?: string;
  createdAt: string;
}

export interface SharedWorkflow {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  technology: string;
  steps: {
    stepNumber: number;
    title: string;
    instruction: string;
    codeSnippet?: string;
    language?: string;
  }[];
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: UserRole;
  };
  viewsCount: number;
  usageCount: number;
  tags: string[];
  createdAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  fileType: 'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE';
  fileSizeMb: number;
  downloadUrl: string;
  downloadsCount: number;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  semesterUploaded: string;
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: 'Study Materials' | 'Books' | 'Electronics' | 'Accessories' | 'Other';
  condition: 'NEW' | 'LIKE NEW' | 'GOOD' | 'FAIR';
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  images: string[];
  campus: CampusCode;
  seller: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    studentId?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
  viewsCount: number;
  createdAt: string;
}

export interface CourseReview {
  id: string;
  courseCode: string;
  reviewer: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  rating: number; // 1-5
  workloadRating: number; // 1-5
  difficultyRating: number; // 1-5
  comment: string;
  semesterTaken: string;
  lecturerName?: string;
  upvotes: number;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: UserRole;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'MENTION';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  title: string;
  category: 'ACCOUNT' | 'ACADEMIC' | 'TECHNICAL' | 'HARASSMENT' | 'FEEDBACK';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  author: {
    id: string;
    fullName: string;
    email: string;
  };
  assignedTo?: string;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  service: string;
  action: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  details: string;
}

export interface ServiceHealthStatus {
  serviceName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimePercentage: number;
  latencyMs: number;
  lastChecked: string;
}
