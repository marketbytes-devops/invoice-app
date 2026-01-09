import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";

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


const PrintedProformaInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [proformaInvoice, setProformaInvoice] = useState(location.state?.invoice || null);
  const contentRef = useRef();

  useEffect(() => {
    if (!proformaInvoice && id) {
      const fetchInvoice = async () => {
        try {
          const res = await apiClient.get(`invoices/invoices/${id}/`);
          setProformaInvoice(res.data);
        } catch (err) {
          console.error("Failed to fetch invoice:", err);
        }
      };
      fetchInvoice();
    }
  }, [id, proformaInvoice]);

  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

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
    if (proformaInvoice?.invoice_number || proformaInvoice?.final_invoice_number) {
      const title = proformaInvoice.invoice_number || proformaInvoice.final_invoice_number || "Proforma Invoice";
      const sanitizedTitle = title.replace(/[\/\\?%*:|"<>]/g, "_");
      document.title = sanitizedTitle;
    }
    return () => {
      document.title = "Proforma Invoice";
    };
  }, [proformaInvoice]);

  /* ---------- Print ---------- */
  const handlePrint = () => {
    const title = proformaInvoice?.invoice_number || proformaInvoice?.final_invoice_number || "Invoice";
    const sanitizedTitle = title.replace(/[\/\\?%*:|"<>]/g, "_");
    document.title = sanitizedTitle;
    setTimeout(() => {
      window.print();
    }, 500);
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
        className="max-w-[27cm] w-full ml-0 mr-[0.5cm] p-5 box-border font-['Poppins'] print-container"
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
                <div className="w-[80%]">
                  <h4 className="font-weight: 100;">Invoice to :</h4>
                  <p className="font-bold text-xl">
                    {clientDetails?.client_name || "Unknown Client"}
                  </p>
                  <h6 className="font-bold mt-5">Address</h6>
                  <p>
                    {[
                      clientDetails?.address,
                      clientDetails?.city,
                      clientDetails?.state,
                      clientDetails?.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>
                <div className="mt-5">
                  {clientDetails?.gstin && (
                    <p>
                      <b>GSTIN :</b> {clientDetails?.gstin}
                    </p>
                  )}
                  <p>
                    <b>P :</b> {clientDetails?.phone_code || ""}{" "}
                    {clientDetails?.phone || "N/A"}
                  </p>
                  <p>
                    <b>W :</b> {clientDetails?.website || "N/A"}
                  </p>
                </div>
              </div>

              <div className="w-1/2" style={{ marginTop: "0.5cm" }}>
                <h4 className="font-weight: 100;">Invoice from :</h4>
                <p className="font-bold text-xl">
                  {branchDetails?.branch_name || "Unknown Branch"}
                </p>
                <h6 className="font-bold mt-5">Address</h6>
                <p>
                  {[
                    branchDetails?.branch_address,
                    branchDetails?.city,
                    branchDetails?.state,
                    branchDetails?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </p>
                <div className="mt-5">
                  {branchDetails?.gstin && (
                    <p>
                      <b>GSTIN :</b> {branchDetails?.gstin}
                    </p>
                  )}
                  <p>
                    <b>P :</b> {branchDetails?.phone_code || ""}{" "}
                    {branchDetails?.phone || "N/A"}
                  </p>
                  <p>
                    <b>W :</b> {branchDetails?.website || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table + Right Column */}
        <div className="grid grid-cols-[7fr_5fr] gap-4 mb-5 items-start">
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
                  <td className="text-right font-bold p-2 whitespace-nowrap">Subtotal :</td>
                  <td colSpan="2" className="text-right font-bold p-2 whitespace-nowrap">
                    {subtotal || 0} {currency_type}
                  </td>
                </tr>

                {tax_option === "yes" && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-bold p-2 whitespace-nowrap">{displayTaxName} :</td>
                    <td colSpan="2" className="text-right font-bold p-2 whitespace-nowrap">
                      {gst || 0} {currency_type}
                    </td>
                  </tr>
                )}

                {discount && parseFloat(discount) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-bold p-2 whitespace-nowrap">Discount :</td>
                    <td colSpan="2" className="text-right font-bold p-2 whitespace-nowrap">
                      -{discount} {currency_type}
                    </td>
                  </tr>
                )}

                {amount_paid && parseFloat(amount_paid) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-bold p-2 whitespace-nowrap">Amount Paid :</td>
                    <td colSpan="2" className="text-right font-bold p-2 whitespace-nowrap">
                      -{amount_paid} {currency_type}
                    </td>
                  </tr>
                )}

                <tr className="bg-black text-white font-extrabold">
                  <td colSpan="2" className="text-right px-2 py-4 whitespace-nowrap">Grand Total :</td>
                  <td colSpan="4" className="text-right px-2 py-4 whitespace-nowrap">
                    {total_due || 0} {currency_type}
                  </td>
                </tr>

                <tr className="bg-black text-white font-extrabold">
                  <td colSpan="2" className="text-left px-2 py-4 whitespace-nowrap">Total in Words :</td>
                  <td colSpan="4" className="text-right px-2 py-4 whitespace-nowrap">{totalInWords}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Column – unchanged (kept compact) */}
          <div className="w-full flex flex-col justify-between">
            <div>
              <h6 className="mt-[-0.5rem] font-bold text-lg">Invoice Details</h6>
              <div className="mt-2 mr-3" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="flex flex-col">
                  <span className="font-bold">Invoice No :</span>
                  <span>{displayInvoiceNumber}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Invoice Date :</span>
                  <span>{invoice_date || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Due Date :</span>
                  <span>{due_date || "N/A"}</span>
                </div>
              </div>

              <h6 className="font-bold text-lg mt-10 mb-4">Payment Information</h6>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px", minWidth: "150px" }}>Account Name</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.account_holder_name || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px", minWidth: "150px" }}>Bank Name</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.bank_name || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px", minWidth: "150px" }}>Account Number</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px", whiteSpace: "nowrap" }}>{bankDetails?.account_number || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "130px", minWidth: "150px" }}>IFSC Code</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.ifsc_code || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "128px", minWidth: "150px" }}>SWIFT Code</span>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>:</span>
                  <span style={{ marginLeft: "5px" }}>{bankDetails?.swift_code || "N/A"}</span>
                </p>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span className="font-bold" style={{ width: "128px", minWidth: "150px" }}>MICR Code</span>
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


    </div>
  );
};

export default PrintedProformaInvoice;