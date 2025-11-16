/**
 * Generic Validation Utilities
 * Reusable validation functions for the entire application
 */

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number (digits only, minimum length)
 * @param {string} phone - Phone number to validate
 * @param {number} minLength - Minimum required digits (default: 10)
 * @param {number} maxLength - Maximum allowed digits (default: 15)
 * @returns {boolean} - True if valid phone number
 */
export const validatePhone = (phone, minLength = 10, maxLength = 15) => {
  if (!phone) return true; // Empty is allowed (optional field)
  const phoneRegex = /^\d+$/;
  return phone.length >= minLength && 
         phone.length <= maxLength && 
         phoneRegex.test(phone);
};

/**
 * Validates name fields (letters and spaces only)
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum required characters (default: 2)
 * @param {number} maxLength - Maximum allowed characters (default: 50)
 * @returns {boolean} - True if valid name
 */
export const validateName = (name, minLength = 2, maxLength = 50) => {
  const nameRegex = /^[A-Za-z\s]+$/;
  return name.length >= minLength && 
         name.length <= maxLength && 
         nameRegex.test(name);
};

/**
 * Validates student ID format
 * @param {string} studentId - Student ID to validate
 * @param {number} minLength - Minimum required characters (default: 3)
 * @param {number} maxLength - Maximum allowed characters (default: 20)
 * @returns {boolean} - True if valid student ID
 */
