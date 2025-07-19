import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import PostCard from '../components/PostCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const isShop = user?.role === 'shop';

  const { data: userPosts, isLoading } = useQuery(
    ['userPosts', statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: 1,
        limit: 20,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      const response = await api.get(`/api/posts/user/my-posts?${params}`);
      return response.data;
    }
  );

  // Query for lost phones (for shop dashboard)
  const { data: lostPhones, isLoading: isLoadingLostPhones } = useQuery(
    ['lostPhones'],
    async () => {
      const params = new URLSearchParams({
        page: 1,
        limit: 10,
        status: 'active',
      });
      const response = await api.get(`/api/posts?${params}`);
      return response.data;
    },
    {
      enabled: isShop,
    }
  );

  const getStatusCounts = () => {
    if (!userPosts?.posts) return { active: 0, resolved: 0, total: 0 };
    
    const counts = userPosts.posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      acc.total += 1;
      return acc;
    }, { total: 0 });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Shop Dashboard
  if (isShop) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome, {user?.shop?.shopName || user?.username}! Manage your shop and help find lost phones.
            </p>
          </div>
          <Link
            to="/shop-profile"
            className="btn-primary mt-4 sm:mt-0"
          >
            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
            Manage Shop Profile
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              <BuildingStorefrontIcon className="h-8 w-8 mx-auto" />
            </div>
            <div className="text-gray-600">Shop Account</div>
            <div className="mt-2 text-sm font-medium">
              {user?.shop?.isApproved ? (
                <span className="text-green-600 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" /> Approved
                </span>
              ) : (
                <span className="text-yellow-600">Pending Approval</span>
              )}
            </div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {lostPhones?.total || 0}
            </div>
            <div className="text-gray-600">Active Lost Phone Reports</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {userPosts?.posts?.filter(post => post.isShopCreated).length || 0}
            </div>
            <div className="text-gray-600">Posts Created by Shop</div>
          </div>
        </div>

        {/* Shop Created Posts */}
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Posts Created by Your Shop</h2>
            
            <Link to="/create-post" className="flex items-center text-primary-600 hover:text-primary-700 mt-4 sm:mt-0">
              <PlusIcon className="h-5 w-5 mr-1" />
              Create New Post
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : userPosts?.posts?.filter(post => post.isShopCreated).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.posts
                .filter(post => post.isShopCreated)
                .map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts created by your shop yet
              </h3>
              <p className="text-gray-600 mb-6">
                Help users by creating lost phone reports on their behalf
              </p>
              <Link to="/create-post" className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Post
              </Link>
            </div>
          )}
        </div>

        {/* Recent Lost Phones Section */}
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Lost Phone Reports</h2>
            
            <Link to="/posts" className="flex items-center text-primary-600 hover:text-primary-700 mt-4 sm:mt-0">
              <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
              Search All Reports
            </Link>
          </div>

          {isLoadingLostPhones ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : lostPhones?.posts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostPhones.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No active lost phone reports
              </h3>
              <p className="text-gray-600 mb-6">
                There are currently no active lost phone reports in the system.
              </p>
            </div>
          )}
        </div>

        {/* Shop Guide */}
        <div className="card bg-blue-50 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-800 mb-4">How You Can Help</h2>
          <ul className="space-y-3 text-blue-700">
            <li className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>When customers bring in phones for repair, check the IMEI against our database</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>If you find a match, contact the owner through the platform</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Update your shop profile regularly to maintain accurate contact information</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Regular User Dashboard
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.username}! Manage your lost phone reports.
          </p>
        </div>
        <Link
          to="/create-post"
          className="btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Report Lost Phone
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {statusCounts.total}
          </div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {statusCounts.total}
          </div>
          <div className="text-gray-600">Active Reports</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {statusCounts.total}
          </div>
          <div className="text-gray-600">Resolved Cases</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {user?.role === 'admin' ? 'Admin' : 'User'}
          </div>
          <div className="text-gray-600">Account Type</div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
          
          {/* Status Filter */}
          <div className="flex space-x-2 mt-4 sm:mt-0">
            {['all', 'active', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : userPosts?.posts?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't created any reports yet."
                : `No ${statusFilter} reports found.`
              }
            </p>
            <Link to="/create-post" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Report
            </Link>
          </div>
        )}

        {/* Pagination */}
        {userPosts?.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {[...Array(userPosts.totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    userPosts.currentPage === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 