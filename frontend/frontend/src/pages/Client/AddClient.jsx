import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";

const AddClient = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      country: "",
      state: "",
      city: "",
    },
  });

  const [selectedTaxType, setSelectedTaxType] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [apiError, setApiError] = useState("");

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      setApiError("");
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries");
        const data = await response.json();
        if (data.error) throw new Error(data.msg || "Failed to fetch countries");
        setCountries(
          data.data.map((country) => ({
            value: country.country,
            label: country.country,
          }))
        );
      } catch (error) {
        setApiError(error.message);
        console.error("Error fetching countries:", error);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) {
        setStates([]);
        return;
      }
      setLoadingStates(true);
      setApiError("");
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.msg || "Failed to fetch states");
        setStates(
          data.data.states.map((state) => ({
            value: state.name,
            label: state.name,
          }))
        );
      } catch (error) {
        setApiError(error.message);
        console.error("Error fetching states:", error);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry || !selectedState) {
        setCities([]);
        return;
      }
      setLoadingCities(true);
      setApiError("");
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry, state: selectedState }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.msg || "Failed to fetch cities");
        setCities(
          data.data.map((city) => ({
            value: city,
            label: city,
          }))
        );
      } catch (error) {
        setApiError(error.message);
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedCountry, selectedState]);

  const handleTaxTypeChange = (event) => {
    setSelectedTaxType(event.target.value);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        client_name: data.clientName,
        country: data.country,
        state: data.state,
        city: data.city,
        address: data.address,
        phone: data.phone,
        tax_type: data.taxType,
        website: data.website,
        invoice_series: data.invoiceSeries,
        status: data.status === "true",
      };
      if (data.taxType === "gst") payload.gst = data.gst;
      if (data.taxType === "vat") payload.vat = data.vat;

      await apiClient.post("clients/clients/", payload);
      alert("Client added successfully!");
      navigate("/clients/view");
    } catch (error) {
      alert("Failed to add client. Please try again.");
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Add Client</h2>
        {apiError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">{apiError}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <FormField
            label="Client Name"
            placeholder="Enter client name..."
            name="clientName"
            register={register}
            type="text"
            error={errors.clientName}
            required
          />
          <FormField
            label="Country"
            name="country"
            register={register}
            type="select"
            options={countries}
            placeholder={loadingCountries ? "Loading countries..." : "Select Country"}
            error={errors.country}
            required
            isSearchable={true}
            readOnly={loadingCountries}
          />
          <FormField
            label="State"
            name="state"
            register={register}
            type="select"
            options={states}
            placeholder={loadingStates ? "Loading states..." : "Select State"}
            error={errors.state}
            required
            isSearchable={true}
            readOnly={loadingStates}
          />
          <FormField
            label="City"
            name="city"
            register={register}
            type="select"
            options={cities}
            placeholder={loadingCities ? "Loading cities..." : "Select City"}
            error={errors.city}
            required
            isSearchable={true}
            readOnly={loadingCities}
          />
          <FormField
            label="Address"
            placeholder="Enter address..."
            name="address"
            register={register}
            error={errors.address}
            required
          />
          <FormField
            label="Phone"
            placeholder="Enter phone number..."
            name="phone"
            register={register}
            type="text"
            error={errors.phone}
            required
          />
          <FormField
            label="Tax Type"
            name="taxType"
            register={register}
            error={errors.taxType}
            type="select"
            onChange={handleTaxTypeChange}
            options={[
              { value: "", label: "Select Tax Type" },
              { value: "gst", label: "GST" },
              { value: "vat", label: "VAT" },
              { value: "none", label: "None" },
            ]}
            required
          />
          {selectedTaxType === "gst" && (
            <FormField
              label="GST Number"
              placeholder="Enter GST number..."
              name="gst"
              register={register}
              error={errors.gst}
              type="text"
              required
            />
          )}
          {selectedTaxType === "vat" && (
            <FormField
              label="VAT Number"
              placeholder="Enter VAT number..."
              name="vat"
              register={register}
              error={errors.vat}
              type="text"
              required
            />
          )}
          <FormField
            label="Website"
            placeholder="Enter website URL..."
            name="website"
            register={register}
            type="url"
            error={errors.website}
          />
          <FormField
            label="Invoice Series"
            name="invoiceSeries"
            register={register}
            error={errors.invoiceSeries}
            type="select"
            options={[
              { value: "", label: "Select Invoice Series" },
              { value: "domestic", label: "Domestic" },
              { value: "international", label: "International" },
            ]}
            required
          />
          <FormField
            label="Status"
            name="status"
            register={register}
            error={errors.status}
            type="select"
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            required
          />
          <div className="col-span-2 flex justify-center">
            <button
              type="submit"
              className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-md border border-gray-900 transition hover:bg-white hover:text-gray-900"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClient;