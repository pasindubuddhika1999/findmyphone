import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !/^\+?\d{9,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
      };
      
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-xl mx-auto lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Register as a User</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          <p className="mt-2 text-sm text-gray-600">
              Want to register as a shop?{' '}
              <Link to="/register-shop" className="font-medium text-blue-600 hover:text-blue-500">
                Register as Shop
              </Link>
          </p>
        </div>

          <div className="mt-8">
            <div className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
            <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
                  <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Choose a username"
              />
              {errors.username && (
                      <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
                  </div>
            </div>

            <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
                  <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your email"
              />
              {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900">Security</h3>

            <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
                  <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
                  <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>

            <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
                  <div className="mt-1">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your phone number"
              />
              {errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
                  </div>
            </div>

                <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Image/Info Section */}
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 flex flex-col justify-center p-12">
          <div className="max-w-md mx-auto text-white">
            <div className="mb-8">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join our community today</h2>
            <p className="text-lg mb-6">
              Create a personal account to report lost phones and help others find their devices.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Report lost phones with detailed information</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Track the status of your reports</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Get notified when your phone is found</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 