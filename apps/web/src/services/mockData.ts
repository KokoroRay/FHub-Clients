import {
  Campus,
  Major,
  User,
  CourseNode,
  QuestionPost,
  TechArticle,
  SharedWorkflow,
  StudyMaterial,
  MarketplaceListing,
  CourseReview,
  Conversation,
  SystemNotification,
  SupportTicket,
  SystemAuditLog,
  ServiceHealthStatus,
} from '../types';

export const mockCampuses: Campus[] = [
  { id: '1', code: 'HL', name: 'FPT University Hà Nội (Hòa Lạc)', location: 'Khu CNC Hòa Lạc, Km29 Đại lộ Thăng Long, Hà Nội', isActive: true, studentCount: 14500 },
  { id: '2', code: 'HCM', name: 'FPT University TP. Hồ Chí Minh', location: 'Lô E2a-7, Đường D1, Khu CNC, Long Thạnh Mỹ, TP. Thủ Đức', isActive: true, studentCount: 16200 },
  { id: '3', code: 'DN', name: 'FPT University Đà Nẵng', location: 'Khu đô thị FPT City, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng', isActive: true, studentCount: 6800 },
  { id: '4', code: 'CT', name: 'FPT University Cần Thơ', location: 'Số 600 đường Nguyễn Văn Cừ nối dài, An Bình, Ninh Kiều, Cần Thơ', isActive: true, studentCount: 5200 },
  { id: '5', code: 'QN', name: 'FPT University Quy Nhơn', location: 'Khu đô thị An Phú Thịnh, Nhơn Bình, TP. Quy Nhơn, Bình Định', isActive: true, studentCount: 3100 },
];

export const mockMajors: Major[] = [
  { id: '1', code: 'SE', name: 'Software Engineering', description: 'Kỹ thuật phần mềm', totalCourses: 48 },
  { id: '2', code: 'IA', name: 'Information Assurance', description: 'An toàn thông tin', totalCourses: 42 },
  { id: '3', code: 'AI', name: 'Artificial Intelligence', description: 'Trí tuệ nhân tạo', totalCourses: 45 },
  { id: '4', code: 'GD', name: 'Graphic Design', description: 'Thiết kế mỹ thuật số', totalCourses: 38 },
  { id: '5', code: 'IS', name: 'Information Systems', description: 'Hệ thống thông tin', totalCourses: 40 },
  { id: '6', code: 'BA', name: 'Business Administration', description: 'Quản trị kinh doanh', totalCourses: 36 },
];

export const mockCurrentUser: User = {
  id: 'usr-1',
  email: 'nguyenvana.se@fpt.edu.vn',
  fullName: 'Nguyễn Văn A',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Student',
  campus: 'HL',
  major: 'Software Engineering',
  studentId: 'HE163421',
  bio: 'Software Engineering Student @ FPT University. Passionate about .NET Core, React, and Cloud Architecture.',
  githubUrl: 'https://github.com/nguyenvana',
  linkedinUrl: 'https://linkedin.com/in/nguyenvana',
  karma: 1250,
  status: 'ACTIVE',
  verifiedAt: '2025-09-01T08:00:00Z',
  badges: [
    { id: 'b1', name: 'Code Champion', description: 'Đạt hơn 50 lời giải đáp hữu ích', icon: 'Code', tier: 'GOLD', category: 'CONTRIBUTOR', earnedAt: '2026-01-15' },
    { id: 'b2', name: 'Knowledge Sharer', description: 'Đã đóng góp 10+ workflows chất lượng', icon: 'Share2', tier: 'SILVER', category: 'EXPERT', earnedAt: '2026-02-20' },
    { id: 'b3', name: 'Top Reviewer', description: 'Đánh giá môn học chi tiết và khách quan', icon: 'Star', tier: 'BRONZE', category: 'COMMUNITY', earnedAt: '2026-03-01' },
  ],
};

export const mockCourses: CourseNode[] = [
  {
    id: 'c1',
    code: 'PRN211',
    title: 'Basic Cross-Platform Application Programming with .NET',
    description: 'Lập trình ứng dụng đa nền tảng cơ bản với C#, .NET 8, WPF, WinForms và Entity Framework Core.',
    majorCode: 'SE',
    semester: 5,
    credits: 3,
    followerCount: 1420,
    isFollowed: true,
    discussionCount: 128,
    materialCount: 45,
    workflowCount: 12,
    reviewCount: 89,
    averageRating: 4.8,
    prerequisites: ['PRO192', 'CSD201'],
  },
  {
    id: 'c2',
    code: 'PRN231',
    title: 'Building Cross-Platform Web Applications with .NET',
    description: 'Xây dựng Web API RESTful hiệu năng cao, xác thực JWT, Clean Architecture với ASP.NET Core.',
    majorCode: 'SE',
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
  },
  {
    id: 'c3',
    code: 'SWP391',
    title: 'Application Development Project',
    description: 'Dự án phát triển phần mềm theo mô hình Agile/Scrum theo nhóm thực tế trong 10 tuần.',
    majorCode: 'SE',
    semester: 5,
    credits: 3,
    followerCount: 2310,
    isFollowed: true,
    discussionCount: 340,
    materialCount: 92,
    workflowCount: 28,
    reviewCount: 150,
    averageRating: 4.9,
    prerequisites: ['SWD392', 'DBI202'],
  },
  {
    id: 'c4',
    code: 'CSD201',
    title: 'Data Structures and Algorithms',
    description: 'Cấu trúc dữ liệu và giải thuật với Java: Tree, Graph, Sorting, Dynamic Programming.',
    majorCode: 'SE',
    semester: 3,
    credits: 3,
    followerCount: 1850,
    isFollowed: false,
    discussionCount: 215,
    materialCount: 67,
    workflowCount: 8,
    reviewCount: 110,
    averageRating: 4.3,
    prerequisites: ['PRO192'],
  },
  {
    id: 'c5',
    code: 'MAS291',
    title: 'Applied Statistics for Computing',
    description: 'Xác suất thống kê ứng dụng trong khoa học máy tính và phân tích dữ liệu.',
    majorCode: 'SE',
    semester: 4,
    credits: 3,
    followerCount: 860,
    isFollowed: false,
    discussionCount: 78,
    materialCount: 30,
    workflowCount: 4,
    reviewCount: 42,
    averageRating: 4.1,
    prerequisites: ['MAE101'],
  },
];

export const mockQuestions: QuestionPost[] = [
  {
    id: 'q1',
    title: 'Làm thế nào để cấu hình Dependency Injection và DbContext Pool tối ưu trong ASP.NET Core?',
    content: 'Em đang làm đồ án PRN231 và muốn tối ưu hóa kết nối Database với EF Core và DbContextPooling. Khi nhiều request đồng thời thì gặp lỗi connection pool timeout. Nhờ các anh chị hướng dẫn cách cấu hình chuẩn Clean Architecture với ạ.',
    courseCode: 'PRN231',
    author: {
      id: 'usr-1',
      fullName: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Student',
      karma: 1250,
      isAnonymous: false,
    },
    tags: ['dotnet', 'csharp', 'clean-architecture', 'efcore'],
    upvotes: 38,
    downvotes: 1,
    userVote: 'UP',
    answersCount: 5,
    viewsCount: 420,
    isSolved: true,
    isModVerified: true,
    isPinned: true,
    createdAt: '2026-03-15T10:30:00Z',
  },
  {
    id: 'q2',
    title: 'Cách xử lý Deadlock trong SQL Server khi chạy nhiều transaction đồng thời môn DBI202?',
    content: 'Khi chạy lệnh UPDATE đồng thời trên 2 session, câu lệnh bị lỗi Deadlock victim process ID. Có pattern nào để retry hoặc xử lý isolation level chuẩn không ạ?',
    courseCode: 'DBI202',
    author: {
      id: 'usr-2',
      fullName: 'Trần Thị B',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Student',
      karma: 890,
      isAnonymous: false,
    },
    tags: ['sql-server', 'database', 'deadlock', 'transactions'],
    upvotes: 24,
    downvotes: 0,
    userVote: null,
    answersCount: 3,
    viewsCount: 290,
    isSolved: false,
    createdAt: '2026-03-16T14:15:00Z',
  },
  {
    id: 'q3',
    title: 'Mẹo phân chia Sprint và task trong đồ án SWP391 để không bị vỡ deadline tuần 8?',
    content: 'Nhóm em gồm 5 bạn, hiện tại đang bước vào Sprint 2 nhưng nhiều bạn chưa kịp commit code. Nhờ các tiền bối đã qua môn chia sẻ kinh nghiệm quản lý Jira và Git branching hiệu quả.',
    courseCode: 'SWP391',
    author: {
      id: 'usr-anon',
      fullName: 'Ẩn danh FPTer',
      role: 'Student',
      karma: 0,
      isAnonymous: true,
    },
    tags: ['swp391', 'agile', 'scrum', 'git-workflow'],
    upvotes: 56,
    downvotes: 2,
    userVote: 'UP',
    answersCount: 8,
    viewsCount: 870,
    isSolved: true,
    isModVerified: true,
    createdAt: '2026-03-14T09:00:00Z',
  },
];

export const mockArticles: TechArticle[] = [
  {
    id: 'a1',
    title: 'Hiểu sâu về Dependency Injection trong ASP.NET Core & Inversion of Control (IoC)',
    summary: 'Phân tích chi tiết vòng đời Scoped, Transient, Singleton và các lỗi thường gặp dẫn đến Memory Leak trong ứng dụng thực tế.',
    content: `## 1. Giới thiệu về Dependency Injection (DI)

Dependency Injection (DI) là một kỹ thuật triển khai nguyên lý Inversion of Control (IoC), giúp tách rời sự phụ thuộc giữa các class. Thay vì class tự khởi tạo đối tượng phụ thuộc của nó, đối tượng này sẽ được truyền (inject) từ bên ngoài vào qua Constructor.

### 2. Ba loại Vòng đời (Service Lifetimes)
* **Transient**: Tạo mới mỗi lần được yêu cầu (\`AddTransient\`). Thích hợp cho các service nhẹ không lưu state.
* **Scoped**: Tạo một instance duy nhất trong một HTTP Request (\`AddScoped\`). Rất phù hợp cho DbContext và Unit of Work.
* **Singleton**: Chỉ tạo duy nhất một instance trong toàn bộ vòng đời ứng dụng (\`AddSingleton\`). Cần cẩn trọng vấn đề Thread-safety.

\`\`\`csharp
// Đăng ký dịch vụ trong Program.cs
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
\`\`\`

### 3. Cảnh báo Captive Dependency
Lỗi phổ biến nhất là inject một **Scoped Service** vào trong một **Singleton Service**. Điều này khiến Scoped service bị sống dai như Singleton, dẫn đến lỗi stale data và rò rỉ bộ nhớ.`,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    category: 'Backend Development',
    tags: ['dotnet', 'csharp', 'architecture', 'best-practices'],
    author: {
      id: 'usr-3',
      fullName: 'Lê Hoàng Long',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Alumni',
    },
    readTimeMinutes: 6,
    viewsCount: 3420,
    likesCount: 215,
    bookmarksCount: 98,
    isBookmarked: true,
    isLiked: true,
    isSeries: true,
    seriesName: 'ASP.NET Core Master Series',
    createdAt: '2026-03-10T08:00:00Z',
  },
  {
    id: 'a2',
    title: 'Clean Architecture với CQRS và MediatR trong Microservices',
    summary: 'Hướng dẫn xây dựng hệ thống phân tán, phân tách rõ ràng Command và Query giúp tăng khả năng scale và dễ dàng bảo trì.',
    content: 'Bài viết chi tiết hướng dẫn setup MediatR, FluentValidation Pipeline Behavior và Event Driven Communication...',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    category: 'Software Architecture',
    tags: ['cqrs', 'mediatr', 'microservices', 'clean-architecture'],
    author: {
      id: 'usr-4',
      fullName: 'Phạm Minh Đức',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Community Moderator',
    },
    readTimeMinutes: 10,
    viewsCount: 2890,
    likesCount: 180,
    bookmarksCount: 120,
    createdAt: '2026-03-12T14:30:00Z',
  },
];

