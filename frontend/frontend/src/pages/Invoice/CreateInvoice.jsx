import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";

const CreateInvoice = () => {
  const navigate = useNavigate();
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
      taxable: "no",
      currencyType: "USD",
      paymentTerms: "Net 30",
      discount: 0,
      shipping: 0,
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

        console.log("Raw clients from API:", rawClients);

        if (currenciesResponse.ok) {
          const currenciesData = await currenciesResponse.json();
          if (currenciesData.result === "success") {
            const currencyList = Object.keys(currenciesData.rates);
            setCurrencies(currencyList);
            console.log("Currencies fetched successfully:", currencyList);
          } else {
            console.error("API returned error:", currenciesData.error);
            setCurrencies(["USD", "EUR", "GBP", "INR"]);
          }
        } else {
          console.warn("Currency fetch failed, using fallback currencies");
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
    const shipping = parseFloat(watch("shipping")) || 0;
    const discount = parseFloat(watch("discount")) || 0;
    const amountPaid = parseFloat(watch("amountPaid")) || 0;
    const totalDue = subtotal + totalTax + shipping - discount - amountPaid;

    setValue("subtotal", subtotal.toFixed(2));
    setValue("totalTax", totalTax.toFixed(2));
    setValue("totalDue", totalDue.toFixed(2));

    return { subtotal, totalTax, shipping, discount, amountPaid, totalDue };
  };

  useEffect(() => {
    calculateTotals();
  }, [invoiceItems, watch("shipping"), watch("discount"), watch("amountPaid"), selectedTaxRate]);

  const onSubmit = async (data) => {
    if (invoiceItems.length === 0 || invoiceItems.some((item) => !item.itemName)) {
      alert("Please add at least one item with a valid name.");
      return;
    }

    try {
      const invoiceData = {
        invoice_type: data.invoiceType,
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
        shipping: parseFloat(data.shipping).toString() || "0.00",
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
      alert("Invoice and items created successfully!");
      navigate("/invoice/proforma");
    } catch (error) {
      console.error("Error submitting invoice or items:", error.response?.data || error.message);
      alert("Failed to create invoice or items.");
    }
  };

  const selectedCurrency = watch("currencyType");
  const totalDue = parseFloat(watch("totalDue") || 0);
  const roundedTotalDue = Math.round(totalDue);
  const roundingDifference = (roundedTotalDue - totalDue).toFixed(2);
  const roundingDisplay = roundingDifference >= 0 ? `+${roundingDifference}` : roundingDifference;

  // Filter active clients explicitly
  const activeClients = clients.filter((c) => {
    const isInactive = c.status === "inactive" || c.status === false;
    return !isInactive;
  });

  console.log("Clients passed to dropdown:", activeClients);

  return (
    <div className="grid min-h-screen p-4">
      <h2 className="text-xl font-extrabold mb-4 text-gray-800">Create New Invoice</h2>
      <div className="bg-gray-50 p-8 rounded-lg shadow-xl w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <FormField
              label="Invoice Type"
              name="invoiceType"
              register={register}
              type="select"
              options={[
                { value: "", label: "Select Invoice Type" },
                { value: "product", label: "Product" },
                { value: "service", label: "Service" },
              ]}
              onChange={(e) => setInvoiceType(e.target.value)}
              placeholder="Select invoice type"
              required
            />
            <FormField
              label="Taxable"
              name="taxable"
              register={register}
              type="radio"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              onChange={(e) => setTaxable(e.target.value)}
              required
            />
            {taxable === "yes" && (
              <FormField
                label="Tax Rate"
                name="taxRate"
                register={register}
                type="select"
                options={[
                  { value: "", label: "Select Tax Rate" },
                  ...taxes.map((tax) => ({
                    value: tax.percentage,
                    label: `${tax.name} ${tax.percentage}%`,
                  })),
                ]}
                onChange={(e) => setSelectedTaxRate(e.target.value)}
                placeholder="Select tax rate"
              />
            )}
            <FormField
              label="Branch"
              name="branchAddress"
              type="select"
              options={[
                { value: "", label: "Select Branch" },
                ...branches.map((b) => ({
                  value: b.id,
                  label: `${b.branch_address} - ${b.city}`,
                })),
              ]}
              register={register}
              placeholder="Select branch"
              required
            />
            <FormField
              label="Client"
              name="clientName"
              type="select"
              options={[
                { value: "", label: "Select Client" },
                ...activeClients.map((c) => ({
                  value: c.id,
                  label: `${c.client_name}, ${c.country}, ${c.state}, ${c.city}, ${c.address}, ${c.phone}, ${c.tax_type}, ${c.gst}, ${c.vat}, ${c.website}, ${c.invoice_series}, ${c.status}`,
                })),
              ]}
              register={register}
              placeholder="Select client"
              required
            />
            <div className="flex items-center justify-between gap-4">
              <FormField
                label="Invoice Date"
                placeholder="Select invoice date"
                type="date"
                name="invoiceDate"
                register={register}
                error={errors.invoiceDate}
                required
              />
              <FormField
                label="Due Date"
                placeholder="Select due date"
                type="date"
                name="dueDate"
                register={register}
                error={errors.dueDate}
                required
              />
            </div>
            <FormField
              label="Bank Account"
              name="bankAccount"
              type="select"
              options={[
                { value: "", label: "Select Bank Account" },
                ...bankAccounts.map((a) => ({
                  value: a.id,
                  label: `${a.bank_name} (${a.account_number})`,
                })),
              ]}
              register={register}
              placeholder="Select bank account"
              required
            />
            <FormField
              label="Currency Type"
              name="currencyType"
              register={register}
              type="select"
              options={[
                { value: "", label: "Select Currency" },
                ...currencies.map((currency) => ({
                  value: currency,
                  label: currency,
                })),
              ]}
              placeholder="Search or select currency"
              required
              isSearchable={true} // Enable search only for this field
            />
          </div>

          <div className="space-y-4">
            <FormField
              label="Payment Terms"
              name="paymentTerms"
              type="select"
              options={[
                { value: "", label: "Select Payment Terms" },
                ...["Credit", "Debit", "UPI", "Net Banking"].map((t) => ({ value: t, label: t })),
              ]}
              register={register}
              placeholder="Select payment terms"
            />
            {invoiceType && (
              <div>
                <h3 className="font-bold text-sm mb-2 text-gray-700">Invoice Items</h3>
                <div className="rounded-lg">
                  <div className="grid grid-cols-12 gap-2 mb-2 font-semibold text-gray-700 text-sm">
                    <div className="col-span-3">Item Name</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit Cost</div>
                    <div className="col-span-2">Item Tax</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-4 items-center">
                      <FormField
                        name={`itemName-${index}`}
                        type="select"
                        register={register}
                        options={[
                          { value: "", label: "Select Item" },
                          ...(invoiceType === "product" ? products : services).map((prod) => ({
                            value: prod.name,
                            label: `${prod.name}`,
                          })),
                        ]}
                        onChange={(e) => updateItem(index, "itemName", e.target.value)}
                        value={item.itemName}
                        className="col-span-3"
                        required
                      />
                      <input
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2"
                        type="number"
                        min="1"
                        value={item.quantity}
                        placeholder="Enter quantity"
                        onChange={(e) =>
                          updateItem(index, "quantity", parseInt(e.target.value) || 1)
                        }
                      />
                      <input
                        className={`w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2 ${
                          invoiceType === "product" && item.itemName ? "bg-gray-200 cursor-not-allowed" : ""
                        }`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        placeholder="Enter unit cost"
                        onChange={(e) =>
                          invoiceType === "service" &&
                          updateItem(index, "unitCost", parseFloat(e.target.value) || 0)
                        }
                        readOnly={invoiceType === "product" && item.itemName !== ""}
                      />
                      <input
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2"
                        type="text"
                        value={item.itemGst}
                        placeholder="GST"
                        readOnly
                      />
                      <input
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2"
                        type="number"
                        value={item.total}
                        placeholder="Total"
                        readOnly
                      />
                      <button
                        type="button"
                        className="text-red-500 col-span-1 hover:text-red-700"
                        onClick={() => removeItem(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bg-gray-700 text-white px-3 py-3 rounded hover:bg-gray-800 transition-colors"
                    onClick={addItem}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
                <span className="text-sm text-gray-800">
                  {watch("subtotal") || "0.00"} {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Tax:</span>
                <span className="text-sm text-gray-800">
                  {watch("totalTax") || "0.00"} {selectedCurrency}
                </span>
              </div>
              <FormField
                label="Shipping"
                name="shipping"
                type="number"
                register={register}
                placeholder="Enter shipping cost"
                min="0"
                step="0.01"
                onChange={(e) => {
                  setValue("shipping", e.target.value);
                  calculateTotals();
                }}
              />
              <FormField
                label="Discount"
                name="discount"
                type="number"
                register={register}
                placeholder="Enter discount"
                min="0"
                step="0.01"
                onChange={(e) => {
                  setValue("discount", e.target.value);
                  calculateTotals();
                }}
              />
              <FormField
                label="Amount Paid"
                name="amountPaid"
                type="number"
                register={register}
                placeholder="Enter amount paid"
                min="0"
                step="0.01"
                onChange={(e) => {
                  setValue("amountPaid", e.target.value);
                  calculateTotals();
                }}
              />
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-bold text-gray-700">Total Due:</span>
                <span className="text-sm font-bold text-gray-800">
                  {watch("totalDue") || "0.00"} {selectedCurrency} (Rounded: {roundedTotalDue}{" "}
                  {selectedCurrency} {roundingDisplay})
                </span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-black text-white hover:bg-white hover:text-black border text-sm font-bold px-3 py-3 rounded w-full col-span-2 transition-colors duration-300 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Invoice"}
          </button>
        </form>
        <div className="mt-4 w-full flex justify-start space-x-4">
          <button
            type="button"
            onClick={() => navigate("/address/add")}
            className="w-full bg-black hover:bg-white text-white hover:text-black border text-sm font-bold px-3 py-3 rounded transition-colors duration-300"
          >
            Go to Add Branch
          </button>
          <button
            type="button"
            onClick={() => navigate("/clients/add")}
            className="w-full bg-black hover:bg-white text-white hover:text-black border text-sm font-bold px-3 py-3 rounded transition-colors duration-300"
          >
            Go to Add Client
          </button>
          <button
            type="button"
            onClick={() => navigate("/bank-account/add")}
            className="w-full bg-black hover:bg-white text-white hover:text-black border text-sm font-bold px-3 py-3 rounded transition-colors duration-300"
          >
            Go to Add Bank Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;