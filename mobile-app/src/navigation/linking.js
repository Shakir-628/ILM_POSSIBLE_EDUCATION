import * as Linking from 'expo-linking';

const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Auth: {
                screens: {
                    Login: 'login',
                    Register: 'register',
                    ForgotPassword: 'forgot-password',
                },
            },
            StudentMain: {
                screens: {
                    Dashboard: 'student/dashboard',
                    Grades: 'student/grades',
                    Notifications: 'student/notifications',
                    Announcements: 'student/announcements',
                    Profile: 'student/profile',
                },
            },
            TeacherMain: {
                screens: {
                    TeacherTabs: {
                        screens: {
                            Dashboard: 'teacher/dashboard',
                            Attendance: 'teacher/attendance',
                            Grades: 'teacher/grades',
                            Notifications: 'teacher/notifications',
                            Profile: 'teacher/profile',
                        },
                    },
                    ClassGradeHistory: 'teacher/class-grades',
                },
            },
            ParentMain: {
                screens: {
                    ParentTabs: {
                        screens: {
                            Dashboard: 'parent/dashboard',
                            Children: 'parent/children',
                            Fees: 'parent/fees',
                            Notifications: 'parent/notifications',
                            Profile: 'parent/profile',
                        },
                    },
                    ChildDetails: 'parent/child-details',
                },
            },
            AdminMain: {
                screens: {
                    AdminTabs: {
                        screens: {
                            Dashboard: 'admin/dashboard',
                            Students: 'admin/students',
                            Notifications: 'admin/notifications',
                            Profile: 'admin/profile',
                        },
                    },
                    Settings: 'admin/settings',
                    ChangePassword: 'admin/change-password',
                    HelpSupport: 'admin/help',
                    PrivacyPolicy: 'admin/privacy',
                    AboutApp: 'admin/about',
                    StudentsList: 'admin/students-list',
                    TeachersList: 'admin/teachers-list',
                    ClassesList: 'admin/classes-list',
                    ParentsList: 'admin/parents-list',
                    Announcements: 'admin/announcements',
                    AnnouncementDetail: 'admin/announcement-detail',
                    Finance: 'admin/finance',
                    FeeManagement: 'admin/fees',
                    Accounting: 'admin/accounting',
                    ClassGradeHistory: 'admin/grade-history',
                },
            },
            // Fallback for not found
            NotFound: '*',
        },
    },
    documentTitle: {
        formatter: (options, route) => {
            return options?.title || options?.headerTitle || route?.name || 'ILM Possible Education';
        },
    },
};

export default linking;
