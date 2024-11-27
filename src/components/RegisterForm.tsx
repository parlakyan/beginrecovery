import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import { usersService } from '../services/firebase';
import { User } from '../types';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore(state => state.setUser);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Create user document in Firestore
      const userData = {
        email: userCredential.user.email || 'anonymous@user.com',
        role: 'user' as const, // Explicitly type as 'user'
        createdAt: new Date().toISOString()
      };
      
      await usersService.createUser(userData);
      
      // Update local state
      const newUser: User = {
        id: userCredential.user.uid,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt
      };
      
      setUser(newUser);

      // Redirect to account page
      navigate('/account');
    } catch (error) {
      console.error('Error registering:', error);
      setError('Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            type="password"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            type="password"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );
}
