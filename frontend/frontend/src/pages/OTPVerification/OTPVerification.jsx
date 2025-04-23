import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient";
import FormField from "../../components/FormField";
import loginImage from "../../assets/images/MB.jpg";

const OTPVerification = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post("/auth/otp-verification/", {
        email: email || data.email,
        otp: data.otp,
      });
      alert(response.data.message || "OTP verified successfully");
      navigate("/reset-password", { state: { email: email || data.email } });
    } catch (error) {
      console.error("OTP verification failed:", error);
      alert(error.response?.data?.error || "Invalid or expired OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: `url(${loginImage})` }}>
        </div>

        <div className="w-full md:w-1/2 p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Verify OTP</h2>
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
              label="OTP"
              name="otp"
              type="text"
              placeholder="Enter the OTP..."
              register={register}
              required={true}
              error={errors.otp}
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;