export const validateStudentId = (studentId, minLength = 3, maxLength = 20) => {
  if (!studentId) return true; // Empty is allowed (auto-generated)
  const studentIdRegex = /^[A-Za-z0-9\-_]+$/;
  return studentId.length >= minLength && 
         studentId.length <= maxLength && 
         studentIdRegex.test(studentId);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum required length (default: 8)
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password, minLength = 8) => {
  const result = {
    isValid: true,
    message: '',
    requirements: []
  };

  if (password.length < minLength) {
    result.isValid = false;
    result.requirements.push(`At least ${minLength} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.requirements.push('At least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.requirements.push('At least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    result.isValid = false;
    result.requirements.push('At least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.isValid = false;
    result.requirements.push('At least one special character');
  }

  result.message = result.isValid ? 
    'Password meets all requirements' : 
    `Password must include: ${result.requirements.join(', ')}`;

  return result;
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates date of birth (must be in the past and reasonable age)
 * @param {string} dateOfBirth - Date string to validate
 * @param {number} minAge - Minimum age in years (default: 5)
 * @param {number} maxAge - Maximum age in years (default: 100)
 * @returns {boolean} - True if valid date of birth
 */
export const validateDateOfBirth = (dateOfBirth, minAge = 5, maxAge = 100) => {
  if (!dateOfBirth) return false;
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
  
  return dob < today && age >= minAge && age <= maxAge;
};

/**
 * Generic input handler with validation
 * @param {object} e - Event object
 * @param {string} fieldType - Type of field to validate
 * @param {function} setFormData - State setter function
 * @param {object} formData - Current form data
 * @param {object} options - Additional validation options
 */
export const handleValidatedInput = (e, fieldType, setFormData, formData, options = {}) => {
  const { name, value } = e.target;
  let processedValue = value;
  
  // Process input based on field type
  switch (fieldType) {
    case 'phone':
      // Remove non-digits and limit length
      processedValue = value.replace(/\D/g, '').slice(0, options.maxLength || 15);
      e.target.value = processedValue;
      break;
      
    case 'name':
      // Remove non-letters and limit length
      processedValue = value.replace(/[^A-Za-z\s]/g, '').slice(0, options.maxLength || 50);
      e.target.value = processedValue;
      break;
      
    case 'studentId':
      // Remove invalid characters and limit length
      processedValue = value.replace(/[^A-Za-z0-9\-_]/g, '').slice(0, options.maxLength || 20);
      e.target.value = processedValue;
      break;
      
    case 'email':
      // Convert to lowercase
      processedValue = value.toLowerCase();
      e.target.value = processedValue;
      break;
      
    default:
      // No processing for other field types
      break;
  }
  
  // Set custom validity message
  setCustomValidation(e, fieldType, processedValue, options);
  
  // Update form data
  setFormData({
    ...formData,
    [name]: processedValue,
  });
};

/**
 * Sets custom validation message based on field type
 * @param {object} e - Event object
 * @param {string} fieldType - Type of field
 * @param {string} value - Current value
 * @param {object} options - Additional validation options
 */
export const setCustomValidation = (e, fieldType, value, options = {}) => {
  let isValid = true;
  let message = '';
  
  switch (fieldType) {
    case 'email':
      if (value && !validateEmail(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
      break;
      
    case 'phone':
      if (value && !validatePhone(value, options.minLength, options.maxLength)) {
        isValid = false;
        message = `Please enter a valid phone number (${options.minLength || 10}-${options.maxLength || 15} digits)`;
      }
      break;
      
    case 'name':
      if (value && !validateName(value, options.minLength, options.maxLength)) {
        isValid = false;
        message = `Please enter only letters (min ${options.minLength || 2}, max ${options.maxLength || 50} characters)`;
      }
      break;
      
    case 'studentId':
      if (value && !validateStudentId(value, options.minLength, options.maxLength)) {
        isValid = false;
        message = `Please enter a valid student ID (alphanumeric only, min ${options.minLength || 3}, max ${options.maxLength || 20} characters)`;
      }
      break;
      
    case 'dateOfBirth':
      if (value && !validateDateOfBirth(value, options.minAge, options.maxAge)) {
        isValid = false;
        message = `Please enter a valid date of birth (age between ${options.minAge || 5} and ${options.maxAge || 100} years)`;
      }
      break;
      
    default:
      break;
  }
  
  e.target.setCustomValidity(isValid ? '' : message);
};

/**
 * Validates entire form object
 * @param {object} formData - Form data to validate
 * @param {object} validationRules - Validation rules for each field
 * @returns {object} - Validation result with isValid and errors
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(field => {
    const rule = validationRules[field];
    const value = formData[field];
    
    if (rule.required && !value) {
      errors[field] = `${rule.label || field} is required`;
      isValid = false;
      return;
    }
    
    if (value) {
      switch (rule.type) {
        case 'email':
          if (!validateEmail(value)) {
            errors[field] = `Please enter a valid ${rule.label || field}`;
            isValid = false;
          }
          break;
          
        case 'phone':
          if (!validatePhone(value, rule.minLength, rule.maxLength)) {
            errors[field] = `Please enter a valid ${rule.label || field}`;
            isValid = false;
          }
          break;
          
        case 'name':
          if (!validateName(value, rule.minLength, rule.maxLength)) {
            errors[field] = `Please enter a valid ${rule.label || field}`;
            isValid = false;
          }
          break;
          
        case 'studentId':
          if (!validateStudentId(value, rule.minLength, rule.maxLength)) {
            errors[field] = `Please enter a valid ${rule.label || field}`;
            isValid = false;
          }
          break;
          
        case 'dateOfBirth':
          if (!validateDateOfBirth(value, rule.minAge, rule.maxAge)) {
            errors[field] = `Please enter a valid ${rule.label || field}`;
            isValid = false;
          }
          break;
          
        default:
          break;
      }
    }
  });
  
  return {
    isValid,
    errors,
    errorCount: Object.keys(errors).length
  };
};

/**
 * Common validation patterns for HTML5 pattern attribute
 */
export const validationPatterns = {
  email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
  phone: '\\d{10,15}',
  name: '[A-Za-z\\s]{2,50}',
  studentId: '[A-Za-z0-9\\-_]{3,20}',
  password: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}',
  url: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?',
};

/**
 * Common validation messages for title attribute
 */
export const validationMessages = {
  email: 'Please enter a valid email address (e.g., user@domain.com)',
  phone: 'Please enter a valid phone number (10-15 digits, no spaces or symbols)',
  name: 'Please enter only letters and spaces (2-50 characters)',
  studentId: 'Please enter a valid student ID (letters, numbers, hyphens, underscores only)',
  password: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  dateOfBirth: 'Please enter a valid date of birth',
  url: 'Please enter a valid URL starting with http:// or https://',
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateStudentId,
  validatePassword,
  validateUrl,
  validateDateOfBirth,
  handleValidatedInput,
  setCustomValidation,
  validateForm,
  validationPatterns,
  validationMessages,
};
