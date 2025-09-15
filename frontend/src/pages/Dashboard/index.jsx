import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import CountCard from "../../components/UIComponents/CountCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [bankAccountCount, setBankAccountCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [taxCount, setTaxCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const invoiceResponse = await apiClient.get("invoices/invoices/");
        setInvoiceCount(invoiceResponse.data.length);

        const productResponse = await apiClient.get("products/products/");
        setProductCount(productResponse.data.length);

        const serviceResponse = await apiClient.get("services/services/");
        setServiceCount(serviceResponse.data.length);

        const bankAccountResponse = await apiClient.get("bank/bank-accounts/");
        setBankAccountCount(bankAccountResponse.data.length);

        const addressResponse = await apiClient.get("branch/branch_addresses/");
        setAddressCount(addressResponse.data.length);

        const clientResponse = await apiClient.get("clients/clients/");
        setClientCount(clientResponse.data.length);

        const taxResponse = await apiClient.get("invoices/taxes/");
        setTaxCount(taxResponse.data.length);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  const handleCardClick = (title) => {
    console.log("Clicked card:", title); // Debug log
    switch (title.toLowerCase()) {
      case "products":
        navigate("/products/view");
        break;
      case "services":
        navigate("/services/view");
        break;
      case "bank accounts":
        navigate("/bank-account/view");
        break;
      case "clients":
        navigate("/clients/view");
        break;
      case "addresses":
        navigate("/address/view");
        break;
      case "taxes":
        navigate("/tax/view");
        break;
      case "invoices":
        navigate("invoice/proforma");
        break;
      default:
        console.log("No navigation defined for:", title);
        break;
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <CountCard
          title="Invoices"
          subtitle="Total number of invoices"
          count={invoiceCount}
          onClick={() => handleCardClick("invoices")}
        />
        <CountCard
          title="Products"
          subtitle="Total number of products"
          count={productCount}
          onClick={() => handleCardClick("products")}
        />
        <CountCard
          title="Services"
          subtitle="Total number of services"
          count={serviceCount}
          onClick={() => handleCardClick("services")}
        />
        <CountCard
          title="Bank Accounts"
          subtitle="Total number of bank accounts"
          count={bankAccountCount}
          onClick={() => handleCardClick("bank accounts")}
        />
        <CountCard
          title="Addresses"
          subtitle="Total number of branch addresses"
          count={addressCount}
          onClick={() => handleCardClick("addresses")}
        />
        <CountCard
          title="Clients"
          subtitle="Total number of clients"
          count={clientCount}
          onClick={() => handleCardClick("clients")}
        />
        <CountCard
          title="Taxes"
          subtitle="Total number of taxes"
          count={taxCount}
          onClick={() => handleCardClick("taxes")}
        />
      </div>
    </div>
  );
};

export default Dashboard;