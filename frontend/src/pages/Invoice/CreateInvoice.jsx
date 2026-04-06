import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import SearchableSelect from "../../components/SearchableSelect";
import ConfirmationModal from "../../components/ConfirmationModal";
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
  Trash2,
  ArrowLeft,
  Save,
  Hash,
  CheckCircle,
  Disc,
  X,
  CalendarDays
} from "lucide-react";

// Custom Input Component to match AddBankAccount styles
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
            <Icon className="h-5 w-5 text-gray-400" />
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

const CreateInvoice = () => {
  const navigate = useNavigate();

  // Calculate current financial year based on date
  const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-12
    // Financial year in India: April 1 to March 31
    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  // Generate financial year options (current year +/- 5 years)
  const getFinancialYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push({ value: `${i}-${i + 1}`, label: `${i}-${i + 1}` });
    }
    return years.reverse();
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString().split("T")[0],
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
  const [invoiceItems, setInvoiceItems] = useState([
    { itemName: "", quantity: 1, unitCost: 0, itemGst: "0%", total: 0, item_type: "" },
  ]);
  const [taxable, setTaxable] = useState("no");
  const [selectedTaxRate, setSelectedTaxRate] = useState("0%");
  const [invoiceType, setInvoiceType] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        console.error("Error initializing data:", error);
        if (currencies.length === 0) {
          setCurrencies(["USD", "EUR", "GBP", "INR"]);
        }
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { itemName: "", quantity: 1, unitCost: 0, itemGst: "0%", total: 0, item_type: invoiceType },
    ]);
  };

  const removeItem = (index) => {
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
      (sum, item) => sum + (item.quantity * item.unitCost),
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

  const onSubmit = async (data) => {
    if (invoiceItems.length === 0 || invoiceItems.some((item) => !item.itemName)) {
      alert("Please add at least one item with a valid name.");
      return;
    }

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
        items: [],
      };

      const invoiceResponse = await apiClient.post("invoices/invoices/", invoiceData);
      const invoiceId = invoiceResponse.data.id;

      const itemPromises = invoiceItems.map(async (item) => {
        const itemData = {
          invoice: invoiceId,
          item_type: item.item_type || data.invoiceType,
          product:
            data.invoiceType === "product"
              ? products.find((p) => p.name === item.itemName)?.id || null
              : null,
          name:
            data.invoiceType === "service"
              ? item.itemName
              : data.invoiceType === "product"
                ? null
                : item.itemName,
          quantity: item.quantity,
          unit_cost: item.unitCost.toString(),
        };
        return apiClient.post("invoices/invoice-items/", itemData);
      });

      await Promise.all(itemPromises);
      await Promise.all(itemPromises);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting invoice or items:", error.response?.data || error.message);
      alert("Failed to create invoice or items.");
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/invoice/proforma");
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
            <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
            <p className="text-sm text-gray-800 font-medium">Create and manage your invoices</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button type="button" onClick={() => navigate("/address/add")} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors whitespace-nowrap shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Branch
          </button>
          <button type="button" onClick={() => navigate("/clients/add")} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors whitespace-nowrap shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Client
          </button>
          <button type="button" onClick={() => navigate("/bank-account/add")} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors whitespace-nowrap shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Bank
          </button>
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
                        icon={Percent}
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
                className="md:col-start-2"
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
                    icon={CreditCard}
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
                    icon={DollarSign}
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
                      label="Payment Terms"
                      options={["Credit", "Debit", "UPI", "Net Banking"].map((t) => ({ value: t, label: t }))}
                      value={value}
                      onChange={onChange}
                      placeholder="Select Terms"
                      icon={Clock}
                    />
                  )}
                />
              </div>

              <div className="md:hidden"></div>
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
                {/* Header Row (Hidden on mobile) */}
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
                  <div className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-900 text-right">
                    {watch("subtotal") || "0.00"} {selectedCurrency}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Total Tax</span>
                  <div className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-900 text-right">
                    {watch("totalTax") || "0.00"} {selectedCurrency}
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
                  icon={Percent}
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
                  icon={DollarSign}
                />
              </div>

              {/* Grid 2: Total Due (Full Width) */}
              <div className="grid grid-cols-1">
                <div className="w-full bg-black rounded-2xl p-4 text-white flex justify-between items-center shadow-lg shadow-black/10">
                  <span className="text-sm font-bold uppercase tracking-widest">Total Due</span>
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
                  <span>Create Invoice</span>
                </>
              )}
            </button>
          </div>

        </form >
      </div >

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Invoice Created"
        message="Invoice and items created successfully!"
        type="success"
        showButtons={false}
      />
    </div >
  );
};

export default CreateInvoice;