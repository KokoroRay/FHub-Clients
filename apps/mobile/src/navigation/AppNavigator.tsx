import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { CourseDetailScreen } from '../screens/courses/CourseDetailScreen';
import { QuestionDetailScreen } from '../screens/discussions/QuestionDetailScreen';
import { AskQuestionScreen } from '../screens/discussions/AskQuestionScreen';
import { ArticleDetailScreen } from '../screens/resources/ArticleDetailScreen';
import { WorkflowDetailScreen } from '../screens/resources/WorkflowDetailScreen';
import { SupportTicketListScreen } from '../screens/tickets/SupportTicketListScreen';
import { SupportTicketDetailScreen } from '../screens/tickets/SupportTicketDetailScreen';
import { CreateTicketScreen } from '../screens/tickets/CreateTicketScreen';
import { BookmarksScreen } from '../screens/profile/BookmarksScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
          <Stack.Screen name="AskQuestion" component={AskQuestionScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
          <Stack.Screen name="WorkflowDetail" component={WorkflowDetailScreen} />
          <Stack.Screen name="SupportTickets" component={SupportTicketListScreen} />
          <Stack.Screen name="SupportTicketDetail" component={SupportTicketDetailScreen} />
          <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
