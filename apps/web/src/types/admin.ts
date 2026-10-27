import type { User, Campus, Major, CourseNode, SystemAuditLog } from './index';

export interface AdminUser extends User {
  phone?: string;
  department?: string;
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  twoFactorEnabled?: boolean;
  inlinePolicies?: string[];
  assignedRoles?: string[];
  activeSessions?: {
    id: string;
    device: string;
    browser: string;
    ipAddress: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
  academicProfile?: {
    gpa: number;
    completedCredits: number;
    currentSemester: number;
    enrollmentYear: number;
    enrolledCourses: {
      code: string;
      title: string;
      grade?: string;
      status: 'COMPLETED' | 'IN_PROGRESS' | 'ENROLLED';
    }[];
  };
  activityStats?: {
    questionsCount: number;
    answersCount: number;
    bestAnswersCount: number;
    articlesCount: number;
    materialsUploaded: number;
    listingsCreated: number;
    upvotesGiven: number;
    upvotesReceived: number;
  };
}

export interface DetailedCampus extends Campus {
  regionalDirector: string;
  contactEmail: string;
  contactPhone: string;
  totalFaculty: number;
  totalMajors: number;
  activeCourseNodes: number;
  serverPartition: {
    nodeId: string;
    region: string;
    status: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
    latencyMs: number;
    lastSyncAt: string;
    replicationLagSec: number;
    feedGlocalRouting: boolean;
  };
}

export interface DetailedMajor extends Major {
  vietnameseName: string;
  department: string;
  headOfDepartment: string;
  totalCreditsRequired: number;
  durationSemesters: number;
  isActive: boolean;
  curriculumRoadmap: {
    semester: number;
    semesterName: string;
    courses: {
      code: string;
      title: string;
      credits: number;
      prerequisites: string[];
      isMandatory: boolean;
    }[];
  }[];
}

export interface DetailedCourseNode extends CourseNode {
  vietnameseTitle: string;
  department: string;
  syllabusVersion: string;
  syllabusDocumentUrl?: string;
  learningObjectives: string[];
  campusOfferings: {
    campusCode: 'HL' | 'HCM' | 'DN' | 'CT' | 'QN';
    activeClasses: number;
    enrolledStudents: number;
    lecturers: string[];
  }[];
  topics: {
    id: string;
    title: string;
    order: number;
    estimatedHours: number;
  }[];
  aiAnalysis?: {
    summary: string;
    suggestedTags: string[];
    difficultyScore: number;
    prerequisiteReadinessScore: number;
    duplicateQuestionsFiltered: number;
  };
}

export interface ReputationRule {
  id: string;
  actionCode: string;
  actionName: string;
  category: 'CONTENT' | 'DISCUSSION' | 'ACADEMIC' | 'COMMUNITY' | 'PENALTY';
  pointDelta: number;
  description: string;
  dailyCap?: number;
  cooldownSeconds?: number;
  isActive: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export interface DetailedBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';
  category: 'CONTRIBUTOR' | 'EXPERT' | 'MODERATOR' | 'ALUMNI' | 'COMMUNITY';
  triggerCriteria: string;
  pointValue: number;
  awardedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface DetailedAuditLog extends SystemAuditLog {
  eventId: string;
  immutableHash: string;
  previousHash: string;
  merkleRoot: string;
  isoStandardStamp: string;
  userAgent: string;
  location: string;
  beforeStatePayload?: Record<string, any>;
  afterStatePayload?: Record<string, any>;
  signatureVerified: boolean;
}

export interface AISensitivityConfig {
  toxicityThreshold: number; // 0.0 - 1.0
  hateSpeechThreshold: number;
  spamThreshold: number;
  sexualContentThreshold: number;
  academicDishonestyThreshold: number;
  autoQuarantineAction: 'FLAG_FOR_REVIEW' | 'AUTO_MUTE' | 'AUTO_DELETE';
  realtimeScanEnabled: boolean;
  aiSummarizerModel: string;
}
