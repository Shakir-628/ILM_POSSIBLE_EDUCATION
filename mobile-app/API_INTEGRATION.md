# API Integration Guide

## Overview

The mobile app integrates with the existing School Management System backend APIs. All services are located in `src/services/` directory.

## Architecture

```
Mobile App → Services → API Client (Axios) → Backend Server
```

## Configuration

### Base URL Setup

**File:** `src/services/api.js`

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-production-api.com/api';  // Production

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Available Services

### 1. Authentication Service

**File:** `src/services/authService.js`

```javascript
import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
```

### 2. Student Service

**File:** `src/services/studentService.js`

```javascript
export const studentService = {
  // Get all students
  getAllStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  // Get student by ID
  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Search students
  searchStudents: async (query) => {
    const response = await api.get('/students/search', {
      params: { q: query },
    });
    return response.data;
  },
};
```

### 3. Attendance Service

**File:** `src/services/attendanceService.js`

```javascript
export const attendanceService = {
  // Get my attendance
  getMyAttendance: async (params) => {
    const response = await api.get('/attendance/my-attendance', { params });
    return response.data;
  },

  // Get attendance stats
  getAttendanceStats: async (studentId) => {
    const response = await api.get(`/attendance/stats/${studentId}`);
    return response.data;
  },

  // Mark attendance (Teacher)
  markAttendance: async (data) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },
};
```

### 4. Assignment Service

**File:** `src/services/assignmentService.js`

```javascript
export const assignmentService = {
  // Get my assignments
  getMyAssignments: async () => {
    const response = await api.get('/assignments/my-assignments');
    return response.data;
  },

  // Get assignment by ID
  getAssignmentById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  // Submit assignment
  submitAssignment: async (id, data) => {
    const response = await api.post(`/assignments/${id}/submit`, data);
    return response.data;
  },

  // Create assignment (Teacher)
  createAssignment: async (data) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },
};
```

### 5. Grade Service

**File:** `src/services/gradeService.js`

```javascript
export const gradeService = {
  // Get my grades
  getMyGrades: async () => {
    const response = await api.get('/grades/my-grades');
    return response.data;
  },

  // Get grades by student ID
  getGradesByStudentId: async (studentId) => {
    const response = await api.get(`/grades/student/${studentId}`);
    return response.data;
  },

  // Create grade (Teacher)
  createGrade: async (data) => {
    const response = await api.post('/grades', data);
    return response.data;
  },
};
```

### 6. Fee Service

**File:** `src/services/feeService.js`

```javascript
export const feeService = {
  // Get my fees
  getMyFees: async () => {
    const response = await api.get('/fees/my-fees');
    return response.data;
  },

  // Pay fee
  payFee: async (feeId, data) => {
    const response = await api.post(`/fees/${feeId}/pay`, data);
    return response.data;
  },

  // Get fee history
  getFeeHistory: async () => {
    const response = await api.get('/fees/history');
    return response.data;
  },
};
```

### 7. Timetable Service

**File:** `src/services/timetableService.js`

```javascript
export const timetableService = {
  // Get my timetable
  getMyTimetable: async () => {
    const response = await api.get('/timetable/my-timetable');
    return response.data;
  },

  // Get timetable by class
  getTimetableByClass: async (classId) => {
    const response = await api.get(`/timetable/class/${classId}`);
    return response.data;
  },
};
```

### 8. Announcement Service

**File:** `src/services/announcementService.js`

```javascript
export const announcementService = {
  // Get all announcements
  getAllAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  // Create announcement (Admin)
  createAnnouncement: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },
};
```

---

## Usage in Components

### Example: Fetching Data

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';

const AttendanceScreen = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const data = await attendanceService.getMyAttendance();
      setAttendance(data);
    } catch (error) {
      toast.error('Failed to load attendance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <View>
      {attendance.map((record) => (
        <Text key={record._id}>{record.status}</Text>
      ))}
    </View>
  );
};
```

### Example: Posting Data

```javascript
import { assignmentService } from '../services/assignmentService';

const submitAssignment = async (assignmentId, submissionData) => {
  try {
    const result = await assignmentService.submitAssignment(
      assignmentId,
      submissionData
    );
    toast.success('Assignment submitted successfully!');
    return result;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      toast.error(error.response.data.message);
    } else if (error.request) {
      // No response received
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Something went wrong');
    }
  }
};
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Show success message |
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show access denied |
| 404 | Not Found | Show not found message |
| 500 | Server Error | Show error message |

### Global Error Handler

```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server error
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.response.data.message || 'Something went wrong.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your internet connection.';
  } else {
    return 'An unexpected error occurred.';
  }
};
```

---

## Authentication Flow

### 1. Login Process

```javascript
// 1. User submits credentials
const handleLogin = async (email, password) => {
  try {
    // 2. Call auth service
    const response = await authService.login(email, password);
    
    // 3. Store token and user data
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    
    // 4. Update auth context
    setUser(response.user);
    setIsAuthenticated(true);
    
    // 5. Navigate to appropriate screen based on role
    if (response.user.role === 'student') {
      navigation.navigate('StudentDashboard');
    } else if (response.user.role === 'teacher') {
      navigation.navigate('TeacherDashboard');
    }
    
    toast.success('Login successful!');
  } catch (error) {
    toast.error(handleApiError(error));
  }
};
```

### 2. Auto-Login on App Start

```javascript
useEffect(() => {
  checkAuth();
}, []);

const checkAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  } catch (error) {
    console.error('Auto-login failed:', error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Logout Process

```javascript
const handleLogout = async () => {
  try {
    // Clear local storage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    
    // Update context
    setUser(null);
    setIsAuthenticated(false);
    
    // Navigate to login
    navigation.navigate('Login');
    
    toast.success('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

---

## API Testing

### Using Postman

1. Import backend API collection
2. Set base URL: `http://localhost:5000/api`
3. Add authentication token to headers
4. Test endpoints before integrating

### Testing in Development

```javascript
// Add console logs
console.log('API Request:', config);
console.log('API Response:', response.data);

// Use React Native Debugger
// Enable network inspect in Chrome DevTools
```

---

## Performance Optimization

### 1. Request Caching

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCachedData = async (key) => {
  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
};

const setCachedData = async (key, data) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};
```

### 2. Debouncing Search

```javascript
import { useDebounce } from '../hooks/useDebounce';

const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchStudents(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 3. Request Cancellation

```javascript
useEffect(() => {
  const source = axios.CancelToken.source();

  const fetchData = async () => {
    try {
      const response = await api.get('/students', {
        cancelToken: source.token,
      });
      setData(response.data);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error(error);
      }
    }
  };

  fetchData();

  return () => {
    source.cancel('Component unmounted');
  };
}, []);
```

---

## Security Best Practices

1. ✅ Store tokens securely in AsyncStorage
2. ✅ Use HTTPS in production
3. ✅ Implement token refresh
4. ✅ Validate input on client side
5. ✅ Handle sensitive data carefully
6. ✅ Implement rate limiting
7. ✅ Log errors without exposing sensitive info
8. ✅ Use environment variables for API URLs

---

## Contact

**Developer:** Muhammad Shakir  
**Email:** mshakir628@gmail.com  
**Phone:** 0323-2207839

