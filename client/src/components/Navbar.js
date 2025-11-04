import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <nav className="bg-white shadow-soft border-b border-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 group">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger-500 border-2 border-white rounded-full animate-pulse"></span>
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-danger-500 to-danger-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                3
              </span>
            </button>

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 text-sm focus:outline-none hover:bg-gray-50 p-2 rounded-xl transition-all duration-200 hover:shadow-md group">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-glow transition-all duration-200 group-hover:scale-110">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize flex items-center">
                    {user?.role === 'superadmin' && '👑 '}
                    {user?.role === 'admin' && '🔑 '}
                    {user?.role}
                  </p>
                </div>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-large border border-gray-100 focus:outline-none overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500 to-secondary-600 text-white capitalize">
                      {user?.role === 'superadmin' && '👑 '}
                      {user?.role === 'admin' && '🔑 '}
                      {user?.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleProfileClick}
                          className={`${
                            active ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          } group flex w-full items-center px-4 py-2.5 text-sm transition-colors duration-150`}
                        >
                          <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                          My Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleProfileClick}
                          className={`${
                            active ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          } group flex w-full items-center px-4 py-2.5 text-sm transition-colors duration-150`}
                        >
                          <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                          Settings
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-danger-50 text-danger-700' : 'text-gray-700'
                          } group flex w-full items-center px-4 py-2.5 text-sm transition-colors duration-150`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-danger-500" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
