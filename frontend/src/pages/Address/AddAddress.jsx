import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";

const AddAddress = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await apiClient.post("branch/branch_addresses/", {
        branch_name: data.branchName,
        branch_address: data.branchAddress,
        state: data.state,
        city: data.city,
        gstin: data.gstin,
        phone_code: data.phoneCode,
        phone: data.phoneNumber,
        website: data.website,
        pincode: data.pinCode, // Matches backend field name
      });

      alert("Address added successfully!");
      navigate("/address/view");
    } catch (error) {
      alert("Failed to add address. Please try again.");
      console.error("Error:", error); // Debug error
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Add Branch Address
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <FormField
            label="Branch Name"
            placeholder="Enter branch name..."
            name="branchName"
            register={register}
            error={errors.branchName}
            required
          />
          <FormField
            label="Branch Address"
            placeholder="Enter branch address..."
            name="branchAddress"
            register={register}
            error={errors.branchAddress}
            required
          />
          <FormField
            label="State"
            placeholder="Enter state..."
            name="state"
            register={register}
            error={errors.state}
            required
          />
          <FormField
            label="City"
            placeholder="Enter city..."
            name="city"
            register={register}
            error={errors.city}
            required
          />
          <FormField
            label="GSTIN"
            placeholder="Enter GSTIN..."
            name="gstin"
            register={register}
            error={errors.gstin}
            required
          />
          <FormField
            label="Phone Code"
            placeholder="Enter phone code..."
            name="phoneCode"
            register={register}
            type="text"
            error={errors.phoneCode}
            required
          />
          <FormField
            label="Pin Code"
            placeholder="Enter pin code..."
            name="pinCode"
            register={register}
            type="text" // Changed to text to preserve leading zeros
            error={errors.pinCode}
          />
          <FormField
            label="Phone Number"
            placeholder="Enter phone number..."
            name="phoneNumber"
            register={register}
            type="text"
            error={errors.phoneNumber}
            required
          />
          <FormField
            label="Website"
            placeholder="Enter website URL..."
            name="website"
            register={register}
            error={errors.website}
          />
          <div className="col-span-2 flex justify-center">
            <button
              type="submit"
              className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-md border border-gray-900 transition hover:bg-white hover:text-gray-900"
            >
              Add Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;