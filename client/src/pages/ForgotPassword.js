import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-10 animate-fade-in text-gray-900 dark:text-white">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              We've sent a 6-digit OTP and a password reset link to:
            </p>
            <p className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-6">
              {email}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Important:</strong> The OTP and link will expire in 10 minutes for security reasons.
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              Click the "Reset Password Now" button in the email to automatically fill the OTP, or enter it manually on the next page.
            </p>
          </div>

          <div className="space-y-4">
            <Link to="/login">
              <Button variant="primary" className="w-full" icon={ArrowLeftIcon}>
                Back to Login
              </Button>
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
            >
              Resend Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-10 animate-fade-in text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-6">
            <EnvelopeIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
              icon={EnvelopeIcon}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

            <Link to="/login" className="block">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                icon={ArrowLeftIcon}
              >
                Back to Login
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

