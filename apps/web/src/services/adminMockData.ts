import { User, Campus, Major, CourseNode, SupportTicket, SystemAuditLog, ServiceHealthStatus, BadgeItem } from '../types';

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

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'usr-admin-1',
    email: 'admin.fhub@fpt.edu.vn',
    fullName: 'Hoàng Quốc Việt',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    campus: 'HL',
    phone: '0988123456',
    department: 'Ban Giám Hiệu & IT Operations',
    karma: 9999,
    status: 'ACTIVE',
    verifiedAt: '2024-01-01T00:00:00Z',
    twoFactorEnabled: true,
    inlinePolicies: ['ADMIN_ALL_ACCESS', 'TAXONOMY_WRITE', 'USER_GOVERNANCE', 'SECURITY_AUDIT'],
    assignedRoles: ['Super Admin', 'Security Lead'],
    badges: [
      { id: 'b-adm', name: 'System Architect', description: 'Quản trị viên cốt lõi SEP Core', icon: 'ShieldCheck', tier: 'PLATINUM', category: 'EXPERT', earnedAt: '2024-01-01' },
    ],
    activeSessions: [
      { id: 'sess-1', device: 'MacBook Pro M3 Max', browser: 'Chrome 122.0', ipAddress: '14.225.244.11', location: 'Hà Nội, VN', lastActive: 'Vừa xong', isCurrent: true },
      { id: 'sess-2', device: 'iPhone 15 Pro', browser: 'Safari Mobile', ipAddress: '113.190.234.88', location: 'Hòa Lạc, VN', lastActive: '2 giờ trước', isCurrent: false },
    ],
  },
  {
    id: 'usr-1',
    email: 'nguyenvana.se@fpt.edu.vn',
    fullName: 'Nguyễn Văn A',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    campus: 'HL',
    major: 'Software Engineering',
    studentId: 'HE163421',
    phone: '0912345678',
    bio: 'Software Engineering Student @ FPT University. Passionate about .NET Core, React, and Cloud Architecture.',
    githubUrl: 'https://github.com/nguyenvana',
    linkedinUrl: 'https://linkedin.com/in/nguyenvana',
    karma: 1250,
    status: 'ACTIVE',
    verifiedAt: '2025-09-01T08:00:00Z',
    twoFactorEnabled: true,
    inlinePolicies: ['STUDENT_DEFAULT', 'MARKETPLACE_SELLER'],
    assignedRoles: ['Student', 'Peer Tutor'],
    badges: [
      { id: 'b1', name: 'Code Champion', description: 'Đạt hơn 50 lời giải đáp hữu ích', icon: 'Code', tier: 'GOLD', category: 'CONTRIBUTOR', earnedAt: '2026-01-15' },
      { id: 'b2', name: 'Knowledge Sharer', description: 'Đã đóng góp 10+ workflows chất lượng', icon: 'Share2', tier: 'SILVER', category: 'EXPERT', earnedAt: '2026-02-20' },
      { id: 'b3', name: 'Top Reviewer', description: 'Đánh giá môn học chi tiết và khách quan', icon: 'Star', tier: 'BRONZE', category: 'COMMUNITY', earnedAt: '2026-03-01' },
    ],
    academicProfile: {
      gpa: 3.65,
      completedCredits: 92,
      currentSemester: 6,
      enrollmentYear: 2022,
      enrolledCourses: [
        { code: 'PRN211', title: 'Basic Cross-Platform .NET', grade: '9.2', status: 'COMPLETED' },
        { code: 'PRN231', title: 'Web API with .NET', status: 'IN_PROGRESS' },
        { code: 'SWP391', title: 'Application Dev Project', status: 'IN_PROGRESS' },
        { code: 'CSD201', title: 'Data Structures & Algorithms', grade: '8.8', status: 'COMPLETED' },
      ],
    },
    activityStats: {
      questionsCount: 14,
      answersCount: 38,
      bestAnswersCount: 12,
      articlesCount: 5,
      materialsUploaded: 8,
      listingsCreated: 3,
      upvotesGiven: 142,
      upvotesReceived: 620,
    },
    activeSessions: [
      { id: 'sess-10', device: 'Dell XPS 15', browser: 'Chrome 122.0', ipAddress: '118.70.190.54', location: 'Hà Nội, VN', lastActive: '5 phút trước', isCurrent: false },
    ],
  },
  {
    id: 'usr-2',
    email: 'tranb.he172109@fpt.edu.vn',
    fullName: 'Trần Thị Bích',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    campus: 'HCM',
    major: 'Information Assurance',
    studentId: 'SE172109',
    phone: '0987654321',
    bio: 'Security Researcher in training. CTF Player & Reverse Engineering enthusiast.',
    karma: 840,
    status: 'ACTIVE',
    verifiedAt: '2025-10-10T09:00:00Z',
    twoFactorEnabled: false,
    inlinePolicies: ['STUDENT_DEFAULT'],
    assignedRoles: ['Student'],
    badges: [
      { id: 'b4', name: 'Bug Hunter', description: 'Báo cáo lỗ hổng học thuật chính xác', icon: 'Shield', tier: 'SILVER', category: 'EXPERT', earnedAt: '2026-02-11' },
    ],
    academicProfile: {
      gpa: 3.82,
      completedCredits: 74,
      currentSemester: 5,
      enrollmentYear: 2023,
      enrolledCourses: [
        { code: 'NWC203', title: 'Computer Networking', grade: '9.5', status: 'COMPLETED' },
        { code: 'IA201', title: 'Information Assurance Fundamentals', status: 'IN_PROGRESS' },
      ],
    },
    activityStats: {
      questionsCount: 8,
      answersCount: 19,
      bestAnswersCount: 7,
      articlesCount: 3,
      materialsUploaded: 12,
      listingsCreated: 1,
      upvotesGiven: 89,
      upvotesReceived: 310,
    },
  },
  {
    id: 'usr-3',
    email: 'lequocbao.ai@fpt.edu.vn',
    fullName: 'Lê Quốc Bảo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    campus: 'DN',
    major: 'Artificial Intelligence',
    studentId: 'DE180992',
    phone: '0934112233',
    karma: 150,
    status: 'PENDING_VERIFICATION',
    twoFactorEnabled: false,
    inlinePolicies: ['STUDENT_UNVERIFIED'],
    assignedRoles: ['Unverified Student'],
    badges: [],
  },
  {
    id: 'usr-4',
    email: 'phamduc.mod@fpt.edu.vn',
    fullName: 'Phạm Minh Đức',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Community Moderator',
    campus: 'HL',
    major: 'Software Engineering',
    studentId: 'HE150114',
    phone: '0909988776',
    karma: 3450,
    status: 'ACTIVE',
    verifiedAt: '2024-05-15T00:00:00Z',
    twoFactorEnabled: true,
    inlinePolicies: ['MODERATION_QUEUE_ACCESS', 'FLAG_RESOLVE', 'LOCK_POST'],
    assignedRoles: ['Community Moderator', 'Alumni Mentor'],
    badges: [
      { id: 'b5', name: 'Community Pillar', description: 'Duyệt hơn 200 nội dung cộng đồng', icon: 'Award', tier: 'PLATINUM', category: 'MODERATOR', earnedAt: '2025-11-20' },
    ],
  },
  {
    id: 'usr-5',
    email: 'nguyenthinga.staff@fpt.edu.vn',
    fullName: 'Nguyễn Thị Nga',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Staff',
    campus: 'HCM',
    phone: '0945678901',
    department: 'Phòng Công Tác Sinh Viên (P.CTSV)',
    karma: 2100,
    status: 'ACTIVE',
    verifiedAt: '2024-03-01T00:00:00Z',
    twoFactorEnabled: true,
    inlinePolicies: ['STUDENT_VERIFICATION_MANAGE', 'TICKET_STAFF_RESOLVE', 'ALERT_BROADCAST'],
    assignedRoles: ['Staff Governance', 'Academic Advisor'],
    badges: [],
  },
  {
    id: 'usr-6',
    email: 'vuhoangnam.spam@fpt.edu.vn',
    fullName: 'Vũ Hoàng Nam',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    campus: 'CT',
    major: 'Graphic Design',
    studentId: 'CE170043',
    karma: -45,
    status: 'MUTED',
    twoFactorEnabled: false,
    inlinePolicies: ['MUTED_RESTRICTIONS'],
    assignedRoles: ['Student (Muted)'],
    badges: [],
  },
  {
    id: 'usr-7',
    email: 'dinhvanhung.cheat@fpt.edu.vn',
    fullName: 'Đinh Văn Hùng',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    campus: 'QN',
    major: 'Business Administration',
    studentId: 'QE183011',
    karma: -250,
    status: 'SUSPENDED',
    twoFactorEnabled: false,
    inlinePolicies: ['SUSPENDED_BLOCKED'],
    assignedRoles: ['Suspended User'],
    badges: [],
  },
];

