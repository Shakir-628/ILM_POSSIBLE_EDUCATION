import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StudentsListScreen from '../screens/admin/StudentsListScreen';
import StudentDetailScreen from '../screens/admin/StudentDetailScreen';
import TeachersListScreen from '../screens/admin/TeachersListScreen';
import ClassesListScreen from '../screens/admin/ClassesListScreen';
import ParentsListScreen from '../screens/admin/ParentsListScreen';
import AnnouncementsScreen from '../screens/admin/AnnouncementsScreen';
import AnnouncementDetailScreen from '../screens/admin/AnnouncementDetailScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import FinanceScreen from '../screens/admin/FinanceScreen';
import FeeManagementScreen from '../screens/admin/FeeManagementScreen';
import ClassGradeHistoryScreen from '../screens/admin/ClassGradeHistoryScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import ChangePasswordScreen from '../screens/admin/ChangePasswordScreen';
import HelpSupportScreen from '../screens/admin/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/admin/PrivacyPolicyScreen';
import AboutAppScreen from '../screens/admin/AboutAppScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Students':
              iconName = focused ? 'school' : 'school-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Students" component={StudentsListScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
};

const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="AboutApp" component={AboutAppScreen} />
      <Stack.Screen name="StudentsList" component={StudentsListScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="TeachersList" component={TeachersListScreen} />
      <Stack.Screen name="ClassesList" component={ClassesListScreen} />
      <Stack.Screen name="ParentsList" component={ParentsListScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="FeeManagement" component={FeeManagementScreen} />
      <Stack.Screen name="Accounting" component={FinanceScreen} />
      <Stack.Screen name="ClassGradeHistory" component={ClassGradeHistoryScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;

