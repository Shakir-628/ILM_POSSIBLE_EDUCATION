# Project Structure

## Directory Overview

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── student/       # Student screens
│   │   ├── teacher/       # Teacher screens
│   │   ├── parent/        # Parent screens
│   │   └── admin/         # Admin screens
│   ├── services/          # API service layer
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, etc.
├── App.js                 # Root component
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json          # Dependencies
└── README.md            # Documentation
```

---

## Detailed Structure

### `/src/components/` - Reusable UI Components

```
components/
├── CustomButton.js       # Button component with variants
├── CustomCard.js         # Card wrapper component
├── CustomInput.js        # Input field component
├── StatCard.js          # Statistics display card
├── Loading.js           # Loading indicator
└── EmptyState.js        # Empty state placeholder
```

**Purpose:** Reusable UI components used across different screens

**Usage Example:**
```javascript
import CustomButton from '../components/CustomButton';

<CustomButton
  title="Login"
  onPress={handleLogin}
  variant="primary"
  fullWidth
/>
```

---

### `/src/context/` - State Management

```
context/
├── AuthContext.js        # Authentication state
└── ToastContext.js       # Toast notifications
```

**AuthContext:**
- Manages user authentication state
- Handles login/logout
- Provides user data to components

**ToastContext:**
- Shows success/error/info messages
- Global notification system

**Usage Example:**
```javascript
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const { user, login, logout } = useAuth();
const toast = useToast();

toast.success('Login successful!');
```

---

### `/src/navigation/` - Navigation Structure

```
navigation/
├── AppNavigator.js       # Main navigation router
├── AuthNavigator.js      # Auth flow navigation
├── StudentNavigator.js   # Student tab navigation
├── TeacherNavigator.js   # Teacher tab navigation
├── ParentNavigator.js    # Parent tab navigation
└── AdminNavigator.js     # Admin tab navigation
```

**Navigation Hierarchy:**
```
AppNavigator (Root)
├── AuthNavigator (Stack)
│   ├── Login
│   ├── Register
│   └── ForgotPassword
├── StudentNavigator (Tabs)
│   ├── Dashboard
│   ├── Attendance
│   ├── Timetable
│   ├── Assignments
│   ├── Grades
│   └── Profile
├── TeacherNavigator (Tabs)
│   ├── Dashboard
│   ├── MarkAttendance
│   ├── GradeEntry
│   └── Profile
├── ParentNavigator (Tabs)
│   ├── Dashboard
│   ├── Children
│   ├── Fees
│   └── Profile
└── AdminNavigator (Tabs)
    ├── Dashboard
    ├── Students
    ├── Announcements
    └── Profile
