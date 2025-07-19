import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await api.getUserProfile();
          
          // Combine user and shop data if available
          const userData = {
            ...response.data.user,
            shop: response.data.shop
          };
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData,
              token: state.token,
            },
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, [state.token]);

  const login = async (identifier, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.login({ identifier, password });
      
      const { token, user, shop } = response.data;
      
      // Check if shop account is pending approval
      if (user.role === 'shop' && shop && !shop.isApproved) {
        toast.error('Your shop account is pending approval. Please wait for admin approval before logging in.');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Combine user and shop data
      const userData = {
        ...user,
        shop
      };
      
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user: userData },
      });
      
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'shop') {
        navigate('/shop-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Check if this is a pending approval error
      if (error.response?.data?.isPendingApproval) {
        toast.error('Your shop account is pending approval. Please wait for admin approval before logging in.');
      } else {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.register(userData);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });
      
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const registerShop = async (shopData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await api.registerShop(shopData);
      
      toast.success('Shop registration submitted successfully!');
      toast.info('Please wait for admin approval before logging in.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Shop registration failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateProfile = async (userData) => {
    try {
      await api.updateUserProfile(userData);
      // Get fresh user data that includes shop info if applicable
      const profileResponse = await api.getUserProfile();
      const updatedUserData = {
        ...profileResponse.data.user,
        shop: profileResponse.data.shop
      };
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUserData,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
    }
  };

  const updateShopProfile = async (shopData) => {
    try {
      await api.updateShopProfile(shopData);
      
      // Get fresh user data that includes updated shop info
      const profileResponse = await api.getUserProfile();
      const updatedUserData = {
        ...profileResponse.data.user,
        shop: profileResponse.data.shop
      };
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUserData,
      });
      
      toast.success('Shop profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Shop profile update failed';
      toast.error(message);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
    }
  };

  const setUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    register,
    registerShop,
    logout,
    updateProfile,
    updateShopProfile,
    changePassword,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 