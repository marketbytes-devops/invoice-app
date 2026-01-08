import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import ConfirmationModal from "../ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  Users,
  ReceiptIndianRupee,
  CreditCard,
  ChevronRight,
  FolderCog,
  UserCog,
  SquareKanban,
  MapPinHouse,
  Folders,
  Circle,
  LogOut,
} from "lucide-react";

const iconComponents = {
  LayoutDashboard,
  Settings,
  Users,
  ReceiptIndianRupee,
  CreditCard,
  ChevronRight,
  SquareKanban,
  FolderCog,
  UserCog,
  MapPinHouse,
  Folders,
  Circle,
  LogOut,
};

const Dropdown = ({ label, links, icon, isOpen, toggleDropdown }) => {
  const IconComponent = iconComponents[icon];
  const location = useLocation();

  const hasActiveChild = links.some(link => location.pathname === link.to);

  return (
    <div className="mb-2">
      <button
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all duration-200 ${hasActiveChild
          ? "bg-black text-white"
          : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
          }`}
      >
        <div className="flex items-center gap-3">
          <IconComponent className="w-4 h-4" strokeWidth={2} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-7 space-y-0.5">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-3 rounded-2xl text-xs font-medium transition-all duration-200 ${isActive
                      ? "text-black bg-gray-100"
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    <Circle className={`w-1 h-1 fill-current ${isActive ? "opacity-100" : "opacity-50"}`} />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ isOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const sidebarVariants = {
    open: {
      width: 280,
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      width: 0,
      opacity: 0,
      x: -20,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const dropdownSections = {
    invoice: [
      { to: "/invoice/create", label: "Create Invoice" },
      { to: "/invoice/proforma", label: "Proforma Invoice" },
      { to: "/invoice/invoice-list", label: "Final Invoices" },
    ],
    tax: [
      { to: "/tax/add", label: "Add Tax" },
      { to: "/tax/view", label: "View Tax" },
    ],
    productsAndServices: [
      { to: "/products/add", label: "Add Products" },
      { to: "/products/view", label: "View Products" },
      { to: "/services/add", label: "Add Service" },
      { to: "/services/view", label: "View Service" },
    ],
    clients: [
      { to: "/clients/add", label: "Add Clients" },
      { to: "/clients/view", label: "View Clients" },
    ],
    address: [
      { to: "/address/add", label: "Add Address" },
      { to: "/address/view", label: "View Address" },
    ],
    bankAccount: [
      { to: "/bank-account/add", label: "Add Bank Account" },
      { to: "/bank-account/view", label: "View Bank Account" },
    ],
  };

  const navigationItems = [
    { type: "link", to: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { type: "dropdown", label: "Invoice", icon: "Folders", links: dropdownSections.invoice },
    { type: "dropdown", label: "Tax", icon: "ReceiptIndianRupee", links: dropdownSections.tax },
    { type: "dropdown", label: "Products & Services", icon: "SquareKanban", links: dropdownSections.productsAndServices },
    { type: "dropdown", label: "Clients", icon: "Users", links: dropdownSections.clients },
    { type: "dropdown", label: "Address", icon: "MapPinHouse", links: dropdownSections.address },
    { type: "dropdown", label: "Bank Account", icon: "CreditCard", links: dropdownSections.bankAccount },
    { type: "link", to: "/profile", label: "Profile", icon: "UserCog" },
    { type: "link", to: "/additional-settings", label: "Settings", icon: "Settings" },
  ];

  const handleToggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed top-20 left-4 bottom-4 bg-white rounded-2xl shadow-sm flex flex-col z-50 border border-gray-200 overflow-hidden"
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">MB</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">MarketBytes</h2>
            <p className="text-[10px] text-gray-500 font-medium">Invoice System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigationItems.map((item) => {
          if (item.type === "link") {
            const IconComponent = iconComponents[item.icon];
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 ${isActive
                  ? "bg-black text-white"
                  : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <IconComponent className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          } else {
            return (
              <Dropdown
                key={item.label}
                label={item.label}
                links={item.links}
                icon={item.icon}
                isOpen={openDropdown === item.label}
                toggleDropdown={() => handleToggleDropdown(item.label)}
              />
            );
          }
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-800 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          <span className="text-sm font-medium">Logout</span>
        </button>
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
    </motion.aside>
  );
};

export default Sidebar;