export const mockDetailedCampuses: DetailedCampus[] = [
  {
    id: 'camp-1',
    code: 'HL',
    name: 'FPT University Hà Nội (Hòa Lạc)',
    location: 'Khu CNC Hòa Lạc, Km29 Đại lộ Thăng Long, Thạch Thất, Hà Nội',
    isActive: true,
    studentCount: 14500,
    regionalDirector: 'TS. Nguyễn Khắc Thành',
    contactEmail: 'tuyensinhhn@fe.edu.vn',
    contactPhone: '024.7300.5588',
    totalFaculty: 420,
    totalMajors: 14,
    activeCourseNodes: 186,
    serverPartition: {
      nodeId: 'node-hl-primary-01',
      region: 'ap-southeast-1 (Hanoi Edge DC)',
      status: 'OPTIMAL',
      latencyMs: 14,
      lastSyncAt: '2026-03-17T15:30:00Z',
      replicationLagSec: 0.2,
      feedGlocalRouting: true,
    },
  },
  {
    id: 'camp-2',
    code: 'HCM',
    name: 'FPT University TP. Hồ Chí Minh',
    location: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM',
    isActive: true,
    studentCount: 16200,
    regionalDirector: 'TS. Trần Ngọc Tuấn',
    contactEmail: 'tuyensinhhcm@fe.edu.vn',
    contactPhone: '028.7300.5588',
    totalFaculty: 480,
    totalMajors: 16,
    activeCourseNodes: 186,
    serverPartition: {
      nodeId: 'node-hcm-primary-01',
      region: 'ap-southeast-1 (Saigon Edge DC)',
      status: 'OPTIMAL',
      latencyMs: 18,
      lastSyncAt: '2026-03-17T15:30:00Z',
      replicationLagSec: 0.3,
      feedGlocalRouting: true,
    },
  },
  {
    id: 'camp-3',
    code: 'DN',
    name: 'FPT University Đà Nẵng',
    location: 'Khu đô thị FPT City Đà Nẵng, P. Hòa Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng',
    isActive: true,
    studentCount: 6800,
    regionalDirector: 'TS. Huỳnh Anh Tuấn',
    contactEmail: 'tuyensinhdn@fe.edu.vn',
    contactPhone: '0236.7300.999',
    totalFaculty: 190,
    totalMajors: 12,
    activeCourseNodes: 174,
    serverPartition: {
      nodeId: 'node-dn-primary-01',
      region: 'ap-southeast-1 (Danang Edge DC)',
      status: 'OPTIMAL',
      latencyMs: 22,
      lastSyncAt: '2026-03-17T15:29:45Z',
      replicationLagSec: 0.4,
      feedGlocalRouting: true,
    },
  },
  {
    id: 'camp-4',
    code: 'CT',
    name: 'FPT University Cần Thơ',
    location: 'Số 600 đường Nguyễn Văn Cừ nối dài, P. An Bình, Q. Ninh Kiều, TP. Cần Thơ',
    isActive: true,
    studentCount: 5200,
    regionalDirector: 'TS. Trần Thanh Thơ',
    contactEmail: 'tuyensinhct@fe.edu.vn',
    contactPhone: '0292.730.3636',
    totalFaculty: 140,
    totalMajors: 10,
    activeCourseNodes: 160,
    serverPartition: {
      nodeId: 'node-ct-primary-01',
      region: 'ap-southeast-1 (Cantho Edge DC)',
      status: 'OPTIMAL',
      latencyMs: 25,
      lastSyncAt: '2026-03-17T15:28:10Z',
      replicationLagSec: 0.5,
      feedGlocalRouting: true,
    },
  },
  {
    id: 'camp-5',
    code: 'QN',
    name: 'FPT University Quy Nhơn (AI Campus)',
    location: 'Khu đô thị mới An Phú Thịnh, P. Nhơn Bình, TP. Quy Nhơn, Tỉnh Bình Định',
    isActive: true,
    studentCount: 3100,
    regionalDirector: 'PGS. TS. Trần Cao Sơn',
    contactEmail: 'tuyensinhqn@fe.edu.vn',
    contactPhone: '0256.730.1866',
    totalFaculty: 95,
    totalMajors: 8,
    activeCourseNodes: 142,
    serverPartition: {
      nodeId: 'node-qn-primary-01',
      region: 'ap-southeast-1 (Quynhon Edge DC)',
      status: 'OPTIMAL',
      latencyMs: 28,
      lastSyncAt: '2026-03-17T15:29:12Z',
      replicationLagSec: 0.6,
      feedGlocalRouting: true,
    },
  },
];

export const mockDetailedMajors: DetailedMajor[] = [
  {
    id: 'maj-1',
    code: 'SE',
    name: 'Software Engineering',
    vietnameseName: 'Kỹ thuật phần mềm',
    description: 'Chương trình đào tạo kỹ sư phần mềm chuẩn quốc tế ABET, đào tạo kiến trúc phần mềm, Clean Architecture, CI/CD và Cloud.',
    department: 'Công nghệ thông tin',
    headOfDepartment: 'TS. Kiều Trọng Khánh',
    totalCreditsRequired: 144,
    durationSemesters: 9,
    totalCourses: 48,
    isActive: true,
    curriculumRoadmap: [
      {
        semester: 1,
        semesterName: 'Học kỳ 1 (Foundation)',
        courses: [
          { code: 'PRF192', title: 'Programming Fundamentals (C)', credits: 3, prerequisites: [], isMandatory: true },
          { code: 'CEA201', title: 'Computer Organization & Architecture', credits: 3, prerequisites: [], isMandatory: true },
          { code: 'MAE101', title: 'Mathematics for Engineering', credits: 3, prerequisites: [], isMandatory: true },
          { code: 'CSI104', title: 'Introduction to Computer Science', credits: 3, prerequisites: [], isMandatory: true },
        ],
      },
      {
        semester: 2,
        semesterName: 'Học kỳ 2 (Core Java)',
        courses: [
          { code: 'PRO192', title: 'Object-Oriented Programming (Java)', credits: 3, prerequisites: ['PRF192'], isMandatory: true },
          { code: 'MAD101', title: 'Discrete Mathematics', credits: 3, prerequisites: ['MAE101'], isMandatory: true },
          { code: 'OSG202', title: 'Operating Systems', credits: 3, prerequisites: ['CEA201'], isMandatory: true },
          { code: 'NWC203', title: 'Computer Networking', credits: 3, prerequisites: [], isMandatory: true },
        ],
      },
      {
        semester: 3,
        semesterName: 'Học kỳ 3 (DSA & DB)',
        courses: [
          { code: 'CSD201', title: 'Data Structures and Algorithms', credits: 3, prerequisites: ['PRO192'], isMandatory: true },
          { code: 'DBI202', title: 'Database Systems (SQL Server)', credits: 3, prerequisites: [], isMandatory: true },
          { code: 'MAS291', title: 'Probability and Statistics', credits: 3, prerequisites: ['MAE101'], isMandatory: true },
          { code: 'JPD113', title: 'Japanese Elementary 1', credits: 3, prerequisites: [], isMandatory: false },
        ],
      },
      {
        semester: 4,
        semesterName: 'Học kỳ 4 (Web & Testing)',
        courses: [
          { code: 'PRJ301', title: 'Java Web Application Development', credits: 3, prerequisites: ['CSD201', 'DBI202'], isMandatory: true },
          { code: 'SWE201c', title: 'Introduction to Software Engineering', credits: 3, prerequisites: [], isMandatory: true },
          { code: 'SWT301', title: 'Software Testing', credits: 3, prerequisites: ['SWE201c'], isMandatory: true },
        ],
      },
      {
        semester: 5,
        semesterName: 'Học kỳ 5 (.NET Track & OJT Prep)',
        courses: [
          { code: 'PRN211', title: 'Basic Cross-Platform .NET', credits: 3, prerequisites: ['PRO192', 'DBI202'], isMandatory: true },
          { code: 'SWP391', title: 'Application Development Project', credits: 3, prerequisites: ['PRJ301', 'SWE201c'], isMandatory: true },
          { code: 'SWR302', title: 'Software Requirement Engineering', credits: 3, prerequisites: ['SWE201c'], isMandatory: true },
        ],
      },
      {
        semester: 6,
        semesterName: 'Học kỳ 6 (On-the-Job Training - OJT)',
        courses: [
          { code: 'OJT401', title: 'Enterprise Internship at Tech Corporation', credits: 10, prerequisites: ['SWP391'], isMandatory: true },
        ],
      },
      {
        semester: 7,
        semesterName: 'Học kỳ 7 (Enterprise Architecture)',
        courses: [
          { code: 'PRN231', title: 'Building Cross-Platform Web API with .NET', credits: 3, prerequisites: ['PRN211'], isMandatory: true },
          { code: 'PRM392', title: 'Mobile Programming (Flutter/Android)', credits: 3, prerequisites: ['PRO192'], isMandatory: true },
          { code: 'SWD392', title: 'Software Architecture & Design Patterns', credits: 3, prerequisites: ['SWP391'], isMandatory: true },
        ],
      },
      {
        semester: 8,
        semesterName: 'Học kỳ 8 (Advanced Electives)',
        courses: [
          { code: 'PRN221', title: 'Advanced Cross-Platform .NET with Razor/Blazor', credits: 3, prerequisites: ['PRN231'], isMandatory: true },
          { code: 'WDM201', title: 'Web Data Mining & Analytics', credits: 3, prerequisites: ['CSD201'], isMandatory: false },
        ],
      },
      {
        semester: 9,
        semesterName: 'Học kỳ 9 (Capstone Project)',
        courses: [
          { code: 'CAP501', title: 'Graduation Capstone Project / Thesis', credits: 10, prerequisites: ['PRN231', 'SWD392'], isMandatory: true },
        ],
      },
    ],
  },
  {
    id: 'maj-2',
    code: 'IA',
    name: 'Information Assurance',
    vietnameseName: 'An toàn thông tin',
    description: 'Đào tạo chuyên sâu về bảo mật ứng dụng, phân tích mã độc, đánh giá an ninh hệ thống và phòng thủ không gian mạng.',
    department: 'An toàn thông tin',
    headOfDepartment: 'TS. Phạm Văn Hiệp',
    totalCreditsRequired: 144,
    durationSemesters: 9,
    totalCourses: 42,
    isActive: true,
    curriculumRoadmap: [
      {
        semester: 1,
        semesterName: 'Học kỳ 1 (Foundation)',
        courses: [
          { code: 'PRF192', title: 'Programming Fundamentals (C)', credits: 3, prerequisites: [], isMandatory: true },
          { code: 'CEA201', title: 'Computer Organization & Architecture', credits: 3, prerequisites: [], isMandatory: true },
          { code: 'MAE101', title: 'Mathematics for Engineering', credits: 3, prerequisites: [], isMandatory: true },
        ],
      },
      {
        semester: 5,
        semesterName: 'Học kỳ 5 (Ethical Hacking & Cryptography)',
        courses: [
          { code: 'CRY301', title: 'Applied Cryptography', credits: 3, prerequisites: ['MAD101'], isMandatory: true },
          { code: 'ETH302', title: 'Ethical Hacking and Penetration Testing', credits: 3, prerequisites: ['NWC203'], isMandatory: true },
        ],
      },
    ],
  },
  {
    id: 'maj-3',
    code: 'AI',
    name: 'Artificial Intelligence',
    vietnameseName: 'Trí tuệ nhân tạo',
    description: 'Chương trình đào tạo kỹ sư AI, Machine Learning, Deep Learning, Computer Vision và LLM Systems.',
    department: 'Khoa học máy tính',
    headOfDepartment: 'TS. Nguyễn Gia Như',
    totalCreditsRequired: 144,
    durationSemesters: 9,
    totalCourses: 45,
    isActive: true,
    curriculumRoadmap: [],
  },
  {
    id: 'maj-4',
    code: 'GD',
    name: 'Graphic Design',
    vietnameseName: 'Thiết kế mỹ thuật số',
    description: 'Đào tạo thiết kế đồ họa tương tác, UI/UX, 3D Modeling và Motion Graphics.',
    department: 'Thiết kế đồ họa',
    headOfDepartment: 'ThS. Nguyễn Hồng Quân',
    totalCreditsRequired: 140,
    durationSemesters: 9,
    totalCourses: 38,
    isActive: true,
    curriculumRoadmap: [],
  },
  {
    id: 'maj-5',
    code: 'IB',
    name: 'International Business',
    vietnameseName: 'Kinh doanh quốc tế',
    description: 'Đào tạo chuỗi cung ứng toàn cầu, thương mại quốc tế và đàm phán thương mại.',
    department: 'Quản trị kinh doanh',
    headOfDepartment: 'TS. Trần Thị Bích Phượng',
    totalCreditsRequired: 136,
    durationSemesters: 9,
    totalCourses: 36,
    isActive: true,
    curriculumRoadmap: [],
  },
];

