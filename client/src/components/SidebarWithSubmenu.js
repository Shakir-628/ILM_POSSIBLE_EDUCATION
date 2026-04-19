import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ChartPieIcon,
  BanknotesIcon,
  UserCircleIcon,
  BellAlertIcon,
  TruckIcon,
  BuildingOfficeIcon,
  BookmarkIcon,
  CalendarIcon,
  FolderIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CubeIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { rolePermissionService } from '../services/rolePermissionService';

const SidebarWithSubmenu = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = React.useCallback(async () => {
    if (!user?.role) return;
    setLoading(true);
    try {
      const response = await rolePermissionService.getRolePermissionByRole(user.role);
      if (response.success) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sidebar permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  React.useEffect(() => {
    if (user?.role) {
      fetchPermissions();
    }
  }, [user?.role, fetchPermissions]);

  const toggleSubmenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // Comprehensive menu structure with submenus
  const menuStructure = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      name: 'Students',
      icon: AcademicCapIcon,
      roles: ['admin', 'teacher'],
      submenu: [
        { name: 'All Students', href: '/students', roles: ['admin', 'teacher'] },
        { name: 'Admissions', href: '/admissions', roles: ['admin'] },
        { name: 'ID Cards', href: '/student-id-cards', roles: ['admin'] },
      ],
    },
    {
      name: 'Teachers',
      icon: UserGroupIcon,
      roles: ['admin'],
      submenu: [
        { name: 'All Teachers', href: '/teachers', roles: ['admin'] },
        { name: 'Staff Attendance', href: '/teacher-attendance', roles: ['admin'] },
        { name: 'Performance Review', href: '/teacher-performance', roles: ['admin'] },
        { name: 'Payroll', href: '/teacher-payroll', roles: ['admin'] },
        { name: 'ID Cards', href: '/teacher-id-cards', roles: ['admin'] },
      ],
    },
    {
      name: 'Parents',
      href: '/parents',
      icon: UserCircleIcon,
      roles: ['admin'],
    },
    {
      name: 'Academic',
      icon: BookOpenIcon,
      roles: ['admin', 'teacher', 'student'],
      submenu: [
        { name: 'Classes', href: '/classes', roles: ['admin', 'teacher'] },
        { name: 'Subjects', href: '/subjects', roles: ['admin', 'teacher'] },
        { name: 'Timetable', href: '/timetable', roles: ['admin', 'teacher', 'student'] },
        { name: 'Assignments', href: '/assignments', roles: ['admin', 'teacher', 'student'] },
      ],
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: CalendarDaysIcon,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      name: 'Examinations',
      icon: ClipboardDocumentCheckIcon,
      roles: ['admin', 'teacher', 'student'],
      submenu: [
        { name: 'Exam Schedule', href: '/exam-schedule', roles: ['admin', 'teacher', 'student'] },
        { name: 'Grades & Marks', href: '/grades', roles: ['admin', 'teacher', 'student'] },
        { name: 'Report Cards', href: '/report-cards', roles: ['admin', 'teacher', 'student', 'parent'] },
        { name: 'Exam Analytics', href: '/exam-analytics', roles: ['admin', 'teacher'] },
        { name: 'AI Exams', href: '/ai-exams', roles: ['admin', 'teacher', 'student'] },
        { name: 'Create AI Exam', href: '/exams/create', roles: ['admin', 'teacher'] },
      ],
    },
    {
      name: 'Fees & Finance',
      icon: BanknotesIcon,
      roles: ['admin', 'student', 'parent'],
      submenu: [
        { name: 'Fee Management', href: '/fee-management', roles: ['admin'] },
        { name: 'My Fees', href: '/fees', roles: ['student', 'parent'] },
        { name: 'Accounting', href: '/accounting', roles: ['admin'] },
        { name: 'Income Reports', href: '/income-reports', roles: ['admin'] },
      ],
    },
    {
      name: 'Library',
      icon: BookmarkIcon,
      roles: ['admin', 'teacher', 'student'],
      submenu: [
        { name: 'Books', href: '/library', roles: ['admin', 'teacher', 'student'] },
        { name: 'Issue/Return', href: '/library/issues', roles: ['admin', 'teacher'] },
      ],
    },
    {
      name: 'Transport',
      icon: TruckIcon,
      roles: ['admin'],
      submenu: [
        { name: 'Manage Transport', href: '/transport', roles: ['admin'] },
      ],
    },
    {
      name: 'Hostel',
      icon: BuildingOfficeIcon,
      roles: ['admin'],
      submenu: [
        { name: 'Manage Hostel', href: '/hostel', roles: ['admin'] },
      ],
    },
    {
      name: 'Communication',
      icon: BellAlertIcon,
      roles: ['admin', 'teacher', 'student', 'parent'],
      submenu: [
        { name: 'Announcements', href: '/announcements', roles: ['admin', 'teacher', 'student', 'parent'] },
        { name: 'Messages', href: '/messages', roles: ['admin', 'teacher', 'student', 'parent'] },
        { name: 'Notifications', href: '/notifications', roles: ['admin', 'teacher', 'student', 'parent'] },
        { name: 'SMS/Email', href: '/communication/bulk', roles: ['admin'] },
      ],
    },
    {
      name: 'Events & Calendar',
      icon: CalendarIcon,
      roles: ['admin', 'teacher', 'student', 'parent'],
      submenu: [
        { name: 'School Events', href: '/events', roles: ['admin', 'teacher', 'student', 'parent'] },
        { name: 'Academic Calendar', href: '/calendar', roles: ['admin', 'teacher', 'student', 'parent'] },
        { name: 'Event Management', href: '/events/manage', roles: ['admin'] },
      ],
    },
    {
      name: 'Documents',
      icon: FolderIcon,
      roles: ['admin', 'teacher', 'student', 'parent'],
      submenu: [
        { name: 'Certificates', href: '/certificates', roles: ['admin', 'student', 'parent'] },
        { name: 'E-Portfolio', href: '/e-portfolio', roles: ['admin', 'teacher', 'student'] },
        { name: 'Document Templates', href: '/documents/templates', roles: ['admin'] },
      ],
    },
    {
      name: 'Inventory',
      icon: CubeIcon,
      roles: ['admin', 'superadmin', 'teacher'],
      submenu: [
        { name: 'Assets', href: '/assets', roles: ['admin', 'superadmin', 'teacher'] },
        { name: 'Maintenance', href: '/maintenance', roles: ['admin', 'superadmin', 'teacher'] },
        { name: 'Inventory Reports', href: '/inventory-reports', roles: ['admin', 'superadmin', 'teacher'] },
      ],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartPieIcon,
      roles: ['admin', 'teacher'],
    },
    {
      name: 'Reports',
      icon: DocumentChartBarIcon,
      roles: ['admin', 'teacher', 'superadmin'],
      submenu: [
        { name: 'Student Reports', href: '/reports/student', roles: ['admin', 'teacher', 'superadmin'] },
        { name: 'Attendance Reports', href: '/reports/attendance', roles: ['admin', 'teacher', 'superadmin'] },
        { name: 'Financial Reports', href: '/reports/financial', roles: ['admin', 'superadmin'] },
        { name: 'Custom Reports', href: '/reports/custom', roles: ['admin', 'teacher', 'superadmin'] },
      ],
    },
    {
      name: 'Logs',
      icon: ClipboardDocumentListIcon,
      roles: ['admin', 'superadmin'],
      submenu: [
        { name: 'System Logs', href: '/system-logs', roles: ['admin', 'superadmin'] },
        { name: 'Audit Logs', href: '/audit-logs', roles: ['admin', 'superadmin'] },
      ],
    },
    {
      name: 'Settings',
      icon: CogIcon,
      roles: ['admin', 'superadmin'],
      submenu: [
        { name: 'School Profile', href: '/settings/school', roles: ['admin'] },
        { name: 'User Roles', href: '/settings/roles', roles: ['admin', 'superadmin'] },
        { name: 'Role & Module Permissions', href: '/settings/role-permissions', roles: ['admin', 'superadmin'] },
        { name: 'Backup & Security', href: '/settings/backup', roles: ['admin', 'superadmin'] },
        { name: 'System Settings', href: '/settings/system', roles: ['admin', 'superadmin'] },
      ],
    },
  ];

  // Map UI names to DB module names where they differ
  const uiToDbMap = {
    'Fees & Finance': 'Fees',
    'Logs': 'System Logs', // simplified mapping
  };

  // Helper to check if a module or submodule is enabled for the current user
  const isModuleEnabled = (menuName, subModuleName = null) => {
    // SuperAdmin always has access
    if (user?.role === 'superadmin') return true;

    // While loading, don't show anything to prevent flicker
    if (loading || !permissions) return false;

    const dbName = uiToDbMap[menuName] || menuName;
    const module = permissions.modules.find(m => m.moduleName === dbName);

    // If not found in permissions, it's either not manageable yet or allowed by default
    if (!module) return true;

    if (subModuleName) {
      const submodule = module.submodules?.find(s => s.name === subModuleName);
      return submodule ? submodule.enabled : true;
    }

    return module.enabled;
  };

  // Auto-expand parent menu if child is active
  React.useEffect(() => {
    const activeParents = {};
    menuStructure.forEach((item) => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(
          (subItem) => location.pathname === subItem.href
        );
        if (hasActiveChild) {
          activeParents[item.name] = true;
        }
      }
    });
    setExpandedMenus((prev) => ({ ...prev, ...activeParents }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Filter menu items based on user role and dynamic permissions
  const filteredMenu = menuStructure.filter((item) => {
    const hasRoleAccess = item.roles.includes(user?.role);
    if (!hasRoleAccess) return false;

    // Check dynamic module permissions
    return isModuleEnabled(item.name);
  });

  // Check if current path matches menu item

  const isActiveParent = (submenu) => {
    if (!submenu) return false;
    return submenu.some((item) => location.pathname === item.href);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        {/* Header */}
        <div className="flex h-32 items-center justify-between px-4 bg-gray-800 lg:justify-center flex-shrink-0">
          <img src="/logos/Logo_IP.png" alt="Logo" style={{ height: '7.5rem' }} className="w-auto" />
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white lg:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 mt-5 overflow-y-auto">
          <div className="space-y-1 pb-4">
            {filteredMenu.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus[item.name];
              const isParentActive = isActiveParent(item.submenu);

              if (hasSubmenu) {
                // Filter submenu items based on user role and dynamic permissions
                const filteredSubmenu = item.submenu.filter((subItem) => {
                  const hasRoleAccess = subItem.roles.includes(user?.role);
                  if (!hasRoleAccess) return false;

                  return isModuleEnabled(item.name, subItem.name);
                });

                if (filteredSubmenu.length === 0) return null;

                return (
                  <div key={item.name}>
                    {/* Parent menu item */}
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isParentActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className="mr-3 h-6 w-6 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>

                    {/* Submenu items */}
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {filteredSubmenu.map((subItem) => (
                          <NavLink
                            key={subItem.href}
                            to={subItem.href}
                            className={({ isActive }) =>
                              `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`
                            }
                            onClick={() => {
                              if (window.innerWidth < 1024) {
                                toggleSidebar();
                              }
                            }}
                          >
                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                            {subItem.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Simple menu item without submenu
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive
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
                    <item.icon
                      className="mr-3 h-6 w-6 flex-shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                );
              }
            })}
          </div>
        </nav>

        {/* User Profile */}
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
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarWithSubmenu;

