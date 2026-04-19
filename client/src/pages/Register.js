import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AcademicCapIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PhoneIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password) => {
    const checks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordChecks(checks);

    // Calculate strength (0-5)
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);

    return Object.values(checks).every(Boolean);
  };

  // Phone validation (basic)
  const validatePhone = (phone) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  useEffect(() => {
    if (touched.password) {
      validatePassword(formData.password);
    }
    if (touched.confirmPassword && formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword, touched.password, touched.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validations
    if (name === 'email' && touched.email) {
      setEmailValid(validateEmail(value));
    }
    if (name === 'password' && touched.password) {
      validatePassword(value);
    }
    if (name === 'confirmPassword' && touched.confirmPassword) {
      setPasswordsMatch(formData.password === value);
    }
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true,
    });

    if (field === 'email') {
      setEmailValid(validateEmail(formData.email));
    }
    if (field === 'password') {
      validatePassword(formData.password);
    }
    if (field === 'confirmPassword') {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      setError('Password does not meet the requirements');
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate phone if provided
    if (formData.phone && !validatePhone(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength === 3) return 'Fair';
    if (passwordStrength === 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center">
            <img src="/logos/Logo_IP.png" alt="Logo" style={{ height: '7.5rem' }} className="w-auto drop-shadow-2xl" />
          </div>
          <h2 className="hidden text-center text-4xl font-extrabold text-white drop-shadow-lg">
            Join ILM Possible
          </h2>
          <p className="mt-2 text-center text-lg text-white drop-shadow-md">
            Create your account
          </p>
          <p className="mt-1 text-center text-sm text-white opacity-90">
            Start your educational journey today
          </p>
        </div>

        {/* Register Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-dark-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-dark-700 animate-fade-in text-gray-900 dark:text-white">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={`block w-full pl-10 pr-10 py-3 border ${touched.email
                      ? emailValid
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-dark-600 focus:ring-primary-500 focus:border-primary-500'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none transition-all duration-200 text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white`}
                    placeholder="you@example.com"
                  />
                  {touched.email && emailValid !== null && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailValid ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {touched.email && !emailValid && (
                  <p className="mt-1 text-xs text-red-600 animate-fade-in dark:text-red-400">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  >
                    <option value="student" className="dark:bg-dark-800">Student</option>
                    <option value="teacher" className="dark:bg-dark-800">Teacher</option>
                    <option value="parent" className="dark:bg-dark-800">Parent</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {touched.password && formData.password && (
                  <div className="mt-2 animate-fade-in">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Password Strength:</span>
                      <span className={`text-xs font-semibold ${passwordStrength <= 2 ? 'text-red-600' :
                        passwordStrength === 3 ? 'text-yellow-600' :
                          passwordStrength === 4 ? 'text-blue-600' :
                            'text-green-600'
                        }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {touched.password && formData.password && (
                  <div className="mt-3 space-y-1 animate-fade-in">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Password must contain:</p>
                    <div className="space-y-1">
                      {[
                        { key: 'minLength', label: 'At least 8 characters' },
                        { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
                        { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
                        { key: 'hasNumber', label: 'One number (0-9)' },
                        { key: 'hasSpecial', label: 'One special character (!@#$%...)' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                          {passwordChecks[key] ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${passwordChecks[key] ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`block w-full pl-10 pr-10 py-3 border ${touched.confirmPassword && passwordsMatch !== null
                      ? passwordsMatch
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-dark-600 focus:ring-primary-500 focus:border-primary-500'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none transition-all duration-200 text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  {touched.confirmPassword && passwordsMatch !== null && formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-10 pr-3 flex items-center">
                      {passwordsMatch ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {touched.confirmPassword && !passwordsMatch && formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 animate-fade-in dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !emailValid || passwordStrength < 5 || !passwordsMatch}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-500 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-white drop-shadow">
            © 2024 ILM Possible. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
