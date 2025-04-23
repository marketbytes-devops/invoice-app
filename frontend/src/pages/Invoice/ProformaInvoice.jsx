import React, { useState, useEffect } from "react";
import { FileText, Eye, Trash2, Pencil, Check, Printer, X } from "lucide-react";
import apiClient from "../../api/apiClient";
import { useNavigate } from "react-router-dom";

const ProformaInvoice = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesResponse, clientsResponse, branchesResponse, bankAccountsResponse] = await Promise.all([
          apiClient.get("invoices/invoices/"),
          apiClient.get("clients/clients/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("bank/bank-accounts/"),
        ]);
        setInvoices(invoicesResponse.data.filter((inv) => !inv.is_saved_final));
        setClients(clientsResponse.data);
        setBranches(branchesResponse.data);
        setBankAccounts(bankAccountsResponse.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.client_name : `Client ID: ${clientId}`;
  };

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch ? `${branch.branch_address} - ${branch.city}` : `Branch ID: ${branchId}`;
  };

  const getBankAccountDetails = (bankAccountId) => {
    const bankAccount = bankAccounts.find((ba) => ba.id === bankAccountId);
    return bankAccount ? `${bankAccount.bank_name} (${bankAccount.account_number})` : `Bank Account ID: ${bankAccountId}`;
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await apiClient.delete(`invoices/invoices/${invoiceId}/`);
        setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
        setIsModalOpen(false);
        alert("Invoice deleted successfully!");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice. Please try again.");
      }
    }
  };

  const handleEdit = (invoice) => {
    navigate("/invoice/edit", { state: { invoice } });
  };

  const handleMoveToFinal = async (invoice) => {
    try {
      const response = await apiClient.patch(`invoices/invoices/${invoice.id}/`, { is_final: true });
      const updatedInvoice = response.data;
      setInvoices(invoices.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv)));
      navigate("/invoice/final-invoice-view", { state: { invoice: updatedInvoice } });
    } catch (error) {
      console.error("Error moving to final:", error);
      alert("Failed to move to final invoice.");
    }
  };

  const handlePreviewAndPrint = (invoice) => {
    navigate("/invoice/printed-proforma-invoice", { state: { invoice } });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  // Filter invoices based on year and/or month
  const filteredInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.invoice_date);
    const invoiceYear = invoiceDate.getFullYear().toString();
    const invoiceMonth = (invoiceDate.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based

    const yearMatch = filterYear ? invoiceYear === filterYear : true;
    const monthMatch = filterMonth ? invoiceMonth === filterMonth : true;

    return yearMatch && monthMatch;
  });

  if (loading) return <p className="text-center text-gray-600">Loading invoices...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-extrabold text-gray-800">Proforma Invoices</h1>
        <div className="flex space-x-4">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Years</option>
            {[...new Set(invoices.map((inv) => new Date(inv.invoice_date).getFullYear()))]
              .sort()
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Months</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>
      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-gray-50 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-8 h-8 text-indigo-500" />
                <div>
                  <h5 className="text-lg font-semibold text-gray-800">
                    Invoice {invoice.invoice_number}
                  </h5>
                  <p className="text-sm text-gray-500">{getClientName(invoice.client)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {invoice.invoice_date}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Branch:</span> {getBranchName(invoice.branch_address)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Bank:</span> {getBankAccountDetails(invoice.bank_account)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span>{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      invoice.invoice_type === "product"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {invoice.invoice_type}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      invoice.is_final ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {invoice.is_final ? "Final (Pending Save)" : "Proforma"}
                  </span>
                </p>
              </div>
              <div className="mt-5 flex justify-start space-x-4">
                <button
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-800 transition-colors"
                  onClick={() => handleView(invoice)}
                >
                  <Eye size={16} /> View
                </button>
                <button
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-700 transition-colors"
                  onClick={() => handleDelete(invoice.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-600 transition-colors"
                  onClick={() => handleMoveToFinal(invoice)}
                >
                  <Check size={16} /> Move to Final Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[70vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Invoice: {selectedInvoice.invoice_number}
            </h2>
            <div className="space-y-2">
              <p><strong>Client:</strong> {getClientName(selectedInvoice.client)}</p>
              <p><strong>Branch:</strong> {getBranchName(selectedInvoice.branch_address)}</p>
              <p><strong>Bank Account:</strong> {getBankAccountDetails(selectedInvoice.bank_account)}</p>
              <p><strong>Invoice Date:</strong> {selectedInvoice.invoice_date}</p>
              <p><strong>Due Date:</strong> {selectedInvoice.due_date}</p>
              <p><strong>Currency:</strong> {selectedInvoice.currency_type}</p>
              <p><strong>Payment Terms:</strong> {selectedInvoice.payment_terms}</p>
              <p><strong>Tax Option:</strong> {selectedInvoice.tax_option}</p>
              <p><strong>Tax Rate:</strong> {selectedInvoice.tax_rate ? `${selectedInvoice.tax_rate}%` : "N/A"}</p>
              <p><strong>Subtotal:</strong> {selectedInvoice.subtotal} {selectedInvoice.currency_type}</p>
              <p><strong>GST:</strong> {selectedInvoice.gst} {selectedInvoice.currency_type}</p>
              <p><strong>Discount:</strong> {selectedInvoice.discount} {selectedInvoice.currency_type}</p>
              <p><strong>Shipping:</strong> {selectedInvoice.shipping} {selectedInvoice.currency_type}</p>
              <p><strong>Amount Paid:</strong> {selectedInvoice.amount_paid} {selectedInvoice.currency_type}</p>
              <p><strong>Total Due:</strong> {selectedInvoice.total_due} {selectedInvoice.currency_type}</p>
              <p><strong>Status:</strong> {selectedInvoice.is_final ? "Final (Pending Save)" : "Proforma"}</p>
            </div>

            {selectedInvoice.items.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700">Items</h3>
                <table className="w-full border-collapse mt-2">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="p-2 text-sm font-bold">Name</th>
                      <th className="p-2 text-sm font-bold">Quantity</th>
                      <th className="p-2 text-sm font-bold">Unit Cost</th>
                      <th className="p-2 text-sm font-bold">Total</th>
                      <th className="p-2 text-sm font-bold">GST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2 text-sm">{item.name}</td>
                        <td className="p-2 text-sm">{item.quantity}</td>
                        <td className="p-2 text-sm">{item.unit_cost} {selectedInvoice.currency_type}</td>
                        <td className="p-2 text-sm">{item.total} {selectedInvoice.currency_type}</td>
                        <td className="p-2 text-sm">{item.total_gst} {selectedInvoice.currency_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex mx-auto w-full items-center justify-start space-x-4">
              <button
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-600 transition-colors"
                onClick={() => handleEdit(selectedInvoice)}
              >
                <Pencil size={16} /> Edit
              </button>
              <button
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-700 transition-colors"
                onClick={() => handleDelete(selectedInvoice.id)}
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-600 transition-colors"
                onClick={() => handleMoveToFinal(selectedInvoice)}
              >
                <Check size={16} /> Move to Final Invoice
              </button>
              <button
                className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-400 transition-colors"
                onClick={() => handlePreviewAndPrint(selectedInvoice)}
              >
                <Printer size={16} /> Preview and Print
              </button>
              <button
                className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-400 transition-colors"
                onClick={closeModal}
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaInvoice;