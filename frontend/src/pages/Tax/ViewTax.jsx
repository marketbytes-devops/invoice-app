import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";

const ViewTax = () => {
  const { register } = useForm();
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTax, setEditingTax] = useState(null);
  const [editedData, setEditedData] = useState({});
  

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const response = await apiClient.get("invoices/taxes/");
      setTaxes(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch taxes. Please try again later.");
      setLoading(false);
    }
  };

  const handleEdit = (tax) => {
    setEditingTax(tax.id);
    setEditedData({
      name: tax.name,
      percentage: tax.percentage,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await apiClient.put(`invoices/taxes/${id}/`, editedData);
      fetchTaxes();
      setEditingTax(null);
      alert("Tax updated successfully!");
    } catch (error) {
      alert("Failed to update tax. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingTax(null);
    setEditedData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tax?")) {
      try {
        await apiClient.delete(`invoices/taxes/${id}/`);
        setTaxes(taxes.filter((tax) => tax.id !== id));
        alert("Tax deleted successfully!");
      } catch (error) {
        alert("Failed to delete tax. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl py-6">
        <h2 className="text-xl text-gray-800 font-extrabold text-center mb-6">
          View Taxes
        </h2>
        {loading ? (
          <p className="text-center text-gray-600">Loading taxes...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : taxes.length === 0 ? (
          <p className="text-center text-gray-500">No taxes found.</p>
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
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">
                  Percentage
                </th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr
                  key={tax.id}
                  className="border-b border-gray-500 hover:bg-gray-100"
                >
                  <td className="p-4 align-middle">{tax.id}</td>
                  <td className="p-4 align-middle">
                    {editingTax === tax.id ? (
                      <FormField
                        label="Edit Tax Name"
                        name={`name-${tax.id}`}
                        type="text"
                        value={editedData.name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, name: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      tax.name
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingTax === tax.id ? (
                      <FormField
                        label="Edit Percentage"
                        name={`percentage-${tax.id}`}
                        type="number"
                        step="0.01"
                        value={editedData.percentage}
                        onChange={(e) =>
                          setEditedData({ ...editedData, percentage: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      `${tax.percentage}%`
                    )}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-2">
                      {editingTax === tax.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(tax.id)}
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
                          onClick={() => handleEdit(tax)}
                          className="flex items-center gap-1 bg-blue-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(tax.id)}
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

export default ViewTax;