import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  Users,
  ReceiptIndianRupee,
  CreditCard,
  ChevronDown,
  FolderCog,
  UserCog,
  SquareKanban,
  MapPinHouse,
  Folders,
} from "lucide-react";

const iconComponents = {
  LayoutDashboard: LayoutDashboard,
  Settings: Settings,
  Users: Users,
  ReceiptIndianRupee: ReceiptIndianRupee,
  CreditCard: CreditCard,
  ChevronDown: ChevronDown,
  SquareKanban: SquareKanban,
  FolderCog: FolderCog,
  UserCog: UserCog,
  MapPinHouse: MapPinHouse,
  Folders: Folders,
};

const Dropdown = ({ label, links, icon, isOpen, toggleDropdown }) => {
  const IconComponent = iconComponents[icon];

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleDropdown}
        className="text-sm font-medium group flex items-center p-2 rounded-xs transition-all duration-200 relative overflow-hidden text-gray-800 w-full hover:bg-gray-500 hover:text-gray-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <IconComponent className="w-5 h-5 mr-3 transition-colors duration-300 group-hover:text-gray-50" />
        {label}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute right-2"
        >
          <ChevronDown className="w-4 h-4 ml-2 group-hover:text-gray-50" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0, height: 0 },
              visible: {
                opacity: 1,
                height: "auto",
                transition: {
                  duration: 0.3,
                  when: "beforeChildren",
                  staggerChildren: 0.05,
                },
              },
              exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
            }}
            className="w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto mt-2"
          >
            {links.map((link) => (
              <motion.div key={link.to} variants={dropdownVariants}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-gray-500 text-gray-50"
                        : "text-black hover:bg-gray-500 hover:text-gray-50"
                    } transition-colors duration-300`
                  }
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ isOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const sidebarVariants = {
    open: {
      width: 300,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      width: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
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
    {
      type: "link",
      to: "/",
      label: "Dashboard",
      icon: "LayoutDashboard",
    },
    {
      type: "dropdown",
      label: "Invoice",
      icon: "Folders",
      links: dropdownSections.invoice,
    },
    {
      type: "dropdown",
      label: "Tax",
      icon: "ReceiptIndianRupee",
      links: dropdownSections.tax,
    },
    {
      type: "dropdown",
      label: "Products & Services",
      icon: "SquareKanban",
      links: dropdownSections.productsAndServices,
    },
    {
      type: "dropdown",
      label: "Clients",
      icon: "Users",
      links: dropdownSections.clients,
    },
    {
      type: "dropdown",
      label: "Address",
      icon: "MapPinHouse",
      links: dropdownSections.address,
    },
    {
      type: "dropdown",
      label: "Bank Account",
      icon: "CreditCard",
      links: dropdownSections.bankAccount,
    },
    {
      type: "link",
      to: "/profile",
      label: "Profile",
      icon: "UserCog",
    },
    {
      type: "link",
      to: "/additional-settings",
      label: "Additional Settings",
      icon: "Settings",
    },
  ];

  const handleToggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <motion.aside
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed top-16 bottom-0 bg-gray-100 shadow-md overflow-hidden flex flex-col z-40"
    >
      <motion.div
        className="h-full p-4 pt-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            if (item.type === "link") {
              const IconComponent = iconComponents[item.icon];
              return (
                <motion.div
                  key={item.to}
                  custom={index}
                  initial="hidden"
                  animate={isOpen ? "visible" : "hidden"}
                  variants={itemVariants}
                >
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `text-sm font-medium group flex items-center p-2 rounded-xs transition-all duration-200 relative overflow-hidden ${
                        isActive
                          ? "bg-gray-500 text-gray-50"
                          : "text-black hover:bg-gray-500 hover:text-gray-50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gray-500"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: isActive ? 0 : 0.2 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="relative flex items-center">
                          <IconComponent
                            className={`w-5 h-5 mr-3 transition-colors duration-300 ${
                              isActive ? "text-gray-50" : "text-black group-hover:text-gray-50"
                            }`}
                          />
                          <span
                            className={`${
                              isActive
                                ? "text-gray-50"
                                : "text-black group-hover:text-gray-50"
                            } transition-colors duration-300`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </>
                    )}
                  </NavLink>
                </motion.div>
              );
            } else if (item.type === "dropdown") {
              return (
                <motion.div
                  key={index}
                  custom={index}
                  initial="hidden"
                  animate={isOpen ? "visible" : "hidden"}
                  variants={itemVariants}
                >
                  <Dropdown
                    label={item.label}
                    links={item.links}
                    icon={item.icon}
                    isOpen={openDropdown === index}
                    toggleDropdown={() => handleToggleDropdown(index)}
                  />
                </motion.div>
              );
            }
            return null;
          })}
        </nav>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;