import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Package, Info, ReceiptIndianRupee } from "lucide-react";
import apiClient from "../../api/apiClient";

const AddProduct = () => {
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
      await apiClient.post("products/products/", {
        name: data.productName,
        unit_cost: data.unitCost,
      });
      navigate("/products/view");
    } catch (error) {
      alert("Failed to add product. Please try again.");
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
          <h1 className="text-2xl font-semibold text-gray-900">New Product</h1>
          <p className="text-sm text-gray-800 font-medium">Add a new product to your inventory</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-300 overflow-hidden w-full">
        <div className="p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-800 uppercase tracking-widest mb-3 px-1">
                  <Package className="w-3.5 h-3.5 mr-2 text-gray-800" />
                  Product Name
                </label>
                <input
                  {...register("productName", { required: "Product name is required" })}
                  className={`w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 text-sm focus:ring-2 transition-all outline-none font-semibold ${errors.productName ? 'ring-2 ring-red-500/20 text-red-600' : 'focus:ring-black/5 text-black'
                    }`}
                  placeholder="e.g. Wireless Mouse"
                />
                {errors.productName && <p className="mt-2 ml-1 text-xs font-semibold text-red-500">{errors.productName.message}</p>}
              </div>

              <div>
                <label className="flex items-center text-xs font-semibold text-gray-800 uppercase tracking-widest mb-3 px-1">
                  <ReceiptIndianRupee className="w-3.5 h-3.5 mr-2 text-gray-800" />
                  Unit Cost
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    {...register("unitCost", { required: "Unit cost is required", min: 0 })}
                    className={`w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 text-sm focus:ring-2 transition-all outline-none font-semibold ${errors.unitCost ? 'ring-2 ring-red-500/20 text-red-600' : 'focus:ring-black/5 text-black'
                      }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.unitCost && <p className="mt-2 ml-1 text-xs font-semibold text-red-500">{errors.unitCost.message}</p>}
              </div>
            </div>

            <div className="flex items-center bg-gray-50 p-6 rounded-3xl flex items-start space-x-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Info className="w-4 h-4 text-gray-800" />
              </div>
              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                This product will be available for selection when creating new invoices.
              </p>
            </div>

            <div className="flex items-center space-x-4 justify-between">
              <button
                type="button"
                onClick={() => navigate('/products/view')}
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
                    <span>Add Product</span>
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

export default AddProduct;