```

---

### `/src/screens/` - Screen Components

#### Authentication Screens
```
screens/auth/
├── LoginScreen.js
├── RegisterScreen.js
└── ForgotPasswordScreen.js
```

#### Student Screens
```
screens/student/
├── StudentDashboardScreen.js
├── AttendanceScreen.js
├── TimetableScreen.js
├── AssignmentsScreen.js
├── GradesScreen.js
└── ProfileScreen.js
```

#### Teacher Screens
```
screens/teacher/
├── TeacherDashboardScreen.js
├── MarkAttendanceScreen.js
├── GradeEntryScreen.js
└── TeacherProfileScreen.js
```

#### Parent Screens
```
screens/parent/
├── ParentDashboardScreen.js
├── ChildrenScreen.js
├── ParentFeesScreen.js
└── ParentProfileScreen.js
```

#### Admin Screens
```
screens/admin/
├── AdminDashboardScreen.js
├── StudentsListScreen.js
├── AnnouncementsScreen.js
└── AdminProfileScreen.js
```

---

### `/src/services/` - API Integration Layer

```
services/
├── api.js                    # Axios instance & interceptors
├── authService.js            # Authentication APIs
├── studentService.js         # Student management APIs
├── attendanceService.js      # Attendance APIs
├── assignmentService.js      # Assignment APIs
├── gradeService.js          # Grade management APIs
├── feeService.js            # Fee management APIs
├── timetableService.js      # Timetable APIs
└── announcementService.js   # Announcement APIs
```

**Service Structure:**
```javascript
// Example: attendanceService.js
export const attendanceService = {
  getMyAttendance: async (params) => {
    const response = await api.get('/attendance/my-attendance', { params });
    return response.data;
  },
  // ... more methods
};
```

---

### `/src/utils/` - Utility Functions

```
utils/
├── theme.js              # Color scheme & theme
├── constants.js          # App constants
└── storage.js           # AsyncStorage helpers
```

**theme.js:**
- Color palettes
- Font sizes
- Spacing constants

**constants.js:**
- API URLs
- App configuration
- Role definitions

**storage.js:**
- Helper functions for AsyncStorage
- Token management
- Data persistence

---

## File Naming Conventions

### Components
- **PascalCase** for component files: `CustomButton.js`
- **PascalCase** for component names: `CustomButton`
- Export default at the end

### Screens
- **PascalCase** with "Screen" suffix: `LoginScreen.js`
- Organized by user role in subdirectories

### Services
- **camelCase** with "Service" suffix: `authService.js`
- Export named object: `export const authService = {...}`

### Utils
- **camelCase**: `theme.js`, `storage.js`
- Export named functions or objects

---

## Code Organization Best Practices

### 1. Component Structure
```javascript
// Imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Component
const MyComponent = () => {
  // Hooks
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Event handlers
  const handlePress = () => {
    // Handler logic
  };

  // Render
  return (
    <View style={styles.container}>
      <Text>Content</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Export
export default MyComponent;
```

### 2. Service Structure
```javascript
import api from './api';

export const myService = {
  // GET requests
  getAll: async () => {
    const response = await api.get('/endpoint');
    return response.data;
  },

  // POST requests
  create: async (data) => {
    const response = await api.post('/endpoint', data);
    return response.data;
  },

  // PUT requests
  update: async (id, data) => {
    const response = await api.put(`/endpoint/${id}`, data);
    return response.data;
  },

  // DELETE requests
  delete: async (id) => {
    const response = await api.delete(`/endpoint/${id}`);
    return response.data;
  },
};
```

### 3. Screen Structure
```javascript
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';

// Custom components
import CustomCard from '../../components/CustomCard';
import Loading from '../../components/Loading';

// Services
import { myService } from '../../services/myService';

// Context
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MyScreen = ({ navigation }) => {
  // Context
  const { user } = useAuth();
  const toast = useToast();

  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Effects
  useEffect(() => {
    fetchData();
  }, []);

  // Data fetching
  const fetchData = async () => {
    try {
      const result = await myService.getAll();
      setData(result);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Event handlers
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Loading state
  if (loading) return <Loading />;

  // Render
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Content */}
    </ScrollView>
  );
};

export default MyScreen;
```

---

## Adding New Features

### 1. Adding a New Screen

```bash
# Create screen file
src/screens/role/NewScreen.js

# Add to navigation
src/navigation/RoleNavigator.js

# Create service (if needed)
src/services/newService.js
```

### 2. Adding a New Component

```bash
# Create component file
src/components/NewComponent.js

# Import in screen
import NewComponent from '../components/NewComponent';
```

### 3. Adding a New Service

```bash
# Create service file
src/services/newService.js

# Import in screen
import { newService } from '../services/newService';
```

---

## Environment-Specific Configuration

### Development
- API URL: `http://localhost:5000/api`
- Debug mode: enabled
- Hot reload: enabled

### Production
- API URL: Production server URL
- Debug mode: disabled
- Performance optimization: enabled

---

## Asset Management

```
assets/
├── images/
│   ├── logo.png
│   ├── splash.png
│   └── icon.png
├── fonts/
│   └── CustomFont.ttf
└── animations/
    └── loading.json
```

---

## Dependencies Management

### Core Dependencies
- `react-native`: UI framework
- `expo`: Development platform
- `@react-navigation/*`: Navigation
- `axios`: HTTP client
- `@react-native-async-storage/async-storage`: Local storage

### UI Dependencies
- `expo-linear-gradient`: Gradient backgrounds
- `@expo/vector-icons`: Icons
- `react-native-qrcode-svg`: QR codes
- `react-native-calendars`: Calendar component

---

## Testing Structure (Future)

```
__tests__/
├── components/
├── screens/
├── services/
└── utils/
```

---

## Build Artifacts

```
.expo/
.expo-shared/
node_modules/
ios/
android/
```

**Note:** These are generated and should not be committed to version control.

---

## Documentation Files

```
mobile-app/
├── README.md                 # Main documentation
├── QUICK_START.md           # Quick start guide
├── FEATURES.md              # Features list
├── TROUBLESHOOTING.md       # Troubleshooting guide
├── DEPLOYMENT.md            # Deployment guide
├── API_INTEGRATION.md       # API documentation
├── PROJECT_STRUCTURE.md     # This file
└── CHANGELOG.md             # Version history
```

---

## Contact

**Developer:** Muhammad Shakir  
**Email:** mshakir628@gmail.com  
**Phone:** 0323-2207839  
**WhatsApp:** +92 343 346 3246

