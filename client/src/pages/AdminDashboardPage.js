import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  TrashIcon,
  UserCircleIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PlusIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery('admin-stats', async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery('admin-users', async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  });

  // Fetch all posts
  const { data: posts, isLoading: postsLoading } = useQuery('admin-posts', async () => {
    const response = await api.get('/api/admin/posts');
    return response.data;
  });

  // User management mutations
  const banUserMutation = useMutation(
    async (userId) => {
      await api.patch(`/api/admin/users/${userId}/ban`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
        toast.success('User status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      },
    }
  );

  const deleteUserMutation = useMutation(
    async (userId) => {
      await api.delete(`/api/admin/users/${userId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
        toast.success('User deleted');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      },
    }
  );

  // Post management mutations
  const deletePostMutation = useMutation(
    async (postId) => {
      await api.delete(`/api/posts/${postId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-posts');
        queryClient.invalidateQueries('admin-stats');
        toast.success('Post deleted');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      },
    }
  );

  const resolvePostMutation = useMutation(
    async (postId) => {
      await api.patch(`/api/posts/${postId}/resolve`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-posts');
        queryClient.invalidateQueries('admin-stats');
        toast.success('Post marked as resolved');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update post');
      },
    }
  );

  // Define tab icons separately
  const DashboardIcon = () => <ChartBarIcon className="h-5 w-5" />;
  const UsersTabIcon = () => <UserCircleIcon className="h-5 w-5" />; 
  const PostsTabIcon = () => <DocumentTextIcon className="h-5 w-5" />;
  const PhoneMetadataIcon = () => <PhoneIcon className="h-5 w-5" />;
  const ShopsIcon = () => <BuildingStorefrontIcon className="h-5 w-5" />;
  const LocationIcon = () => <MapPinIcon className="h-5 w-5" />;

  // Add Phone Metadata Management tab
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: DashboardIcon },
    { id: 'users', name: 'Users', icon: UsersTabIcon },
    { id: 'shops', name: 'Shops', icon: ShopsIcon },
    { id: 'posts', name: 'Posts', icon: PostsTabIcon },
    { id: 'phoneMetadata', name: 'Phone Data', icon: PhoneMetadataIcon },
    { id: 'locations', name: 'Locations', icon: LocationIcon },
  ];

  // Return the appropriate tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab stats={stats} />;
      case 'users':
        return <UsersTab users={users} isLoading={usersLoading} banUserMutation={banUserMutation} deleteUserMutation={deleteUserMutation} />;
      case 'shops':
        return <ShopsTab />;
      case 'posts':
        return <PostsTab posts={posts} isLoading={postsLoading} deletePostMutation={deletePostMutation} resolvePostMutation={resolvePostMutation} />;
      case 'phoneMetadata':
        return <PhoneMetadataTab />;
      case 'locations':
        return <LocationManagementTab />;
      default:
        return null;
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, Administrator
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
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
              <tab.icon />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
};

