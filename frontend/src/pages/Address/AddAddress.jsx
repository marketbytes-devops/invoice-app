import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { Country } from "country-state-city";
import { MapPin, Building2, Phone, Globe, FileText, LayoutGrid, Save, ArrowLeft } from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";

const AddAddress = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      phoneCode: "+91",
    }
  });

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
      await apiClient.post("branch/branch_addresses/", {
        branch_name: data.branchName,
        branch_address: data.branchAddress,
        state: data.state,
        city: data.city,
        gstin: data.gstin,
        phone_code: data.phoneCode,
        phone: data.phoneNumber,
        website: website,
      });

      navigate("/address/view");
    } catch (error) {
      alert("Failed to add address. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => navigate('/address/view')}
          className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="p-3 bg-black rounded-2xl shadow-lg shadow-black/10">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add Branch Address</h1>
          <p className="text-sm text-gray-800 font-medium">Register a new branch location</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-300 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Branch Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Branch Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Branch Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("branchName", { required: "Branch Name is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="e.g. Head Office"
                  />
                </div>
                {errors.branchName && <p className="text-red-500 text-xs px-1">{errors.branchName.message}</p>}
              </div>

              {/* GSTIN */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">GSTIN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="Enter GSTIN"
                  />
                </div>
                {errors.gstin && <p className="text-red-500 text-xs px-1">{errors.gstin.message}</p>}
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Full Address</label>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 flex items-start pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    {...register("branchAddress", { required: "Address is required" })}
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400 resize-none"
                    placeholder="Enter complete branch address"
                  />
                </div>
                {errors.branchAddress && <p className="text-red-500 text-xs px-1">{errors.branchAddress.message}</p>}
              </div>

              {/* State & City */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">State</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LayoutGrid className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("state", { required: "State is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="State"
                  />
                </div>
                {errors.state && <p className="text-red-500 text-xs px-1">{errors.state.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LayoutGrid className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("city", { required: "City is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="City"
                  />
                </div>
                {errors.city && <p className="text-red-500 text-xs px-1">{errors.city.message}</p>}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5" /> Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phone Code */}
              <div className="space-y-2">
                <Controller
                  name="phoneCode"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Code"
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
                  {...register("phoneNumber", { required: "Phone number is required" })}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs px-1">{errors.phoneNumber.message}</p>}
              </div>

              {/* Website */}
              <div className="space-y-2 md:col-span-3">
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
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/address/view")}
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
                  <span>Save Address</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;
