import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";

const numberToWords = (num, currency) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero " + currency + " Only";

  const convertBelowHundred = (n) =>
    n < 10 ? ones[n] : n < 20 ? teens[n - 10] : `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();

  const convertBelowThousand = (n) => {
    if (n < 100) return convertBelowHundred(n);
    const hundreds = ones[Math.floor(n / 100)];
    const remainder = n % 100;
    if (remainder === 0) return `${hundreds} Hundred`;
    return `${hundreds} Hundred and ${convertBelowHundred(remainder)}`;
  };

  const convertBelowMillion = (n) => {
    if (n < 1000) return convertBelowThousand(n);
    const thousands = convertBelowThousand(Math.floor(n / 1000));
    const remainder = n % 1000;
    if (remainder === 0) return `${thousands} Thousand`;
    return `${thousands} Thousand ${remainder < 100 ? "and " : ""}${convertBelowThousand(remainder)}`;
  };

  const convertMillions = (n) => {
    if (n < 1000000) return convertBelowMillion(n);
    const millions = convertBelowThousand(Math.floor(n / 1000000));
    const remainder = n % 1000000;
    if (remainder === 0) return `${millions} Million`;
    return `${millions} Million ${remainder < 100 ? "and " : ""}${convertBelowMillion(remainder)}`;
  };

  return `${convertMillions(Math.floor(num))} ${currency} Only`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

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
  const [companyName, setCompanyName] = useState("");

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
        setCompanyName(logoRes.data.company_name);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, []);

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

  const handlePrint = () => {
    const rawInvoiceNumber = proformaInvoice?.final_invoice_number || proformaInvoice?.invoice_number || "Invoice";
    const formattedNumber = formatInvoiceNumber(rawInvoiceNumber);
    const sanitizedTitle = formattedNumber.replace(/[\/\\?%*:|"<>_]/g, "-");
    document.title = sanitizedTitle;
    setTimeout(() => {
      window.print();
    }, 500);
  };



  if (!proformaInvoice) {
    return <div className="text-center py-10">No invoice data available.</div>;
  }

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

  const displayInvoiceNumber = formatInvoiceNumber(final_invoice_number || invoice_number);
  const totalInWords = numberToWords(Math.round(total_due), currency_type) || "N/A";

  return (
    <div className="flex flex-col items-center bg-white min-h-screen print:min-h-0 print:h-auto">
      <div
        className="max-w-[27cm] w-full ml-0 mr-[0.5cm] p-5 box-border font-['Poppins'] print-container"
        ref={contentRef}
        style={{ overflow: "visible" }}
      >
        <div className="flex justify-between mb-16 items-start">
          <div className="w-1/4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-40 h-40" />
            ) : (
              <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                No Logo
              </div>
            )}
          </div>
          <div className="w-3/4 flex flex-col">
            <div className="flex justify-end mb-2">
              <div className="w-1/2 text-right">
                <h3 className="font-bold text-4xl whitespace-nowrap">PROFORMA INVOICE</h3>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4" style={{ marginTop: "1.2cm" }}>
              {/* To Label */}
              <div>
                <h4 className="font-weight: 100;">Invoice to :</h4>
                <p className="font-semibold text-xl min-h-[3rem]">
                  {clientDetails?.client_name || "Unknown Client"}
                </p>
              </div>
              {/* From Label */}
              <div>
                <h4 className="font-weight: 100;">Invoice from :</h4>
                <p className="font-semibold text-xl min-h-[3rem]">
                  {companyName || branchDetails?.branch_name || "Unknown Company"}
                </p>
              </div>

              {/* Address Header */}
              <div>
                <h6 className="font-semibold mt-2">Address</h6>
                <div className="min-h-[5rem]">
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
              </div>
              <div>
                <h6 className="font-semibold mt-2">Address</h6>
                <div className="min-h-[5rem]">
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
                </div>
              </div>

              {/* GSTIN and Contact Header */}
              <div className="mt-2">
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
              <div className="mt-2">
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
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">{i + 1}</td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">{item.name || "N/A"}</td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">{item.quantity || 0}</td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">{item.total_gst || 0}</td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">{item.unit_cost || 0}</td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">{item.total || 0}</td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 7 - items.length) }).map((_, i) => (
                  <tr
                    key={`ph-${i}`}
                    className={`border-b border-gray-100 ${(items.length + i) % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                  >
                    <td className="w-full h-[56.5px] px-4 border-r-4 border-white"></td>
                    <td className="w-full h-[56.5px] px-4 border-r-4 border-white"></td>
                    <td className="w-full h-[56.5px] px-4 border-r-4 border-white"></td>
                    <td className="w-full h-[56.5px] px-4 border-r-4 border-white"></td>
                    <td className="w-full h-[56.5px] px-4 border-r-4 border-white"></td>
                    <td className="w-full h-[56.5px] px-4 border-r-4 border-white"></td>
                  </tr>
                ))}
                <tr className="bg-gray-100">
                  <td colSpan="3"></td>
                  <td className="text-right font-semibold p-2 whitespace-nowrap">Subtotal :</td>
                  <td colSpan="2" className="text-right font-semibold p-2 whitespace-nowrap">
                    {subtotal || 0} {currency_type}
                  </td>
                </tr>
                {tax_option === "yes" && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-semibold p-2 whitespace-nowrap">{displayTaxName} :</td>
                    <td colSpan="2" className="text-right font-semibold p-2 whitespace-nowrap">
                      {gst || 0} {currency_type}
                    </td>
                  </tr>
                )}
                {discount && parseFloat(discount) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-semibold p-2 whitespace-nowrap">Discount :</td>
                    <td colSpan="2" className="text-right font-semibold p-2 whitespace-nowrap">
                      -{discount} {currency_type}
                    </td>
                  </tr>
                )}
                {amount_paid && parseFloat(amount_paid) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3"></td>
                    <td className="text-right font-semibold p-2 whitespace-nowrap">Amount Paid :</td>
                    <td colSpan="2" className="text-right font-semibold p-2 whitespace-nowrap">
                      -{amount_paid} {currency_type}
                    </td>
                  </tr>
                )}
                <tr className="bg-black text-white font-bold">
                  <td colSpan="1" className="text-right px-2 py-4 whitespace-nowrap">Grand Total :</td>
                  <td colSpan="5" className="text-right px-2 py-4 whitespace-nowrap">
                    {total_due || 0} {currency_type}
                  </td>
                </tr>
                <tr className="bg-black text-white font-bold">
                  <td colSpan="2" className="text-left px-2 py-4 whitespace-nowrap">Total in Words :</td>
                  <td colSpan="4" className="text-right px-2 py-4 whitespace-nowrap">{totalInWords}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full flex flex-col justify-between">
            <div>
              <div>
                <h6 className="mt-[-0.5rem] font-semibold text-lg">
                  Invoice Details
                </h6>
                <div
                  className="mt-2 mr-3"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">Invoice No :</span>
                    <span>{displayInvoiceNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Invoice Date :</span>
                    <span>{formatDate(invoice_date)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Due Date :</span>
                    <span>{formatDate(due_date)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h6 className="font-semibold text-lg mt-5 mb-2">
                  Payment Information
                </h6>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <p style={{ whiteSpace: "nowrap" }}><span className="font-semibold">Account Name:</span> {bankDetails?.account_holder_name || "N/A"}</p>
                  <p style={{ whiteSpace: "nowrap" }}><span className="font-semibold">Bank Name:</span> {bankDetails?.bank_name || "N/A"}</p>
                  <p style={{ whiteSpace: "nowrap" }}><span className="font-semibold">Account Number:</span> {bankDetails?.account_number || "N/A"}</p>
                  <p style={{ whiteSpace: "nowrap" }}><span className="font-semibold">IFSC Code:</span> {bankDetails?.ifsc_code || "N/A"}</p>
                  <p style={{ whiteSpace: "nowrap" }}><span className="font-semibold">SWIFT Code:</span> {bankDetails?.swift_code || "N/A"}</p>
                  <p style={{ whiteSpace: "nowrap" }}><span className="font-semibold">MICR Code:</span> {bankDetails?.micr_code || "N/A"}</p>
                </div>
                <h6 className="font-semibold text-lg mt-5 mb-2">Payment Terms</h6>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span
                    className="font"
                    style={{ display: "inline-block", width: "130px" }}
                  >
                    {payment_terms || "N/A"}
                  </span>
                </p>
                <h6 className="font-semibold text-lg mt-5 mb-2">Currency</h6>
                <p style={{ display: "flex", alignItems: "center" }}>
                  <span
                    className="font"
                    style={{ display: "inline-block", width: "130px" }}
                  >
                    {currency_type || "N/A"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-start mb-5">
              <div className="mt-5 mb-5 flex flex-col items-start">
                <p className="font-bold text-left text-black text-2xl">
                  {total_due || 0} {currency_type || "N/A"}
                </p>
                <div className="mt-2">
                  <p className="bg-black text-white text-lg font-bold text-center px-10 py-2.5 inline-block">
                    TOTAL DUE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4 mt-10">
          <h4 className="font-semibold mb-2">Note:</h4>
          <p className="text-justify">
            Please make the payment of {total_due || 0} {currency_type || "N/A"} to the bank account details provided above. Upon receiving the payment, we will proceed with the services/products as agreed and provide a receipt for the payment recieved.
          </p>
          <p className="mt-4 text-justify">
            Thank you for choosing MarketBytes WebWorks Pvt. Ltd. If you have any questions or require further assistance, please don't hesitate to contact us at +91 97781 27272 or accounts@marketbytes.in.
          </p>
        </div>
      </div>
      <div className="text-center mt-8 w-full max-w-[27cm] mr-[0.5cm] no-print">
        <button
          onClick={handlePrint}
          className="bg-black text-white hover:bg-white hover:text-black border text-sm font-semibold px-3 py-3 rounded w-full transition-colors duration-300"
        >
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default PrintedProformaInvoice;