// Dashboard Tab - Shows summary statistics 
const DashboardTab = ({ stats }) => {
  if (!stats) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Reports</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalPosts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Active Reports</h3>
          <p className="mt-2 text-3xl font-bold">{stats.activePosts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Resolved Cases</h3>
          <p className="mt-2 text-3xl font-bold">{stats.resolvedPosts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Pending Shops</h3>
          <p className="mt-2 text-3xl font-bold">{stats.pendingShops || 0}</p>
          <Link to="/admin/shops" className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <span>Manage Shops</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick Access Cards */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/banners" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Banner Management</h3>
              <p className="text-sm text-gray-500">Manage homepage banner slides</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/shops" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Shop Management</h3>
              <p className="text-sm text-gray-500">Approve and manage repair shops</p>
            </div>
          </div>
        </Link>
        
        <Link to="/admin/locations" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <MapPinIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Location Management</h3>
              <p className="text-sm text-gray-500">Manage districts and towns</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

// Shops Tab - Redirects to the shops management page
const ShopsTab = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved'
  const queryClient = useQueryClient();

  // Fetch shops
  const fetchShops = useQuery(
    ['adminShops', currentPage, filter],
    async () => {
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filter === 'pending') {
        params.isApproved = false;
      } else if (filter === 'approved') {
        params.isApproved = true;
      }

      const response = await api.getShops(params);
      return {
        shops: response.data.shops,
        totalPages: response.data.totalPages
      };
    },
    {
      onSuccess: (data) => {
        setShops(data.shops);
        setTotalPages(data.totalPages);
        setLoading(false);
      },
      onError: () => {
        toast.error('Failed to load shops');
        setLoading(false);
      }
    }
  );

  // Approve shop mutation
  const approveShopMutation = useMutation(
    async (shopId) => {
      return await api.approveShop(shopId);
    },
    {
      onSuccess: () => {
        toast.success('Shop approved successfully');
        queryClient.invalidateQueries('adminShops');
      },
      onError: () => {
        toast.error('Failed to approve shop');
      }
    }
  );

  // Reject shop mutation
  const rejectShopMutation = useMutation(
    async (shopId) => {
      return await api.rejectShop(shopId);
    },
    {
      onSuccess: () => {
        toast.success('Shop rejected successfully');
        queryClient.invalidateQueries('adminShops');
      },
      onError: () => {
        toast.error('Failed to reject shop');
      }
    }
  );

  // Delete shop mutation
  const deleteShopMutation = useMutation(
    async (shopId) => {
      return await api.deleteShop(shopId);
    },
    {
      onSuccess: () => {
        toast.success('Shop deleted successfully');
        queryClient.invalidateQueries('adminShops');
      },
      onError: () => {
        toast.error('Failed to delete shop');
      }
    }
  );

  const handleApprove = (id) => {
    approveShopMutation.mutate(id);
  };

  const handleReject = (id) => {
    if (window.confirm('Are you sure you want to reject this shop? This action cannot be undone.')) {
      rejectShopMutation.mutate(id);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      deleteShopMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div>Loading shops...</div>;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Shop Management</h2>
      
      {/* Filter buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${
            filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded ${
            filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Approved
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shops?.length > 0 ? (
              shops.map(shop => (
                <tr key={shop._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{shop.shopName}</div>
                    <div className="text-xs text-gray-500">{shop.contactNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shop.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shop.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shop.isApproved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(shop.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/shops/${shop._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    {!shop.isApproved && (
                      <>
                        <button
                          onClick={() => handleApprove(shop._id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(shop._id)}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(shop._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No shops found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="px-4 py-1 border-t border-b border-gray-300 bg-white">
              {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

// Users Tab
const UsersTab = ({ users, isLoading, banUserMutation, deleteUserMutation }) => {
  if (isLoading) return <div>Loading users...</div>;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isBanned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Banned</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => banUserMutation.mutate(user._id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        deleteUserMutation.mutate(user._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Posts Tab
const PostsTab = ({ posts, isLoading, deletePostMutation, resolvePostMutation }) => {
  if (isLoading) return <div>Loading posts...</div>;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Post Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts?.map(post => (
              <tr key={post._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-500">{post.imei}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.author.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'active' ? 'bg-green-100 text-green-800' : 
                    post.status === 'resolved' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {post.status === 'active' && (
                    <button
                      onClick={() => resolvePostMutation.mutate(post._id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this post?')) {
                        deletePostMutation.mutate(post._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Phone Metadata Management Tab
const PhoneMetadataTab = () => {
  const [subTab, setSubTab] = useState('brands');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // Form states
  const [brandForm, setBrandForm] = useState({
    name: '',
    logo: ''
  });
  const [modelForm, setModelForm] = useState({
    name: '',
    brandId: '',
    image: ''
  });
  const [colorForm, setColorForm] = useState({
    name: '',
    modelId: '',
    hexCode: ''
  });
  
  // Queries for brands, models, and colors
  const { data: brands, isLoading: isLoadingBrands } = useQuery(
    'adminBrands', 
    async () => {
      const response = await api.get('/api/admin/phone-brands');
      return response.data;
    }
  );
  
  const { data: models, isLoading: isLoadingModels } = useQuery(
    'adminModels', 
    async () => {
      const response = await api.get('/api/admin/phone-models');
      return response.data;
    }
  );
  
  const { data: colors, isLoading: isLoadingColors } = useQuery(
    'adminColors', 
    async () => {
      const response = await api.get('/api/admin/phone-colors');
      return response.data;
    }
  );

  // Mutations
  // Brand mutations
  const createBrandMutation = useMutation(
    async (data) => {
      const response = await api.post('/api/admin/phone-brands', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Brand created successfully');
        queryClient.invalidateQueries('adminBrands');
        setBrandForm({ name: '', logo: '' });
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create brand');
      }
    }
  );
  
  const updateBrandMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/admin/phone-brands/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Brand updated successfully');
        queryClient.invalidateQueries('adminBrands');
        setBrandForm({ name: '', logo: '' });
        setEditingItem(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update brand');
      }
    }
  );
  
  const deleteBrandMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/admin/phone-brands/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Brand deleted successfully');
        queryClient.invalidateQueries('adminBrands');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete brand');
      }
    }
  );

  // Model mutations
  const createModelMutation = useMutation(
    async (data) => {
      const response = await api.post('/api/admin/phone-models', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Model created successfully');
        queryClient.invalidateQueries('adminModels');
        setModelForm({ name: '', brandId: '', image: '' });
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create model');
      }
    }
  );
  
  const updateModelMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/admin/phone-models/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Model updated successfully');
        queryClient.invalidateQueries('adminModels');
        setModelForm({ name: '', brandId: '', image: '' });
        setEditingItem(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update model');
      }
    }
  );
  
  const deleteModelMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/admin/phone-models/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Model deleted successfully');
        queryClient.invalidateQueries('adminModels');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete model');
      }
    }
  );

  // Color mutations
  const createColorMutation = useMutation(
    async (data) => {
      try {
        const response = await api.post('/api/admin/phone-colors', data);
        return response.data;
      } catch (error) {
        console.error('Color creation error:', error.response?.data || error.message);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('Color created successfully');
        queryClient.invalidateQueries('adminColors');
        setColorForm({ name: '', modelId: '', hexCode: '' });
        setShowForm(false);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to create color';
        const validationErrors = error.response?.data?.errors;
        if (validationErrors?.length > 0) {
          const errorDetails = validationErrors.map(err => `${err.param}: ${err.msg}`).join(', ');
          toast.error(`${errorMessage}: ${errorDetails}`);
        } else {
          toast.error(errorMessage);
        }
      }
    }
  );
  
  const updateColorMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/admin/phone-colors/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Color updated successfully');
        queryClient.invalidateQueries('adminColors');
        setColorForm({ name: '', modelId: '', hexCode: '' });
        setEditingItem(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update color');
      }
    }
  );
  
  const deleteColorMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/admin/phone-colors/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Color deleted successfully');
        queryClient.invalidateQueries('adminColors');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete color');
      }
    }
  );

  // Handlers
  const handleBrandSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateBrandMutation.mutate({ id: editingItem._id, data: brandForm });
    } else {
      createBrandMutation.mutate(brandForm);
    }
  };
  
  const handleModelSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateModelMutation.mutate({ id: editingItem._id, data: modelForm });
    } else {
      createModelMutation.mutate(modelForm);
    }
  };
  
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
    
    if (subTab === 'brands') {
      setBrandForm({
        name: item.name
      });
    } else if (subTab === 'models') {
      setModelForm({
        name: item.name,
        brandId: item.brand._id
      });
    } else if (subTab === 'colors') {
      setColorForm({
        name: item.name,
        modelId: item.phoneModel._id,
        hexCode: item.hexCode || ''
      });
    }
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (subTab === 'brands') {
        deleteBrandMutation.mutate(id);
      } else if (subTab === 'models') {
        deleteModelMutation.mutate(id);
      } else if (subTab === 'colors') {
        deleteColorMutation.mutate(id);
      }
    }
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
    
    if (subTab === 'brands') {
      setBrandForm({ name: '' });
    } else if (subTab === 'models') {
      setModelForm({ name: '', brandId: '' });
    } else if (subTab === 'colors') {
      setColorForm({ name: '', modelId: '', hexCode: '' });
    }
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };
  
  // Render brand form
  const renderBrandForm = () => (
    <form onSubmit={handleBrandSubmit} className="space-y-4 p-4 bg-gray-50 rounded-md">
      <h3 className="text-lg font-medium">{editingItem ? 'Edit Brand' : 'Add New Brand'}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          value={brandForm.name}
          onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
          className="input-field mt-1"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleFormCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={createBrandMutation.isLoading || updateBrandMutation.isLoading}
        >
          {(createBrandMutation.isLoading || updateBrandMutation.isLoading) ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
  
  // Render model form
  const renderModelForm = () => (
    <form onSubmit={handleModelSubmit} className="space-y-4 p-4 bg-gray-50 rounded-md">
      <h3 className="text-lg font-medium">{editingItem ? 'Edit Model' : 'Add New Model'}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Brand *</label>
        <select
          value={modelForm.brandId}
          onChange={(e) => setModelForm({...modelForm, brandId: e.target.value})}
          className="input-field mt-1"
          required
        >
          <option value="">Select a brand</option>
          {brands?.map(brand => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Model Name *</label>
        <input
          type="text"
          value={modelForm.name}
          onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
          className="input-field mt-1"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleFormCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={createModelMutation.isLoading || updateModelMutation.isLoading}
        >
          {(createModelMutation.isLoading || updateModelMutation.isLoading) ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
  
  // Render color form
  const renderColorForm = () => {
    // Helper function to validate hex color code
    const validateHexColor = (hexCode) => {
      // Allow empty string
      if (!hexCode || hexCode === '') return true;
      // Check for valid hex format with or without # prefix
      const hexPattern = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
      return hexPattern.test(hexCode);
    };
    
    // Handle hex code change
    const handleHexCodeChange = (e) => {
      const value = e.target.value;
      setColorForm({...colorForm, hexCode: value});
    };
    
    // Handle color form submit
    const handleSubmitWithValidation = (e) => {
      e.preventDefault();
      
      // Check if model is selected
      if (!colorForm.modelId) {
        toast.error('Please select a phone model');
        return;
      }
      
      // Check if name is provided
      if (!colorForm.name.trim()) {
        toast.error('Please enter a color name');
        return;
      }
      
      // Validate hex color code if provided
      if (colorForm.hexCode && !validateHexColor(colorForm.hexCode)) {
        toast.error('Invalid hex color code format. Use #RGB or #RRGGBB format');
        return;
      }
      
      // Format hex code to include # if missing
      const formData = {...colorForm};
      if (formData.hexCode && !formData.hexCode.startsWith('#') && formData.hexCode !== '') {
        formData.hexCode = '#' + formData.hexCode;
      }
      
      // Submit form
      if (editingItem) {
        updateColorMutation.mutate({ id: editingItem._id, data: formData });
      } else {
        createColorMutation.mutate(formData);
      }
    };
    
    return (
      <form onSubmit={handleSubmitWithValidation} className="space-y-4 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium">{editingItem ? 'Edit Color' : 'Add New Color'}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Model *</label>
          <select
            value={colorForm.modelId}
            onChange={(e) => setColorForm({...colorForm, modelId: e.target.value})}
            className="input-field mt-1"
            required
          >
            <option value="">Select a model</option>
            {models?.map(model => (
              <option key={model._id} value={model._id}>
                {model.brand.name} - {model.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Color Name *</label>
          <input
            type="text"
            value={colorForm.name}
            onChange={(e) => setColorForm({...colorForm, name: e.target.value})}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hex Color Code 
            <span className="ml-1 text-gray-400 text-xs">(optional, ex: #000000)</span>
          </label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              value={colorForm.hexCode}
              onChange={handleHexCodeChange}
              className="input-field"
              placeholder="#000000"
            />
            {colorForm.hexCode && validateHexColor(colorForm.hexCode) && (
              <div 
                className="ml-2 w-8 h-8 rounded-full border border-gray-300" 
                style={{ backgroundColor: colorForm.hexCode.startsWith('#') ? colorForm.hexCode : '#' + colorForm.hexCode }}
              ></div>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleFormCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={createColorMutation.isLoading || updateColorMutation.isLoading}
          >
            {(createColorMutation.isLoading || updateColorMutation.isLoading) ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    );
  };
  
  // Sub tabs for phone metadata management
  const renderSubTabs = () => (
    <div className="mb-4">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setSubTab('brands')}
            className={`pb-4 px-1 ${
              subTab === 'brands'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Brands
          </button>
          <button
            onClick={() => setSubTab('models')}
            className={`pb-4 px-1 ${
              subTab === 'models'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Models
          </button>
          <button
            onClick={() => setSubTab('colors')}
            className={`pb-4 px-1 ${
              subTab === 'colors'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Colors
          </button>
        </nav>
      </div>
    </div>
  );

  // Render brands table
  const renderBrandsTable = () => (
    <div className="mt-4">
      {isLoadingBrands ? (
        <div className="text-center py-4">Loading brands...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand Name
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands?.length > 0 ? (
              brands.map(brand => (
                <tr key={brand._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {brand.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                  No brands found. Add a new brand to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render models table
  const renderModelsTable = () => (
    <div className="mt-4">
      {isLoadingModels ? (
        <div className="text-center py-4">Loading models...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model Name
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models?.length > 0 ? (
              models.map(model => (
                <tr key={model._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {model.brand.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {model.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(model)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(model._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No models found. Add brands first, then create models.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render colors table
  const renderColorsTable = () => (
    <div className="mt-4">
      {isLoadingColors ? (
        <div className="text-center py-4">Loading colors...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Model
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color Preview
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {colors?.length > 0 ? (
              colors.map(color => (
                <tr key={color._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {color.phoneModel.brand.name} - {color.phoneModel.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {color.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {color.hexCode ? (
                      <div 
                        className="h-6 w-6 rounded-full border border-gray-300" 
                        style={{ backgroundColor: color.hexCode }}
                      ></div>
                    ) : (
                      <span className="text-gray-400">No color code</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(color)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(color._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No colors found. Add models first, then create colors.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Phone Metadata Management</h2>
        <button
          onClick={handleAddNew}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New {subTab === 'brands' ? 'Brand' : subTab === 'models' ? 'Model' : 'Color'}
        </button>
      </div>
      
      {renderSubTabs()}
      
      {showForm && (
        <div className="mb-6">
          {subTab === 'brands' && renderBrandForm()}
          {subTab === 'models' && renderModelForm()}
          {subTab === 'colors' && renderColorForm()}
        </div>
      )}
      
      {subTab === 'brands' && renderBrandsTable()}
      {subTab === 'models' && renderModelsTable()}
      {subTab === 'colors' && renderColorsTable()}
    </div>
  );
};

// Location Management Tab
const LocationManagementTab = () => {
  const [subTab, setSubTab] = useState('districts');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // Form states
  const [districtForm, setDistrictForm] = useState({
    name: '',
  });
  const [townForm, setTownForm] = useState({
    name: '',
    districtId: '',
  });
  
  // Queries for districts and towns
  const { data: districts, isLoading: isLoadingDistricts } = useQuery(
    'adminDistricts', 
    async () => {
      const response = await api.get('/api/admin/districts');
      return response.data;
    }
  );
  
  const { data: towns, isLoading: isLoadingTowns } = useQuery(
    'adminTowns', 
    async () => {
      const response = await api.get('/api/admin/towns');
      return response.data;
    }
  );

  // Mutations
  // District mutations
  const createDistrictMutation = useMutation(
    async (data) => {
      const response = await api.post('/api/admin/districts', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('District created successfully');
        queryClient.invalidateQueries('adminDistricts');
        setDistrictForm({ name: '' });
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create district');
      }
    }
  );
  
  const updateDistrictMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/admin/districts/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('District updated successfully');
        queryClient.invalidateQueries('adminDistricts');
        setDistrictForm({ name: '' });
        setEditingItem(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update district');
      }
    }
  );
  
  const deleteDistrictMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/admin/districts/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('District deleted successfully');
        queryClient.invalidateQueries('adminDistricts');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete district');
      }
    }
  );

  // Town mutations
  const createTownMutation = useMutation(
    async (data) => {
      const response = await api.post('/api/admin/towns', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Town created successfully');
        queryClient.invalidateQueries('adminTowns');
        setTownForm({ name: '', districtId: '' });
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create town');
      }
    }
  );
  
  const updateTownMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/api/admin/towns/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Town updated successfully');
        queryClient.invalidateQueries('adminTowns');
        setTownForm({ name: '', districtId: '' });
        setEditingItem(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update town');
      }
    }
  );
  
  const deleteTownMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/api/admin/towns/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Town deleted successfully');
        queryClient.invalidateQueries('adminTowns');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete town');
      }
    }
  );

  // Handlers
  const handleDistrictSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateDistrictMutation.mutate({ id: editingItem._id, data: districtForm });
    } else {
      createDistrictMutation.mutate(districtForm);
    }
  };
  
  const handleTownSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateTownMutation.mutate({ id: editingItem._id, data: townForm });
    } else {
      createTownMutation.mutate(townForm);
    }
  };
  
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
    
    if (subTab === 'districts') {
      setDistrictForm({
        name: item.name,
      });
    } else if (subTab === 'towns') {
      setTownForm({
        name: item.name,
        districtId: item.district._id,
      });
    }
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (subTab === 'districts') {
        deleteDistrictMutation.mutate(id);
      } else if (subTab === 'towns') {
        deleteTownMutation.mutate(id);
      }
    }
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
    
    if (subTab === 'districts') {
      setDistrictForm({ name: '' });
    } else if (subTab === 'towns') {
      setTownForm({ name: '', districtId: '' });
    }
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };
  
  // Render district form
  const renderDistrictForm = () => (
    <form onSubmit={handleDistrictSubmit} className="space-y-4 p-4 bg-gray-50 rounded-md">
      <h3 className="text-lg font-medium">{editingItem ? 'Edit District' : 'Add New District'}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          value={districtForm.name}
          onChange={(e) => setDistrictForm({...districtForm, name: e.target.value})}
          className="input-field mt-1"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleFormCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={createDistrictMutation.isLoading || updateDistrictMutation.isLoading}
        >
          {(createDistrictMutation.isLoading || updateDistrictMutation.isLoading) ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
  
  // Render town form
  const renderTownForm = () => (
    <form onSubmit={handleTownSubmit} className="space-y-4 p-4 bg-gray-50 rounded-md">
      <h3 className="text-lg font-medium">{editingItem ? 'Edit Town' : 'Add New Town'}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">District *</label>
        <select
          value={townForm.districtId}
          onChange={(e) => setTownForm({...townForm, districtId: e.target.value})}
          className="input-field mt-1"
          required
        >
          <option value="">Select a district</option>
          {districts?.map(district => (
            <option key={district._id} value={district._id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Town Name *</label>
        <input
          type="text"
          value={townForm.name}
          onChange={(e) => setTownForm({...townForm, name: e.target.value})}
          className="input-field mt-1"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleFormCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={createTownMutation.isLoading || updateTownMutation.isLoading}
        >
          {(createTownMutation.isLoading || updateTownMutation.isLoading) ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
  
  // Sub tabs for location management
  const renderSubTabs = () => (
    <div className="mb-4">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setSubTab('districts')}
            className={`pb-4 px-1 ${
              subTab === 'districts'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Districts
          </button>
          <button
            onClick={() => setSubTab('towns')}
            className={`pb-4 px-1 ${
              subTab === 'towns'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Towns
          </button>
        </nav>
      </div>
    </div>
  );

  // Render districts table
  const renderDistrictsTable = () => (
    <div className="mt-4">
      {isLoadingDistricts ? (
        <div className="text-center py-4">Loading districts...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District Name
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {districts?.length > 0 ? (
              districts.map(district => (
                <tr key={district._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {district.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(district)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(district._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                  No districts found. Add a new district to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render towns table
  const renderTownsTable = () => (
    <div className="mt-4">
      {isLoadingTowns ? (
        <div className="text-center py-4">Loading towns...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Town Name
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {towns?.length > 0 ? (
              towns.map(town => (
                <tr key={town._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {town.district.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {town.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(town)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(town._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No towns found. Add districts first, then create towns.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Location Management</h2>
        <button
          onClick={handleAddNew}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New {subTab === 'districts' ? 'District' : 'Town'}
        </button>
      </div>
      
      {renderSubTabs()}
      
      {showForm && (
        <div className="mb-6">
          {subTab === 'districts' && renderDistrictForm()}
          {subTab === 'towns' && renderTownForm()}
        </div>
      )}
      
      {subTab === 'districts' && renderDistrictsTable()}
      {subTab === 'towns' && renderTownsTable()}
    </div>
  );
};

export default AdminDashboardPage; 