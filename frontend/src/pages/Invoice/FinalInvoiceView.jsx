import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num < 0) return "Minus " + numberToWords(Math.abs(num));

  const convertMillions = (num) => {
    if (num < 100) return convertBelowHundred(num);
    else if (num < 1000) return convertBelowThousand(num);
    else if (num < 1000000) return convertBelowMillion(num);
    else {
      const millions = Math.floor(num / 1000000);
      const remainder = num % 1000000;
      return `${convertBelowHundred(millions)} Million ${convertMillions(
        remainder
      )}`.trim();
    }
  };

  const convertBelowMillion = (num) => {
    if (num < 1000) return convertBelowThousand(num);
    else {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      return `${convertBelowThousand(
        thousands
      )} Thousand ${convertBelowThousand(remainder)}`.trim();
    }
  };

  const convertBelowThousand = (num) => {
    if (num < 100) return convertBelowHundred(num);
    else {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      return `${ones[hundreds]} Hundred ${convertBelowHundred(
        remainder
      )}`.trim();
    }
  };

  const convertBelowHundred = (num) => {
    if (num < 10) return ones[num];
    else if (num < 20) return teens[num - 10];
    else {
      const tensPlace = Math.floor(num / 10);
      const onesPlace = num % 10;
      return `${tens[tensPlace]} ${ones[onesPlace]}`.trim();
    }
  };

  return convertMillions(num);
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

