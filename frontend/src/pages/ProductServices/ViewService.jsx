import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import apiClient from "../../api/apiClient";
import { Pencil, Trash2, X, Save, Briefcase, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Pagination from "../../components/Pagination";

const EditServiceModal = ({ isOpen, onClose, service, onUpdate }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({ name: service.name });
    }
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(service.id, formData);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Service</h3>
              <p className="text-xs text-gray-800 font-medium mt-1">Update service details</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest mb-2 px-1">Service Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold"
                placeholder="Service Name"
              />
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

const ViewService = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiClient.get("services/services/");
      setServices(response.data.sort((a,b) => b.id - a.id));
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch services. Please try again later.");
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await apiClient.put(`services/services/${id}/`, updatedData);
      setServices(services.map(s => s.id === id ? { ...s, ...updatedData } : s));
    } catch (error) {
      alert("Failed to update service.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await apiClient.delete(`services/services/${id}/`);
        setServices(services.filter((service) => service.id !== id));
      } catch (error) {
        alert("Failed to delete service. Please try again.");
      }
    }
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Sorting Logic
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Logic
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = sortedServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Reset pagination when search changes
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
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
            <p className="text-sm text-gray-800 font-medium">Manage and view your service offerings</p>
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
            placeholder="Search services..."
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
                <th
                  className="px-8 py-5 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Service Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-8 py-5 border-b border-gray-300 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentServices.map((service) => (
                <tr key={service.id} className="group hover:bg-gray-100 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{service.name}</span>
                  </td>
                  <td className="px-8 py-6 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Service"
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Service"
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
          totalItems={filteredServices.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {filteredServices.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-gray-800 text-sm italic font-medium">
              {searchTerm ? "No services found matching your search." : "No services found."}
            </p>
          </div>
        )}
      </div>

      <EditServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ViewService;