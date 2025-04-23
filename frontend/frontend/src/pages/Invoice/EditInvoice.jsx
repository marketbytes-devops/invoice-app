import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";

const EditInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: invoice
      ? {
          invoiceNumber: invoice.invoice_number,
          invoiceType: invoice.invoice_type,
          clientName: invoice.client.toString(),
          branchAddress: invoice.branch_address.toString(),
          bankAccount: invoice.bank_account.toString(),
          invoiceDate: invoice.invoice_date,
          dueDate: invoice.due_date,
          currencyType: invoice.currency_type,
          paymentTerms: invoice.payment_terms,
          taxable: invoice.tax_option,
          taxRate: invoice.tax_rate ? invoice.tax_rate.toString() : "",
          discount: parseFloat(invoice.discount || "0.00"),
          shipping: parseFloat(invoice.shipping || "0.00"),
          amountPaid: parseFloat(invoice.amount_paid || "0.00"),
        }
      : {
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
  const [invoiceItems, setInvoiceItems] = useState(
    invoice?.items?.map((item) => {
      console.log("Mapping invoice item:", item); 
      return {
        id: item.id, 
        itemName: item.name || "",
        quantity: item.quantity,
        unitCost: parseFloat(item.unit_cost),
        itemGst: item.total_gst ? item.total_gst.toString() : "0",
        total: item.total ? item.total.toString() : "0",
        item_type: item.item_type,
      };
    }) || [
      { itemName: "", quantity: 1, unitCost: 0, itemGst: "0%", total: 0, item_type: "" },
    ]
  );
  const [taxable, setTaxable] = useState(invoice?.tax_option || "no");
  const [selectedTaxRate, setSelectedTaxRate] = useState(
    invoice?.tax_rate ? invoice.tax_rate.toString() : "0%"
  );
  const [invoiceType, setInvoiceType] = useState(invoice?.invoice_type || "");

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
        ] = await Promise.all([
          apiClient.get("clients/clients/"),
          apiClient.get("branch/branch_addresses/"),
          apiClient.get("bank/bank-accounts/"),
          apiClient.get("invoices/taxes/"),
          apiClient.get("products/products/"),
          apiClient.get("services/services/"),
        ]);
        setClients(clientsResponse.data);
        setBranches(branchesResponse.data);
        setBankAccounts(bankAccountsResponse.data);
        setTaxes(taxesResponse.data);
        setProducts(productsResponse.data);
        setServices(servicesResponse.data);
        console.log("Data loaded successfully");
      } catch (error) {
        console.error("Error initializing data", error);
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
      { itemName: "", quantity: 1, unitCost: 0, itemGst: "0%", total: 0, item_type: invoiceType },
    ]);
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
        is_final: invoice.is_final || false, // Preserve existing is_final status
      };
  
      console.log("Updated Invoice Data:", JSON.stringify(invoiceData, null, 2));
      const invoiceResponse = await apiClient.put(`invoices/invoices/${invoice.id}/`, invoiceData);
      console.log("Invoice Updated:", invoiceResponse.data);
  
      // Handle invoice items
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
        };
  
        if (item.id) {
          await apiClient.put(`invoices/invoice-items/${item.id}/`, itemData);
          console.log(`Updated item ${item.id}`);
        } else {
          const itemResponse = await apiClient.post("invoices/invoice-items/", itemData);
          console.log(`Created new item ${itemResponse.data.id}`);
        }
      }
  
      // Fetch the updated invoice to reflect the new final_invoice_number if is_final is true
      const updatedInvoiceResponse = await apiClient.get(`invoices/invoices/${invoice.id}/`);
      console.log("Updated Invoice with Final Number:", updatedInvoiceResponse.data);
  
      alert("Invoice updated successfully!");
      navigate("/invoice/proforma", { state: { invoice: updatedInvoiceResponse.data } });
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

  return (
    <div className="grid min-h-screen p-4">
    <h2 className="text-xl font-extrabold mb-4 text-gray-800">
      Edit Invoice: {invoice?.invoice_number}
      </h2>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-6xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <FormField
              label="Invoice Type*"
              name="invoice_type"
              register={register}
              type="select"
              options={[
                { value: "", label: "Select invoice type" },
                { value: "product", label: "Product" },
                { value: "service", label: "Service" },
              ]}
              value={invoiceType}
              onChange={(e) => {
                setInvoiceType(e.target.value);
                setValue("invoiceType", e.target.value);
              }}
              required
            />
            <FormField
              label="Taxable*"
              name="taxable"
              register={register}
              type="radio"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={taxable}
              onChange={(e) => {
                setTaxable(e.target.value);
                setValue("taxable", e.target.value);
              }}
              required
            />
            {taxable === "yes" && (
              <FormField
                label="Tax Rate"
                name="taxRate"
                register={register}
                type="select"
                options={[
                  { value: "", label: "Select tax rate" },
                  ...taxes.map((tax) => ({
                    value: tax.percentage.toString(),
                    label: `${tax.name} ${tax.percentage}%`,
                  })),
                ]}
                value={selectedTaxRate}
                onChange={(e) => {
                  setSelectedTaxRate(e.target.value);
                  setValue("taxRate", e.target.value);
                }}
              />
            )}
            <FormField
              label="Branch*"
              name="branchAddress"
              type="select"
              options={[
                { value: "", label: "Select branch" },
                ...branches.map((b) => ({
                  value: b.id.toString(),
                  label: `${b.branch_address} - ${b.city}`,
                })),
              ]}
              register={register}
              value={watch("branchAddress")}
              onChange={(e) => setValue("branchAddress", e.target.value)}
              required
            />
            <FormField
              label="Client*"
              name="clientName"
              type="select"
              options={[
                { value: "", label: "Select client" },
                ...clients.map((c) => ({
                  value: c.id.toString(),
                  label: c.client_name,
                })),
              ]}
              register={register}
              value={watch("clientName")}
              onChange={(e) => setValue("clientName", e.target.value)}
              required
            />
            <div className="flex items-center justify-between gap-4">
              <FormField
                label="Invoice Date*"
                name="invoiceDate"
                type="date"
                register={register}
                value={watch("invoiceDate")}
                onChange={(date) => setValue("invoiceDate", date)}
                error={errors.invoiceDate}
                required
              />
              <FormField
                label="Due Date*"
                name="dueDate"
                type="date"
                register={register}
                value={watch("dueDate")}
                onChange={(date) => setValue("dueDate", date)}
                error={errors.dueDate}
                required
              />
            </div>
            <FormField
              label="Bank Account*"
              name="bankAccount"
              type="select"
              options={[
                { value: "", label: "Select bank account" },
                ...bankAccounts.map((a) => ({
                  value: a.id.toString(),
                  label: `${a.bank_name} (${a.account_number})`,
                })),
              ]}
              register={register}
              value={watch("bankAccount")}
              onChange={(e) => setValue("bankAccount", e.target.value)}
              required
            />
            <FormField
              label="Currency Type"
              name="currencyType"
              type="select"
              options={[
                { value: "", label: "Select currency" },
                ...["USD", "EUR", "GBP", "INR"].map((c) => ({ value: c, label: c })),
              ]}
              register={register}
              value={watch("currencyType")}
              onChange={(e) => setValue("currencyType", e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <FormField
              label="Payment Terms"
              name="paymentTerms"
              type="select"
              options={[
                { value: "", label: "Select payment terms" },
                ...["Credit", "Debit", "UPI", "Net Banking"].map((t) => ({ value: t, label: t })),
              ]}
              register={register}
              value={watch("paymentTerms")}
              onChange={(e) => setValue("paymentTerms", e.target.value)}
            />
            {invoiceType && (
              <div>
                <h3 className="font-bold text-sm mb-2 text-gray-700">Invoice Items</h3>
Karen
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
                        value={item.itemName}
                        onChange={(e) => updateItem(index, "itemName", e.target.value)}
                        className="col-span-3"
                      />
                      <input
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      />
                      <input
                        className={`w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2 ${
                          invoiceType === "product" && item.itemName ? "bg-gray-200 cursor-not-allowed" : ""
                        }`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) =>
                          invoiceType === "service" && updateItem(index, "unitCost", parseFloat(e.target.value) || 0)
                        }
                        readOnly={invoiceType === "product" && item.itemName !== ""}
                      />
                      <input
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigfocus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2"
                        type="text"
                        value={item.itemGst}
                        readOnly
                      />
                      <input
                        className="w-full p-2 border rounded bg-gray-100 text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2"
                        type="number"
                        value={item.total}
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
                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
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
                <span className="text-sm text-gray-800">{watch("subtotal") || "0.00"} {selectedCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Total GST:</span>
                <span className="text-sm text-gray-800">{watch("totalTax") || "0.00"} {selectedCurrency}</span>
              </div>
              <FormField
                label="Shipping"
                name="shipping"
                type="number"
                register={register}
                value={watch("shipping")}
                onChange={(e) => setValue("shipping", e.target.value)}
                min="0"
                step="0.01"
              />
              <FormField
                label="Discount"
                name="discount"
                type="number"
                register={register}
                value={watch("discount")}
                onChange={(e) => setValue("discount", e.target.value)}
                min="0"
                step="0.01"
              />
              <FormField
                label="Amount Paid"
                name="amountPaid"
                type="number"
                register={register}
                value={watch("amountPaid")}
                onChange={(e) => setValue("amountPaid", e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-bold text-gray-700">Total Due:</span>
                <span className="text-sm font-bold text-gray-800">
                  {watch("totalDue") || "0.00"} {selectedCurrency} (Rounded: {roundedTotalDue} {selectedCurrency} {roundingDisplay})
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
            {isSubmitting ? "Updating..." : "Update Invoice"}
          </button>
        </form>
        <div className="mt-4 flex justify-start space-x-4"></div>
      </div>
    </div>
  );
};

export default EditInvoice;