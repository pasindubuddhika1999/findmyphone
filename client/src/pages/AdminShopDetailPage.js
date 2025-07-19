import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminShopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShopDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getShopById(id);
      setShop(response.data.shop);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch shop details');
      toast.error('Failed to load shop details');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShopDetails();
  }, [fetchShopDetails]);

  const handleApprove = async () => {
    try {
      await api.approveShop(id);
      toast.success('Shop approved successfully');
      fetchShopDetails();
    } catch (err) {
      toast.error('Failed to approve shop');
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this shop? This action cannot be undone.')) {
      try {
        await api.rejectShop(id);
        toast.success('Shop rejected successfully');
        navigate('/admin/shops');
      } catch (err) {
        toast.error('Failed to reject shop');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You do not have permission to access this page.</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-4">
          <div className="spinner"></div>
          <p>Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Shop not found'}
        </div>
        <div className="mt-4">
          <Link to="/admin/shops" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/admin/shops" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Shops
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{shop.shopName}</h1>
            <div>
              {shop.isApproved ? (
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

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Shop Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-medium">Shop Name:</span>
                  <p>{shop.shopName}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Owner Name:</span>
                  <p>{shop.ownerName}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Contact Number:</span>
                  <p>{shop.contactNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Location:</span>
                  <p>{shop.location}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Address:</span>
                  <p>{shop.address}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Description:</span>
                  <p>{shop.description || 'No description provided'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-medium">Username:</span>
                  <p>{shop.user?.username}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Email:</span>
                  <p>{shop.user?.email}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <p>{shop.user?.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Registered On:</span>
                  <p>{formatDate(shop.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Last Login:</span>
                  <p>{formatDate(shop.user?.lastLogin)}</p>
                </div>
                {shop.isApproved && (
                  <div>
                    <span className="text-gray-600 font-medium">Approved On:</span>
                    <p>{formatDate(shop.approvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!shop.isApproved && (
            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve Shop
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShopDetailPage; 