import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Info } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faPercentage } from "@fortawesome/free-solid-svg-icons";
import apiClient from "../../api/apiClient";

const AddTax = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/invoices/taxes/", {
        name: data.name,
        percentage: data.percentage,
      });
      navigate("/tax/view");
    } catch (error) {
      alert("Failed to add tax configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 w-full mx-auto space-y-4">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-black rounded-2xl shadow-lg shadow-black/10 text-white">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Tax Config</h1>
          <p className="text-sm text-gray-800 font-medium">Define a new tax rate for your invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-300 overflow-hidden w-full">
        <div className="p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-800 uppercase tracking-widest mb-3 px-1">
                  <FontAwesomeIcon icon={faCoins} className="w-3.5 h-3.5 mr-2 text-gray-800" />
                  Tax Label
                </label>
                <input
                  {...register("name", { required: "Tax name is required" })}
                  className={`w-full bg-gray-50 border-gray-300 border rounded-2xl p-4 text-sm focus:ring-2 transition-all outline-none font-semibold ${errors.name ? 'ring-2 ring-red-500/20 text-red-600' : 'focus:ring-black/5 text-black'
                    }`}
                  placeholder="e.g. Service Tax (GST)"
                />
                {errors.name && <p className="mt-2 ml-1 text-xs font-semibold text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="flex items-center text-xs font-semibold text-gray-800 uppercase tracking-widest mb-3 px-1">
                  <FontAwesomeIcon icon={faPercentage} className="w-3.5 h-3.5 mr-2 text-gray-800" />
                  Tax Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    {...register("percentage", { required: "Percentage is required", min: 0 })}
                    className={`w-full border-gray-300 border rounded-2xl p-4 text-sm focus:ring-2 transition-all outline-none font-semibold ${errors.percentage ? 'ring-2 ring-red-500/20 text-red-600' : 'focus:ring-black/5 text-black'
                      }`}
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 font-semibold">%</div>
                </div>
                {errors.percentage && <p className="mt-2 ml-1 text-xs font-semibold text-red-500">{errors.percentage.message}</p>}
              </div>
            </div>

            <div className="flex items-center bg-gray-50 p-6 rounded-3xl flex items-start space-x-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Info className="w-4 h-4 text-gray-800" />
              </div>
              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                This tax configuration will be available during invoice creation. Ensure the percentage is accurate as per current regulations.
              </p>
            </div>

            <div className="flex items-center space-x-4 justify-between">
              <button
                type="button"
                onClick={() => navigate('/tax/view')}
                className="w-full bg-gray-200 text-black px-10 py-4 rounded-2xl font-semibold text-sm shadow-sm hover:shadow-black/20 transition-all flex items-center justify-center space-x-3"
              >
                Back to list
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white px-10 py-4 rounded-2xl font-semibold text-sm shadow-sm hover:shadow-black/20 transition-all flex items-center justify-center space-x-3"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Add Tax Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTax;