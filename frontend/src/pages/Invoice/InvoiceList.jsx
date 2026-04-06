import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { FileText, Eye, Trash2, Printer, X, Calendar, Filter } from "lucide-react";
import apiClient from "../../api/apiClient";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal";
import SearchableSelect from "../../components/SearchableSelect";

const formatInvoiceNumber = (num) => {
  if (!num) return "N/A";
  if (num.startsWith("MB-")) {
    const parts = num.split("-");
    const seq = parts[1];
    if (seq && /^\d+$/.test(seq)) {
      return `MB-${parseInt(seq).toString().padStart(2, '0')}`;
    }
  }
  if (num.includes("/")) {
    const parts = num.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart && /^\d+$/.test(lastPart)) {
      parts[parts.length - 1] = parseInt(lastPart).toString().padStart(2, '0');
      return parts.join("/");
    }
  }
  return num;
};

const ViewInvoiceModal = ({ invoice, onClose, onDelete, onPrint, getClientName, getBranchName, getBankAccountDetails }) => {
  if (!invoice) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-xl">
                <FileText className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {formatInvoiceNumber(invoice.final_invoice_number || invoice.invoice_number)}
                </h2>
                <p className="text-sm text-gray-500 font-medium">Final Invoice Details</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          {/* Status Banner */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black text-white">
                Finalized
              </span>
              <span className="text-sm text-gray-500 font-medium">
                Created on {new Date(invoice.invoice_date).toLocaleDateString()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">{invoice.total_due} {invoice.currency_type}</p>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Information</h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-black/20 transition-colors">
                  <p className="font-bold text-lg text-gray-900 mb-1">{getClientName(invoice.client)}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      INV Date: <span className="text-gray-900">{invoice.invoice_date}</span>
                    </p>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      Due Date: <span className="text-gray-900">{invoice.due_date}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Issuing Branch</h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-black/20 transition-colors">
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {getBranchName(invoice.branch_address)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-black/20 transition-colors space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Bank Account</p>
                    <p className="text-sm text-gray-900 font-medium mt-1">{getBankAccountDetails(invoice.bank_account)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Payment Terms</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">{invoice.payment_terms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Currency</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">{invoice.currency_type}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Financial Summary</h3>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-bold">{invoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">GST ({invoice.tax_rate}%)</span>
                    <span className="text-gray-900 font-bold">{invoice.gst}</span>
                  </div>
                  {parseFloat(invoice.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">-{invoice.discount}</span>
                    </div>
                  )}
                  {parseFloat(invoice.amount_paid) > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span className="font-medium">Amount Paid</span>
                      <span className="font-bold">-{invoice.amount_paid}</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-900 font-bold">Total Due</span>
                    <span className="text-xl font-black text-gray-900">{invoice.total_due}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Line Items</h3>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Unit Cost</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-bold text-gray-900">{item.name}</td>
                      <td className="p-4 text-sm font-medium text-gray-700 text-center">{item.quantity}</td>
                      <td className="p-4 text-sm font-medium text-gray-700 text-right">{item.unit_cost}</td>
                      <td className="p-4 text-sm font-bold text-gray-900 text-right">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 justify-end items-center">
          <button
            onClick={() => onPrint(invoice)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={() => onDelete(invoice.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-all ml-auto sm:ml-0"
          >
            <Trash2 className="w-4 h-4" /> Move to Proforma
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, clientsRes, branchesRes, banksRes] = await Promise.all([
          apiClient.get("/invoices/final-invoices/"),
          apiClient.get("clients/clients/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("bank/bank-accounts/"),
        ]);

        // Filter only final invoices
        const finalInvoices = invoicesRes.data.filter(inv => inv.is_final && inv.is_saved_final);
        setInvoices(finalInvoices);
        setClients(clientsRes.data);
        setBranches(branchesRes.data);
        setBankAccounts(banksRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getClientName = (id) => clients.find(c => c.id === id)?.client_name || "N/A";
  const getBranchName = (id) => {
    const branch = branches.find(b => b.id === id);
    return branch ? `${branch.branch_address}, ${branch.city}` : "N/A";
  };
  const getBankAccountDetails = (id) => {
    const bank = bankAccounts.find(b => b.id === id);
    return bank ? `${bank.bank_name} - ${bank.account_number}` : "N/A";
  };

  // Filter Logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const date = new Date(inv.invoice_date);
      const yearMatch = filterYear ? date.getFullYear().toString() === filterYear : true;
      const monthMatch = filterMonth ? (date.getMonth() + 1).toString().padStart(2, '0') === filterMonth : true;
      return yearMatch && monthMatch;
    });
  }, [invoices, filterYear, filterMonth]);

  // Available Years for Filter
  const availableYears = useMemo(() => {
    const years = invoices.map(inv => new Date(inv.invoice_date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [invoices]);

  // Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'info',
    title: '',
    message: '',
    action: null,
    data: null
  });

  const openConfirmModal = (type, title, message, action, data) => {
    setModalConfig({ type, title, message, action, data });
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    const { action, data } = modalConfig;

    if (action === 'moveToProforma') {
      try {
        await apiClient.patch(`/invoices/invoices/${data.id}/`, {
          is_final: false,
          is_saved_final: false
        });
        setInvoices(prev => prev.filter(inv => inv.id !== data.id));
        if (selectedInvoice?.id === data.id) setSelectedInvoice(null);
        // Optional: We could show a success modal here, but for now just closing.
      } catch (error) {
        console.error("Failed to move invoice to Proforma", error);
        alert("Failed to move invoice to Proforma");
      }
    }
    setConfirmModalOpen(false);
  };

  const handleDelete = (id) => {
    openConfirmModal(
      'warning',
      'Move to Proforma',
      'Are you sure you want to move this invoice back to Proforma?',
      'moveToProforma',
      { id }
    );
  };

  const handlePrint = (invoice) => {
    navigate("/invoice/final-invoice-view", { state: { invoice } });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-4 w-4 bg-gray-200 rounded-full mb-2"></div>
        <div className="text-sm text-gray-400 font-medium">Loading Invoices...</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Final Invoices</h1>
          <p className="text-gray-500 mt-2 font-medium">View and manage your finalized invoices.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 border border-gray-200 rounded-2xl shadow-sm">
          {/* Year Filter */}
          <div className="w-48">
            <SearchableSelect
              options={[{ label: "All Years", value: "" }, ...availableYears.map(year => ({ label: year.toString(), value: year.toString() }))]}
              value={filterYear}
              onChange={(val) => setFilterYear(val)}
              placeholder="All Years"
              icon={Calendar}
            />
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          {/* Month Filter */}
          <div className="w-48">
            <SearchableSelect
              options={[
                { label: "All Months", value: "" },
                ...Array.from({ length: 12 }, (_, i) => ({
                  label: new Date(0, i).toLocaleString('default', { month: 'long' }),
                  value: (i + 1).toString().padStart(2, '0')
                }))
              ]}
              value={filterMonth}
              onChange={(val) => setFilterMonth(val)}
              placeholder="All Months"
              icon={Filter}
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-5 text-xs font-bold uppercase tracking-wider text-center w-16">No.</th>
                <th className="p-5 text-xs font-bold uppercase tracking-wider">Invoice Details</th>
                <th className="p-5 text-xs font-bold uppercase tracking-wider">Client</th>
                <th className="p-5 text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Amount</th>
                <th className="p-5 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                <th className="p-5 text-xs font-bold uppercase tracking-wider text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, index) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-all group">
                    <td className="p-5 text-sm font-bold text-gray-500 text-center">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                          <FileText className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{formatInvoiceNumber(inv.final_invoice_number || inv.invoice_number)}</p>
                          <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wide">
                            {inv.invoice_type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-gray-900">{getClientName(inv.client)}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5 max-w-[200px] truncate">
                        {getBranchName(inv.branch_address)}
                      </p>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-medium text-gray-700">{new Date(inv.invoice_date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                    </td>
                    <td className="p-5 text-right">
                      <p className="text-sm font-black text-gray-900">{inv.total_due}</p>
                      <p className="text-xs text-gray-500 font-bold">{inv.currency_type}</p>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-black text-white">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        Final
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(inv)}
                          className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-bold text-gray-900">No Final Invoices</p>
                      <p className="text-sm">Finalize proforma invoices to see them here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Stats for Table */}
        {filteredInvoices.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-xs font-semibold text-gray-500 flex justify-between items-center">
            <span>Showing {filteredInvoices.length} invoices</span>
            <span>Total Items: {invoices.length}</span>
          </div>
        )}
      </div>

      {/* View Modal Portal */}
      {selectedInvoice && (
        <ViewInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onDelete={handleDelete} // naming kept as is from props, matches handleMoveToProforma logic
          onPrint={handlePrint}
          getClientName={getClientName}
          getBranchName={getBranchName}
          getBankAccountDetails={getBankAccountDetails}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={handleConfirmAction}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default InvoiceList;