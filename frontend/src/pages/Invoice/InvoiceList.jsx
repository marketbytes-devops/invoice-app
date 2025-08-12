import React, { useState, useEffect } from "react";
import { FileText, Eye, Trash2 } from "lucide-react";
import apiClient from "../../api/apiClient";
import { useNavigate } from "react-router-dom";

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesResponse, clientsResponse, branchesResponse, bankAccountsResponse] = await Promise.all([
          apiClient.get("/invoices/final-invoices/"),
          apiClient.get("clients/clients/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("bank/bank-accounts/"),
        ]);
        setInvoices(invoicesResponse.data.filter((inv) => inv.is_final && inv.is_saved_final));
        setClients(clientsResponse.data);
        setBranches(branchesResponse.data);
        setBankAccounts(bankAccountsResponse.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch invoices. Please try again later.");
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
    navigate("/invoice/final-invoice-view", { state: { invoice } });
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to move this invoice back to Proforma?")) {
      try {
        await apiClient.patch(`/invoices/invoices/${invoiceId}/`, {
          is_final: false,
          is_saved_final: false
        });
        setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
        alert("Invoice moved back to Proforma successfully!");
      } catch (error) {
        console.error("Error moving invoice to Proforma:", error);
        alert("Failed to move invoice to Proforma. Please try again.");
      }
    }
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
        <h1 className="text-xl font-extrabold text-gray-800">Final Invoice List</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-gray-50 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-8 h-8 text-indigo-500" />
                <div>
                  <h5 className="text-lg font-semibold text-gray-800">
                    Invoice {invoice.final_invoice_number || invoice.invoice_number}
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
                  <span className="font-medium">Total Due:</span> {invoice.total_due} {invoice.currency_type}
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
                  <Trash2 size={16} /> Move to Proforma
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;