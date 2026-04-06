import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import apiClient from "../../api/apiClient";
import {
  Pencil, Trash2, X, Save, User, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Search, Globe, Phone, CreditCard, Building2, MapPin, Activity, FileText
} from "lucide-react";
import { Country } from "country-state-city";
import SearchableSelect from "../../components/SearchableSelect";

const EditClientModal = ({ isOpen, onClose, client, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        status: client.status ? "true" : "false",
        gst: client.gst && client.gst !== "0.00" ? client.gst : "",
        vat: client.vat && client.vat !== "0.00" ? client.vat : "",
      });
    }
  }, [client]);

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
      const payload = {
        ...formData,
        status: formData.status === "true",
      };

      // Handle conditional tax fields
      if (formData.tax_type === "gst") {
        payload.vat = "0.00";
      } else if (formData.tax_type === "vat") {
        payload.gst = "0.00";
      } else {
        payload.gst = "0.00";
        payload.vat = "0.00";
      }

      await onUpdate(client.id, payload);
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
              <h3 className="text-xl font-semibold text-gray-900">Edit Client</h3>
              <p className="text-xs text-gray-800 font-medium mt-1">Update client details</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Client Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.client_name || ""}
                    onChange={(e) => handleChange("client_name", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                    placeholder="Client Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.website || ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                    placeholder="Website"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <textarea
                    required
                    rows={2}
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black resize-none"
                    placeholder="Address"
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
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* Tax Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SearchableSelect
                  label="Tax Type"
                  value={formData.tax_type || ""}
                  onChange={(val) => handleChange("tax_type", val)}
                  options={[
                    { label: "Select Type", value: "" },
                    { label: "GST", value: "gst" },
                    { label: "VAT", value: "vat" },
                    { label: "None", value: "nil" },
                  ]}
                  placeholder="Select Type"
                  icon={Activity}
                />
              </div>

              {formData.tax_type === "gst" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">GST Number</label>
                  <input
                    type="text"
                    required
                    value={formData.gst || ""}
                    onChange={(e) => handleChange("gst", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
              )}

              {formData.tax_type === "vat" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">VAT Number</label>
                  <input
                    type="text"
                    required
                    value={formData.vat || ""}
                    onChange={(e) => handleChange("vat", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">GSTIN</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.gstin || ""}
                    onChange={(e) => handleChange("gstin", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 outline-none font-semibold text-black"
                    placeholder="GSTIN (Optional)"
                  />
                </div>
              </div>

              <div>
                <SearchableSelect
                  label="Invoice Category"
                  value={formData.invoice_series || ""}
                  onChange={(val) => handleChange("invoice_series", val)}
                  options={[
                    { label: "Select Series", value: "" },
                    { label: "Non-SEZ (Domestic)", value: "domestic" },
                    { label: "SEZ (International)", value: "international" },
                  ]}
                  placeholder="Select Series"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <SearchableSelect
                  label="Status"
                  value={formData.status || "true"}
                  onChange={(val) => handleChange("status", val)}
                  options={[
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                  ]}
                  placeholder="Status"
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

const ViewClient = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Pagination, Sort, Search
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await apiClient.get("clients/clients/");
      setClients(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch clients. Please try again later.");
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await apiClient.put(`clients/clients/${id}/`, updatedData);
      setClients(clients.map(c => c.id === id ? { ...c, ...updatedData } : c));
    } catch (error) {
      alert("Failed to update client.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await apiClient.delete(`clients/clients/${id}/`);
        setClients(clients.filter((c) => c.id !== id));
      } catch (error) {
        alert("Failed to delete client. Please try again.");
      }
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
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
  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle boolean status sorting
    if (typeof aValue === 'boolean') aValue = aValue.toString();
    if (typeof bValue === 'boolean') bValue = bValue.toString();

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
  const currentClients = sortedClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

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
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-800 font-medium">Manage your client base</p>
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
            placeholder="Search clients..."
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
                <th className="px-6 py-5 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('client_name')}>
                  <div className="flex items-center">Client Name {getSortIcon('client_name')}</div>
                </th>
                <th className="px-6 py-5 border-b border-gray-300">Address</th>
                <th className="px-6 py-5 border-b border-gray-300">Phone</th>
                <th className="px-6 py-5 border-b border-gray-300">Tax Info</th>
                <th className="px-6 py-5 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center">Status {getSortIcon('status')}</div>
                </th>
                <th className="px-6 py-5 border-b border-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentClients.map((client) => (
                <tr key={client.id} className="group hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-6 font-semibold text-gray-900 text-sm">{client.client_name}</td>
                  <td className="px-6 py-6 text-sm text-gray-800 max-w-xs truncate" title={client.address}>{client.address}</td>
                  <td className="px-6 py-6 text-sm text-gray-800">{client.phone_code} {client.phone}</td>
                  <td className="px-6 py-6 text-sm text-gray-800">
                    <div className="flex flex-col">
                      <span className="capitalize font-medium">{client.tax_type}</span>
                      {client.tax_type === 'gst' && <span className="text-xs text-gray-500">{client.gst}</span>}
                      {client.tax_type === 'vat' && <span className="text-xs text-gray-500">{client.vat}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                      {client.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Client"
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Client"
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
        {filteredClients.length > 0 && (
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

        {filteredClients.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-gray-800 text-sm italic font-medium">
              {searchTerm ? "No clients found matching your search." : "No clients found."}
            </p>
          </div>
        )}
      </div>

      <EditClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={selectedClient}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ViewClient;