import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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
        <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-10 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              We've sent password reset instructions to:
            </p>
            <p className="text-base font-semibold text-primary-600 mb-6">
              {email}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> The reset link will expire in 1 hour for security reasons.
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
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
              className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
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
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-10 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-6">
            <EnvelopeIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-600">
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
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

            <Link to="/login">
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

          <div className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

