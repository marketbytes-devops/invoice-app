import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";

const AddTax = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await apiClient.post("/invoices/taxes/", {
        name: data.name,
        percentage: data.percentage,
      });

      alert("Tax added successfully!");
      navigate("/tax/view");
    } catch (error) {
      alert("Failed to add tax. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Add Tax
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Tax Name"
            placeholder="Enter tax name..."
            name="name"
            register={register}
            error={errors.name}
          />
          <FormField
            label="Percentage"
            placeholder="Enter percentage (e.g., 18.00)..."
            name="percentage"
            type="number"
            step="0.01" 
            register={register}
            error={errors.percentage}
          />
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-md border border-gray-900 transition hover:bg-white hover:text-gray-900"
            >
              Add Tax
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTax;