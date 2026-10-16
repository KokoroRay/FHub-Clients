import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  FeedTab: undefined;
  CoursesTab: undefined;
  DiscussionsTab: undefined;
  ResourcesTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  // Main Tab Container
  Main: NavigatorScreenParams<MainTabParamList>;

  // Auth Screens
  Login: undefined;
  Register: undefined;

  // Detail & Action Screens
  CourseDetail: { code: string };
  QuestionDetail: { id: string };
  AskQuestion: undefined;
  ArticleDetail: { id: string };
  WorkflowDetail: { id: string };
  SupportTickets: undefined;
  SupportTicketDetail: { id: string };
  CreateTicket: undefined;
  Bookmarks: undefined;
  Notifications: undefined;
  Settings: undefined;
};
