import React, { useState, useEffect } from 'react';
import { Text, Settings, User, LogOut, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import apiClient from '../../api/apiClient';
import logo from "../../assets/images/logo.png";

const Topbar = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [userData, setUserData] = useState({ username: '', avatar: 'https://placehold.co/80x80' }); 
  const location = useLocation();
  const navigate = useNavigate();

  const BASE_URL = apiClient.defaults.baseURL.replace('/api', '');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/auth/profile/');
        const avatarUrl = response.data.avatar 
          ? `${BASE_URL}${response.data.avatar}` 
          : 'https://placehold.co/80x80';
        setUserData({
          username: response.data.username,
          avatar: avatarUrl,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserData({ username: '', avatar: 'https://placehold.co/80x80' }); 
      }
    };
    fetchUserData();
  }, [BASE_URL]);

  const getPageName = () => {
    const path = location.pathname.split('/')[1];
    return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
        return;
      }
      setIsLoading(true);
      setIsSearchDropdownOpen(true);
      try {
        const [
          invoicesResponse,
          productsResponse,
          servicesResponse,
          clientsResponse,
          bankAccountsResponse,
          addressesResponse,
          taxesResponse,
        ] = await Promise.all([
          apiClient.get("invoices/invoices/"),
          apiClient.get("products/products/"),
          apiClient.get("services/services/"),
          apiClient.get("clients/clients/"),
          apiClient.get("bank/bank-accounts/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("invoices/taxes/"),
        ]);
        const results = [
          ...invoicesResponse.data.map((item) => ({
            type: "Invoice",
            id: item.id,
            name: item.invoice_number || `Invoice ${item.id}`,
            path: `/invoice/proforma`,
          })),
          ...productsResponse.data.map((item) => ({
            type: "Product",
            id: item.id,
            name: item.name,
            path: "/products/view",
          })),
          ...servicesResponse.data.map((item) => ({
            type: "Service",
            id: item.id,
            name: item.name,
            path: "/services/view",
          })),
          ...clientsResponse.data.map((item) => ({
            type: "Client",
            id: item.id,
            name: item.client_name,
            path: "/clients/view",
          })),
          ...bankAccountsResponse.data.map((item) => ({
            type: "Bank Account",
            id: item.id,
            name: item.bank_name,
            path: "/bank-account/view",
          })),
          ...addressesResponse.data.map((item) => ({
            type: "Address",
            id: item.id,
            name: item.branch_address,
            path: "/address/view",
          })),
          ...taxesResponse.data.map((item) => ({
            type: "Tax",
            id: item.id,
            name: item.name,
            path: "/tax/view",
          })),
        ].filter((item) =>
          item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );

        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  const handleResultClick = (path) => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    apiClient.post('/auth/logout/', { 
      refresh: localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
    })
      .then(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        navigate('/login');
      })
      .catch(error => {
        console.error('Logout failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        navigate('/login');
      });
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-gray-100 shadow-md flex items-center justify-between px-4 z-50">
      <div className="flex items-center">
        <div className='flex items-center justify-center w-[255px]'>
          <img src={logo} alt="Crossroads" className="w-10 rounded-full" />
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xs transition-all duration-200 relative overflow-hidden group"
        >
          <div className="absolute inset-0" />
          <Text
            className="w-10 h-10 border p-2 border-gray-300 hover:border-none hover:bg-gray-200 rounded-lg text-gray-800 relative transition-colors duration-300 group-hover:text-gray-800"
            strokeWidth={1.5}
          />
        </button>
        <div className="relative ml-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" strokeWidth={1.5} size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => debouncedSearchQuery && setIsSearchDropdownOpen(true)}
              placeholder="Search here..."
              className="w-64 px-4 py-2 pl-10 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
              disabled={isLoading}
              aria-label="Search Input"
            />
            {isLoading && (
              <span className="ml-4 text-xs font-medium text-blue-500">
                Searching...
              </span>
            )}
            {isSearchDropdownOpen && (
              <div
                className="absolute top-12 left-0 bg-white shadow-lg rounded-md w-[300px] max-h-[400px] overflow-y-auto z-50"
                onMouseLeave={() => setIsSearchDropdownOpen(false)}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                      onClick={() => handleResultClick(result.path)}
                    >
                      <span className="font-bold">{result.type}:</span> {result.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="ml-4 text-sm font-medium text-gray-800">
          {getPageName()}
        </div>
      </div>
      <div className="relative flex items-center mr-12">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 rounded-xs transition-all duration-200 relative overflow-hidden group"
        >
          <div className="absolute inset-0" />
          <Settings
            className="w-10 h-10 border p-2 border-gray-300 hover:border-none hover:bg-gray-200 rounded-full text-gray-800 relative transition-colors duration-300 group-hover:text-gray-800"
            strokeWidth={1.5}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-16 -right-12 w-48 bg-white rounded-md shadow-lg z-20">
            <button
              onClick={() => {
                navigate('/profile');
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-800 rounded-t-md transition-all duration-200 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gray-100 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
              <User
                strokeWidth={1.5}
                className="w-5 h-5 mr-2 text-gray-800 relative transition-colors duration-300 group-hover:text-gray-800"
              />
              <span className="relative transition-colors duration-300 group-hover:text-gray-800">
                Profile Settings
              </span>
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-800 rounded-b-md transition-all duration-200 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gray-100 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
              <LogOut
                strokeWidth={1.5}
                className="w-5 h-5 mr-2 text-gray-800 relative transition-colors duration-300 group-hover:text-gray-800"
              />
              <span className="relative transition-colors duration-300 group-hover:text-gray-800">
                Logout
              </span>
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <img
            src={userData.avatar}
            alt="Profile"
            className="w-10 h-10 object-cover rounded-full cursor-pointer ml-2"
            onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
          />
          <span className="text-sm font-medium text-gray-800 ml-2">
            {userData.username}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;