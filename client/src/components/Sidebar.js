import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ChartPieIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ServerIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, isSuperAdmin, isAdmin, isTeacher, isStudent } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // Auto-expand menu when navigating to a page within it
  useEffect(() => {
    const path = location.pathname;
    const newOpenMenus = { ...openMenus };

    if (path.includes('/students') || path.includes('/admissions')) {
      newOpenMenus.Students = true;
    }
    if (path.includes('/timetable') || path.includes('/assignments') || path.includes('/subjects')) {
      newOpenMenus.Academic = true;
    }
    if (path.includes('/exam-schedule') || path.includes('/report-cards') || path.includes('/grades')) {
      newOpenMenus.Examinations = true;
    }
    if (path.includes('/events') || path.includes('/calendar')) {
      newOpenMenus['Events & Calendar'] = true;
    }
    if (path.includes('/announcements') || path.includes('/messages') || path.includes('/notifications') || path.includes('/bulk-communication')) {
      newOpenMenus.Communication = true;
    }
    if (path.includes('/settings')) {
      newOpenMenus.Settings = true;
    }
    if (path.includes('/teacher-performance') || path.includes('/teacher-payroll') || path.includes('/teachers')) {
      newOpenMenus.Teachers = true;
    }

    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

  const getNavigation = () => {
    const navigation = [
      { 
        name: 'Dashboard', 
        href: '/dashboard', 
        icon: HomeIcon, 
        roles: ['admin', 'teacher', 'student'] 
      },
    ];

    // Students Menu (with submenu)
    if (isAdmin || isTeacher) {
      navigation.push({
        name: 'Students',
        icon: AcademicCapIcon,
        roles: ['admin', 'teacher'],
        submenu: [
          { name: 'All Students', href: '/students', roles: ['admin', 'teacher'] },
          { name: 'Admissions', href: '/admissions', roles: ['admin'] },
        ],
      });
    }

    // Teachers Menu (with submenu)
    if (isAdmin) {
      navigation.push({
        name: 'Teachers',
        icon: UserGroupIcon,
        roles: ['admin'],
        submenu: [
          { name: 'All Teachers', href: '/teachers', roles: ['admin'] },
          { name: 'Performance Review', href: '/teacher-performance', roles: ['admin'] },
          { name: 'Payroll', href: '/teacher-payroll', roles: ['admin'] },
        ],
      });
    }

    navigation.push(
      { name: 'Classes', href: '/classes', icon: BookOpenIcon, roles: ['admin', 'teacher'] },
      { name: 'Attendance', href: '/attendance', icon: CalendarDaysIcon, roles: ['admin', 'teacher', 'student'] }
    );

    // Academic Menu (with submenu)
    if (isAdmin || isTeacher) {
      navigation.push({
        name: 'Academic',
        icon: BookOpenIcon,
        roles: ['admin', 'teacher'],
        submenu: [
          { name: 'Subjects', href: '/subjects', roles: ['admin', 'teacher'] },
          { name: 'Timetable', href: '/timetable', roles: ['admin', 'teacher'] },
          { name: 'Assignments', href: '/assignments', roles: ['admin', 'teacher'] },
        ],
      });
    }

    // Examinations Menu (with submenu) - NEW
    navigation.push({
      name: 'Examinations',
      icon: ClipboardDocumentCheckIcon,
      roles: ['admin', 'teacher', 'student'],
      submenu: [
        { name: 'Exam Schedule', href: '/exam-schedule', roles: ['admin', 'teacher', 'student'] },
        { name: 'Grades & Marks', href: '/grades', roles: ['admin', 'teacher', 'student'] },
        { name: 'Report Cards', href: '/report-cards', roles: ['admin', 'teacher', 'student'] },
      ],
    });

    // Fees
    if (isAdmin) {
      navigation.push({ name: 'Fees', href: '/fee-management', icon: BanknotesIcon, roles: ['admin'] });
    } else if (isStudent) {
      navigation.push({ name: 'Fees', href: '/fees', icon: BanknotesIcon, roles: ['student'] });
    }

    // Events & Calendar (with submenu)
    navigation.push({
      name: 'Events & Calendar',
      icon: CalendarIcon,
      roles: ['superadmin', 'admin', 'teacher', 'student'],
      submenu: [
        { name: 'Events', href: '/events', roles: ['superadmin', 'admin', 'teacher', 'student'] },
        { name: 'Calendar', href: '/calendar', roles: ['superadmin', 'admin', 'teacher', 'student'] },
      ],
    });

    // Communication (with submenu)
    navigation.push({
      name: 'Communication',
      icon: MegaphoneIcon,
      roles: ['superadmin', 'admin', 'teacher', 'student'],
      submenu: [
        { name: 'Announcements', href: '/announcements', roles: ['superadmin', 'admin', 'teacher', 'student'] },
        { name: 'Messages', href: '/messages', roles: ['superadmin', 'admin', 'teacher', 'student'] },
        { name: 'Notifications', href: '/notifications', roles: ['superadmin', 'admin', 'teacher', 'student'] },
        { name: 'Bulk Communication', href: '/bulk-communication', roles: ['superadmin', 'admin'] },
      ],
    });

    navigation.push(
      { name: 'Analytics', href: '/analytics', icon: ChartPieIcon, roles: ['superadmin', 'admin', 'teacher'] },
      { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['superadmin', 'admin', 'teacher'] }
    );

    // System Logs (superadmin only)
    if (isSuperAdmin) {
      navigation.push({
        name: 'System Logs',
        href: '/system-logs',
        icon: ServerIcon,
        roles: ['superadmin'],
      });
    }

    // Audit Logs (superadmin and admin)
    if (isSuperAdmin || isAdmin) {
      navigation.push({
        name: 'Audit Logs',
        href: '/audit-logs',
        icon: ClipboardDocumentListIcon,
        roles: ['superadmin', 'admin'],
      });
    }

    // Settings Menu (with submenu)
    if (isAdmin) {
      navigation.push({
        name: 'Settings',
        icon: Cog6ToothIcon,
        roles: ['admin'],
        submenu: [
          { name: 'School Profile', href: '/settings/school-profile', roles: ['admin'] },
          { name: 'User Roles', href: '/settings/user-roles', roles: ['admin'] },
          { name: 'Backup & Security', href: '/settings/backup-security', roles: ['admin'] },
          { name: 'System Settings', href: '/settings/system', roles: ['admin'] },
        ],
      });
    } else {
      navigation.push({ name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['teacher', 'student'] });
    }

    return navigation;
  };

  const navigation = getNavigation();

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user?.role));

  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  const hasActiveSubmenu = (submenu) => {
    if (!submenu) return false;
    return submenu.some((item) => location.pathname === item.href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 bg-gray-800 lg:justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white">ILM SMS</span>
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white lg:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-2 mt-5 overflow-y-auto">
          <div className="space-y-1 pb-4">
            {filteredNavigation.map((item) => {
              if (item.submenu) {
                // Menu with submenu
                const isOpen = openMenus[item.name];
                const hasActive = hasActiveSubmenu(item.submenu);

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        hasActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                        {item.name}
                      </div>
                      {isOpen ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu
                          .filter((subItem) => subItem.roles.includes(user?.role))
                          .map((subItem) => (
                            <NavLink
                              key={subItem.name}
                              to={subItem.href}
                              className={({ isActive }) =>
                                `block px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                  isActive
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`
                              }
                              onClick={() => {
                                if (window.innerWidth < 1024) {
                                  toggleSidebar();
                                }
                              }}
                            >
                              {subItem.name}
                            </NavLink>
                          ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Regular menu item (no submenu)
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                );
              }
            })}
          </div>
        </nav>

        {/* User info at bottom - Fixed */}
        <div className="flex-shrink-0 border-t border-gray-700 p-4 bg-gray-900">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
