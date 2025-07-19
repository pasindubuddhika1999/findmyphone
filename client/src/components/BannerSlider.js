import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get('/api/banners');
        console.log('Fetched banners:', response.data);
        setBanners(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError('Failed to load banner slides');
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // If no banners are available, use a default banner
  useEffect(() => {
    if (!loading && banners.length === 0) {
      setBanners([{
        _id: 'default',
        title: 'Lost Your Phone?',
        subtitle: 'Report it here and get help finding it',
        imageUrl: '/images/logo.svg',
        buttonText: 'Report Now',
        buttonLink: '/create-post'
      }]);
    }
  }, [loading, banners.length]);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  if (loading) {
    return (
      <div className="relative h-96 w-full bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">Loading banner...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-96 w-full bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative h-96 w-full overflow-hidden">
      {/* Banner Slides */}
      <div className="h-full w-full relative">
        {banners.map((banner, index) => (
          <div 
            key={banner._id} 
            className={`absolute top-0 left-0 h-full w-full transition-opacity duration-500 ease-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ 
              backgroundImage: `url(${banner.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4 md:px-8 max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{banner.title}</h1>
                {banner.subtitle && (
                  <p className="text-lg md:text-xl mb-6">{banner.subtitle}</p>
                )}
                <Link 
                  to={banner.buttonLink} 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  {banner.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 text-white transition duration-300 z-20"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 text-white transition duration-300 z-20"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                currentIndex === index ? "bg-white w-6" : "bg-white bg-opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider; 