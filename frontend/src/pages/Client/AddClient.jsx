import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { Country } from "country-state-city";
import { User, MapPin, Phone, Globe, CreditCard, FileText, Activity, Save, Building2 } from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";

const AddClient = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      phone_code: "+91",
      status: "true",
      taxType: "",
      invoiceSeries: "",
    },
  });

  const selectedTaxType = watch("taxType");

  const phoneCodeOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      value: `+${country.phonecode}`,
      label: `+${country.phonecode} (${country.name})`,
    }));
  }, []);

  const onSubmit = async (data) => {
    // Clean website URL
    let website = data.website || "";
    website = website.replace(/^https?:\/\//i, "").replace(/^www\./i, "www.");

    try {
      const payload = {
        client_name: data.clientName,
        address: data.address,
        phone: data.phone,
        phone_code: data.phone_code,
        tax_type: data.taxType,
        website: website,
        invoice_series: data.invoiceSeries,
        status: data.status === "true",
        gstin: data.gstin,
      };
      if (data.taxType === "gst") payload.gst = data.gst;
      if (data.taxType === "vat") payload.vat = data.vat;

      await apiClient.post("clients/clients/", payload);
      navigate("/clients/view");
    } catch (error) {
      alert("Failed to add client. Please try again.");
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="p-4 w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-black rounded-2xl shadow-lg shadow-black/10">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Client</h1>
          <p className="text-sm text-gray-800 font-medium">Create a new client profile</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-300 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Basic Info Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Client Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("clientName", { required: "Client Name is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="Enter client name"
                  />
                </div>
                {errors.clientName && <p className="text-red-500 text-xs px-1">{errors.clientName.message}</p>}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("website")}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="www.example.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Address</label>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 flex items-start pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    {...register("address", { required: "Address is required" })}
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400 resize-none"
                    placeholder="Enter full address"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs px-1">{errors.address.message}</p>}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5" /> Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phone Code */}
              <div className="space-y-2">
                <Controller
                  name="phone_code"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Country Code"
                      value={value}
                      onChange={onChange}
                      options={phoneCodeOptions}
                      placeholder="+91"
                      displaySelectedValue={true}
                    />
                  )}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Phone Number</label>
                <input
                  {...register("phone", { required: "Phone number is required" })}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-xs px-1">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Tax & Invoice Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Tax & Invoice Config
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tax Type */}
              <div className="space-y-2">
                <Controller
                  name="taxType"
                  control={control}
                  rules={{ required: "Tax Type is required" }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Tax Type"
                      value={value}
                      onChange={onChange}
                      options={[
                        { label: "Select Tax Type", value: "" },
                        { label: "GST", value: "gst" },
                        { label: "VAT", value: "vat" },
                        { label: "None", value: "nil" },
                      ]}
                      placeholder="Select Tax Type"
                      icon={Activity}
                    />
                  )}
                />
                {errors.taxType && <p className="text-red-500 text-xs px-1">{errors.taxType.message}</p>}
              </div>

              {/* Conditional Tax Number */}
              {selectedTaxType === "gst" && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">GST Number</label>
                  <input
                    {...register("gst", { required: "GST Number is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="Enter GST Number"
                  />
                  {errors.gst && <p className="text-red-500 text-xs px-1">{errors.gst.message}</p>}
                </div>
              )}

              {selectedTaxType === "vat" && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">VAT Number</label>
                  <input
                    {...register("vat", { required: "VAT Number is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="Enter VAT Number"
                  />
                  {errors.vat && <p className="text-red-500 text-xs px-1">{errors.vat.message}</p>}
                </div>
              )}

              {/* GSTIN */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">GSTIN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("gstin")}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="Enter GSTIN (Optional)"
                  />
                </div>
              </div>

              {/* Invoice Series */}
              <div className="space-y-2">
                <Controller
                  name="invoiceSeries"
                  control={control}
                  rules={{ required: "Invoice Series is required" }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Invoice Category"
                      value={value}
                      onChange={onChange}
                      options={[
                        { label: "Select Invoice Series", value: "" },
                        { label: "Non-SEZ (Domestic)", value: "domestic" },
                        { label: "SEZ (International)", value: "international" },
                      ]}
                      placeholder="Select Invoice Series"
                    />
                  )}
                />
                {errors.invoiceSeries && <p className="text-red-500 text-xs px-1">{errors.invoiceSeries.message}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Status"
                      value={value}
                      onChange={onChange}
                      options={[
                        { label: "Active", value: "true" },
                        { label: "Inactive", value: "false" },
                      ]}
                      placeholder="Status"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/clients/view")}
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
                  <span>Create Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClient;