export const mockDetailedCourseNodes: DetailedCourseNode[] = [
  {
    id: 'cn-1',
    code: 'PRN211',
    title: 'Basic Cross-Platform Application Programming with .NET',
    vietnameseTitle: 'Lập trình ứng dụng đa nền tảng cơ bản với .NET',
    description: 'Khóa học cung cấp kiến thức nền tảng về C# 12, .NET 8 SDK, kiến trúc WPF/WinForms, LINQ, Entity Framework Core và lập trình đa luồng Asynchronous (async/await).',
    majorCode: 'SE',
    department: 'Kỹ thuật phần mềm',
    syllabusVersion: 'v2026.1 (Spring 2026)',
    semester: 5,
    credits: 3,
    followerCount: 1420,
    isFollowed: true,
    discussionCount: 128,
    materialCount: 45,
    workflowCount: 12,
    reviewCount: 89,
    averageRating: 4.8,
    prerequisites: ['PRO192', 'DBI202'],
    learningObjectives: [
      'Nắm vững cú pháp hiện đại của C# (Pattern matching, Records, Generics, Delegates & Events)',
      'Thao tác cơ sở dữ liệu nâng cao với Entity Framework Core Code-First và Migrations',
      'Xây dựng ứng dụng Desktop / Cross-Platform với WPF và MVVM Pattern',
      'Áp dụng Repository Pattern và Dependency Injection trong dự án .NET thực tế',
    ],
    campusOfferings: [
      { campusCode: 'HL', activeClasses: 18, enrolledStudents: 540, lecturers: ['Thầy Trần Đình Khang', 'Cô Đỗ Thị Mai'] },
      { campusCode: 'HCM', activeClasses: 22, enrolledStudents: 660, lecturers: ['Thầy Lê Thanh Tùng', 'Thầy Nguyễn Văn Nam'] },
      { campusCode: 'DN', activeClasses: 8, enrolledStudents: 240, lecturers: ['Thầy Huỳnh Bá Khải'] },
      { campusCode: 'CT', activeClasses: 6, enrolledStudents: 180, lecturers: ['Cô Phạm Thị Tuyết'] },
      { campusCode: 'QN', activeClasses: 4, enrolledStudents: 120, lecturers: ['Thầy Nguyễn Văn An'] },
    ],
    topics: [
      { id: 'top-1', title: 'C# Language Fundamentals & Memory Management', order: 1, estimatedHours: 8 },
      { id: 'top-2', title: 'OOP in C#, Delegates, Events & Lambda Expressions', order: 2, estimatedHours: 10 },
      { id: 'top-3', title: 'LINQ to Objects, LINQ to Entities & EF Core', order: 3, estimatedHours: 14 },
      { id: 'top-4', title: 'WPF Architecture, XAML & MVVM Pattern', order: 4, estimatedHours: 12 },
      { id: 'top-5', title: 'Multithreading & Asynchronous Programming (Task, async/await)', order: 5, estimatedHours: 8 },
    ],
    aiAnalysis: {
      summary: 'Môn học trọng tâm chuyên ngành SE tại FPT University, là tiền đề trực tiếp cho PRN231 (Web API) và Capstone Project SWP391.',
      suggestedTags: ['csharp', 'dotnet8', 'efcore', 'wpf', 'mvvm', 'linq', 'prn211'],
      difficultyScore: 7.8,
      prerequisiteReadinessScore: 9.2,
      duplicateQuestionsFiltered: 142,
    },
  },
  {
    id: 'cn-2',
    code: 'PRN231',
    title: 'Building Cross-Platform Web Applications with .NET',
    vietnameseTitle: 'Xây dựng ứng dụng Web đa nền tảng với .NET',
    description: 'Xây dựng RESTful Web API chuẩn microservices, bảo mật JWT Authentication, Clean Architecture, CQRS với MediatR, Redis Caching và Docker Containerization.',
    majorCode: 'SE',
    department: 'Kỹ thuật phần mềm',
    syllabusVersion: 'v2026.1 (Spring 2026)',
    semester: 7,
    credits: 3,
    followerCount: 980,
    isFollowed: false,
    discussionCount: 94,
    materialCount: 38,
    workflowCount: 15,
    reviewCount: 64,
    averageRating: 4.6,
    prerequisites: ['PRN211', 'DBI202'],
    learningObjectives: [
      'Thiết kế RESTful APIs tuân thủ chuẩn Richardson Maturity Model cấp 2 & 3',
      'Triển khai Clean Architecture phân tầng Domain, Application, Infrastructure và Web API',
      'Tích hợp JWT Token, Role-Based Access Control (RBAC) và Policy-Based Authorization',
      'Deploy container hóa với Docker Compose và tối ưu cache bằng Redis',
    ],
    campusOfferings: [
      { campusCode: 'HL', activeClasses: 12, enrolledStudents: 360, lecturers: ['Thầy Trần Đình Khang'] },
      { campusCode: 'HCM', activeClasses: 15, enrolledStudents: 450, lecturers: ['Thầy Lê Thanh Tùng'] },
      { campusCode: 'DN', activeClasses: 6, enrolledStudents: 180, lecturers: ['Thầy Huỳnh Bá Khải'] },
      { campusCode: 'CT', activeClasses: 4, enrolledStudents: 120, lecturers: ['Cô Phạm Thị Tuyết'] },
      { campusCode: 'QN', activeClasses: 3, enrolledStudents: 90, lecturers: ['Thầy Nguyễn Văn An'] },
    ],
    topics: [
      { id: 'top-21', title: 'ASP.NET Core Middleware & Dependency Injection Container', order: 1, estimatedHours: 6 },
      { id: 'top-22', title: 'Clean Architecture Structure & CQRS with MediatR', order: 2, estimatedHours: 12 },
      { id: 'top-23', title: 'Entity Framework Core Advanced & Fluent API Mapping', order: 3, estimatedHours: 10 },
      { id: 'top-24', title: 'Security: JWT Authentication, Refresh Token & Data Protection', order: 4, estimatedHours: 8 },
      { id: 'top-25', title: 'SignalR Realtime Communication & Background Services', order: 5, estimatedHours: 6 },
    ],
    aiAnalysis: {
      summary: 'Khóa học cấp cao trang bị kỹ năng backend enterprise .NET thực chiến để sinh viên đáp ứng trực tiếp yêu cầu tuyển dụng Junior/Mid-level .NET Developer.',
      suggestedTags: ['aspnetcore', 'webapi', 'cleanarchitecture', 'cqrs', 'jwt', 'docker', 'prn231'],
      difficultyScore: 8.4,
      prerequisiteReadinessScore: 8.8,
      duplicateQuestionsFiltered: 98,
    },
  },
  {
    id: 'cn-3',
    code: 'SWP391',
    title: 'Application Development Project',
    vietnameseTitle: 'Dự án phát triển ứng dụng (Đồ án chuyên ngành)',
    description: 'Môn học đồ án nhóm 4-5 sinh viên làm việc theo quy trình Scrum chuẩn trong 10 tuần, hoàn thiện sản phẩm phần mềm thực tế với đầy đủ SRS, Architecture, CI/CD và Testing.',
    majorCode: 'SE',
    department: 'Kỹ thuật phần mềm',
    syllabusVersion: 'v2026.1 (Spring 2026)',
    semester: 5,
    credits: 3,
    followerCount: 2150,
    isFollowed: true,
    discussionCount: 310,
    materialCount: 78,
    workflowCount: 34,
    reviewCount: 156,
    averageRating: 4.9,
    prerequisites: ['PRJ301', 'SWE201c'],
    learningObjectives: [
      'Thực hành quy trình Scrum: Sprint Planning, Daily Standup, Sprint Review & Retrospective',
      'Quản lý source code Git với mô hình GitFlow, Pull Request review và GitHub Actions CI/CD',
      'Hoàn thiện tài liệu kiến trúc phần mềm SRS, Database Design, System Flowchart',
      'Bảo vệ đồ án trước hội đồng phản biện giám khảo doanh nghiệp',
    ],
    campusOfferings: [
      { campusCode: 'HL', activeClasses: 25, enrolledStudents: 750, lecturers: ['Hội đồng SE Hòa Lạc'] },
      { campusCode: 'HCM', activeClasses: 30, enrolledStudents: 900, lecturers: ['Hội đồng SE Hồ Chí Minh'] },
      { campusCode: 'DN', activeClasses: 12, enrolledStudents: 360, lecturers: ['Hội đồng SE Đà Nẵng'] },
      { campusCode: 'CT', activeClasses: 8, enrolledStudents: 240, lecturers: ['Hội đồng SE Cần Thơ'] },
      { campusCode: 'QN', activeClasses: 5, enrolledStudents: 150, lecturers: ['Hội đồng SE Quy Nhơn'] },
    ],
    topics: [
      { id: 'top-31', title: 'Project Proposal, Team Formation & Topic Defense', order: 1, estimatedHours: 8 },
      { id: 'top-32', title: 'SRS Specification, System Architecture & Database Design', order: 2, estimatedHours: 16 },
      { id: 'top-33', title: 'Sprint 1 & Sprint 2: Core Feature Implementation', order: 3, estimatedHours: 24 },
      { id: 'top-34', title: 'Sprint 3: Testing, Integration & CI/CD Pipeline', order: 4, estimatedHours: 16 },
      { id: 'top-35', title: 'Final Defense Preparation & Demonstration to Enterprise Jury', order: 5, estimatedHours: 12 },
    ],
    aiAnalysis: {
      summary: 'Cột mốc quan trọng nhất của sinh viên SE trước kỳ OJT doanh nghiệp. Tỷ lệ thảo luận và chia sẻ tài liệu cao nhất toàn sàn FHub.',
      suggestedTags: ['swp391', 'project', 'scrum', 'teamwork', 'srs', 'defense', 'react', 'dotnet'],
      difficultyScore: 9.1,
      prerequisiteReadinessScore: 9.5,
      duplicateQuestionsFiltered: 320,
    },
  },
];

