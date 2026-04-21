import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PermissionProvider } from './context/PermissionContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import QRVerification from './pages/QRVerification';
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
import RolePermissions from './pages/settings/RolePermissions';
import TeacherPerformance from './pages/TeacherPerformance';
import TeacherPayroll from './pages/TeacherPayroll';
import ExamSchedule from './pages/ExamSchedule';
import ReportCards from './pages/ReportCards';
import ExamAnalytics from './pages/ExamAnalytics';
import SystemLogs from './pages/SystemLogs';
import AuditLogs from './pages/AuditLogs';
import Announcements from './pages/Announcements';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherSchedule from './pages/TeacherSchedule';
import BulkCommunication from './pages/BulkCommunication';
import Assets from './pages/Assets';
import Maintenance from './pages/Maintenance';
import InventoryReports from './pages/InventoryReports';
import Parents from './pages/Parents';
import Accounting from './pages/Accounting';
import IncomeReports from './pages/IncomeReports';
import TeacherIDCards from './pages/TeacherIDCards';
import StudentIDCards from './pages/StudentIDCards';
import Certificates from './pages/Certificates';
import CertificateTemplates from './pages/CertificateTemplates';
import Library from './pages/Library';
import LibraryIssues from './pages/LibraryIssues';
import Transport from './pages/Transport';
import Hostel from './pages/Hostel';
import AIExams from './pages/AIExams';
import EPortfolio from './pages/EPortfolio';
import OnlineClasses from './pages/OnlineClasses';
import MyClass from './pages/MyClass';
// AI Exam Components
import CreateExam from './components/CreateExam';
import StudentExamTaking from './components/StudentExamTaking';
import ExamResults from './components/ExamResults';
import MarketingPreview from './pages/MarketingPreview';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PermissionProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/qr-verification" element={<QRVerification />} />
              <Route path="/marketing-preview" element={<MarketingPreview />} />

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
                path="/student-id-cards"
                element={
                  <PrivateRoute roles={['admin']}>
                    <StudentIDCards />
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
                path="/teacher-id-cards"
                element={
                  <PrivateRoute roles={['admin']}>
                    <TeacherIDCards />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher-attendance"
                element={
                  <PrivateRoute roles={['admin']}>
                    <TeacherAttendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher-schedule"
                element={
                  <PrivateRoute roles={['admin', 'teacher']}>
                    <TeacherSchedule />
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
                path="/exam-analytics"
                element={
                  <PrivateRoute roles={['superadmin', 'admin', 'teacher']}>
                    <ExamAnalytics />
                  </PrivateRoute>
                }
              />
              {/* AI Exam Routes */}
              <Route
                path="/ai-exams"
                element={
                  <PrivateRoute roles={['admin', 'teacher', 'student']}>
                    <AIExams />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exams/create"
                element={
                  <PrivateRoute roles={['admin', 'teacher']}>
                    <CreateExam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exams/:examId/edit"
                element={
                  <PrivateRoute roles={['admin', 'teacher']}>
                    <CreateExam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exams/:examId/take/:attemptId?"
                element={
                  <PrivateRoute roles={['admin', 'teacher', 'student']}>
                    <StudentExamTaking />
                  </PrivateRoute>
                }
              />
              <Route
                path="/exam-results/:attemptId"
                element={
                  <PrivateRoute roles={['admin', 'teacher', 'student']}>
                    <ExamResults />
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
                path="/reports/student"
                element={
                  <PrivateRoute roles={['admin', 'teacher']}>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/attendance"
                element={
                  <PrivateRoute roles={['admin', 'teacher']}>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/financial"
                element={
                  <PrivateRoute roles={['admin']}>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/custom"
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
                path="/accounting"
                element={
                  <PrivateRoute roles={['admin']}>
                    <Accounting />
                  </PrivateRoute>
                }
              />
              <Route
                path="/income-reports"
                element={
                  <PrivateRoute roles={['admin']}>
                    <IncomeReports />
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
                path="/settings/role-permissions"
                element={
                  <PrivateRoute roles={['superadmin', 'admin']}>
                    <RolePermissions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/system-logs"
                element={
                  <PrivateRoute roles={['superadmin', 'admin']}>
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
                path="/communication/bulk"
                element={
                  <PrivateRoute roles={['admin', 'superadmin']}>
                    <BulkCommunication />
                  </PrivateRoute>
                }
              />
              <Route
                path="/parents"
                element={
                  <PrivateRoute roles={['admin', 'superadmin']}>
                    <Parents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assets"
                element={
                  <PrivateRoute roles={['admin', 'superadmin', 'teacher']} module="Inventory">
                    <Assets />
                  </PrivateRoute>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <PrivateRoute roles={['admin', 'superadmin', 'teacher']} module="Inventory">
                    <Maintenance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/inventory-reports"
                element={
                  <PrivateRoute roles={['admin', 'superadmin', 'teacher']} module="Inventory">
                    <InventoryReports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/certificates"
                element={
                  <PrivateRoute>
                    <Certificates />
                  </PrivateRoute>
                }
              />
              <Route
                path="/documents/templates"
                element={
                  <PrivateRoute roles={['admin']}>
                    <CertificateTemplates />
                  </PrivateRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <PrivateRoute>
                    <Library />
                  </PrivateRoute>
                }
              />
              <Route
                path="/library/issues"
                element={
                  <PrivateRoute>
                    <LibraryIssues />
                  </PrivateRoute>
                }
              />
              <Route
                path="/transport"
                element={
                  <PrivateRoute roles={['admin', 'superadmin']}>
                    <Transport />
                  </PrivateRoute>
                }
              />
              <Route
                path="/hostel"
                element={
                  <PrivateRoute roles={['admin', 'superadmin']}>
                    <Hostel />
                  </PrivateRoute>
                }
              />
              <Route
                path="/e-portfolio"
                element={
                  <PrivateRoute>
                    <EPortfolio />
                  </PrivateRoute>
                }
              />
              <Route
                path="/online-classes"
                element={
                  <PrivateRoute>
                    <OnlineClasses />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-class"
                element={
                  <PrivateRoute roles={['student']}>
                    <MyClass />
                  </PrivateRoute>
                }
              />

              {/* Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </PermissionProvider>
        </AuthProvider>
      </ToastProvider >
    </ThemeProvider>
  );
}

export default App;
