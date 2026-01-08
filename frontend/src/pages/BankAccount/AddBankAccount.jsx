import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { CreditCard, User, Building2, Hash, Disc, Globe, FileText, Save, ArrowLeft } from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";

const AddBankAccount = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await apiClient.post("bank/bank-accounts/", {
        bank_name: data.bankName,
        account_holder_name: data.accountHolderName,
        account_number: data.accountNumber,
        account_type: data.accountType,
        ifsc_code: data.ifscCode,
        swift_code: data.swiftCode,
        micr_code: data.micrCode,
      });

      navigate("/bank-account/view");
    } catch (error) {
      alert("Failed to add bank account details. Please try again.");
    }
  };

  const accountTypeOptions = [
    { label: "Savings", value: "Savings" },
    { label: "Current", value: "Current" },
    { label: "Overdraft", value: "Overdraft" },
  ];

  return (
    <div className="p-4 w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => navigate('/bank-account/view')}
          className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="p-3 bg-black rounded-2xl shadow-lg shadow-black/10">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add Bank Account</h1>
          <p className="text-sm text-gray-800 font-medium">Link a new bank account</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-300 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Bank Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Bank Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Bank Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("bankName", { required: "Bank Name is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="e.g. HDFC Bank"
                  />
                </div>
                {errors.bankName && <p className="text-red-500 text-xs px-1">{errors.bankName.message}</p>}
              </div>

              {/* Account Holder */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Account Holder Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("accountHolderName", { required: "Holder Name is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="Full Name"
                  />
                </div>
                {errors.accountHolderName && <p className="text-red-500 text-xs px-1">{errors.accountHolderName.message}</p>}
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">Account Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("accountNumber", { required: "Account Number is required" })}
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                    placeholder="Enter account number"
                  />
                </div>
                {errors.accountNumber && <p className="text-red-500 text-xs px-1">{errors.accountNumber.message}</p>}
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Controller
                  name="accountType"
                  control={control}
                  rules={{ required: "Account Type is required" }}
                  render={({ field: { value, onChange } }) => (
                    <SearchableSelect
                      label="Account Type"
                      placeholder="Select Type"
                      options={accountTypeOptions}
                      value={value}
                      onChange={onChange}
                      error={errors.accountType}
                      icon={Disc}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Branch Codes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5" /> Branch Codes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* IFSC */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">IFSC Code</label>
                <input
                  {...register("ifscCode", { required: "IFSC Code is required" })}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                  placeholder="IFSC Code"
                />
                {errors.ifscCode && <p className="text-red-500 text-xs px-1">{errors.ifscCode.message}</p>}
              </div>

              {/* SWIFT */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">SWIFT Code</label>
                <input
                  {...register("swiftCode")}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                  placeholder="SWIFT Code"
                />
              </div>

              {/* MICR */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-widest px-1">MICR Code</label>
                <input
                  {...register("micrCode")}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none text-black font-semibold placeholder-gray-400"
                  placeholder="MICR Code"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/bank-account/view")}
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
                  <span>Save Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankAccount;