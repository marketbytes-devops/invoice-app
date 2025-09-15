import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";

const ViewClient = () => {
  const { register } = useForm();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [editedData, setEditedData] = useState({});

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

  const handleEdit = (client) => {
    setEditingClient(client.id);
    setEditedData({
      client_name: client.client_name,
      country: client.country,
      state: client.state,
      city: client.city,
      address: client.address,
      phone: client.phone,
      tax_type: client.tax_type,
      gst: client.gst === "0.00" ? "" : client.gst, 
      vat: client.vat === "0.00" ? "" : client.vat, 
      website: client.website,
      invoice_series: client.invoice_series,
      status: client.status.toString(),
    });
  };

  const handleUpdate = async (id) => {
    try {
      const payload = {
        ...editedData,
        status: editedData.status === "true",
        gst: editedData.tax_type === "gst" ? editedData.gst || "0.00" : "0.00",
        vat: editedData.tax_type === "vat" ? editedData.vat || "0.00" : "0.00",
      };
      await apiClient.put(`clients/clients/${id}/`, payload);
      fetchClients();
      setEditingClient(null);
      alert("Client updated successfully!");
    } catch (error) {
      alert("Failed to update client. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setEditedData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await apiClient.delete(`clients/clients/${id}/`);
        setClients(clients.filter((client) => client.id !== id));
        alert("Client deleted successfully!");
      } catch (error) {
        alert("Failed to delete client. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl py-6 overflow-x-auto">
        <h2 className="text-xl text-gray-800 font-extrabold text-center mb-6">
          View Clients
        </h2>
        {loading ? (
          <p className="text-center text-gray-600">Loading clients...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : clients.length === 0 ? (
          <p className="text-center text-gray-600">No clients found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">ID</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Client Name</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Country</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">State</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">City</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Address</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Phone</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Tax Type</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">GST/VAT</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Website</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Invoice Series</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Status</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-500 hover:bg-gray-100">
                  <td className="p-4 align-middle">{client.id}</td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`client_name-${client.id}`}
                        type="text"
                        value={editedData.client_name}
                        onChange={(e) => setEditedData({ ...editedData, client_name: e.target.value })}
                        register={register}
                      />
                    ) : (
                      client.client_name
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`country-${client.id}`}
                        type="text"
                        value={editedData.country}
                        onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                        register={register}
                      />
                    ) : (
                      client.country
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`state-${client.id}`}
                        type="text"
                        value={editedData.state}
                        onChange={(e) => setEditedData({ ...editedData, state: e.target.value })}
                        register={register}
                      />
                    ) : (
                      client.state
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`city-${client.id}`}
                        type="text"
                        value={editedData.city}
                        onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                        register={register}
                      />
                    ) : (
                      client.city
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`address-${client.id}`}
                        type="text"
                        value={editedData.address}
                        onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                        register={register}
                      />
                    ) : (
                      client.address
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`phone-${client.id}`}
                        type="text"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        register={register}
                      />
                    ) : (
                      client.phone
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`tax_type-${client.id}`}
                        type="select"
                        value={editedData.tax_type}
                        onChange={(e) => setEditedData({ ...editedData, tax_type: e.target.value })}
                        options={[
                          { value: "gst", label: "GST" },
                          { value: "vat", label: "VAT" },
                          { value: "nil", label: "None" }, // Changed to "nil" to match API
                        ]}
                        register={register}
                      />
                    ) : (
                      client.tax_type
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <>
                        {editedData.tax_type === "gst" && (
                          <FormField
                            name={`gst-${client.id}`}
                            type="text"
                            value={editedData.gst}
                            onChange={(e) => setEditedData({ ...editedData, gst: e.target.value })}
                            register={register}
                          />
                        )}
                        {editedData.tax_type === "vat" && (
                          <FormField
                            name={`vat-${client.id}`}
                            type="text"
                            value={editedData.vat}
                            onChange={(e) => setEditedData({ ...editedData, vat: e.target.value })}
                            register={register}
                          />
                        )}
                        {editedData.tax_type === "nil" && "-"}
                      </>
                    ) : (
                      (client.tax_type === "gst" && client.gst !== "0.00" ? client.gst :
                       client.tax_type === "vat" && client.vat !== "0.00" ? client.vat : "-")
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`website-${client.id}`}
                        type="url"
                        value={editedData.website}
                        onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                        register={register}
                      />
                    ) : (
                      client.website
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`invoice_series-${client.id}`}
                        type="select"
                        value={editedData.invoice_series}
                        onChange={(e) => setEditedData({ ...editedData, invoice_series: e.target.value })}
                        options={[
                          { value: "domestic", label: "Sess" }, // Updated to match response
                          { value: "international", label: "Non Sess" },
                        ]}
                        register={register}
                      />
                    ) : (
                      client.invoice_series
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingClient === client.id ? (
                      <FormField
                        name={`status-${client.id}`}
                        type="select"
                        value={editedData.status}
                        onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                        options={[
                          { value: "true", label: "Active" },
                          { value: "false", label: "Inactive" },
                        ]}
                        register={register}
                      />
                    ) : (
                      client.status ? "Active" : "Inactive"
                    )}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-2">
                      {editingClient === client.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(client.id)}
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
                          onClick={() => handleEdit(client)}
                          className="flex items-center gap-1 bg-blue-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(client.id)}
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

export default ViewClient;