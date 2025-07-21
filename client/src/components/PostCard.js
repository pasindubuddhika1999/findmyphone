import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  PhoneIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <Link to={`/posts/${post._id}`} className="block">
      <div className="card hover:shadow-md transition-shadow duration-200 h-full">
        {/* Image */}
        <div className="relative mb-4 flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '200px' }}>
          {post.images && post.images.length > 0 ? (
            <img
              src={post.images[0].url}
              alt={post.title}
              className="max-h-full max-w-full h-auto w-auto object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <PhoneIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2">
            {post.description}
          </p>

          {/* Phone Details */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <PhoneIcon className="h-4 w-4 mr-2" />
              <span className="font-medium">{post.brand} {post.phoneModel}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                IMEI: {post.imei}
              </span>
            </div>
          </div>

          {/* Location and Date */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="truncate max-w-32">{post.lostLocation}</span>
            </div>
            
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(post.lostDate)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{post.views} views</span>
            </div>
            
            <div className="text-sm text-gray-500 flex items-center">
              {post.isShopCreated ? (
                <>
                  <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                  <span>by {post.createdByShop?.shopName || 'Shop'}</span>
                </>
              ) : (
                <span>by {post.author?.username || 'Unknown'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard; 