import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import FormField from "../../components/FormField";
import { useForm } from "react-hook-form";

const ViewBankAccount = () => {
  const { register } = useForm();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await apiClient.get("bank/bank-accounts/");
      setBankAccounts(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bank accounts. Please try again later.");
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account.id);
    setEditedData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_type: account.account_type,
      ifsc_code: account.ifsc_code,
      swift_code: account.swift_code,
      micr_code: account.micr_code,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await apiClient.put(`bank/bank-accounts/${id}/`, editedData);
      fetchBankAccounts();
      setEditingAccount(null);
      alert("Bank account updated successfully!");
    } catch (error) {
      alert("Failed to update bank account. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setEditedData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await apiClient.delete(`bank/bank-accounts/${id}/`);
        setBankAccounts(bankAccounts.filter((account) => account.id !== id));
        alert("Bank account deleted successfully!");
      } catch (error) {
        alert("Failed to delete bank account. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl py-6 overflow-x-auto">
        <h2 className="text-xl text-gray-800 font-extrabold text-center mb-6">
          View Bank Accounts
        </h2>
        {loading ? (
          <p className="text-center text-gray-600">Loading bank accounts...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : bankAccounts.length === 0 ? (
          <p className="text-center text-gray-500">No bank accounts found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">ID</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Bank Name</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Account Number</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">Account Type</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">IFSC Code</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">SWIFT Code</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800">MICR Code</th>
                <th className="p-4 font-bold border-b border-gray-500 text-xs text-gray-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-gray-500 hover:bg-gray-100"
                >
                  <td className="p-4 align-middle">{account.id}</td>
                  <td className="p-4 align-middle">
                    {editingAccount === account.id ? (
                      <FormField
                        label="Edit Bank Name"
                        name={`bank_name-${account.id}`}
                        type="text"
                        value={editedData.bank_name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, bank_name: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      account.bank_name
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAccount === account.id ? (
                      <FormField
                        label="Edit Account Number"
                        name={`account_number-${account.id}`}
                        type="text"
                        value={editedData.account_number}
                        onChange={(e) =>
                          setEditedData({ ...editedData, account_number: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      account.account_number
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAccount === account.id ? (
                      <FormField
                        label="Edit Account Type"
                        name={`account_type-${account.id}`}
                        type="text"
                        value={editedData.account_type}
                        onChange={(e) =>
                          setEditedData({ ...editedData, account_type: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      account.account_type
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAccount === account.id ? (
                      <FormField
                        label="Edit IFSC Code"
                        name={`ifsc_code-${account.id}`}
                        type="text"
                        value={editedData.ifsc_code}
                        onChange={(e) =>
                          setEditedData({ ...editedData, ifsc_code: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      account.ifsc_code
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAccount === account.id ? (
                      <FormField
                        label="Edit SWIFT Code"
                        name={`swift_code-${account.id}`}
                        type="text"
                        value={editedData.swift_code}
                        onChange={(e) =>
                          setEditedData({ ...editedData, swift_code: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      account.swift_code
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {editingAccount === account.id ? (
                      <FormField
                        label="Edit MICR Code"
                        name={`micr_code-${account.id}`}
                        type="text"
                        value={editedData.micr_code}
                        onChange={(e) =>
                          setEditedData({ ...editedData, micr_code: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200"
                        register={register}
                      />
                    ) : (
                      account.micr_code
                    )}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-2">
                      {editingAccount === account.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(account.id)}
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
                          onClick={() => handleEdit(account)}
                          className="flex items-center gap-1 bg-blue-500 text-xs font-medium text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(account.id)}
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

export default ViewBankAccount;