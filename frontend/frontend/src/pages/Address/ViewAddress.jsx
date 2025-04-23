import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";
 
const ViewAddress = () => {
  const { register } = useForm();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editedData, setEditedData] = useState({});
 
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
 
  const handleEdit = (address) => {
  setEditingAddress(address.id);
  setEditedData({
    branch_name: address.branch_name, // Corrected to use address.branch_name
    branch_address: address. branch_address,
    state: address.state,
    city: address.city,
    gstin: address.gstin,
    phone_code: address.phone_code,
    phone: address.phone,
    website: address.website,
  });
};
 
  const handleUpdate = async (id) => {
    try {
      await apiClient.put(`branch/branch_addresses/${id}/`, editedData);
      fetchAddresses();
      setEditingAddress(null);
      alert("Address updated successfully!");
    } catch (error) {
      alert("Failed to update address. Please try again.");
    }
  };
 
  const handleCancelEdit = () => {
    setEditingAddress(null);
    setEditedData({});
  };
 
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await apiClient.delete(`branch/branch_addresses/${id}/`);
        setAddresses(addresses.filter((address) => address.id !== id));
        alert("Address deleted successfully!");
      } catch (error) {
        alert("Failed to delete address. Please try again.");
      }
    }
  };
 
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl py-6 overflow-x-auto">
        <h2 className="text-xl text-gray-800 font-extrabold text-center mb-6">
          View Branch Addresses
        </h2>
        {loading ? (
          <p className="text-center text-gray-600">Loading addresses...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : addresses.length === 0 ? (
          <p className="text-center text-gray-500">No addresses found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  ID
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Branch Name
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Branch Address
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  State
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  City
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  GSTIN
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Phone Code
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Phone
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Website
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((address) => (
                <tr
                  key={address.id}
                  className="border-b border-gray-500 hover:bg-gray-100"
                >
                  <td className="p-4 align-middle">{address.id}</td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit Branch Name"
                        name={`branch_name-${address.id}`}
                        type="text"
                        value={editedData.branch_name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, branch_name: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.branch_name
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit Branch Address"
                        name={`branch_address-${address.id}`}
                        type="text"
                        value={editedData.branch_address}
                        onChange={(e) =>
                          setEditedData({ ...editedData, branch_address: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.branch_address
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit State"
                        name={`state-${address.id}`}
                        type="text"
                        value={editedData.state}
                        onChange={(e) =>
                          setEditedData({ ...editedData, state: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.state
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit City"
                        name={`city-${address.id}`}
                        type="text"
                        value={editedData.city}
                        onChange={(e) =>
                          setEditedData({ ...editedData, city: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.city
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit GSTIN"
                        name={`gstin-${address.id}`}
                        type="text"
                        value={editedData.gstin}
                        onChange={(e) =>
                          setEditedData({ ...editedData, gstin: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.gstin
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit Phone Code"
                        name={`phone_code-${address.id}`}
                        type="text"
                        value={editedData.phone_code}
                        onChange={(e) =>
                          setEditedData({ ...editedData, phone_code: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.phone_code
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit Phone"
                        name={`phone-${address.id}`}
                        type="text"
                        value={editedData.phone}
                        onChange={(e) =>
                          setEditedData({ ...editedData, phone: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.phone
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAddress === address.id ? (
                      <FormField
                        label="Edit Website"
                        name={`website-${address.id}`}
                        type="url"
                        value={editedData.website}
                        onChange={(e) =>
                          setEditedData({ ...editedData, website: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      address.website
                    )}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-2">
                      {editingAddress === address.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(address.id)}
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
                          onClick={() => handleEdit(address)}
                          className="flex items-center gap-1 bg-blue-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(address.id)}
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
 
export default ViewAddress;
 