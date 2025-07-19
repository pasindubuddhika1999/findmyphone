import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ShopRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    ownerName: '',
    contactNumber: '',
    address: '',
    location: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // User validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = 'Username must be between 3 and 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Shop validation
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    } else if (formData.shopName.length < 3 || formData.shopName.length > 100) {
      newErrors.shopName = 'Shop name must be between 3 and 100 characters';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    } else if (formData.ownerName.length < 3 || formData.ownerName.length > 100) {
      newErrors.ownerName = 'Owner name must be between 3 and 100 characters';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 5 || formData.address.length > 200) {
      newErrors.address = 'Address must be between 5 and 200 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 3 || formData.location.length > 100) {
      newErrors.location = 'Location must be between 3 and 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await api.registerShop(formData);
      toast.success('Shop registration submitted successfully!');
      toast.info('Please wait for admin approval before logging in.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      // Set field errors if returned from API
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.param] = err.msg;
        });
        setErrors(apiErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-xl mx-auto lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Register as a Shop</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Want to register as a regular user?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register as User
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
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
                      value={formData.username}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
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
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900">Shop Information</h3>
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                    Shop Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      value={formData.shopName}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.shopName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.shopName && <p className="mt-2 text-sm text-red-600">{errors.shopName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                    Owner Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="ownerName"
                      name="ownerName"
                      type="text"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.ownerName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.ownerName && <p className="mt-2 text-sm text-red-600">{errors.ownerName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.contactNumber ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.contactNumber && <p className="mt-2 text-sm text-red-600">{errors.contactNumber}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows="2"
                      value={formData.address}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="mt-1">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Registering...' : 'Register Shop'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex-1 hidden w-0 lg:block">
        <img
          className="absolute inset-0 object-cover w-full h-full"
          src="https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
          alt="Phone shop"
        />
      </div>
    </div>
  );
};

export default ShopRegisterPage; 