import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import PostCard from '../components/PostCard';
import SearchForm from '../components/SearchForm';

const LostPhonesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(location.search);
  const initialPage = parseInt(urlParams.get('page')) || 1;
  const initialSort = urlParams.get('sort') || 'newest';
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortOption, setSortOption] = useState(initialSort);
  const [searchParams, setSearchParams] = useState({
    search: urlParams.get('search') || '',
    imei: urlParams.get('imei') || '',
    brand: urlParams.get('brand') || '',
    model: urlParams.get('model') || '',
    location: urlParams.get('location') || '',
  });
  const [activeFilters, setActiveFilters] = useState(0);

  // Scroll to top when component mounts or search params change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.search]);

  // Update URL when page, sort or search params change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    if (sortOption !== 'newest') {
      params.set('sort', sortOption);
    }
    
    let filterCount = 0;
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
        if (key !== 'search') filterCount++;
      }
    });
    
    setActiveFilters(filterCount);
    
    const queryString = params.toString();
    navigate(`/posts${queryString ? `?${queryString}` : ''}`, { replace: true });
  }, [currentPage, sortOption, searchParams, navigate]);

  // Map sort options to API parameters
  const getSortParams = () => {
    switch (sortOption) {
      case 'oldest':
        return { sortBy: 'createdAt', sortOrder: 'asc' };
      case 'relevance':
        return { sortBy: 'score', sortOrder: 'desc' };
      case 'newest':
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  };

  // Fetch posts data with pagination and sorting
  const { data, isLoading, error } = useQuery(
    ['posts', currentPage, sortOption, searchParams],
    async () => {
      const sortParams = getSortParams();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12, // Show 12 posts per page
        status: 'active',
        ...sortParams,
        ...Object.fromEntries(Object.entries(searchParams).filter(([_, v]) => v))
      });
      
      const response = await api.get(`/api/posts?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = (params) => {
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Find Lost Phones</h1>
          <p className="text-blue-100 mb-6 max-w-2xl">
            Search our database of reported lost phones. Enter details like IMEI, brand, or model to find specific devices.
          </p>
          
          <div className="relative z-20">
            <SearchForm onSearch={handleSearch} initialValues={searchParams} />
          </div>
          
          {activeFilters > 0 && (
            <div className="mt-4 flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-800 text-white">
                {activeFilters} {activeFilters === 1 ? 'filter' : 'filters'} active
              </span>
              <button 
                onClick={() => handleSearch({})}
                className="ml-2 text-xs text-blue-200 hover:text-white flex items-center"
              >
                <XMarkIcon className="h-3 w-3 mr-1" />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-900">Results</h2>
          {data?.total > 0 && (
            <span className="ml-3 text-sm text-gray-500">
              {data.total} {data.total === 1 ? 'phone' : 'phones'} found
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {data?.total > 0 && (
            <select 
              className="border border-gray-300 rounded-md text-sm py-1.5 px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="relevance">Most relevant</option>
            </select>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-8"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-red-500 mb-4 text-lg font-medium">Failed to load posts</div>
          <p className="text-gray-600">Please try again later or refine your search criteria</p>
          <button 
            onClick={() => handleSearch({})}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Reset Search
          </button>
        </div>
      ) : data?.posts?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            {[...Array(data.totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              
              // Show current page, first and last pages, and one page before and after current
              if (
                pageNumber === 1 ||
                pageNumber === data.totalPages ||
                pageNumber === currentPage ||
                pageNumber === currentPage - 1 ||
                pageNumber === currentPage + 1
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 rounded-md ${
                      pageNumber === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              
              // Show ellipsis for gaps in pagination
              if (
                pageNumber === 2 ||
                pageNumber === data.totalPages - 1
              ) {
                return (
                  <span key={pageNumber} className="text-gray-500 px-2">
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.totalPages}
              className={`p-2 rounded-md ${
                currentPage === data.totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-2">
            Showing page {currentPage} of {data.totalPages} ({data.total} total phones)
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lost phones found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {Object.values(searchParams).some(v => v) 
              ? "Try adjusting your search criteria or removing some filters" 
              : "There are currently no active lost phone reports"}
          </p>
          {Object.values(searchParams).some(v => v) && (
            <button 
              onClick={() => handleSearch({})}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LostPhonesPage; 