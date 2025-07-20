import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Special function for handling FormData (file uploads)
api.uploadFormData = (endpoint, formData) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return axios.post(`${api.defaults.baseURL}${endpoint}`, formData, {
    headers: headers,
  });
};

// Auth endpoints
api.login = (credentials) => {
  return api.post("/api/auth/login", credentials);
};

api.register = (userData) => {
  return api.post("/api/auth/register", userData);
};

api.registerShop = (shopData) => {
  return api.post("/api/auth/register-shop", shopData);
};

api.getUserProfile = () => {
  return api.get("/api/auth/profile");
};

api.updateUserProfile = (userData) => {
  return api.put("/api/auth/profile", userData);
};

api.updateShopProfile = (shopData) => {
  return api.put("/api/auth/shop-profile", shopData);
};

api.changePassword = (passwordData) => {
  return api.put("/api/auth/change-password", passwordData);
};

// Banner management endpoints
api.getBanners = () => {
  return api.get("/api/banners");
};

api.getAdminBanners = () => {
  return api.get("/api/banners/admin");
};

api.getAdminBanner = (id) => {
  return api.get(`/api/banners/admin/${id}`);
};

api.createBanner = (bannerData) => {
  return api.post("/api/banners/admin", bannerData);
};

api.updateBanner = (id, bannerData) => {
  return api.put(`/api/banners/admin/${id}`, bannerData);
};

api.deleteBanner = (id) => {
  return api.delete(`/api/banners/admin/${id}`);
};

// Admin shop management endpoints
api.getShops = (params) => {
  return api.get("/api/admin/shops", { params });
};

api.getShopById = (id) => {
  return api.get(`/api/admin/shops/${id}`);
};

api.approveShop = (id) => {
  return api.patch(`/api/admin/shops/${id}/approve`);
};

api.rejectShop = (id) => {
  return api.delete(`/api/admin/shops/${id}/reject`);
};

// Phone metadata endpoints
api.getPhoneBrands = () => {
  return api.get("/api/posts/phone-brands");
};

api.getPhoneModels = (brandId, search) => {
  const params = {};
  if (brandId) params.brandId = brandId;
  if (search) params.search = search;

  return api.get("/api/posts/phone-models", { params });
};

api.getPhoneColors = (modelId, search) => {
  const params = {};
  if (modelId) params.modelId = modelId;
  if (search) params.search = search;

  return api.get("/api/posts/phone-colors", { params });
};

// Statistics endpoint
api.getStatistics = () => {
  return api.get("/api/posts/statistics");
};

// Location endpoints (public)
api.getDistricts = () => {
  return api.get("/api/posts/districts");
};

api.getTowns = (districtId) => {
  const params = {};
  if (districtId) params.districtId = districtId;

  return api.get("/api/posts/towns", { params });
};

// Location management endpoints (admin)
api.getAdminDistricts = () => {
  return api.get("/api/admin/districts");
};

api.createDistrict = (districtData) => {
  return api.post("/api/admin/districts", districtData);
};

api.updateDistrict = (id, districtData) => {
  return api.put(`/api/admin/districts/${id}`, districtData);
};

api.deleteDistrict = (id) => {
  return api.delete(`/api/admin/districts/${id}`);
};

api.getAdminTowns = (districtId) => {
  const params = {};
  if (districtId) params.districtId = districtId;

  return api.get("/api/admin/towns", { params });
};

api.createTown = (townData) => {
  return api.post("/api/admin/towns", townData);
};

api.updateTown = (id, townData) => {
  return api.put(`/api/admin/towns/${id}`, townData);
};

api.deleteTown = (id) => {
  return api.delete(`/api/admin/towns/${id}`);
};

export default api;
