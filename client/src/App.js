import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ShopRoute from './components/ShopRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopRegisterPage from './pages/ShopRegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminShopsPage from './pages/AdminShopsPage';
import AdminShopDetailPage from './pages/AdminShopDetailPage';
import AdminBannersPage from './pages/AdminBannersPage';
import AdminLocationsPage from './pages/AdminLocationsPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import ShopProfilePage from './pages/ShopProfilePage';
import LostPhonesPage from './pages/LostPhonesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Components
import Layout from './components/Layout';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Layout>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-shop" element={<ShopRegisterPage />} />
          <Route path="/posts" element={<LostPhonesPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Protected Routes - accessible by both regular users and shops */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/create-post" element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          } />
          
          {/* Shop Routes */}
          <Route path="/shop-profile" element={
            <ShopRoute>
              <ShopProfilePage />
            </ShopRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />
          <Route path="/admin/shops" element={
            <AdminRoute>
              <AdminShopsPage />
            </AdminRoute>
          } />
          <Route path="/admin/shops/:id" element={
            <AdminRoute>
              <AdminShopDetailPage />
            </AdminRoute>
          } />
          <Route path="/admin/banners" element={
            <AdminRoute>
              <AdminBannersPage />
            </AdminRoute>
          } />
          <Route path="/admin/locations" element={
            <AdminRoute>
              <AdminLocationsPage />
            </AdminRoute>
          } />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App; 
