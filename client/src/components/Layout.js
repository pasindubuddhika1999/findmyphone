import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [registerMenuOpen, setRegisterMenuOpen] = useState(false);
  const location = useLocation();

  const isShop = user?.role === "shop";
  const isAdmin = user?.role === "admin";

  // Close register menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        registerMenuOpen &&
        !event.target.closest(".register-menu-container")
      ) {
        setRegisterMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [registerMenuOpen]);

  // Close register menu when navigating
  useEffect(() => {
    setRegisterMenuOpen(false);
  }, [location.pathname]);

  // Common navigation items for all users
  const commonNavItems = [
    {
      name: "Home",
      href: "/",
      icon: HomeIcon,
      current: location.pathname === "/",
    },
    {
      name: "Find Phones",
      href: "/posts",
      icon: PhoneIcon,
      current:
        location.pathname === "/posts" ||
        location.pathname.startsWith("/posts/"),
    },
  ];

  // User-specific navigation items
  const userNavItems =
    isAuthenticated && !isShop && !isAdmin
      ? [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: Cog6ToothIcon,
            current: location.pathname === "/dashboard",
          },
          {
            name: "Report Phone",
            href: "/create-post",
            icon: PhoneIcon,
            current: location.pathname === "/create-post",
          },
        ]
      : [];

  // Shop-specific navigation items
  const shopNavItems = isShop
    ? [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: Cog6ToothIcon,
          current: location.pathname === "/dashboard",
        },
        {
          name: "Report Phone",
          href: "/create-post",
          icon: PhoneIcon,
          current: location.pathname === "/create-post",
        },
      ]
    : [];

  // Admin-specific navigation items
  const adminNavItems = isAdmin
    ? [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: Cog6ToothIcon,
          current: location.pathname === "/dashboard",
        },
        {
          name: "Admin",
          href: "/admin",
          icon: Cog6ToothIcon,
          current: location.pathname === "/admin",
        },
        {
          name: "Manage Shops",
          href: "/admin/shops",
          icon: BuildingStorefrontIcon,
          current:
            location.pathname === "/admin/shops" ||
            location.pathname.startsWith("/admin/shops/"),
        },
      ]
    : [];

  // About and info items at the end
  const infoNavItems = isAdmin
    ? [
        {
          name: "About Us",
          href: "/about",
          icon: QuestionMarkCircleIcon,
          current: location.pathname === "/about",
        },
      ]
    : isAuthenticated
    ? [
        {
          name: "About Us",
          href: "/about",
          icon: QuestionMarkCircleIcon,
          current: location.pathname === "/about",
        },
      ]
    : [
        {
          name: "How It Works",
          href: "/about#how-it-works",
          icon: QuestionMarkCircleIcon,
          current: false,
        },
        {
          name: "About Us",
          href: "/about",
          icon: QuestionMarkCircleIcon,
          current: location.pathname === "/about",
        },
      ];

  // Combine all navigation items
  const navigation = [
    ...commonNavItems,
    ...userNavItems,
    ...shopNavItems,
    ...adminNavItems,
    ...infoNavItems,
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleRegisterMenu = (e) => {
    e.preventDefault();
    setRegisterMenuOpen(!registerMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <span className="site-title split-logo">
                  <span className="split-left">Lost</span>
                  <span className="split-right">Mobile.lk</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                    item.current
                      ? "text-blue-600 bg-blue-50 font-semibold"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-1 rounded-md transition-all duration-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    {isShop ? (
                      <BuildingStorefrontIcon className="h-5 w-5" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">
                      {isShop
                        ? user?.shop?.shopName || user?.username
                        : user?.username}
                      {isShop && !user?.shop?.isApproved && " (Pending)"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-1 rounded-md transition-all duration-200 text-gray-700 hover:text-red-600 hover:bg-gray-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="transition-all duration-200 text-sm font-medium px-4 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <div className="relative register-menu-container">
                    <button
                      onClick={toggleRegisterMenu}
                      className="transition-all duration-200 font-medium py-2 px-4 rounded-md inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <span>Register</span>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${
                          registerMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {registerMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden origin-top-right z-50 border border-gray-100">
                        <div className="py-1">
                          <Link
                            to="/register"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 border-l-4 border-transparent hover:border-blue-500"
                          >
                            <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                              <p className="font-medium">Register as User</p>
                              <p className="text-xs text-gray-500">
                                Create a personal account
                              </p>
                            </div>
                          </Link>
                          <Link
                            to="/register-shop"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 border-l-4 border-transparent hover:border-blue-500"
                          >
                            <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                              <p className="font-medium">Register as Shop</p>
                              <p className="text-xs text-gray-500">
                                Create a business account
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="transition-colors duration-200 p-1 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    item.current
                      ? "text-blue-600 bg-blue-50 font-semibold"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Welcome,{" "}
                    {isShop
                      ? user?.shop?.shopName || user?.username
                      : user?.username}
                    {isShop && !user?.shop?.isApproved && " (Pending Approval)"}
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>Login</span>
                  </Link>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Register as:
                    </p>
                    <div className="space-y-2">
                      <Link
                        to="/register"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200 border-l-2 border-transparent hover:border-blue-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">User Account</p>
                          <p className="text-xs text-gray-500">
                            For personal use
                          </p>
                        </div>
                      </Link>
                      <Link
                        to="/register-shop"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200 border-l-2 border-transparent hover:border-blue-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BuildingStorefrontIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Shop Account</p>
                          <p className="text-xs text-gray-500">
                            For businesses
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and About */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="site-title split-logo">
                  <span className="split-left">Lost</span>
                  <span className="split-right">Mobile.lk</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Sri Lanka's premier platform for reporting and finding lost
                phones. We connect people who have lost their devices with those
                who have found them.
              </p>
              <div className="pt-2 flex space-x-4">
                <a
                  href="https://web.facebook.com/profile.php?id=61578373235775"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/lostmobilesrilanka/"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/posts"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Find Phones
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create-post"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Report Lost Phone
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register-shop"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Register Shop
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about#how-it-works"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#faqs"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Contact Us
              </h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 text-blue-400 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Colombo, Sri Lanka</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 text-blue-400 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Lostmobilesrilanka@gmail.com</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 text-blue-400 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>+94 76 797 6772</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 text-blue-400 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Find My Phone.lk. All rights
              reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Designed and developed with Mango Coding ❤️ in Sri Lanka
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
