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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg focus:ring-primary-500 disabled:bg-primary-300 disabled:hover:scale-100',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg focus:ring-gray-500 disabled:bg-gray-300 disabled:hover:scale-100',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg focus:ring-green-500 disabled:bg-green-300 disabled:hover:scale-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500 disabled:bg-red-300 disabled:hover:scale-100',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md focus:ring-primary-500 disabled:bg-gray-100 disabled:hover:scale-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className={`${children ? 'mr-2' : ''} h-5 w-5 transition-transform duration-200 group-hover:rotate-12`} />}
      {children}
    </button>
  );
};

export default Button;

