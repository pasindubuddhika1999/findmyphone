import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const queryClient = useQueryClient();

  // Fetch post details
  const { data: postData, isLoading, error } = useQuery(
    ['post', id],
    async () => {
      const response = await api.get(`/api/posts/${id}`);
      return response.data.post;
    }
  );

  // Mutations
  const deletePostMutation = useMutation(
    async () => {
      await api.delete(`/api/posts/${id}`);
    },
    {
      onSuccess: () => {
        toast.success('Post deleted successfully');
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      },
    }
  );

  const resolvePostMutation = useMutation(
    async () => {
      await api.patch(`/api/posts/${id}/resolve`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['post', id]);
        toast.success('Post marked as resolved');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update post');
      },
    }
  );

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePostMutation.mutate();
    }
  };

  const handleResolve = () => {
    if (window.confirm('Mark this case as resolved? This will change the status to resolved.')) {
      resolvePostMutation.mutate();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: postData?.title,
        text: postData?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  const post = postData;
  const isOwner = isAuthenticated && user?._id === post.author?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ShareIcon className="h-5 w-5 mr-1" />
            Share
          </button>
          
          {(isOwner || isAdmin) && (
            <div className="flex items-center space-x-2">
              {post.status === 'active' && (
                <button
                  onClick={handleResolve}
                  className="btn-secondary text-sm"
                  disabled={resolvePostMutation.isLoading}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Mark Resolved
                </button>
              )}
              
              <Link
                to={`/posts/${id}/edit`}
                className="btn-secondary text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
              
              <button
                onClick={handleDelete}
                className="btn-danger text-sm"
                disabled={deletePostMutation.isLoading}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                {post.isShopCreated ? (
                  <>
                    <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                    <span>Posted by {post.createdByShop?.shopName || 'Shop'}</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>Posted by {post.author?.username || 'Unknown'}</span>
                  </>
                )}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Lost on {formatDate(post.lostDate)}</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                <span>{post.views} views</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <img
                src={post.images[currentImageIndex].url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              
              {/* Image Navigation */}
              {post.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? post.images.length - 1 : prev - 1)}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === post.images.length - 1 ? 0 : prev + 1)}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {post.images.length > 1 && (
              <div className="flex space-x-2 mt-4">
                {post.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${post.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{post.description}</p>
        </div>

        {/* Phone Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Phone Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Brand:</span>
                <span className="font-medium">{post.brand}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{post.phoneModel}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Color:</span>
                <span className="font-medium">{post.color}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">IMEI:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                  {post.imei}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-700">{post.lostLocation}</span>
              </div>
              
              {post.coordinates && (
                <div className="text-sm text-gray-500">
                  Coordinates: {post.coordinates.latitude}, {post.coordinates.longitude}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="btn-primary text-sm"
            >
              {showContactInfo ? 'Hide Contact Info' : 'Show Contact Info'}
            </button>
          </div>

          {showContactInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-medium">{post.contactInfo.name}</span>
              </div>
              
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <a
                  href={`tel:${post.contactInfo.phone}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {post.contactInfo.phone}
                </a>
              </div>
              
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <a
                  href={`mailto:${post.contactInfo.email}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {post.contactInfo.email}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar Posts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Reports</h3>
        <p className="text-gray-600">This feature will show similar lost phone reports based on location and model.</p>
      </div>
    </div>
  );
};

export default PostDetailPage;