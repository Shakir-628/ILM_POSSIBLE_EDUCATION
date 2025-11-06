// Toast notifications for mobile
import React, { createContext, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // success, error, warning, info

  const showToast = (msg, toastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
  };

  const hideToast = () => {
    setVisible(false);
  };

  const success = (msg) => showToast(msg, 'success');
  const error = (msg) => showToast(msg, 'error');
  const warning = (msg) => showToast(msg, 'warning');
  const info = (msg) => showToast(msg, 'info');

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info, showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideToast}
        duration={3000}
        style={{ backgroundColor: getBackgroundColor() }}
        action={{
          label: 'Close',
          onPress: hideToast,
        }}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

