import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  type = 'button',
  disabled = false,
  className = '',
  icon: Icon
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md group';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white hover:from-primary-600 hover:to-secondary-700 hover:shadow-glow-purple focus:ring-primary-500 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:shadow-none',
    secondary: 'bg-gradient-to-r from-dark-600 to-dark-700 text-white hover:from-dark-700 hover:to-dark-800 hover:shadow-large focus:ring-dark-500 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:shadow-none',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 hover:shadow-lg hover:shadow-success-500/30 focus:ring-success-500 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:shadow-none',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-700 hover:shadow-lg hover:shadow-danger-500/30 focus:ring-danger-500 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:shadow-none',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 hover:shadow-lg hover:shadow-warning-500/30 focus:ring-warning-500 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:shadow-none',
    outline: 'border-2 border-primary-500 text-primary-600 bg-white hover:bg-primary-50 hover:shadow-md hover:border-primary-600 focus:ring-primary-500 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:scale-100 disabled:shadow-none',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className={`${children ? 'mr-2.5' : ''} h-5 w-5 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110`} />}
      {children}
    </button>
  );
};

export default Button;
