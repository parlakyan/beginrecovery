import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Lock, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';

interface ResetPasswordForm {
  email: string;
  password?: string;
  confirmPassword?: string;
}

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
  const { resetPassword, error, loading, clearError } = useAuthStore();
  const [success, setSuccess] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = React.useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  React.useEffect(() => {
    // Extract reset token from URL if present
    const params = new URLSearchParams(window.location.search);
    const token = params.get('oobCode');
    if (token) setResetToken(token);
    
    clearError();
  }, [clearError]);

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
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
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
                  type="email"
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
                        validate: {
                          hasUpperCase: (value) => /[A-Z]/.test(value) || 'Must contain uppercase letter',
                          hasLowerCase: (value) => /[a-z]/.test(value) || 'Must contain lowercase letter',
                          hasNumber: (value) => /[0-9]/.test(value) || 'Must contain number',
                          hasSpecialChar: (value) => 
                            /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Must contain special character'
                        }
                      })}
                      type="password"
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
                        validate: value => value === watch('password') || 'Passwords do not match'
                      })}
                      type="password"
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