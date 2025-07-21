import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  PhoneIcon,
  MapPinIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import SearchForm from '../components/SearchForm';
import PostCard from '../components/PostCard';
import BannerSlider from '../components/BannerSlider';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useState({});
  const navigate = useNavigate();

  // Fetch recent posts
  const { data: recentPosts, isLoading: postsLoading } = useQuery(
    ['posts', 'recent', searchParams],
    async () => {
      const params = new URLSearchParams({
        page: 1,
        limit: 6,
        status: 'active',
        ...searchParams,
      });
      const response = await api.get(`/api/posts?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  // Fetch stats
  const { data: stats } = useQuery('stats', async () => {
    console.log('Fetching statistics...');
    
    // Use Promise.all to fetch all data in parallel
    const [totalResponse, activeResponse, resolvedResponse] = await Promise.all([
      api.get('/api/posts?status=all'),
      api.get('/api/posts?status=active'),
      api.get('/api/posts?status=resolved')
    ]);
    
    const data = {
      totalPosts: totalResponse.data.total || 0,
      activePosts: activeResponse.data.total || 0,
      resolvedPosts: resolvedResponse.data.total || 0
    };
    
    console.log('Stats data:', data);
    return data;
  }, {
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Keep data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Retry on failure
    retry: 3,
    // Make sure the query is run on component mount
    refetchOnMount: true
  });

  const handleSearch = (params) => {
    // Create URL search parameters
    const searchQuery = new URLSearchParams();
    
    // Add all non-empty parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        searchQuery.append(key, value);
      }
    });
    
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Navigate to the Lost Phones page with search parameters
    navigate(`/posts?${searchQuery.toString()}`);
  };

  return (
    <div className="space-y-12">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Call to Action Section */}
      <section className="text-center py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/create-post" className="btn-primary text-base md:text-lg px-6 md:px-8 py-2 md:py-3 w-full sm:w-auto">
                Create Complaint
              </Link>
            ) : (
              <Link to="/register" className="btn-primary text-base md:text-lg px-6 md:px-8 py-2 md:py-3 w-full sm:w-auto">
                Get Started
              </Link>
            )}
            <Link 
              to="/posts" 
              className="btn-secondary text-base md:text-lg px-6 md:px-8 py-2 md:py-3 w-full sm:w-auto"
              onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
            >
              Search Phones
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {stats?.totalPosts || 0}
          </div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats?.activePosts || 0}
          </div>
          <div className="text-gray-600">Active Reports</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats?.resolvedPosts || 0}
          </div>
          <div className="text-gray-600">Resolved Cases</div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Lost Phones</h2>
        <SearchForm onSearch={handleSearch} />
      </section>

      {/* Recent Posts Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
          <Link 
            to="/posts" 
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {postsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts?.posts?.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {recentPosts?.posts?.length === 0 && (
          <div className="text-center py-12">
            <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or be the first to report a lost phone.</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">IMEI Tracking</h3>
          <p className="text-gray-600">
            Search and report phones using their unique IMEI numbers for accurate identification.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPinIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Based</h3>
          <p className="text-gray-600">
            Find phones lost in specific areas with our location-based search and filtering.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Image Support</h3>
          <p className="text-gray-600">
            Upload photos of your lost phone to help others identify and return it to you.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 