export const mockReputationRules: ReputationRule[] = [
  {
    id: 'rep-1',
    actionCode: 'BEST_ANSWER_ACCEPTED',
    actionName: 'Câu trả lời được chọn làm Best Answer',
    category: 'DISCUSSION',
    pointDelta: 50,
    description: 'Sinh viên được tác giả câu hỏi hoặc Giảng viên/Mod chọn là giải pháp chuẩn xác nhất.',
    dailyCap: 250,
    cooldownSeconds: 0,
    isActive: true,
    lastUpdated: '2026-03-01 10:00:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-2',
    actionCode: 'QUESTION_UPVOTED',
    actionName: 'Câu hỏi nhận được Upvote từ cộng đồng',
    category: 'DISCUSSION',
    pointDelta: 10,
    description: 'Mỗi lượt upvote từ tài khoản hợp lệ trên câu hỏi chất lượng.',
    dailyCap: 100,
    cooldownSeconds: 5,
    isActive: true,
    lastUpdated: '2026-02-15 09:30:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-3',
    actionCode: 'ANSWER_UPVOTED',
    actionName: 'Câu trả lời nhận được Upvote',
    category: 'DISCUSSION',
    pointDelta: 15,
    description: 'Đóng góp giải pháp hữu ích được sinh viên khác công nhận.',
    dailyCap: 150,
    cooldownSeconds: 5,
    isActive: true,
    lastUpdated: '2026-02-15 09:30:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-4',
    actionCode: 'MATERIAL_APPROVED',
    actionName: 'Tài liệu học tập được duyệt vào Thư viện',
    category: 'ACADEMIC',
    pointDelta: 30,
    description: 'Upload giáo trình, đề thi mẫu, source code đồ án được Mod xác thực hợp lệ.',
    dailyCap: 150,
    cooldownSeconds: 60,
    isActive: true,
    lastUpdated: '2026-01-20 14:00:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-5',
    actionCode: 'WORKFLOW_PUBLISHED',
    actionName: 'Workflow hướng dẫn kỹ thuật được đăng tải',
    category: 'CONTENT',
    pointDelta: 35,
    description: 'Tạo quy trình debug/cấu hình môi trường từng bước chuẩn xác.',
    dailyCap: 140,
    cooldownSeconds: 120,
    isActive: true,
    lastUpdated: '2026-01-10 11:15:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-6',
    actionCode: 'COURSE_REVIEW_VERIFIED',
    actionName: 'Đánh giá môn học chi tiết có tâm',
    category: 'ACADEMIC',
    pointDelta: 20,
    description: 'Review môn học với độ dài > 100 chữ kèm lời khuyên học tập xác thực.',
    dailyCap: 60,
    cooldownSeconds: 300,
    isActive: true,
    lastUpdated: '2026-02-01 16:20:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-7',
    actionCode: 'CONTENT_DOWNVOTED',
    actionName: 'Bài viết / Câu trả lời bị Downvote',
    category: 'PENALTY',
    pointDelta: -5,
    description: 'Nội dung chất lượng kém, sai lệch kiến thức hoặc gây hiểu lầm.',
    dailyCap: 50,
    cooldownSeconds: 0,
    isActive: true,
    lastUpdated: '2026-02-10 08:00:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-8',
    actionCode: 'SPAM_REPORT_VALIDATED',
    actionName: 'Bị phát hiện Spam / Quảng cáo rác',
    category: 'PENALTY',
    pointDelta: -50,
    description: 'Spam bình luận, đăng bán hàng sai chuyên mục hoặc chèo kéo trái phép.',
    dailyCap: 500,
    cooldownSeconds: 0,
    isActive: true,
    lastUpdated: '2026-01-05 15:40:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
  {
    id: 'rep-9',
    actionCode: 'ACADEMIC_VIOLATION_FLAGGED',
    actionName: 'Vi phạm quy chế thi cử / Gian lận học thuật',
    category: 'PENALTY',
    pointDelta: -100,
    description: 'Đăng đề thi trong giờ thi hoặc mua bán tài liệu mật vi phạm quy định FPTU.',
    dailyCap: 1000,
    cooldownSeconds: 0,
    isActive: true,
    lastUpdated: '2026-01-01 00:00:00',
    updatedBy: 'Hoàng Quốc Việt (Admin)',
  },
];

export const mockDetailedBadges: DetailedBadge[] = [
  {
    id: 'bg-1',
    code: 'CODE_CHAMPION',
    name: 'Code Champion',
    description: 'Đạt hơn 50 lời giải đáp Best Answer trong các môn lập trình cốt lõi.',
    icon: 'Code',
    tier: 'GOLD',
    category: 'CONTRIBUTOR',
    triggerCriteria: 'best_answers_count >= 50 && code_courses_ratio >= 0.8',
    pointValue: 200,
    awardedCount: 142,
    isActive: true,
    createdAt: '2025-01-10',
  },
  {
    id: 'bg-2',
    code: 'KNOWLEDGE_SHARER',
    name: 'Knowledge Sharer',
    description: 'Đã đóng góp trên 15 tài liệu học tập và 10 workflow được cộng đồng tải về hơn 500 lần.',
    icon: 'Share2',
    tier: 'SILVER',
    category: 'EXPERT',
    triggerCriteria: 'materials_count >= 15 && total_downloads >= 500',
    pointValue: 150,
    awardedCount: 389,
    isActive: true,
    createdAt: '2025-01-10',
  },
  {
    id: 'bg-3',
    code: 'SYSTEM_ARCHITECT',
    name: 'System Architect',
    description: 'Thành viên cốt cán SEP Core với các đóng góp vượt bậc cho hạ tầng nền tảng.',
    icon: 'ShieldCheck',
    tier: 'LEGENDARY',
    category: 'EXPERT',
    triggerCriteria: 'admin_manual_grant || core_contributor_status == true',
    pointValue: 1000,
    awardedCount: 8,
    isActive: true,
    createdAt: '2024-12-01',
  },
  {
    id: 'bg-4',
    code: 'BUG_HUNTER',
    name: 'Bug Hunter',
    description: 'Báo cáo lỗi hệ thống hoặc lỗ hổng bảo mật xác thực được ban quản trị chấp thuận.',
    icon: 'Shield',
    tier: 'SILVER',
    category: 'EXPERT',
    triggerCriteria: 'accepted_bug_reports >= 3',
    pointValue: 300,
    awardedCount: 64,
    isActive: true,
    createdAt: '2025-02-15',
  },
  {
    id: 'bg-5',
    code: 'COMMUNITY_PILLAR',
    name: 'Community Pillar',
    description: 'Đã tích cực điều hành, giải quyết trên 200 khiếu nại và giữ gìn môi trường học thuật trong sạch.',
    icon: 'Award',
    tier: 'PLATINUM',
    category: 'MODERATOR',
    triggerCriteria: 'resolved_tickets_count >= 200 && mod_rating >= 4.9',
    pointValue: 500,
    awardedCount: 22,
    isActive: true,
    createdAt: '2025-01-05',
  },
  {
    id: 'bg-6',
    code: 'TOP_REVIEWER',
    name: 'Top Reviewer',
    description: 'Đã đóng góp 5+ bài review môn học công tâm, đầy đủ kinh nghiệm ôn thi PE/FE.',
    icon: 'Star',
    tier: 'BRONZE',
    category: 'COMMUNITY',
    triggerCriteria: 'course_reviews_count >= 5 && average_review_upvotes >= 20',
    pointValue: 80,
    awardedCount: 680,
    isActive: true,
    createdAt: '2025-03-01',
  },
];

export const mockDetailedSupportTickets: SupportTicket[] = [
  {
    id: 't-101',
    ticketCode: 'TKT-2026-089',
    title: 'Yêu cầu xác minh danh tính sinh viên campus Hòa Lạc',
    category: 'ACCOUNT',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    author: {
      id: 'usr-1',
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana.se@fpt.edu.vn',
    },
    assignedTo: 'Nguyễn Thị Nga (Staff)',
    repliesCount: 3,
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-16T11:30:00Z',
  },
  {
    id: 't-102',
    ticketCode: 'TKT-2026-092',
    title: 'Báo cáo gian lận tài liệu bản quyền môn SWP391 trên Marketplace',
    category: 'HARASSMENT',
    status: 'OPEN',
    priority: 'URGENT',
    author: {
      id: 'usr-4',
      fullName: 'Phạm Minh Đức',
      email: 'phamduc.mod@fpt.edu.vn',
    },
    assignedTo: 'Hoàng Quốc Việt (Admin)',
    repliesCount: 1,
    createdAt: '2026-03-17T09:15:00Z',
    updatedAt: '2026-03-17T09:15:00Z',
  },
  {
    id: 't-103',
    ticketCode: 'TKT-2026-081',
    title: 'Không thể tải đề cương môn PRN231 từ máy chủ Cần Thơ',
    category: 'TECHNICAL',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    author: {
      id: 'usr-6',
      fullName: 'Vũ Hoàng Nam',
      email: 'vuhoangnam.spam@fpt.edu.vn',
    },
    assignedTo: 'DevOps Edge Team',
    repliesCount: 4,
    createdAt: '2026-03-15T14:20:00Z',
    updatedAt: '2026-03-15T16:45:00Z',
  },
  {
    id: 't-104',
    ticketCode: 'TKT-2026-077',
    title: 'Đề xuất cập nhật giáo trình chuẩn kỳ Spring 2026 môn PRN211',
    category: 'ACADEMIC',
    status: 'OPEN',
    priority: 'LOW',
    author: {
      id: 'usr-2',
      fullName: 'Trần Thị Bích',
      email: 'tranb.he172109@fpt.edu.vn',
    },
    repliesCount: 0,
    createdAt: '2026-03-17T11:00:00Z',
    updatedAt: '2026-03-17T11:00:00Z',
  },
];

export const mockDetailedAuditLogs: DetailedAuditLog[] = [
  {
    id: 'log-101',
    eventId: 'EVT-20260317-094821',
    timestamp: '2026-03-17 14:20:10',
    service: 'Academic Taxonomy Service',
    action: 'CREATE_CAMPUS',
    actorId: 'usr-admin-1',
    actorEmail: 'admin.fhub@fpt.edu.vn',
    actorRole: 'Admin',
    ipAddress: '14.225.244.11',
    status: 'SUCCESS',
    details: 'Đã tạo Campus mới: FPT University Quy Nhơn (QN) partition node',
    immutableHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    previousHash: 'a71b26f55f284a7e9e8f498c56e301293a7e584282c1619623e5a5a1f28b4931',
    merkleRoot: '9d3a778e9b62c11451f28bc41b80e86a4f21b7454231b2345091ef748b9401a2',
    isoStandardStamp: 'ISO/IEC 27001:2022 §A.12.4.1 (Event Logging)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0',
    location: 'Hà Nội, Vietnam (AS7552 Viettel Group)',
    signatureVerified: true,
    beforeStatePayload: {
      activeCampusesCount: 4,
      campuses: ['HL', 'HCM', 'DN', 'CT'],
    },
    afterStatePayload: {
      activeCampusesCount: 5,
      newCampus: { code: 'QN', name: 'FPT University Quy Nhơn', nodeId: 'node-qn-primary-01' },
    },
  },
  {
    id: 'log-102',
    eventId: 'EVT-20260317-091204',
    timestamp: '2026-03-17 13:45:00',
    service: 'Identity & Access Service',
    action: 'ASSIGN_POLICY_TO_ROLE',
    actorId: 'usr-admin-1',
    actorEmail: 'admin.fhub@fpt.edu.vn',
    actorRole: 'Admin',
    ipAddress: '14.225.244.11',
    status: 'SUCCESS',
    details: 'Gán Policy CAN_LOCK_DISCUSSION và FLAG_RESOLVE cho Role Community Moderator',
    immutableHash: 'a71b26f55f284a7e9e8f498c56e301293a7e584282c1619623e5a5a1f28b4931',
    previousHash: '2c8846b9a842183e2069b18361b7829283f608148b488730999513361e27a69b',
    merkleRoot: '9d3a778e9b62c11451f28bc41b80e86a4f21b7454231b2345091ef748b9401a2',
    isoStandardStamp: 'SOC 2 Type II §CC6.1 (Access Control Logs)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0',
    location: 'Hà Nội, Vietnam (AS7552 Viettel Group)',
    signatureVerified: true,
    beforeStatePayload: {
      role: 'Community Moderator',
      policies: ['MODERATION_QUEUE_ACCESS'],
    },
    afterStatePayload: {
      role: 'Community Moderator',
      policies: ['MODERATION_QUEUE_ACCESS', 'CAN_LOCK_DISCUSSION', 'FLAG_RESOLVE'],
    },
  },
  {
    id: 'log-103',
    eventId: 'EVT-20260317-083011',
    timestamp: '2026-03-17 11:15:30',
    service: 'Governance & Moderation Service',
    action: 'SUSPEND_USER_ACCOUNT',
    actorId: 'usr-admin-1',
    actorEmail: 'admin.fhub@fpt.edu.vn',
    actorRole: 'Admin',
    ipAddress: '14.225.244.11',
    status: 'WARNING',
    details: 'Đình chỉ tài khoản sinh viên Đinh Văn Hùng (QE183011) do gian lận học thuật',
    immutableHash: '2c8846b9a842183e2069b18361b7829283f608148b488730999513361e27a69b',
    previousHash: 'f482098b92b678120489b0231846b7a81099238e8210340982341b8273618491',
    merkleRoot: '9d3a778e9b62c11451f28bc41b80e86a4f21b7454231b2345091ef748b9401a2',
    isoStandardStamp: 'GDPR / Decree 13/2023/ND-CP Compliance Record',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0',
    location: 'Hà Nội, Vietnam (AS7552 Viettel Group)',
    signatureVerified: true,
    beforeStatePayload: {
      targetUserId: 'usr-7',
      status: 'ACTIVE',
      karma: -50,
    },
    afterStatePayload: {
      targetUserId: 'usr-7',
      status: 'SUSPENDED',
      reason: 'ACADEMIC_VIOLATION_FLAGGED',
      suspensionDurationDays: 90,
    },
  },
];

export const mockAISensitivityConfig: AISensitivityConfig = {
  toxicityThreshold: 0.75,
  hateSpeechThreshold: 0.80,
  spamThreshold: 0.65,
  sexualContentThreshold: 0.85,
  academicDishonestyThreshold: 0.70,
  autoQuarantineAction: 'FLAG_FOR_REVIEW',
  realtimeScanEnabled: true,
  aiSummarizerModel: 'Gemini 1.5 Pro (Vertex AI - Google Cloud)',
};
