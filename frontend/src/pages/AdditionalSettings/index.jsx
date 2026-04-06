import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../api/apiClient";
import { useForm } from "react-hook-form";
import { Building2, FileText, Upload, Save, Loader2, Hash, AlertCircle } from "lucide-react";

const AdditionalSettings = () => {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [editingSeriesId, setEditingSeriesId] = useState(null);
  const [savingSeries, setSavingSeries] = useState(false);

  const logoInputRef = useRef(null);

  // Series Prefix Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch branches
      try {
        const addressRes = await apiClient.get("branch/branch_addresses/");
        setAddresses(addressRes.data);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }

      // Fetch logo
      try {
        const logoRes = await apiClient.get("invoices/settings/logo/");
        if (logoRes.data?.logo_image) {
          setLogoUrl(logoRes.data.logo_image);
        }
      } catch (err) {
        // Logo might not exist yet, which is fine
        console.log("No logo found or error fetching logo:", err.message);
      }

    } catch (error) {
      console.error("General error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Logo Handling ---
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append("logo_image", file);

      const response = await apiClient.post("invoices/settings/logo/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLogoUrl(response.data.logo_image);
      alert("Invoice logo updated successfully!");
    } catch (error) {
      console.error("Logo upload error:", error);
      alert("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // --- Series Prefix Handling ---
  const startEditingSeries = (address) => {
    setEditingSeriesId(address.id);
    setValue("series_prefix", address.series_prefix || "");
  };

  const cancelEditingSeries = () => {
    setEditingSeriesId(null);
    setValue("series_prefix", "");
  };

  const onSubmitSeries = async (data) => {
    if (!editingSeriesId) return;

    try {
      setSavingSeries(true);
      await apiClient.patch(`branch/branch_addresses/${editingSeriesId}/`, {
        series_prefix: data.series_prefix,
      });

      // Update local state
      setAddresses(prev => prev.map(addr =>
        addr.id === editingSeriesId
          ? { ...addr, series_prefix: data.series_prefix }
          : addr
      ));

      setEditingSeriesId(null);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update series prefix.");
    } finally {
      setSavingSeries(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Invoice Settings</h1>
        <p className="text-gray-500 mt-1">Manage your company branding and invoice configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Branding */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Brand Identity</h2>
                <p className="text-xs text-gray-500">Invoice Logo</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group w-full aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-900/20 transition-all flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center p-6">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">No Logo Uploaded</p>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {logoUrl ? "Change Logo" : "Upload Logo"}
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={logoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />

              <p className="text-xs text-center text-gray-400">
                This logo will appear on all your invoices.<br />Supported formats: PNG, JPG.
              </p>
            </div>

            {isUploadingLogo && (
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Invoice Series Configuration */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">Invoice Configuration</h2>
                <p className="text-xs text-gray-500 font-medium">Manage invoice series prefixes for your branches.</p>
              </div>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No branches found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="group bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl p-5 transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{address.branch_name || "Unnamed Branch"}</h3>
                          {address.series_prefix && (
                            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {address.series_prefix}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{address.branch_address}</p>
                      </div>

                      {editingSeriesId === address.id ? (
                        <form onSubmit={handleSubmit(onSubmitSeries)} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                          <div className="relative">
                            <Hash className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            <input
                              {...register("series_prefix", { required: true })}
                              className="w-32 bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-black/10 outline-none uppercase"
                              placeholder="INV"
                              autoFocus
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={savingSeries}
                            className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                          >
                            {savingSeries ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingSeries}
                            className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => startEditingSeries(address)}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all translate-x-2 group-hover:translate-x-0"
                        >
                          Edit Prefix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalSettings;