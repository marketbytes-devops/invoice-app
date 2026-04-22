import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient";
import SearchableSelect from "../../components/SearchableSelect";
import ConfirmationModal from "../../components/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCoins, 
  faTag, 
  faWallet, 
  faPercentage,
  faCreditCard
} from "@fortawesome/free-solid-svg-icons";
import {
  FileText,
  Calendar,
  Building2,
  User,
  CreditCard,
  DollarSign,
  Clock,
  Percent,
  Plus,
  ArrowLeft,
  Save,
  CheckCircle,
  Disc,
  X,
  CalendarDays
} from "lucide-react";

// Custom Input Component
const CustomInput = ({
  label,
  register,
  name,
  rules,
  error,
  icon: Icon,
  onChange: customOnChange,
  className,
  type = "text",
  ...props
}) => {
  const registration = register ? register(name, rules) : {};
  const { onChange, ...rest } = registration;

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {Icon?.iconName ? (
              <FontAwesomeIcon icon={Icon} className="h-5 w-5 text-gray-400" />
            ) : (
              <Icon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        )}
        <input
          type={type}
          {...rest}
          onChange={(e) => {
            if (onChange) onChange(e);
            if (customOnChange) customOnChange(e);
          }}
          className={`w-full bg-gray-50 border ${error ? "border-red-500" : "border-gray-300"
            } rounded-2xl ${Icon ? "pl-12" : "pl-4"
            } pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs px-1">{error.message}</p>}
    </div>
  );
};

const EditInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice;

  // Calculate current financial year based on date
  const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  // Generate financial year options (current year and -5 years)
  const getFinancialYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push({ value: `${i}-${i + 1}`, label: `${i}-${i + 1}` });
    }
    return years.reverse();
  };

  const today = new Date();
  const invoiceDateInit = today.toISOString().split("T")[0];
  const dueDateInit = new Date(today);
  dueDateInit.setDate(today.getDate() + 3);
  const dueDateString = dueDateInit.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: invoice
      ? {
        invoiceNumber: invoice.invoice_number,
        invoiceType: invoice.invoice_type,
        financialYear: invoice.financial_year || getCurrentFinancialYear(),
        clientName: invoice.client,
        branchAddress: invoice.branch_address,
        bankAccount: invoice.bank_account,
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        currencyType: invoice.currency_type,
        paymentTerms: invoice.payment_terms,
        taxable: invoice.tax_option,
        taxRate: invoice.tax_rate || "",
        discount: parseFloat(invoice.discount || "0.00"),
        amountPaid: parseFloat(invoice.amount_paid || "0.00"),
      }
      : {
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: invoiceDateInit,
        dueDate: dueDateString,
        financialYear: getCurrentFinancialYear(),
        taxable: "no",
        currencyType: "USD",
        paymentTerms: "Net 30",
        discount: 0,
        amountPaid: 0,
      },
  });

  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState(
    invoice?.items?.map((item) => {
      return {
        id: item.id,
        itemName: item.name || "",
        quantity: item.quantity,
        unitCost: parseFloat(item.unit_cost),
        itemGst: item.total_gst ? item.total_gst.toString() : "0",
        total: item.total ? item.total.toString() : "0",
        item_type: item.item_type,
        descriptions: Array.isArray(item.description) && item.description.length > 0 ? item.description : [""],
      };
    }) || [
      { itemName: "", quantity: 1, unitCost: 0, itemGst: "0%", total: 0, item_type: "", descriptions: [""] },
    ]
  );
  const [taxable, setTaxable] = useState(invoice?.tax_option || "no");
  const [selectedTaxRate, setSelectedTaxRate] = useState(
    invoice?.tax_rate ? invoice.tax_rate.toString() : "0%"
  );
  const [invoiceType, setInvoiceType] = useState(invoice?.invoice_type || "");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedInvoiceData, setUpdatedInvoiceData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          clientsResponse,
          branchesResponse,
          bankAccountsResponse,
          taxesResponse,
          productsResponse,
          servicesResponse,
          currenciesResponse,
        ] = await Promise.all([
          apiClient.get("clients/clients/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("bank/bank-accounts/"),
          apiClient.get("invoices/taxes/"),
          apiClient.get("products/products/"),
          apiClient.get("services/services/"),
          fetch("https://open.er-api.com/v6/latest/USD?apikey=bbc89a8a69d4fe2cca4524c2", {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
          }).catch((err) => {
            console.error("Fetch currencies failed:", err);
            return { ok: false };
          }),
        ]);

        const rawClients = clientsResponse.data || [];
        setClients(rawClients);
        setBranches(branchesResponse.data);
        setBankAccounts(bankAccountsResponse.data);
        setTaxes(taxesResponse.data);
        setProducts(productsResponse.data);
        setServices(servicesResponse.data);

        if (currenciesResponse.ok) {
          const currenciesData = await currenciesResponse.json();
          if (currenciesData.result === "success") {
            const currencyList = Object.keys(currenciesData.rates);
            setCurrencies(currencyList);
          } else {
            setCurrencies(["USD", "EUR", "GBP", "INR"]);
          }
        } else {
          setCurrencies(["USD", "EUR", "GBP", "INR"]);
        }
      } catch (error) {
        console.error("Error initializing data", error);
        if (currencies.length === 0) {
          setCurrencies(["USD", "EUR", "GBP", "INR"]);
        }
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTaxable(watch("taxable"));
    setSelectedTaxRate(watch("taxRate") || "0%");
    setInvoiceType(watch("invoiceType"));
  }, [watch("taxable"), watch("taxRate"), watch("invoiceType")]);

  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { itemName: "", quantity: 1, unitCost: 0, itemGst: "0%", total: 0, item_type: invoiceType, descriptions: [""] },
    ]);
  };

  const addDescription = (itemIndex) => {
    const updated = [...invoiceItems];
    updated[itemIndex].descriptions = [...(updated[itemIndex].descriptions || [""]), ""];
    setInvoiceItems(updated);
  };

  const removeDescription = (itemIndex, descIndex) => {
    const updated = [...invoiceItems];
    updated[itemIndex].descriptions = updated[itemIndex].descriptions.filter((_, i) => i !== descIndex);
    if (updated[itemIndex].descriptions.length === 0) updated[itemIndex].descriptions = [""];
    setInvoiceItems(updated);
  };

  const updateDescription = (itemIndex, descIndex, value) => {
    const updated = [...invoiceItems];
    updated[itemIndex].descriptions[descIndex] = value;
    setInvoiceItems(updated);
  };

  const removeItem = async (index) => {
    const itemToRemove = invoiceItems[index];
    console.log("Removing item:", itemToRemove);

    if (itemToRemove.id) {
      try {
        console.log(`Deleting item with ID: ${itemToRemove.id} from backend`);
        await apiClient.delete(`invoices/invoice-items/${itemToRemove.id}/`);
        console.log(`Successfully deleted item ${itemToRemove.id}`);
      } catch (error) {
        console.error("Error deleting item:", error.response?.data || error.message);
        alert("Failed to delete item from the backend. Check the console.");
        return;
      }
    } else {
      console.log("Item has no ID, removing locally only");
    }

    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index][field] = value;

    if (field === "itemName") {
      const selectedItem = (invoiceType === "product" ? products : services).find(
        (i) => i.name === value
      );
      if (invoiceType === "product") {
        updatedItems[index].unitCost = selectedItem?.unit_cost || selectedItem?.price || 0;
      } else {
        updatedItems[index].unitCost = updatedItems[index].unitCost || 0;
      }
      updatedItems[index].item_type = invoiceType;
    }

    if (field === "quantity") {
      updatedItems[index].quantity = parseInt(value) || 1;
    }

    const taxRate = parseFloat(selectedTaxRate) / 100;
    const baseTotal = updatedItems[index].quantity * updatedItems[index].unitCost;
    updatedItems[index].itemGst = (baseTotal * taxRate).toFixed(2);
    updatedItems[index].total = (baseTotal + parseFloat(updatedItems[index].itemGst)).toFixed(2);
    setInvoiceItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );
    const totalTax = invoiceItems.reduce(
      (sum, item) => sum + parseFloat(item.itemGst || 0),
      0
    );
    const discount = parseFloat(watch("discount")) || 0;
    const amountPaid = parseFloat(watch("amountPaid")) || 0;
    const totalDue = subtotal + totalTax - discount - amountPaid;

    setValue("subtotal", subtotal.toFixed(2));
    setValue("totalTax", totalTax.toFixed(2));
    setValue("totalDue", totalDue.toFixed(2));

    return { subtotal, totalTax, discount, amountPaid, totalDue };
  };

  useEffect(() => {
    calculateTotals();
  }, [invoiceItems, watch("discount"), watch("amountPaid"), selectedTaxRate]);

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/invoice/proforma", { state: { invoice: updatedInvoiceData } });
  };

  const onSubmit = async (data) => {
    try {
      const invoiceData = {
        invoice_type: data.invoiceType,
        financial_year: data.financialYear,
        client: parseInt(data.clientName),
        branch_address: parseInt(data.branchAddress),
        bank_account: parseInt(data.bankAccount),
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        currency_type: data.currencyType,
        payment_terms: data.paymentTerms,
        tax_option: data.taxable,
        tax_rate: data.taxable === "yes" ? parseFloat(selectedTaxRate) : null,
        discount: parseFloat(data.discount).toString() || "0.00",
        amount_paid: parseFloat(data.amountPaid).toString() || "0.00",
        is_final: invoice.is_final || false,
      };

      console.log("Updated Invoice Data:", JSON.stringify(invoiceData, null, 2));
      const invoiceResponse = await apiClient.put(`invoices/invoices/${invoice.id}/`, invoiceData);
      console.log("Invoice Updated:", invoiceResponse.data);

      const existingItemsResponse = await apiClient.get(`invoices/invoices/${invoice.id}/`);
      const existingItemIds = existingItemsResponse.data.items.map((item) => item.id);
      const currentItemIds = invoiceItems.map((item) => item.id).filter((id) => id);

      const itemsToDelete = existingItemIds.filter((id) => !currentItemIds.includes(id));
      for (const id of itemsToDelete) {
        try {
          await apiClient.delete(`invoices/invoice-items/${id}/`);
          console.log(`Deleted item ${id}`);
        } catch (error) {
          console.error(`Error deleting item ${id}:`, error.response?.data || error.message);
        }
      }

      for (const item of invoiceItems) {
        const itemData = {
          invoice: invoice.id,
          item_type: item.item_type || data.invoiceType,
          product:
            data.invoiceType === "product"
              ? products.find((p) => p.name === item.itemName)?.id || null
              : null,
          name: data.invoiceType === "service" ? item.itemName : null,
          quantity: item.quantity,
          unit_cost: item.unitCost.toString(),
          description: (item.descriptions || []).filter((d) => d.trim() !== ""),
        };

        if (item.id) {
          await apiClient.put(`invoices/invoice-items/${item.id}/`, itemData);
          console.log(`Updated item ${item.id}`);
        } else {
          const itemResponse = await apiClient.post("invoices/invoice-items/", itemData);
          console.log(`Created new item ${itemResponse.data.id}`);
        }
      }

      const updatedInvoiceResponse = await apiClient.get(`invoices/invoices/${invoice.id}/`);
      console.log("Updated Invoice with Final Number:", updatedInvoiceResponse.data);

      setUpdatedInvoiceData(updatedInvoiceResponse.data);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating invoice:", error.response?.data || error.message);
      alert("Failed to update invoice. Please check the console for details.");
    }
  };

  const selectedCurrency = watch("currencyType");
  const totalDue = parseFloat(watch("totalDue") || 0);
  const roundedTotalDue = Math.round(totalDue);
  const roundingDifference = (roundedTotalDue - totalDue).toFixed(2);
  const roundingDisplay = roundingDifference >= 0 ? `+${roundingDifference}` : roundingDifference;

  const activeClients = clients.filter((c) => {
    const isInactive = c.status === "inactive" || c.status === false;
    return !isInactive;
  });

  return (
    <div className="p-4 w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="p-3 bg-black rounded-2xl shadow-lg shadow-black/10">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Invoice</h1>
            <p className="text-sm text-gray-800 font-medium">{invoice?.invoice_number}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-300 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* General Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5" /> General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: Invoice Type and Financial Year (Split column) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="invoiceType"
                  control={control}
                  rules={{ required: "Invoice Type is required" }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Invoice Type"
                      options={[
                        { value: "product", label: "Product" },
                        { value: "service", label: "Service" },
                      ]}
                      value={value}
                      onChange={(val) => {
                        onChange(val);
                        setInvoiceType(val);
                      }}
                      placeholder="Select Type"
                      error={errors.invoiceType}
                      icon={FileText}
                    />
                  )}
                />

                <Controller
                  name="financialYear"
                  control={control}
                  rules={{ required: "Financial Year is required" }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Financial Year"
                      options={getFinancialYearOptions()}
                      value={value}
                      onChange={onChange}
                      placeholder="Select Financial Year"
                      error={errors.financialYear}
                      icon={CalendarDays}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-1">
                <Controller
                  name="taxable"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Taxable"
                      options={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ]}
                      value={value}
                      onChange={(val) => {
                        onChange(val);
                        setTaxable(val);
                      }}
                      placeholder="Taxable?"
                      error={errors.taxable}
                      icon={CheckCircle}
                    />
                  )}
                />

                {taxable === "yes" && (
                  <Controller
                    name="taxRate"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SearchableSelect
                        label="Tax Rate"
                        options={taxes.map((tax) => ({
                          value: tax.percentage,
                          label: `${tax.name} ${tax.percentage}%`,
                        }))}
                        value={selectedTaxRate}
                        onChange={(val) => {
                          onChange(val);
                          setSelectedTaxRate(val);
                        }}
                        placeholder="Select Rate"
                        icon={faPercentage}
                      />
                    )}
                  />
                )}
              </div>

              <Controller
                name="branchAddress"
                control={control}
                rules={{ required: "Branch is required" }}
                render={({ field: { value, onChange } }) => (
                  <SearchableSelect
                    label="Branch"
                    options={branches.map((b) => ({
                      value: b.id,
                      label: b.branch_name,
                    }))}
                    value={value}
                    onChange={onChange}
                    placeholder="Select Branch"
                    error={errors.branchAddress}
                    icon={Building2}
                  />
                )}
              />

              <Controller
                name="clientName"
                control={control}
                rules={{ required: "Client is required" }}
                render={({ field: { value, onChange } }) => (
                  <SearchableSelect
                    label="Client"
                    options={activeClients.map((c) => ({
                      value: c.id,
                      label: c.client_name,
                    }))}
                    value={value}
                    onChange={onChange}
                    placeholder="Select Client"
                    error={errors.clientName}
                    icon={User}
                  />
                )}
              />

              <CustomInput
                label="Invoice Date"
                name="invoiceDate"
                type="date"
                register={register}
                rules={{ required: "Date is required" }}
                error={errors.invoiceDate}
                icon={Calendar}
              />

              <CustomInput
                label="Due Date"
                name="dueDate"
                type="date"
                register={register}
                rules={{ required: "Due Date is required" }}
                error={errors.dueDate}
                icon={Calendar}
              />

              <Controller
                name="bankAccount"
                control={control}
                rules={{ required: "Bank Account is required" }}
                render={({ field: { value, onChange } }) => (
                  <SearchableSelect
                    label="Bank Account"
                    options={bankAccounts.map((a) => ({
                      value: a.id,
                      label: `${a.bank_name} - ${a.account_holder_name} - ${a.account_number}`,
                    }))}
                    value={value}
                    onChange={onChange}
                    placeholder="Select Bank Account"
                    error={errors.bankAccount}
                    icon={faCreditCard}
                  />
                )}
              />

              <Controller
                name="currencyType"
                control={control}
                rules={{ required: "Currency is required" }}
                render={({ field: { value, onChange } }) => (
                  <SearchableSelect
                    label="Currency"
                    options={currencies.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    value={value}
                    onChange={onChange}
                    placeholder="Select Currency"
                    error={errors.currencyType}
                    icon={faCoins}
                    displaySelectedValue={true}
                  />
                )}
              />

              <div className="col-span-1 md:col-span-2">
                <Controller
                  name="paymentTerms"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Mode of Payment"
                      options={["Credit", "Debit", "UPI", "Net Banking"].map((t) => ({ value: t, label: t }))}
                      value={value}
                      onChange={onChange}
                      placeholder="Select Mode of Payment"
                      icon={Clock}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Items Section */}
          {invoiceType && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Disc className="w-5 h-5" /> Invoice Items
              </h3>

              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-2 mb-2 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">Item Details</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Cost</div>
                  <div className="col-span-2">Tax</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="col-span-12 md:col-span-4">
                      <SearchableSelect
                        placeholder="Select Item"
                        options={(invoiceType === "product" ? products : services).map((prod) => ({
                          value: prod.name,
                          label: prod.name,
                        }))}
                        value={item.itemName}
                        onChange={(val) => updateItem(index, "itemName", val)}
                        icon={invoiceType === "product" ? Disc : FileText}
                      />
                      {/* Description list */}
                      <div className="mt-2 space-y-1.5">
                        {(item.descriptions || [""]).map((desc, descIdx) => (
                          <div key={descIdx} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400 w-5 shrink-0">›</span>
                            <input
                              type="text"
                              value={desc}
                              onChange={(e) => updateDescription(index, descIdx, e.target.value)}
                              placeholder={`Description ${descIdx + 1}`}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder-gray-400"
                            />
                            {(item.descriptions || [""]).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDescription(index, descIdx)}
                                className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDescription(index)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-black transition-colors mt-1 pl-6"
                        >
                          <Plus className="w-3 h-3" /> Add Description
                        </button>
                      </div>
                    </div>



                    <div className="col-span-6 md:col-span-2">
                      <CustomInput
                        name={`qty-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <CustomInput
                        name={`cost-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) =>
                          invoiceType === "service" &&
                          updateItem(index, "unitCost", parseFloat(e.target.value) || 0)
                        }
                        readOnly={invoiceType === "product" && item.itemName !== ""}
                        placeholder="Cost"
                        className={invoiceType === "product" ? "opacity-75" : ""}
                      />
                    </div>

                    <div className="col-span-6 md:col-span-2 relative">
                      <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-700">
                        {item.itemGst}
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2 flex items-center justify-between">
                      <div className="font-bold text-gray-900 ml-auto">
                        {item.total}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  className="w-full py-4 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-gray-500 hover:text-black font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Another Item</span>
                </button>
              </div>
            </div>
          )}

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full space-y-4">
              {/* Grid 1: Subtotal, Tax, Discount, Amount Paid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Subtotal</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faCoins} className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-gray-900 text-right">
                      {watch("subtotal") || "0.00"} {selectedCurrency}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Total Tax</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faCoins} className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-gray-900 text-right">
                      {watch("totalTax") || "0.00"} {selectedCurrency}
                    </div>
                  </div>
                </div>

                <CustomInput
                  label="Discount"
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  register={register}
                  onChange={(e) => {
                    setValue("discount", e.target.value);
                    calculateTotals();
                  }}
                  icon={faCoins}
                />

                <CustomInput
                  label="Amount Paid"
                  name="amountPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  register={register}
                  onChange={(e) => {
                    setValue("amountPaid", e.target.value);
                    calculateTotals();
                  }}
                  icon={faCoins}
                />
              </div>

              {/* Grid 2: Total Due (Full Width) */}
              <div className="grid grid-cols-1">
                <div className="w-full bg-black rounded-2xl p-4 text-white flex justify-between items-center shadow-lg shadow-black/10">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCoins} className="h-5 w-5 text-white/50" />
                    <span className="text-sm font-bold uppercase tracking-widest">Total Due</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {watch("totalDue") || "0.00"} {selectedCurrency}
                    </div>
                    <div className="text-[10px] text-white/70">
                      Rounded: {roundedTotalDue} {selectedCurrency} ({roundingDisplay})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-8 py-4 rounded-2xl font-semibold text-sm bg-gray-50 text-gray-800 border border-gray-300 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-8 py-4 rounded-2xl font-semibold text-sm bg-black text-white shadow-lg shadow-black/10 hover:shadow-black/20 transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Invoice</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Invoice Updated"
        message="Invoice updated successfully!"
        type="success"
        showButtons={false}
      />
    </div >
  );
};

export default EditInvoice;