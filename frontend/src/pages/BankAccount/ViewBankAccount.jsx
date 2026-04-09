import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import apiClient from "../../api/apiClient";
import {
  Pencil, Trash2, X, Save, Building2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Search, CreditCard, User, Hash, Disc, Globe
} from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";
import Pagination from "../../components/Pagination";

const EditBankModal = ({ isOpen, onClose, account, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData(account);
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(account.id, formData);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 no-scrollbar">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Bank Account</h3>
              <p className="text-xs text-gray-800 font-medium mt-1">Update bank details</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Bank Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.bank_name || ""}
                    onChange={(e) => handleChange("bank_name", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                    placeholder="Bank Name"
                  />
                </div>
              </div>

              {/* Account Holder */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Account Holder</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.account_holder_name || ""}
                    onChange={(e) => handleChange("account_holder_name", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Account Number</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.account_number || ""}
                    onChange={(e) => handleChange("account_number", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Account Type</label>
                <div className="relative">
                  <Disc className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <SearchableSelect
                    value={formData.account_type || ""}
                    onChange={(val) => handleChange("account_type", val)}
                    options={[
                      { label: "Select Type", value: "" },
                      { label: "Savings", value: "Savings" },
                      { label: "Current", value: "Current" },
                    ]}
                    placeholder="Select Type"
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* Codes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={formData.ifsc_code || ""}
                  onChange={(e) => handleChange("ifsc_code", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">SWIFT Code</label>
                <input
                  type="text"
                  value={formData.swift_code || ""}
                  onChange={(e) => handleChange("swift_code", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">MICR Code</label>
                <input
                  type="text"
                  value={formData.micr_code || ""}
                  onChange={(e) => handleChange("micr_code", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3.5 rounded-2xl font-semibold text-sm bg-gray-50 text-gray-800 border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3.5 rounded-2xl font-semibold text-sm bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ViewBankAccount = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Pagination, Sort, Search
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await apiClient.get("bank/bank-accounts/");
      setBankAccounts(response.data.sort((a,b) => b.id - a.id));
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bank accounts. Please try again later.");
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await apiClient.put(`bank/bank-accounts/${id}/`, updatedData);
      setBankAccounts(bankAccounts.map(a => a.id === id ? { ...a, ...updatedData } : a));
    } catch (error) {
      alert("Failed to update bank account.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await apiClient.delete(`bank/bank-accounts/${id}/`);
        setBankAccounts(bankAccounts.filter((a) => a.id !== id));
      } catch (error) {
        alert("Failed to delete bank account. Please try again.");
      }
    }
  };

  const openEditModal = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  // Sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort
  const filteredAccounts = bankAccounts.filter(acc =>
    acc.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_number.includes(searchTerm)
  );

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle string comparison (case-insensitive)
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAccounts = sortedAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <div className="w-4 h-4" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="p-4 w-full mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-black rounded-2xl shadow-lg shadow-black/10">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bank Accounts</h1>
            <p className="text-sm text-gray-800 font-medium">Manage your banking details</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 text-sm font-medium transition-all"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-300 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-800 font-semibold">
                <th className="px-6 py-5 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('bank_name')}>
                  <div className="flex items-center">Bank Name {getSortIcon('bank_name')}</div>
                </th>
                <th className="px-6 py-5 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort('account_holder_name')}>
                  <div className="flex items-center">Account Holder {getSortIcon('account_holder_name')}</div>
                </th>
                <th className="px-6 py-5 border-b border-gray-300 whitespace-nowrap">Account No.</th>
                <th className="px-6 py-5 border-b border-gray-300 whitespace-nowrap">Type</th>
                <th className="px-6 py-5 border-b border-gray-300 whitespace-nowrap">Codes</th>
                <th className="px-6 py-5 border-b border-gray-300 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentAccounts.map((account) => (
                <tr key={account.id} className="group hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{account.bank_name}</span>
                      <span className="text-xs text-gray-500">{account.branch_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-800 whitespace-nowrap font-medium">{account.account_holder_name}</td>
                  <td className="px-6 py-6 text-sm font-mono text-gray-900 whitespace-nowrap">{account.account_number}</td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 uppercase tracking-tighter whitespace-nowrap">
                      {account.account_type}
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase whitespace-nowrap">IFSC: <span className="text-gray-900">{account.ifsc_code}</span></span>
                      {account.swift_code && <span className="text-[10px] text-gray-400 font-bold uppercase whitespace-nowrap">SWIFT: <span className="text-gray-900">{account.swift_code}</span></span>}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(account)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Account"
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Account"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination 
          totalItems={filteredAccounts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {filteredAccounts.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-gray-800 text-sm italic font-medium">
              {searchTerm ? "No bank accounts found matching your search." : "No bank accounts found."}
            </p>
          </div>
        )}
      </div>

      <EditBankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={selectedAccount}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ViewBankAccount;