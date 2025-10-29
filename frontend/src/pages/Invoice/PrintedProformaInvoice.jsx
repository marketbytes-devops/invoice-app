import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

/* ---------- Number to Words ---------- */
const numberToWords = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";

  const convertBelowHundred = (n) =>
    n < 10 ? ones[n] : n < 20 ? teens[n - 10] : `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
  const convertBelowThousand = (n) =>
    n < 100 ? convertBelowHundred(n) : `${ones[Math.floor(n / 100)]} Hundred ${convertBelowHundred(n % 100)}`.trim();
  const convertBelowMillion = (n) =>
    n < 1000 ? convertBelowThousand(n) : `${convertBelowThousand(Math.floor(n / 1000))} Thousand ${convertBelowThousand(n % 1000)}`.trim();
  const convertMillions = (n) =>
    n < 1000000 ? convertBelowMillion(n) : `${convertBelowHundred(Math.floor(n / 1000000))} Million ${convertMillions(n % 1000000)}`.trim();

  return convertMillions(num);
};

/* ---------- Confirmation Modal ---------- */
const ConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Move to Final Invoice?</h3>
        <p className="text-sm text-gray-600 mb-6">
          This will save the invoice as final and move it to the final invoice list.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main Component ---------- */
const PrintedProformaInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const proformaInvoice = location.state?.invoice;
  const contentRef = useRef();

  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  /* ---------- Fetch Data ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          clientsRes,
          branchesRes,
          bankAccountsRes,
          taxesRes,
          logoRes,
        ] = await Promise.all([
          apiClient.get("clients/clients/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("bank/bank-accounts/"),
          apiClient.get("invoices/taxes/"),
          apiClient.get("invoices/settings/logo/"),
        ]);
        setClients(clientsRes.data || []);
        setBranches(branchesRes.data || []);
        setBankAccounts(bankAccountsRes.data || []);
        setTaxes(taxesRes.data || []);
        setLogoUrl(logoRes.data.logo_image);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, []);

  /* ---------- Page Title ---------- */
  useEffect(() => {
    if (proformaInvoice?.invoice_number) {
      document.title = proformaInvoice.invoice_number;
    }
    return () => {
      document.title = "Proforma Invoice";
    };
  }, [proformaInvoice]);

  /* ---------- Print ---------- */
  const handlePrint = () => {
    window.print();
  };

  /* ---------- Intercept Back Button ---------- */
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      setShowConfirm(true);
      // keep the current page in history so the user stays until they decide
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /* ---------- Move to Final Invoice ---------- */
  const moveToFinal = async () => {
    try {
      await apiClient.patch(`/invoices/invoices/${proformaInvoice.id}/`, {
        is_final: true,
        is_saved_final: true,
      });
      navigate("/invoice/invoice-list");
    } catch (err) {
      console.error("Failed to finalize invoice:", err);
      alert("Failed to move to final invoice. Please try again.");
    }
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    moveToFinal();
  };

  /* ---------- "No" → go to proforma list ---------- */
  const handleConfirmNo = () => {
    setShowConfirm(false);
    navigate("/invoice/proforma");   // <-- NEW: direct navigation
  };

  /* ---------- Guard ---------- */
  if (!proformaInvoice) {
    return <div className="text-center py-10">No invoice data available.</div>;
  }

  /* ---------- Destructure Invoice ---------- */
  const {
    invoice_number,
    final_invoice_number,
    invoice_date,
    due_date,
    client,
    branch_address,
    bank_account,
    items = [],
    total_due,
    currency_type,
    payment_terms,
    subtotal,
    gst,
    discount,
    amount_paid,
    tax_option,
    tax_rate,
    tax_name,
  } = proformaInvoice;

  const clientDetails = clients.find((c) => c.id === client) || {};
  const branchDetails = branches.find((b) => b.id === branch_address) || {};
  const bankDetails = bankAccounts.find((ba) => ba.id === bank_account) || {};

  const displayTaxName =
    tax_name ||
    (tax_rate && taxes.find((t) => t.percentage === tax_rate)?.name) ||
    "Tax";

  const displayInvoiceNumber = final_invoice_number || invoice_number || "N/A";
  const totalInWords = numberToWords(Math.round(total_due)) || "N/A";

  /* ---------- Render ---------- */
  return (
    <div className="flex flex-col items-center bg-white min-h-screen">
      {/* ==== INVOICE CONTENT (unchanged) ==== */}
      <div
        className="max-w-[27cm] w-full ml-0 mr-[0.5cm] p-5 box-border font-sans print-container"
        ref={contentRef}
        style={{ overflow: "visible" }}
      >
        {/* Header */}
        <div className="flex justify-between mb-16 items-start">
          <div className="w-1/4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-28 h-32" />
            ) : (
              <div className="w-28 h-32 bg-gray-200 flex items-center justify-center">
                No Logo
              </div>
            )}
          </div>
          <div className="w-3/4 flex flex-col">
            <div className="flex justify-end mb-2">
              <div className="w-1/2 text-center">
                <h3 className="font-extrabold text-3xl">PROFORMA INVOICE</h3>
              </div>
            </div>

            <div className="w-full flex">
              <div className="w-1/2" style={{ marginTop: "0.5cm" }}>
                <h4 className="font-weight: 100;">Invoice to:</h4>
                <p className="font-bold text-xl">
                  {clientDetails?.client_name || "Unknown Client"}
                </p>
                <h6 className="font-bold mt-5">Address</h6>
                <p>
                  {clientDetails?.address || "N/A"},{" "}
                  {clientDetails?.city || "N/A"},{" "}
                  {clientDetails?.state || "N/A"},{" "}
                  {clientDetails?.pincode || "N/A"}
                </p>
                <p className="mt-5">
                  <b>GSTIN:</b>{" "}
                  {clientDetails?.gst || clientDetails?.vat || "N/A"}
                </p>
                <p>
                  <b>P:</b> {clientDetails?.phone_code || ""}{" "}
                  {clientDetails?.phone || "N/A"}
                </p>
                <p>
                  <b>W:</b> {clientDetails?.website || "N/A"}
                </p>
              </div>

              <div className="w-1/2" style={{ marginTop: "0.5cm" }}>
                <h4 className="font-weight: 100;">Invoice from:</h4>
                <p className="font-bold text-xl">
                  {branchDetails?.branch_name || "Unknown Branch"}
                </p>
                <h6 className="font-bold mt-5">Address</h6>
                <p>
                  {branchDetails?.branch_address || "N/A"},{" "}
                  {branchDetails?.city || "N/A"},{" "}
                  {branchDetails?.state || "N/A"},{" "}
                  {branchDetails?.pincode || "N/A"}
                </p>
                <p className="mt-5">
                  <b>GSTIN:</b> {branchDetails?.gstin || "N/A"}
                </p>
                <p>
                  <b>P:</b> {branchDetails?.phone_code || ""}{" "}
                  {branchDetails?.phone || "N/A"}
                </p>
                <p>
                  <b>W:</b> {branchDetails?.website || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table + Right Column */}
        <div className="grid grid-cols-[7fr_4fr] gap-4 mb-5 items-start">
          <div className="w-full">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">NO.</th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">ITEM DESCRIPTION</th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">QUANTITY</th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">Tax</th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">PRICE</th>
                  <th className="p-4">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                  >
                    <td className="p-6 whitespace-nowrap border-r-4 border-white">{i + 1}</td>
                    <td className="p-6 whitespace-nowrap border-r-4 border-white">{item.name || "N/A"}</td>
                    <td className="p-6 whitespace-nowrap border-r-4 border-white">{item.quantity || 0}</td>
                    <td className="p-6 whitespace-nowrap border-r-4 border-white">{item.total_gst || 0}</td>
                    <td className="p-6 whitespace-nowrap border-r-4 border-white">{item.unit_cost || 0}</td>
                    <td className="p-6 whitespace-nowrap border-r-4 border-white">{item.total || 0}</td>
                  </tr>
                ))}

                {Array.from({ length: Math.max(0, 7 - items.length) }).map((_, i) => (
                  <tr
                    key={`ph-${i}`}
                    className={`border-b border-gray-100 ${(items.length + i) % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                  >
                    <td className="p-6 border-r-4 border-white"></td>
                    <td className="p-6 border-r-4 border-white"></td>
                    <td className="p-6 border-r-4 border-white"></td>
                    <td className="p-6 border-r-4 border-white"></td>
                    <td className="p-6 border-r-4 border-white"></td>
                    <td className="p-6 border-r-4 border-white"></td>
                  </tr>
                ))}

                <tr className="bg-gray-100">
                  <td colSpan="3"></td>
                  <td className="text-right font-bold p-2">Subtotal:</td>
                  <td colSpan="2" className="text-right font-bold p-2">
                    {subtotal || 0} {currency_type}
                  </td>
                </tr>

                {tax_option === "yes" && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-bold p-2">{displayTaxName}:</td>
                    <td colSpan="2" className="text-right font-bold p-2">
                      {gst || 0} {currency_type}
                    </td>
                  </tr>
                )}

                {discount && parseFloat(discount) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-bold p-2">Discount:</td>
                    <td colSpan="2" className="text-right font-bold p-2">
                      -{discount} {currency_type}
                    </td>
                  </tr>
                )}

                {amount_paid && parseFloat(amount_paid) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-bold p-2">Amount Paid:</td>
                    <td colSpan="2" className="text-right font-bold p-2">
                      -{amount_paid} {currency_type}
                    </td>
                  </tr>
                )}

                <tr className="bg-black text-white font-extrabold">
                  <td colSpan="2" className="text-right px-2 py-4">Grand Total:</td>
                  <td colSpan="4" className="text-right px-2 py-4">
                    {total_due || 0} {currency_type}
                  </td>
                </tr>

                <tr className="bg-black text-white font-extrabold">
                  <td colSpan="2" className="text-left px-2 py-4">Total in Words:</td>
                  <td colSpan="4" className="text-right px-2 py-4">{totalInWords}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Column – unchanged (kept compact) */}
          <div className="w-full flex flex-col justify-between">
            <div>
              <h6 className="mt-[-0.5rem] font-bold text-lg">Invoice Details</h6>
              <div className="mt-2 mr-3" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px" }}>Invoice No</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{displayInvoiceNumber}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px" }}>Invoice Date</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{invoice_date || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px" }}>Due Date</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{due_date || "N/A"}</span>
                </p>
              </div>

              <h6 className="font-bold text-lg mt-10 mb-4">Payment Information</h6>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px" }}>Bank Name</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.bank_name || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px" }}>Account Number</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px", whiteSpace: "nowrap" }}>{bankDetails?.account_number || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px" }}>IFSC Code</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.ifsc_code || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "128px" }}>SWIFT Code</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.swift_code || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "128px" }}>MICR Code</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.micr_code || "N/A"}</span>
                </p>
              </div>

              <h6 className="font-bold text-lg mt-10">Payment Terms</h6>
              <p style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "130px" }}>{payment_terms || "N/A"}</span>
              </p>

              <h6 className="font-bold text-lg mt-3">Currency</h6>
              <p style={{ display: "flex", alignItems: "center" }}>
                <span style={{ width: "130px" }}>{currency_type || "N/A"}</span>
              </p>
            </div>

            <div className="flex justify-start mb-5">
              <div className="mt-12 flex flex-col items-start">
                <p className="font-black text-left text-black text-2xl">
                  {total_due || 0} {currency_type || "N/A"}
                </p>
                <div className="mt-4">
                  <p className="bg-black text-white font-bold text-center px-10 py-2.5 inline-block">
                    TOTAL DUE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mb-4">
          <h4 className="font-bold">Note:</h4>
          <p className="text-justify">
            Please make the payment of {total_due || 0} {currency_type || "N/A"} to the bank account details provided above. Upon receiving the payment, we will proceed with the services/products as agreed and provide a receipt. Thank you for choosing {branchDetails?.branch_name || "Unknown Branch"}. Contact us at {branchDetails?.phone_code || ""} {branchDetails?.phone || "N/A"}.
          </p>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-8 w-full max-w-[27cm] mr-[0.5cm] no-print">
        <button
          onClick={handlePrint}
          className="bg-black text-white hover:bg-white hover:text-black border text-sm font-bold px-3 py-3 rounded w-full transition-colors duration-300"
        >
          Print Invoice
        </button>
      </div>

      {/* Modal – triggered by back button */}
      <ConfirmModal
        open={showConfirm}
        onClose={handleConfirmNo}
        onConfirm={handleConfirmYes}
      />
    </div>
  );
};

export default PrintedProformaInvoice;