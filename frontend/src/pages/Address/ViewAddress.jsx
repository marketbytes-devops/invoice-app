import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import apiClient from "../../api/apiClient";
import {
  Pencil, Trash2, X, Save, Building2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Search, MapPin, Globe, Phone, FileText, LayoutGrid
} from "lucide-react";
import { Country } from "country-state-city";
import SearchableSelect from "../../components/SearchableSelect";

const EditAddressModal = ({ isOpen, onClose, address, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const phoneCodeOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      value: `+${country.phonecode}`,
      label: `+${country.phonecode} (${country.name})`,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(address.id, formData);
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
              <h3 className="text-xl font-semibold text-gray-900">Edit Branch</h3>
              <p className="text-xs text-gray-800 font-medium mt-1">Update branch details</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Branch Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.branch_name || ""}
                    onChange={(e) => handleChange("branch_name", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                    placeholder="Branch Name"
                  />
                </div>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">GSTIN</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.gstin || ""}
                    onChange={(e) => handleChange("gstin", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <textarea
                    required
                    rows={2}
                    value={formData.branch_address || ""}
                    onChange={(e) => handleChange("branch_address", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black resize-none"
                    placeholder="Address"
                  />
                </div>
              </div>

              {/* State & City */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">State</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.state || ""}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">City</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SearchableSelect
                  label="Code"
                  value={formData.phone_code || "+91"}
                  onChange={(val) => handleChange("phone_code", val)}
                  options={phoneCodeOptions}
                  placeholder="+91"
                  displaySelectedValue={true}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Phone</label>
                <input
                  type="text"
                  required
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.website || ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
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

const ViewAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Pagination, Sort, Search
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await apiClient.get("branch/branch_addresses/");
      setAddresses(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch addresses. Please try again later.");
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await apiClient.put(`branch/branch_addresses/${id}/`, updatedData);
      setAddresses(addresses.map(a => a.id === id ? { ...a, ...updatedData } : a));
    } catch (error) {
      alert("Failed to update address.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await apiClient.delete(`branch/branch_addresses/${id}/`);
        setAddresses(addresses.filter((a) => a.id !== id));
      } catch (error) {
        alert("Failed to delete address. Please try again.");
      }
    }
  };

  const openEditModal = (address) => {
    setSelectedAddress(address);
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
  const filteredAddresses = addresses.filter(addr =>
    addr.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAddresses = [...filteredAddresses].sort((a, b) => {
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
  const currentAddresses = sortedAddresses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage);

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
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Branch Addresses</h1>
            <p className="text-sm text-gray-800 font-medium">Manage your office locations</p>
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
            placeholder="Search branches..."
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
                <th className="px-6 py-5 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('branch_name')}>
                  <div className="flex items-center">Branch Name {getSortIcon('branch_name')}</div>
                </th>
                <th className="px-6 py-5 border-b border-gray-300">Address</th>
                <th className="px-6 py-5 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('city')}>
                  <div className="flex items-center">Location {getSortIcon('city')}</div>
                </th>
                <th className="px-6 py-5 border-b border-gray-300">GSTIN</th>
                <th className="px-6 py-5 border-b border-gray-300">Contact</th>
                <th className="px-6 py-5 border-b border-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentAddresses.map((address) => (
                <tr key={address.id} className="group hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-6 font-semibold text-gray-900 text-sm">{address.branch_name}</td>
                  <td className="px-6 py-6 text-sm text-gray-800 max-w-xs truncate" title={address.branch_address}>{address.branch_address}</td>
                  <td className="px-6 py-6 text-sm text-gray-800">
                    <div className="font-medium">{address.city}</div>
                    <div className="text-xs text-gray-500">{address.state}</div>
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-800 font-mono">{address.gstin}</td>
                  <td className="px-6 py-6 text-sm text-gray-800">
                    <div>{address.phone_code} {address.phone}</div>
                    {address.website && <div className="text-xs text-blue-600 underline truncate max-w-[150px]">{address.website}</div>}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(address)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Address"
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Address"
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

        {/* Pagination */}
        {filteredAddresses.length > 0 && (
          <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all text-gray-800"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-semibold text-gray-800">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all text-gray-800"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {filteredAddresses.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-gray-800 text-sm italic font-medium">
              {searchTerm ? "No addresses found matching your search." : "No addresses found."}
            </p>
          </div>
        )}
      </div>

      <EditAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={selectedAddress}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ViewAddress;
