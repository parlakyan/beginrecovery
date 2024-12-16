import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';

interface ResetPasswordForm {
  email: string;
  password?: string;
  confirmPassword?: string;
}

const passwordValidation = {
  hasUpperCase: (value: string) => /[A-Z]/.test(value) || 'Must contain uppercase letter',
  hasLowerCase: (value: string) => /[a-z]/.test(value) || 'Must contain lowercase letter',
  hasNumber: (value: string) => /[0-9]/.test(value) || 'Must contain number',
  hasSpecialChar: (value: string) => 
    /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Must contain special character'
};

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
  const { user, resetPassword, error, loading, clearError } = useAuthStore();
  const location = useLocation();
  const [success, setSuccess] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string | null>(null);
  const [tokenError, setTokenError] = React.useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = React.useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Get return URL from location state or query params
  const returnUrl = location.state?.returnUrl || 
                   new URLSearchParams(location.search).get('returnUrl') || 
                   '/login';

  useEffect(() => {
    // Extract and validate reset token from URL if present
    const params = new URLSearchParams(location.search);
    const token = params.get('oobCode');
    if (token) {
      try {
        // Basic token validation (you might want to add more validation)
        if (token.length < 20) {
          setTokenError('Invalid reset token');
        } else {
          setResetToken(token);
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenError('Invalid reset token');
      }
    }
    
    clearError();
  }, [clearError]);

  // Redirect if authenticated
  if (user) {
    return <Navigate to={returnUrl} replace />;
  }

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      if (resetToken && data.password) {
        // Handle password reset confirmation
        await resetPassword(data.email, resetToken, data.password);
      } else {
        // Handle sending reset email
        await resetPassword(data.email);
      }
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
    }
  };

  const renderPasswordRequirements = () => (
    <div className="mt-4 space-y-2 text-sm">
      <h4 className="font-medium text-gray-700">Password Requirements:</h4>
      {Object.entries(passwordStrength).map(([key, met]) => (
        <div key={key} className="flex items-center gap-2">
          {met ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <X className="w-4 h-4 text-red-500" />
          )}
          <span className={met ? 'text-green-700' : 'text-gray-600'}>
            {key === 'hasMinLength' && 'At least 8 characters'}
            {key === 'hasUpperCase' && 'One uppercase letter'}
            {key === 'hasLowerCase' && 'One lowercase letter'}
            {key === 'hasNumber' && 'One number'}
            {key === 'hasSpecialChar' && 'One special character'}
          </span>
        </div>
      ))}
    </div>
  );

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center mb-6">
            <Logo />
          </Link>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to="/reset-password"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center mb-6">
            <Logo />
          </Link>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {resetToken ? 'Password Reset Complete' : 'Check Your Email'}
              </h2>
              <p className="text-gray-600 mb-6">
                {resetToken
                  ? 'Your password has been successfully reset. You can now sign in with your new password.'
                  : 'We\'ve sent password reset instructions to your email address.'}
              </p>
              <Link
                to="/login"
                state={{ returnUrl }}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <Logo />
        </Link>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {resetToken ? 'Reset Your Password' : 'Forgot Your Password?'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link 
            to="/login" 
            state={{ returnUrl }}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {resetToken && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        validate: (value) => {
                          if (!value) return 'Password is required';
                          return (
                            passwordValidation.hasUpperCase(value) === true &&
                            passwordValidation.hasLowerCase(value) === true &&
                            passwordValidation.hasNumber(value) === true &&
                            passwordValidation.hasSpecialChar(value) === true
                          ) || 'Password does not meet requirements';
                        }
                      })}
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      onChange={(e) => checkPasswordStrength(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: (value) => {
                          if (!value) return 'Please confirm your password';
                          return value === watch('password') || 'Passwords do not match';
                        }
                      })}
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {renderPasswordRequirements()}
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading 
                  ? 'Processing...' 
                  : resetToken 
                    ? 'Reset Password'
                    : 'Send Reset Instructions'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
