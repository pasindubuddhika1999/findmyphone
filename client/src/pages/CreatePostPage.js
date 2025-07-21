import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import {
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ChevronDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isShop = user?.role === 'shop';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imei: '',
    phoneModel: '',
    brand: '',
    color: '',
    district: '',
    town: '',
    lostLocation: '',
    lostDate: '',
    contactInfo: {
      name: '',
      phone: '',
      email: '',
    },
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Dropdown state
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [colorSearch, setColorSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [townSearch, setTownSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showTownDropdown, setShowTownDropdown] = useState(false);

  // Fetch brands
  const { data: brandsData, isLoading: isLoadingBrands, error: brandsError } = useQuery('brands', async () => {
    try {
      console.log('Fetching phone brands...');
      const response = await api.getPhoneBrands();
      console.log('Phone brands response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching phone brands:', error);
      throw error;
    }
  });

  // Fetch districts
  const { data: districtsData, isLoading: isLoadingDistricts, error: districtsError } = useQuery('districts', async () => {
    try {
      console.log('Fetching districts...');
      const response = await api.getDistricts();
      console.log('Districts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  });

  // Log any brand loading errors
  useEffect(() => {
    if (brandsError) {
      console.error('Brand loading error:', brandsError);
      toast.error('Failed to load phone brands');
    }
  }, [brandsError]);

  // Log any district loading errors
  useEffect(() => {
    if (districtsError) {
      console.error('District loading error:', districtsError);
      toast.error('Failed to load districts');
    }
  }, [districtsError]);

  // Fetch models when brand is selected or search changes
  const { data: modelsData, isLoading: isLoadingModels } = useQuery(
    ['models', selectedBrandId, modelSearch], 
    async () => {
      if (!selectedBrandId && !modelSearch) return [];
      try {
        console.log('Fetching phone models with brandId:', selectedBrandId);
        const response = await api.getPhoneModels(selectedBrandId, modelSearch);
        console.log('Phone models response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching phone models:', error);
        throw error;
      }
    },
    { enabled: !!selectedBrandId || !!modelSearch }
  );

  // Fetch towns when district is selected or search changes
  const { data: townsData, isLoading: isLoadingTowns } = useQuery(
    ['towns', selectedDistrictId, townSearch], 
    async () => {
      if (!selectedDistrictId && !townSearch) return [];
      try {
        console.log('Fetching towns with districtId:', selectedDistrictId);
        const response = await api.getTowns(selectedDistrictId);
        console.log('Towns response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching towns:', error);
        throw error;
      }
    },
    { enabled: !!selectedDistrictId || !!townSearch }
  );

  // Fetch colors when model is selected or search changes
  const { data: colorsData, isLoading: isLoadingColors } = useQuery(
    ['colors', selectedModelId, colorSearch],
    async () => {
      if (!selectedModelId && !colorSearch) return [];
      try {
        console.log('Fetching phone colors with modelId:', selectedModelId);
        const response = await api.getPhoneColors(selectedModelId, colorSearch);
        console.log('Phone colors response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching phone colors:', error);
        throw error;
      }
    },
    { enabled: !!selectedModelId || !!colorSearch }
  );

  // Filter brands by search
  const filteredBrands = React.useMemo(() => {
    if (!brandsData) return [];
    if (!brandSearch) return brandsData;
    
    return brandsData.filter(brand => 
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brandsData, brandSearch]);

  // Filter districts by search
  const filteredDistricts = React.useMemo(() => {
    if (!districtsData) return [];
    if (!districtSearch) return districtsData;
    
    return districtsData.filter(district => 
      district.name.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [districtsData, districtSearch]);

  const createPostMutation = useMutation(
    async (postData) => {
      // Use the specialized uploadFormData method for FormData
      const response = await api.uploadFormData('/api/posts', postData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Post created successfully!');
        navigate(`/posts/${data.post._id}`);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to create post';
        toast.error(message);
      },
    }
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.imei.trim()) {
      newErrors.imei = 'IMEI is required';
    } else if (!/^\d{15}$/.test(formData.imei)) {
      newErrors.imei = 'IMEI must be exactly 15 digits';
    }

    if (!formData.phoneModel.trim()) {
      newErrors.phoneModel = 'Phone model is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.town.trim()) {
      newErrors.town = 'Town is required';
    }

    if (!formData.lostLocation.trim()) {
      newErrors.lostLocation = 'Lost location is required';
    }

    if (!formData.lostDate) {
      newErrors.lostDate = 'Lost date is required';
    }

    if (!formData.contactInfo.name.trim()) {
      newErrors['contactInfo.name'] = 'Contact name is required';
    }

    if (!formData.contactInfo.phone.trim()) {
      newErrors['contactInfo.phone'] = 'Contact phone is required';
    }

    // Email is optional, but if provided, it should be valid
    if (formData.contactInfo.email.trim() && !/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      newErrors['contactInfo.email'] = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return false;
      }
      return true;
    });

    if (validFiles.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, { url: e.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setFormData(prev => ({
      ...prev,
      brand: brand.name,
      // Clear dependent fields
      phoneModel: '',
      color: ''
    }));
    setSelectedBrandId(brand._id);
    setSelectedModelId('');
    setShowBrandDropdown(false);
    
    // Clear errors
    if (errors.brand) {
      setErrors(prev => ({
        ...prev,
        brand: ''
      }));
    }
  };

  // Handle model selection
  const handleModelSelect = (model) => {
    setFormData(prev => ({
      ...prev,
      phoneModel: model.name,
      // Clear dependent field
      color: ''
    }));
    setSelectedModelId(model._id);
    setShowModelDropdown(false);
    
    // Clear errors
    if (errors.phoneModel) {
      setErrors(prev => ({
        ...prev,
        phoneModel: ''
      }));
    }
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color.name
    }));
    setShowColorDropdown(false);
    
    // Clear errors
    if (errors.color) {
      setErrors(prev => ({
        ...prev,
        color: ''
      }));
    }
  };

  // Handle district selection
  const handleDistrictSelect = (district) => {
    setFormData(prev => ({
      ...prev,
      district: district.name,
      // Clear dependent field
      town: ''
    }));
    setSelectedDistrictId(district._id);
    setShowDistrictDropdown(false);
    
    // Clear errors
    if (errors.district) {
      setErrors(prev => ({
        ...prev,
        district: ''
      }));
    }
  };

  // Handle town selection
  const handleTownSelect = (town) => {
    setFormData(prev => ({
      ...prev,
      town: town.name
    }));
    setShowTownDropdown(false);
    
    // Clear errors
    if (errors.town) {
      setErrors(prev => ({
        ...prev,
        town: ''
      }));
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setShowBrandDropdown(false);
        setShowModelDropdown(false);
        setShowColorDropdown(false);
        setShowDistrictDropdown(false);
        setShowTownDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create a FormData object to handle file uploads
      const formDataObj = new FormData();
    
      // Append all form fields
    Object.keys(formData).forEach(key => {
        if (key !== 'contactInfo') {
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Append nested contact info
      Object.keys(formData.contactInfo).forEach(key => {
        formDataObj.append(`contactInfo[${key}]`, formData.contactInfo[key]);
    });

      // Append each image file
      imageFiles.forEach(file => {
        formDataObj.append('images', file);
    });

      createPostMutation.mutate(formDataObj);
    } catch (error) {
      toast.error('Failed to create post');
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Lost Phone</h1>
        <p className="text-gray-600">
          Fill out the form below with accurate information about the lost phone.
        </p>
      </div>

      {isShop && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You are creating this post as a shop. This post will be marked as created by your shop, 
                helping the owner find their lost phone through your assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Brief description of the lost phone"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMEI Number *
                </label>
                <input
                  type="text"
                  name="imei"
                  value={formData.imei}
                  onChange={handleChange}
                  maxLength="15"
                  className={`input-field font-mono ${errors.imei ? 'border-red-500' : ''}`}
                  placeholder="15-digit IMEI number"
                />
                {errors.imei && (
                  <p className="mt-1 text-sm text-red-600">{errors.imei}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Provide detailed description of the phone, any unique features, damage, etc."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Phone Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Phone Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Brand Dropdown */}
              <div className="dropdown-container relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <div className="relative">
                <input
                  type="text"
                  value={formData.brand}
                    onChange={(e) => {
                      setFormData(prev => ({...prev, brand: e.target.value}));
                      setBrandSearch(e.target.value);
                      setShowBrandDropdown(true);
                      // Clear dependent fields
                      if (e.target.value !== formData.brand) {
                        setFormData(prev => ({
                          ...prev,
                          phoneModel: '',
                          color: ''
                        }));
                        setSelectedBrandId('');
                        setSelectedModelId('');
                      }
                    }}
                    onClick={() => setShowBrandDropdown(true)}
                    className={`input-field pr-10 ${errors.brand ? 'border-red-500' : ''}`}
                  placeholder="e.g., Samsung, iPhone"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {errors.brand && (
                  <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                )}

                {/* Brand dropdown */}
                {showBrandDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {isLoadingBrands ? (
                      <div className="px-4 py-2 text-gray-500">Loading brands...</div>
                    ) : filteredBrands?.length > 0 ? (
                      filteredBrands.map((brand) => (
                        <div
                          key={brand._id}
                          onClick={() => handleBrandSelect(brand)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                        >
                          {brand.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No brands found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Model Dropdown */}
              <div className="dropdown-container relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <div className="relative">
                <input
                  type="text"
                  value={formData.phoneModel}
                    onChange={(e) => {
                      setFormData(prev => ({...prev, phoneModel: e.target.value}));
                      setModelSearch(e.target.value);
                      setShowModelDropdown(true);
                      // Clear dependent field
                      if (e.target.value !== formData.phoneModel) {
                        setFormData(prev => ({...prev, color: ''}));
                        setSelectedModelId('');
                      }
                    }}
                    onClick={() => setShowModelDropdown(true)}
                    className={`input-field pr-10 ${errors.phoneModel ? 'border-red-500' : ''}`}
                  placeholder="e.g., Galaxy S21, iPhone 13"
                    disabled={!formData.brand}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    disabled={!formData.brand}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {errors.phoneModel && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneModel}</p>
                )}

                {/* Model dropdown */}
                {showModelDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {isLoadingModels ? (
                      <div className="px-4 py-2 text-gray-500">Loading models...</div>
                    ) : modelsData?.length > 0 ? (
                      modelsData.map((model) => (
                        <div
                          key={model._id}
                          onClick={() => handleModelSelect(model)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                        >
                          {model.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        {selectedBrandId ? "No models found for this brand" : "Select a brand first"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Color Dropdown */}
              <div className="dropdown-container relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <div className="relative">
                <input
                  type="text"
                  value={formData.color}
                    onChange={(e) => {
                      setFormData(prev => ({...prev, color: e.target.value}));
                      setColorSearch(e.target.value);
                      setShowColorDropdown(true);
                    }}
                    onClick={() => setShowColorDropdown(true)}
                    className={`input-field pr-10 ${errors.color ? 'border-red-500' : ''}`}
                  placeholder="e.g., Black, White, Blue"
                    disabled={!formData.phoneModel}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowColorDropdown(!showColorDropdown)}
                    disabled={!formData.phoneModel}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                )}

                {/* Color dropdown */}
                {showColorDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {isLoadingColors ? (
                      <div className="px-4 py-2 text-gray-500">Loading colors...</div>
                    ) : colorsData?.length > 0 ? (
                      colorsData.map((color) => (
                        <div
                          key={color._id}
                          onClick={() => handleColorSelect(color)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            {color.hexCode && (
                              <span 
                                className="h-4 w-4 mr-2 rounded-full border border-gray-300" 
                                style={{ backgroundColor: color.hexCode }}
                              />
                            )}
                            {color.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        {selectedModelId ? "No colors found for this model" : "Select a model first"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lost Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lost Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* District Dropdown */}
              <div className="dropdown-container relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => {
                      setFormData(prev => ({...prev, district: e.target.value}));
                      setDistrictSearch(e.target.value);
                      setShowDistrictDropdown(true);
                      // Clear dependent fields
                      if (e.target.value !== formData.district) {
                        setFormData(prev => ({
                          ...prev,
                          town: ''
                        }));
                        setSelectedDistrictId('');
                      }
                    }}
                    onClick={() => setShowDistrictDropdown(true)}
                    className={`input-field pr-10 ${errors.district ? 'border-red-500' : ''}`}
                    placeholder="e.g., Colombo, Kandy"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}

                {/* District dropdown */}
                {showDistrictDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {isLoadingDistricts ? (
                      <div className="px-4 py-2 text-gray-500">Loading districts...</div>
                    ) : filteredDistricts?.length > 0 ? (
                      filteredDistricts.map((district) => (
                        <div
                          key={district._id}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                          onClick={() => handleDistrictSelect(district)}
                        >
                          {district.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No districts found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Town Dropdown */}
              <div className="dropdown-container relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Town *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.town}
                    onChange={(e) => {
                      setFormData(prev => ({...prev, town: e.target.value}));
                      setTownSearch(e.target.value);
                      setShowTownDropdown(true);
                    }}
                    onClick={() => setShowTownDropdown(true)}
                    className={`input-field pr-10 ${errors.town ? 'border-red-500' : ''}`}
                    placeholder="e.g., Nugegoda, Kandy City"
                    autoComplete="off"
                    disabled={!selectedDistrictId}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowTownDropdown(!showTownDropdown)}
                    disabled={!selectedDistrictId}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {errors.town && (
                  <p className="mt-1 text-sm text-red-600">{errors.town}</p>
                )}
                {!selectedDistrictId && !errors.town && (
                  <p className="mt-1 text-sm text-gray-500">Please select a district first</p>
                )}

                {/* Town dropdown */}
                {showTownDropdown && selectedDistrictId && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {isLoadingTowns ? (
                      <div className="px-4 py-2 text-gray-500">Loading towns...</div>
                    ) : townsData?.length > 0 ? (
                      townsData.map((town) => (
                        <div
                          key={town._id}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                          onClick={() => handleTownSelect(town)}
                        >
                          {town.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No towns found for this district</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Location *
                </label>
                <input
                  type="text"
                  name="lostLocation"
                  value={formData.lostLocation}
                  onChange={handleChange}
                  className={`input-field ${errors.lostLocation ? 'border-red-500' : ''}`}
                  placeholder="Specific area or landmark"
                />
                {errors.lostLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.lostLocation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lost Date *
                </label>
                <input
                  type="date"
                  name="lostDate"
                  value={formData.lostDate}
                  onChange={handleChange}
                  className={`input-field ${errors.lostDate ? 'border-red-500' : ''}`}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
                {errors.lostDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.lostDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactInfo.name"
                  value={formData.contactInfo.name}
                  onChange={handleChange}
                  className={`input-field ${errors['contactInfo.name'] ? 'border-red-500' : ''}`}
                  placeholder="Your full name"
                />
                {errors['contactInfo.name'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['contactInfo.name']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  className={`input-field ${errors['contactInfo.phone'] ? 'border-red-500' : ''}`}
                  placeholder="Your phone number"
                />
                {errors['contactInfo.phone'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['contactInfo.phone']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                  className={`input-field ${errors['contactInfo.email'] ? 'border-red-500' : ''}`}
                  placeholder="Your email address (optional)"
                />
                {errors['contactInfo.email'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['contactInfo.email']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Phone Images (Optional)</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex justify-center">
                  <label htmlFor="image-upload" className="inline-flex items-center btn-primary cursor-pointer">
                    <PhotoIcon className="h-5 w-5 mr-2" />
                    Upload Images
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Upload up to 5 images of your phone (max 5MB each)
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Phone ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPostMutation.isLoading}
              className="btn-primary"
            >
              {createPostMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Post...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage; 