export const mockWorkflows: SharedWorkflow[] = [
  {
    id: 'wf1',
    title: 'Setup ASP.NET Core MVC CRUD với Entity Framework Core & Repository Pattern',
    description: 'Quy trình 5 bước chuẩn hóa để dựng khung backend CRUD đầy đủ cho đồ án PRN211/PRN231 từ Database First hoặc Code First.',
    courseCode: 'PRN211',
    technology: '.NET 8 / C#',
    steps: [
      {
        stepNumber: 1,
        title: 'Cài đặt NuGet Packages cần thiết',
        instruction: 'Chạy lệnh cài đặt các package EntityFrameworkCore, SqlServer, Tools.',
        codeSnippet: `dotnet add package Microsoft.EntityFrameworkCore.SqlServer\ndotnet add package Microsoft.EntityFrameworkCore.Tools\ndotnet add package Microsoft.EntityFrameworkCore.Design`,
        language: 'bash',
      },
      {
        stepNumber: 2,
        title: 'Cấu hình Connection String trong appsettings.json',
        instruction: 'Khai báo chuỗi kết nối an toàn trỏ đến SQL Server LocalDB hoặc máy chủ thực tế.',
        codeSnippet: `{\n  "ConnectionStrings": {\n    "DefaultConnection": "Server=localhost;Database=FHubDb;Trusted_Connection=True;TrustServerCertificate=True;"\n  }\n}`,
        language: 'json',
      },
      {
        stepNumber: 3,
        title: 'Đăng ký DbContext và Repository trong Program.cs',
        instruction: 'Khai báo service vào DI container để có thể inject vào Controller.',
        codeSnippet: `builder.Services.AddDbContext<AppDbContext>(options =>\n    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));\n\nbuilder.Services.AddScoped<ICampusRepository, CampusRepository>();`,
        language: 'csharp',
      },
      {
        stepNumber: 4,
        title: 'Chạy Migration tạo cơ sở dữ liệu',
        instruction: 'Tạo migration ban đầu và update schema vào database.',
        codeSnippet: `dotnet ef migrations add InitialCreate\ndotnet ef database update`,
        language: 'bash',
      },
    ],
    author: {
      id: 'usr-1',
      fullName: 'Nguyễn Văn A',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Student',
    },
    viewsCount: 3500,
    usageCount: 1200,
    tags: ['prn211', 'dotnet', 'efcore', 'crud', 'starter-kit'],
    createdAt: '2026-03-05T10:00:00Z',
  },
];

export const mockMaterials: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Tổng hợp 100 câu hỏi trắc nghiệm ôn tập PE & Final Exam PRN211',
    description: 'Bộ đề trắc nghiệm có đáp án chi tiết và giải thích cặn kẽ từng câu hỏi OOP, LINQ, Task và Event.',
    courseCode: 'PRN211',
    fileType: 'PDF',
    fileSizeMb: 4.8,
    downloadUrl: '#',
    downloadsCount: 1540,
    author: {
      id: 'usr-1',
      fullName: 'Nguyễn Văn A',
    },
    semesterUploaded: 'Spring 2026',
    createdAt: '2026-02-28T09:00:00Z',
  },
  {
    id: 'mat-2',
    title: 'Source Code mẫu Full Clean Architecture Template cho đồ án SWP391',
    description: 'Template dự án hoàn chỉnh gồm WebAPI, Application, Domain, Infrastructure, tích hợp sẵn Auth JWT và Swagger.',
    courseCode: 'SWP391',
    fileType: 'ZIP',
    fileSizeMb: 12.5,
    downloadUrl: '#',
    downloadsCount: 2310,
    author: {
      id: 'usr-3',
      fullName: 'Lê Hoàng Long',
    },
    semesterUploaded: 'Fall 2025',
    createdAt: '2026-01-15T15:30:00Z',
  },
];

export const mockMarketplaceListings: MarketplaceListing[] = [
  {
    id: 'm1',
    title: 'Bàn phím cơ FL-Esports MK870 Custom Switch Kailh Box White',
    description: 'Bàn phím cơ gõ cực êm tay cho dân code, layout 87 phím tiện bỏ balo đi học trên campus. Đầy đủ phụ kiện cáp Type-C.',
    price: 850000,
    currency: 'VND',
    category: 'Electronics',
    condition: 'LIKE NEW',
    status: 'AVAILABLE',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'],
    campus: 'HL',
    seller: {
      id: 'usr-2',
      fullName: 'Trần Thị B',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      studentId: 'HE172109',
      contactPhone: '0987654321',
      contactEmail: 'tranb.he172109@fpt.edu.vn',
    },
    viewsCount: 238,
    createdAt: '2026-03-14T11:00:00Z',
  },
  {
    id: 'm2',
    title: 'Trọn bộ Giáo trình CSD201 + MAS291 + PRN211 in màu đẹp',
    description: 'Mình đã pass môn nên nhượng lại cho bạn nào cần tài liệu bản cứng để take note khi lên lớp học.',
    price: 150000,
    currency: 'VND',
    category: 'Books',
    condition: 'GOOD',
    status: 'AVAILABLE',
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'],
    campus: 'HL',
    seller: {
      id: 'usr-1',
      fullName: 'Nguyễn Văn A',
      studentId: 'HE163421',
      contactPhone: '0912345678',
      contactEmail: 'nguyenvana.se@fpt.edu.vn',
    },
    viewsCount: 195,
    createdAt: '2026-03-15T08:30:00Z',
  },
];

