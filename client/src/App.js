import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Fees from './pages/Fees';
import FeeManagement from './pages/FeeManagement';
import Admissions from './pages/Admissions';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import Subjects from './pages/Subjects';
import Events from './pages/Events';
import Calendar from './pages/Calendar';
import SchoolProfile from './pages/settings/SchoolProfile';
import UserRoles from './pages/settings/UserRoles';
import BackupSecurity from './pages/settings/BackupSecurity';
import SystemSettings from './pages/settings/SystemSettings';
import TeacherPerformance from './pages/TeacherPerformance';
import TeacherPayroll from './pages/TeacherPayroll';
import ExamSchedule from './pages/ExamSchedule';
import ReportCards from './pages/ReportCards';
import SystemLogs from './pages/SystemLogs';
import AuditLogs from './pages/AuditLogs';
import Announcements from './pages/Announcements';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import BulkCommunication from './pages/BulkCommunication';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute roles={['admin', 'teacher']}>
              <Students />
            </PrivateRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <PrivateRoute roles={['admin']}>
              <Teachers />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher-performance"
          element={
            <PrivateRoute roles={['admin']}>
              <TeacherPerformance />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher-payroll"
          element={
            <PrivateRoute roles={['admin']}>
              <TeacherPayroll />
            </PrivateRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <PrivateRoute roles={['admin', 'teacher']}>
              <Classes />
            </PrivateRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <PrivateRoute roles={['admin', 'teacher']}>
              <Subjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <Attendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <PrivateRoute>
              <Grades />
            </PrivateRoute>
          }
        />
        <Route
          path="/exam-schedule"
          element={
            <PrivateRoute>
              <ExamSchedule />
            </PrivateRoute>
          }
        />
        <Route
          path="/report-cards"
          element={
            <PrivateRoute>
              <ReportCards />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute roles={['admin', 'teacher']}>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute roles={['admin', 'teacher']}>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <PrivateRoute>
              <Fees />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-management"
          element={
            <PrivateRoute roles={['admin']}>
              <FeeManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admissions"
          element={
            <PrivateRoute roles={['admin']}>
              <Admissions />
            </PrivateRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <PrivateRoute>
              <Timetable />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <PrivateRoute>
              <Assignments />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignments/:assignmentId/submissions"
          element={
            <PrivateRoute roles={['admin', 'teacher']}>
              <AssignmentSubmissions />
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/school"
          element={
            <PrivateRoute roles={['admin']}>
              <SchoolProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/roles"
          element={
            <PrivateRoute roles={['admin']}>
              <UserRoles />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/backup"
          element={
            <PrivateRoute roles={['admin']}>
              <BackupSecurity />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/system"
          element={
            <PrivateRoute roles={['admin']}>
              <SystemSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-logs"
          element={
            <PrivateRoute roles={['superadmin']}>
              <SystemLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <PrivateRoute roles={['superadmin', 'admin']}>
              <AuditLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <PrivateRoute>
              <Announcements />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/bulk-communication"
          element={
            <PrivateRoute roles={['admin', 'superadmin']}>
              <BulkCommunication />
            </PrivateRoute>
          }
        />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

