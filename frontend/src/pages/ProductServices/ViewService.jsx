import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";

const ViewService = () => {
  const { register } = useForm();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiClient.get("services/services/");
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch services. Please try again later.");
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service.id);
    setEditedData({ name: service.name });
  };

  const handleUpdate = async (id) => {
    try {
      await apiClient.put(`services/services/${id}/`, editedData);
      fetchServices();
      setEditingService(null);
      alert("Service updated successfully!");
    } catch (error) {
      alert("Failed to update service. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setEditedData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await apiClient.delete(`services/services/${id}/`);
        setServices(services.filter((service) => service.id !== id));
        alert("Service deleted successfully!");
      } catch (error) {
        alert("Failed to delete service. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl py-6">
        <h2 className="text-xl text-gray-800 font-extrabold text-center mb-6">
          View Services
        </h2>
        {loading ? (
          <p className="text-center text-gray-600">Loading services...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500">No services found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  ID
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Name
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-gray-500 hover:bg-gray-100"
                >
                  <td className="p-4 align-middle">{service.id}</td>
                  <td className="p-4 align-middle">
                    {editingService === service.id ? (
                      <FormField
                        label="Edit Service Name"
                        name={`name-${service.id}`}
                        type="text"
                        value={editedData.name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, name: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      service.name
                    )}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-2">
                      {editingService === service.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(service.id)}
                            className="flex items-center gap-1 bg-green-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                          >
                            <Check size={16} /> Update
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 bg-gray-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(service)}
                          className="flex items-center gap-1 bg-blue-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="flex items-center gap-1 bg-red-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewService;