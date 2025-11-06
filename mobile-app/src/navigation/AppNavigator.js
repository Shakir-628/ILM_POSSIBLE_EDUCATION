import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

// Navigators
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import TeacherNavigator from './TeacherNavigator';
import ParentNavigator from './ParentNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Debug logging
  console.log('AppNavigator render:', { isAuthenticated, user: user?.role, loading });

  if (loading) {
    return <Loading message="Loading ILM Possible..." />;
  }

  // Get role-specific navigator
  const getRoleNavigator = () => {
    if (!user) {
      console.log('No user found, returning null');
      return null;
    }

    console.log('Getting navigator for role:', user.role);
    
    switch (user.role) {
      case 'student':
        return <Stack.Screen name="StudentMain" component={StudentNavigator} options={{ headerShown: false }} />;
      case 'teacher':
        return <Stack.Screen name="TeacherMain" component={TeacherNavigator} options={{ headerShown: false }} />;
      case 'parent':
        return <Stack.Screen name="ParentMain" component={ParentNavigator} options={{ headerShown: false }} />;
      case 'admin':
      case 'superadmin':
        return <Stack.Screen name="AdminMain" component={AdminNavigator} options={{ headerShown: false }} />;
      default:
        console.log('Unknown role, defaulting to Student');
        return <Stack.Screen name="StudentMain" component={StudentNavigator} options={{ headerShown: false }} />;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        getRoleNavigator()
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

