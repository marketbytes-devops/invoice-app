import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";
import loginImage from "../../assets/images/MB.jpg";

const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post("/auth/reset-password/", {
        email: email || data.email,
        new_password: data.new_password,
        confirm_new_password: data.confirm_new_password,
      });
      alert(response.data.message || "Password reset successfully");
      navigate("/login");
    } catch (error) {
      console.error("Reset password failed:", error);
      alert(error.response?.data?.error || "Failed to reset password");
    }
  };

  const newPassword = watch("new_password");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: `url(${loginImage})` }}>
        </div>

        <div className="w-full md:w-1/2 p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!email && (
              <FormField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email..."
                register={register}
                required={true}
                error={errors.email}
              />
            )}
            <FormField
              label="New Password"
              name="new_password"
              type="password"
              placeholder="Enter new password..."
              register={register}
              required={true}
              error={errors.new_password}
            />
            <FormField
              label="Confirm New Password"
              name="confirm_new_password"
              type="password"
              placeholder="Confirm new password..."
              register={register}
              required={true}
              error={
                errors.confirm_new_password || 
                (newPassword && watch("confirm_new_password") !== newPassword && { message: "Passwords do not match" })
              }
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;