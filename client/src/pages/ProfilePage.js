import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch user's posts
  const { data: userPosts, isLoading: postsLoading } = useQuery(
    ['user-posts'],
    async () => {
      const response = await api.get('/api/posts/user/my-posts');
      return response.data;
    },
    {
      enabled: activeTab === 'posts',
    }
  );

  // Profile update mutation
  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await api.put('/api/auth/profile', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        updateProfile(data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      },
    }
  );

  // Password change mutation
  const changePasswordMutation = useMutation(
    async (data) => {
      await api.put('/api/auth/change-password', data);
    },
    {
      onSuccess: () => {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
        toast.success('Password changed successfully!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to change password';
        toast.error(message);
      },
    }
  );

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (profileData.phoneNumber && !/^\+?\d{9,15}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'posts', name: 'My Posts', icon: PhoneIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and view your activity</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="mb-4">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user?.username}</h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
                {user?.lastLogin && (
                  <div className="flex items-center justify-center">
                    <span>Last login: {formatDate(user?.lastLogin)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="btn-secondary w-full"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary text-sm"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileSubmit}
                      disabled={updateProfileMutation.isLoading}
                      className="btn-primary text-sm"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          username: user?.username || '',
                          phoneNumber: user?.phoneNumber || '',
                        });
                        setErrors({});
                      }}
                      className="btn-secondary text-sm"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50' : ''} ${errors.username ? 'border-red-500' : ''}`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-50"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50' : ''} ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role === 'admin' ? 'Administrator' : 'User'}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
              </form>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`input-field pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`input-field pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirm new password"
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
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isLoading}
                      className="btn-primary"
                    >
                      {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setErrors({});
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {/* Posts Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {userPosts?.total || 0}
              </div>
              <div className="text-gray-600">Total Posts</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {userPosts?.posts?.filter(post => post.status === 'active').length || 0}
              </div>
              <div className="text-gray-600">Active Posts</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userPosts?.posts?.filter(post => post.status === 'resolved').length || 0}
              </div>
              <div className="text-gray-600">Resolved Posts</div>
            </div>
          </div>

          {/* Posts List */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Posts</h3>
            
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : userPosts?.posts?.length > 0 ? (
              <div className="space-y-4">
                {userPosts.posts.map((post) => (
                  <div key={post._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.brand} {post.phoneModel}</span>
                          <span>IMEI: {post.imei}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            post.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                            post.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/posts/${post._id}`}
                          className="btn-secondary text-sm"
                        >
                          View
                        </a>
                        <a
                          href={`/posts/${post._id}/edit`}
                          className="btn-primary text-sm"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">You haven't created any lost phone reports yet.</p>
                <a href="/create-post" className="btn-primary">
                  Create Your First Post
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;