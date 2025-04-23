import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";

const AddBankAccount = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await apiClient.post("bank/bank-accounts/", {
        bank_name: data.bankName,
        account_number: data.accountNumber,
        account_type: data.accountType,
        ifsc_code: data.ifscCode,
        swift_code: data.swiftCode,
        micr_code: data.micrCode,
      });

      alert("Bank account details added successfully!");
      navigate("/bank-account/view");
    } catch (error) {
      alert("Failed to add bank account details. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Add Bank Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <FormField
            label="Bank Name"
            placeholder="Enter bank name..."
            name="bankName"
            register={register}
            error={errors.bankName}
          />
          <FormField
            label="Account Number"
            placeholder="Enter account number..."
            name="accountNumber"
            register={register}
            error={errors.accountNumber}
          />
          <FormField
            label="Account Type"
            placeholder="Savings, Current, etc."
            name="accountType"
            register={register}
            error={errors.accountType}
          />
          <FormField
            label="IFSC Code"
            placeholder="Enter IFSC code..."
            name="ifscCode"
            register={register}
            error={errors.ifscCode}
          />
          <FormField
            label="SWIFT Code"
            placeholder="Enter SWIFT code..."
            name="swiftCode"
            register={register}
            error={errors.swiftCode}
          />
          <FormField
            label="MICR Code"
            placeholder="Enter MICR code..."
            name="micrCode"
            register={register}
            error={errors.micrCode}
          />
          <div className="col-span-2 flex justify-center">
            <button
              type="submit"
              className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-md border border-gray-900 transition hover:bg-white hover:text-gray-900"
            >
              Add Bank Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankAccount;