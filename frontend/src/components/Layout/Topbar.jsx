import React, { useState, useEffect } from 'react';
import { PanelLeft, PanelRight, Settings, User, LogOut, Search, Plus, FileText, UserPlus, Package, Building2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import apiClient from '../../api/apiClient';
import ConfirmationModal from '../ConfirmationModal';

const Topbar = ({ toggleSidebar, isSidebarOpen, userAvatar, username }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [userData, setUserData] = useState({ username: username || '', avatar: userAvatar || 'https://placehold.co/80x80' });
  const location = useLocation();
  const navigate = useNavigate();

  const BASE_URL = apiClient.defaults.baseURL.replace('/api', '');

  useEffect(() => {
    if (username && userAvatar) {
      setUserData({ username, avatar: userAvatar });
    }
  }, [username, userAvatar]);

  const getPageName = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const fullPath = segments.join('/');
    
    // Specific overrides for certain paths
    const overrides = {
      'invoice/invoice-list': 'Final Invoice',
      'invoice/create': 'Create Invoice',
      'invoice/proforma': 'Proforma Invoice',
      'invoice/final-invoice-view': 'Printed Final Invoice',
    };

    if (overrides[fullPath]) return overrides[fullPath];

    // Handle paths with IDs or dynamic segments
    if (segments[0] === 'invoice' && segments[1] === 'printed-proforma-invoice') {
      return 'Printed Proforma Invoice';
    }

    if (segments.length === 0) return 'Dashboard';
    
    // Create a descriptive name from path segments (e.g., /tax/add -> Add Tax)
    return segments
      .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
      .reverse()
      .join(' ');
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
        const endpoints = [
          "invoices/invoices/",
          "products/products/",
          "services/services/",
          "clients/clients/",
          "bank/bank-accounts/",
          "branch/branch_addresses/",
          "invoices/taxes/"
        ];

        const responses = await Promise.all(endpoints.map(ep => apiClient.get(ep)));

        const results = [
          ...responses[0].data.map(item => ({ type: "Invoice", name: item.invoice_number || `Inv #${item.id}`, path: `/invoice/proforma` })),
          ...responses[1].data.map(item => ({ type: "Product", name: item.name, path: "/products/view" })),
          ...responses[2].data.map(item => ({ type: "Service", name: item.name, path: "/services/view" })),
          ...responses[3].data.map(item => ({ type: "Client", name: item.client_name, path: "/clients/view" })),
          ...responses[4].data.map(item => ({ type: "Bank Account", name: item.bank_name, path: "/bank-account/view" })),
          ...responses[5].data.map(item => ({ type: "Address", name: item.branch_address, path: "/address/view" })),
          ...responses[6].data.map(item => ({ type: "Tax", name: item.name, path: "/tax/view" })),
        ].filter(item => item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

        setSearchResults(results.slice(0, 8));
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    const refresh = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    apiClient.post('/auth/logout/', { refresh })
      .finally(() => {
        ['access_token', 'refresh_token'].forEach(k => {
          localStorage.removeItem(k);
          sessionStorage.removeItem(k);
        });
        navigate('/login');
      });
  };

  return (
    <header className="fixed top-3 left-4 right-4 h-14 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg shadow-gray-200/30 flex items-center justify-between px-6 z-[60] rounded-2xl">
      {/* Left section: Toggle & Breadcrumb */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-black hover:text-white rounded-lg transition-all text-gray-800"
        >
          {isSidebarOpen ? (
            <PanelLeft size={20} strokeWidth={2} />
          ) : (
            <PanelRight size={20} strokeWidth={2} />
          )}
        </button>

        <div className="h-6 w-px bg-gray-100 mx-2 hidden sm:block" />

        <div className="hidden sm:flex items-center text-sm font-medium">
          <span className="text-black">{getPageName()}</span>
        </div>
      </div>

      {/* Middle section: Search */}
      <div className="flex-1 max-w-md mx-8 relative">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-black transition-colors" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dashboard..."
            className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none text-black placeholder:text-gray-400"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {isLoading ? (
              <div className="px-4 py-3 text-xs text-gray-400 flex items-center">
                <div className="w-3 h-3 border-2 border-gray-200 border-t-black rounded-full animate-spin mr-2" />
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((res, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  onClick={() => { navigate(res.path); setSearchQuery(''); setIsSearchDropdownOpen(false); }}
                >
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter w-12">{res.type}</span>
                  <span className="text-sm text-gray-700 truncate">{res.name}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Right section: Quick Actions & Profile */}
      <div className="flex items-center space-x-2">
        {/* Quick Actions Button */}
        <div className="relative">
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="relative p-2 hover:bg-black hover:text-white rounded-xl transition-all text-gray-800 font-semibold flex items-center gap-2 px-3"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline text-sm">Quick Actions</span>
          </button>

          {/* Quick Actions Dropdown */}
          {isQuickActionsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsQuickActionsOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Create and manage quickly</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => { navigate('/invoice/create'); setIsQuickActionsOpen(false); }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-800 hover:text-black hover:bg-gray-50 transition-all font-medium group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mr-3 transition-colors">
                      <FileText size={18} className="text-blue-600" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Create Invoice</p>
                      <p className="text-xs text-gray-500">New proforma invoice</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { navigate('/clients/add'); setIsQuickActionsOpen(false); }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-800 hover:text-black hover:bg-gray-50 transition-all font-medium group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center mr-3 transition-colors">
                      <UserPlus size={18} className="text-green-600" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Add Client</p>
                      <p className="text-xs text-gray-500">New customer</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { navigate('/products/add'); setIsQuickActionsOpen(false); }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-800 hover:text-black hover:bg-gray-50 transition-all font-medium group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mr-3 transition-colors">
                      <Package size={18} className="text-purple-600" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Add Product</p>
                      <p className="text-xs text-gray-500">New product/service</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { navigate('/bank-account/add'); setIsQuickActionsOpen(false); }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-800 hover:text-black hover:bg-gray-50 transition-all font-medium group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mr-3 transition-colors">
                      <Building2 size={18} className="text-orange-600" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Add Bank Account</p>
                      <p className="text-xs text-gray-500">New bank details</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 p-1 pl-3 hover:bg-gray-50 rounded-full transition-all group border border-transparent hover:border-gray-100"
          >
            <span className="hidden md:block text-sm font-semibold text-gray-700 group-hover:text-black">
              {userData.username}
            </span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img
                src={userData.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
              />
            </div>
          </button>

          {/* User Dropdown */}
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50">
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="text-sm font-semibold truncate">{userData.username}</p>
                </div>

                <button
                  onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-800 hover:text-black hover:bg-gray-50 transition-all font-medium"
                >
                  <User size={16} className="mr-3 text-gray-800" /> My Profile
                </button>

                <button
                  onClick={() => { navigate('/additional-settings'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-800 hover:text-black hover:bg-gray-50 transition-all font-medium"
                >
                  <Settings size={16} className="mr-3 text-gray-800" /> Settings
                </button>

                <div className="h-px bg-gray-50 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all font-bold"
                >
                  <LogOut size={16} className="mr-3" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        type="danger"
        confirmText="Logout"
        onConfirm={confirmLogout}
      />
    </header >
  );
};

export default Topbar;