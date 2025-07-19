import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon, 
  DevicePhoneMobileIcon, 
  MapPinIcon,
  IdentificationIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const SearchForm = ({ onSearch, initialValues }) => {
  const [formData, setFormData] = useState({
    search: '',
    imei: '',
    brand: '',
    model: '',
    location: '',
    ...initialValues
  });
  
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  
  const brandInputRef = useRef(null);
  const modelInputRef = useRef(null);
  const brandDropdownRef = useRef(null);
  const modelDropdownRef = useRef(null);
  
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues]);
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await api.get('/api/posts/phone-brands');
        setBrands(response.data);
        setFilteredBrands(response.data);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    };
    
    fetchBrands();
  }, []);
  
  // Set selectedBrandId when initialValues change or brands are loaded
  useEffect(() => {
    if (formData.brand && brands.length > 0) {
      const selectedBrand = brands.find(brand => brand.name === formData.brand);
      if (selectedBrand) {
        setSelectedBrandId(selectedBrand._id);
      }
    }
  }, [formData.brand, brands]);
  
  // Fetch models when a brand is selected
  useEffect(() => {
    if (!selectedBrandId) {
      setModels([]);
      setFilteredModels([]);
      return;
    }
    
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const response = await api.get(`/api/posts/phone-models?brandId=${selectedBrandId}`);
        setModels(response.data);
        setFilteredModels(response.data);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoadingModels(false);
      }
    };
    
    fetchModels();
  }, [selectedBrandId]);
  
  // Filter brands based on search term
  useEffect(() => {
    if (!brandSearchTerm.trim()) {
      setFilteredBrands(brands);
      return;
    }
    
    const filtered = brands.filter(brand => 
      brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [brandSearchTerm, brands]);
  
  // Filter models based on search term
  useEffect(() => {
    if (!modelSearchTerm.trim()) {
      setFilteredModels(models);
      return;
    }
    
    const filtered = models.filter(model => 
      model.name.toLowerCase().includes(modelSearchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [modelSearchTerm, models]);
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target) &&
          brandInputRef.current && !brandInputRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target) &&
          modelInputRef.current && !modelInputRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBrandSearch = (e) => {
    setBrandSearchTerm(e.target.value);
    setFormData(prev => ({
      ...prev,
      brand: e.target.value
    }));
    
    // Clear model when brand changes
    if (formData.model) {
      setFormData(prev => ({
        ...prev,
        model: ''
      }));
      setSelectedBrandId('');
    }
    
    setShowBrandDropdown(true);
  };
  
  const handleModelSearch = (e) => {
    setModelSearchTerm(e.target.value);
    setFormData(prev => ({
      ...prev,
      model: e.target.value
    }));
    setShowModelDropdown(true);
  };
  
  const selectBrand = (brandName, brandId) => {
    setFormData(prev => ({
      ...prev,
      brand: brandName,
      model: '' // Clear model when brand changes
    }));
    setBrandSearchTerm(brandName);
    setSelectedBrandId(brandId);
    setShowBrandDropdown(false);
  };
  
  const selectModel = (modelName) => {
    setFormData(prev => ({
      ...prev,
      model: modelName
    }));
    setModelSearchTerm(modelName);
    setShowModelDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value.trim() !== '')
    );
    onSearch(params);
  };

  const handleReset = () => {
    setFormData({
      search: '',
      imei: '',
      brand: '',
      model: '',
      location: '',
    });
    setBrandSearchTerm('');
    setModelSearchTerm('');
    setSelectedBrandId('');
    onSearch({});
  };

  // Check if any advanced filters are active
  const hasActiveAdvancedFilters = () => {
    return ['imei', 'brand', 'model', 'location'].some(key => formData[key]?.trim() !== '');
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSubmit} className="search-form space-y-4">
        {/* Main Search - Always Visible */}
        <div className="relative flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              value={formData.search}
              onChange={handleChange}
              placeholder="Search lost phones..."
              className="block w-full pl-10 pr-12 py-3 border-0 bg-white bg-opacity-90 backdrop-blur-sm rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-md"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-r-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
          >
            Search
          </button>
          </div>

        {/* Advanced Filters Toggle */}
        <div className="flex justify-between items-center">
            <button
              type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm font-medium text-white hover:text-blue-200 transition-colors duration-200"
            >
            {showAdvanced ? (
                <>
                <ChevronUpIcon className="h-4 w-4 mr-1" />
                  <span>Hide Advanced Filters</span>
                </>
              ) : (
                <>
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                <span>Show Advanced Filters</span>
                </>
              )}
          </button>
          
          {hasActiveAdvancedFilters() && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-white hover:text-blue-200 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Reset All Filters
            </button>
          )}
          </div>

          {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md animate-fade-in">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <IdentificationIcon className="h-4 w-4 mr-2 text-blue-500" />
                  IMEI Number
                </label>
              <div className="relative">
                <input
                  type="text"
                  name="imei"
                  value={formData.imei}
                  onChange={handleChange}
                  placeholder="Enter 15-digit IMEI"
                  maxLength="15"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                {formData.imei && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imei: '' }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              </div>
              
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Brand
                </label>
              <div className="relative">
                <div ref={brandInputRef} className="relative">
                <input
                  type="text"
                    value={brandSearchTerm}
                    onChange={handleBrandSearch}
                    onFocus={() => setShowBrandDropdown(true)}
                    placeholder="Search or select brand"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={loadingBrands}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {loadingBrands ? (
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <ChevronDownIcon 
                        className={`h-4 w-4 text-gray-400 transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`} 
                        onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                      />
                    )}
                  </div>
                  {brandSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setBrandSearchTerm('');
                        setFormData(prev => ({ ...prev, brand: '', model: '' }));
                        setSelectedBrandId('');
                      }}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {showBrandDropdown && (
                  <div 
                    ref={brandDropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                  >
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map(brand => (
                        <div
                          key={brand._id}
                          onClick={() => selectBrand(brand.name, brand._id)}
                          className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                            formData.brand === brand.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                          }`}
                        >
                          {brand.name}
                        </div>
                      ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500">
                        {loadingBrands ? 'Loading brands...' : 'No brands found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
              
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DevicePhoneMobileIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Model
                </label>
              <div className="relative">
                <div ref={modelInputRef} className="relative">
                <input
                  type="text"
                    value={modelSearchTerm}
                    onChange={handleModelSearch}
                    onFocus={() => selectedBrandId && setShowModelDropdown(true)}
                    placeholder={selectedBrandId ? "Search or select model" : "Select a brand first"}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={loadingModels || !selectedBrandId}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {loadingModels ? (
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <ChevronDownIcon 
                        className={`h-4 w-4 text-gray-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} 
                        onClick={() => selectedBrandId && setShowModelDropdown(!showModelDropdown)}
                      />
                    )}
                  </div>
                  {modelSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setModelSearchTerm('');
                        setFormData(prev => ({ ...prev, model: '' }));
                      }}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {showModelDropdown && selectedBrandId && (
                  <div 
                    ref={modelDropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                  >
                    {filteredModels.length > 0 ? (
                      filteredModels.map(model => (
                        <div
                          key={model._id}
                          onClick={() => selectModel(model.name)}
                          className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                            formData.model === model.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                          }`}
                        >
                          {model.name}
                        </div>
                      ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500">
                        {loadingModels ? 'Loading models...' : 'No models found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedBrandId && !loadingModels && models.length === 0 && (
                <div className="text-xs text-gray-500">No models found for this brand</div>
              )}
              </div>
              
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MapPinIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Location
                </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, area, or landmark"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                {formData.location && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, location: '' }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
            <button 
              type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm flex items-center"
            >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Apply Filters
            </button>
            </div>
          </div>
        )}
        </form>
    </div>
  );
};

export default SearchForm; 