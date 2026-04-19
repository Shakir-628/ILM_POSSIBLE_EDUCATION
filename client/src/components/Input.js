import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm dark:bg-dark-700 dark:text-white dark:border-dark-600
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
          transition-all duration-200 hover:border-primary-400
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 dark:bg-dark-800 cursor-not-allowed' : 'bg-white dark:bg-dark-700'}
        `}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;

