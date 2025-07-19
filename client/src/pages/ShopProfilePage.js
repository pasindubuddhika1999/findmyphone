import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ShopProfilePage = () => {
  const { user, setUser } = useAuth();
  const [shopData, setShopData] = useState({
    shopName: '',
    ownerName: '',
    contactNumber: '',
    address: '',
    location: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && user.role === 'shop') {
      fetchShopProfile();
    }
  }, [user]);

  const fetchShopProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getUserProfile();
      if (response.data.shop) {
        setShopData({
          shopName: response.data.shop.shopName || '',
          ownerName: response.data.shop.ownerName || '',
          contactNumber: response.data.shop.contactNumber || '',
          address: response.data.shop.address || '',
          location: response.data.shop.location || '',
          description: response.data.shop.description || ''
        });
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load shop profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setShopData({
      ...shopData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shopData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }
    
    if (!shopData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    
    if (!shopData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    
    if (!shopData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!shopData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await api.updateShopProfile(shopData);
      toast.success('Shop profile updated successfully');
      setIsEditing(false);
      
      // Update the shop data in the auth context
      const updatedUserProfile = await api.getUserProfile();
      setUser({
        ...user,
        shop: updatedUserProfile.data.shop
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update shop profile';
      toast.error(errorMessage);
      
      // Set field errors if returned from API
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.param] = err.msg;
        });
        setErrors(apiErrors);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Redirect if not a shop user
  if (!user || user.role !== 'shop') {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="spinner"></div>
          <p>Loading shop profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Shop Profile</h1>
            <div>
              {user.shop?.isApproved ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Approved
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Pending Approval
                </span>
              )}
            </div>
          </div>

          {!user.shop?.isApproved && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-yellow-800">
                Your shop account is pending approval from an administrator. You will be able to fully access all features once approved.
              </p>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      id="shopName"
                      name="shopName"
                      value={shopData.shopName}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.shopName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.shopName && <p className="mt-1 text-sm text-red-600">{errors.shopName}</p>}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={shopData.ownerName}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.ownerName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={shopData.contactNumber}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.contactNumber ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={shopData.location}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="2"
                      value={shopData.address}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={shopData.description}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Shop Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Shop Name:</span>
                      <p>{shopData.shopName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Owner Name:</span>
                      <p>{shopData.ownerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Contact Number:</span>
                      <p>{shopData.contactNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Location:</span>
                      <p>{shopData.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Address:</span>
                      <p>{shopData.address}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Description:</span>
                      <p>{shopData.description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Username:</span>
                      <p>{user.username}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Email:</span>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Registered On:</span>
                      <p>{formatDate(user.shop?.createdAt)}</p>
                    </div>
                    {user.shop?.isApproved && (
                      <div>
                        <span className="text-gray-600 font-medium">Approved On:</span>
                        <p>{formatDate(user.shop?.approvedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Shop Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopProfilePage; 