const FinalInvoiceView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const proformaInvoice = location.state?.invoice;
  const triggerPrint = location.state?.triggerPrint || false;
  const contentRef = useRef();

  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          clientsResponse,
          branchesResponse,
          bankAccountsResponse,
          taxesResponse,
          logoResponse,
        ] = await Promise.all([
          apiClient.get("clients/clients/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("bank/bank-accounts/"),
          apiClient.get("invoices/taxes/"),
          apiClient.get("invoices/settings/logo/"),
        ]);
        setClients(clientsResponse.data || []);
        setBranches(branchesResponse.data || []);
        setBankAccounts(bankAccountsResponse.data || []);
        setTaxes(taxesResponse.data || []);
        setLogoUrl(logoResponse.data.logo_image);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (triggerPrint && proformaInvoice) {
      const rawInvoiceNumber = proformaInvoice.final_invoice_number || proformaInvoice.invoice_number || "Invoice";
      const invoiceNumber = rawInvoiceNumber.replace(/[\/\\?%*:|"<>]/g, "-");
      document.title = invoiceNumber;

      setTimeout(() => {
        window.print();
      }, 500);

      setTimeout(() => {
        if (
          window.confirm(
            "Did you complete printing? Click OK to finalize the invoice."
          )
        ) {
          finalizeInvoice();
        } else {
          navigate("/invoice/proforma");
        }
      }, 1000);
    }
  }, [triggerPrint, proformaInvoice]);

  const finalizeInvoice = async () => {
    try {
      const response = await apiClient.patch(
        `invoices/invoices/${proformaInvoice.id}/`,
        {
          is_final: true,
          is_saved_final: true,
        }
      );
      const updatedInvoice = response.data;
      navigate("/invoice/invoice-list", { state: { invoice: updatedInvoice } });
    } catch (error) {
      console.error("Error finalizing invoice:", error);
      alert("Failed to finalize invoice. Please try again.");
      navigate("/invoice/proforma");
    }
  };

  useEffect(() => {
    if (proformaInvoice) {
      const invoiceNumber =
        proformaInvoice.final_invoice_number ||
        proformaInvoice.invoice_number ||
        "Invoice";
      document.title = invoiceNumber.replace(/[\/\\?%*:|"<>]/g, "-");

    }
    return () => {
      document.title = "Invoice";
    };
  }, [proformaInvoice]);

  if (!proformaInvoice) {
    return <div>No invoice data available.</div>;
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
  const totalInWords = numberToWords(Math.round(total_due)) || "N/A";

  const handlePrint = () => {
    const rawInvoiceNumber = proformaInvoice?.final_invoice_number || proformaInvoice?.invoice_number || "Invoice";
    const invoiceNumber = rawInvoiceNumber.replace(/[\/\\?%*:|"<>_]/g, "-");
    document.title = invoiceNumber;
    setTimeout(() => {
      window.print();
    }, 500);
  };

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
                <h3 className="font-bold text-4xl">INVOICE</h3>
              </div>
            </div>
            <div className="w-full flex">
              <div className="w-1/2" style={{ marginTop: "1.2cm" }}>
                <div className="w-[80%]">
                  <h4 className="font-weight: 100;">Invoice to :</h4>
                  <p className="font-semibold text-xl">
                    {clientDetails?.client_name || "Unknown Client"}
                  </p>
                  <h6 className="font-semibold mt-5">Address</h6>
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
                    <b>P :</b> {clientDetails?.phone || "N/A"}
                  </p>
                  <p>
                    <b>W :</b> {clientDetails?.website || "N/A"}
                  </p>
                </div>
              </div>
              <div className="w-1/2" style={{ marginTop: "1.2cm" }}>
                <h4 className="font-weight: 100;">Invoice from :</h4>
                <p className="font-semibold text-xl">
                  {branchDetails?.branch_name || "Unknown Branch"}
                </p>
                <h6 className="font-semibold mt-5">Address</h6>
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
                    <b>P :</b> {branchDetails?.phone || "N/A"}
                  </p>
                  <p>
                    <b>W :</b> {branchDetails?.website || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[7fr_5fr] gap-4 mb-5 items-start">
          <div className="w-full">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">
                    NO.
                  </th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">
                    ITEM DESCRIPTION
                  </th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">
                    QUANTITY
                  </th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">
                    Tax
                  </th>
                  <th className="p-4 whitespace-nowrap border-r-4 border-white">
                    PRICE
                  </th>
                  <th className="p-4">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      }`}
                  >
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">
                      {index + 1}
                    </td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">
                      {item.name || "N/A"}
                    </td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">
                      {item.quantity || 0}
                    </td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">
                      {item.total_gst || 0}
                    </td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">
                      {item.unit_cost || 0}
                    </td>
                    <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white">
                      {item.total || 0}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 7 - items.length) }).map(
                  (_, index) => (
                    <tr
                      key={`placeholder-${index}`}
                      className={`border-b border-gray-100 ${(items.length + index) % 2 === 0
                        ? "bg-white"
                        : "bg-gray-100"
                        }`}
                    >
                      <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white"></td>
                      <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white"></td>
                      <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white"></td>
                      <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white"></td>
                      <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white"></td>
                      <td className="w-full h-[56.5px] px-4 whitespace-nowrap border-r-4 border-white"></td>
                    </tr>
                  )
                )}
                <tr className="bg-gray-100">
                  <td colSpan="3" className="p-2"></td>
                  <td className="text-right font-semibold p-2 whitespace-nowrap">
                    Subtotal :
                  </td>
                  <td
                    colSpan="2"
                    className="text-right font-semibold p-2 whitespace-nowrap"
                  >
                    {subtotal || 0} {currency_type}
                  </td>
                </tr>
                {tax_option === "yes" && (
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="p-2"></td>
                    <td className="text-right font-semibold p-2 whitespace-nowrap">
                      {displayTaxName} :
                    </td>
                    <td
                      colSpan="2"
                      className="text-right font-semibold p-2 whitespace-nowrap"
                    >
                      {gst || 0} {currency_type}
                    </td>
                  </tr>
                )}
                {discount && parseFloat(discount) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="p-2"></td>
                    <td className="text-right font-semibold p-2 whitespace-nowrap">
                      Discount :
                    </td>
                    <td
                      colSpan="2"
                      className="text-right font-semibold p-2 whitespace-nowrap"
                    >
                      -{discount} {currency_type}
                    </td>
                  </tr>
                )}
                {amount_paid && parseFloat(amount_paid) > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="p-2"></td>
                    <td className="text-right font-semibold p-2 whitespace-nowrap">
                      Amount Paid :
                    </td>
                    <td
                      colSpan="2"
                      className="text-right font-semibold p-2 whitespace-nowrap"
                    >
                      -{amount_paid} {currency_type}
                    </td>
                  </tr>
                )}
                <tr className="bg-black text-white font-bold">
                  <td colSpan="2" className="text-right px-2 py-4">
                    <p className="text-left">Grand Total:</p>
                  </td>
                  <td colSpan="4" className="text-right px-2 py-4">
                    <p>
                      <span>
                        {total_due || 0} {currency_type}
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="bg-black text-white font-bold">
                  <td colSpan="2" className="text-left px-2 py-4">
                    <p className="text-left">Total in Words:</p>
                  </td>
                  <td colSpan="4" className="text-right px-2 py-4">
                    {totalInWords}
                  </td>
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
        <div className="mb-4 mt-8">
          <h4 className="font-semibold mb-2">Note:</h4>
          <p
            className="text-justify"
            style={{ maxWidth: "100%", wordWrap: "break-word" }}
          >
            <p>
              Please make the payment of {total_due || 0}{" "}
              {currency_type || "N/A"} to the bank account details provided
              above. Upon receiving the payment, will proceed with the services/products as agreed and provide a receipt for the payment received. Thank you for choosing {branchDetails?.branch_name || "Unknown Branch"}.
            </p>
            <p className="mt-2">
              If you have any
              questions or require further assistance, please don’t hesitate to
              contact us at {branchDetails?.phone || "N/A"}.
            </p>
          </p>
        </div>
      </div>
      <div className="text-center mt-8 w-full max-w-[27cm] mr-[0.5cm] no-print">
        <button
          className="bg-black text-white hover:bg-white hover:text-black border text-sm font-semibold px-3 py-3 rounded w-full transition-colors duration-300"
          onClick={handlePrint}
        >
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default FinalInvoiceView;