// API Configuration
export const API_URL = __DEV__ 
  ? 'http://192.168.0.103:5001/api' // Android Emulator 172.17.40.238, 192.168.0.104
  : 'https://your-production-api.com/api';

// Socket.IO Configuration (without /api suffix)
export const SOCKET_URL = __DEV__ 
  ? 'http://192.168.0.103:5001' // Match your API_URL but without /api
  : 'https://your-production-api.com';

// For iOS Simulator, use: http://localhost:5001/api
// For Real Device, use your computer's IP: http://192.168.1.x:5001/api

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  LEAVE: 'Leave',
};

export const PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Mathematics',
  'History',
  'Geography',
  'Literature',
  'Reference',
  'Textbook',
  'Magazine',
  'Other',
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const TIME_SLOTS = [
  { label: '08:00 - 08:45', value: '08:00' },
  { label: '08:45 - 09:30', value: '08:45' },
  { label: '09:30 - 10:15', value: '09:30' },
  { label: '10:30 - 11:15', value: '10:30' },
  { label: '11:15 - 12:00', value: '11:15' },
  { label: '12:00 - 12:45', value: '12:00' },
  { label: '13:00 - 13:45', value: '13:00' },
  { label: '13:45 - 14:30', value: '13:45' },
];

