import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-500',
          icon: CheckCircleIcon,
          iconColor: 'text-green-500',
          textColor: 'text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-500',
          icon: XCircleIcon,
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-500',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-800',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-500',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-500',
          textColor: 'text-blue-800',
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} border-l-4 p-4 rounded-lg shadow-lg max-w-md animate-fade-in-right pointer-events-auto`}
    >
      <div className="flex items-start">
        <Icon className={`h-6 w-6 ${styles.iconColor} flex-shrink-0`} />
        <div className={`ml-3 flex-1 ${styles.textColor}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className={`ml-3 flex-shrink-0 ${styles.iconColor} hover:opacity-75 transition-opacity`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ToastContext;