export const mockCourseReviews: CourseReview[] = [
  {
    id: 'r1',
    courseCode: 'PRN211',
    reviewer: {
      id: 'usr-5',
      fullName: 'Vũ Đức Thịnh',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    rating: 5,
    workloadRating: 4,
    difficultyRating: 3,
    comment: 'Môn học cực kỳ thực tế và bổ ích. Thầy dạy rất tâm huyết, bài tập assignment bám sát đề thi Practical Exam. Nên luyện code thường xuyên trước buổi thi.',
    semesterTaken: 'Fall 2025',
    lecturerName: 'Thầy Trần Đình Khang',
    upvotes: 42,
    createdAt: '2026-01-20T14:00:00Z',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participant: {
      id: 'usr-2',
      fullName: 'Trần Thị B',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Student',
      isOnline: true,
    },
    lastMessage: 'Bạn ơi còn sách PRN211 không mình qua KTX lấy với ạ?',
    lastMessageAt: '10:45 AM',
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    participant: {
      id: 'usr-4',
      fullName: 'Phạm Minh Đức',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Community Moderator',
      isOnline: false,
    },
    lastMessage: 'Bài viết của bạn đã được gắn badge Mod Verified nhé!',
    lastMessageAt: 'Hôm qua',
    unreadCount: 0,
  },
];

export const mockNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Câu trả lời của bạn được chọn làm Best Answer!',
    message: 'Bạn đã nhận được +50 điểm Karma trong câu hỏi về Clean Architecture.',
    type: 'SUCCESS',
    linkUrl: '/discussions/q1',
    isRead: false,
    createdAt: '10 phút trước',
  },
  {
    id: 'notif-2',
    title: 'Cảnh báo lịch bảo trì hệ thống',
    message: 'Hệ thống FHub sẽ bảo trì định kỳ từ 00:00 đến 02:00 ngày Chủ Nhật.',
    type: 'WARNING',
    isRead: false,
    createdAt: '2 giờ trước',
  },
];

export const mockSupportTickets: SupportTicket[] = [
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
    repliesCount: 2,
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-16T11:30:00Z',
  },
];

export const mockAuditLogs: SystemAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-03-17 14:20:10',
    service: 'Academic taxonomy service',
    action: 'CREATE_CAMPUS',
    actorId: 'admin-1',
    actorEmail: 'admin.fhub@fpt.edu.vn',
    actorRole: 'Admin',
    ipAddress: '14.225.244.11',
    status: 'SUCCESS',
    details: 'Đã tạo Campus mới: FPT University Quy Nhơn (QN)',
  },
  {
    id: 'log-2',
    timestamp: '2026-03-17 13:45:00',
    service: 'Identity service',
    action: 'ASSIGN_POLICY_TO_ROLE',
    actorId: 'admin-1',
    actorEmail: 'admin.fhub@fpt.edu.vn',
    actorRole: 'Admin',
    ipAddress: '14.225.244.11',
    status: 'SUCCESS',
    details: 'Gán Policy CAN_LOCK_DISCUSSION cho Role Community Moderator',
  },
];

export const mockHealthStatuses: ServiceHealthStatus[] = [
  { serviceName: 'Identity Service', status: 'HEALTHY', uptimePercentage: 99.98, latencyMs: 24, lastChecked: '1 phút trước' },
  { serviceName: 'Academic Taxonomy Service', status: 'HEALTHY', uptimePercentage: 99.95, latencyMs: 18, lastChecked: '1 phút trước' },
  { serviceName: 'Content Service', status: 'HEALTHY', uptimePercentage: 99.92, latencyMs: 32, lastChecked: '1 phút trước' },
  { serviceName: 'Interaction Service', status: 'HEALTHY', uptimePercentage: 99.99, latencyMs: 15, lastChecked: '1 phút trước' },
  { serviceName: 'Storage Service', status: 'HEALTHY', uptimePercentage: 99.85, latencyMs: 45, lastChecked: '1 phút trước' },
  { serviceName: 'Governance Service', status: 'HEALTHY', uptimePercentage: 100.0, latencyMs: 20, lastChecked: '1 phút trước' },
  { serviceName: 'Marketplace Service', status: 'HEALTHY', uptimePercentage: 99.90, latencyMs: 28, lastChecked: '1 phút trước' },
];
