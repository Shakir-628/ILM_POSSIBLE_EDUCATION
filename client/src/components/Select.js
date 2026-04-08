import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  children,
  required = false,
  error,
  disabled = false,
  className = '',
  placeholder = 'Select an option',
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm dark:bg-dark-700 dark:text-white dark:border-dark-600
          focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 dark:bg-dark-800 cursor-not-allowed' : 'bg-white dark:bg-dark-700'}
        `}
      >
        {!children && <option value="">{placeholder}</option>}
        {options && options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;

