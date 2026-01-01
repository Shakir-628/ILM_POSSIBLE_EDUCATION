import { useState, useCallback } from 'react';

const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
  });

  const showToast = useCallback((message, type = 'info') => {
    setToast({
      show: true,
      message,
      type,
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  return {
    showToast,
    hideToast,
    toast,
  };
};

export { useToast };
